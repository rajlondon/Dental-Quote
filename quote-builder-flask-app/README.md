# Dental Quote Builder - Flask Implementation

A server-side implementation of the dental quote builder using Python Flask. This approach solves the state management and form submission issues encountered in the React implementation.

## Features

- **Server-side state management**: All quote data is stored in a server-side session, preventing state loss between steps
- **No form submission issues**: Data is sent via AJAX calls without full page refreshes
- **Step-by-step navigation**: Clean interface that guides users through the quote process
- **Promo code support**: Built-in support for multiple promotion codes
- **Clean, modern design**: Mobile-responsive layout with clear visual hierarchy

## Available Promo Codes

- `SUMMER15` - 15% discount
- `DENTAL25` - 25% discount
- `NEWPATIENT` - 20% discount
- `TEST10` - 10% discount
- `FREECONSULT` - 100% discount
- `LUXHOTEL20` - 20% discount
- `IMPLANTCROWN30` - 30% discount
- `FREEWHITE` - 100% discount

## Project Structure

```
quote-builder-flask-app/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── templates/              # HTML templates
│   ├── base.html          # Base template with common structure
│   └── quote_builder.html # Main quote builder template
└── static/                # Static assets
    ├── css/
    │   └── style.css     # CSS styles
    └── js/
        └── main.js       # JavaScript functionality
```

## Installation

1. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python app.py
   ```

3. Open a web browser and go to:
   ```
   http://localhost:8080
   ```

## How It Works

1. The application uses Flask server-side sessions to maintain state throughout the quote building process
2. The user interface is divided into multiple steps:
   - Select Treatments
   - Apply Promo Code
   - Enter Patient Information
   - Review and Submit
3. AJAX calls are used to update the server-side state without refreshing the page
4. Form submissions are handled through JavaScript to prevent navigation issues

## Advantages Over Client-Side Implementation

- **Reliable state persistence**: No more losing state between steps
- **Simplified data flow**: Server maintains a single source of truth
- **Improved navigation**: State is managed on the server, eliminating navigation issues
- **Better error handling**: Server-side validation with clear user feedback
- **Responsive design**: Works well on mobile and desktop devices

## Development Notes

- This implementation was created to address persistent issues with the React-based version, including state loss, form submission problems, and navigation issues
- The server-side approach provides a more reliable user experience by storing all quote data in the session
- Future enhancements could include database integration and user authentication