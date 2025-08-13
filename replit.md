# Meal Planning Application

## Overview

This is a comprehensive meal planning web application built with a modern full-stack architecture. The application allows users to manage dishes, plan meals on a calendar, and generate shopping lists. It features a mobile-first design with bottom navigation and supports both weekly and monthly calendar views for meal planning.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using **React 18** with **TypeScript** and **Vite** as the build tool. The application uses:
- **Wouter** for client-side routing instead of React Router for lightweight navigation
- **TanStack Query (React Query)** for server state management and caching
- **React Hook Form** with **Zod** validation for form handling
- **Tailwind CSS** with **shadcn/ui** component library for styling
- **date-fns** for date manipulation and formatting with Russian locale support

The UI follows a mobile-first approach with:
- Bottom navigation bar for main app sections (Planning, Dishes, Shopping)
- Calendar views supporting both week and month layouts
- Responsive design optimized for mobile devices
- Custom CSS variables for theming with meal-specific colors (breakfast, lunch, dinner)

### Backend Architecture
The server uses **Express.js** with **TypeScript** running in ESM mode. Key architectural decisions:
- **In-memory storage** for development with a clean interface (`IStorage`) that can be easily swapped for database implementations
- **RESTful API** design with proper HTTP status codes and error handling
- **Zod schemas** for request validation shared between client and server
- **Middleware-based logging** for API requests with response tracking
- **Vite integration** for development with HMR support

### Data Storage Solutions
Currently implements an in-memory storage system with:
- **Drizzle ORM** configured for PostgreSQL (ready for production database)
- **Shared schema definitions** using Drizzle with Zod integration
- **Type-safe database operations** with proper TypeScript interfaces
- **Migration support** configured through drizzle-kit

The data model includes:
- **Dishes**: Name, description, meal type, and JSON-stored ingredients
- **Meal Events**: Calendar entries linking dishes to specific dates and meal types
- **Shopping List Items**: Name, quantity, unit, and completion status

### Authentication and Authorization
Currently, the application does not implement authentication, running as a single-user system. The architecture is prepared for future auth integration through:
- **Session-based approach** with connect-pg-simple for PostgreSQL session storage
- **Cookie-based sessions** configured in the storage setup
- **Protected API routes** structure ready for auth middleware

### Component Architecture
The React components follow a clear separation of concerns:
- **Page components** handle data fetching and high-level state
- **Feature components** manage specific functionality (calendar, forms, modals)
- **UI components** from shadcn/ui for consistent design
- **Custom hooks** for mobile detection and toast notifications
- **Shared utilities** for date formatting and common functions

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for Neon database
- **drizzle-orm** and **drizzle-kit**: Type-safe ORM and migration tools
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation library with locale support

### UI and Form Libraries
- **@radix-ui/react-***: Accessible headless UI components (dialogs, dropdowns, forms)
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant creation
- **clsx**: Conditional className utility

### Development Tools
- **vite**: Build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **@replit/vite-plugin-***: Replit-specific development plugins
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js

### Build and Production
- **esbuild**: Fast JavaScript bundler for server code
- **postcss**: CSS processing with Tailwind
- **autoprefixer**: CSS vendor prefix automation

The application is designed to be easily deployable on platforms like Replit, with development and production build configurations optimized for different environments.