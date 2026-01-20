/**
 * Calculator Custom Hooks
 *
 * These hooks extract state management logic from CalculatorPage
 * to improve maintainability and reusability.
 */

export { useCarSelection } from './useCarSelection';
export { usePromotions } from './usePromotions';
export { usePriceCalculations } from './usePriceCalculations';
export { useLoanCalculations } from './useLoanCalculations';

/**
 * Contract Form Custom Hooks
 *
 * These hooks extract state management and submit logic from ContractFormPage
 */

export { useContractData } from './useContractData';
export { useContractForm, normalizeDateInputValue } from './useContractForm';
export { useContractSubmit } from './useContractSubmit';

/**
 * Customer Management Custom Hooks
 *
 * These hooks extract state management and data logic from QuanLyKhachHangPage
 */

export { useCustomerData } from './useCustomerData';
export { useCustomerFilters } from './useCustomerFilters';
export { useCustomerForm } from './useCustomerForm';
