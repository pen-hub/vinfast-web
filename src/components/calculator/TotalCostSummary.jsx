import { Mail, Save } from 'lucide-react';
import { formatCurrency } from '../../data/calculatorData';

/**
 * Total cost summary with action buttons
 */
export function TotalCostSummary({
  totalCost,
  loanData,
  hasLoan,
  onGenerateInvoice,
  onSaveQuote,
}) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg overflow-hidden">
      {/* Main Cost Display */}
      <div className="p-6 text-center">
        <span className="text-sm uppercase tracking-wide opacity-80">
          Tổng chi phí
        </span>
        <div className="text-4xl font-bold mt-2">
          {formatCurrency(totalCost)}
        </div>
      </div>

      {/* Loan Summary (if applicable) */}
      {hasLoan && loanData && loanData.monthlyPayment > 0 && (
        <div className="bg-white bg-opacity-10 px-6 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="opacity-80">Trả trước</div>
              <div className="font-semibold text-lg">
                {formatCurrency(loanData.downPayment)}
              </div>
            </div>
            <div className="text-center">
              <div className="opacity-80">Trả góp/tháng</div>
              <div className="font-semibold text-lg text-green-300">
                {formatCurrency(loanData.monthlyPayment)}
              </div>
            </div>
          </div>
          <div className="text-center mt-3 text-xs opacity-70">
            Tiền vay: {formatCurrency(loanData.loanAmount)} | Tổng lãi: {formatCurrency(loanData.totalInterest)}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-blue-900 bg-opacity-30 grid grid-cols-2 gap-3">
        {onGenerateInvoice && (
          <button
            onClick={onGenerateInvoice}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Gửi báo giá</span>
          </button>
        )}
        {onSaveQuote && (
          <button
            onClick={onSaveQuote}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Lưu báo giá</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default TotalCostSummary;
