import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Define types
export type Booking = {
  id: string;
  user_id: string;
  parking_slot_id: string;
  parking_slot_name: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
};

type BookingContextType = {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'user_id'>) => Promise<{ error: any }>;
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
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          parking_slots (
            slot_number,
            location
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return { data: null, error };
      }

      const formattedBookings: Booking[] = data?.map(booking => ({
        id: booking.id,
        user_id: booking.user_id,
        parking_slot_id: booking.parking_slot_id,
        parking_slot_name: `${booking.parking_slots.slot_number} - ${booking.parking_slots.location}`,
        start_time: booking.start_time,
        end_time: booking.end_time,
        total_amount: booking.total_amount,
        status: booking.status,
        created_at: booking.created_at,
      })) || [];

      setBookings(formattedBookings);
      return { data: formattedBookings, error: null };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) {
      return { error: new Error('User must be authenticated to make a booking') };
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            parking_slot_id: bookingData.parking_slot_id,
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
            total_amount: bookingData.total_amount,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        return { error };
      }

      // Refresh bookings list
      await getUserBookings();
      return { error: null };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { error };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!user) {
      return { error: new Error('User must be authenticated to cancel a booking') };
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error cancelling booking:', error);
        return { error };
      }

      // Refresh bookings list
      await getUserBookings();
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