FROM node:20-slim
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN npm ci -w apps/api && npm -w apps/api run build
ENV NODE_ENV=production
# Aplica migraciones y arranca (Railway inyecta PORT y DATABASE_URL)
CMD ["sh","-c","npx prisma migrate deploy --schema apps/api/prisma/schema.prisma && node apps/api/dist/main"]
