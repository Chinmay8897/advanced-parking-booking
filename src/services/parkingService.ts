import { supabase } from '../lib/supabase';

export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  image: string;
  hourly_rate: number;
  amenities: string[];
  total_slots: number;
  available_slots: number;
}

export interface ParkingSlot {
  id: string;
  slot_number: string;
  location: string;
  hourly_rate: number;
  is_available: boolean;
}

export const parkingService = {
  // Get all parking locations
  async getParkingLocations(): Promise<{ data: ParkingLocation[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching parking locations:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching parking locations:', error);
      return { data: null, error };
    }
  },

  // Get parking slots for a specific location
  async getParkingSlots(locationId: string): Promise<{ data: ParkingSlot[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('parking_slots')
        .select('*')
        .eq('location_id', locationId)
        .order('slot_number');

      if (error) {
        console.error('Error fetching parking slots:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching parking slots:', error);
      return { data: null, error };
    }
  },

  // Check if a slot is available for a specific time period
  async checkSlotAvailability(
    slotId: string,
    startTime: string,
    endTime: string
  ): Promise<{ data: boolean | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('parking_slot_id', slotId)
        .eq('status', 'confirmed')
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

      if (error) {
        console.error('Error checking slot availability:', error);
        return { data: null, error };
      }

      // Slot is available if no overlapping bookings found
      const isAvailable = !data || data.length === 0;
      return { data: isAvailable, error: null };
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return { data: null, error };
    }
  },

  // Update slot availability
  async updateSlotAvailability(slotId: string, isAvailable: boolean): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('parking_slots')
        .update({ is_available: isAvailable })
        .eq('id', slotId);

      if (error) {
        console.error('Error updating slot availability:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating slot availability:', error);
      return { error };
    }
  },

  // Get parking location by ID
  async getParkingLocation(locationId: string): Promise<{ data: ParkingLocation | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*')
        .eq('id', locationId)
        .single();

      if (error) {
        console.error('Error fetching parking location:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching parking location:', error);
      return { data: null, error };
    }
  },
}; 