-- Enable Row Level Security
-- Note: JWT secret is automatically managed by Supabase

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parking_locations table
CREATE TABLE IF NOT EXISTS parking_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  image TEXT,
  hourly_rate DECIMAL(10,2) NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  total_slots INTEGER NOT NULL DEFAULT 0,
  available_slots INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parking_slots table
CREATE TABLE IF NOT EXISTS parking_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_id UUID REFERENCES parking_locations(id) ON DELETE CASCADE,
  slot_number TEXT NOT NULL,
  location TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parking_slot_id UUID REFERENCES parking_slots(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for parking_locations (public read access)
CREATE POLICY "Anyone can view parking locations" ON parking_locations
  FOR SELECT USING (true);

-- Create RLS policies for parking_slots (public read access)
CREATE POLICY "Anyone can view parking slots" ON parking_slots
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update parking slots" ON parking_slots
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample parking locations
INSERT INTO parking_locations (name, address, image, hourly_rate, amenities, total_slots, available_slots) VALUES
(
  'Central Mall Parking',
  '456 Shopping Ave, Central',
  'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsbCUyMHBhcmtpbmd8ZW58MHwwfDB8fHww',
  75.00,
  ARRAY['Indoor', 'CCTV', '24/7'],
  8,
  8
),
(
  'Downtown Garage',
  '123 Main St, Downtown',
  'https://images.unsplash.com/photo-1597328588953-bfea27ae2fa9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG93bnRvd24lMjBnYXJhZ2UlMjBwYXJraW5nfGVufDB8MHwwfHx8MA%3D%3D',
  150.00,
  ARRAY['Covered', 'Security', 'EV Charging', 'CCTV'],
  8,
  5
),
(
  'Riverside Parking Lot',
  '789 River Rd, Eastside',
  'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  50.00,
  ARRAY['Outdoor', 'Guarded', 'Car Wash'],
  8,
  8
);

-- Insert sample parking slots
INSERT INTO parking_slots (location_id, slot_number, location, hourly_rate, is_available) 
SELECT 
  pl.id,
  slot_name,
  pl.name,
  pl.hourly_rate,
  CASE WHEN slot_name IN ('A4', 'B3', 'B4') AND pl.name = 'Downtown Garage' THEN false
       WHEN slot_name = 'A4' AND pl.name = 'Central Mall Parking' THEN false
       ELSE true
  END
FROM parking_locations pl
CROSS JOIN (
  VALUES ('A1'), ('A2'), ('A3'), ('A4'), ('B1'), ('B2'), ('B3'), ('B4')
) AS slots(slot_name);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_parking_slot_id ON bookings(parking_slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_parking_slots_location_id ON parking_slots(location_id);
CREATE INDEX IF NOT EXISTS idx_parking_slots_available ON parking_slots(is_available); 