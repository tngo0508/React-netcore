# React + .NET

A React (Vite + TypeScript) frontend with an ASP.NET Core Web API backend.

```
src/
├── AppHost/             Aspire AppHost: runs the API and client together
├── ServiceDefaults/     Shared Aspire defaults (OpenTelemetry, health checks, resilience)
├── client/              React 19 + TypeScript (Vite)
├── api/                 .NET 10 Web API (controllers, OpenAPI)
└── ReactNetcore.slnx    Solution file
```

## Prerequisites

- Node.js 20+
- .NET 10 SDK
- A trusted HTTPS dev certificate (`dotnet dev-certs https --trust`)

## Running locally with Aspire (recommended)

From `src/`:

```sh
dotnet run --project AppHost
```

This starts the API and the Vite dev server (installing npm packages if
needed) and opens the Aspire dashboard, where you can find each app's URL,
logs, traces, and metrics. The client waits for the API's `/health` check
before starting, and its `/api` proxy is pointed at the API automatically.

## Running without Aspire

Start the API and the client in two terminals from `src/`:

```sh
dotnet run --project api --launch-profile http   # http://localhost:5131
```

```sh
cd client
npm install
npm run dev                                      # http://localhost:5173
```

During development, Vite forwards any request to `/api/*` to the API (see
`client/vite.config.ts`), so the client calls relative paths like
`/api/weatherforecast` and no CORS configuration is needed.

The OpenAPI document is served at `http://localhost:5131/openapi/v1.json` in
the Development environment.

## Building

```sh
cd src/client && npm run build   # outputs to client/dist
dotnet build src                 # builds the solution
```
