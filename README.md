# The Morning Dispatch

A backend-powered news aggregation platform that collects, normalizes, and stores news articles from external news providers.

## Overview

The Morning Dispatch is designed as a news aggregation system rather than a traditional CMS. Instead of manually creating articles, the backend fetches news from external sources, normalizes the data into a consistent format, and stores it in MongoDB for fast retrieval.

Current implementation uses NewsAPI as the news provider and supports article ingestion from BBC News.

## Features

- NewsAPI integration
- Automated article normalization
- MongoDB persistence
- Duplicate article prevention
- Source-based ingestion architecture
- REST API backend with Express
- Scalable service-layer architecture

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Axios
- Dotenv

### External Services

- NewsAPI.org

---

## Project Structure

```text
src/
├── db/
│   └── db.js
│
├── models/
│   └── article.model.js
│
├── routes/
│   └── article.routes.js
│
├── services/
│   └── news.service.js
│
├── middlewares/
│   └── error.middleware.js
│
└── app.js

server.js
```

---

## Article Schema

Each article is stored as normalized metadata:

```javascript
{
  title,
  description,
  url,
  imageUrl,
  source,
  sourceSlug,
  topic,
  publishedAt,
  fetchedAt,
  sourceArticleId
}
```

### Important Fields

#### sourceArticleId

A unique hash generated from:

```text
title + publishedAt + sourceSlug
```

Used to prevent duplicate articles from being inserted into the database.

#### publishedAt

Original publication timestamp from the news provider.

#### fetchedAt

Timestamp indicating when the article was ingested into The Morning Dispatch.

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd the-morning-dispatch
```

### Install Dependencies

```bash
npm install
```

### Create Environment Variables

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

NEWS_API_KEY=your_newsapi_key
```

---

## Running the Project

Development Mode

```bash
npm run dev
```

Production Mode

```bash
npm start
```

---

## Current Workflow

```text
NewsAPI
   ↓
Fetch Articles
   ↓
Normalize Data
   ↓
Generate Unique IDs
   ↓
Store in MongoDB
   ↓
Serve via API
```

---

## Duplicate Prevention

The system prevents duplicate articles using a unique `sourceArticleId`.

When an article already exists:

```text
Insert skipped
Application continues running
```

This ensures the ingestion process can run repeatedly without polluting the database.

---

## Current Status

Implemented:

- MongoDB integration
- Article schema redesign
- NewsAPI integration
- BBC News ingestion
- Data normalization
- Duplicate prevention
- Service-layer architecture

Planned:

- Multi-source ingestion
  - BBC News
  - CNN
  - Reuters
  - Fox News

- Scheduled ingestion using cron jobs

- Topic-based news feeds

- Perspective comparison using LLMs

- Cached AI-generated summaries

---

## License

MIT License