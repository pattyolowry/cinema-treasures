# Cinema Treasures

Cinema Treasures is a full-stack film club app with a React + TypeScript frontend and an Express + MongoDB backend. It tracks watched films, club ratings, ranked favorites, annual awards, and members-only artifacts.

## Project Structure

- `frontend/`: React 19, Vite, TypeScript, React Router, React Query, Tailwind CSS
- `backend/`: Express, TypeScript, Mongoose, JWT auth, Zod validation, AWS integrations
- Root `package.json`: metadata only; the frontend and backend are installed and run separately

## Frontend Routes

### Public pages

- `/` Landing page
- `/about` About page for the club
- `/history` Film log
- `/treasure-trove` Ranked all-time entries
- `/ctcstm-scale` CTCSTM rating legend
- `/awards` Yearly awards and nominees

### Members-only page

- `/artifacts` Club archive of posts, essays, and presentations

## Backend API

The backend mounts routes directly at the root, without an `/api` prefix.

- `GET /health`: health check
- `POST /users/login`: user login
- `POST /users`: create a user, admin-only
- `GET|POST|PUT|DELETE /history`: film log records
- `GET|POST|PUT|DELETE /treasures`: treasure trove records
- `GET /awards`: awards data
- `GET|POST|PUT|DELETE /blogs`: members-only artifact records
- `GET /tmdb/search/movie`: authenticated TMDB search
- `GET /tmdb/movie/:id`: authenticated TMDB movie details

## Auth and Data Behavior

- `history` and `treasures` are public to read and require a bearer token for create, update, and delete actions.
- `awards` are public to read. Authenticated users can receive categories that are hidden from public responses.
- `blogs` back the `/artifacts` page and require authentication for both reads and writes.
- Login state is stored in the frontend and sent to the backend as a bearer token when needed.

## Local Development

### Prerequisites

- Node.js
- npm
- A reachable MongoDB instance

### 1. Configure environment variables

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3003

# Optional integrations
TMDB_API_KEY=your_tmdb_api_bearer_token
AWS_REGION=your_aws_region
SQS_QUEUE_URL=your_sqs_queue_url

# Test configuration
TEST_MONGODB_URI=your_test_mongodb_connection_string
TEST_JWT_SECRET=your_test_jwt_secret
```

Create `frontend/.env.development`:

```env
VITE_BACKEND_URL=http://localhost:3003
VITE_BLOG_IMAGE_BASE_URL=https://your-blog-image-host
```

### 2. Install dependencies

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 3. Start the apps

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3003`

The frontend builds its API base URL from `VITE_BACKEND_URL`.

## Environment Variables

### Frontend

- `VITE_BACKEND_URL`: base URL for all frontend API requests
- `VITE_BLOG_IMAGE_BASE_URL`: base URL used to render stored artifact images

### Backend required

- `MONGODB_URI`: MongoDB connection string for development and production
- `JWT_SECRET`: signing secret for login tokens
- `PORT`: backend port, defaults to `3003`

### Backend optional integrations

- `TMDB_API_KEY`: bearer token for The Movie Database API
- `AWS_REGION`: region for S3 and SQS clients
- `SQS_QUEUE_URL`: queue used when new movies are added through history or treasures

### Backend test configuration

- `TEST_MONGODB_URI`: MongoDB connection string used when `NODE_ENV=test`
- `TEST_JWT_SECRET`: JWT secret used when `NODE_ENV=test`

## Commands

### Backend

```bash
cd backend
npm run dev
npm test
npm run build
npm run lint
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run lint
```

## Integrations and Operations

### MongoDB

- The backend reads and writes application data directly through Mongoose models.
- Core persisted data includes movies, log entries, treasure trove entries, awards, blogs, and users.

### TMDB + SQS movie enrichment

- When a new history or treasure record is created, the backend sends an SQS message for the linked movie.
- A background worker processes those messages and fetches additional metadata from TMDB.
- Enriched fields include overview, TMDB rating, genres, language, directors, MPAA rating, and normalized origin country data.

These integrations describe current production behavior, but they are not required for the minimal app boot unless you are exercising those features.

### Artifact image uploads

- Artifact creation supports an optional authenticated image upload.
- Images are validated in-memory before upload.
- The backend currently enforces a `16:9` aspect ratio.
- Image uploads are limited to `100 KB`.
- Valid images are stored in S3 and later rendered from `VITE_BLOG_IMAGE_BASE_URL`.

### Production deployment

- The backend includes a `Dockerfile` for containerized deployment.
- The backend build pipeline compiles TypeScript output before starting the server in production-oriented environments.
