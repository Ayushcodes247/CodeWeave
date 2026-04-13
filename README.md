# Authentication API Documentation

## Overview

This document provides detailed information about the authentication API routes for the Code-Weave application. The authentication system uses JWT tokens for access control and session management for maintaining user sessions across multiple devices.

## Base URL

```
http://localhost:3000/api/auth
```

or production:

```
https://yourdomain.com/api/auth
```

---

## Authentication Methods

### 1. **Access Token (Bearer Token)**
- Used for authenticating API requests
- Sent in the `Authorization` header
- Short-lived token (typically 15 minutes)
- JWT format

```
Authorization: Bearer <access_token>
```

### 2. **Refresh Token**
- Stored as an HTTP-only cookie named `auth_token`
- Used to obtain new access tokens
- Long-lived token (7 days for registration/refresh, 1 day for login)
- Automatically managed by the server

### 3. **Session Management**
- Sessions are tracked by device using user-agent and IP address
- Each session maintains a blacklist status
- Multiple concurrent sessions supported across different devices

---

## API Endpoints

### 1. **Register User**

Creates a new user account with the provided credentials.

**Endpoint:**
```
POST /auth/register
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** None required

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "gender": "male"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Unique username for the user |
| `email` | string | Yes | Unique email address |
| `password` | string | Yes | Strong password (validated) |
| `gender` | string | Yes | User's gender - "male" or "female" |

**Response (201 Created):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "profilePic": "http://localhost:3000/public/images/male.png"
  },
  "message": "User Registered successfully.andSession created Successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | All fields are required |
| 400 | BAD_REQUEST | Invalid gender provided |
| 409 | CONFLICT | User Already exists |
| 409 | CONFLICT | Email is already registered |

**Headers Set:**
- `Set-Cookie: auth_token=<refresh_token>; Max-Age=604800000; HttpOnly; ...`

---

### 2. **Login User**

Authenticates a user and creates a new session.

**Endpoint:**
```
POST /auth/login
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

**Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "profilePic": "http://localhost:3000/public/images/male.png"
  },
  "message": "User logged in successfully and Session created Successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | All fields are required |
| 401 | UNAUTHORIZED | Invalid email or password |
| 400 | BAD_REQUEST | Please login using OAuth provider |

**Headers Set:**
- `Set-Cookie: auth_token=<refresh_token>; Max-Age=86400000; HttpOnly; ...`

---

### 3. **Get User Profile**

Retrieves the authenticated user's profile information.

**Endpoint:**
```
GET /auth/me
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "profilePic": "http://localhost:3000/public/images/male.png"
  },
  "message": "Profile fetched successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Unauthorized |

---

### 4. **Logout (Single Device)**

Logs out the user from the current device only. Revokes the session for this device.

**Endpoint:**
```
POST /auth/logout-one
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
Cookie: auth_token=<refresh_token>
User-Agent: Mozilla/5.0...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successfully."
}
```

**Headers Modified:**
- `Set-Cookie: auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; ...` (Cookie cleared)

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Unauthorized |
| 401 | UNAUTHORIZED | Token missing |
| 404 | NOT_FOUND | Session not found |
| 401 | UNAUTHORIZED | Invalid session |

**Logic:**
- Matches session by user ID, user-agent, and revoked status
- Validates the refresh token
- Marks the session as revoked
- Invalidates the access token
- Clears the refresh token cookie

---

### 5. **Logout All Devices**

Logs out the user from all devices by revoking all active sessions.

**Endpoint:**
```
POST /auth/logout-all
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
Cookie: auth_token=<refresh_token> (optional)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out from all devices."
}
```

**Headers Modified:**
- `Set-Cookie: auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; HttpOnly; ...` (Cookie cleared)

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Unauthorized |
| 404 | NOT_FOUND | No active sessions found |

**Logic:**
- Finds all active sessions for the user
- Revokes all sessions (sets `revoked: true`)
- Invalidates the access token
- Clears the refresh token cookie
- User must login again to access the API

---

### 6. **Refresh Tokens**

Generates new access and refresh tokens using the existing refresh token. Used when the access token expires.

**Endpoint:**
```
GET /auth/refresh
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Session validation required (not Bearer token)

**Request Headers:**
```
Cookie: auth_token=<refresh_token>
User-Agent: Mozilla/5.0...
```

**Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Tokens refreshed successfully."
}
```

**Headers Set:**
- `Set-Cookie: auth_token=<new_refresh_token>; Max-Age=604800000; HttpOnly; ...`

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | Refresh token missing |
| 404 | NOT_FOUND | Session not found |
| 401 | UNAUTHORIZED | Session revoked |
| 401 | UNAUTHORIZED | Session compromised |
| 401 | UNAUTHORIZED | Unauthorized |

**Logic:**
- Validates the refresh token from cookie
- Checks if session is revoked
- Verifies token authenticity
- If token is invalid, marks session as compromised
- Generates new access and refresh tokens
- Updates session with new refresh token hash
- Returns new tokens

---

## Cookie Configuration

### Production Environment

```javascript
{
  maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days
  httpOnly: true,                      // Not accessible via JavaScript
  secure: true,                        // HTTPS only
  sameSite: 'none',                    // Cross-site cookie
  priority: 'high'
}
```

### Development Environment

```javascript
{
  maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days
  httpOnly: true,
  secure: false,                       // HTTP allowed
  sameSite: 'lax',
  priority: 'high'
}
```

---

## Session Management

### Session Tracking

Each session records:
- **User ID (uid):** The authenticated user's ID
- **Refresh Token:** Hashed refresh token for validation
- **User-Agent:** Device/browser information
- **IP Address:** Client's IP address
- **Revoked Status:** Whether the session is active or revoked

### Session Lifecycle

1. **Creation:** Upon registration or login
2. **Active:** Session is valid and can be used to refresh tokens
3. **Revoked:** Session is invalidated (logout triggered)
4. **Automatically Expired:** After token expiration time (7 days)

---

## Error Handling

All errors follow a standard format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Common Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input or missing fields |
| 401 | Unauthorized - Invalid credentials or expired token |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists (duplicate email) |

---

## Security Considerations

### 1. **Token Security**
- Access tokens are short-lived (15 minutes)
- Refresh tokens are long-lived but stored securely as HTTP-only cookies
- Tokens are signed with a secret key (JWT)

### 2. **Session Security**
- Sessions are device-specific (tracked by user-agent and IP)
- Each session can be individually revoked
- Compromised sessions can be detected and revoked

### 3. **Password Security**
- Passwords are hashed using bcrypt before storage
- Never sent back to client
- Compared securely during authentication

### 4. **Cookie Security**
- HTTP-only flag prevents JavaScript access
- Secure flag enforces HTTPS in production
- SameSite attribute prevents CSRF attacks

### 5. **Rate Limiting**
- All endpoints have rate limiting enabled
- Prevents brute force attacks
- Protects against DDoS

### 6. **Token Blacklist**
- Used access tokens are added to a blacklist
- Prevents token reuse after logout
- Automatic expiration after token lifetime

---

## Usage Examples

### Example Flow: Register and Login

**Step 1: Register**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "gender": "male"
  }'
```

**Step 2: Get Profile (using access token)**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>"
```

**Step 3: Refresh Token (before access token expires)**
```bash
curl -X GET http://localhost:3000/api/v1/auth/refresh \
  -H "Cookie: auth_token=<refresh_token>"
```

**Step 4: Logout from current device**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout-one \
  -H "Authorization: Bearer <access_token>" \
  -H "Cookie: auth_token=<refresh_token>"
```

### Example Flow: Multi-Device Login

**Device 1: Login**
```bash
# Server creates Session 1 and sets auth_token cookie
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"email": "john@example.com", "password": "..."}'
```

**Device 2: Login (same user)**
```bash
# Server creates Session 2 and sets new auth_token cookie
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"email": "john@example.com", "password": "..."}'
```

**Device 1: Logout from current device**
```bash
# Session 1 is revoked, Session 2 remains active
curl -X POST http://localhost:3000/api/v1/auth/logout-one \
  -H "Authorization: Bearer <access_token_device1>"
```

**Device 2: Still logged in**
```bash
# Device 2 can still access the API
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token_device2>"
```

---

## Related Models

### User Model
- `_id`: MongoDB ObjectId
- `username`: Unique username
- `email`: Unique email address
- `password`: Hashed password
- `gender`: User's gender (male/female)
- `profilePic`: URL to profile picture
- `provider`: Authentication provider (local/oauth)

### Session Model
- `_id`: MongoDB ObjectId
- `uid`: Reference to User
- `refreshToken`: Hashed refresh token
- `agent`: User-Agent string
- `ip`: IP address
- `revoked`: Boolean status
- `createdAt`: Session creation timestamp
- `updatedAt`: Last update timestamp
- `expiresAt`: Automatic expiration (7 days)

### Blacklist Model
- `token`: The invalidated token
- `expiresAt`: When the token expires (automatic cleanup)

---

## Environment Configuration

Required environment variables:

```env
PORT=3000
NODE_ENV=development|production
BASE_URL=http://localhost:3000

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Database
MONGODB_URI=mongodb://...

# Other configs
```

---

## Support & Troubleshooting

### Issue: "Session compromised"
- **Cause:** Refresh token doesn't match stored hash
- **Solution:** Login again to create a new session

### Issue: "Token missing"
- **Cause:** Refresh token cookie not sent
- **Solution:** Ensure cookies are enabled in browser

### Issue: "Session not found"
- **Cause:** Session was revoked or cookie is from different device
- **Solution:** Login again on the current device

### Issue: "Invalid email or password"
- **Cause:** Wrong credentials provided
- **Solution:** Verify email and password are correct

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-13 | Initial release |

---

## Contact & Support

For issues or questions, please refer to the main project documentation or contact the development team.
