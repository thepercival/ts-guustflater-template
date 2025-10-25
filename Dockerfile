# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.18.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Create a stage for installing production dependecies.
FROM base AS deps

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Create a stage for building the application.
FROM deps AS build

# Download additional development dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM nginx:stable-alpine AS final

# Forward request and error logs to Docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*


# Copy built application from build stage
COPY --chown=nginx:nginx --from=build /usr/src/app/dist /usr/share/nginx/html

# Set correct permissions for web content
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
#COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Set correct permissions for nginx configs
RUN chown -R nginx:nginx /etc/nginx/conf.d \
    && chmod -R 755 /etc/nginx/conf.d \
    && chown -R nginx:nginx /etc/nginx/nginx.conf \
    && chmod 644 /etc/nginx/nginx.conf

# Create nginx temporary directories and ensure ownership (must be done as root)
RUN mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx /var/run/nginx \
    && chmod -R 700 /var/cache/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

# Switch to non-root nginx user
USER nginx

# Expose HTTP port
EXPOSE 8080

# Use nginx command like official image
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
