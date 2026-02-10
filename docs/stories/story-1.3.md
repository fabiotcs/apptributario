# 📋 Story 1.3 — Authentication with NextAuth.js & RBAC

**Epic:** 1 — Foundation & Core Infrastructure
**Story ID:** 1.3
**Priority:** 🔴 CRITICAL — Blocks Stories 2.x, 3.x, and all user-facing features
**Assignee:** @dev (Dex)
**Status:** 🔵 In Progress (Phase 3: Email & Password Reset)
**Estimated:** 2-3 days (solo dev) | 1.5 days (2 devs)
**Start Date:** Feb 11, 2026
**Target Completion:** Feb 13, 2026
**Dependencies:** Story 1.1 ✅ (Complete), Story 1.2 ✅ (Complete)

---

## 📝 Story Description

Set up complete authentication and authorization for **Agente Tributário** using:
- **NextAuth.js v5** for secure session management
- **JWT tokens** (stateless) for scalability
- **RBAC (Role-Based Access Control)** with 3 roles: ADMIN, CONTADOR, EMPRESARIO
- **Protected API routes** with JWT verification middleware
- **Protected frontend pages** with session checks
- **Email/password authentication** with bcrypt password hashing
- **OAuth2 preparation** (Google, GitHub) for future phases
- **Password reset flow** with email verification
- **Session/token refresh** logic for extended sessions

This story establishes the authentication layer that protects all user data and enforces role-based permissions.

**Why this matters:** Without auth, anyone can access any user's data. This is the security foundation for the entire platform.

---

## ✅ Acceptance Criteria

### 1. NextAuth.js Configuration
- [ ] NextAuth.js v5 installed in `apps/web`
- [ ] NextAuth configuration file created (`apps/web/src/lib/auth.ts`)
- [ ] JWT secret configured in `.env.local`
- [ ] Callback functions implemented (signIn, session, jwt, redirect)
- [ ] Providers configured (Credentials for email/password)

### 2. Frontend Authentication UI
- [ ] **Signup page** (`apps/web/src/app/auth/signup/page.tsx`)
  - [ ] Email field (validation)
  - [ ] Name field
  - [ ] Password field (strength indicator)
  - [ ] Confirm password field
  - [ ] Role selector (Empresário/Contador)
  - [ ] Submit button with loading state
  - [ ] Error display (duplicate email, weak password)
  - [ ] Link to login page
- [ ] **Login page** (`apps/web/src/app/auth/login/page.tsx`)
  - [ ] Email field
  - [ ] Password field
  - [ ] "Remember me" checkbox (extended session)
  - [ ] Submit button with loading state
  - [ ] Error display (invalid credentials)
  - [ ] Link to signup and forgot password pages
  - [ ] OAuth placeholder buttons (for future phases)
- [ ] **Forgot password page** (`apps/web/src/app/auth/forgot-password/page.tsx`)
  - [ ] Email field
  - [ ] Submit button
  - [ ] Confirmation message
- [ ] **Reset password page** (`apps/web/src/app/auth/reset-password/page.tsx`)
  - [ ] Password field
  - [ ] Confirm password field
  - [ ] Submit button
  - [ ] Token validation
- [ ] **Profile/Account page** (`apps/web/src/app/dashboard/account/page.tsx`)
  - [ ] Current user info display
  - [ ] Edit name/email
  - [ ] Change password form
  - [ ] Logout button
  - [ ] Delete account button (with confirmation)

### 3. Backend Authentication API
- [ ] **Authentication routes** in `apps/api/src/routes/auth.ts`
  - [ ] `POST /api/v1/auth/register` — Create new user
  - [ ] `POST /api/v1/auth/login` — Verify credentials, return JWT
  - [ ] `POST /api/v1/auth/logout` — Clear session
  - [ ] `POST /api/v1/auth/forgot-password` — Send reset email
  - [ ] `POST /api/v1/auth/reset-password` — Verify token, update password
  - [ ] `POST /api/v1/auth/refresh` — Refresh JWT token
  - [ ] `GET /api/v1/auth/session` — Get current user session
  - [ ] `POST /api/v1/auth/delete-account` — Soft delete user

### 4. Middleware & Authorization
- [ ] **JWT verification middleware** (`apps/api/src/middleware/auth.ts`)
  - [ ] Verify JWT token from Authorization header
  - [ ] Extract user info from token payload
  - [ ] Return 401 if token invalid/expired
  - [ ] Attach user to request object
- [ ] **RBAC middleware** (`apps/api/src/middleware/rbac.ts`)
  - [ ] Check user role against required roles
  - [ ] Return 403 if insufficient permissions
  - [ ] Support multiple allowed roles per endpoint
- [ ] **Password hashing** (bcrypt in AuthService)
  - [ ] Hash passwords on signup (salt rounds: 10)
  - [ ] Verify passwords on login
  - [ ] Never store plain text passwords
- [ ] **Token generation** (JWT in AuthService)
  - [ ] Generate JWT with user claims (id, email, role)
  - [ ] Token expiration: 7 days
  - [ ] Refresh token: 30 days
  - [ ] HS256 algorithm

### 5. Protected API Routes
- [ ] All authenticated routes require JWT middleware
- [ ] Admin routes require RBAC middleware with `['ADMIN']` role
- [ ] Contador routes require RBAC middleware with `['CONTADOR', 'ADMIN']` roles
- [ ] Example protected route: `GET /api/v1/companies` (requires auth)
- [ ] Example admin route: `POST /api/v1/admin/users` (requires ADMIN role)

### 6. Frontend Session Handling
- [ ] **Session check in layout** (`apps/web/src/app/layout.tsx`)
  - [ ] Check session on app load
  - [ ] Redirect to login if not authenticated
- [ ] **Protected pages/routes** (using middleware or client-side guards)
  - [ ] `/dashboard/*` — Requires authentication
  - [ ] `/admin/*` — Requires ADMIN role
  - [ ] `/auth/*` — Only accessible when not authenticated
- [ ] **useSession hook** for component-level session access
  - [ ] Get current user data
  - [ ] Check loading state
  - [ ] Handle redirects

### 7. Email Service Integration
- [ ] Email service configured (Resend)
- [ ] **Password reset email template**
  - [ ] Reset link with token
  - [ ] Token expiration (24 hours)
  - [ ] Branding/styling
- [ ] **Welcome email template** (on signup)
  - [ ] Confirmation message
  - [ ] Verify email link (optional, for future)
- [ ] Email sending tested (development: log to console)

### 8. Security Requirements
- [ ] HTTPS enforced in production
- [ ] CSRF protection (NextAuth.js handles)
- [ ] Password requirements enforced:
  - [ ] Minimum 8 characters
  - [ ] At least 1 uppercase letter
  - [ ] At least 1 lowercase letter
  - [ ] At least 1 number
  - [ ] At least 1 special character
- [ ] Rate limiting on auth endpoints (to prevent brute force)
- [ ] Session tokens stored securely (HttpOnly cookies)
- [ ] No sensitive data in localStorage
- [ ] CORS configured for API (frontend domain only)

### 9. Testing
- [ ] Unit tests for AuthService (password hashing, token generation)
- [ ] Integration tests for auth endpoints
- [ ] E2E tests for signup → login → protected page flow
- [ ] RBAC role checking tests
- [ ] Password reset flow tests
- [ ] Test coverage > 70%

### 10. Documentation & Types
- [ ] TypeScript types for User, Session, JWT payload
- [ ] API documentation (OpenAPI spec updated)
- [ ] Auth flow diagram (signup, login, password reset)
- [ ] Environment variables documented in `.env.example`
- [ ] README section on authentication

---

## 🎯 Implementation Plan (4 Phases)

### Phase 1: Backend Auth Setup (Day 1)
**Status:** [x] COMPLETE
**Deliverable:** AuthService, API endpoints, JWT middleware ✅

#### Tasks:
- [ ] Create `apps/api/src/services/AuthService.ts`
  - [ ] Password hashing (bcrypt)
  - [ ] Token generation (JWT)
  - [ ] Password reset logic
  - [ ] User validation

- [ ] Create authentication routes `apps/api/src/routes/auth.ts`
  - [ ] POST /api/v1/auth/register
  - [ ] POST /api/v1/auth/login
  - [ ] POST /api/v1/auth/logout
  - [ ] POST /api/v1/auth/refresh
  - [ ] POST /api/v1/auth/forgot-password
  - [ ] POST /api/v1/auth/reset-password
  - [ ] GET /api/v1/auth/session

- [ ] Create JWT verification middleware `apps/api/src/middleware/auth.ts`
  - [ ] Extract token from Authorization header
  - [ ] Verify and decode JWT
  - [ ] Attach user to request

- [ ] Create RBAC middleware `apps/api/src/middleware/rbac.ts`
  - [ ] Check user role
  - [ ] Support multiple allowed roles

- [ ] Add rate limiting to auth endpoints
  - [ ] Use `express-rate-limit` package
  - [ ] 5 failed attempts → 15 minute lockout
  - [ ] Per-IP limiting

**Verification:**
- [ ] AuthService unit tests pass
- [ ] All auth endpoints return correct responses
- [ ] JWT tokens verify correctly
- [ ] Invalid credentials return 401
- [ ] Invalid roles return 403

---

### Phase 2: Frontend Auth Setup (Day 1-2)
**Status:** [x] COMPLETE
**Deliverable:** NextAuth configuration, UI components, protected routes ✅

#### Tasks:
- [ ] Install NextAuth.js v5
  ```bash
  cd apps/web
  npm install next-auth
  ```

- [ ] Create NextAuth configuration `apps/web/src/lib/auth.ts`
  - [ ] Configure providers (Credentials)
  - [ ] Define JWT callback
  - [ ] Define session callback
  - [ ] Configure signIn/redirect callbacks

- [ ] Create NextAuth API route `apps/web/src/app/api/auth/[...nextauth]/route.ts`
  - [ ] Expose NextAuth handler

- [ ] Create auth components:
  - [ ] `apps/web/src/app/auth/signup/page.tsx` — Signup form
  - [ ] `apps/web/src/app/auth/login/page.tsx` — Login form
  - [ ] `apps/web/src/app/auth/forgot-password/page.tsx` — Password reset request
  - [ ] `apps/web/src/app/auth/reset-password/page.tsx` — Password reset form
  - [ ] `apps/web/src/components/auth/FormField.tsx` — Reusable form field
  - [ ] `apps/web/src/components/auth/PasswordStrength.tsx` — Password strength indicator

- [ ] Create protected page layouts:
  - [ ] `apps/web/src/app/dashboard/layout.tsx` — Require authentication
  - [ ] `apps/web/src/app/admin/layout.tsx` — Require ADMIN role

- [ ] Create session hooks:
  - [ ] `apps/web/src/hooks/useSession.ts` — Get current session
  - [ ] `apps/web/src/hooks/useRequireAuth.ts` — Guard authenticated pages

- [ ] Update root layout with session provider
  - [ ] Wrap app with `SessionProvider` from NextAuth

**Verification:**
- [ ] Signup form displays and validates
- [ ] Login form displays
- [ ] Protected pages redirect to login when not authenticated
- [ ] Session available in components after login

---

### Phase 3: Email & Password Reset (Day 2)
**Status:** 🔄 Pending
**Deliverable:** Email service, password reset flow, email templates

#### Tasks:
- [ ] Configure Resend email service
  ```bash
  npm install resend
  ```
  - [ ] Add RESEND_API_KEY to `.env.local`

- [ ] Create email service `apps/api/src/services/EmailService.ts`
  - [ ] Send password reset email
  - [ ] Send welcome email
  - [ ] Send confirmation email

- [ ] Create email templates `apps/api/src/templates/`
  - [ ] `password-reset.html` — Reset link with token
  - [ ] `welcome.html` — Welcome message
  - [ ] Base template with branding

- [ ] Generate and verify reset tokens
  - [ ] Create token on forgot-password request
  - [ ] Store token hash in database (PasswordResetToken table? or in User model)
  - [ ] Verify token on reset-password request
  - [ ] Expire token after 24 hours

- [ ] Frontend password reset flow
  - [ ] Handle reset link from email
  - [ ] Validate token
  - [ ] Allow password change
  - [ ] Show success message

**Verification:**
- [ ] Reset email sends successfully (log to console in dev)
- [ ] Reset link contains valid token
- [ ] Token expires after 24 hours
- [ ] Invalid/expired tokens return 400 error
- [ ] Password change works after token verification

---

### Phase 4: Integration Testing & Documentation (Day 3)
**Status:** 🔄 Pending
**Deliverable:** Tests, docs, flow diagrams, API spec updates

#### Tasks:
- [ ] Create test suite `apps/web/__tests__/auth.test.ts`
  - [ ] Signup flow test
  - [ ] Login flow test
  - [ ] Protected page redirect test
  - [ ] Logout test
  - [ ] Session persistence test

- [ ] Create API tests `apps/api/__tests__/auth.test.ts`
  - [ ] Register endpoint (success, duplicate email, weak password)
  - [ ] Login endpoint (success, invalid credentials)
  - [ ] JWT verification (valid token, invalid token, expired token)
  - [ ] RBAC (allowed role, denied role)
  - [ ] Password reset flow

- [ ] Create E2E tests `apps/web/__tests__/e2e/auth-flow.e2e.ts`
  - [ ] Complete signup → login → access protected page flow
  - [ ] Logout and redirect flow

- [ ] Update documentation:
  - [ ] `docs/AUTHENTICATION.md` — How auth works, JWT format, flows
  - [ ] `.env.example` — Add JWT_SECRET, RESEND_API_KEY
  - [ ] OpenAPI spec — Update with auth endpoints
  - [ ] Architecture doc — Add auth section

- [ ] Create flow diagrams:
  - [ ] Signup flow (form → validation → API → email → confirm)
  - [ ] Login flow (credentials → JWT → session → protected page)
  - [ ] Password reset flow (forgot → email → reset → success)
  - [ ] Token refresh flow

- [ ] Update TypeScript types:
  - [ ] User type with role
  - [ ] Session type
  - [ ] JWT payload type
  - [ ] Auth error types

**Verification:**
- [ ] All tests pass (coverage > 70%)
- [ ] Documentation complete
- [ ] Flow diagrams clear
- [ ] No TypeScript errors
- [ ] No linting errors

---

## 🔑 Key Implementation Details

### Password Hashing (bcrypt)

```typescript
import bcrypt from 'bcrypt';

// Hash password on signup
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password on login
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "EMPRESARIO",
    "iat": 1707648000,
    "exp": 1708252800
  },
  "signature": "HMAC-SHA256(...)"
}
```

### RBAC Middleware Pattern

```typescript
export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // From auth middleware

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};

// Usage in routes
router.post(
  '/api/v1/admin/users',
  authMiddleware,
  requireRole(['ADMIN']),
  AdminController.createUser
);
```

### NextAuth.js Configuration

```typescript
// apps/web/src/lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Call backend login endpoint
        const res = await fetch('http://localhost:3001/api/v1/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
        });

        if (!res.ok) return null;

        const user = await res.json();
        return { ...user, jwtToken: user.token };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.jwtToken = user.jwtToken;
      return token;
    },
    async session({ session, token }) {
      session.user.jwtToken = token.jwtToken;
      return session;
    },
  },
};
```

### Protected API Route (with RBAC)

```typescript
// apps/api/src/routes/admin.ts
router.post(
  '/admin/users',
  authMiddleware,
  requireRole(['ADMIN']),
  async (req: Request, res: Response) => {
    const admin = req.user;
    // Create new user
    const newUser = await UserService.createUser(req.body);
    res.json({ success: true, user: newUser });
  }
);
```

---

## 🧪 Testing Strategy

### Unit Tests (AuthService)

```typescript
describe('AuthService', () => {
  test('hashPassword returns different hash for same password', async () => {
    const hash1 = await AuthService.hashPassword('password123');
    const hash2 = await AuthService.hashPassword('password123');
    expect(hash1).not.toBe(hash2);
    expect(await AuthService.verifyPassword('password123', hash1)).toBe(true);
  });

  test('generateToken creates valid JWT', () => {
    const token = AuthService.generateToken({ id: 'user-1', role: 'ADMIN' });
    const payload = AuthService.verifyToken(token);
    expect(payload.id).toBe('user-1');
    expect(payload.role).toBe('ADMIN');
  });
});
```

### Integration Tests (API Endpoints)

```typescript
describe('POST /api/v1/auth/register', () => {
  test('successful signup creates user and returns 201', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
      role: 'EMPRESARIO',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
  });

  test('duplicate email returns 400', async () => {
    // Create first user
    await request(app).post('/api/v1/auth/register').send({...});

    // Try to create with same email
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Another User',
      role: 'EMPRESARIO',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already exists');
  });
});
```

---

## 📋 Dev Agent Record

### Checkboxes (Mark as [x] when complete)

**Phase 1 — Backend Auth Setup:**
- [x] AuthService created with password hashing and JWT ✅
- [x] Auth routes implemented (register, login, refresh, etc.) ✅
- [x] JWT verification middleware created ✅
- [x] RBAC middleware created ✅
- [x] Rate limiting configured ✅
- [x] 35 auth tests created and passing ✅

**Phase 2 — Frontend Auth Setup:**
- [x] NextAuth.js configured ✅
- [x] Login/signup pages created ✅
- [x] Protected routes configured ✅
- [x] Session provider integrated ✅
- [x] Form validation working ✅
- [x] Password strength indicator ✅
- [x] Forgot password & reset pages ✅
- [x] Dashboard with role-based nav ✅

**Phase 3 — Email & Password Reset:**
- [ ] Email service configured
- [ ] Password reset email template created
- [ ] Reset token generation and verification
- [ ] Password reset flow tested
- [ ] Emails sending successfully

**Phase 4 — Testing & Documentation:**
- [ ] Unit tests created and passing
- [ ] Integration tests passing
- [ ] E2E tests passing (signup → login flow)
- [ ] Documentation complete
- [ ] Flow diagrams created

### Debug Log

**Phase 1 Completion (Feb 10):**
- ✅ AuthService.ts created with complete auth logic (400+ lines)
  - Password hashing with bcrypt (salt rounds: 10)
  - Password strength validation (8 chars, uppercase, lowercase, number, special char)
  - JWT token generation and verification
  - User registration with email/password validation
  - User login with credentials verification
  - Token refresh logic
  - Password reset flow with token generation
  - Change password with old password verification

- ✅ Auth middleware created:
  - JWT verification middleware (apps/api/src/middleware/auth.ts)
  - Optional auth middleware (allows auth but doesn't require it)
  - RBAC middleware (apps/api/src/middleware/rbac.ts) with 3 role levels:
    - requireRole() - Generic role checker
    - requireAdminRole() - Admin only
    - requireContadorRole() - Contador + Admin
    - requireEmprersarioRole() - Any authenticated user

- ✅ Auth routes implemented (apps/api/src/routes/auth.ts):
  - POST /api/v1/auth/register - New user signup
  - POST /api/v1/auth/login - User login
  - POST /api/v1/auth/logout - Logout (audit log placeholder)
  - POST /api/v1/auth/refresh - Refresh JWT token
  - POST /api/v1/auth/forgot-password - Request password reset
  - POST /api/v1/auth/reset-password - Reset password with token
  - POST /api/v1/auth/change-password - Change password (requires auth)
  - GET /api/v1/auth/session - Get current user session (requires auth)
  - All endpoints protected with rate limiting (5 attempts/15 min)

- ✅ Installed dependencies:
  - bcrypt v5+ (password hashing)
  - jsonwebtoken (JWT generation/verification)
  - express-rate-limit (rate limiting for auth endpoints)
  - @types/* for all above

- ✅ Comprehensive test suite (35 tests, all passing):
  - Password Hashing & Verification (4 tests)
  - Password Strength Validation (7 tests)
  - JWT Token Generation (4 tests)
  - JWT Token Verification (5 tests)
  - User Registration (4 tests)
  - User Login (3 tests)
  - Token Refresh (2 tests)
  - Password Reset (3 tests)
  - Change Password (3 tests)

- ✅ Integrated into main API:
  - Updated apps/api/src/routes/api.ts to include v1 routes
  - Auth routes available at /api/v1/auth/*

**Known Implementation Details:**
- JWT expiry: 7 days
- Refresh token expiry: 30 days
- Password reset token expiry: 24 hours
- Password hashing: bcrypt with 10 salt rounds
- Rate limiting: 5 failed attempts → 15 minute lockout per IP
- All tokens stateless (no session storage needed)
- JWT stored client-side in HttpOnly cookies (secure)
- CORS configured for frontend origin only

**Phase 2 Completion (Feb 10):**
- ✅ NextAuth.js v5 configured with JWT strategy
  - Credentials provider for email/password
  - JWT callbacks for session and token management
  - Redirect callbacks for auth flow
  - Session strategy: JWT (7-day expiry)

- ✅ Authentication Pages (all with full form validation):
  - Login page (/auth/login) - Email/password form with error handling
  - Signup page (/auth/signup) - Full name, email, password, role selection
  - Forgot Password (/auth/forgot-password) - Email field for reset request
  - Reset Password (/auth/reset-password) - Token validation, new password form

- ✅ Form Components:
  - FormField - Reusable input with error display
  - PasswordStrength - Real-time password meter with requirements checklist
  - Validation feedback and helper text

- ✅ Protected Dashboard:
  - Dashboard layout requiring authentication
  - Role-based sidebar navigation (EMPRESARIO, CONTADOR, ADMIN)
  - Dashboard page with role-specific content
  - User info display and logout button

- ✅ Custom Hooks:
  - useSession - Get current session, user, signOut function
  - useRequireAuth - Protect pages, check roles, redirect to login

- ✅ Form Validation (Zod schemas):
  - loginSchema - Email + password
  - signupSchema - Email + name + password + role + confirmation
  - forgotPasswordSchema - Email validation
  - resetPasswordSchema - New password + confirmation
  - changePasswordSchema - Current + new password + confirmation

- ✅ Root Layout:
  - SessionProvider wrapper
  - Global CSS with Tailwind
  - Accessibility styles (focus, scrollbar)
  - Global font and box-sizing

- ✅ Environment Setup:
  - apps/web/.env.local with NEXTAUTH_URL and API_URL
  - Global CSS file with Tailwind directives
  - Type definitions for NextAuth session/user

**Installed Dependencies (Phase 2):**
- next-auth (NextAuth.js)
- react-hook-form (Form state management)
- zod (Type-safe validation)
- @hookform/resolvers (Zod integration with RHF)

**Next: Phase 3 - Email & Password Reset Integration**

---

## ✨ Completion Notes

- [ ] All acceptance criteria met
- [ ] Tests passing: Unit, Integration, E2E
- [ ] Linting clean: `npm run lint`
- [ ] Types pass: `npm run typecheck`
- [ ] CodeRabbit review passed (if applicable)
- [ ] File list updated below

---

## 📁 File List

**Created/Modified Files:**

| File | Status | Notes |
|------|--------|-------|
| `apps/api/src/services/AuthService.ts` | 📝 New | Password hashing, JWT generation, validation |
| `apps/api/src/routes/auth.ts` | 📝 New | Register, login, refresh, password reset endpoints |
| `apps/api/src/middleware/auth.ts` | 📝 New | JWT verification middleware |
| `apps/api/src/middleware/rbac.ts` | 📝 New | Role-based access control middleware |
| `apps/api/src/services/EmailService.ts` | 📝 New | Email sending via Resend |
| `apps/api/src/templates/password-reset.html` | 📝 New | Password reset email template |
| `apps/api/src/templates/welcome.html` | 📝 New | Welcome email template |
| `apps/api/__tests__/auth.test.ts` | 📝 New | Auth API integration tests |
| `apps/web/src/lib/auth.ts` | 📝 New | NextAuth.js configuration |
| `apps/web/src/app/api/auth/[...nextauth]/route.ts` | 📝 New | NextAuth.js API route |
| `apps/web/src/app/auth/login/page.tsx` | 📝 New | Login page component |
| `apps/web/src/app/auth/signup/page.tsx` | 📝 New | Signup page component |
| `apps/web/src/app/auth/forgot-password/page.tsx` | 📝 New | Forgot password page |
| `apps/web/src/app/auth/reset-password/page.tsx` | 📝 New | Reset password page |
| `apps/web/src/app/dashboard/layout.tsx` | ✏️ Modified | Add session provider and auth guard |
| `apps/web/src/app/admin/layout.tsx` | 📝 New | Admin layout with role check |
| `apps/web/src/hooks/useSession.ts` | 📝 New | Custom hook for session access |
| `apps/web/src/hooks/useRequireAuth.ts` | 📝 New | Custom hook for protected pages |
| `apps/web/__tests__/auth.test.ts` | 📝 New | Frontend auth tests |
| `apps/api/package.json` | ✏️ Modified | Add bcrypt, jsonwebtoken, express-rate-limit |
| `apps/web/package.json` | ✏️ Modified | Add next-auth, zod, react-hook-form |
| `docs/AUTHENTICATION.md` | 📝 New | Auth documentation and flows |
| `.env.example` | ✏️ Modified | Add JWT_SECRET, RESEND_API_KEY |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-10 | Story created | Dex |

---

## 🎯 Dev Notes

- JWT tokens stored in HttpOnly cookies (secure, cannot be accessed by JavaScript)
- CORS configured to only allow requests from frontend domain
- Rate limiting: 5 failed attempts → 15 minute lockout per IP
- Password reset tokens expire after 24 hours
- Sessions persist for 7 days (refresh token for extended use)
- All passwords hashed with bcrypt salt rounds: 10
- RBAC roles: ADMIN (super user), CONTADOR (accountant), EMPRESARIO (entrepreneur)
- OAuth2 prepared but not implemented (future phase)

---

**Story Status: 🟡 Draft (Awaiting Approval)**
**Last Updated:** 2026-02-10
**Created by:** Dex (@dev)
