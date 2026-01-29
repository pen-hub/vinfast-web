import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';

/**
 * Custom hook for Firebase single document realtime listener
 *
 * @param {string} path - Firebase path to document (e.g., 'contracts/abc123')
 * @returns {Object} { data, loading, error }
 */
export function useFirebaseDocument(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const dbRef = ref(database, path);

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        setData(snapshot.val());
        setLoading(false);
      },
      (err) => {
        console.error('Firebase document error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
}
