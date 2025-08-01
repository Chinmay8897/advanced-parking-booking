# Quick Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `parking-booking-system`
   - Database Password: Choose a strong password
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Set Up Database

1. In your Supabase dashboard, go to SQL Editor
2. Click "New query"
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to execute the script
5. This will create all necessary tables and sample data

## Step 4: Configure Environment Variables

1. In your project root, create a file called `.env.local`
2. Add the following content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials.

## Step 5: Test the Application

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Try to:
   - Register a new account
   - Log in with your credentials
   - Browse parking locations
   - Make a booking

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Make sure your `.env.local` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **"Error fetching parking locations"**
   - Make sure you ran the SQL setup script in Supabase
   - Check that the `parking_locations` table exists in your database

3. **Authentication not working**
   - Verify your Supabase URL and anon key are correct
   - Check that Row Level Security (RLS) is enabled on your tables
   - Ensure the RLS policies are created correctly

4. **Bookings not saving**
   - Check that the `bookings` table exists
   - Verify the RLS policies allow authenticated users to insert bookings

### Database Verification

To verify your database is set up correctly, run this query in Supabase SQL Editor:

```sql
SELECT 
  (SELECT COUNT(*) FROM parking_locations) as location_count,
  (SELECT COUNT(*) FROM parking_slots) as slot_count,
  (SELECT COUNT(*) FROM profiles) as profile_count;
```

You should see:
- `location_count`: 3 (sample locations)
- `slot_count`: 24 (8 slots per location)
- `profile_count`: 0 (will increase as users register)

### Reset Database (if needed)

If you need to start over, run this in Supabase SQL Editor:

```sql
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS parking_slots CASCADE;
DROP TABLE IF EXISTS parking_locations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

Then run the `supabase-setup.sql` script again.

## Next Steps

Once the basic setup is working:

1. **Customize the UI**: Modify colors, branding, and layout in `tailwind.config.js`
2. **Add more parking locations**: Insert additional locations in the database
3. **Implement payment processing**: Integrate with Stripe, Razorpay, or other payment providers
4. **Add email notifications**: Set up email templates for booking confirmations
5. **Deploy to production**: Deploy your app to Vercel, Netlify, or your preferred platform

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Supabase credentials are correct
3. Ensure all database tables and policies are created
4. Check the Supabase logs in your project dashboard
5. Open an issue in the GitHub repository with detailed error information 