import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTimeSlots(producerId) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!producerId) return;

    const fetchTimeSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('producer_time_slots')
          .select('*')
          .eq('producer_id', producerId)
          .eq('is_active', true)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) throw error;
        setTimeSlots(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching time slots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [producerId]);

  return { timeSlots, loading, error };
}