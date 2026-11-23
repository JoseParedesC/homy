FROM node:20-slim AS build
WORKDIR /app
COPY . .
RUN npm ci -w apps/web --ignore-scripts
# Se fijan en build: defínelas como variables del servicio en Railway
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
RUN npm -w apps/web run build
FROM nginx:1.27-alpine
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
