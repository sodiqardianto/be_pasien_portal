# Patient Portal Backend API

Backend API for Patient Portal with JWT Authentication, built with Express, TypeScript, Prisma, and MySQL.

## Features

- **JWT Authentication** with Access & Refresh Tokens
- **User Roles** (USER, ADMIN)
- **Request Validation** using Zod
- **Rate Limiting** to prevent brute force attacks
- **CORS** enabled
- **Standardized API Responses**
- **Password Hashing** with bcrypt
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **Unit Testing** with Jest and Supertest
- **API Documentation** with Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
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
DATABASE_URL="mysql://username:password@localhost:3306/pasien_portal"
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

## Testing

The project includes unit tests using Jest and Supertest for API endpoint testing.

### Running Tests
```bash
npm test
```

### Test Coverage
- **Auth Controller Tests**: Register and login functionality
- **Mocked Dependencies**: Prisma database, JWT utilities, password hashing
- **Test Cases**: Success scenarios and error handling

### Test Structure
```
tests/
└── auth.test.ts    # Authentication endpoint tests
```

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

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting on sensitive endpoints
- CORS protection
- SQL injection protection via Prisma

## Database Schema

### User Model
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String
  name         String
  role         Role     @default(USER)
  refreshToken String?  @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

## Project Structure

```
src/
├── controllers/       # Request handlers
│   └── auth.controller.ts
├── middleware/        # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── routes/           # API routes
│   └── auth.routes.ts
├── types/            # TypeScript types
│   └── index.ts
├── utils/            # Utility functions
│   ├── jwt.ts
│   ├── password.ts
│   ├── prisma.ts
│   └── response.ts
└── index.ts          # Application entry point
tests/
└── auth.test.ts      # Unit tests for auth endpoints
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

MIT
