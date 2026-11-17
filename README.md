# Blog API (Notes from the Terminal)

A monorepo with three apps for The Odin Project's Blog API assignment:

- **api/**: Express + Prisma + PostgreSQL REST API (no HTML).
- **reader/**: React (Vite) public site for reading and commenting. Port 5173.
- **author/**: React (Vite) private dashboard for writing and managing posts. Port 5174.

## Folder tree

```
blog-api/
├── README.md
├── .gitignore
├── api/
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma      # User, Post, Comment models
│   │   ├── migrations/        # created by `prisma migrate dev`
│   │   └── seed.js            # creates the author "maria"
│   └── src/
│       ├── app.js             # Express app, CORS, routes
│       ├── server.js          # starts the server
│       ├── lib/               # prisma client, jwt, passwords, errors
│       ├── middleware/        # auth, validate, error-handler
│       ├── controllers/       # post, comment, auth
│       └── routes/            # public, auth, admin
├── reader/
│   ├── .env.example
│   ├── package.json
│   └── src/                   # pages, components, styles
└── author/
    ├── .env.example
    ├── package.json
    └── src/                   # pages, lib (api, auth, format), styles
```

## Requirements

- Node.js 18 or newer
- PostgreSQL 14 or newer (local, or a hosted one such as Neon, Supabase or Railway)

## 1. Set up the API

```bash
cd api
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Edit `.env`:
- `DATABASE_URL`: your Postgres connection string.
- `JWT_SECRET`: a long random string. Make one with
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `SEED_AUTHOR_PASSWORD`: the password for the seed author `maria`.
- `CORS_ALLOWED_ORIGINS`: the reader and author addresses (already set for local use).

Then run:

```bash
npm install
npx prisma migrate dev --name init   # creates the tables
npm run db:seed                      # creates the author maria and sample posts
npm run dev                          # starts the API on http://localhost:4000
```

To deploy the migrations later, use `npm run db:deploy` (it does not create new migration files).

## 2. Set up the reader site

```bash
cd reader
cp .env.example .env
npm install
npm run dev                          # http://localhost:5173
```

## 3. Set up the author dashboard

```bash
cd author
cp .env.example .env
npm install
npm run dev                          # http://localhost:5174
```

Log in with `maria` and the password from `SEED_AUTHOR_PASSWORD`.

## API routes

| Method | Route | Who | What it does |
|---|---|---|---|
| GET | /posts | public | Published posts only |
| GET | /posts/:id | public | One post |
| GET | /posts/:id/comments | public | Comments on a post |
| POST | /posts/:id/comments | public | Add a comment (name + content) |
| POST | /auth/login | public | Returns a JWT |
| GET | /admin/posts | author | All posts, published or not |
| POST | /posts | author | Create a post |
| PUT | /posts/:id | author | Replace a post (title and content needed) |
| DELETE | /posts/:id | author | Delete a post |
| PATCH | /posts/:id/publish | author | Toggle published or draft |
| PUT | /comments/:id | author | Edit a comment |
| DELETE | /comments/:id | author | Delete a comment |

## Curl examples

Start the API first (`npm run dev` in `api/`).

```bash
# Public
curl http://localhost:4000/posts
curl http://localhost:4000/posts/1
curl http://localhost:4000/posts/1/comments
curl -X POST http://localhost:4000/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{"authorName":"Juan","content":"Great read!"}'

# Log in (copy the token from the "token" field)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"maria","password":"YOUR_PASSWORD"}'

# Author routes (replace YOUR_TOKEN)
curl http://localhost:4000/admin/posts -H "Authorization: Bearer YOUR_TOKEN"
curl -X POST http://localhost:4000/posts -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My new post","content":"Hello from curl.","published":false}'
curl -X PUT http://localhost:4000/posts/1 -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","content":"Updated body."}'
curl -X PATCH http://localhost:4000/posts/1/publish -H "Authorization: Bearer YOUR_TOKEN"
curl -X DELETE http://localhost:4000/posts/1 -H "Authorization: Bearer YOUR_TOKEN"
curl -X PUT http://localhost:4000/comments/1 -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Edited comment."}'
curl -X DELETE http://localhost:4000/comments/1 -H "Authorization: Bearer YOUR_TOKEN"

# Without a token, author routes must return 401
curl -i http://localhost:4000/admin/posts
```

## Deployment notes

**API on a PaaS (Railway, Render, Fly.io):**
1. Create a PostgreSQL database and copy its connection URL into `DATABASE_URL`.
   Add `?sslmode=require` if the provider asks for it.
2. Set `JWT_SECRET`, `NODE_ENV=production`, and `CORS_ALLOWED_ORIGINS` to your
   live front-end addresses, for example `https://reader.example.com,https://author.example.com`.
3. Build command: `npm install && npx prisma generate`
4. Start command: `npm run db:deploy && npm start`
5. Run the seed once from your computer with the live `DATABASE_URL`: `npm run db:seed`,
   then change the seed password.

**Front-ends on Netlify or Vercel (each app is its own site):**
1. Set the base folder to `reader` or `author`.
2. Build command: `npm run build`. Publish folder: `dist`.
3. Set `VITE_API_URL` to the live API address (for example `https://api.example.com`).
4. Add a rewrite so deep links work: send all paths to `/index.html`
   (Netlify: a `_redirects` file with `/* /index.html 200`; Vercel: a `vercel.json` rewrite).

