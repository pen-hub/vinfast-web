import { Search } from 'lucide-react';

export function CustomerFilters({ searchText, setSearchText, customerTypeFilter, setCustomerTypeFilter }) {
  return (
    <>
      <div className="mb-3 sm:mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="mb-3 sm:mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setCustomerTypeFilter('')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
            customerTypeFilter === ''
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setCustomerTypeFilter('cá nhân')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
            customerTypeFilter === 'cá nhân'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Cá nhân
        </button>
        <button
          onClick={() => setCustomerTypeFilter('công ty')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${
            customerTypeFilter === 'công ty'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Công ty
        </button>
      </div>
    </>
  );
}
