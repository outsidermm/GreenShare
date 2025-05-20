# syntax=docker/dockerfile:1

FROM node:24-alpine

# Set the working directory
WORKDIR /app/frontend

# Copy only package.json and lock file(s) first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

# Expose port 3000 (Next.js default dev port)
EXPOSE 3000

# By default, run Next.js in development mode
CMD ["npm", "run", "dev"]