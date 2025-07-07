FROM node:24-bullseye

WORKDIR /app

# Install system dependencies for sharp
RUN apt-get update && apt-get install -y \
  libvips-dev \
  build-essential \
  python3

# Enable Yarn (via Corepack)
RUN corepack enable

# Copy package files and install dependencies
COPY package.json ./
RUN yarn install

# Copy the rest of the app
COPY . .

EXPOSE 3000
CMD ["yarn", "dev"] # or whatever your start command is
