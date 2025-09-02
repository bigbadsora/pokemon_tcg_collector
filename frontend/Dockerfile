# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifest(s). The glob works whether or not package-lock.json exists.
COPY package*.json ./

# Install deps: use npm ci if lockfile exists, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Copy source and build
COPY . .
RUN npm run build

# --- runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Bring over runtime assets
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
# Ensure package.json has: "start": "next start -p 3000 -H 0.0.0.0"
CMD ["npm","start"]
