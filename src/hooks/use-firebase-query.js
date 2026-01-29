import { useState, useEffect, useMemo } from 'react';
import { ref, onValue, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { database } from '../firebase/config';
import { normalizeContract } from '../utils/field-normalizer';

/**
 * Custom hook for Firebase realtime queries
 *
 * @param {string} path - Firebase path (e.g., 'contracts', 'vehicleInventory')
 * @param {Object} options - Query options
 * @param {string} options.orderBy - Field to order by
 * @param {any} options.equalTo - Value to filter by
 * @param {number} options.limit - Limit number of results
 * @returns {Object} { data, loading, error }
 */
export function useFirebaseQuery(path, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize options to prevent infinite loops
  const optionsKey = useMemo(
    () => JSON.stringify(options),
    [options.orderBy, options.equalTo, options.limit]
  );

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let dbRef = ref(database, path);

    // Apply query options
    const queryConstraints = [];
    if (options.orderBy) {
      queryConstraints.push(orderByChild(options.orderBy));
    }
    if (options.equalTo !== undefined) {
      queryConstraints.push(equalTo(options.equalTo));
    }
    if (options.limit) {
      queryConstraints.push(limitToLast(options.limit));
    }

    if (queryConstraints.length > 0) {
      dbRef = query(dbRef, ...queryConstraints);
    }

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const result = snapshot.val();
        if (result) {
          // Convert object to array with IDs
          let dataArray = Object.entries(result).map(([id, value]) => ({
            id,
            ...value,
          }));

          // Apply normalizer if path is contracts or exportedContracts
          if (path.includes('contracts') || path.includes('Contracts')) {
            dataArray = dataArray.map((item) => ({
              id: item.id,
              ...normalizeContract(item),
            }));
          }

          setData(dataArray);
        } else {
          setData([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firebase query error:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [path, optionsKey]);

  return { data, loading, error };
}
