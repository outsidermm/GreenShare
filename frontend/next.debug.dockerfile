
FROM node:24-alpine
# Set the working directory
WORKDIR /app/frontend
# Copy only package.json and lock file(s) first to leverage Docker layer caching
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of your source code
COPY . .

ENV NODE_ENV=development
ENV PORT=3000
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Expose port 3000 (Next.js default dev port)
EXPOSE 3000

# By default, run Next.js in development mode
CMD ["npm", "run", "dev"]