/**
 * Main types export
 * Exports both custom and generated types for the application
 * 
 * This file is SAFE from orval regeneration - custom types are protected
 */

// Custom types (business logic, UI components, etc.) - SAFE from orval
export * from './custom';

// Generated types (API responses, auto-generated from OpenAPI) - orval outputs to ./generated/
export * from './generated';
