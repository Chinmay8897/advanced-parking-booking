import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { parkingService } from '../services/parkingService';

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
  updated_at?: string;
};

type BookingContextType = {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'created_at' | 'user_id'>) => Promise<{ error: any }>;
  cancelBooking: (bookingId: string) => Promise<{ error: any }>;
  getUserBookings: () => Promise<{ data: Booking[] | null; error: any }>;
  updateBookingStatus: (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => Promise<{ error: any }>;
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
      // Use the provided status or default to 'pending'
      const status = bookingData.status || 'pending';
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user.id,
            parking_slot_id: bookingData.parking_slot_id,
            parking_slot_name: bookingData.parking_slot_name, // Store the slot name
            start_time: bookingData.start_time,
            end_time: bookingData.end_time,
            total_amount: bookingData.total_amount,
            status: status,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        return { error };
      }

      // If the booking is confirmed, update the slot availability
      if (status === 'confirmed' || status === 'pending') {
        try {
          // Update the slot availability in the database
          await parkingService.updateSlotAvailabilityByBooking(
            bookingData.parking_slot_id,
            bookingData.start_time,
            bookingData.end_time,
            status
          );
        } catch (slotError) {
          console.error('Error updating slot availability:', slotError);
          // Continue with the booking process even if slot update fails
        }
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
      // First get the booking details to update slot availability
      const { data: bookingData, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching booking details:', fetchError);
        return { error: fetchError };
      }

      // Update booking status to cancelled
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString() 
        })
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error cancelling booking:', error);
        return { error };
      }

      // Update slot availability
      if (bookingData) {
        await parkingService.updateSlotAvailabilityByBooking(
          bookingData.parking_slot_id,
          bookingData.start_time,
          bookingData.end_time,
          'cancelled'
        );
      }

      // Refresh bookings list
      await getUserBookings();
      return { error: null };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { error };
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    if (!user) {
      return { error: new Error('User must be authenticated to update a booking') };
    }

    try {
      // First get the booking details to update slot availability
      const { data: bookingData, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching booking details:', fetchError);
        return { error: fetchError };
      }

      // Update booking status
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating booking status:', error);
        return { error };
      }

      // Update slot availability based on new status
      if (bookingData) {
        await parkingService.updateSlotAvailabilityByBooking(
          bookingData.parking_slot_id,
          bookingData.start_time,
          bookingData.end_time,
          status
        );
      }

      // Refresh bookings list
      await getUserBookings();
      return { error: null };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { error };
    }
  };

  const value = {
    bookings,
    addBooking,
    cancelBooking,
    getUserBookings,
    updateBookingStatus,
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