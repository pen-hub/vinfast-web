/**
 * Shared print styles for all BieuMau components
 */
export function PrintStyles() {
  return (
    <style>{`
      @media print {
        @page {
          margin: 0;
          size: A4 portrait;
        }
        body * { visibility: hidden; }
        #printable-content, #printable-content * { visibility: visible; }
        #printable-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0;
          padding: 10mm 15mm 8mm 15mm;
          box-shadow: none;
          font-family: 'Times New Roman', serif !important;
        }
        .print\\:hidden { display: none !important; }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Times New Roman', serif !important;
        }
        table { page-break-inside: avoid; }
      }
    `}</style>
  );
}
