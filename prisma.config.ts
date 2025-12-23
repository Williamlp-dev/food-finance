import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // @ts-expect-error - Direct URL is required by CLI but types are missing it
    directUrl: env("DIRECT_URL"),
  },
});
