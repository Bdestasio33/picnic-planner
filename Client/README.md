# ☀️ Weather Picnic Planner - Client

A modern React application built with Vite, Material-UI, and Tanstack Query for planning picnics based on weather forecasts and historical data.

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and development server
- **Material-UI (MUI) v6** - Modern React component library
- **Tanstack Query v5** - Powerful data synchronization for React
- **Orval** - TypeScript API client and schema generation from OpenAPI/Swagger
- **Zod** - TypeScript schema validation
- **date-fns** - Modern JavaScript date utility library
- **Yarn** - Package manager

## 📋 Features

- **Two Week Forecast Calendar** - Visual calendar with color-coded weather conditions
- **Detailed Weather View** - In-depth weather information for selected dates
- **Historical Data** - 10-year historical weather patterns
- **Type-Safe API Client** - Auto-generated API client and types from OpenAPI specification
- **Smart Caching** - Efficient data fetching and caching with Tanstack Query
- **Schema Validation** - Runtime type validation with Zod schemas
- **Responsive Design** - Works beautifully on desktop and mobile

## 🛠 Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

### Getting Started

1. **Install dependencies:**

   ```bash
   yarn
   ```

2. **Start development server:**

   ```bash
   yarn dev
   ```

3. **Build for production:**

   ```bash
   yarn build
   ```

4. **Preview production build:**
   ```bash
   yarn preview
   ```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
├── services/           # API services and data fetching
│   └── api-client.ts   # Custom Axios instance for Orval
├── types/              # TypeScript type definitions
│   ├── generated/      # Auto-generated types from OpenAPI
│   └── custom/         # Custom type definitions
├── hooks/              # Custom React hooks
│   └── picnicplanner-api/ # Auto-generated Tanstack Query hooks
├── schemas/            # Zod validation schemas
│   └── weather/        # Auto-generated Zod schemas
├── utils/              # Utility functions
├── theme.ts            # MUI theme configuration
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🎨 Theme & Colors

The application uses a custom MUI theme with weather-specific colors:

- **Green (#4CAF50)** - Ideal picnic conditions
- **Orange (#FF9800)** - Fair weather conditions
- **Red (#F44336)** - Poor weather conditions
- **Blue (#2196F3)** - Primary theme color

## 📡 API Integration

The app integrates with the [Open-Meteo API](https://open-meteo.com/) for:

- **14-day weather forecasts**
- **Historical weather data** (10 years)
- **Real-time weather conditions**

### Weather Condition Logic

- **Ideal**: 18-26°C, <20% rain chance, <2mm precipitation
- **Fair**: Moderate conditions between ideal and poor
- **Poor**: <10°C or >30°C, >60% rain chance, >10mm precipitation

## 🔄 API Code Generation

The project uses **Orval** to automatically generate TypeScript API clients and types from the backend's OpenAPI/Swagger specification.

### Generated Code

- **React Query Hooks** - Automatically generated hooks for all API endpoints
- **TypeScript Types** - Full type definitions for requests and responses
- **Zod Schemas** - Runtime validation schemas for type safety
- **Custom Instance** - Uses Axios with custom configuration

### Code Generation Commands

```bash
# Generate API client and types
yarn generate-api

# Start backend server first (required for generation)
cd ../Server && dotnet run
```

### Orval Configuration

The `orval.config.ts` file configures two outputs:

1. **React Query Client** - Generates hooks in `src/hooks/picnicplanner-api/`
2. **Zod Schemas** - Generates validation schemas in `src/schemas/`

Both configurations:

- Pull from `http://localhost:5000/swagger/v1/swagger.json`
- Auto-format generated code with Prettier
- Support tags-split mode for organized file structure

## 🔧 Configuration

### Tanstack Query Settings

- **Stale Time**: 5 minutes
- **Cache Time**: 10 minutes
- **Retry**: 3 attempts
- **Refetch on Focus**: Disabled

### Environment Variables

Currently uses default Open-Meteo API (no API key required).

## 🧪 Testing

### Framework & Tools

- **Vitest** - Fast unit testing with React support
- **React Testing Library** - Component testing utilities
- **JSDOM** - Browser environment simulation
- **User Event** - Realistic user interaction testing

### Test Commands

```bash
# Run tests
npm test

# Run tests with coverage
npm run test-coverage

# Run tests in watch mode (default)
npm test
```

### Coverage Configuration

Tests exclude generated and non-critical files:

- Orval generated code (`hooks/`, `types/generated/`, `schemas/`)
- Entry points (`App.tsx`, `main.tsx`)
- Config files (`services/`, `config/`)
- Styles and assets

**Coverage Thresholds**: 80% (branches, functions, lines, statements)

### Test Structure

```
src/tests/
├── components/     # Component tests
└── utils/          # Utility function tests
```

## 🧪 Development

### Code Quality

- TypeScript for type safety
- ESLint configuration
- Comprehensive test coverage
- Consistent code formatting

### Key Development Commands

```bash
# Start development server
yarn dev

# Generate API client from backend
yarn generate-api

# Run tests with coverage
npm run test-coverage

# Type checking
yarn tsc

# Build for production
yarn build

# Preview production build
yarn preview
```

## 📦 Dependencies

### Core Dependencies

- `react` & `react-dom` - React framework
- `@mui/material` - Material-UI components
- `@emotion/react` & `@emotion/styled` - CSS-in-JS styling
- `@tanstack/react-query` - Data fetching and caching
- `axios` - HTTP client for API requests
- `zod` - TypeScript schema validation
- `date-fns` - Date manipulation utilities

### Development Dependencies

- `vite` - Build tool
- `orval` - API client and type generation
- `@orval/zod` - Zod schema generation plugin
- `typescript` - Type checking
- `@types/*` - TypeScript definitions
- `eslint` - Code linting
- `prettier` - Code formatting

## 🌐 Browser Support

Modern browsers that support ES2020+ features:

- Chrome 80+
- Firefox 72+
- Safari 13.1+
- Edge 80+

## 📈 Performance Optimizations

- **Vite HMR** - Fast hot module replacement
- **Code splitting** - Automatic code splitting with Vite
- **API caching** - Smart caching with Tanstack Query
- **Optimized builds** - Tree shaking and minification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using modern React development tools.
