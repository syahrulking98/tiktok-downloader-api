# TikTok Downloader API

## Overview

This is a Flask-based web application that provides an API and web interface for downloading TikTok videos without watermarks. The application uses yt-dlp (youtube-dl fork) to extract video information and download links from TikTok URLs. It features a clean web interface built with Bootstrap and provides both a user-friendly frontend and API endpoints for programmatic access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Video Processing**: yt-dlp library for extracting video metadata and download URLs
- **CORS Support**: Flask-CORS for cross-origin resource sharing
- **URL Validation**: Regular expressions to validate TikTok URL formats

### Frontend Architecture
- **Styling**: Bootstrap 5 with dark theme
- **Icons**: Font Awesome 6
- **JavaScript**: Vanilla JavaScript class-based approach for API interactions
- **Responsive Design**: Mobile-first Bootstrap grid system

### Key Design Decisions
1. **Flask over Django**: Chosen for simplicity and lightweight nature suitable for a single-purpose API
2. **yt-dlp over direct scraping**: More reliable and maintained solution for video extraction
3. **Client-side JavaScript**: Keeps the backend stateless and improves user experience
4. **Bootstrap dark theme**: Modern, professional appearance with good accessibility

## Key Components

### Backend Components (`app.py`)
- **URL Validation**: `is_valid_tiktok_url()` function validates multiple TikTok URL formats
- **Video Information Extraction**: `extract_video_info()` uses yt-dlp to get metadata
- **Flask Routes**: 
  - Main page rendering
  - API endpoints for video info extraction
  - Documentation pages

### Frontend Components
- **TikTokDownloader Class** (`static/script.js`): Handles user interactions and API calls
- **Responsive UI** (`templates/index.html`): Clean interface for URL input and video info display
- **API Documentation** (`templates/api_docs.html`): Comprehensive documentation for developers

### Supported TikTok URL Formats
- Standard video URLs: `tiktok.com/@username/video/id`
- Short URLs: `vm.tiktok.com/shortcode`
- Mobile URLs: `m.tiktok.com/v/id.html`
- Share URLs: `tiktok.com/t/shortcode`

## Data Flow

1. **User Input**: User enters TikTok URL in web interface or sends API request
2. **URL Validation**: Backend validates URL format using regex patterns
3. **Video Extraction**: yt-dlp processes the URL to extract video metadata
4. **Response Generation**: Backend returns JSON with video info including:
   - Title and description
   - Uploader information
   - View and like counts
   - Available download formats
5. **Frontend Display**: JavaScript updates the UI with video information
6. **Download Process**: User selects format and gets direct download link

## External Dependencies

### Python Libraries
- **Flask**: Web framework and routing
- **Flask-CORS**: Cross-origin resource sharing support
- **yt-dlp**: Video information extraction and download URL generation

### Frontend Libraries (CDN)
- **Bootstrap 5**: UI framework with dark theme
- **Font Awesome 6**: Icon library
- **Custom CSS**: Additional styling for enhanced appearance

### Runtime Requirements
- Python 3.x environment
- Network access for TikTok content extraction
- Browser support for modern JavaScript (ES6 classes)

## Deployment Strategy

### Development Setup
- **Entry Point**: `main.py` runs Flask development server
- **Debug Mode**: Enabled for development with hot reloading
- **Host Configuration**: Listens on all interfaces (0.0.0.0:5000)

### Environment Configuration
- **Secret Key**: Uses environment variable or defaults for development
- **Logging**: Debug level logging enabled for troubleshooting
- **CORS**: Enabled for frontend-backend separation

### Production Considerations
- Secret key should be set via environment variables
- Debug mode should be disabled
- Consider using WSGI server (Gunicorn, uWSGI)
- Rate limiting may be needed for API endpoints
- Error handling and logging should be enhanced

### File Structure
```
/
├── app.py              # Main Flask application
├── main.py             # Application entry point
├── static/
│   ├── script.js       # Frontend JavaScript
│   └── style.css       # Custom styles
└── templates/
    ├── index.html      # Main interface
    └── api_docs.html   # API documentation
```

The application is designed to be easily deployable on platforms like Replit, Heroku, or similar cloud platforms with minimal configuration requirements.