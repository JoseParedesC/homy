FROM node:20-slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN npm ci && npm run build
ENV NODE_ENV=production
# Aplica migraciones y arranca (Railway inyecta PORT y DATABASE_URL)
CMD ["sh","-c","npx prisma migrate deploy --schema prisma/schema.prisma && node dist/main"]
