import { useState, useEffect } from 'react';
import api from '../services/api';

export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(filters).toString();
        const { data } = await api.get(`/properties?${params}`);
        setProperties(data.properties);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [JSON.stringify(filters)]);

  return { properties, loading, total };
};