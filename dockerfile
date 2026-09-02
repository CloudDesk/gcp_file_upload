# # Use Node.js 20 as the base image
# FROM node:20

# # Install LibreOffice for document conversion
# RUN apt-get update && apt-get install -y libreoffice && \
#     apt-get clean

# # Set the working directory in the container
# WORKDIR /app

# # Copy package.json and package-lock.json (if available)
# COPY package*.json ./


# # Copy the rest of your application's source code
# COPY . .

# # Expose the port that your application will run on
# EXPOSE 4500

# # Explicitly install docxtemplater (in case it's not in package.json)
# RUN npm install docxtemplater

# # Start the application
# CMD [ "node", "build/index.js" ]



# Use Node.js 20 as base image
FROM node:20

# Install document-conversion tools and a system Chromium fallback for
# Puppeteer PDF generation in the hosted container. The application prefers
# @sparticuz/chromium and falls back to /usr/bin/chromium when necessary.
RUN apt-get update && apt-get install -y \
    ca-certificates \
    chromium \
    fontconfig \
    fonts-liberation \
    fonts-noto-core \
    libreoffice \
    poppler-utils \
    && fc-cache -f \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./


# Install production dependencies, including puppeteer-core and
# @sparticuz/chromium, before copying the application source.
RUN npm ci --omit=dev \
    && node -e "require.resolve('puppeteer-core'); require.resolve('@sparticuz/chromium')"

# Copy app source
COPY . .


# Expose port
EXPOSE 4500

# Start the app
CMD ["node", "build/index.js"]
