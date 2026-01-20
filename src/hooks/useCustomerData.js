import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';
import { toast } from 'react-toastify';

export function useCustomerData() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // User permissions
  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userDepartment, setUserDepartment] = useState("");
  const [actualEmployeeName, setActualEmployeeName] = useState("");
  const [employeesMap, setEmployeesMap] = useState({});
  const [teamEmployeeNames, setTeamEmployeeNames] = useState([]);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  // Load user info from localStorage
  useEffect(() => {
    const usernameValue = localStorage.getItem("username") || "";
    const userEmailValue = localStorage.getItem("userEmail") || "";
    const userRoleValue = localStorage.getItem("userRole") || "user";
    const userDepartmentValue = localStorage.getItem("userDepartment") || "";

    setUsername(usernameValue);
    setUserEmail(userEmailValue);
    setUserRole(userRoleValue);
    setUserDepartment(userDepartmentValue);
  }, []);

  // Load employees data
  useEffect(() => {
    const loadEmployeesData = async () => {
      setEmployeesLoaded(false);

      if (!userEmail && !userRole) {
        setEmployeesLoaded(true);
        return;
      }

      try {
        const employeesRef = ref(database, "employees");
        const snapshot = await get(employeesRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const employeesMapping = {};
        const teamNames = [];
        let foundEmployeeName = "";

        if (userEmail) {
          const userEntry = Object.entries(data).find(([key, employee]) => {
            const employeeEmail = (employee && (employee.mail || employee.Mail || employee.email || "")).toString().toLowerCase();
            return employeeEmail === userEmail.toLowerCase();
          });

          if (userEntry) {
            const [userId, employeeData] = userEntry;
            foundEmployeeName = employeeData.TVBH || employeeData.user || employeeData.username || employeeData.name || "";
            setActualEmployeeName(foundEmployeeName);
          }
        }

        Object.entries(data).forEach(([key, employee]) => {
          const employeeName = employee.TVBH || employee.user || employee.username || employee.name || "";
          const employeeDept = employee.phongBan || employee["Phòng Ban"] || employee.department || employee["Bộ phận"] || "";

          if (employeeName) {
            employeesMapping[employeeName] = employeeDept;

            if (userRole === "leader" && userDepartment && employeeDept === userDepartment) {
              teamNames.push(employeeName);
            }
          }
        });

        setEmployeesMap(employeesMapping);

        if (userRole === "leader") {
          if (foundEmployeeName && !teamNames.includes(foundEmployeeName)) {
            teamNames.push(foundEmployeeName);
          }
          setTeamEmployeeNames(teamNames);
        } else if (userRole === "admin") {
          setTeamEmployeeNames(Object.keys(employeesMapping));
        }

        setEmployeesLoaded(true);
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu nhân viên: " + err.message);
        setTeamEmployeeNames([]);
        setEmployeesLoaded(true);
      }
    };

    loadEmployeesData();
  }, [userRole, userDepartment, userEmail]);

  // Load employees for dropdown
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeesRef = ref(database, 'employees');
        const snapshot = await get(employeesRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const employeesList = Object.values(data)
            .map((emp) => ({
              id: emp.id || '',
              TVBH: emp.TVBH || emp['TVBH'] || '',
              email: emp.mail || emp.Mail || emp.email || '',
            }))
            .filter((emp) => emp.TVBH)
            .sort((a, b) => a.TVBH.localeCompare(b.TVBH));

          setEmployees(employeesList);
        }
      } catch (err) {
        console.error('Error loading employees:', err);
      }
    };

    loadEmployees();
  }, []);

  // Load contracts
  useEffect(() => {
    const loadContracts = async () => {
      try {
        const contractsRef = ref(database, 'contracts');
        const snapshot = await get(contractsRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const contractsList = Object.entries(data || {}).map(([key, contract]) => ({
          firebaseKey: key,
          id: contract.id || key,
          customerName: contract.customerName || contract["Tên KH"] || '',
          phone: contract.phone || contract["Số Điện Thoại"] || '',
          address: contract.address || contract["Địa chỉ"] || '',
          showroom: contract.showroom || '',
          dongXe: contract.dongXe || contract.model || '',
          phienBan: contract.phienBan || contract.variant || '',
          ngoaiThat: contract.ngoaiThat || contract.exterior || '',
          thanhToan: contract.thanhToan || contract.payment || '',
          tvbh: contract.tvbh || contract.TVBH || '',
          createdAt: contract.createdDate || contract.createdAt || '',
          taxCode: contract.taxCode || contract.MSDN || contract.taxCodeOrg || contract.companyTaxCode || '',
          taxCodeOrg: contract.taxCodeOrg || '',
          representative: contract.representative || contract.daiDien || contract.companyRepresentative || '',
          position: contract.position || contract.chucVu || contract.companyPosition || '',
          khachHangLa: contract.khachHangLa || '',
        }));

        setContracts(contractsList);
      } catch (err) {
        console.error('Error loading contracts:', err);
      }
    };

    loadContracts();
  }, []);

  // Load all customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersRef = ref(database, 'customers');
        const snapshot = await get(customersRef);
        const data = snapshot.exists() ? snapshot.val() : {};

        const customersList = Object.entries(data || {}).map(([key, customer], index) => ({
          firebaseKey: key,
          stt: customer.stt || index + 1,
          ...customer,
        }));

        customersList.sort((a, b) => (a.stt || 0) - (b.stt || 0));
        setAllCustomers(customersList);
      } catch (err) {
        console.error('Error loading customers:', err);
        toast.error('Lỗi khi tải dữ liệu khách hàng');
        setAllCustomers([]);
      }
    };

    loadCustomers();
  }, []);

  // Apply permission filter
  useEffect(() => {
    if (allCustomers.length === 0) {
      if (userRole === "admin") {
        setCustomers([]);
        setLoading(false);
        return;
      }
      if (employeesLoaded) {
        setCustomers([]);
        setLoading(false);
        return;
      }
      return;
    }

    let filtered = [];

    if (userRole === "user") {
      if (!employeesLoaded) {
        filtered = [];
      } else if (actualEmployeeName) {
        filtered = allCustomers.filter((customer) => {
          const customerTVBH = customer.tvbh || "";
          return customerTVBH === actualEmployeeName ||
            customerTVBH.toLowerCase() === actualEmployeeName.toLowerCase();
        });
      } else {
        filtered = [];
      }
      if (employeesLoaded) {
        setLoading(false);
      }
    } else if (userRole === "leader") {
      if (!employeesLoaded) {
        filtered = [];
      } else {
        if (userDepartment && teamEmployeeNames.length > 0) {
          filtered = allCustomers.filter((customer) => {
            const customerTVBH = customer.tvbh || "";
            return teamEmployeeNames.includes(customerTVBH);
          });
        } else {
          filtered = [];
        }
        setLoading(false);
      }
    } else if (userRole === "admin") {
      filtered = allCustomers;
      setLoading(false);
    }

    setCustomers(filtered);
  }, [allCustomers, userRole, actualEmployeeName, userDepartment, teamEmployeeNames, employeesLoaded]);

  const reloadCustomers = async () => {
    const customersRef = ref(database, 'customers');
    const snapshot = await get(customersRef);
    const data = snapshot.exists() ? snapshot.val() : {};
    const customersList = Object.entries(data || {}).map(([key, customer], index) => ({
      firebaseKey: key,
      stt: customer.stt || index + 1,
      ...customer,
    }));
    customersList.sort((a, b) => (a.stt || 0) - (b.stt || 0));
    setAllCustomers(customersList);
  };

  return {
    customers,
    allCustomers,
    contracts,
    employees,
    loading,
    userRole,
    username,
    userEmail,
    reloadCustomers,
  };
}
