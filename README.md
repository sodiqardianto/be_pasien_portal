# Hospital Management System - Backend API

Backend API for Hospital Management System with JWT Authentication, built with Express, TypeScript, Prisma, and PostgreSQL.

> **🏗️ Architecture**: Feature-Based Architecture - Each module is self-contained with its own controllers, services, DTOs, and routes.

## Features

- **JWT Authentication** with Access & Refresh Tokens
- **OTP Login via WhatsApp** for mobile apps
- **User Roles** (USER, ADMIN)
- **Request Validation** using Zod
- **Rate Limiting** to prevent brute force attacks
- **CORS** enabled
- **Standardized API Responses**
- **Password Hashing** with bcrypt
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **Soft Delete** support for data retention
- **API Documentation** with Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hospital_db?schema=public"
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests with Jest
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer your-access-token
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer your-access-token
```

#### Request OTP (WhatsApp)
```http
POST /api/auth/otp/request
Content-Type: application/json

{
  "phoneNumber": "081234567890"
}
```

#### Verify OTP & Login
```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "phoneNumber": "081234567890",
  "code": "123456"
}
```

> **📱 OTP Login**: See [QUICK_START_OTP.md](QUICK_START_OTP.md) for complete OTP implementation guide

## API Documentation

The API includes interactive documentation powered by Swagger/OpenAPI.

### Access Documentation
- **URL**: `http://localhost:3000/api-docs`
- **Features**:
  - Interactive API testing
  - Request/response examples
  - Authentication with JWT tokens
  - Schema definitions

### Documentation Features
- Complete endpoint specifications
- Request/response schemas
- Authentication requirements
- Error response formats
- Try-it-out functionality for testing endpoints



## Response Format

All API responses follow this standardized format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details"
}
```

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Rate Limiting

- Login/Register: 5 requests per 15 minutes
- Refresh Token: 10 requests per 15 minutes

## Security Features

### Authentication & Authorization
- **JWT-based authentication** - Secure token-based auth with access & refresh tokens
- **Password hashing** - bcrypt with salt rounds
- **Role-based access control** - USER and ADMIN roles

### Input Security
- **Input validation** - Zod schema validation on all endpoints
- **Input sanitization** - XSS protection with automatic sanitization
- **SQL injection protection** - Prisma ORM with parameterized queries

### Network Security
- **Security headers** - Helmet.js for HTTP security headers
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security
  - Content-Security-Policy
- **CORS protection** - Configurable origin whitelist
- **Rate limiting** - Prevent brute force attacks
  - Login/Register: 5 requests per 15 minutes
  - Refresh Token: 10 requests per 15 minutes

### Data Protection
- **Soft delete** - Data retention with deletedAt timestamp
- **Request size limits** - 10MB max payload
- **Automatic sanitization** - All inputs sanitized before processing

## Database Schema

### User Model
```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  password     String
  name         String
  dob          DateTime?
  phoneNumber  String?   @map("phone_number")
  role         Role      @default(USER)
  refreshToken String?   @db.Text
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime? @map("deleted_at")

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

**Features:**
- Soft delete support (`deletedAt`)
- Date of birth field
- Phone number field

## Project Structure

```
src/
├── modules/              # Feature modules (feature-based architecture)
│   └── auth/             # Authentication module
│       ├── auth.dto.ts         # Validation schemas (Zod)
│       ├── auth.types.ts       # Module-specific types
│       ├── auth.controller.ts  # HTTP request handlers
│       ├── auth.service.ts     # Business logic
│       ├── auth.routes.ts      # Route definitions
│       └── index.ts            # Module exports
├── shared/               # Shared resources (used across modules)
│   ├── middleware/       # Auth, validation, error handling
│   ├── utils/            # JWT, password, database, response
│   └── types/            # Shared TypeScript interfaces
├── config/               # Configuration management
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
└── index.ts              # Application entry point
```

### Architecture Principles

**Feature-Based Architecture**: Each module is self-contained with:
- **DTOs**: Input validation with Zod
- **Types**: Module-specific TypeScript interfaces
- **Controller**: HTTP request/response handling
- **Service**: Business logic and database operations
- **Routes**: Endpoint definitions with middleware

**Shared Resources**: Only truly shared code goes here:
- Middleware used by multiple modules
- Utility functions (JWT, password hashing, etc.)
- Common TypeScript interfaces (ApiResponse, JwtPayload)

### Adding New Modules

To add a new module (e.g., `patients`):

1. Create module structure:
```
src/modules/patients/
├── patients.dto.ts
├── patients.types.ts
├── patients.controller.ts
├── patients.service.ts
├── patients.routes.ts
└── index.ts
```

2. Register routes in `src/index.ts`:
```typescript
import { patientsRoutes } from './modules/patients';
app.use('/api/patients', patientsRoutes);
```

3. Update Prisma schema and run migration:
```bash
npm run prisma:migrate
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

MIT
