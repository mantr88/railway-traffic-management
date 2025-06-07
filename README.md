# 🚄 Railway Traffic Management API

A comprehensive REST API for managing railway operations including stations, trains, wagons, and trips. Built with modern backend technologies and clean architecture principles.

## 🔥 Live Demo

**API Base URL:** `https://railway-traffic-management-production.up.railway.app/`  
**Swagger Documentation:** `{API Base URL}/api/v1/swagger-html` (available only local)

## 📋 Overview

This project implements a complete railway management system that handles:

- **Station Management** - Create and retrieve railway stations
- **Train Operations** - Manage trains and their wagon compositions
- **Trip Planning** - Schedule and search railway trips
- **Data Validation** - Comprehensive input validation with Ukrainian railway standards
- **Performance** - Redis caching with 60-second TTL for optimal response times

## 🛠 Tech Stack

### Backend Framework

- **NestJS** - Progressive Node.js framework with TypeScript
- **PostgreSQL** - Reliable relational database with raw SQL queries
- **Redis** - High-performance caching layer

### Architecture & Tools

- **TypeScript** - Type-safe development
- **Class Validator** - Robust input validation
- **Swagger/OpenAPI** - Comprehensive API documentation

### Development Tools

- **ESLint & Prettier** - Code quality and formatting

## 🏗 Architecture

The application follows clean architecture principles with clear separation of concerns:

```
src/
├── modules/
│   ├── stations/     # Station management
│   ├── trains/       # Train and wagon operations
│   └── trips/        # Trip scheduling and search
├── database/
│   ├── migrations/   # SQL schema migrations
│   └── database.service.ts
├── configs/          # Configuration files
└── main.ts          # Application bootstrap
```

### Design Patterns

- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic encapsulation
- **DTO Pattern** - Data transfer and validation
- **Dependency Injection** - Loose coupling and testability

## 🎯 Key Features

### 🚉 Station Management

- Create stations with Ukrainian naming validation
- 7-digit station codes starting with "22"
- Retrieve all stations or search by code

### 🚄 Train Operations

- Create trains with Cyrillic naming (e.g., "001Л")
- Manage wagon compositions (К-купе, П-плацкарт, Л-люкс)
- Add/remove wagons with duplicate prevention
- Automatic wagon ordering by number

### 🎫 Trip Management

- Schedule trips between stations
- Validate departure/arrival time logic
- Search trips by route and date
- Prevent duplicate trip scheduling

### ⚡ Performance Features

- **Redis Caching** - 60-second TTL on all GET endpoints
- **Database Indexing** - Optimized queries for search operations
- **Connection Pooling** - Efficient database connection management

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+ (optional, falls back to in-memory cache)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/railway-traffic-management.git
   cd railway-traffic-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```env
   # Database
   DB_HOST=
   DB_PORT=
   DB_NAME=railway_db
   DB_USER=
   DB_PASSWORD=

   # Redis (optional)
   REDIS_HOST=
   REDIS_PORT=

   # Application
   PORT=
   NODE_ENV=
   ```

4. **Database setup**

   ```bash
   # Create database
   createdb railway_db

   # Migrations will run automatically in production
   # For development, you can run them manually if needed
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   - API: `http://localhost:3000`
   - Swagger UI: `http://localhost:3000/api/v1/swagger-html`

## 📚 API Documentation

### Core Endpoints

#### Stations

```http
POST   /stations              # Create station
GET    /stations              # Get all stations
GET    /stations/:code        # Get station by code
```

#### Trains

```http
POST   /trains                     # Create train
GET    /trains/:trainNumber        # Get train by number
PATCH  /trains/:trainNumber/add-wagons     # Add wagons
PATCH  /trains/:trainNumber/remove-wagons  # Remove wagons
```

#### Trips

```http
POST   /trips                 # Create trip
GET    /trips/search          # Search trips by route and date
```

### Example Requests

**Create Station:**

```json
POST /stations
{
  "name": "Київ-Пасажирський",
  "code": 2200001
}
```

**Create Train:**

```json
POST /trains
{
  "trainNumber": "001Л",
  "wagons": ["01К", "02П", "03Л"]
}
```

**Search Trips:**

```http
GET /trips/search?departureStationCode=2200001&arrivalStationCode=2200002&date=2024-12-25
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
PORT=3000
```

## 🔍 Validation Rules

The API implements strict validation following Ukrainian railway standards:

- **Station Names**: Minimum 3 characters, Cyrillic letters, numbers, hyphens, apostrophes
- **Station Codes**: 7-digit numbers starting with "22" (2200000-2299999)
- **Train Numbers**: 3 digits + Cyrillic letter (e.g., "001Л")
- **Wagon Format**: 2 digits + class letter (01К, 02П, 03Л)
- **Time Validation**: Arrival time must be after departure time
- **Route Logic**: Departure and arrival stations cannot be identical

## 🎯 Technical Highlights

### Database Design

- **Referential Integrity** - Foreign key constraints ensure data consistency
- **Indexing Strategy** - Optimized indexes for common query patterns
- **Raw SQL** - Direct SQL queries for maximum performance and control

### Caching Strategy

- **Redis Integration** - Primary cache with fallback to in-memory
- **Configurable TTL** - 60-second cache expiration
- **Cache Keys** - Structured naming for easy management

### Error Handling

- **Validation Pipes** - Input sanitization and validation
- **Database Error Handling** - Graceful handling of constraint violations

## 👨‍💻 Developer

**Anton Petrenko**

- GitHub: [GitHub profile](https://github.com/mantr88)
- LinkedIn: [https://www.linkedin.com/in/ant-petrenko/](https://www.linkedin.com/in/ant-petrenko/)
- Email: paa2017sh@gmail.com

---

_Built with ❤️ using NestJS, PostgreSQL, and modern backend practices_
