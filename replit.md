# Sistema de Controle do Semestre

## Overview

The Sistema de Controle do Semestre is a comprehensive academic management web application designed specifically for medical students. It centralizes and optimizes academic management by providing a clear view of progress and pending tasks. The system integrates fixed weekly class schedules with dynamic study agendas, helping students manage their high academic workload efficiently.

The application features a modern React-based frontend with a clean, medical-themed UI using shadcn/ui components, backed by an Express.js REST API with PostgreSQL database storage via Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Design System**: Custom medical-themed color scheme with neutral base tones

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database interactions
- **Storage Strategy**: Modular storage interface supporting both in-memory (development) and database persistence
- **API Design**: RESTful endpoints following resource-based URL patterns
- **Validation**: Zod schemas shared between frontend and backend

### Database Design
The application uses a PostgreSQL database with four main entities:
- **Subjects**: Core academic disciplines with color coding and semester tracking
- **Classes**: Fixed weekly schedule entries with day/time slots and class types
- **Tasks**: Dynamic study items with status tracking and optional due dates
- **Grades**: Academic performance records with weighted scoring

Key relationships include subject-to-classes (one-to-many), subject-to-tasks (one-to-many), and subject-to-grades (one-to-many), enabling comprehensive academic tracking per discipline.

### Development Architecture
- **Monorepo Structure**: Shared schema definitions between client and server
- **Hot Reload**: Vite-powered development with runtime error overlays
- **Type Safety**: End-to-end TypeScript with shared type definitions
- **Build Process**: Separate client (Vite) and server (esbuild) build pipelines

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18+ with React DOM and modern hooks
- **Build Tools**: Vite for frontend bundling, esbuild for server compilation
- **TypeScript**: Full TypeScript support across the entire codebase

### Database & ORM
- **PostgreSQL**: Primary database engine via Neon Database serverless
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Database Migrations**: Drizzle Kit for schema management and migrations

### UI Component System
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide Icons**: Modern icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant API for component styling

### State Management & Data Fetching
- **TanStack Query**: Powerful data synchronization for React applications
- **Form Management**: React Hook Form for performant, flexible forms
- **Validation**: Zod for runtime type checking and validation schemas

### Development Tools
- **Replit Integration**: Custom Replit plugins for development environment
- **Date Utilities**: date-fns for robust date manipulation and formatting
- **Session Management**: Connect-pg-simple for PostgreSQL session storage (when needed)

### Styling & Theming
- **PostCSS**: CSS processing with Autoprefixer
- **CSS Variables**: Dynamic theming system with semantic color tokens
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints