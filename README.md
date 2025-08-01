# Advanced Parking Booking System

A modern parking booking application built with React, TypeScript, and Supabase for user authentication and data management.

## Features

- 🔐 **User Authentication**: Secure user registration and login with Supabase Auth
- 🚗 **Parking Slot Booking**: Book available parking slots with real-time availability
- 📱 **Responsive Design**: Modern UI built with Tailwind CSS
- 🔒 **Protected Routes**: Only authenticated users can book parking slots
- 📊 **Booking Management**: View, manage, and cancel your bookings
- 💳 **Payment Integration**: Ready for payment processing integration

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Authentication & Database**: Supabase
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd advanced-parking-booking
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up the Database**:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the SQL script from `supabase-setup.sql` to create the necessary tables and sample data

3. **Configure Environment Variables**:
   - Copy `env.example` to `.env.local`
   - Update the values with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

### Tables

1. **profiles**: User profile information
   - `id` (UUID, Primary Key)
   - `email` (TEXT)
   - `full_name` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **parking_locations**: Available parking locations
   - `id` (UUID, Primary Key)
   - `name` (TEXT)
   - `address` (TEXT)
   - `image` (TEXT)
   - `hourly_rate` (DECIMAL)
   - `amenities` (TEXT[])
   - `total_slots` (INTEGER)
   - `available_slots` (INTEGER)

3. **parking_slots**: Individual parking slots
   - `id` (UUID, Primary Key)
   - `location_id` (UUID, Foreign Key)
   - `slot_number` (TEXT)
   - `location` (TEXT)
   - `hourly_rate` (DECIMAL)
   - `is_available` (BOOLEAN)

4. **bookings**: User bookings
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key)
   - `parking_slot_id` (UUID, Foreign Key)
   - `start_time` (TIMESTAMP)
   - `end_time` (TIMESTAMP)
   - `total_amount` (DECIMAL)
   - `status` (TEXT: 'pending', 'confirmed', 'cancelled', 'completed')

## Authentication Flow

1. **Registration**: Users can create accounts with email and password
2. **Login**: Users can sign in with their credentials
3. **Session Management**: Automatic session persistence and renewal
4. **Protected Routes**: Only authenticated users can access booking features

## Booking Flow

1. **Authentication Required**: Users must be logged in to book slots
2. **Location Selection**: Browse available parking locations
3. **Slot Selection**: Choose from available parking slots
4. **Time Selection**: Pick start and end times
5. **Confirmation**: Review and confirm booking details
6. **Booking Management**: View and manage existing bookings

## Row Level Security (RLS)

The application uses Supabase's Row Level Security to ensure data privacy:

- Users can only view and modify their own bookings
- Parking locations and slots are publicly readable
- Profile data is private to each user

## API Endpoints

The application uses Supabase's auto-generated REST API:

- `GET /profiles`: Get user profile (filtered by user)
- `POST /profiles`: Create user profile
- `GET /parking_locations`: Get all parking locations
- `GET /parking_slots`: Get parking slots (filtered by location)
- `GET /bookings`: Get user bookings (filtered by user)
- `POST /bookings`: Create new booking
- `PUT /bookings`: Update booking status

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── BookingModal.tsx
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   ├── BookingContext.tsx
│   └── PaymentContext.tsx
├── lib/               # Library configurations
│   └── supabase.ts
├── pages/             # Page components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── FindParkingPage.tsx
│   └── MyBookingsPage.tsx
├── services/          # API services
│   ├── parkingService.ts
│   └── mockData.ts
└── routes.tsx         # Application routes
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 