"""
Dental Quote Builder Startup Script
This script runs the Flask dental quote builder on port 5001
"""

import os
import subprocess

# Change to the dental-quote-builder directory
os.chdir("dental-quote-builder")

# Run the Flask application
subprocess.run(["python", "app.py"])