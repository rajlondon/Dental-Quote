"""
Dental System Starter Script
This script installs dependencies and runs the Flask app
"""
import os
import subprocess
import sys

def install_dependencies():
    """Install required Python packages"""
    print("Installing dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def create_directories():
    """Create necessary directories if they don't exist"""
    dirs = [
        "static/css",
        "static/js", 
        "static/images",
        "flask_session"  # For session storage
    ]
    
    for d in dirs:
        os.makedirs(os.path.join(os.path.dirname(__file__), d), exist_ok=True)

def setup_static_files():
    """Set up initial static files if they don't exist"""
    # Create basic CSS file
    css_file = os.path.join(os.path.dirname(__file__), "static", "css", "styles.css")
    if not os.path.exists(css_file):
        with open(css_file, "w") as f:
            f.write("""/* MyDentalFly Styles */
html, body {
    height: 100%;
}

body {
    display: flex;
    flex-direction: column;
}

main {
    flex: 1 0 auto;
}

.footer {
    flex-shrink: 0;
}
""")
    
    # Create placeholder images for demo
    sample_images = [
        ("dental-implant.jpg", "Dental Implant"),
        ("smile-makeover.jpg", "Smile Makeover"),
        ("travel-bundle.jpg", "Travel Bundle"),
        ("testimonial1.jpg", "Testimonial 1"),
        ("testimonial2.jpg", "Testimonial 2"),
        ("testimonial3.jpg", "Testimonial 3"),
        ("logo.png", "Logo"),
    ]
    
    for img_name, label in sample_images:
        img_path = os.path.join(os.path.dirname(__file__), "static", "images", img_name)
        if not os.path.exists(img_path):
            from PIL import Image, ImageDraw, ImageFont
            
            # Create a colored placeholder image
            width, height = (400, 300)
            if "logo" in img_name:
                width, height = (200, 60)
            
            img = Image.new('RGB', (width, height), color=(73, 109, 137))
            d = ImageDraw.Draw(img)
            
            # Try to add text (might fail if no font available)
            try:
                d.text((10, 10), f"MyDentalFly\n{label}", fill=(255, 255, 255))
            except Exception as e:
                print(f"Couldn't add text to placeholder image: {e}")
                
            img.save(img_path)

def run_app():
    """Run the Flask application"""
    from app import app
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

if __name__ == "__main__":
    # Change working directory to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Setup
    install_dependencies()
    create_directories()
    
    try:
        from PIL import Image, ImageDraw, ImageFont
        setup_static_files()
    except ImportError:
        # Install Pillow for image generation
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        from PIL import Image, ImageDraw, ImageFont
        setup_static_files()
    
    # Run the app
    run_app()