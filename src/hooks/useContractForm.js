import { useState, useEffect, useMemo, useRef } from 'react';
import { carPriceData, uniqueNgoaiThatColors, uniqueNoiThatColors } from '../data/calculatorData';
import { getAllBranches, getBranchByShowroomName } from '../data/branchData';
import { generateVSO } from '../utils/vsoGenerator';
import { loadPromotionsFromFirebase, defaultPromotions } from '../data/promotionsData';

export const normalizeDateInputValue = (value) => {
  if (!value) return '';
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  const str = String(value).trim();
  if (!str) return '';

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year) {
        const dd = day.padStart(2, '0');
        const mm = month.padStart(2, '0');
        const yyyy = year.length === 2 ? `20${year}` : year.padStart(4, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    }
  }

  return str;
};

export function useContractForm(contractData, mode) {
  const branches = getAllBranches();
  const isEditMode = mode === 'edit';

  const [contract, setContract] = useState({
    id: null,
    createdAt: new Date().toISOString().split("T")[0],
    tvbh: "",
    showroom: "",
    vso: "",
    customerName: "",
    phone: "",
    email: "",
    address: "",
    cccd: "",
    issueDate: "",
    issuePlace: "",
    model: "",
    variant: "",
    exterior: "",
    interior: "",
    contractPrice: "",
    deposit: "",
    tienDoiUng: "",
    payment: "",
    loanAmount: "",
    bank: "",
    uuDai: [],
    quaTang: "",
    quaTangKhac: "",
    soTienVay: "",
    soTienPhaiThu: "",
    status: "mới",
    khachHangLa: '',
    msdn: '',
    daiDien: '',
    chucVu: '',
    giayUyQuyen: '',
    giayUyQuyenNgay: '',
  });

  const [allPromotions, setAllPromotions] = useState([]);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [selectedPromotionIds, setSelectedPromotionIds] = useState(new Set());
  const [isUuDaiDropdownOpen, setIsUuDaiDropdownOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionSearch, setPromotionSearch] = useState('');
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const [selectedCustomerKey, setSelectedCustomerKey] = useState('');

  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  // Load promotions from Firebase
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        let promotionsList = await loadPromotionsFromFirebase();
        if (!promotionsList || promotionsList.length === 0) {
          promotionsList = defaultPromotions;
        }

        setAllPromotions(promotionsList);

        if (contract.uuDai && contract.uuDai.length > 0) {
          const selected = [];
          contract.uuDai.forEach(promoName => {
            const found = promotionsList.find(p => p.name === promoName);
            if (found) {
              selected.push(found);
            }
          });
          setSelectedPromotions(selected);
        } else {
          setSelectedPromotions([]);
        }
      } catch (err) {
        console.error('Error loading promotions:', err);
        setAllPromotions(defaultPromotions);
        setSelectedPromotions([]);
      }
    };

    if (allPromotions.length === 0) {
      loadPromotions();
    } else if (contract.uuDai && contract.uuDai.length > 0 && selectedPromotions.length === 0) {
      const selected = [];
      contract.uuDai.forEach(promoName => {
        const found = allPromotions.find(p => p.name === promoName);
        if (found) {
          selected.push(found);
        }
      });
      setSelectedPromotions(selected);
    }
  }, [contract.uuDai, allPromotions]);

  // Update selected promotion IDs
  useEffect(() => {
    if (selectedPromotions && selectedPromotions.length > 0) {
      const ids = new Set(selectedPromotions.map(p => p.id));
      setSelectedPromotionIds(ids);
    } else {
      setSelectedPromotionIds(new Set());
    }
  }, [selectedPromotions]);

  // Load contract data for editing
  useEffect(() => {
    if (contractData) {
      const mapExteriorColor = (colorValue) => {
        if (!colorValue) return "";
        const foundByCode = uniqueNgoaiThatColors.find(c => c.code === colorValue);
        if (foundByCode) return colorValue;
        const foundByName = uniqueNgoaiThatColors.find(
          c => c.name.toLowerCase() === colorValue.toLowerCase()
        );
        return foundByName ? foundByName.code : colorValue;
      };

      const mapInteriorColor = (colorValue) => {
        if (!colorValue) return "";
        const foundByCode = uniqueNoiThatColors.find(c => c.code === colorValue);
        if (foundByCode) return colorValue;
        const foundByName = uniqueNoiThatColors.find(
          c => c.name.toLowerCase() === colorValue.toLowerCase()
        );
        return foundByName ? foundByName.code : colorValue;
      };

      const mapShowroom = (showroomValue) => {
        if (!showroomValue) return "";
        const foundBranch = getBranchByShowroomName(showroomValue);
        if (foundBranch) {
          return foundBranch.name;
        }
        const exactMatch = branches.find(
          (branch) =>
            branch.shortName.toLowerCase() === showroomValue.toLowerCase() ||
            branch.name.toLowerCase() === showroomValue.toLowerCase()
        );
        return exactMatch ? exactMatch.name : showroomValue;
      };

      const parseUuDai = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
          } catch (e) {
            if (value.includes(',')) {
              return value.split(',').map(v => v.trim()).filter(Boolean);
            }
            return [value];
          }
        }
        return [];
      };

      setContract({
        id: contractData.id || null,
        createdAt: contractData.createdAt || contractData.createdDate || new Date().toISOString().split("T")[0],
        tvbh: contractData.tvbh || contractData.TVBH || "",
        showroom: mapShowroom(contractData.showroom || ""),
        vso: contractData.vso || "",
        customerName: contractData.customerName || contractData["Tên KH"] || "",
        phone: contractData.phone || "",
        email: contractData.email || "",
        address: contractData.address || "",
        cccd: contractData.cccd || "",
        issueDate: contractData.issueDate || contractData.ngayCap || "",
        issuePlace: contractData.issuePlace || contractData.noiCap || "",
        model: contractData.model || contractData.dongXe || "",
        variant: contractData.variant || contractData.phienBan || "",
        exterior: mapExteriorColor(contractData.exterior || contractData.ngoaiThat || ""),
        interior: mapInteriorColor(contractData.interior || contractData.noiThat || ""),
        contractPrice: contractData.contractPrice || contractData.giaHD || "",
        deposit: contractData.deposit || contractData.soTienCoc || "",
        tienDoiUng: contractData.tienDoiUng || contractData["Tiền đối ứng"] || contractData.convertSupportDiscount || "",
        payment: contractData.payment || contractData.thanhToan || "",
        loanAmount: contractData.loanAmount || contractData.soTienVay || contractData.tienVay || "",
        bank: contractData.bank || contractData.nganHang || "",
        uuDai: parseUuDai(contractData.uuDai || contractData["Ưu đãi"] || contractData["ưu đãi"] || ""),
        quaTang: contractData.quaTang || contractData["Quà tặng"] || contractData["quà tặng"] || "",
        quaTangKhac: contractData.quaTangKhac || contractData["Quà tặng khác"] || contractData["quà tặng khác"] || "",
        soTienVay: contractData.soTienVay || contractData["Số tiền vay"] || "",
        soTienPhaiThu: contractData.soTienPhaiThu || contractData["Số tiền phải thu"] || contractData.giamGia || contractData["Giảm giá"] || "",
        status: contractData.status || contractData.trangThai || "mới",
        khachHangLa: contractData.khachHangLa || '',
        msdn: contractData.msdn || '',
        daiDien: contractData.daiDien || '',
        chucVu: contractData.chucVu || '',
        giayUyQuyen: contractData.giayUyQuyen || '',
        giayUyQuyenNgay: contractData.giayUyQuyenNgay || '',
        congTy: contractData.congTy || '',
        congTyDiaChi: contractData.congTyDiaChi || '',
        congTyMST: contractData.congTyMST || '',
        congTySDT: contractData.congTySDT || '',
        congTyEmail: contractData.congTyEmail || '',
      });
    }
  }, [contractData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUuDaiDropdownOpen(false);
      }
    };

    if (isUuDaiDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      if (dropdownButtonRef.current) {
        const buttonRect = dropdownButtonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const estimatedDropdownHeight = 240;

        if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
          setDropdownDirection('up');
        } else {
          setDropdownDirection('down');
        }
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUuDaiDropdownOpen]);

  // Get unique car models
  const carModels = useMemo(() => {
    const uniqueModels = new Set();
    carPriceData.forEach((car) => {
      if (car.model) uniqueModels.add(car.model);
    });

    const modelOrder = ['VF 3', 'VF 5', 'VF 6', 'VF 7', 'VF 8', 'VF 9', 'Minio', 'Herio', 'Nerio', 'Limo', 'EC', 'EC Nâng Cao'];

    return Array.from(uniqueModels).sort((a, b) => {
      const indexA = modelOrder.indexOf(a);
      const indexB = modelOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, []);

  // Get available trims
  const availableTrims = useMemo(() => {
    if (!contract.model) return [];
    const trims = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.model && car.trim) {
        trims.add(car.trim);
      }
    });
    return Array.from(trims).sort();
  }, [contract.model]);

  // Get available exterior colors
  const availableExteriorColors = useMemo(() => {
    if (!contract.model || !contract.variant) return [];
    const colorCodes = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.model && car.trim === contract.variant && car.exterior_color) {
        colorCodes.add(car.exterior_color);
      }
    });
    return uniqueNgoaiThatColors.filter((color) => colorCodes.has(color.code));
  }, [contract.model, contract.variant]);

  // Get available interior colors
  const availableInteriorColors = useMemo(() => {
    if (!contract.model || !contract.variant) return [];
    const colorCodes = new Set();
    carPriceData.forEach((car) => {
      if (car.model === contract.model && car.trim === contract.variant && car.interior_color) {
        colorCodes.add(car.interior_color);
      }
    });
    return uniqueNoiThatColors.filter((color) => colorCodes.has(color.code));
  }, [contract.model, contract.variant]);

  const handleInputChange = async (field, value) => {
    if (field === 'showroom' && value) {
      const selectedBranch = branches.find(b => b.name === value);
      if (selectedBranch) {
        try {
          const newVSO = await generateVSO(selectedBranch.maDms);
          setContract((prev) => ({
            ...prev,
            showroom: value,
            vso: newVSO,
          }));
          return;
        } catch (error) {
          console.error('Error generating VSO:', error);
          setContract((prev) => ({
            ...prev,
            showroom: value,
            vso: selectedBranch.maDms,
          }));
          return;
        }
      }
    }

    setContract((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      if (field === 'model') {
        updated.variant = '';
        updated.exterior = '';
        updated.interior = '';
      }

      if (field === 'variant') {
        updated.exterior = '';
        updated.interior = '';
      }

      if (field === 'exterior') {
        updated.interior = '';
      }

      return updated;
    });
  };

  const handleCustomerSelect = (customerKey, customers) => {
    setSelectedCustomerKey(customerKey);
    const selected = customers.find((customer) => customer.firebaseKey === customerKey);

    if (!selected) return;

    const issueDate = selected.issueDate || selected.ngayCap || '';
    const formattedIssueDate = issueDate && issueDate.includes('/')
      ? (() => {
        const [day, month, year] = issueDate.split('/');
        if (day && month && year) {
          const dd = day.padStart(2, '0');
          const mm = month.padStart(2, '0');
          const yyyy = year.length === 2 ? `20${year}` : year.padStart(4, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return issueDate;
      })()
      : issueDate;

    setContract(prev => ({
      ...prev,
      customerName: selected.tenKhachHang || '',
      phone: selected.soDienThoai || '',
      email: selected.email || '',
      address: selected.diaChi || selected.address || '',
      cccd: selected.cccd || '',
      issueDate: formattedIssueDate,
      issuePlace: selected.noiCap || '',
      model: selected.dongXe || '',
      variant: selected.phienBan || '',
      exterior: selected.mauSac || selected.ngoaiThat || '',
      interior: selected.mauSacTrong || selected.noiThat || '',
      payment: selected.thanhToan || '',
      bank: selected.nganHang || '',
      loanAmount: selected.soTienVay || selected.tienVay || selected.loanAmount || '',
      tvbh: selected.tvbh || '',
      khachHangLa: selected.khachHangLa || '',
      msdn: selected.khachHangLa === 'Công ty' ? selected.msdn || '' : '',
      daiDien: selected.khachHangLa === 'Công ty' ? selected.daiDien || '' : '',
      chucVu: selected.khachHangLa === 'Công ty' ? selected.chucVu || '' : '',
      giayUyQuyen: selected.khachHangLa === 'Công ty' ? selected.giayUyQuyen || '' : '',
      giayUyQuyenNgay: selected.khachHangLa === 'Công ty' ? normalizeDateInputValue(selected.giayUyQuyenNgay || '') : '',
    }));
  };

  const handleAddPromotions = (promotions) => {
    setSelectedPromotions(promotions);
    setContract(prev => ({
      ...prev,
      uuDai: promotions.map(p => p.name)
    }));
  };

  return {
    contract,
    setContract,
    allPromotions,
    selectedPromotions,
    selectedPromotionIds,
    isUuDaiDropdownOpen,
    setIsUuDaiDropdownOpen,
    isPromotionModalOpen,
    setIsPromotionModalOpen,
    promotionSearch,
    setPromotionSearch,
    dropdownDirection,
    selectedCustomerKey,
    dropdownRef,
    dropdownButtonRef,
    carModels,
    availableTrims,
    availableExteriorColors,
    availableInteriorColors,
    handleInputChange,
    handleCustomerSelect,
    handleAddPromotions,
  };
}
