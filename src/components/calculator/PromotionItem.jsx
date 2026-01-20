import { formatCurrency } from '../../data/calculatorData';

/**
 * Single promotion item with checkbox and discount display
 */
export function PromotionItem({
  promotion,
  isSelected,
  isActive,
  discount,
  onToggle,
  onActivate,
}) {
  const getTypeBadge = (type, value) => {
    if (type === 'percentage') {
      return (
        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
          {value}%
        </span>
      );
    }
    if (type === 'fixed') {
      return (
        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
          {formatCurrency(value)}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
        Hiển thị
      </span>
    );
  };

  return (
    <div className={`flex justify-between items-center py-3 px-4 rounded-lg border transition-all ${
      isActive
        ? 'bg-green-50 border-green-200'
        : isSelected
        ? 'bg-purple-50 border-purple-200'
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      <label className="flex items-center gap-3 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{promotion.name}</span>
          <div className="flex items-center gap-2 mt-1">
            {getTypeBadge(promotion.type, promotion.value)}
          </div>
        </div>
      </label>

      {isSelected && (
        <div className="flex items-center gap-3">
          {onActivate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onActivate();
              }}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isActive ? 'Đang áp dụng' : 'Áp dụng'}
            </button>
          )}
          {discount > 0 && (
            <span className="text-red-600 font-semibold whitespace-nowrap">
              -{formatCurrency(discount)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default PromotionItem;
