import { useState, useMemo, useEffect } from 'react';
import {
  carPriceData,
  uniqueNgoaiThatColors,
  uniqueNoiThatColors,
  danh_sach_xe,
  gia_tri_dat_coc,
  getCarImageUrl,
} from '../data/calculatorData';

// Import default images
import vf3Full from '../assets/images/vf3_full.jpg';
import vf5Full from '../assets/images/vf5_full.webp';
import vf3Interior from '../assets/images/vf3_in.jpg';
import vf5Interior from '../assets/images/vf5_in.jpg';

// Color images
import whiteColor from '../assets/images/colors/white.png';
import redColor from '../assets/images/colors/red.png';
import greyColor from '../assets/images/colors/grey.png';
import yellowColor from '../assets/images/colors/yellow.png';
import blueLightColor from '../assets/images/colors/blue-light.png';
import purpleGreyColor from '../assets/images/colors/purple-grey.png';
import greenGreyColor from '../assets/images/colors/green-grey.png';

const colorImageMap = {
  'CE18': whiteColor,
  'CE1M': redColor,
  'CE1V': greyColor,
  'yellow': yellowColor,
  'blue-light': blueLightColor,
  'purple-grey': purpleGreyColor,
  'green-grey': greenGreyColor,
};

const enhancedExteriorColors = uniqueNgoaiThatColors.map(color => ({
  ...color,
  icon: color.icon || colorImageMap[color.code] || whiteColor,
}));

const enhancedInteriorColors = uniqueNoiThatColors.map(color => ({
  ...color,
  icon: color.icon || colorImageMap[color.code] || whiteColor,
}));

// Get car image from carPriceData
const getCarImage = (model, version, exteriorColor) => {
  if (!model || !version || !exteriorColor) return vf3Full;
  if (!Array.isArray(carPriceData)) return vf3Full;

  const exact = carPriceData.find(e => {
    const m = String(e.model || '').trim();
    const t = String(e.trim || '').trim();
    const ext = String(e.exterior_color || '').trim();
    return m === model && t === version && ext === exteriorColor;
  });

  if (exact?.car_image_url) {
    const imageUrl = getCarImageUrl(exact.car_image_url);
    if (imageUrl) return imageUrl;
  }

  const fallback = carPriceData.find(e => {
    const m = String(e.model || '').trim();
    const t = String(e.trim || '').trim();
    return m === model && t === version && e.car_image_url;
  });

  if (fallback?.car_image_url) {
    const imageUrl = getCarImageUrl(fallback.car_image_url);
    if (imageUrl) return imageUrl;
  }

  return model === 'VF 5' ? vf5Full : vf3Full;
};

const getInteriorImage = (model) => {
  return model === 'VF 5' ? vf5Interior : vf3Interior;
};

/**
 * Custom hook for car selection and related derived data
 */
export function useCarSelection() {
  const [carModel, setCarModel] = useState('');
  const [carVersion, setCarVersion] = useState('');
  const [exteriorColor, setExteriorColor] = useState('');
  const [interiorColor, setInteriorColor] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);

  // Derive versions from carPriceData
  const derivedVersions = useMemo(() => {
    if (!Array.isArray(carPriceData)) return [];

    const versionMap = new Map();
    carPriceData.forEach(entry => {
      const key = `${entry.model}|${entry.trim}`;
      if (!versionMap.has(key)) {
        versionMap.set(key, {
          model: entry.model,
          trim: entry.trim,
          exterior_colors: new Set(),
          interior_colors: new Set(),
        });
      }
      const v = versionMap.get(key);
      if (entry.exterior_color) v.exterior_colors.add(entry.exterior_color);
      if (entry.interior_color) v.interior_colors.add(entry.interior_color);
    });

    const versions = Array.from(versionMap.values()).map(v => ({
      model: v.model,
      trim: v.trim,
      exterior_colors: Array.from(v.exterior_colors),
      interior_colors: Array.from(v.interior_colors),
    }));

    // Sort VF 7 versions
    const vf7SortOrder = {
      'Eco': 1, 'Eco TC 2': 2, 'Eco HUD': 3, 'Eco HUD TC2': 4,
      'Plus-1 Cầu': 5, 'Plus-1 Cầu-TK': 6, 'Plus-2 Cầu': 7, 'Plus-2 Cầu-TK': 8
    };

    return versions.sort((a, b) => {
      if (a.model === 'VF 6' && b.model === 'VF 6') {
        if (a.trim === 'Plus TC 2') return 1;
        if (b.trim === 'Plus TC 2') return -1;
        return 0;
      }
      if (a.model === 'VF 7' && b.model === 'VF 7') {
        return (vf7SortOrder[a.trim] || 999) - (vf7SortOrder[b.trim] || 999);
      }
      return 0;
    });
  }, []);

  // Get unique car models
  const carModels = useMemo(() => {
    const uniqueModels = {};
    derivedVersions.forEach((xe) => {
      if (!uniqueModels[xe.model]) uniqueModels[xe.model] = xe.model;
    });
    return uniqueModels;
  }, [derivedVersions]);

  // Get available versions for selected model
  const availableVersions = useMemo(() => {
    if (!carModel) return [];
    return derivedVersions.filter(v => v.model === carModel);
  }, [carModel, derivedVersions]);

  // Get selected dong_xe code
  const selectedDongXe = useMemo(() => {
    if (!carModel) return '';
    const found = danh_sach_xe.find(x =>
      (x.ten_hien_thi || '').toString().trim().toLowerCase() === carModel.toLowerCase()
    );
    if (found?.dong_xe) return found.dong_xe;

    const norm = carModel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const found2 = danh_sach_xe.find(x => x.dong_xe === norm || x.dong_xe === norm.replace(/__+/g, '_'));
    return found2?.dong_xe || '';
  }, [carModel]);

  // Get available exterior colors
  const availableExteriorColors = useMemo(() => {
    if (!carModel || !carVersion) return [];

    let entries = carPriceData.filter(e =>
      String(e.model || '').trim() === carModel &&
      String(e.trim || '').trim() === carVersion
    );

    const targetInteriorColor = interiorColor || 'CI11';
    entries = entries.filter(e =>
      String(e.interior_color || '').trim() === targetInteriorColor
    );

    const seenCodes = new Set();
    const colorsInOrder = [];

    entries.forEach(entry => {
      const code = String(entry.exterior_color || '').trim();
      if (code && !seenCodes.has(code)) {
        seenCodes.add(code);
        const colorInfo = enhancedExteriorColors.find(c => c.code === code);
        if (colorInfo) colorsInOrder.push(colorInfo);
      }
    });

    return colorsInOrder;
  }, [carModel, carVersion, interiorColor]);

  // Get available interior colors
  const availableInteriorColors = useMemo(() => {
    if (!carModel || !carVersion) return [];
    const selectedCar = derivedVersions.find(xe => xe.model === carModel && xe.trim === carVersion);
    if (!selectedCar) return [];
    return selectedCar.interior_colors.map(code =>
      enhancedInteriorColors.find(c => c.code === code)
    ).filter(c => c);
  }, [carModel, carVersion, derivedVersions]);

  // Get car image URL
  const carImageUrl = useMemo(() => {
    return getCarImage(carModel, carVersion, exteriorColor);
  }, [carModel, carVersion, exteriorColor]);

  const interiorImageUrl = useMemo(() => {
    return getInteriorImage(carModel);
  }, [carModel]);

  // Get car price
  const getCarPrice = () => {
    if (!Array.isArray(carPriceData)) return 0;

    const exact = carPriceData.find(e => {
      const m = String(e.model || '').trim();
      const t = String(e.trim || '').trim();
      const ext = String(e.exterior_color || '').trim();
      const inti = String(e.interior_color || '').trim();
      return m === carModel && t === carVersion && ext === exteriorColor && inti === interiorColor;
    });
    if (exact?.price_vnd !== undefined) return Number(exact.price_vnd);

    const candidates = carPriceData.filter(e => {
      const m = String(e.model || '').trim();
      const t = String(e.trim || '').trim();
      return m === carModel && t === carVersion;
    });
    if (candidates.length > 0) {
      const prices = candidates.map(c => Number(c.price_vnd || 0) || 0).filter(p => p > 0);
      if (prices.length > 0) return Math.min(...prices);
    }
    return 0;
  };

  // Set default car model on mount
  useEffect(() => {
    if (Object.keys(carModels).length > 0 && !carModel) {
      setCarModel(Object.keys(carModels)[0]);
    }
  }, [carModels, carModel]);

  // Update deposit when model changes
  useEffect(() => {
    if (selectedDongXe) {
      const depositData = gia_tri_dat_coc.find(item => item.dong_xe === selectedDongXe);
      if (depositData) setDepositAmount(depositData.gia_tri);
    }
  }, [selectedDongXe]);

  // Set default version when model changes
  useEffect(() => {
    if (availableVersions.length > 0) {
      const currentVersionExists = availableVersions.some(v => v.trim === carVersion);
      if (!currentVersionExists) setCarVersion(availableVersions[0].trim);
    }
  }, [availableVersions, carVersion]);

  // Set default colors when version changes
  useEffect(() => {
    if (availableExteriorColors.length > 0) {
      const currentColorExists = availableExteriorColors.some(c => c.code === exteriorColor);
      if (!currentColorExists) setExteriorColor(availableExteriorColors[0].code);
    }
  }, [availableExteriorColors, exteriorColor]);

  useEffect(() => {
    if (availableInteriorColors.length > 0) {
      const currentColorExists = availableInteriorColors.some(c => c.code === interiorColor);
      if (!currentColorExists) setInteriorColor(availableInteriorColors[0].code);
    }
  }, [availableInteriorColors, interiorColor]);

  return {
    // State
    carModel, setCarModel,
    carVersion, setCarVersion,
    exteriorColor, setExteriorColor,
    interiorColor, setInteriorColor,
    depositAmount, setDepositAmount,
    // Derived
    carModels,
    availableVersions,
    availableExteriorColors,
    availableInteriorColors,
    selectedDongXe,
    carImageUrl,
    interiorImageUrl,
    enhancedExteriorColors,
    enhancedInteriorColors,
    // Functions
    getCarPrice,
  };
}
