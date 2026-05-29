# ⚡ QUICK START - Session-Based Auth Implementation

## 🎯 What Changed

Your authentication system has been completely upgraded from insecure localStorage to production-ready session-based authentication with:

✅ NextAuth.js for secure sessions
✅ MongoDB for storing users with bcrypt password hashing
✅ Middleware for route protection
✅ Role-based access control (admin/visitor)
✅ API endpoint protection
✅ Full TypeScript support

## 🚀 Get Started in 3 Steps

### Step 1: Set Up Environment
Add NEXTAUTH_SECRET to `.env.local`:

```bash
# Generate a secret
openssl rand -base64 32

# Copy output to .env.local
NEXTAUTH_SECRET=your-generated-secret-here
```

### Step 2: Initialize Database
```bash
npm run setup-db
```

### Step 3: Create Test Users
```bash
npm run seed
```

This creates:
- **Admin**: username `admin`, password `admin123`
- **Visitor**: username `visitor`, password `visitor123`

## ✅ Verify It Works

```bash
npm run dev
```

Then:
1. Visit http://localhost:3000
2. Click "Sign in"
3. Enter `admin` / `admin123`
4. Should redirect to `/admin` dashboard

## 📝 Key Changes

### Before (Insecure)
```typescript
// Old way - localStorage on client side
const user = getCurrentUser(); // reads localStorage
localStorage.setItem("student-gallery-auth", JSON.stringify(user));
```

### After (Secure)
```typescript
// New way - server-side sessions
const { data: session } = useSession();
const session = await getServerSession(authOptions); // server only
```

## 🔐 What's Secured Now

- ✅ `/admin` - Admin only
- ✅ `/visitor` - Authenticated users only
- ✅ `/class/[id]` - Authenticated users only
- ✅ `/upload` - Admin only
- ✅ `/api/students` - Requires authentication
- ✅ `/api/classes` - Requires authentication
- ✅ `/api/upload` - Admin only

## 👤 Create Custom Users

Use the signup form to create users with any role:
1. Click "Sign up" on login page
2. Enter username and password
3. Select role (Admin or Visitor)
4. Submit

Users are stored securely in MongoDB with:
- Passwords hashed with bcrypt
- Unique username enforcement
- Timestamps
- Roles

## 🔑 User Management

### MongoDB Collection Structure
```
Database: student-gallery
Collection: users
{
  username: "email-like",
  password: "bcrypted-hash",
  role: "admin" or "visitor",
  createdAt: Date
}
```

### Query Users (MongoDB Compass or similar)
```javascript
db.users.find({})
db.users.findOne({ username: "admin" })
```

### Update User Role
```javascript
db.users.updateOne(
  { username: "admin" },
  { $set: { role: "visitor" } }
)
```

## 📚 Documentation

- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Detailed setup & architecture
- **[AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md)** - What was implemented
- **[package.json](./package.json)** - New scripts: `setup-db`, `seed`

## 🧪 Test Scenarios

### Test Scenario 1: Admin Login
```
1. Login as: admin / admin123
2. Expected: redirects to /admin dashboard
3. Can upload images
4. Can access all features
```

### Test Scenario 2: Visitor Login
```
1. Login as: visitor / visitor123
2. Expected: redirects to /visitor dashboard
3. Can view classes
4. Cannot upload images
5. 403 error on /admin
```

### Test Scenario 3: Create New User (Signup)
```
1. Click "Sign up"
2. Enter username: testuser
3. Enter password: password123
4. Select role: Admin
5. Expected: user created in MongoDB and logged in
```

### Test Scenario 4: Unauthorized Access
```
1. Don't login
2. Try to visit /admin
3. Expected: redirected to login page
4. API calls return 401 Unauthorized
```

## 🎯 Environment Variables

Your `.env.local` should now have:

```env
# Existing AWS config
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
MY_AWS_BUCKET_NAME=bucket-name

# Existing MongoDB
MONGODB_URI=your-connection-string

# NEW - Authentication secret (REQUIRED)
NEXTAUTH_SECRET=your-super-secret-key
```

⚠️ **Important**: NEXTAUTH_SECRET must be:
- At least 32 characters
- Kept secret (never commit to git)
- Different in each environment

## 🔄 Common Commands

```bash
# Development
npm run dev                  # Start dev server

# Database
npm run setup-db            # Create collections
npm run seed                # Add test users

# Build
npm run build               # Production build
npm start                   # Start prod server

# Linting
npm run lint                # Run ESLint
```

## 🐛 If Something Breaks

### "Can't login"
1. Run `npm run setup-db` (create collections)
2. Run `npm run seed` (add test users)
3. Check `.env.local` has NEXTAUTH_SECRET

### "API returns 401"
1. Make sure you're logged in
2. Check session in browser DevTools
3. Verify MongoDB has users

### "Build fails"
1. Run `npm install` (ensure dependencies)
2. Delete `.next` folder: `rm -rf .next`
3. Run `npm run build` again

### "Database not connecting"
1. Verify MONGODB_URI is correct
2. Test connection: `mongosh <your-uri>`
3. Check username/password are URL encoded

## 📞 Need Help?

Refer to:
- [AUTH_SETUP.md](./AUTH_SETUP.md) - Full documentation
- [app/lib/auth.config.ts](./app/lib/auth.config.ts) - Auth configuration
- [middleware.ts](./middleware.ts) - Route protection
- [app/lib/apiAuth.ts](./app/lib/apiAuth.ts) - API protection

## ✨ Summary of Files

**Core Auth Files:**
- `app/lib/auth.ts` - Server-side auth
- `app/lib/auth.config.ts` - NextAuth setup
- `middleware.ts` - Route protection
- `app/components/AuthProvider.tsx` - Session wrapper

**API Routes:**
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/register/route.ts` - Register endpoint

**Setup:**
- `scripts/setupDb.ts` - Initialize database
- `scripts/seedUsers.ts` - Add test users

---

**Status**: ✅ All systems ready! You can now use secure session-based authentication.
