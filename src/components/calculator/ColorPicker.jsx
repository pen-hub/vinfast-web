/**
 * Color picker component for exterior and interior colors
 */
export function ColorPicker({
  exteriorColors,
  selectedExterior,
  onExteriorChange,
  interiorColors,
  selectedInterior,
  onInteriorChange,
  carImageUrl,
  interiorImageUrl,
}) {
  return (
    <div className="space-y-6">
      {/* Car Preview Images */}
      <div className="grid grid-cols-2 gap-4">
        {carImageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={carImageUrl}
              alt="Exterior view"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {interiorImageUrl && (
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={interiorImageUrl}
              alt="Interior view"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Exterior Color Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Màu ngoại thất
        </label>
        <div className="flex flex-wrap gap-2">
          {exteriorColors.map((color) => (
            <button
              key={color.code}
              onClick={() => onExteriorChange(color.code)}
              className={`relative w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${
                selectedExterior === color.code
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title={color.name}
            >
              {color.icon ? (
                <img
                  src={color.icon}
                  alt={color.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: color.hex || '#ccc' }}
                />
              )}
              {selectedExterior === color.code && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        {selectedExterior && (
          <p className="mt-2 text-sm text-gray-600">
            {exteriorColors.find(c => c.code === selectedExterior)?.name || selectedExterior}
          </p>
        )}
      </div>

      {/* Interior Color Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Màu nội thất
        </label>
        <div className="flex flex-wrap gap-2">
          {interiorColors.map((color) => (
            <button
              key={color.code}
              onClick={() => onInteriorChange(color.code)}
              className={`relative w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${
                selectedInterior === color.code
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title={color.name}
            >
              {color.icon ? (
                <img
                  src={color.icon}
                  alt={color.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: color.hex || '#333' }}
                />
              )}
              {selectedInterior === color.code && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        {selectedInterior && (
          <p className="mt-2 text-sm text-gray-600">
            {interiorColors.find(c => c.code === selectedInterior)?.name || selectedInterior}
          </p>
        )}
      </div>
    </div>
  );
}

export default ColorPicker;
