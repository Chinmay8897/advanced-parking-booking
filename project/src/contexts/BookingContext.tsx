import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Define types
export type Booking = {
  id: string;
  user_id: string;
  parking_spot_id: string;
  parking_spot_name: string;
  date: string;
  from_time: string;
  to_time: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  price: number;
};

type BookingContextType = {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'created_at'>) => Promise<{ error: any }>;
  cancelBooking: (bookingId: string) => Promise<{ error: any }>;
  getUserBookings: () => Promise<{ data: Booking[] | null; error: any }>;
  loading: boolean;
};

// Create context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Create provider component
export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch user's bookings when user changes
  useEffect(() => {
    if (user) {
      getUserBookings();
    } else {
      setBookings([]);
      setLoading(false);
    }
  }, [user]);

  const getUserBookings = async () => {
    if (!user) return { data: null, error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      setBookings(prev => [data, ...prev]);
      return { error: null };
    } catch (error) {
      console.error('Error adding booking:', error);
      return { error };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      return { error: null };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { error };
    }
  };

  const value = {
    bookings,
    addBooking,
    cancelBooking,
    getUserBookings,
    loading,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

// Custom hook to use booking context
export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}; 