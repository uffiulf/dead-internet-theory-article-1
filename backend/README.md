# Backend Server

Backend API server for the Dead Internet Theory project.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

## Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the PORT specified in `.env`).

## Build

Build for production:
```bash
npm run build
```

Run the production server:
```bash
npm start
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/hello` - Example endpoint

