# Stage 1: Build the Angular application
FROM node:22.3.0 as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:1.27
COPY --from=build /app/dist/my-angular /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
