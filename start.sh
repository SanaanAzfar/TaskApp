#!/bin/bash
# my-project-root/start.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Function to handle graceful shutdown ---
# Ensures background processes are terminated when the script exits (e.g., Ctrl+C)
cleanup() {
    echo "Stopping backend server..."
    # Check if BACKEND_PID is set and not empty before killing
    if [[ -n "$BACKEND_PID" ]]; then
        kill $BACKEND_PID
        wait $BACKEND_PID 2>/dev/null || true # Wait for process to finish, suppress errors if already dead
    fi
    echo "Backend server stopped."
    exit 0
}
# --- FIX: Use numeric signal values for better compatibility ---
trap cleanup 2 15 # Trap Ctrl+C (SIGINT=2) and termination signals (SIGTERM=15)
# --- END FIX ---

# --- START BACKEND SERVER ---
echo "Starting backend server..."
cd BackEnd
# Use PORT environment variable if set, otherwise default to 3000 (adjust as needed)
PORT=${PORT:-5000}
# Start the backend server in the background (&) and capture its PID
node index.js &
BACKEND_PID=$!
cd .. # Go back to root
echo "Backend server started with PID $BACKEND_PID"

# --- SERVE FRONTEND FILES ---
# Wait briefly to let backend potentially bind to its port if needed
sleep 2
echo "Serving frontend files from FrontEnd/dist on port 8080..."
# Use a simple HTTP server to serve the static frontend files
# Python 3's http.server is often available. Adjust if needed.
# Serve from the correct directory and on a different port (e.g., 8080)
cd FrontEnd/dist
python3 -m http.server 8080 & # Start static file server in background
FRONTEND_PID=$!
cd ../.. # Go back to root
echo "Frontend server started with PID $FRONTEND_PID"

# --- WAIT FOR PROCESSES ---
# Wait indefinitely for the background processes.
# The trap will handle cleanup on Ctrl+C or termination.
wait $BACKEND_PID $FRONTEND_PID

