# Placement Management Portal

A college placement portal for students and the placement cell. Administrators manage students, companies, eligibility criteria, applications and offers. Students see upcoming companies, check whether they are eligible, apply, and track their offers.

Based on [placement-management](https://github.com/VarunSAthreya/placement-management) by Varun S Athreya (MIT licence). This version runs as a single Next.js app on Vercel with a Neon PostgreSQL database.

## Accounts

| Role | User ID | Password |
|---|---|---|
| Administrator | `ADMIN` | `Admin@123` |
| Student (demo) | `DEMO` | `DEMO@123` |
| Students | e.g. `1AT21CS001`, `1AT21EC005`, `1AT21ME012` | `Student@123` |

Student IDs follow the pattern `1AT21<branch><number>`. Branch codes are CS, IS, EC, EI, ME, CV and IM, numbered 001–012.

## Stack

- Next.js 12 (pages router), Chakra UI, Apollo Client, ApexCharts
- GraphQL API served from `/api/graphql` (Apollo Server)
- Prisma ORM on PostgreSQL (Neon)

## Deploying on Vercel

1. Import the repository into Vercel. It's detected as a Next.js project.
2. Under **Settings → Environment Variables**, add `DATABASE_URL` with your Neon connection string. The pooled URL is fine.
3. Deploy.

During the build, `scripts/setup-db.js` applies the Prisma migrations and loads the starting data the first time, when the database has no users. Later deploys leave existing data untouched.

Optional variables:

- `JWT_SECRET`: the secret used to sign login tokens. If it isn't set, one is derived from `DATABASE_URL`.
- `DIRECT_URL`: the non-pooled connection string used for migrations. If it isn't set, it's derived from a Neon pooled URL.

## Running locally

```bash
npm install
cp .env.example .env    # then set DATABASE_URL
npm run db:setup        # migrations + initial data
npm run dev             # http://localhost:3000
```

## Security

- Passwords are hashed with bcrypt. Login tokens are signed JWTs (HS256), and a token stops working once its user's password changes.
- Every GraphQL query and mutation has an access rule (`server/graphql/resolvers/index.ts`):
  - Anyone can log in. Every other operation requires being logged in.
  - Students can read only their own records. They can apply to companies, or withdraw, only for themselves.
  - Creating, updating or deleting students, companies and offers, and listing all students, applications or offers, are administrator-only.
  - Lists of applicants attached to a company are visible to administrators only.
- Login errors don't reveal whether a user ID exists.
- Tokens and request data are not written to the logs.
- Security headers are set (frame denial, nosniff, referrer and permissions policy). GraphQL introspection is off in production, and CSRF prevention is on.
