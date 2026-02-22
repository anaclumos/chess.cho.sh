# Stage 1: Build Stockfish 17 from source
FROM ubuntu:22.04 AS stockfish-builder

RUN apt-get update && apt-get install -y \
    git \
    g++ \
    make \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch sf_17 https://github.com/official-stockfish/Stockfish.git /stockfish

WORKDIR /stockfish/src

RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
      SF_ARCH=armv8-dotprod; \
    else \
      SF_ARCH=x86-64-modern; \
    fi && \
    make -j$(nproc) net && \
    make -j$(nproc) build ARCH=$SF_ARCH

# Stage 2: Build the Next.js app
FROM oven/bun:1 AS app-builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code (excluding .dockerignore paths)
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Stage 3: Production runner
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy Stockfish binary
COPY --from=stockfish-builder /stockfish/src/stockfish /usr/local/bin/stockfish
RUN chmod +x /usr/local/bin/stockfish

# Copy Next.js standalone output
COPY --from=app-builder /app/.next/standalone ./
COPY --from=app-builder /app/.next/static ./.next/static
COPY --from=app-builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
