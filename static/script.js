// TikTok Downloader API Frontend JavaScript

class TikTokDownloader {
    constructor() {
        this.currentVideoData = null;
        this.selectedFormat = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const extractForm = document.getElementById('extractForm');
        const downloadBtn = document.getElementById('downloadBtn');

        extractForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.extractVideoInfo();
        });

        downloadBtn.addEventListener('click', () => {
            this.getDownloadLink();
        });
    }

    showLoading() {
        document.getElementById('loadingIndicator').style.display = 'block';
        document.getElementById('errorDisplay').style.display = 'none';
        document.getElementById('videoInfo').style.display = 'none';
        document.getElementById('downloadSection').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingIndicator').style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        const errorDisplay = document.getElementById('errorDisplay');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorDisplay.style.display = 'block';
    }

    async extractVideoInfo() {
        const url = document.getElementById('videoUrl').value.trim();
        
        if (!url) {
            this.showError('Please enter a TikTok URL');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch('/api/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            this.currentVideoData = data.data;
            this.displayVideoInfo(data.data);
            this.hideLoading();
            
            // Show download button
            document.getElementById('downloadBtn').style.display = 'inline-block';

        } catch (error) {
            console.error('Error extracting video info:', error);
            this.showError(error.message || 'Failed to extract video information');
        }
    }

    displayVideoInfo(videoData) {
        const videoInfo = document.getElementById('videoInfo');
        const videoDetails = document.getElementById('videoDetails');

        const formatBytes = (bytes) => {
            if (!bytes) return 'Unknown size';
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
        };

        const formatNumber = (num) => {
            if (!num) return '0';
            return new Intl.NumberFormat().format(num);
        };

        const formatDuration = (seconds) => {
            if (!seconds) return 'Unknown';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        videoDetails.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <h6 class="fw-bold">${videoData.title}</h6>
                    <p class="video-meta">
                        <i class="fas fa-user me-1"></i>
                        ${videoData.uploader}
                    </p>
                    
                    <div class="video-stats mb-3">
                        <div class="video-stat">
                            <i class="fas fa-eye text-primary"></i>
                            <span>${formatNumber(videoData.view_count)} views</span>
                        </div>
                        <div class="video-stat">
                            <i class="fas fa-heart text-danger"></i>
                            <span>${formatNumber(videoData.like_count)} likes</span>
                        </div>
                        <div class="video-stat">
                            <i class="fas fa-clock text-info"></i>
                            <span>${formatDuration(videoData.duration)}</span>
                        </div>
                    </div>

                    <div class="mb-3">
                        <h6>Available Formats:</h6>
                        <div class="row g-2">
                            ${videoData.formats.map((format, index) => `
                                <div class="col-md-6">
                                    <div class="card format-card h-100" data-format-id="${format.format_id}" onclick="tiktokDownloader.selectFormat('${format.format_id}')">
                                        <div class="card-body p-3">
                                            <div class="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 class="card-title mb-1">${format.quality || 'Unknown Quality'}</h6>
                                                    <small class="text-muted">${format.ext?.toUpperCase() || 'MP4'}</small>
                                                </div>
                                                <div class="text-end">
                                                    <small class="text-muted d-block">${format.width}x${format.height}</small>
                                                    <small class="text-muted">${formatBytes(format.filesize)}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    ${videoData.thumbnail ? `
                        <img src="${videoData.thumbnail}" alt="Video thumbnail" class="video-thumbnail img-fluid">
                    ` : `
                        <div class="bg-secondary rounded d-flex align-items-center justify-content-center" style="height: 200px;">
                            <i class="fas fa-video fa-3x text-muted"></i>
                        </div>
                    `}
                </div>
            </div>
        `;

        videoInfo.style.display = 'block';
        
        // Auto-select best quality format
        if (videoData.formats.length > 0) {
            this.selectFormat(videoData.formats[0].format_id);
        }
    }

    selectFormat(formatId) {
        // Remove previous selection
        document.querySelectorAll('.format-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new format
        const selectedCard = document.querySelector(`[data-format-id="${formatId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedFormat = this.currentVideoData.formats.find(f => f.format_id === formatId);
        }
    }

    async getDownloadLink() {
        if (!this.currentVideoData || !this.selectedFormat) {
            this.showError('Please select a format first');
            return;
        }

        const url = document.getElementById('videoUrl').value.trim();
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.innerHTML;
        
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Getting Link...';
        downloadBtn.disabled = true;

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    format_id: this.selectedFormat.format_id
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            this.displayDownloadLink(data.data);

        } catch (error) {
            console.error('Error getting download link:', error);
            this.showError(error.message || 'Failed to get download link');
        } finally {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    }

    displayDownloadLink(downloadData) {
        const downloadSection = document.getElementById('downloadSection');
        const downloadResult = document.getElementById('downloadResult');

        downloadResult.innerHTML = `
            <div class="alert alert-success">
                <h6 class="alert-heading">
                    <i class="fas fa-check-circle me-2"></i>
                    Download Link Ready!
                </h6>
                <p class="mb-3">Your TikTok video is ready for download:</p>
                
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${downloadData.title}</h6>
                        <p class="card-text">
                            <small class="text-muted">
                                <i class="fas fa-user me-1"></i>
                                ${downloadData.uploader} • 
                                ${downloadData.format.quality} • 
                                ${downloadData.format.width}x${downloadData.format.height}
                            </small>
                        </p>
                        
                        <div class="d-grid gap-2">
                            <a href="${downloadData.download_url}" 
                               class="btn btn-success download-btn" 
                               target="_blank" 
                               download>
                                <i class="fas fa-download me-2"></i>
                                Download Video
                            </a>
                            <button class="btn btn-outline-secondary btn-sm" 
                                    onclick="navigator.clipboard.writeText('${downloadData.download_url}')">
                                <i class="fas fa-copy me-2"></i>
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        downloadSection.style.display = 'block';
        
        // Scroll to download section
        downloadSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the TikTok Downloader when the page loads
let tiktokDownloader;
document.addEventListener('DOMContentLoaded', () => {
    tiktokDownloader = new TikTokDownloader();
});

// Utility function to validate TikTok URLs
function isValidTikTokUrl(url) {
    const tiktokPatterns = [
        /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
        /^https?:\/\/(vm|vt)\.tiktok\.com\/[\w-]+/,
        /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w-]+/,
        /^https?:\/\/m\.tiktok\.com\/v\/\d+\.html/
    ];
    
    return tiktokPatterns.some(pattern => pattern.test(url));
}

// Auto-validate URL as user types
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('videoUrl');
    const extractBtn = document.getElementById('extractBtn');
    
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        const isValid = url === '' || isValidTikTokUrl(url);
        
        if (isValid) {
            urlInput.classList.remove('is-invalid');
            urlInput.classList.add('is-valid');
            extractBtn.disabled = false;
        } else {
            urlInput.classList.remove('is-valid');
            urlInput.classList.add('is-invalid');
            extractBtn.disabled = true;
        }
    });
});
