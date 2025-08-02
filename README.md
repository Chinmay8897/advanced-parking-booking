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

1. **Create a Supabase Project**

2. **Set up the Database**:

3. **Configure Environment Variables**:

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`


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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.