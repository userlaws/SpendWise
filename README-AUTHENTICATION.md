# SpendWise Authentication System

This document explains how the authentication system works in SpendWise and how to use it in your application.

## Overview

SpendWise uses a combined approach for authentication:

1. **Supabase Auth** - For secure email/password authentication, session management, and built-in features
2. **Custom Users Table** - For storing additional user data beyond the auth.users table

This approach allows us to leverage Supabase's secure authentication while maintaining the flexibility to store custom user data.

## How It Works

### Registration Process

When a user registers:

1. A new account is created in Supabase Auth using `supabase.auth.signUp()`
2. After successful auth registration, a new record is inserted into our custom `users` table
3. This custom record contains the user's ID from Auth (as `user_id`), along with additional profile information

### Authentication Flow

1. **Register**: `registerUser()` handles both Auth signup and custom table insertion
2. **Login**: `loginUser()` authenticates against Supabase Auth
3. **Session**: Each protected route checks for a valid session
4. **User Data**: Custom user data is fetched from our `users` table using the ID from the Auth session

## Database Schema

The application uses the following tables:

1. **users** - Custom user profiles linked to auth.users
2. **transactions** - User transactions
3. **budget_categories** - User-defined budget categories
4. **user_preferences** - User preferences (currency, theme, etc.)

See the `db/schema.sql` file for the complete database schema.

## Using the Authentication System

### Register a New User

```typescript
import { registerUser } from '@/lib/auth';

// In your registration form handler:
const result = await registerUser(email, password, username, {
  full_name: fullName,
  is_onboarded: false,
  preferences: { currency: 'USD', theme: 'light' },
});

if (result.error) {
  // Handle registration error
} else {
  // Registration successful, redirect or show success message
}
```

### Log In a User

```typescript
import { loginUser } from '@/lib/auth';

// In your login form handler:
const result = await loginUser(email, password);

if (result.error) {
  // Handle login error
} else {
  // Login successful, redirect to dashboard
}
```

### Get Current User Session

```typescript
import { getCurrentSession } from '@/lib/auth';

// Check if user is authenticated
const { session, error } = await getCurrentSession();

if (error || !session) {
  // Not authenticated, redirect to login
} else {
  // User is authenticated, proceed
}
```

### Get User Profile Data

```typescript
import { getUserData } from '@/lib/auth';

// Get user data from custom table
const { userData, error } = await getUserData(userId);

if (error) {
  // Handle error
} else {
  // Use userData
}
```

### Log Out

```typescript
import { logoutUser } from '@/lib/auth';

// Log out the user
const { error } = await logoutUser();

if (error) {
  // Handle logout error
} else {
  // Redirect to login or home page
}
```

## Row-Level Security (RLS)

The database is configured with RLS policies to ensure users can only access their own data. These policies are defined in the `db/schema.sql` file.

## Environment Configuration

Ensure your Supabase credentials are correctly set in your environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Troubleshooting

### Registration Issues

- Verify email signups are enabled in Supabase Dashboard (Authentication > Providers)
- Check for console errors during registration
- Verify RLS policies allow users to insert into the custom users table

### Login Issues

- Check if the user exists in Supabase Auth
- Verify the credentials are correct
- Check for console errors during login

### Session Issues

- Ensure session cookies are being stored correctly
- Verify the JWT token has not expired
- Check for network errors when checking session status
