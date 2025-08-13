# Overview

A real-time GPS tracking application that monitors vehicle locations with live updates and route visualization. The system consists of a React frontend with interactive maps, an Express backend serving as an API proxy, and integration with external GPS tracking services. The application displays real-time vehicle positions, route paths, and tracking statistics through an intuitive dashboard interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Component-based SPA using modern React patterns
- **Vite Build System**: Fast development server and optimized production builds
- **Shadcn/UI Components**: Pre-built UI component library with Radix UI primitives
- **TailwindCSS**: Utility-first styling with custom design system variables
- **Wouter Router**: Lightweight client-side routing
- **TanStack Query**: Server state management with automatic refetching and caching

## Backend Architecture
- **Express Server**: RESTful API serving as a proxy layer
- **TypeScript**: Type-safe server-side development
- **Modular Storage Interface**: Abstracted data layer supporting both in-memory and database implementations
- **API Proxy Pattern**: Forwards GPS tracking requests to external FastAPI service
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

## Data Management
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Real-time Data Flow**: Polling-based updates every 2 seconds for live tracking
- **GeoJSON Format**: Standardized geographic data interchange for mapping
- **Coordinate Transformation**: Automatic conversion between different coordinate systems

## Map Integration
- **Leaflet Maps**: Interactive mapping with OpenStreetMap tiles
- **Dynamic Loading**: Client-side Leaflet loading to avoid SSR issues
- **Real-time Visualization**: Live position updates with route path rendering
- **Custom Markers**: Differentiated markers for start, end, and current positions

## Authentication & Authorization
- **Session-based Auth**: User management system with in-memory storage fallback
- **Secure Password Handling**: Prepared for bcrypt integration
- **User Context**: Centralized authentication state management

# External Dependencies

## Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **FastAPI Service**: External GPS tracking service at `3.7.100.109:55575`
- **Replit Platform**: Development and deployment environment with specialized plugins

## Mapping Services
- **OpenStreetMap**: Tile layer provider for map visualization
- **Leaflet CDN**: External library loading for mapping functionality

## UI Framework
- **Radix UI**: Comprehensive set of accessible component primitives
- **Lucide Icons**: SVG icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

## Development Tools
- **ESBuild**: Fast JavaScript bundling for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **TypeScript Compiler**: Type checking and transpilation