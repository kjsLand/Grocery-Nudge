# --- deps: install dependencies (needs build tools for better-sqlite3) ---
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: build the Next.js app ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- runner: small final image, just what's needed to run ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Your current "database" is JSON files written at runtime — make sure the
# directory exists and is writable by the app user.
COPY --from=builder --chown=nextjs:nodejs /app/lib/db ./lib/db

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
