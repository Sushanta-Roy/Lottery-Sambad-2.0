/**
 * Image Web - JavaScript functionality (OPTIMIZED FOR INSTANT LOADING)
 * Handles image display based on date/time parsing from filenames
 * Priority: Show ANY image instantly, then upgrade in background
 */

class ImageWebController {
    constructor() {
        this.currentImage = null;
        this.availableImages = [];
        this.imageFormats = ['webp', 'jpeg', 'jpg', 'png']; // Optimized order
        this.currentDate = new Date();
        this.displayedMonth = new Date();
        this.isCalendarOpen = false;
        this.imageCache = new Map(); // Cache for fast lookups
        this.loadStartTime = performance.now();
        
        console.log('🚀 OPTIMIZED: Starting instant image loader...');
        
        this.initializeElements();
        this.bindEvents();
        this.initializeCustomDatePicker();
        
        // INSTANT LOADING: Show first available image immediately
        this.showFirstAvailableImageInstantly();
        
        // Background optimization after image is shown
        setTimeout(() => this.optimizeInBackground(), 100);
    }

    initializeElements() {
        this.datePicker = document.getElementById('date-picker');
        this.resultContainer = document.getElementById('result-container');
        this.downloadLink = document.getElementById('download-link');
        this.timeButtons = document.querySelectorAll('[data-time]');
        
        // Set today's date as default
        if (this.datePicker) {
            this.datePicker.value = this.formatDateForInput(new Date());
        }
    }

    initializeCustomDatePicker() {
        // Initialize custom date picker elements
        this.dateDisplay = document.getElementById('date-display');
        this.dateText = document.getElementById('date-text');
        this.datePickerCalendar = document.getElementById('date-picker-calendar');
        this.calendarMonthYear = document.getElementById('calendar-month-year');
        this.calendarDays = document.getElementById('calendar-days');
        this.prevMonthBtn = document.getElementById('prev-month');
        this.nextMonthBtn = document.getElementById('next-month');
        
        // Set up event listeners for custom date picker
        if (this.dateDisplay) {
            this.dateDisplay.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCalendar();
            });
        }
        
        if (this.prevMonthBtn) {
            this.prevMonthBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateMonth(-1);
            });
        }
        
        if (this.nextMonthBtn) {
            this.nextMonthBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateMonth(1);
            });
        }
        
        // Close calendar when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.datePickerCalendar?.contains(e.target) && !this.dateDisplay?.contains(e.target)) {
                this.hideCalendar();
            }
        });
        
        // Initialize with today's date if elements exist
        if (this.dateDisplay && this.dateText) {
            this.currentDate = new Date();
            this.displayedMonth = new Date(this.currentDate);
            this.updateDateDisplay();
            this.renderCalendar();
            console.log(`🗓️ Custom date picker initialized with: ${this.currentDate.toDateString()}`);
        }
    }

    bindEvents() {
        // Date picker change (hidden input for compatibility)
        if (this.datePicker) {
            this.datePicker.addEventListener('change', () => this.handleDateChange());
        }
        
        // Time button clicks
        this.timeButtons.forEach(button => {
            button.addEventListener('click', () => this.handleTimeButtonClick(button));
        });

        // Download button click
        if (this.downloadLink) {
            this.downloadLink.addEventListener('click', (e) => this.handleDownload(e));
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // F5 or Ctrl+R to refresh images
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.forceRefreshImages();
            }
            
            // Ctrl+Shift+R for hard refresh (bypass all caches)
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.hardRefreshImages();
            }
            
            // ESC to close calendar
            if (e.key === 'Escape' && this.isCalendarOpen) {
                this.hideCalendar();
            }
        });
        
        // Auto-refresh every 2 minutes to catch new images
        this.setupAutoRefresh();
    }

    /**
     * Parse image filename to extract date and time information
     * Supports formats like: "File 12-08-2025 1pm.webp", "12-08-2025 6pm.webp"
     */
    parseImageName(filename) {
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
        
        // Match pattern: (optional "File ") + DD-MM-YYYY HHpm/am
        const dateTimeRegex = /^(?:File\s+)?(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2})(pm|am)$/i;
        const match = nameWithoutExt.match(dateTimeRegex);
        
        if (!match) return null;
        
        const [, day, month, year, hour, period] = match;
        
        // Validate date components
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        const hourNum = parseInt(hour, 10);
        
        if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || hourNum < 1 || hourNum > 12) {
            return null;
        }
        
        // Convert to 24-hour format
        let hour24 = hourNum;
        if (period.toLowerCase() === 'pm' && hourNum !== 12) {
            hour24 += 12;
        } else if (period.toLowerCase() === 'am' && hourNum === 12) {
            hour24 = 0;
        }
        
        try {
            const date = new Date(yearNum, monthNum - 1, dayNum, hour24, 0, 0);
            return {
                date: date,
                day: dayNum,
                month: monthNum,
                year: yearNum,
                hour: hourNum,
                period: period.toLowerCase(),
                hour24: hour24,
                originalFilename: filename,
                displayTime: `${hourNum}${period.toLowerCase()}`
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Format date for HTML date input (YYYY-MM-DD)
     */
    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    /**
     * Format date for display (DD-MM-YYYY)
     */
    formatDateForDisplay(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    /**
     * OPTIMIZED: Show first available image instantly - NO DELAYS!
     */
    async showFirstAvailableImageInstantly() {
        const startTime = performance.now();
        console.log('⚡ OPTIMIZED: Starting instant image loader (target: <100ms)...');
        
        // Don't show loading message - just get the image!
        
        // Super fast check: try the most likely images first (today + recent days)
        const found = await this.findFirstAvailableImageSuperFast();
        
        if (found) {
            const loadTime = performance.now() - startTime;
            console.log(`⚡✅ OPTIMIZED: Image displayed in ${loadTime.toFixed(2)}ms - ${found.originalFilename}`);
            
            // Display immediately
            this.currentImage = found;
            this.displayImageDirectly(found);
            
            // Update UI
            this.currentDate = new Date(found.date);
            this.datePicker.value = this.formatDateForInput(found.date);
            
            if (this.dateText) {
                this.updateDateDisplay();
            }
            
            this.highlightTimeButton(found.displayTime);
            
        } else {
            const loadTime = performance.now() - startTime;
            console.log(`⚠️ OPTIMIZED: No images found in ${loadTime.toFixed(2)}ms`);
            this.showImagePlaceholderWithMessage('No lottery results found');
        }
    }
    
    /**
     * SUPER FAST: Find first available image with ultra-optimized search
     */
    async findFirstAvailableImageSuperFast() {
        console.log('⚡ SUPER FAST: Ultra-optimized image search starting...');
        
        const startTime = performance.now();
        const today = new Date();
        const times = ['8pm', '6pm', '1pm']; // Priority order
        const extensions = ['webp', 'jpeg', 'jpg', 'png']; // Check all common formats
        
        // EXPANDED SEARCH: Check last 60 days to find your August 2025 images
        for (let daysBack = 0; daysBack < 7; daysBack++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - daysBack);
            const dateStr = this.formatDateForFilename(checkDate);
            
            // For each day, try each time in priority order
            for (const time of times) {
                for (const ext of extensions) {
                    const filename = `${dateStr} ${time}.${ext}`;
                    
                    // Cache check first
                    if (this.imageCache.has(filename)) {
                        const cached = this.imageCache.get(filename);
                        if (cached) {
                            const elapsed = performance.now() - startTime;
                            console.log(`⚡ CACHED: Found image in ${elapsed.toFixed(2)}ms - ${filename}`);
                            return cached;
                        }
                        continue; // Known to not exist
                    }
                    
                    // Super fast existence check with minimal timeout
                    const exists = await this.checkImageExistsSuperFast(filename);
                    if (exists) {
                        const parsed = this.parseImageName(filename);
                        if (parsed) {
                            // Cache the result
                            this.imageCache.set(filename, parsed);
                            
                            const elapsed = performance.now() - startTime;
                            console.log(`⚡ SUPER FAST: Found image in ${elapsed.toFixed(2)}ms - ${filename}`);
                            return parsed;
                        }
                    } else {
                        // Skip negative caching on CDN to avoid stale false-negatives
                        // (images may appear shortly after deploy)
                    }
                }
            }
            
            // Add small delay every 10 days to keep UI responsive
            if (daysBack % 10 === 0 && daysBack > 0) {
                await new Promise(resolve => setTimeout(resolve, 5));
            }
        }
        
        const elapsed = performance.now() - startTime;
        console.log(`⚡ SUPER FAST: No images found in ${elapsed.toFixed(2)}ms`);
        return null;
    }
    
    /**
     * Ultra-fast image existence check (50ms timeout)
     */
    async checkImageExistsSuperFast(filename) {
        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;
            
            // Ultra-short timeout for maximum speed
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            }, 800); // Increased timeout for CDN latency
            
            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(false);
                }
            };
            
            img.src = this.buildImageURLForCheck(filename);
        });
    }
    
    /**
     * Background optimization - run after image is displayed
     */
    async optimizeInBackground() {
        console.log('🔧 BACKGROUND: Starting background optimization...');
        
        // Load available images from server/client in background
        await this.loadAvailableImagesInBackground();
        
        console.log('🔧 BACKGROUND: Optimization completed');
    }
    
    /**
     * Find the newest image file INSTANTLY - optimized for speed
     */
    async findNewestImageInstantly() {
        console.log('⚡ INSTANT: Quick scanning for newest image...');
        
        const today = new Date();
        const priorityTimes = ['8pm', '6pm', '1pm'];
        const extensions = ['webp', 'jpeg', 'jpg', 'png']; // Check all common formats
        
        // INSTANT MODE: Check only last 14 days with priority order
        // Check 8pm first across all recent dates, then 6pm, then 1pm
        for (const time of priorityTimes) {
            console.log(`⚡ INSTANT: Quick checking ${time} draws...`);
            
            for (let daysBack = 0; daysBack < 7; daysBack++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - daysBack);
                
                const dateStr = this.formatDateForFilename(checkDate);
                
                for (const ext of extensions) {
                    const filename = `${dateStr} ${time}.${ext}`;
                    
                    try {
                        // Super fast check with 200ms timeout
                        const exists = await this.checkImageExistsInstant(filename);
                        if (exists) {
                            const parsed = this.parseImageName(filename);
                            if (parsed) {
                                console.log(`⚡ INSTANT: Found ${filename} (${parsed.displayTime})`);
                                return parsed; // Return first found with highest time priority
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
        }
        
        console.log('⚡ INSTANT: No images found in quick scan, will try comprehensive scan...');
        return null;
    }
    
    /**
     * Start comprehensive background scan when instant scan fails
     */
    async startComprehensiveScanInBackground() {
        console.log('🔍 COMPREHENSIVE: Starting thorough background scan...');
        
        // Show loading placeholder while scanning
        this.showImagePlaceholderWithMessage('Scanning for lottery results...');
        
        // Give UI a moment to render
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const today = new Date();
        const priorityTimes = ['8pm', '6pm', '1pm'];
        const extensions = ['webp', 'jpeg', 'jpg', 'png'];
        const foundImages = [];
        
        // Comprehensive scan of last 60 days
        for (let daysBack = 0; daysBack < 14; daysBack++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - daysBack);
            
            const dateStr = this.formatDateForFilename(checkDate);
            
            for (const time of priorityTimes) {
                for (const ext of extensions) {
                    const filename = `${dateStr} ${time}.${ext}`;
                    
                    try {
                        const exists = await this.checkImageExistsFast(filename);
                        if (exists) {
                            const parsed = this.parseImageName(filename);
                            if (parsed) {
                                foundImages.push(parsed);
                                console.log(`📸 COMPREHENSIVE: Found ${filename}`);
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
            
            // Small delay every 10 days to keep UI responsive
            if (daysBack % 10 === 0 && daysBack > 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        if (foundImages.length > 0) {
            // Sort by date and time priority
            foundImages.sort((a, b) => {
                const dateComparison = b.date - a.date;
                if (dateComparison !== 0) return dateComparison;
                return this.getTimePriority(b.displayTime) - this.getTimePriority(a.displayTime);
            });
            
            const newest = foundImages[0];
            console.log(`🏆 COMPREHENSIVE: Found newest image: ${newest.originalFilename}`);
            
            // Display the found image
            this.currentImage = newest;
            this.availableImages = foundImages;
            this.displayImageDirectly(newest);
            
            this.currentDate = new Date(newest.date);
            this.datePicker.value = this.formatDateForInput(newest.date);
            
            if (this.dateText) {
                this.updateDateDisplay();
            }
            
            this.highlightTimeButton(newest.displayTime);
        } else {
            console.log('🚨 COMPREHENSIVE: No images found anywhere');
            this.showImagePlaceholderWithMessage('No lottery results found. Please add image files.');
        }
    }
    
    /**
     * Show emergency fallback when absolutely no images found
     */
    showStaticFallbackImage() {
        console.log('🚨 EMERGENCY: Starting emergency scan...');
        this.emergencyImageScan();
    }
    
    /**
     * Emergency scan when no images found - tries very recent dates
     */
    async emergencyImageScan() {
        console.log('🆘 EMERGENCY: Last attempt to find any images...');
        
        const today = new Date();
        const extensions = ['webp', 'jpeg', 'jpg', 'png'];
        const times = ['8pm', '6pm', '1pm'];
        
        // Try last 180 days (6 months) as emergency measure
        for (let daysBack = 0; daysBack < 30; daysBack++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - daysBack);
            
            const dateStr = this.formatDateForFilename(checkDate);
            
            for (const time of times) {
                for (const ext of extensions) {
                    const filename = `${dateStr} ${time}.${ext}`;
                    
                    try {
                        const exists = await this.checkImageExistsFast(filename);
                        if (exists) {
                            const parsed = this.parseImageName(filename);
                            if (parsed) {
                                console.log(`🆘 EMERGENCY: Found image: ${filename}`);
                                
                                this.currentImage = parsed;
                                this.availableImages = [parsed];
                                this.displayImageDirectly(parsed);
                                
                                this.currentDate = new Date(parsed.date);
                                this.datePicker.value = this.formatDateForInput(parsed.date);
                                
                                if (this.dateText) {
                                    this.updateDateDisplay();
                                }
                                
                                this.highlightTimeButton(parsed.displayTime);
                                return; // Found something, exit
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
        }
        
        // Absolute fallback - show placeholder
        console.log('🚨 EMERGENCY: No images found anywhere - showing placeholder');
        this.showImagePlaceholderWithMessage('No lottery results found. Please add image files.');
    }
    
    /**
     * Scan for newer images in background (non-blocking)
     */
    async scanForNewerImagesInBackground() {
        console.log('🔍 BACKGROUND: Scanning for newer images than current...');
        
        // Longer delay to ensure page is fully loaded first
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
            // Quick check for images newer than current
            const newerImage = await this.findImageNewerThanCurrent();
            
            if (newerImage) {
                // Check if we should auto-upgrade based on time difference and user interaction
                const daysDifference = (newerImage.date - this.currentImage.date) / (1000 * 60 * 60 * 24);
                const shouldUpgrade = this.allowAutoUpgrade && 
                    (daysDifference >= 1 || // Much newer (1+ days)
                     !this.isInitialLoad); // User has interacted
                
                if (shouldUpgrade) {
                    console.log(`🆕 BACKGROUND: Auto-upgrading to newer image: ${newerImage.originalFilename} (${daysDifference.toFixed(1)} days newer)`);
                    
                    // Update to newer image smoothly
                    this.currentImage = newerImage;
                    this.displayImage(newerImage);
                    this.currentDate = new Date(newerImage.date);
                    this.datePicker.value = this.formatDateForInput(newerImage.date);
                    
                    if (this.dateText) {
                        this.updateDateDisplay();
                    }
                    
                    this.highlightTimeButton(newerImage.displayTime);
                    
                    // Update known latest for next time
                    this.latestKnownImage = newerImage.originalFilename;
                    console.log(`🔄 BACKGROUND: Auto-upgraded to ${newerImage.originalFilename}`);
                } else {
                    console.log(`🔒 BACKGROUND: Found newer image but NOT auto-upgrading: ${newerImage.originalFilename} (${daysDifference.toFixed(1)} days newer, allowAutoUpgrade: ${this.allowAutoUpgrade})`);
                    console.log(`💡 TIP: Update latestKnownImage to '${newerImage.originalFilename}' to avoid this message`);
                }
            } else {
                console.log('✅ BACKGROUND: Current image is the newest available');
            }
            
        } catch (error) {
            console.log('⚠️ BACKGROUND: Background scan failed:', error);
        }
        
        // Load all images for calendar in background
        this.loadAvailableImagesInBackground();
    }
    
    /**
     * Find images newer than current image
     */
    async findImageNewerThanCurrent() {
        console.log('🔍 NEWER: Checking for images newer than current...');
        
        const today = new Date();
        const priorityTimes = ['8pm', '6pm', '1pm'];
        const extensions = ['webp', 'jpeg', 'jpg', 'png'];
        const foundImages = [];
        
        // Check last 30 days for any newer images
        for (let daysBack = 0; daysBack < 7; daysBack++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - daysBack);
            
            const dateStr = this.formatDateForFilename(checkDate);
            
            for (const time of priorityTimes) {
                for (const ext of extensions) {
                    const filename = `${dateStr} ${time}.${ext}`;
                    
                    try {
                        const exists = await this.checkImageExistsFast(filename);
                        if (exists) {
                            const parsed = this.parseImageName(filename);
                            if (parsed) {
                                foundImages.push(parsed);
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
        }
        
        if (foundImages.length === 0) {
            return null;
        }
        
        // Sort by date (newest first), then by time priority
        foundImages.sort((a, b) => {
            const dateComparison = b.date - a.date;
            if (dateComparison !== 0) return dateComparison;
            return this.getTimePriority(b.displayTime) - this.getTimePriority(a.displayTime);
        });
        
        const newest = foundImages[0];
        
        // Only return if it's actually newer than current
        if (!this.currentImage || newest.date > this.currentImage.date || 
            (newest.date.toDateString() === this.currentImage.date.toDateString() && 
             this.getTimePriority(newest.displayTime) > this.getTimePriority(this.currentImage.displayTime))) {
            return newest;
        }
        
        return null;
    }
    
    /**
     * Find the absolute newest image across all recent dates
     */
    async findAbsoluteNewestImage() {
        console.log('🔍 NEWEST: Scanning for absolute newest image across all dates...');
        
        const today = new Date();
        const priorityTimes = ['8pm', '6pm', '1pm'];
        const extensions = ['webp', 'jpeg', 'jpg', 'png'];
        const foundImages = [];
        
        // Check last 60 days to find ALL recent images (covers 2 months)
        for (let daysBack = 0; daysBack < 14; daysBack++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - daysBack);
            
            const dateStr = this.formatDateForFilename(checkDate);
            
            // For each date, check all times to find all available images
            for (const time of priorityTimes) {
                for (const ext of extensions) {
                    const filename = `${dateStr} ${time}.${ext}`;
                    
                    try {
                        const exists = await this.checkImageExistsFast(filename);
                        if (exists) {
                            const parsed = this.parseImageName(filename);
                            if (parsed) {
                                foundImages.push(parsed);
                                console.log(`📸 NEWEST: Found image: ${filename} (${parsed.displayTime}) from ${dateStr}`);
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
        }
        
        if (foundImages.length === 0) {
            console.log('❌ NEWEST: No images found in recent dates');
            return null;
        }
        
        // Sort images by date (newest first), then by time priority
        foundImages.sort((a, b) => {
            // First sort by date (newest first)
            const dateComparison = b.date - a.date;
            if (dateComparison !== 0) {
                return dateComparison;
            }
            
            // If same date, sort by time priority (8pm > 6pm > 1pm)
            return this.getTimePriority(b.displayTime) - this.getTimePriority(a.displayTime);
        });
        
        const newest = foundImages[0];
        console.log(`🏆 NEWEST: Selected newest image: ${newest.originalFilename} (${newest.displayTime}) from ${this.formatDateForDisplay(newest.date)}`);
        
        return newest;
    }
    
    /**
     * Get numeric priority for time slots (higher number = higher priority)
     */
    getTimePriority(timeSlot) {
        const priorities = {
            '8pm': 3,
            '6pm': 2, 
            '1pm': 1
        };
        return priorities[timeSlot] || 0;
    }
    
    /**
     * Format date for filename (DD-MM-YYYY)
     */
    formatDateForFilename(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    /**
     * Build image URL for display with gentle cache-busting for today's images
     */
    buildImageURL(filename) {
        try {
            const todayStr = this.formatDateForFilename(new Date());
            if (filename.startsWith(`${todayStr} `)) {
                // Bust cache per minute for today's results to avoid CDN/browser staleness
                const v = Math.floor(Date.now() / 60000);
                return `${filename}?v=${v}`;
            }
            return filename;
        } catch (e) {
            return filename;
        }
    }

    /**
     * Build image URL for existence checks with aggressive cache-busting
     */
    buildImageURLForCheck(filename) {
        return `${filename}?v=${Date.now()}`;
    }
    
    /**
     * Generate recent image names dynamically with correct time priority
     */
    generateRecentImageNames() {
        const images = [];
        const today = new Date();
        const extensions = ['jpeg', 'webp', 'jpg', 'png'];
        const times = ['8pm', '6pm', '1pm']; // Correct priority order: 8pm > 6pm > 1pm
        
        // Check last 10 days for recent images
        for (let daysBack = 0; daysBack < 7; daysBack++) {
            const date = new Date(today);
            date.setDate(today.getDate() - daysBack);
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dateStr = `${day}-${month}-${year}`;
            
            // For each day, check times in priority order (8pm first, then 6pm, then 1pm)
            for (const time of times) {
                for (const ext of extensions) {
                    images.push(`${dateStr} ${time}.${ext}`);
                }
            }
        }
        
        return images;
    }
    
    /**
     * Generate recent image names with STRICT TIME PRIORITY for initial load
     * This ensures 8pm images are checked first across ALL recent dates
     */
    generateRecentImageNamesWithPriority() {
        const images = [];
        const today = new Date();
        const extensions = ['webp', 'jpeg', 'jpg', 'png']; // webp first as most common
        const times = ['8pm', '6pm', '1pm']; // Priority order: 8pm > 6pm > 1pm
        
        // Check last 7 days for recent images with STRICT TIME PRIORITY
        // First, check ALL 8pm images for all dates
        // Then, check ALL 6pm images for all dates
        // Finally, check ALL 1pm images for all dates
        
        for (const time of times) {
            console.log(`🎯 Generating ${time} images for priority check...`);
            for (let daysBack = 0; daysBack < 7; daysBack++) {
                const date = new Date(today);
                date.setDate(today.getDate() - daysBack);
                
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const dateStr = `${day}-${month}-${year}`;
                
                // For this time slot, check all extensions
                for (const ext of extensions) {
                    images.push(`${dateStr} ${time}.${ext}`);
                }
            }
        }
        
        console.log(`📋 Generated ${images.length} images with strict time priority`);
        return images;
    }
    
    /**
     * Show default image immediately (no waiting) - INSTANT!
     */
    showDefaultImageImmediately() {
        console.log('🚀 Showing default image INSTANTLY!');
        
        // Parse the default image to get its info
        const defaultParsed = this.parseImageName(this.defaultImageName);
        
        if (defaultParsed) {
            // Set this as current image immediately
            this.currentImage = defaultParsed;
            this.availableImages = [defaultParsed];
            
            // Display the image immediately (no loading checks)
            this.displayImageDirectly(defaultParsed);
            
            // Update UI to match the default image
            this.currentDate = new Date(defaultParsed.date);
            this.datePicker.value = this.formatDateForInput(defaultParsed.date);
            
            if (this.dateText) {
                this.updateDateDisplay();
            }
            
            this.highlightTimeButton(defaultParsed.displayTime);
            
            console.log(`🎯 Default image displayed instantly: ${this.defaultImageName}`);
        } else {
            console.log('⚠️ Could not parse default image name');
            this.showImagePlaceholderWithMessage('Loading lottery results...');
        }
    }
    
    /**
     * Display image directly without loading checks (for instant display)
     */
    displayImageDirectly(imageInfo) {
        this.currentImage = imageInfo;
        
        // Create and display image immediately
        const img = document.createElement('img');
        img.src = this.buildImageURL(imageInfo.originalFilename);
        img.alt = `Lottery Result - ${this.formatDateForDisplay(imageInfo.date)} ${imageInfo.displayTime}`;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 0;
        `;
        
        // Show image immediately (don't wait for load)
        this.resultContainer.innerHTML = '';
        this.resultContainer.appendChild(img);
        this.updateDownloadLink();
        
        // Handle load/error events but don't block display
        img.onload = () => {
            console.log('✅ Default image loaded successfully');
        };
        
        img.onerror = () => {
            console.log('⚠️ Default image failed to load, but continuing...');
            // Could fall back to placeholder here if needed
        };
    }
    
    /**
     * Find and load the actual latest image (background process)
     */
    async findAndLoadActualLatestImage() {
        console.log('🔍 Finding actual latest image in background...');
        
        // Small delay to let the default image display first
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try to find a more recent image
        const quickCheckImages = this.generateRecentImageNames();
        
        // Check first few recent images
        for (const filename of quickCheckImages.slice(0, 3)) {
            try {
                const exists = await this.checkImageExistsFast(filename);
                if (exists) {
                    const parsed = this.parseImageName(filename);
                    if (parsed && parsed.date > this.currentImage.date) {
                        console.log(`🔄 Found newer image: ${filename}`);
                        
                        // Update to newer image
                        this.currentImage = parsed;
                        this.displayImage(parsed);
                        this.currentDate = new Date(parsed.date);
                        this.datePicker.value = this.formatDateForInput(parsed.date);
                        
                        if (this.dateText) {
                            this.updateDateDisplay();
                        }
                        
                        this.highlightTimeButton(parsed.displayTime);
                        break; // Found newer, stop checking
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        // Now load all images in background for calendar
        this.loadAvailableImagesInBackground();
    }
    
    /**
     * Load available images from the directory (background process)
     * Enhanced with server-side API support and fallback to client-side scanning
     */
    async loadAvailableImagesInBackground() {
        console.log('🔍 Loading all available images in background...');
        
        // Small delay to let page render first
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const allImages = [];
        
        // Try server-side API first (much faster)
        const serverImages = await this.loadImagesFromServer();
        
        if (serverImages && serverImages.length > 0) {
            console.log(`🚀 Background: Server-side scan found ${serverImages.length} images`);
            allImages.push(...serverImages);
        } else {
            console.log('📡 Background: Server-side API unavailable, falling back to client-side scanning...');
            await this.loadImagesClientSide(allImages);
        }
        
        // Sort by date (newest first)
        allImages.sort((a, b) => {
            if (a.date && b.date) {
                return b.date - a.date;
            }
            // Fallback to timestamp comparison
            return (b.timestamp || 0) - (a.timestamp || 0);
        });
        
        // Update available images list
        this.availableImages = allImages;
        
        // Only update during initial load if we found significantly more recent images
        if (allImages.length > 0 && this.isInitialLoad) {
            const latestImage = allImages[0];
            
            // Only update if we found a significantly newer image (more than 1 day newer)
            // This prevents unnecessary switching from instant load results
            if (!this.currentImage) {
                console.log(`📸 Background: No current image, loading latest: ${latestImage.originalFilename || latestImage.filename}`);
                this.displayImage(latestImage);
                this.currentDate = new Date(latestImage.date);
                this.datePicker.value = this.formatDateForInput(latestImage.date);
                
                if (this.dateText) {
                    this.updateDateDisplay();
                }
                
                this.highlightTimeButton(latestImage.displayTime);
            } else if (latestImage.date && this.currentImage.date) {
                const timeDifference = latestImage.date - this.currentImage.date;
                const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
                
                // Only switch if the new image is more than 1 day newer
                if (daysDifference > 1) {
                    console.log(`📸 Background: Found much newer image (${daysDifference.toFixed(1)} days): ${latestImage.originalFilename || latestImage.filename}`);
                    this.displayImage(latestImage);
                    this.currentDate = new Date(latestImage.date);
                    this.datePicker.value = this.formatDateForInput(latestImage.date);
                    
                    if (this.dateText) {
                        this.updateDateDisplay();
                    }
                    
                    this.highlightTimeButton(latestImage.displayTime);
                } else {
                    console.log(`✅ Background: Keeping current image, found image only ${daysDifference.toFixed(1)} days newer`);
                }
            }
        }
        
        // Update calendar to show lottery result indicators
        if (this.datePickerCalendar) {
            this.renderCalendar();
        }
        
        console.log(`🏁 Background loading complete: ${allImages.length} total images`);
        this.isInitialLoad = false;
    }
    
    /**
     * Load images from server-side API
     * Much faster than client-side scanning
     */
    async loadImagesFromServer() {
        try {
            console.log('🌐 Attempting server-side image scan...');
            const response = await fetch('api/get-images.php?action=list', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.images) {
                // Convert server format to client format
                return data.images.map(img => {
                    const date = new Date(img.year, img.month - 1, img.day, img.hour24, 0, 0);
                    return {
                        originalFilename: img.filename,
                        filename: img.filename,
                        date: date,
                        day: img.day,
                        month: img.month,
                        year: img.year,
                        hour: img.hour,
                        period: img.period,
                        hour24: img.hour24,
                        displayTime: img.displayTime,
                        timestamp: img.timestamp,
                        fileSize: img.fileSize,
                        lastModified: img.lastModified
                    };
                });
            }
            
            return null;
            
        } catch (error) {
            console.log('⚠️ Server-side API unavailable:', error.message);
            return null;
        }
    }
    
    /**
     * Client-side image loading (fallback method)
     */
    async loadImagesClientSide(imageArray = null) {
        console.log('🔍 Client-side scanning for images...');
        
        const targetArray = imageArray || this.availableImages;
        
        // First try to load known images directly
        await this.loadKnownImages(targetArray);
        
        const potentialImages = [];
        
        // Generate potential filenames for a reasonable date range
        const today = new Date();
        const extensions = ['webp', 'jpeg', 'jpg', 'png', 'gif', 'bmp'];
        const times = ['1pm', '6pm', '8pm', '1am', '6am', '8am', '12pm', '12am'];
        
        // Check dates from 6 months ago to 6 months in the future to catch all images
        for (let daysOffset = -14; daysOffset <= 0; daysOffset++) {
            const date = new Date(today);
            date.setDate(today.getDate() + daysOffset);
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dateStr = `${day}-${month}-${year}`;
            
            // Check main draw times and common extensions
            const commonTimes = ['1pm', '6pm', '8pm'];
            const commonExtensions = ['webp', 'jpeg'];
            
            for (const time of commonTimes) {
                for (const ext of commonExtensions) {
                    potentialImages.push(`${dateStr} ${time}.${ext}`);
                }
            }
        }
        
        console.log(`📊 Checking ${potentialImages.length} potential image combinations...`);
        
        let foundCount = 0;
        let checkedCount = 0;
        
        // Process images in small batches to avoid overwhelming the browser
        const batchSize = 8;
        for (let i = 0; i < potentialImages.length; i += batchSize) {
            const batch = potentialImages.slice(i, i + batchSize);
            
            // Process batch in parallel
            const batchPromises = batch.map(async (filename) => {
                try {
                    checkedCount++;
                    if (checkedCount % 50 === 0) {
                        console.log(`📈 Progress: ${checkedCount}/${potentialImages.length}`);
                    }
                    
                    const imageExists = await this.checkImageExists(filename);
                    if (imageExists) {
                        const parsed = this.parseImageName(filename);
                        if (parsed) {
                            console.log(`✅ Found: ${filename}`);
                            foundCount++;
                            return parsed;
                        }
                    }
                } catch (error) {
                    // Silently skip errors to avoid console spam
                }
                return null;
            });
            
            const batchResults = await Promise.all(batchPromises);
            targetArray.push(...batchResults.filter(result => result !== null));
            
            // Small delay between batches to prevent browser freezing
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        console.log(`🎉 Client-side scan complete! Found ${foundCount} images out of ${potentialImages.length} checked.`);
        
        // If no images found with common patterns, try extended search
        if (foundCount === 0) {
            console.log('🔄 No images found with common patterns. Trying extended search...');
            await this.extendedImageSearch(targetArray);
        }
    }
    
    /**
     * Load images by smart scanning - completely automatic
     */
    async loadKnownImages(targetArray = null) {
        console.log('🔍 Smart scanning for ALL images automatically...');
        
        const imageArray = targetArray || this.availableImages;
        const today = new Date();
        const priorityTimes = ['8pm', '6pm', '1pm'];
        const extensions = ['webp', 'jpeg', 'jpg', 'png'];
        let foundCount = 0;
        
        // Scan last 120 days (4 months) to find any lottery images automatically
        for (let daysBack = 0; daysBack < 14; daysBack++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - daysBack);
            
            const dateStr = this.formatDateForFilename(checkDate);
            
            // Check all time slots for this date
            for (const time of priorityTimes) {
                for (const ext of extensions) {
                    const filename = `${dateStr} ${time}.${ext}`;
                    
                    try {
                        const imageExists = await this.checkImageExistsFast(filename);
                        
                        if (imageExists) {
                            const parsed = this.parseImageName(filename);
                            
                            if (parsed) {
                                console.log(`✅ Auto-found image: ${filename} (${parsed.displayTime})`);
                                imageArray.push(parsed);
                                foundCount++;
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
            
            // Add small delay every 30 days to prevent browser freeze
            if (daysBack % 30 === 0 && daysBack > 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        console.log(`🎯 Auto-scan complete: Found ${foundCount} images automatically`);
        console.log(`📊 Current available images: ${imageArray.length} total`);
    }
    
    /**
     * Extended search with more time slots and extensions
     */
    async extendedImageSearch(targetArray = null) {
        console.log('🔍 Running extended search...');
        const potentialImages = [];
        const today = new Date();
        const extensions = ['webp', 'jpeg', 'jpg', 'png'];
        const times = ['1pm', '6pm', '8pm', '1am', '6am', '8am', '12pm', '12am'];
        
        const imageArray = targetArray || this.availableImages;
        
        // Check last 30 days and next 30 days with all combinations
        for (let daysOffset = -7; daysOffset <= 7; daysOffset++) {
            const date = new Date(today);
            date.setDate(today.getDate() + daysOffset);
            
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dateStr = `${day}-${month}-${year}`;
            
            for (const time of times) {
                for (const ext of extensions) {
                    potentialImages.push(`${dateStr} ${time}.${ext}`);
                }
            }
        }
        
        console.log(`🔎 Extended search checking ${potentialImages.length} combinations...`);
        
        // Process in smaller batches for extended search
        const batchSize = 5;
        let foundInExtended = 0;
        
        for (let i = 0; i < potentialImages.length; i += batchSize) {
            const batch = potentialImages.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (filename) => {
                try {
                    const imageExists = await this.checkImageExists(filename);
                    if (imageExists) {
                        const parsed = this.parseImageName(filename);
                        if (parsed) {
                            console.log(`✅ Extended search found: ${filename}`);
                            foundInExtended++;
                            return parsed;
                        }
                    }
                } catch (error) {
                    // Silently skip errors
                }
                return null;
            });
            
            const batchResults = await Promise.all(batchPromises);
            imageArray.push(...batchResults.filter(result => result !== null));
            
            // Longer delay for extended search
            await new Promise(resolve => setTimeout(resolve, 20));
            
            // Stop extended search if we found some images
            if (foundInExtended > 0) {
                console.log(`✋ Extended search stopped early after finding ${foundInExtended} images.`);
                break;
            }
        }
        
        console.log(`🏁 Extended search complete. Found ${foundInExtended} additional images.`);
    }
    
    /**
     * Check if an image file exists by trying to load it
     * Optimized for real-time file checking with timeout
     */
    async checkImageExists(filename) {
        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;
            
            // Set a timeout to avoid hanging on non-existent files
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            }, 1000); // Balanced timeout for static hosting/CDN
            
            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(false);
                }
            };
            
            img.src = this.buildImageURLForCheck(filename);
        });
    }
    
    /**
     * Fast image existence check for instant loading (shorter timeout)
     */
    async checkImageExistsFast(filename) {
        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;
            
            // Shorter timeout for instant loading
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            }, 800); // Adjusted for public CDN latency
            
            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(false);
                }
            };
            
            img.src = this.buildImageURLForCheck(filename);
        });
    }
    
    /**
     * Super fast image existence check for instant loading
     */
    async checkImageExistsInstant(filename) {
        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;
            
            // Super short timeout for instant results
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            }, 900); // Adjusted for public CDN latency
            
            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(false);
                }
            };
            
            img.src = this.buildImageURLForCheck(filename);
        });
    }

    /**
     * Display the most recent image
     */
    displayLatestImage() {
        if (this.availableImages.length === 0) {
            this.showNoImageMessage();
            return;
        }
        
        const latestImage = this.availableImages[0];
        this.displayImage(latestImage);
        
        // Update both custom date picker and hidden input to match the latest image
        this.currentDate = new Date(latestImage.date);
        this.datePicker.value = this.formatDateForInput(latestImage.date);
        
        // Update the custom date picker display
        if (this.dateText) {
            this.updateDateDisplay();
        }
        
        // Highlight the corresponding time button
        this.highlightTimeButton(latestImage.displayTime);
        
        console.log(`📸 Latest image loaded: ${latestImage.originalFilename || latestImage.filename}`);
        console.log(`📅 Date set to: ${this.currentDate.toDateString()}`);
    }

    /**
     * Display an image in the result container
     */
    displayImage(imageInfo) {
        this.currentImage = imageInfo;
        
        // Show loading state
        this.showLoading();
        
        // Create image element
        const img = document.createElement('img');
        img.src = this.buildImageURL(imageInfo.originalFilename);
        img.alt = `Lottery Result - ${this.formatDateForDisplay(imageInfo.date)} ${imageInfo.displayTime}`;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 0;
        `;
        
        // Handle image load success
        img.onload = () => {
            this.resultContainer.innerHTML = '';
            this.resultContainer.appendChild(img);
            this.updateDownloadLink();
        };
        
        // Handle image load error
        img.onerror = () => {
            this.showImageNotFound(imageInfo);
        };
    }

    /**
     * Show loading spinner
     */
    showLoading() {
        this.resultContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div>Loading image...</div>
            </div>
        `;
    }

    /**
     * Show image not found message (for existing images that fail to load)
     */
    showImageNotFound(imageInfo) {
        this.resultContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">📷</div>
                <h3>Image Failed to Load</h3>
                <p>Could not load image: ${imageInfo.originalFilename}</p>
                <p style="font-size: 0.875rem; margin-top: 1rem; opacity: 0.8;">
                    If you renamed the file, click refresh to reload the image list
                </p>
                <button onclick="imageWeb.refreshImages()" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; border: none; background: var(--primary-color); color: white; border-radius: 0.5rem; cursor: pointer;">
                    Refresh Images
                </button>
            </div>
        `;
    }

    /**
     * Show message when no image exists for selected date/time
     */
    showNoImageForDateTime(date, timeValue) {
        this.resultContainer.innerHTML = `
            <div class="image-placeholder">
                <div class="image-icon">🎫</div>
                <div>
                    <div>No Result Available</div>
                    <div style="font-size: 0.8125rem; margin-top: 0.5rem; opacity: 0.8;">
                        No lottery result found for ${this.formatDateForDisplay(date)} ${timeValue}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Show message when no images are available
     */
    showNoImageMessage() {
        this.resultContainer.innerHTML = `
            <div class="image-placeholder">
                <div class="image-icon">🎫</div>
                <div>
                    <div>No Images Available</div>
                    <div style="font-size: 0.8125rem; margin-top: 0.5rem; opacity: 0.8;">
                        Add images with format: DD-MM-YYYY HHpm.extension
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Show image placeholder with custom message
     */
    showImagePlaceholderWithMessage(message) {
        this.resultContainer.innerHTML = `
            <div class="image-placeholder">
                <div class="image-icon">🎫</div>
                <div>
                    <div>${message}</div>
                    <div style="font-size: 0.8125rem; margin-top: 0.5rem; opacity: 0.8;">
                        Please wait while we load your lottery results...
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Handle date picker change
     */
    handleDateChange() {
        let selectedDate;
        if (this.currentDate) {
            selectedDate = new Date(this.currentDate);
        } else if (this.datePicker.value) {
            selectedDate = new Date(this.datePicker.value + 'T00:00:00');
        } else {
            selectedDate = new Date(); // fallback to today
        }
        
        console.log(`📅 Date changed: ${selectedDate.toDateString()}`);
        this.findAndDisplayImageForDate(selectedDate);
    }

    /**
     * Handle time button click
     */
    handleTimeButtonClick(button) {
        const timeValue = button.getAttribute('data-time');
        
        // Mark that user has interacted (no longer initial load)
        this.isInitialLoad = false;
        this.allowAutoUpgrade = true; // Allow auto-upgrades after user interaction
        
        // Use currentDate from custom picker instead of hidden input
        let selectedDate;
        if (this.currentDate) {
            selectedDate = new Date(this.currentDate);
        } else if (this.datePicker.value) {
            selectedDate = new Date(this.datePicker.value + 'T00:00:00');
        } else {
            selectedDate = new Date(); // fallback to today
        }
        
        console.log(`🎯 Time button clicked: ${timeValue}`);
        console.log(`📅 Using date: ${selectedDate.toDateString()}`);
        
        this.highlightTimeButton(timeValue);
        this.findAndDisplayImageForDateTime(selectedDate, timeValue);
    }

    /**
     * Highlight the selected time button
     */
    highlightTimeButton(timeValue) {
        this.timeButtons.forEach(btn => btn.classList.remove('selected'));
        const targetButton = document.querySelector(`[data-time="${timeValue}"]`);
        if (targetButton) {
            targetButton.classList.add('selected');
        }
    }

    /**
     * Find and display image for specific date and time
     * Enhanced with server-side API support for faster lookups
     */
    async findAndDisplayImageForDateTime(date, timeValue) {
        console.log(`🔍 Looking for image: date=${date.toDateString()}, time=${timeValue}`);
        
        // Format the date to match filename pattern (DD-MM-YYYY)
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        
        console.log(`📅 Formatted date: ${dateStr}`);
        console.log(`⏰ Time: ${timeValue}`);
        
        // Try server-side API first
        const serverResult = await this.findImageOnServer(dateStr, timeValue);
        if (serverResult) {
            console.log(`🚀 Server found image: ${serverResult.filename}`);
            // Convert server format to client format
            const parsed = {
                originalFilename: serverResult.filename,
                filename: serverResult.filename,
                date: new Date(serverResult.year, serverResult.month - 1, serverResult.day, serverResult.hour24, 0, 0),
                day: serverResult.day,
                month: serverResult.month,
                year: serverResult.year,
                hour: serverResult.hour,
                period: serverResult.period,
                hour24: serverResult.hour24,
                displayTime: serverResult.displayTime,
                timestamp: serverResult.timestamp
            };
            
            this.displayImage(parsed);
            return;
        }
        
        // Fallback to client-side search
        console.log('📡 Server API unavailable, using client-side search...');
        await this.findImageClientSide(dateStr, timeValue, date);
    }
    
    /**
     * Find image using server-side API
     */
    async findImageOnServer(dateStr, timeValue) {
        try {
            const response = await fetch(`api/get-images.php?action=find&date=${encodeURIComponent(dateStr)}&time=${encodeURIComponent(timeValue)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.found && data.image) {
                return data.image;
            }
            
            return null;
            
        } catch (error) {
            console.log('⚠️ Server-side find failed:', error.message);
            return null;
        }
    }
    
    /**
     * Find image using client-side method (fallback)
     */
    async findImageClientSide(dateStr, timeValue, date) {
        // List of possible extensions to check
        const extensions = ['webp', 'jpeg', 'jpg', 'png', 'gif', 'bmp'];
        
        // Check all possible filename combinations with and without "File " prefix
        const filenamePrefixes = ['', 'File '];
        
        for (const prefix of filenamePrefixes) {
            for (const ext of extensions) {
                const filename = `${prefix}${dateStr} ${timeValue}.${ext}`;
                console.log(`🔍 Checking file: ${filename}`);
                
                try {
                    const imageExists = await this.checkImageExists(filename);
                    console.log(`📁 File ${filename} exists: ${imageExists}`);
                    
                    if (imageExists) {
                        console.log(`✅ Found matching file: ${filename}`);
                        
                        // Parse the found image to create image info
                        const parsed = this.parseImageName(filename);
                        if (parsed) {
                            console.log(`📝 Successfully parsed: ${filename}`);
                            console.log(`   Date: ${parsed.date.toDateString()}`);
                            console.log(`   Display Time: ${parsed.displayTime}`);
                            
                            this.displayImage(parsed);
                            return; // Found and displayed, exit
                        } else {
                            console.log(`❌ Failed to parse: ${filename}`);
                        }
                    } else {
                        console.log(`❌ File does not exist: ${filename}`);
                    }
                } catch (error) {
                    console.log(`💥 Error checking ${filename}:`, error);
                }
            }
        }
        
        // If we get here, no file was found
        console.log(`❌ No matching file found for ${dateStr} ${timeValue}`);
        this.showNoImageForDateTime(date, timeValue);
        this.currentImage = null;
        this.updateDownloadLink();
    }

    /**
     * Find and display image for specific date (any time) with correct time priority
     */
    findAndDisplayImageForDate(date) {
        const imagesForDate = this.availableImages.filter(img => 
            img.date.toDateString() === date.toDateString()
        );
        
        if (imagesForDate.length > 0) {
            // Select the image with highest priority time (8pm > 6pm > 1pm)
            const priorityImage = this.selectImageByTimePriority(imagesForDate);
            this.displayImage(priorityImage);
            this.highlightTimeButton(priorityImage.displayTime);
        } else {
            // Try client-side search for this date with priority order
            this.findImageForDateWithPriority(date);
        }
    }


    /**
     * Update download link with enhanced functionality
     */
    updateDownloadLink() {
        if (this.currentImage) {
            this.downloadLink.href = this.currentImage.originalFilename;
            this.downloadLink.download = this.generateDownloadFilename();
            this.downloadLink.style.opacity = '1';
            this.downloadLink.style.pointerEvents = 'auto';
            this.downloadLink.setAttribute('aria-label', `Download lottery result for ${this.formatDateForDisplay(this.currentImage.date)} ${this.currentImage.displayTime}`);
            
            // Update button text for smartwatch screens
            if (window.innerWidth <= 250) {
                this.downloadLink.innerHTML = `
                    <svg class="download-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Get PDF
                `;
            } else {
                this.downloadLink.innerHTML = `
                    <svg class="download-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download Result
                `;
            }
        } else {
            this.downloadLink.href = '#';
            this.downloadLink.removeAttribute('download');
            this.downloadLink.style.opacity = '0.5';
            this.downloadLink.style.pointerEvents = 'none';
            this.downloadLink.setAttribute('aria-label', 'No image available to download');
            
            // Update disabled button text
            if (window.innerWidth <= 250) {
                this.downloadLink.innerHTML = `
                    <svg class="download-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    No PDF
                `;
            } else {
                this.downloadLink.innerHTML = `
                    <svg class="download-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download Result
                `;
            }
        }
    }

    /**
     * Generate a user-friendly filename for download
     */
    generateDownloadFilename() {
        if (!this.currentImage) return '';
        
        const dateStr = this.formatDateForDisplay(this.currentImage.date);
        const timeStr = this.currentImage.displayTime;
        const extension = this.currentImage.originalFilename.split('.').pop();
        
        return `Nagaland-Lottery-Result-${dateStr}-${timeStr}.${extension}`;
    }

    /**
     * Handle download button click with enhanced smartwatch support
     */
    handleDownload(event) {
        if (!this.currentImage) {
            event.preventDefault();
            this.showSmartWatchFriendlyAlert('No lottery result available to download');
            return;
        }
        
        // Provide feedback for download action
        if (window.innerWidth <= 250) {
            // For smartwatch, show a brief confirmation
            this.showDownloadFeedback();
        }
    }
    
    /**
     * Show smartwatch-friendly alerts
     */
    showSmartWatchFriendlyAlert(message) {
        if (window.innerWidth <= 250) {
            // Short, concise message for tiny screens
            alert(message);
        } else {
            alert(message);
        }
    }
    
    /**
     * Show download feedback for smartwatch users
     */
    showDownloadFeedback() {
        if (window.innerWidth <= 250) {
            // Brief visual feedback
            const originalText = this.downloadLink.innerHTML;
            this.downloadLink.innerHTML = `
                <svg class="download-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Downloading...
            `;
            
            setTimeout(() => {
                this.updateDownloadLink();
            }, 1500);
        }
    }

    /**
     * Setup automatic refresh every 2 minutes
     */
    setupAutoRefresh() {
        // Clear any existing interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        
        // Set up auto-refresh every 2 minutes (120000ms)
        this.autoRefreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing images...');
            this.refreshImages();
        }, 120000);
        
        console.log('⏰ Auto-refresh setup: checking for new images every 2 minutes');
    }
    
    /**
     * Refresh available images (useful for real-time updates)
     */
    async refreshImages() {
        // Clear server cache if available
        try {
            await fetch('api/get-images.php?action=clear-cache');
            console.log('🧹 Server cache cleared');
        } catch (error) {
            console.log('⚠️ Could not clear server cache:', error.message);
        }
        
        // Reload images
        await this.loadAvailableImages();
        
        // Re-run priority search to find newest images
        await this.loadPriorityImageInBackground();
        
        console.log('✅ Images refreshed successfully');
    }
    
    /**
     * Force refresh with user feedback
     */
    async forceRefreshImages() {
        console.log('🔄 FORCE REFRESH: User requested image refresh');
        
        // Show loading message
        this.showImagePlaceholderWithMessage('Refreshing lottery results...');
        
        // Clear all caches
        try {
            await fetch('api/get-images.php?action=clear-cache', {
                cache: 'no-store'
            });
            console.log('🧹 Server cache cleared');
        } catch (error) {
            console.log('⚠️ Could not clear server cache:', error.message);
        }
        
        // Reset available images
        this.availableImages = [];
        this.currentImage = null;
        
        // Force reload from scratch
        await this.loadPriorityImageInBackground();
        
        console.log('✅ Force refresh completed');
    }
    
    /**
     * Hard refresh with cache busting
     */
    async hardRefreshImages() {
        console.log('💥 HARD REFRESH: Bypassing all caches');
        
        // Show loading message
        this.showImagePlaceholderWithMessage('Hard refreshing with cache bypass...');
        
        // Clear server cache with cache busting
        try {
            const cacheBuster = Date.now();
            await fetch(`api/get-images.php?action=clear-cache&_t=${cacheBuster}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log('💥 Server cache cleared with cache busting');
        } catch (error) {
            console.log('⚠️ Could not clear server cache:', error.message);
        }
        
        // Reset everything
        this.availableImages = [];
        this.currentImage = null;
        
        // Force complete reload with cache busting for images
        await this.loadPriorityImageInBackgroundWithCacheBust();
        
        console.log('💥 Hard refresh completed');
    }
    
    /**
     * Load priority images with cache busting
     */
    async loadPriorityImageInBackgroundWithCacheBust() {
        console.log('🔍 CACHE BUST: Loading images with cache bypass...');
        
        const cacheBuster = Date.now();
        
        try {
            const today = new Date();
            const todayStr = this.formatDateForFilename(today);
            const priorityTimes = ['8pm', '6pm', '1pm'];
            const extensions = ['webp', 'jpeg', 'jpg', 'png'];
            
            // Check today's images with cache busting
            for (const time of priorityTimes) {
                for (const ext of extensions) {
                    const filename = `${todayStr} ${time}.${ext}`;
                    console.log(`💥 CACHE BUST: Checking ${filename}...`);
                    
                    try {
                        const exists = await this.checkImageExistsWithCacheBust(filename, cacheBuster);
                        if (exists) {
                            const parsed = this.parseImageName(filename);
                            if (parsed) {
                                console.log(`💥 CACHE BUST: Found fresh image: ${filename}`);
                                
                                this.currentImage = parsed;
                                this.displayImageWithCacheBust(parsed, cacheBuster);
                                this.currentDate = new Date(parsed.date);
                                this.datePicker.value = this.formatDateForInput(parsed.date);
                                
                                if (this.dateText) {
                                    this.updateDateDisplay();
                                }
                                
                                this.highlightTimeButton(parsed.displayTime);
                                return;
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }
            
            // If no today's images, check recent days
            for (let daysBack = 1; daysBack <= 3; daysBack++) {
                const date = new Date(today);
                date.setDate(today.getDate() - daysBack);
                const dateStr = this.formatDateForFilename(date);
                
                for (const time of priorityTimes) {
                    for (const ext of extensions) {
                        const filename = `${dateStr} ${time}.${ext}`;
                        
                        try {
                            const exists = await this.checkImageExistsWithCacheBust(filename, cacheBuster);
                            if (exists) {
                                const parsed = this.parseImageName(filename);
                                if (parsed) {
                                    console.log(`💥 CACHE BUST: Found image: ${filename}`);
                                    
                                    this.currentImage = parsed;
                                    this.displayImageWithCacheBust(parsed, cacheBuster);
                                    this.currentDate = new Date(parsed.date);
                                    this.datePicker.value = this.formatDateForInput(parsed.date);
                                    
                                    if (this.dateText) {
                                        this.updateDateDisplay();
                                    }
                                    
                                    this.highlightTimeButton(parsed.displayTime);
                                    return;
                                }
                            }
                        } catch (error) {
                            continue;
                        }
                    }
                }
            }
            
            console.log('💥 CACHE BUST: No new images found');
            this.showImagePlaceholderWithMessage('No lottery results found');
            
        } catch (error) {
            console.log('💥 CACHE BUST: Error during cache bust refresh:', error);
            this.showImagePlaceholderWithMessage('Error refreshing images');
        }
    }
    
    /**
     * Check image existence with cache busting
     */
    async checkImageExistsWithCacheBust(filename, cacheBuster) {
        return new Promise((resolve) => {
            const img = new Image();
            let resolved = false;
            
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            }, 1000);
            
            img.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(true);
                }
            };
            
            img.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(false);
                }
            };
            
            // Add cache buster to image URL
            img.src = `${filename}?_t=${cacheBuster}`;
        });
    }
    
    /**
     * Display image with cache busting
     */
    displayImageWithCacheBust(imageInfo, cacheBuster) {
        this.currentImage = imageInfo;
        
        // Create image element with cache buster
        const img = document.createElement('img');
        img.src = `${imageInfo.originalFilename}?_t=${cacheBuster}`;
        img.alt = `Lottery Result - ${this.formatDateForDisplay(imageInfo.date)} ${imageInfo.displayTime}`;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 0;
        `;
        
        // Show loading first
        this.showLoading();
        
        // Handle image load
        img.onload = () => {
            this.resultContainer.innerHTML = '';
            this.resultContainer.appendChild(img);
            this.updateDownloadLink();
            console.log(`💥 Fresh image displayed with cache bust: ${imageInfo.originalFilename}`);
        };
        
        img.onerror = () => {
            this.showImageNotFound(imageInfo);
        };
    }

    /**
     * Get image info by filename
     */
    getImageInfo(filename) {
        return this.availableImages.find(img => img.originalFilename === filename);
    }

    /**
     * Get all images for a specific date
     */
    getImagesForDate(date) {
        return this.availableImages.filter(img => 
            img.date.toDateString() === date.toDateString()
        );
    }

    /**
     * Get the latest image
     */
    getLatestImage() {
        return this.availableImages.length > 0 ? this.availableImages[0] : null;
    }
    
    /**
     * Toggle calendar visibility
     */
    toggleCalendar() {
        if (this.isCalendarOpen) {
            this.hideCalendar();
        } else {
            this.showCalendar();
        }
    }
    
    /**
     * Show calendar
     */
    showCalendar() {
        this.datePickerCalendar.classList.add('show');
        this.isCalendarOpen = true;
        this.renderCalendar();
    }
    
    /**
     * Hide calendar
     */
    hideCalendar() {
        this.datePickerCalendar.classList.remove('show');
        this.isCalendarOpen = false;
    }
    
    /**
     * Navigate to different month
     */
    navigateMonth(direction) {
        this.displayedMonth.setMonth(this.displayedMonth.getMonth() + direction);
        this.renderCalendar();
    }
    
    /**
     * Update the date display text
     */
    updateDateDisplay() {
        const day = String(this.currentDate.getDate()).padStart(2, '0');
        const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
        const year = this.currentDate.getFullYear();
        
        this.dateText.textContent = `${day}/${month}/${year}`;
        
        // Update hidden input for form compatibility
        this.datePicker.value = this.formatDateForInput(this.currentDate);
    }
    
    /**
     * Render calendar grid
     */
    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const month = monthNames[this.displayedMonth.getMonth()];
        const year = this.displayedMonth.getFullYear();
        
        // Update month/year display
        this.calendarMonthYear.textContent = `${month} ${year}`;
        
        // Clear existing days
        this.calendarDays.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(this.displayedMonth.getFullYear(), this.displayedMonth.getMonth(), 1);
        const lastDay = new Date(this.displayedMonth.getFullYear(), this.displayedMonth.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add previous month's trailing days
        const prevMonth = new Date(this.displayedMonth.getFullYear(), this.displayedMonth.getMonth() - 1, 0);
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonth.getDate() - i;
            this.createCalendarDay(day, true, new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day));
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.displayedMonth.getFullYear(), this.displayedMonth.getMonth(), day);
            this.createCalendarDay(day, false, date);
        }
        
        // Add next month's leading days to fill the grid
        const totalCells = this.calendarDays.children.length;
        const remainingCells = 42 - totalCells; // 6 weeks × 7 days
        const nextMonth = new Date(this.displayedMonth.getFullYear(), this.displayedMonth.getMonth() + 1, 1);
        
        for (let day = 1; day <= Math.min(remainingCells, 14); day++) {
            const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
            this.createCalendarDay(day, true, date);
        }
    }
    
    /**
     * Create a calendar day element
     */
    createCalendarDay(dayNumber, isOtherMonth, date) {
        const dayElement = document.createElement('button');
        dayElement.type = 'button';
        dayElement.className = 'calendar-day';
        dayElement.textContent = dayNumber;
        
        // Add classes based on day type
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Check if it's today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Check if it's the selected date
        if (date.toDateString() === this.currentDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        // Check if there are lottery results for this date
        const hasResults = this.availableImages.some(img => 
            img.date.toDateString() === date.toDateString()
        );
        
        if (hasResults) {
            dayElement.classList.add('has-result');
            dayElement.title = `Lottery results available for ${date.toDateString()}`;
        }
        
        // Add click event
        dayElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectDate(new Date(date));
        });
        
        this.calendarDays.appendChild(dayElement);
    }
    
    /**
     * Select a date from the calendar
     */
    selectDate(date) {
        // Mark that user has interacted (no longer initial load)
        this.isInitialLoad = false;
        this.allowAutoUpgrade = true; // Allow auto-upgrades after user interaction
        
        this.currentDate = new Date(date);
        this.updateDateDisplay();
        this.hideCalendar();
        
        console.log(`🗓️ Date selected: ${this.currentDate.toDateString()}`);
        
        // Trigger date change event for image loading
        this.handleDateChange();
    }
    
    /**
     * Select image by time priority: 8pm > 6pm > 1pm
     */
    selectImageByTimePriority(images) {
        const timePriority = ['8pm', '6pm', '1pm'];
        
        // Find the highest priority time available
        for (const preferredTime of timePriority) {
            const found = images.find(img => img.displayTime === preferredTime);
            if (found) {
                console.log(`🎯 Selected ${preferredTime} image as highest priority`);
                return found;
            }
        }
        
        // Fallback to first available image if none of the preferred times found
        console.log('⚠️ No priority times found, using first available');
        return images[0];
    }
    
    /**
     * Find image for date with priority order (8pm > 6pm > 1pm)
     */
    async findImageForDateWithPriority(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        
        const timePriority = ['8pm', '6pm', '1pm'];
        const extensions = ['webp', 'jpeg', 'jpg', 'png', 'gif', 'bmp'];
        const prefixes = ['', 'File '];
        
        console.log(`🔍 Searching for images on ${dateStr} with priority order: ${timePriority.join(' > ')}`);
        
        // Try each time in priority order
        for (const time of timePriority) {
            console.log(`⏰ Checking for ${time} draw...`);
            
            // Try server-side API first
            const serverResult = await this.findImageOnServer(dateStr, time);
            if (serverResult) {
                console.log(`🚀 Server found ${time} image: ${serverResult.filename}`);
                const parsed = {
                    originalFilename: serverResult.filename,
                    filename: serverResult.filename,
                    date: new Date(serverResult.year, serverResult.month - 1, serverResult.day, serverResult.hour24, 0, 0),
                    day: serverResult.day,
                    month: serverResult.month,
                    year: serverResult.year,
                    hour: serverResult.hour,
                    period: serverResult.period,
                    hour24: serverResult.hour24,
                    displayTime: serverResult.displayTime,
                    timestamp: serverResult.timestamp
                };
                
                this.displayImage(parsed);
                this.highlightTimeButton(parsed.displayTime);
                return; // Found highest priority, exit
            }
            
            // Fallback to client-side search
            for (const prefix of prefixes) {
                for (const ext of extensions) {
                    const filename = `${prefix}${dateStr} ${time}.${ext}`;
                    
                    try {
                        const imageExists = await this.checkImageExists(filename);
                        if (imageExists) {
                            const parsed = this.parseImageName(filename);
                            if (parsed) {
                                console.log(`✅ Found ${time} image: ${filename}`);
                                this.displayImage(parsed);
                                this.highlightTimeButton(parsed.displayTime);
                                return; // Found highest priority, exit
                            }
                        }
                    } catch (error) {
                        // Continue to next option
                        continue;
                    }
                }
            }
        }
        
        // If no images found for any priority time, show no results
        console.log(`❌ No images found for ${dateStr} in any time slot`);
        this.showNoImageForDateTime(date, 'any time');
        this.currentImage = null;
        this.updateDownloadLink();
        this.timeButtons.forEach(btn => btn.classList.remove('selected'));
    }


}

// Initialize the application when DOM is loaded
let imageWeb;

document.addEventListener('DOMContentLoaded', function() {
    imageWeb = new ImageWebController();
    console.log('Image Web initialized successfully!');
});

// Export for global access
window.ImageWeb = ImageWebController;
