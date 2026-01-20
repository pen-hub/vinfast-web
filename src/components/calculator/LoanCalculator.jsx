import { formatCurrency } from '../../data/calculatorData';

/**
 * Loan calculator configuration panel
 */
export function LoanCalculator({
  loanToggle,
  onToggleChange,
  loanRatio,
  onRatioChange,
  loanTerm,
  onTermChange,
  customInterestRate,
  onInterestChange,
  loanData,
  defaultInterestRate = 8.5,
}) {
  const termOptions = [12, 24, 36, 48, 60, 72, 84];

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
      {/* Toggle Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-800">
          Tùy chọn vay ngân hàng
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={loanToggle}
            onChange={(e) => onToggleChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
        </label>
      </div>

      {loanToggle && (
        <div className="space-y-4">
          {/* Loan Ratio Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Tỷ lệ vay
              </label>
              <span className="text-lg font-bold text-blue-600">{loanRatio}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={loanRatio}
              onChange={(e) => onRatioChange(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Loan Term Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời hạn vay (tháng)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {termOptions.map((term) => (
                <button
                  key={term}
                  onClick={() => onTermChange(term)}
                  className={`py-2 text-sm rounded-lg border transition-colors ${
                    loanTerm === term
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lãi suất (%/năm)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="30"
              value={customInterestRate}
              onChange={(e) => onInterestChange(e.target.value)}
              placeholder={`Mặc định: ${defaultInterestRate}%`}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Loan Summary */}
          {loanData && (
            <div className="bg-white rounded-lg p-4 border border-blue-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tiền trả trước</span>
                <span className="font-medium">{formatCurrency(loanData.downPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tiền vay</span>
                <span className="font-medium text-blue-600">{formatCurrency(loanData.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng lãi ({loanTerm} tháng)</span>
                <span className="font-medium text-red-600">{formatCurrency(loanData.totalInterest)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-700 font-medium">Trả góp hàng tháng</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(loanData.monthlyPayment)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LoanCalculator;
