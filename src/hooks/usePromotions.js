import { useState, useEffect } from 'react';
import { ref, push, set, update, remove, get } from 'firebase/database';
import { database } from '../firebase/config';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing promotions
 * @param {Array} allPromotions - List of all promotions from Firebase
 */
export function usePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [selectedPromotionIds, setSelectedPromotionIds] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [editingPromotionId, setEditingPromotionId] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState({
    name: '',
    type: 'display',
    value: 0,
    maxDiscount: 0,
    minPurchase: 0
  });
  const [deletingPromotionId, setDeletingPromotionId] = useState(null);
  const [promotionType, setPromotionType] = useState('display');
  const [filterType, setFilterType] = useState('all');
  const [selectedDongXeList, setSelectedDongXeList] = useState([]);
  const [isAddPromotionModalOpen, setIsAddPromotionModalOpen] = useState(false);
  const [newPromotionName, setNewPromotionName] = useState('');

  const userEmail = localStorage.getItem('userEmail') || '';
  const username = localStorage.getItem('username') || '';

  // Load promotions from Firebase
  const loadPromotions = async () => {
    setLoadingPromotions(true);
    try {
      let promotionsList = [];

      try {
        const promotionsRef = ref(database, 'promotions');
        const snapshot = await get(promotionsRef);

        if (snapshot.exists()) {
          promotionsList = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data,
            isHardcoded: false
          }));
        }
      } catch (error) {
        console.warn("Error loading promotions from Firebase:", error);
        setPromotions([]);
        setLoadingPromotions(false);
        return;
      }

      // Ensure all promotions have required fields
      const formattedPromotions = promotionsList.map(promotion => {
        let value = typeof promotion.value === 'number' ? promotion.value : 0;
        if (promotion.type === 'percentage' && value > 0 && value < 1) {
          value = value * 100;
        }
        return {
          id: promotion.id,
          name: promotion.name || '',
          type: promotion.type || 'display',
          value,
          maxDiscount: typeof promotion.maxDiscount === 'number' ? promotion.maxDiscount : 0,
          minPurchase: typeof promotion.minPurchase === 'number' ? promotion.minPurchase : 0,
          createdAt: promotion.createdAt || new Date().toISOString(),
          createdBy: promotion.createdBy || 'system',
          isHardcoded: !!promotion.isHardcoded
        };
      });

      setPromotions(formattedPromotions);

      // Sync selectedPromotions with new data
      setSelectedPromotions(prev => {
        if (prev.length === 0) return prev;
        return prev.map(sp => {
          const updated = formattedPromotions.find(p => p.id === sp.id);
          if (updated) {
            return { ...sp, value: updated.value, type: updated.type };
          }
          return sp;
        });
      });
    } catch (error) {
      console.error("Error loading promotions:", error);
      toast.error("Lỗi khi tải danh sách ưu đãi: " + error.message);
      setPromotions([]);
    } finally {
      setLoadingPromotions(false);
    }
  };

  // Load selected promotions from localStorage
  const loadSelectedPromotions = () => {
    try {
      const savedPromotions = localStorage.getItem('selectedPromotions');
      if (savedPromotions) {
        const parsed = JSON.parse(savedPromotions);
        const withDefaults = parsed.map(p => ({
          ...p,
          isActive: false,
          value: (p.type === 'percentage' && p.value > 0 && p.value < 1)
            ? p.value * 100
            : p.value
        }));
        setSelectedPromotions(withDefaults);
      }
    } catch (error) {
      console.error('Error loading selected promotions:', error);
    }
  };

  // Save selected promotions to localStorage
  const saveSelectedPromotions = (promos) => {
    try {
      localStorage.setItem('selectedPromotions', JSON.stringify(promos));
    } catch (error) {
      console.error('Error saving selected promotions:', error);
    }
  };

  // Calculate total discount from promotions
  const calculatePromotionDiscounts = (price, promotionsToCheck = null) => {
    const promoList = promotionsToCheck || selectedPromotions;
    if (!promoList || !promoList.length) return 0;

    const activePromotions = promotionsToCheck
      ? promoList
      : promoList.filter(p => p.isActive === true);

    if (activePromotions.length === 0) return 0;

    return activePromotions.reduce((total, promo) => {
      try {
        if (!promo || (!promotionsToCheck && promo.isActive === false)) {
          return total;
        }

        const freshPromo = promotions.find(p => p.id === promo.id);
        const type = freshPromo?.type ?? promo.type;
        const value = freshPromo?.value ?? promo.value;

        if (type === 'fixed') {
          return total + (parseFloat(value) || 0);
        } else if (type === 'percentage') {
          let percentage = parseFloat(value) || 0;
          if (percentage > 0 && percentage < 1) {
            percentage = percentage * 100;
          }
          const discount = (price * percentage) / 100;
          return total + discount;
        }
        return total;
      } catch (error) {
        console.error('Error calculating promotion discount:', error, promo);
        return total;
      }
    }, 0);
  };

  // Toggle promotion active state
  const togglePromotionActive = (promotionId) => {
    setSelectedPromotions(prev => {
      const updated = prev.map(p =>
        p.id === promotionId ? { ...p, isActive: !p.isActive } : p
      );
      saveSelectedPromotions(updated);
      return updated;
    });
  };

  // Remove a selected promotion
  const removeSelectedPromotion = (promotionId) => {
    setSelectedPromotions(prev => {
      const updated = prev.filter(p => p.id !== promotionId);
      saveSelectedPromotions(updated);
      return updated;
    });
  };

  // Add promotions to selected list
  const addToSelectedPromotions = (promotionIds) => {
    const newPromotions = promotionIds
      .filter(id => !selectedPromotions.some(p => p.id === id))
      .map(id => {
        const promo = promotions.find(p => p.id === id);
        return promo ? { ...promo, isActive: true } : null;
      })
      .filter(Boolean);

    if (newPromotions.length > 0) {
      setSelectedPromotions(prev => {
        const updated = [...prev, ...newPromotions];
        saveSelectedPromotions(updated);
        return updated;
      });
    }
    setSelectedPromotionIds([]);
    setIsAddPromotionModalOpen(false);
  };

  // Start editing a promotion
  const startEditPromotion = (promotion) => {
    setEditingPromotionId(promotion.id);
    setEditingPromotion({
      name: promotion.name || '',
      type: promotion.type || 'display',
      value: promotion.value || 0,
      maxDiscount: promotion.maxDiscount || 0,
      minPurchase: promotion.minPurchase || 0
    });
  };

  // Cancel editing
  const cancelEditPromotion = () => {
    setEditingPromotionId(null);
    setEditingPromotion({
      name: '',
      type: 'display',
      value: 0,
      maxDiscount: 0,
      minPurchase: 0
    });
  };

  // Load on mount
  useEffect(() => {
    loadPromotions();
    loadSelectedPromotions();
  }, []);

  // Save when selectedPromotions changes
  useEffect(() => {
    if (selectedPromotions.length > 0) {
      saveSelectedPromotions(selectedPromotions);
    }
  }, [selectedPromotions]);

  return {
    // State
    promotions,
    setPromotions,
    selectedPromotions,
    setSelectedPromotions,
    selectedPromotionIds,
    setSelectedPromotionIds,
    loadingPromotions,
    editingPromotionId,
    setEditingPromotionId,
    editingPromotion,
    setEditingPromotion,
    deletingPromotionId,
    setDeletingPromotionId,
    promotionType,
    setPromotionType,
    filterType,
    setFilterType,
    selectedDongXeList,
    setSelectedDongXeList,
    isAddPromotionModalOpen,
    setIsAddPromotionModalOpen,
    newPromotionName,
    setNewPromotionName,
    userEmail,
    username,
    // Functions
    loadPromotions,
    calculatePromotionDiscounts,
    togglePromotionActive,
    removeSelectedPromotion,
    addToSelectedPromotions,
    startEditPromotion,
    cancelEditPromotion,
    saveSelectedPromotions,
  };
}
