# Medic Protocol Pal

## Overview

Medic Protocol Pal is a web application designed to provide medical first responders with fast and easy access to established medical protocols. The application serves as a digital reference tool for paramedics, EMTs, and medical professionals who need quick access to accurate protocols in high-stress situations.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful endpoints with JSON responses

### Project Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared schemas and types
├── migrations/      # Database migration files
└── attached_assets/ # Project documentation
```

## Key Components

### Database Schema
The application uses three main entities:

1. **Users**: Stores medical professional information including license numbers and roles
2. **Medications**: Comprehensive medication database with dosage information, contraindications, and alert levels
3. **User Favorites**: Junction table for bookmarking frequently used medications

### Authentication System
- Simple email-based authentication without passwords (simplified for demo)
- User roles support (user, admin) for future permissions
- Local storage persistence for user sessions

### Medication Management
- CRUD operations for medication database
- Search functionality by name, classification, or alert level
- Alert level categorization (HIGH_ALERT, ELDER_ALERT, STANDARD)
- Favorites system for quick access to commonly used medications

### User Interface
- Responsive design optimized for mobile and desktop use
- High-contrast color scheme for various lighting conditions
- Touch-friendly interface suitable for one-handed operation
- Modal-based forms for medication entry and editing

## Data Flow

1. **Authentication Flow**: Users sign in with email, session stored locally
2. **Medication Retrieval**: Frontend queries API with search/filter parameters
3. **Data Persistence**: All medication data stored in PostgreSQL via Drizzle ORM
4. **Real-time Updates**: React Query manages cache invalidation and refetching

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives for accessibility
- **Validation**: Zod schemas shared between client and server
- **Build Tools**: Vite for frontend, esbuild for backend production builds

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit environment
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: Full TypeScript coverage across frontend and backend

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend development
- tsx for running TypeScript server in development
- Shared type definitions ensure consistency

### Production
- Vite builds optimized frontend bundle
- esbuild creates Node.js-compatible server bundle
- Static file serving through Express in production
- Environment-based configuration for database connections

### Database Management
- Schema-first approach with Drizzle ORM
- Migration-based database updates
- Connection pooling through Neon serverless

## Changelog

- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.