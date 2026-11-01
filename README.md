# React + .NET

A React (Vite + TypeScript) frontend with an ASP.NET Core Web API backend.
The frontend is an interactive study aid for the AZ-900 (Azure Fundamentals)
exam.

## Study tools

- **Exam map** ([Cytoscape.js](https://js.cytoscape.org/)): the three exam
  areas drawn as transit lines, with every topic as a station. Select a station
  for a summary and an exam tip, follow dashed transfers to related topics on
  other lines, and mark stations you know to track progress per line. In
  **Find the station** mode, you get a description and tap the station it
  matches.
- **Resource hierarchy** ([React Flow](https://reactflow.dev/)): connect
  management groups, subscriptions, resource groups, and resources into the
  correct tree. Once it's right, assign a policy at any scope and watch it
  pass down to everything beneath.
- **Who is responsible** (React Flow): drag the ten duties from the shared
  responsibility model into You, Shared, or Microsoft for on-premises, IaaS,
  PaaS, or SaaS, then check your answer.

Progress on the exam map is saved in your browser's local storage.

```
src/
├── AppHost/             Aspire AppHost: runs the API and client together
├── ServiceDefaults/     Shared Aspire defaults (OpenTelemetry, health checks, resilience)
├── client/              React 19 + TypeScript (Vite)
├── api/                 .NET 10 Web API (controllers, OpenAPI)
└── ReactNetcore.slnx    Solution file
```

## Running locally

### 1. Install the prerequisites

| Tool | Version | Check with |
| --- | --- | --- |
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0 | `dotnet --version` |
| [Node.js](https://nodejs.org/) (includes npm) | 20 or later | `node --version` |

### 2. Clone the repo

```sh
git clone https://github.com/tngo0508/React-netcore.git
cd React-netcore/src
```

All commands below are run from `src/`.

### 3. Trust the HTTPS development certificate (first time only)

Aspire serves its dashboard over HTTPS, so it needs a trusted local
certificate:

```sh
dotnet dev-certs https --trust
```

On macOS and Windows this asks for your password or shows a confirmation
prompt. You only need to do it once per machine.

### 4. Start the app

You can run everything with Aspire (recommended) or start the API and client
yourself.

#### Option A: Aspire (one command)

```sh
dotnet run --project AppHost
```

This:

1. Builds and starts the API.
2. Waits for the API's `/health` check to pass.
3. Installs the client's npm packages if needed and starts the Vite dev server,
   with its `/api` proxy pointed at the API.
4. Opens the Aspire dashboard in your browser.

The terminal prints a dashboard login link like
`https://localhost:17161/login?t=...`. If the browser doesn't open on its own,
open that link (the token in it logs you in).

In the dashboard, the **Resources** page lists `api` and `client` with their
URLs. Aspire picks the client's port each run, so open the client from the
link shown there. The dashboard also shows each app's logs, traces, and
metrics.

Press `Ctrl+C` in the terminal to stop everything.

#### Option B: Without Aspire (two terminals)

Terminal 1, the API:

```sh
dotnet run --project api --launch-profile http
```

The API listens on `http://localhost:5131`.

Terminal 2, the client:

```sh
cd client
npm install    # first time, or after dependencies change
npm run dev
```

Open `http://localhost:5173`. Press `Ctrl+C` in each terminal to stop.

### 5. Check that it works

The home page opens on the exam map. The study tools run entirely in the
browser and don't call the API yet.

To check the API, call it directly:

| URL (Option B ports) | What it is |
| --- | --- |
| `http://localhost:5131/api/weatherforecast` | Sample endpoint |
| `http://localhost:5131/openapi/v1.json` | OpenAPI document (Development only) |
| `http://localhost:5131/health` | Health check (Development only) |

`src/api/Api.http` has a ready-made request you can send from VS Code (REST
Client extension), Visual Studio, or Rider.

### How the client reaches the API

The client calls relative paths like `/api/weatherforecast`. In development,
Vite forwards every `/api/*` request to the API (see `client/vite.config.ts`),
so no CORS setup is needed. Under Aspire, the API's address is passed in
automatically; without Aspire, the proxy uses `http://localhost:5131`.

### Troubleshooting

- **The dashboard shows a certificate warning or won't load.** Run
  `dotnet dev-certs https --trust` again and restart the AppHost.
- **Address already in use on port 5131 or 5173.** Another process is using
  that port. Stop it, or find it with `lsof -i :5131` (macOS/Linux).
- **You want plain HTTP for the dashboard.** Run
  `dotnet run --project AppHost --launch-profile http`; the dashboard is then
  at `http://localhost:15177`.

## Building

```sh
cd src/client && npm run build   # outputs to client/dist
dotnet build src                 # builds the solution
```
