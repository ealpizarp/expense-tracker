import { useState, useEffect } from 'react';

interface DatabaseCategory {
  id: number;
  name: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data: DatabaseCategory[] = await response.json();
        const categoryNames = data.map(cat => cat.name);
        
        setCategories(categoryNames);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        // Fallback to default categories if API fails
        setCategories([
          'Groceries',
          'Transportation', 
          'Food & Dining',
          'Shopping',
          'Utilities',
          'Healthcare',
          'Entertainment',
          'Education',
          'Insurance',
          'Travel',
          'Home & Garden',
          'Personal Care',
          'Business',
          'Gifts & Donations',
          'Other'
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
