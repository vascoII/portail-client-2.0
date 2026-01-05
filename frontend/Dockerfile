
FROM node:20

LABEL maintainer="Techem Portail Client"

WORKDIR /usr/src/frontend

# Install dependencies separately for better caching
COPY frontend/package.json frontend/package-lock.json* ./

RUN npm install

# Copy the rest of the frontend source code
COPY frontend/. .

# Expose Next.js dev/prod port
EXPOSE 3000

# Default command: start Next.js in dev mode
CMD ["npm", "run", "dev"]


