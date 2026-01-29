const {onValueCreated, onValueUpdated} = require("firebase-functions/v2/database");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getDatabase} = require("firebase-admin/database");
const {getAuth} = require("firebase-admin/auth");
const {defineString} = require("firebase-functions/params");
const {google} = require("googleapis");

initializeApp();

// Define params
const sheetsId = defineString("SHEETS_ID", {
  description: "Google Sheets ID for syncing contracts",
  default: "",
});

// Google Sheets configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Retry helper with exponential backoff for API calls
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @return {Promise} Result of the function call
 */
async function retryWithBackoff(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimitError = error.code === 429 ||
        error.message?.includes("rate limit") ||
        error.message?.includes("quota");

      if (isRateLimitError && i < maxRetries - 1) {
        const delayMs = Math.pow(2, i) * 2000; // 2s, 4s, 8s, 16s, 32s
        console.log(`Rate limit hit, retrying in ${delayMs}ms (attempt ${i + 1}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw error;
    }
  }
}

/**
 * Get authenticated Google Sheets client
 * @return {Object} Google Sheets API client
 */
async function getGoogleSheetsClient() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT || "{}";
  const serviceAccount = JSON.parse(serviceAccountJson);

  if (!serviceAccount.client_email) {
    throw new Error("Google Service Account not configured");
  }

  const auth = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    SCOPES,
  );

  return google.sheets({version: "v4", auth});
}

/**
 * Format contract data for Google Sheets row
 * @param {Object} contract - The contract data object
 * @param {string} contractId - The contract ID
 * @return {Array} Array of values for Google Sheets row
 */
function formatContractRow(contract, contractId) {
  return [
    contract.stt || "",
    contract.ngayXhd || "",
    contract.tvbh || "",
    contract.tenKh || contract.customerName || "",
    contract.soDienThoai || contract.phone || "",
    contract.email || "",
    contract.diaChi || contract.address || "",
    contract.cccd || "",
    contract.dongXe || contract.model || "",
    contract.phienBan || contract.variant || "",
    contract.ngoaiThat || contract.exterior || "",
    contract.noiThat || contract.interior || "",
    contract.giaNiemYet || "",
    contract.giaGiam || "",
    contract.giaHopDong || contract.contractPrice || "",
    contract.soTienCoc || contract.deposit || "",
    contract.tinhTrang || contract.status || "",
    contract.nganHang || contract.bank || "",
    contract.soTienVay || "",
    contract.soTienPhaiThu || "",
    contract.quaTang || "",
    contract.quaTangKhac || "",
    contractId,
    new Date().toISOString(),
  ];
}

/**
 * Sync new exported contract to Google Sheets
 * Triggered when a new contract is added to /exportedContracts
 */
exports.onContractExported = onValueCreated(
  {
    ref: "/exportedContracts/{contractId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const contractId = event.params.contractId;
    const contract = event.data.val();

    console.log(`New contract exported: ${contractId}`);

    try {
      const sheetId = sheetsId.value();

      if (!sheetId) {
        console.log("Google Sheets ID not configured, skipping sync");
        return null;
      }

      const sheets = await getGoogleSheetsClient();
      const row = formatContractRow(contract, contractId);

      const response = await retryWithBackoff(async () => {
        return await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: "HopDongDaXuat!A:X",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [row],
          },
        });
      });

      // Store row index for O(1) lookup later
      const updatedRange = response.data.updates?.updatedRange;
      if (updatedRange) {
        // Extract row number from range like "HopDongDaXuat!A123:X123"
        const rowMatch = updatedRange.match(/!A(\d+)/);
        if (rowMatch) {
          const rowIndex = parseInt(rowMatch[1], 10);
          const db = getDatabase();
          await db.ref(`sheetRowIndex/${contractId}`).set(rowIndex);
        }
      }

      console.log(`Contract ${contractId} synced to Google Sheets`);
      return {success: true, contractId};
    } catch (error) {
      console.error("Error syncing to Google Sheets:", error);
      return {success: false, error: error.message};
    }
  },
);

/**
 * Update Google Sheets when contract is updated
 */
exports.onContractUpdated = onValueUpdated(
  {
    ref: "/exportedContracts/{contractId}",
    region: "asia-southeast1",
  },
  async (event) => {
    const contractId = event.params.contractId;
    const contract = event.data.after.val();
    const previousContract = event.data.before.val();

    // Log status changes
    if (contract.tinhTrang !== previousContract.tinhTrang) {
      console.log(
        `Contract ${contractId} status changed: ` +
          `${previousContract.tinhTrang} -> ${contract.tinhTrang}`,
      );
    }

    try {
      const sheetId = sheetsId.value();

      if (!sheetId) {
        return null;
      }

      const sheets = await getGoogleSheetsClient();
      const db = getDatabase();

      // Check stored row index first
      const storedRowSnapshot = await db.ref(`sheetRowIndex/${contractId}`).once("value");
      let rowIndex = storedRowSnapshot.exists() ? storedRowSnapshot.val() : -1;

      // Fallback to search only if no stored index
      if (rowIndex < 1) {
        const response = await retryWithBackoff(async () => {
          return await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: "HopDongDaXuat!W:W", // Column W contains contractId
          });
        });

        const rows = response.data.values || [];
        for (let i = 0; i < rows.length; i++) {
          if (rows[i][0] === contractId) {
            rowIndex = i + 1; // Sheets is 1-indexed
            // Store for future
            await db.ref(`sheetRowIndex/${contractId}`).set(rowIndex);
            break;
          }
        }
      }

      if (rowIndex > 0) {
        const row = formatContractRow(contract, contractId);
        await retryWithBackoff(async () => {
          return await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `HopDongDaXuat!A${rowIndex}:X${rowIndex}`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [row],
            },
          });
        });
        console.log(`Contract ${contractId} updated in Google Sheets`);
      }

      return {success: true};
    } catch (error) {
      console.error("Error updating Google Sheets:", error);
      return {success: false, error: error.message};
    }
  },
);

/**
 * Scheduled daily backup summary
 * Runs at 2 AM Vietnam time
 */
exports.dailySummary = onSchedule(
  {
    schedule: "0 2 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1",
  },
  async () => {
    console.log("Running daily summary...");

    try {
      const db = getDatabase();

      // Get today's date
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // Check if summary already exists (idempotency check)
      const summaryRef = db.ref(`/dailySummaries/${todayStr}`);
      const existingSnapshot = await summaryRef.once("value");

      if (existingSnapshot.exists()) {
        console.log(`Summary ${todayStr} already exists, skipping generation`);
        return {
          success: true,
          skipped: true,
          message: "Summary already exists",
        };
      }

      // Get today's exported contracts
      const snapshot = await db.ref("/exportedContracts").once("value");
      const contracts = snapshot.val() || {};

      let todayCount = 0;
      let totalValue = 0;

      Object.values(contracts).forEach((contract) => {
        if (contract.ngayXhd && contract.ngayXhd.startsWith(todayStr)) {
          todayCount++;
          const price = parseInt(
            String(contract.giaHopDong || "0").replace(/\D/g, ""),
          );
          totalValue += price;
        }
      });

      console.log(
        `Daily summary: ${todayCount} contracts, ` +
          `total value: ${totalValue.toLocaleString()} VND`,
      );

      // Save summary to database
      await summaryRef.set({
        date: todayStr,
        contractCount: todayCount,
        totalValue: totalValue,
        generatedAt: new Date().toISOString(),
      });

      return {success: true, todayCount, totalValue};
    } catch (error) {
      console.error("Error generating daily summary:", error);
      return {success: false, error: error.message};
    }
  },
);

/**
 * HTTP endpoint to manually trigger sync
 * Usage: GET /syncToSheets?contractId=xxx
 * Requires: Authorization header with Bearer token
 */
exports.syncToSheets = onRequest(
  {
    region: "asia-southeast1",
    cors: true,
  },
  async (req, res) => {
    // Verify Firebase ID token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      console.warn("syncToSheets: Missing authorization header");
      res.status(401).json({error: "Missing authorization header"});
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      await getAuth().verifyIdToken(idToken);
    } catch (authError) {
      console.warn("syncToSheets: Invalid or expired token", authError.message);
      res.status(401).json({error: "Invalid or expired token"});
      return;
    }

    const contractId = req.query.contractId;

    if (!contractId) {
      res.status(400).json({error: "contractId is required"});
      return;
    }

    try {
      const db = getDatabase();
      const snapshot = await db
        .ref(`/exportedContracts/${contractId}`)
        .once("value");

      if (!snapshot.exists()) {
        res.status(404).json({error: "Contract not found"});
        return;
      }

      const contract = snapshot.val();
      const sheetId = sheetsId.value();

      if (!sheetId) {
        res.status(500).json({error: "Google Sheets not configured"});
        return;
      }

      const sheets = await getGoogleSheetsClient();
      const row = formatContractRow(contract, contractId);

      await retryWithBackoff(async () => {
        return await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: "HopDongDaXuat!A:X",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [row],
          },
        });
      });

      res.json({success: true, message: "Contract synced to Google Sheets"});
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({error: error.message});
    }
  },
);
