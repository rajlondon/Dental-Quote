"""
Dental Quote Builder Runner Script
This script runs the Flask dental quote builder application
"""
import os
import sys
from app import app

def run_application(debug=True, port=5005):
    """Run the dental quote builder application"""
    try:
        print(f"Starting Dental Quote Builder on port {port}")
        print("Access the application at http://localhost:{port}/")
        
        # Add data directories if they don't exist
        os.makedirs('static/images/treatments', exist_ok=True)
        os.makedirs('static/images/promos', exist_ok=True)
        
        # Run the Flask application
        app.run(host='0.0.0.0', port=port, debug=debug)
    except Exception as e:
        print(f"Error starting application: {e}")
        sys.exit(1)

if __name__ == '__main__':
    # Check if port specified in command line
    port = 5005
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port number: {sys.argv[1]}")
            print("Using default port 5005")
    
    # Run the application
    run_application(port=port)