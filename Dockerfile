# Use an official Node.js runtime as the base image
# Choose a version compatible with your project (e.g., 18, 20, 22)
FROM node:22.16.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) for both frontend and backend
# This allows Docker to leverage Docker layer caching for dependencies
# Copy Backend package files
COPY BackEnd/package*.json ./BackEnd/
# Copy Frontend package files
COPY FrontEnd/package*.json ./FrontEnd/

# Install dependencies for Backend
RUN cd BackEnd && npm install --production

# Install dependencies for Frontend
RUN cd FrontEnd && npm install 

# Copy the rest of the application code
# (This copies everything except what's in .dockerignore)
COPY . .

# Build the Frontend
RUN cd FrontEnd && npm run build

# Expose the port the app runs on (adjust if needed, but 3000 is common for Node)
# The start.sh script will determine the actual ports used
EXPOSE 5000
EXPOSE 8080
 # Expose frontend port if served separately within container

# Make the start script executable (if not already)
RUN chmod +x ./start.sh

# Define the command to run the application
CMD ["sh", "./start.sh"]
