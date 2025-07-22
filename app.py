import os
import logging
import re
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import yt_dlp
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_dev")
CORS(app)

def is_valid_tiktok_url(url):
    """Validate if the URL is a valid TikTok URL"""
    tiktok_patterns = [
        r'https?://(?:www\.)?tiktok\.com/@[\w.-]+/video/\d+',
        r'https?://(?:vm|vt)\.tiktok\.com/[\w-]+',
        r'https?://(?:www\.)?tiktok\.com/t/[\w-]+',
        r'https?://m\.tiktok\.com/v/\d+\.html'
    ]
    
    for pattern in tiktok_patterns:
        if re.match(pattern, url):
            return True
    return False

def extract_video_info(url):
    """Extract video information using yt-dlp"""
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extractaudio': False,
            'outtmpl': '%(title)s.%(ext)s',
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Extract relevant information
            video_data = {
                'title': info.get('title', 'Unknown Title'),
                'description': info.get('description', ''),
                'uploader': info.get('uploader', 'Unknown'),
                'duration': info.get('duration', 0),
                'view_count': info.get('view_count', 0),
                'like_count': info.get('like_count', 0),
                'thumbnail': info.get('thumbnail', ''),
                'formats': []
            }
            
            # Extract download formats
            formats = info.get('formats', [])
            for fmt in formats:
                if fmt.get('vcodec') != 'none':  # Only video formats
                    format_info = {
                        'format_id': fmt.get('format_id'),
                        'url': fmt.get('url'),
                        'ext': fmt.get('ext'),
                        'quality': fmt.get('format_note', 'Unknown'),
                        'filesize': fmt.get('filesize'),
                        'width': fmt.get('width'),
                        'height': fmt.get('height')
                    }
                    video_data['formats'].append(format_info)
            
            # Sort formats by quality (highest first)
            video_data['formats'].sort(key=lambda x: (x.get('height', 0), x.get('width', 0)), reverse=True)
            
            return video_data
            
    except Exception as e:
        logging.error(f"Error extracting video info: {str(e)}")
        raise Exception(f"Failed to extract video information: {str(e)}")

@app.route('/')
def index():
    """Main page with API tester"""
    return render_template('index.html')

@app.route('/docs')
def api_docs():
    """API documentation page"""
    return render_template('api_docs.html')

@app.route('/api/extract', methods=['POST'])
def extract_video():
    """Extract video information from TikTok URL"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'URL is required in request body'
            }), 400
        
        url = data['url'].strip()
        
        if not url:
            return jsonify({
                'success': False,
                'error': 'URL cannot be empty'
            }), 400
        
        if not is_valid_tiktok_url(url):
            return jsonify({
                'success': False,
                'error': 'Invalid TikTok URL format'
            }), 400
        
        # Extract video information
        video_info = extract_video_info(url)
        
        return jsonify({
            'success': True,
            'data': video_info
        })
        
    except Exception as e:
        logging.error(f"Error in extract_video: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/download', methods=['POST'])
def get_download_link():
    """Get direct download link for TikTok video"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'URL is required in request body'
            }), 400
        
        url = data['url'].strip()
        format_id = data.get('format_id', 'best')
        
        if not url:
            return jsonify({
                'success': False,
                'error': 'URL cannot be empty'
            }), 400
        
        if not is_valid_tiktok_url(url):
            return jsonify({
                'success': False,
                'error': 'Invalid TikTok URL format'
            }), 400
        
        # Extract video information and get download link
        video_info = extract_video_info(url)
        
        # Find the requested format or best quality
        download_url = None
        selected_format = None
        
        if format_id == 'best' and video_info['formats']:
            selected_format = video_info['formats'][0]
            download_url = selected_format['url']
        else:
            for fmt in video_info['formats']:
                if fmt['format_id'] == format_id:
                    selected_format = fmt
                    download_url = fmt['url']
                    break
        
        if not download_url:
            return jsonify({
                'success': False,
                'error': 'No download link found for the specified format'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'download_url': download_url,
                'format': selected_format,
                'title': video_info['title'],
                'uploader': video_info['uploader']
            }
        })
        
    except Exception as e:
        logging.error(f"Error in get_download_link: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'TikTok Downloader API is running'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
