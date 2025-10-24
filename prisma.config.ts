// There is no "prisma/config" module; Prisma configuration is usually done in schema.prisma or via CLI.
// If you need to access environment variables, use process.env directly.

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
