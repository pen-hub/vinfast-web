import { ChevronDown } from 'lucide-react';

/**
 * Car model and version selector component
 */
export function CarSelector({
  carModels,
  carModel,
  onModelChange,
  availableVersions,
  carVersion,
  onVersionChange,
}) {
  return (
    <div className="space-y-4">
      {/* Model Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dòng xe
        </label>
        <div className="relative">
          <select
            value={carModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Chọn dòng xe</option>
            {Object.keys(carModels).map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Version Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phiên bản
        </label>
        <div className="relative">
          <select
            value={carVersion}
            onChange={(e) => onVersionChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!carModel}
          >
            <option value="">Chọn phiên bản</option>
            {availableVersions.map((version) => (
              <option key={version.trim} value={version.trim}>
                {version.trim}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export default CarSelector;
