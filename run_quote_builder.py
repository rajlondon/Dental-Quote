"""
Dental Quote Builder Runner Script
This script runs the Flask dental quote builder application on port 8080
"""

import os
import sys

# Change to the quote-builder-flask-app directory
os.chdir("quote-builder-flask-app")

# Execute the Flask application
command = "python app.py"
print("Starting Dental Quote Builder on port 8080...")
print("Access at http://0.0.0.0:8080")
print("Press Ctrl+C to stop the server")
sys.exit(os.system(command))