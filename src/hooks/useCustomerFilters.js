import { useState, useEffect } from 'react';

export function useCustomerFilters(customers) {
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');

  useEffect(() => {
    const customersByType = customerTypeFilter
      ? customers.filter((customer) => (customer.khachHangLa || '').toLowerCase() === customerTypeFilter.toLowerCase())
      : customers;

    if (!searchText.trim()) {
      setFilteredCustomers(customersByType);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = customersByType.filter((customer) => {
      return Object.values(customer).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return false;
        return String(val).toLowerCase().includes(searchLower);
      });
    });

    setFilteredCustomers(filtered);
  }, [searchText, customers, customerTypeFilter]);

  return {
    filteredCustomers,
    searchText,
    setSearchText,
    customerTypeFilter,
    setCustomerTypeFilter,
  };
}
