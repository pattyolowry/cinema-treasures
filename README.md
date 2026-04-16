# Cinema Treasures

Cinema Treasures is a full-stack film club app with a React + TypeScript frontend and an Express + MongoDB backend. It tracks watched films, club ratings, all-time favorites, and annual awards.

## App Routes

- `/` Landing page
- `/about` About page for the club
- `/history` Film log (view + authenticated add/edit/delete)
- `/treasure-trove` Ranked all-time entries (view + authenticated add/edit/delete)
- `/ctcstm-scale` CTCSTM rating legend (1-10)
- `/awards` Yearly awards and nominees

## Architecture

- Monorepo with npm workspaces:
  - `frontend`: React 19, Vite, TypeScript, React Router, React Query, Tailwind
  - `backend`: Express, TypeScript, Mongoose, JWT auth, Zod validation
- Root orchestration:
  - `npm run dev` starts frontend and backend together
  - `npm run frontend` starts frontend only
  - `npm run backend` starts backend only
- Frontend calls backend via these API paths:
  - `/api/users/login`
  - `/api/history`
  - `/api/treasures`
  - `/api/awards`

## Data + Auth Behavior

- `history` and `treasures` are persisted in MongoDB through the backend API.
- `awards` are fetched from the backend
- Read access is public for history, treasures, and awards.
- Create/update/delete for history and treasures requires a valid bearer token.

## Run Locally

### Prerequisites

- Node.js
- npm
- A reachable MongoDB instance

### Install

```bash
npm install
```

### Backend Environment Variables

Create `backend/.env` with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3003
```

### Start Development

```bash
npm run dev
```

Default local behavior:

- frontend: Vite on `http://localhost:3000`
- backend: configured by `PORT` (recommended `3003` with current proxy)

### Useful Commands

```bash
# Frontend only
npm run frontend

# Backend only
npm run backend

# Frontend build
npm run build -w frontend

# Frontend preview
npm run preview -w frontend

# Frontend type check
npm run lint -w frontend
```
