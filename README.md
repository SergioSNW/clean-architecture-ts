# Clean Architecture TypeScript Project

This is a TypeScript project implementing clean architecture principles.

## Project Structure

- `src/`: Source code
  - `application/`: Application layer (use cases, ports)
  - `domain/`: Domain layer (entities, events, value objects)
  - `infrastructure/`: Infrastructure layer (adapters, HTTP, persistence)
  - `shared/`: Shared utilities (e.g., health checks)
- `test/`: Unit tests
- `main.ts`: Entry point
- `tsconfig.json`: TypeScript configuration
- `vitest.config.ts`: Vitest test configuration
- `package.json`: Dependencies and scripts

## Setup

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Build: `npm run build` (if added)
4. Start: `npm run dev`

## Features Implemented

- Basic health check function in `src/shared/health.ts`
- Unit test for health check in `test/shared/health.spec.ts`
- TypeScript configuration with path aliases
- Vitest for testing

## Development

- Use `npm test` to run tests.
- The project uses Vitest for testing and TypeScript for type safety.
