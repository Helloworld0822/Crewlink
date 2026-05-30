# Multi-stage build: build the Vite React app, then serve with nginx
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY public ./public
COPY src ./src
RUN npm ci
RUN npm run build

FROM nginx:1.25-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
