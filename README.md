# Cinema Treasures

Cinema Treasures is a React + TypeScript web app for a film club. It tracks watched films, club ratings, all-time favorites, and annual awards.

## What The App Includes

### Routes

- `/` Landing page for the club
- `/history` Film Log with watched titles, ratings, and detail modal
- `/treasure-trove` Ranked all-time entries with title/member filters
- `/ctcstm-scale` CTCSTM rating legend (1 to 10)
- `/awards` Yearly awards and nominees

### Member Session

The "Member Login" flow is an in-app member selector (not external auth). Signing in unlocks add/edit/delete controls in the Film Log and Treasure Trove sections.

## Run Locally

### Prerequisites

- Node.js
- npm

### Setup

```bash
npm install
```

### Start Dev Server (port 3000)

```bash
npm run dev
```

### Build Production Bundle

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Check

```bash
npm run lint
```

## Data Behavior

- Movie and awards data is currently seeded from local source files in `src/`.
- Changes made through the UI are held in client-side React state.
- There is no persistent backend storage wired for these edits yet, so data resets on page reload.
