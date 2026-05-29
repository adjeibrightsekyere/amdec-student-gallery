# Session-Based Authentication Setup Guide

This document explains the new session-based authentication system implemented in the Student Gallery application.

## Overview

The application has been updated from localStorage-based authentication to a secure, production-ready session-based authentication system using NextAuth.js and MongoDB.

### Key Features

✓ **Session-Based Auth** - Secure server-side sessions instead of localStorage
✓ **DB-Backed Users** - User credentials stored in MongoDB with bcrypt password hashing
✓ **Middleware Protection** - Route-level protection for authenticated pages
✓ **Role-Based Access** - Admin and Visitor roles with role-specific routes
✓ **API Protection** - All API endpoints requiring authentication and role verification

## Architecture

### Components

1. **NextAuth.js Integration** (`app/lib/auth.config.ts`)
   - Configured with Credentials provider
   - JWT-based sessions
   - MongoDB user lookup
   - Role stored in session callback

2. **Middleware** (`middleware.ts`)
   - Protects `/admin`, `/visitor`, `/upload`, and `/class` routes
   - Verifies session tokens
   - Enforces role-based access control

3. **API Routes**
   - `/api/auth/[...nextauth]` - NextAuth handler
   - `/api/auth/login` - Custom login endpoint
   - `/api/auth/register` - User registration
   - All other API routes protected with `requireAuth()`

4. **MongoDB Collections**
   - `users` - Stores user credentials and roles

## Setup Instructions

### 1. Environment Variables

Ensure `.env.local` has the required variables:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
MY_AWS_BUCKET_NAME=your-bucket

# MongoDB
MONGODB_URI=your-mongodb-connection-string

# NextAuth Secret (auto-generated, keep secure)
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
```

Generate a NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 2. Setup MongoDB Collections

Run the setup script to create the users collection with proper indexes:

```bash
npm run setup-db
```

### 3. Seed Initial Users (Development)

Create admin and visitor users for testing:

```bash
npm run seed
```

This creates:
- **Admin user:** username: `admin`, password: `admin123`
- **Visitor user:** username: `visitor`, password: `visitor123`

## Authentication Flow

### Login/Registration (Client)

```
User fills AuthForm
    ↓
POST /api/auth/register (for signup)
    ↓
NextAuth's signIn() or direct API call
    ↓
Server validates credentials
    ↓
JWT token created
    ↓
Session established
    ↓
Redirect to /admin or /visitor
```

### Protected Routes

```
ACCESS /admin, /visitor, etc.
    ↓
middleware.ts checks token
    ↓
Verify role matches required role
    ↓
Allow or reject access
```

### Protected API Routes

```
API REQUEST with Authorization header
    ↓
requireAuth() verifies session
    ↓
Check role if specified
    ↓
Execute endpoint or return 401/403
```

## Key Files

### Authentication Files

- `app/lib/auth.ts` - Server-side auth utilities
- `app/lib/auth.config.ts` - NextAuth configuration
- `app/lib/authHelpers.ts` - Password hashing utilities
- `app/lib/useAuth.ts` - Client-side auth hooks
- `app/lib/apiAuth.ts` - API route protection utilities
- `app/types/next-auth.d.ts` - TypeScript type definitions

### Configuration Files

- `middleware.ts` - Route protection middleware
- `app/components/AuthProvider.tsx` - SessionProvider wrapper
- `app/components/AuthForm.tsx` - Updated login/register form
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/register/route.ts` - Register endpoint

### Setup Scripts

- `scripts/setupDb.ts` - Create MongoDB collections
- `scripts/seedUsers.ts` - Seed development users

## Usage Examples

### Server-Side Auth (use server)

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth.config";

export async function MyAction() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  
  console.log(session.user.role); // "admin" or "visitor"
}
```

### Client-Side Auth (use client)

```typescript
"use client";

import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;
  
  return <div>Welcome {session.user.username}!</div>;
}
```

### API Route Protection

```typescript
import { requireAuth } from "@/app/lib/apiAuth";

export async function GET(request: Request) {
  // Require any authenticated user
  const auth = await requireAuth();
  if (!auth.authorized) return auth.response;
  
  // Or require specific role
  const adminAuth = await requireAuth("admin");
  if (!adminAuth.authorized) return adminAuth.response;
  
  // Use auth.user for logged-in user info
  console.log(adminAuth.user?.role);
}
```

### Middleware Protection

Routes automatically protected:
- `/admin` - Admin only
- `/visitor` - Any authenticated user
- `/upload` - Admin only
- `/class/[id]` - Any authenticated user

## Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  username: string (unique, lowercase),
  password: string (bcrypt hashed),
  role: "admin" | "visitor",
  createdAt: Date
}
```

## Security Notes

1. **NEXTAUTH_SECRET** - Must be a strong, random 32-character string in production
2. **Password Hashing** - Passwords are hashed with bcrypt (10 rounds)
3. **Session Duration** - Configured for 24 hours
4. **HTTPS in Production** - Always use HTTPS in production
5. **MongoDB Connection** - Use SSL/TLS for MongoDB connections
6. **API Authentication** - All sensitive endpoints require session verification

## Troubleshooting

### "Cannot find module 'next-auth'"

Install dependencies:
```bash
npm install next-auth bcryptjs
```

### Users collection doesn't exist

Run setup script:
```bash
npm run setup-db
```

### Session not persisting

1. Check NEXTAUTH_SECRET is set
2. Verify MongoDB connection
3. Check browser cookies are enabled

### API returns 401 Unauthorized

1. Ensure you're logged in (call useSession to check)
2. Verify the session token is being sent
3. Check MongoDB has your user record

### Role-based access denied

1. Verify your user has the correct role in MongoDB users collection
2. Check middleware.ts for route requirements
3. Verify requireAuth("admin") is called in the API route

## Migration from Old Auth

Old localStorage-based auth has been completely replaced by session-based auth:

- ✗ `localStorage.getItem("student-gallery-auth")` - Removed
- ✗ `getCurrentUser()` in client code - Use `useSession()` instead
- ✓ `/api/auth/[...nextauth]` - New NextAuth handler
- ✓ Session-based - More secure

Update any remaining localStorage references in your code.

## Next Steps

1. Run `npm run setup-db` to initialize MongoDB
2. Run `npm run seed` to create test users
3. Start dev server: `npm run dev`
4. Login with admin/admin123 or visitor/visitor123
5. Test protected routes and API endpoints
