"""
Dental Quote System Runner Script
This script runs the Flask dental quote system on port 5005
"""
from app import app

if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=5005, debug=True)