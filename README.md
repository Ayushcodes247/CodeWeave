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

---

# Room Management API Documentation

## Overview

This document provides detailed information about the Room Management API routes for the Code-Weave application. The room system allows users to create and manage collaborative coding spaces with different access modes and member management.

## Base URL

```
http://localhost:3000/api/rooms
```

or production:

```
https://yourdomain.com/api/rooms
```

---

## API Endpoints

### 1. **Create Room**

Creates a new room for collaborative work.

**Endpoint:**
```
POST /rooms/create
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "roomName": "React Project",
  "mode": "team",
  "maxMembers": 5
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roomName` | string | Yes | Name of the room (2-50 characters) |
| `mode` | string | Yes | Room mode - "solo" or "team" |
| `maxMembers` | number | No | Maximum members allowed in the room |

**Response (201 Created):**
```json
{
  "success": true,
  "room": {
    "_id": "507f1f77bcf86cd799439012",
    "roomname": "React Project",
    "membersCount": 1
  },
  "inviteCode": "ABC123XYZ789",
  "message": "Room created successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | roomName and mode are required |
| 400 | BAD_REQUEST | Room with this name already exists |
| 400 | BAD_REQUEST | Invalid room data / validation errors |
| 401 | UNAUTHORIZED | Unauthorized |
| 404 | NOT_FOUND | User not found |

**Logic:**
- Validates that roomName and mode are provided
- Checks if a room with the same name already exists for this user
- Verifies that the authenticated user exists
- Creates the room with the authenticated user as owner
- Automatically adds owner as first member with "owner" role
- Generates a unique invite code for room access

---

### 2. **Search Room**

Retrieves detailed information about a specific room.

**Endpoint:**
```
POST /rooms/search
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "roomId": "507f1f77bcf86cd799439012"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roomId` | string | Yes | Valid MongoDB ObjectId of the room |

**Response (200 OK):**
```json
{
  "success": true,
  "room": {
    "_id": "507f1f77bcf86cd799439012",
    "roomName": "React Project",
    "ownerId": "507f1f77bcf86cd799439011",
    "ownerName": "john_doe",
    "mode": "team",
    "lastActivatedAt": "2026-04-24T10:30:00.000Z",
    "createdAt": "2026-04-20T15:45:30.000Z"
  },
  "message": "room searched successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Invalid room id |
| 401 | UNAUTHORIZED | Unauthorized |
| 404 | NOT_FOUND | room not found |

**Logic:**
- Validates that roomId is provided
- Validates that roomId is a valid MongoDB ObjectId format
- Retrieves the room with owner details populated
- Returns room information including owner details and creation timestamp
- Updates and returns last activation time

---

# Request Management API Documentation

## Overview

This document provides detailed information about the Request Management API routes for the Code-Weave application. The request system allows users to request access to join collaborative rooms and enables room owners to manage these requests through accept/reject mechanisms.

## Base URL

```
http://localhost:3000/api/requests
```

or production:

```
https://yourdomain.com/api/requests
```

---

## API Endpoints

### 1. **Create Room Access Request**

Creates a new request to join a room with a valid invite code. Users can request to join rooms created by other users.

**Endpoint:**
```
POST /requests
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "inviteCode": "ABC123XYZ789"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roomId` | string | Yes | Valid MongoDB ObjectId of the target room |
| `inviteCode` | string | Yes | Invite code shared by the room owner |

**Response (201 Created):**
```json
{
  "success": true,
  "requestData": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "pending",
    "roomName": "React Project",
    "roomId": "507f1f77bcf86cd799439012"
  },
  "message": "Request created successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Please provide valid room data |
| 404 | NOT_FOUND | Room not found |
| 401 | UNAUTHORIZED | Owner can not make request to it's own room |
| 401 | UNAUTHORIZED | Invalid invite code |
| 400 | BAD_REQUEST | Request already exists |
| 400 | BAD_REQUEST | Room is full |
| 401 | UNAUTHORIZED | Unauthorized |

**Logic:**
- Validates that roomId and inviteCode are provided
- Verifies the room exists
- Checks if requester is not the room owner
- Validates the invite code against stored hash
- Ensures no duplicate request exists for this user and room
- Verifies room has capacity for new members
- Creates request with "pending" status
- Emits socket event to room owner

**Socket Events Emitted:**
- `request:new` - Notified to room owner when new request is created

---

### 2. **Accept Room Access Request**

Accepts a pending room access request and adds the user as a member to the room. Only room owner can accept requests.

**Endpoint:**
```
PATCH /requests/accept
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "uid": "507f1f77bcf86cd799439014"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roomId` | string | Yes | Valid MongoDB ObjectId of the room |
| `uid` | string | Yes | Valid MongoDB ObjectId of the requester user |

**Response (200 OK):**
```json
{
  "success": true,
  "reqsReturn": {
    "_id": "507f1f77bcf86cd799439013",
    "roomName": "React Project",
    "roomId": "507f1f77bcf86cd799439012",
    "uid": "507f1f77bcf86cd799439014",
    "status": "fulfilled"
  },
  "message": "Request accepted successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | roomId and uid are required |
| 400 | BAD_REQUEST | Invalid roomId or uid |
| 404 | NOT_FOUND | Room not found |
| 403 | FORBIDDEN | Only owner can accept requests |
| 404 | NOT_FOUND | Request not found |
| 400 | BAD_REQUEST | User already in room |
| 400 | BAD_REQUEST | Room is full |
| 401 | UNAUTHORIZED | Unauthorized |

**Logic:**
- Validates roomId and uid are provided and valid
- Ensures authenticated user is the room owner
- Retrieves pending request for the user and room
- Checks user is not already a member
- Verifies room has capacity
- Updates request status to "fulfilled"
- Adds user to room members list with "viewer" role
- Saves both request and room documents
- Emits socket event to requester

**Socket Events Emitted:**
- `request:accepted` - Notified to requester with room details

---

### 3. **Reject Room Access Request**

Rejects a pending room access request. Only room owner can reject requests. Request must be in "pending" status.

**Endpoint:**
```
PATCH /requests/reject
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "uid": "507f1f77bcf86cd799439014"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `roomId` | string | Yes | Valid MongoDB ObjectId of the room |
| `uid` | string | Yes | Valid MongoDB ObjectId of the requester user |

**Response (200 OK):**
```json
{
  "success": true,
  "reqsReturn": {
    "_id": "507f1f77bcf86cd799439013",
    "roomName": "React Project",
    "roomId": "507f1f77bcf86cd799439012",
    "uid": "507f1f77bcf86cd799439014",
    "status": "rejected"
  },
  "message": "Request rejected successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | roomId and uid are required |
| 400 | BAD_REQUEST | Invalid roomId or uid |
| 404 | NOT_FOUND | Room not found |
| 403 | FORBIDDEN | Only owner can reject requests |
| 404 | NOT_FOUND | Request not found |
| 400 | BAD_REQUEST | Request already processed |
| 401 | UNAUTHORIZED | Unauthorized |

**Logic:**
- Validates roomId and uid are provided and valid
- Ensures authenticated user is the room owner
- Retrieves request and verifies it exists
- Checks request is in "pending" status (not already accepted/rejected)
- Updates request status to "rejected"
- Saves request document
- Emits socket event to requester

**Socket Events Emitted:**
- `request:rejected` - Notified to requester with rejection details

---

### 4. **Get All Pending Requests for Room Owner**

Retrieves all pending/processed requests for rooms owned by the authenticated user. Used by room owners to see who has requested access.

**Endpoint:**
```
GET /requests/all-general
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:** (Optional)
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of records per page (max 50) |

**Response (200 OK):**
```json
{
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "roomId": "507f1f77bcf86cd799439012",
      "requesterId": "507f1f77bcf86cd799439014",
      "status": "pending",
      "roomName": "React Project"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "roomId": "507f1f77bcf86cd799439012",
      "requesterId": "507f1f77bcf86cd799439016",
      "status": "fulfilled",
      "roomName": "React Project"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Requests fetched successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Please provide valid user data |
| 401 | UNAUTHORIZED | Unauthorized |

**Logic:**
- Validates authenticated user exists
- Uses user ID to find all rooms owned by user
- Retrieves all requests (pending, fulfilled, rejected) for owned rooms
- Applies pagination with default page=1, limit=10
- Limits pagination to prevent excessive data transfer (max 50 per page)
- Performs aggregation pipeline to lookup room details
- Returns requests sorted by creation date (newest first)
- Includes total count and pagination metadata

---

### 5. **Get All Requests Made by User**

Retrieves all requests created by the authenticated user (both pending and processed). Shows user's request history and current status.

**Endpoint:**
```
GET /requests/all-requester
```

**Rate Limiting:** Yes (routeLimiter applied)

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:** (Optional)
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of records per page (max 50) |

**Response (200 OK):**
```json
{
  "success": true,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "roomId": "507f1f77bcf86cd799439012",
      "uid": "507f1f77bcf86cd799439014",
      "status": "pending",
      "roomName": "React Project"
    },
    {
      "_id": "507f1f77bcf86cd799439017",
      "roomId": "507f1f77bcf86cd799439018",
      "uid": "507f1f77bcf86cd799439014",
      "status": "fulfilled",
      "roomName": "Node.js Backend"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Requests fetched successfully."
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Please provide valid user data |
| 401 | UNAUTHORIZED | Unauthorized |

**Logic:**
- Validates authenticated user exists
- Retrieves all requests created by user (uid matches authenticated user)
- Applies pagination with default page=1, limit=10
- Limits pagination to prevent excessive data transfer (max 50 per page)
- Performs aggregation pipeline to lookup room details
- Returns requests sorted by creation date (newest first)
- Includes total count and pagination metadata
- Returns both pending and completed requests

---

## Request Model

### Request Schema

```javascript
{
  _id: ObjectId,
  uid: ObjectId,                 // Reference to User (requester)
  roomId: ObjectId,              // Reference to Room
  status: String,                // "pending", "fulfilled", or "rejected"
  createdAt: Date,               // Request creation timestamp
  updatedAt: Date                // Last update timestamp
}
```

### Request Status Types

- **pending:** Request submitted, awaiting owner decision
- **fulfilled:** Request accepted, user added to room members
- **rejected:** Request declined by room owner

### Request Indexes

- Unique index on `(uid, roomId)` - Prevents duplicate requests from same user for same room
- Index on `roomId` - Optimizes queries by room
- Index on `status` - Optimizes filtering by status

---

## Real-time Socket Events

The request system emits real-time events via Socket.io to notify users of changes:

### Socket Event: `request:new`
**Emitted to:** Room owner
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "requesterId": "507f1f77bcf86cd799439014",
  "roomName": "React Project",
  "timestamp": "2026-04-27T10:30:00.000Z"
}
```

### Socket Event: `request:accepted`
**Emitted to:** Requester user
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "roomName": "React Project",
  "status": "fulfilled"
}
```

### Socket Event: `request:rejected`
**Emitted to:** Requester user
**Payload:**
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "roomName": "React Project",
  "status": "rejected"
}
```

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

### Common Request Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input, missing fields, or business logic violation |
| 401 | Unauthorized - Invalid credentials or user not authenticated |
| 403 | Forbidden - User lacks permission (not room owner) |
| 404 | Not Found - Room or request doesn't exist |

---

## Security Considerations

### 1. **Access Control**
- Only authenticated users can create requests
- Only room owners can accept/reject requests
- Users cannot request to join their own rooms
- Prevents unauthorized access to room member operations

### 2. **Invite Code Validation**
- Invite codes are hashed before storage
- Prevents unauthorized room access via code exposure
- Codes are validated before request creation

### 3. **Request Deduplication**
- Unique index on (uid, roomId) prevents duplicate requests
- Users can only have one active request per room
- Prevents request spam and duplicate processing

### 4. **Rate Limiting**
- All endpoints have rate limiting enabled
- Prevents brute force attacks
- Protects against abuse

### 5. **Capacity Management**
- Room capacity verified before adding members
- Prevents room overflow
- Consistent with room settings

---

## Request Flow Examples

### Example 1: User Requests Room Access

**Step 1: Get Room Invite Code**
Room owner shares invite code: `ABC123XYZ789`

**Step 2: Create Request**
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "507f1f77bcf86cd799439012",
    "inviteCode": "ABC123XYZ789"
  }'
```

Response:
```json
{
  "success": true,
  "requestData": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "pending",
    "roomName": "React Project",
    "roomId": "507f1f77bcf86cd799439012"
  },
  "message": "Request created successfully."
}
```

**Step 3: Room Owner Accepts Request**
Owner receives socket notification and accepts:
```bash
curl -X PATCH http://localhost:3000/api/requests/accept \
  -H "Authorization: Bearer <owner_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "507f1f77bcf86cd799439012",
    "uid": "507f1f77bcf86cd799439014"
  }'
```

Response:
```json
{
  "success": true,
  "reqsReturn": {
    "_id": "507f1f77bcf86cd799439013",
    "roomName": "React Project",
    "roomId": "507f1f77bcf86cd799439012",
    "uid": "507f1f77bcf86cd799439014",
    "status": "fulfilled"
  },
  "message": "Request accepted successfully."
}
```

**Step 4: Requester Notified via Socket**
Requester receives real-time notification:
```json
{
  "roomId": "507f1f77bcf86cd799439012",
  "roomName": "React Project",
  "status": "fulfilled"
}
```

### Example 2: Room Owner Manages Multiple Requests

**Step 1: Fetch All Pending Requests**
```bash
curl -X GET "http://localhost:3000/api/requests/all-general?page=1&limit=10" \
  -H "Authorization: Bearer <owner_token>"
```

Response:
```json
{
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "roomId": "507f1f77bcf86cd799439012",
      "requesterId": "507f1f77bcf86cd799439014",
      "status": "pending",
      "roomName": "React Project"
    },
    {
      "_id": "507f1f77bcf86cd799439020",
      "roomId": "507f1f77bcf86cd799439012",
      "requesterId": "507f1f77bcf86cd799439021",
      "status": "pending",
      "roomName": "React Project"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "Requests fetched successfully."
}
```

**Step 2: Accept First Request**
```bash
curl -X PATCH http://localhost:3000/api/requests/accept \
  -H "Authorization: Bearer <owner_token>" \
  -d '{"roomId": "507f1f77bcf86cd799439012", "uid": "507f1f77bcf86cd799439014"}'
```

**Step 3: Reject Second Request**
```bash
curl -X PATCH http://localhost:3000/api/requests/reject \
  -H "Authorization: Bearer <owner_token>" \
  -d '{"roomId": "507f1f77bcf86cd799439012", "uid": "507f1f77bcf86cd799439021"}'
```

### Example 3: User Tracks Request History

**Fetch All User Requests**
```bash
curl -X GET "http://localhost:3000/api/requests/all-requester?page=1&limit=5" \
  -H "Authorization: Bearer <user_token>"
```

Response:
```json
{
  "success": true,
  "requests": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "roomId": "507f1f77bcf86cd799439012",
      "uid": "507f1f77bcf86cd799439014",
      "status": "fulfilled",
      "roomName": "React Project"
    },
    {
      "_id": "507f1f77bcf86cd799439017",
      "roomId": "507f1f77bcf86cd799439018",
      "uid": "507f1f77bcf86cd799439014",
      "status": "rejected",
      "roomName": "Node.js Backend"
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "roomId": "507f1f77bcf86cd799439023",
      "uid": "507f1f77bcf86cd799439014",
      "status": "pending",
      "roomName": "Vue.js Frontend"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  },
  "message": "Requests fetched successfully."
}
```

---

## Related Models

### User Model (Reference)
- `_id`: MongoDB ObjectId
- `username`: Unique username
- `email`: Unique email address

### Room Model (Reference)
- `_id`: MongoDB ObjectId
- `owner`: Reference to User (room owner)
- `roomName`: Name of the room
- `maxMembers`: Maximum allowed members
- `inviteCode`: Hashed invite code
- `members`: Array of members with roles

---

## Pagination

All list endpoints support pagination to manage large datasets:

**Query Parameters:**
- `page`: Current page number (default: 1, minimum: 1)
- `limit`: Records per page (default: 10, maximum: 50)

**Response Pagination Metadata:**
```json
{
  "pagination": {
    "total": 100,        // Total matching records
    "page": 1,           // Current page
    "limit": 10,         // Records per page
    "totalPages": 10     // Total pages available
  }
}
```

**Pagination Calculation:**
- Skip: `(page - 1) * limit`
- Total Pages: `Math.ceil(total / limit)`
- Has Next: `page < totalPages`
- Has Previous: `page > 1`

---

## Environment Configuration

Request management uses the same environment configuration as authentication and room management:

```env
PORT=3000
NODE_ENV=development|production
BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://...
```

---

## Support & Troubleshooting

### Issue: "Invalid invite code"
- **Cause:** Invite code doesn't match room's hashed code
- **Solution:** Verify invite code is correct and hasn't expired

### Issue: "Owner can not make request to it's own room"
- **Cause:** Trying to request access to a room you created
- **Solution:** Only non-owners can request access

### Issue: "Request already exists"
- **Cause:** You've already made a request to this room
- **Solution:** Wait for owner to accept/reject, or check your request status

### Issue: "Room is full"
- **Cause:** Room has reached maximum member capacity
- **Solution:** Contact room owner to increase capacity or wait for a slot

### Issue: "Only owner can accept requests"
- **Cause:** Non-owner trying to manage requests
- **Solution:** Only the room owner can accept/reject requests

### Issue: "Request not found"
- **Cause:** Request ID is invalid or already processed
- **Solution:** Verify request exists and is in correct status

### Issue: "Request already processed"
- **Cause:** Trying to reject a request that's already fulfilled
- **Solution:** Can only reject pending requests

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-27 | Initial request management documentation |

---

## Room Model

### Room Schema

```javascript
{
  _id: ObjectId,
  roomName: String,              // 2-50 characters, unique per owner
  owner: ObjectId,               // Reference to User
  mode: String,                  // "solo" or "team"
  members: [
    {
      user: ObjectId,            // Reference to User
      role: String               // "owner", "editor", or "viewer"
    }
  ],
  files: [ObjectId],             // References to File documents
  inviteCode: String,            // Hashed invite code
  maxMembers: Number,            // Maximum allowed members
  lastActiveAt: Date,            // Last activity timestamp
  createdAt: Date,               // Room creation timestamp
  updatedAt: Date                // Last update timestamp
}
```

### Room Modes

- **solo:** Single user room for personal coding projects
- **team:** Collaborative room allowing multiple members with different roles

### Member Roles

- **owner:** Full access, can manage room and members
- **editor:** Can create and edit files
- **viewer:** Read-only access to room files

---

## Room Invite Codes

### Invite Code Features

- **Format:** Randomly generated alphanumeric string
- **Security:** Stored as hashed value in database
- **Lifecycle:** Generated on room creation, can be regenerated
- **Usage:** Used to join existing rooms as a new member

### Invite Code Flow

1. Room is created with a unique invite code
2. Owner can share the invite code with others
3. Other users use the invite code to join the room
4. Once joined, user is added to room's members list

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

### Common Room Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request - Invalid input, missing fields, or duplicate room name |
| 401 | Unauthorized - Authentication required or token invalid |
| 404 | Not Found - Room or user doesn't exist |

---

## Security Considerations

### 1. **Access Control**
- Only authenticated users can create or search rooms
- Users can only access rooms they are members of (enforced at service level)

### 2. **Room Uniqueness**
- Room names are unique per owner (two users can have rooms with same name)
- Prevents accidental duplicate room creation

### 3. **Invite Codes**
- Invite codes are hashed before storage
- Prevents exposure of actual codes in database
- Can be regenerated by room owner

### 4. **Member Management**
- Different role-based access levels (owner, editor, viewer)
- Prevents unauthorized modifications
- Maintains audit trail through createdAt/updatedAt timestamps

---

## Usage Examples

### Example Flow: Create and Retrieve Room

**Step 1: Create Room**
```bash
curl -X POST http://localhost:3000/api/rooms/create \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "React Project",
    "mode": "team",
    "maxMembers": 5
  }'
```

Response:
```json
{
  "success": true,
  "room": {
    "_id": "507f1f77bcf86cd799439012",
    "roomname": "React Project",
    "membersCount": 1
  },
  "inviteCode": "ABC123XYZ789",
  "message": "Room created successfully."
}
```

**Step 2: Search Room**
```bash
curl -X POST http://localhost:3000/api/rooms/search \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "507f1f77bcf86cd799439012"
  }'
```

Response:
```json
{
  "success": true,
  "room": {
    "_id": "507f1f77bcf86cd799439012",
    "roomName": "React Project",
    "ownerId": "507f1f77bcf86cd799439011",
    "ownerName": "john_doe",
    "mode": "team",
    "lastActivatedAt": "2026-04-24T10:30:00.000Z",
    "createdAt": "2026-04-20T15:45:30.000Z"
  },
  "message": "room searched successfully."
}
```

### Example Flow: Multi-User Collaboration

**User 1: Create Team Room**
```bash
curl -X POST http://localhost:3000/api/rooms/create \
  -H "Authorization: Bearer <user1_token>" \
  -d '{"roomName": "Team Project", "mode": "team"}'
```

Gets `inviteCode: "ABC123XYZ789"`

**User 2: Search and Join Room**
```bash
# First search to verify room exists
curl -X POST http://localhost:3000/api/rooms/search \
  -H "Authorization: Bearer <user2_token>" \
  -d '{"roomId": "507f1f77bcf86cd799439012"}'

# Then join using invite code (endpoint not documented yet)
```

---

## Related Models

### User Model (Reference)
- `_id`: MongoDB ObjectId
- `username`: Unique username
- `email`: Unique email address

### File Model (Reference)
- `_id`: MongoDB ObjectId
- `roomId`: Reference to Room
- `content`: File content
- `language`: Programming language

---

## Environment Configuration

Room management uses the same environment configuration as authentication:

```env
PORT=3000
NODE_ENV=development|production
BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://...
```

---

## Support & Troubleshooting

### Issue: "Room with this name already exists"
- **Cause:** User already created a room with this name
- **Solution:** Use a different room name or delete the existing room

### Issue: "room not found"
- **Cause:** Room ID doesn't exist or user doesn't have access
- **Solution:** Verify room ID is correct and user has access to the room

### Issue: "Invalid room id"
- **Cause:** Provided room ID is not a valid MongoDB ObjectId format
- **Solution:** Ensure room ID is a valid 24-character hexadecimal string

### Issue: "roomName and mode are required"
- **Cause:** Missing required fields in request body
- **Solution:** Include both roomName and mode fields in the request

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-24 | Initial room management documentation |

---
