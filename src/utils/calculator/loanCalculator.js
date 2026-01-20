/**
 * Loan calculation utilities
 * Uses annuity formula for monthly payment calculation
 */

/**
 * Calculate loan details
 * @param {Object} params - Loan parameters
 * @param {number} params.vehiclePrice - Total vehicle price
 * @param {number} params.loanRatio - Loan ratio (0-100)
 * @param {number} params.loanTerm - Loan term in months
 * @param {number} params.interestRate - Annual interest rate (%)
 * @returns {Object} Loan details
 */
export function calculateLoan({ vehiclePrice, loanRatio, loanTerm, interestRate }) {
  if (!vehiclePrice || loanRatio <= 0 || loanTerm <= 0) {
    return {
      loanAmount: 0,
      downPayment: vehiclePrice || 0,
      monthlyPayment: 0,
      totalInterest: 0,
      totalPayment: 0,
    };
  }

  const loanAmount = Math.round(vehiclePrice * (loanRatio / 100));
  const downPayment = vehiclePrice - loanAmount;
  const totalMonths = loanTerm;

  // Handle zero interest rate (no interest loan)
  if (!interestRate || interestRate <= 0) {
    const monthlyPayment = Math.round(loanAmount / totalMonths);
    return {
      loanAmount,
      downPayment,
      monthlyPayment,
      totalInterest: 0,
      totalPayment: loanAmount,
    };
  }

  // Monthly interest rate
  const monthlyRate = interestRate / 100 / 12;

  // Annuity formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment =
    loanAmount *
    ((monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1));

  const totalInterest = monthlyPayment * totalMonths - loanAmount;

  return {
    loanAmount,
    downPayment,
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(monthlyPayment * totalMonths),
  };
}

/**
 * Calculate monthly payment only
 * @param {number} loanAmount - Total loan amount
 * @param {number} months - Loan term in months
 * @param {number} annualRate - Annual interest rate (%)
 * @returns {number} Monthly payment
 */
export function calculateMonthlyPayment(loanAmount, months, annualRate) {
  if (!loanAmount || !months) return 0;

  // Handle zero interest rate
  if (!annualRate || annualRate <= 0) {
    return Math.round(loanAmount / months);
  }

  const monthlyRate = annualRate / 100 / 12;
  return Math.round(
    loanAmount *
      ((monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1))
  );
}

export default {
  calculateLoan,
  calculateMonthlyPayment,
};
