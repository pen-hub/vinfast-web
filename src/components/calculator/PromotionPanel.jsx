import { Gift, Plus, X } from 'lucide-react';
import PromotionItem from './PromotionItem';

/**
 * Promotion selection and management panel
 */
export function PromotionPanel({
  promotions,
  selectedPromotions,
  loading,
  filterType,
  onFilterChange,
  onToggleSelection,
  onToggleActive,
  onAddNew,
  calculateDiscount,
  basePrice,
}) {
  const filteredPromotions = promotions.filter((promo) => {
    if (filterType === 'all') return true;
    return promo.type === filterType;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-400 px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Gift className="w-5 h-5" />
            <span>Chương trình ưu đãi</span>
          </h3>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'display', label: 'Chỉ hiển thị' },
            { key: 'percentage', label: 'Giảm %' },
            { key: 'fixed', label: 'Giảm cố định' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                filterType === filter.key
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Không có chương trình ưu đãi nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPromotions.map((promo) => {
              const isSelected = selectedPromotions.some((p) => p.id === promo.id);
              const selectedPromo = selectedPromotions.find((p) => p.id === promo.id);
              const isActive = selectedPromo?.isActive || false;
              const discount = calculateDiscount
                ? calculateDiscount(basePrice, [{ ...promo, isActive: true }])
                : 0;

              return (
                <PromotionItem
                  key={promo.id}
                  promotion={promo}
                  isSelected={isSelected}
                  isActive={isActive}
                  discount={discount}
                  onToggle={() => onToggleSelection(promo.id)}
                  onActivate={() => onToggleActive(promo.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Count */}
      {selectedPromotions.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <p className="text-sm text-gray-600">
            Đã chọn:{' '}
            <span className="font-semibold text-purple-600">
              {selectedPromotions.length} ưu đãi
            </span>
            {' | '}
            Đang áp dụng:{' '}
            <span className="font-semibold text-green-600">
              {selectedPromotions.filter((p) => p.isActive).length}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

export default PromotionPanel;
