import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';

export function useContractData() {
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Load employees from Firebase
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

  // Load customers from Firebase
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const customersRef = ref(database, 'customers');
        const snapshot = await get(customersRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const customersList = Object.entries(data || {}).map(([key, customer]) => ({
            firebaseKey: key,
            ...customer,
          }));

          customersList.sort((a, b) => {
            const nameA = (a.tenKhachHang || '').toLowerCase();
            const nameB = (b.tenKhachHang || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });

          setCustomers(customersList);
        } else {
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error loading customers:', error);
        setCustomers([]);
      }
    };

    loadCustomers();
  }, []);

  return {
    employees,
    customers,
  };
}
