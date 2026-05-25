// ========== VMB CINEMAZ HEADER - HARDCORE LOGIN & INTERACTIONS ==========
// This script handles:
// 1. Hardcoded admin/user login validation
// 2. Dynamic UI switching (Login button ↔ Admin Panel)
// 3. Location selection with localStorage persistence
// 4. Search bar placeholder interactions
// 5. Modal open/close & responsiveness

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    // ---------- DOM Elements ----------
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const loginErrorMsg = document.getElementById('loginErrorMsg');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    const adminPanel = document.getElementById('adminPanel');
    const adminNameDisplay = document.getElementById('adminNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    const locationSelect = document.getElementById('locationSelect');
    const searchInput = document.getElementById('searchInput');
    
    // ---------- Hardcoded Credentials (Admin & Regular User) ----------
    // Format: { username: 'xxx', password: 'xxx', displayName: 'xxx', role: 'admin' or 'user' }
    const VALID_CREDENTIALS = [
        { username: 'admin', password: 'admin123', displayName: 'Admin Raj', role: 'admin' },
        { username: 'user', password: 'user123', displayName: 'Movie Fan', role: 'user' },
        { username: 'vmb', password: 'cinemaz2025', displayName: 'VMB Manager', role: 'admin' },
        { username: 'demo', password: 'demo123', displayName: 'Demo User', role: 'user' }
    ];
    
    // ---------- Session State (hardcore, no backend - just localStorage) ----------
    let isLoggedIn = false;
    let currentUser = null;
    
    // Check existing session on page load
    function checkSession() {
        const savedSession = localStorage.getItem('vmb_session');
        if (savedSession) {
            try {
                const sessionData = JSON.parse(savedSession);
                // Validate if session is not expired (simple timestamp check - 24 hours)
                const now = Date.now();
                if (sessionData.expiry && sessionData.expiry > now) {
                    isLoggedIn = true;
                    currentUser = sessionData.user;
                    updateUIForLoggedInUser();
                } else {
                    // Session expired
                    localStorage.removeItem('vmb_session');
                    isLoggedIn = false;
                    currentUser = null;
                    updateUIForLoggedOutUser();
                }
            } catch(e) {
                localStorage.removeItem('vmb_session');
                updateUIForLoggedOutUser();
            }
        } else {
            updateUIForLoggedOutUser();
        }
    }
    
    // Save session to localStorage (expires in 24 hours)
    function saveSession(userData) {
        const session = {
            user: userData,
            expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('vmb_session', JSON.stringify(session));
        isLoggedIn = true;
        currentUser = userData;
        updateUIForLoggedInUser();
    }
    
    // Clear session (logout)
    function clearSession() {
        localStorage.removeItem('vmb_session');
        isLoggedIn = false;
        currentUser = null;
        updateUIForLoggedOutUser();
        // Show logout toast message
        showToast('🔓 Logged out successfully!', '#c084fc');
    }
    
    // Update UI after login (hide login button, show admin panel)
    function updateUIForLoggedInUser() {
        if (loginBtn) loginBtn.style.display = 'none';
        if (adminPanel) {
            adminPanel.style.display = 'flex';
            if (adminNameDisplay && currentUser) {
                adminNameDisplay.textContent = currentUser.displayName;
                // Add crown icon for admin role
                const crownIcon = adminPanel.querySelector('i');
                if (crownIcon) {
                    if (currentUser.role === 'admin') {
                        crownIcon.className = 'fas fa-crown';
                        crownIcon.style.color = '#facc15';
                    } else {
                        crownIcon.className = 'fas fa-user-check';
                        crownIcon.style.color = '#c084fc';
                    }
                }
            }
        }
        // Close modal if open
        if (loginModal) loginModal.style.display = 'none';
        // Clear error message
        if (loginErrorMsg) loginErrorMsg.textContent = '';
        if (loginUsername) loginUsername.value = '';
        if (loginPassword) loginPassword.value = '';
        
        // Show welcome toast
        showToast(`✨ Welcome back, ${currentUser?.displayName || 'User'}!`, '#facc15');
    }
    
    // Update UI for logged out state
    function updateUIForLoggedOutUser() {
        if (loginBtn) loginBtn.style.display = 'flex';
        if (adminPanel) adminPanel.style.display = 'none';
    }
    
    // Helper: Show temporary message (toast style)
    function showToast(message, bgColor = '#6b21a5') {
        // Create toast element if not exists
        let toast = document.querySelector('.vmb-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'vmb-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.right = '20px';
            toast.style.backgroundColor = bgColor;
            toast.style.color = 'white';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '40px';
            toast.style.fontSize = '0.9rem';
            toast.style.fontWeight = '500';
            toast.style.zIndex = '9999';
            toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
            toast.style.borderLeft = `4px solid #facc15`;
            toast.style.fontFamily = "'Poppins', sans-serif";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.backgroundColor = bgColor;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
    
    // ---------- Login Validation (Hardcore) ----------
    function validateLogin(username, password) {
        // Trim and check
        const trimmedUser = username.trim();
        const trimmedPass = password.trim();
        
        const found = VALID_CREDENTIALS.find(cred => 
            cred.username.toLowerCase() === trimmedUser.toLowerCase() && 
            cred.password === trimmedPass
        );
        
        if (found) {
            // Return user data without password
            return {
                username: found.username,
                displayName: found.displayName,
                role: found.role,
                loginTime: new Date().toISOString()
            };
        }
        return null;
    }
    
    // Handle login button click
    function handleLogin() {
        if (!loginModal) return;
        loginModal.style.display = 'flex';
        if (loginErrorMsg) loginErrorMsg.textContent = '';
        if (loginUsername) loginUsername.value = '';
        if (loginPassword) loginPassword.value = '';
        // Focus on username field
        setTimeout(() => {
            if (loginUsername) loginUsername.focus();
        }, 100);
    }
    
    // Handle submit login
    function handleSubmitLogin() {
        const username = loginUsername ? loginUsername.value : '';
        const password = loginPassword ? loginPassword.value : '';
        
        if (!username || !password) {
            if (loginErrorMsg) loginErrorMsg.textContent = '❌ Please enter both username and password';
            return;
        }
        
        const userData = validateLogin(username, password);
        if (userData) {
            // Successful login
            saveSession(userData);
        } else {
            if (loginErrorMsg) loginErrorMsg.textContent = '❌ Invalid credentials! Try: admin/admin123 or user/user123';
            // Shake animation for error
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'shake 0.3s ease-in-out';
                setTimeout(() => {
                    modalContent.style.animation = '';
                }, 300);
            }
        }
    }
    
    // Add shake keyframes dynamically
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Handle logout
    function handleLogout() {
        clearSession();
    }
    
    // Close modal (click on X or outside)
    function closeModal() {
        if (loginModal) loginModal.style.display = 'none';
        if (loginErrorMsg) loginErrorMsg.textContent = '';
    }
    
    // ---------- Location Selection with Persistence ----------
    function initLocationSelector() {
        const savedLocation = localStorage.getItem('vmb_location');
        if (savedLocation && locationSelect) {
            // Check if option exists
            let optionExists = false;
            for(let i = 0; i < locationSelect.options.length; i++) {
                if(locationSelect.options[i].value === savedLocation) {
                    optionExists = true;
                    break;
                }
            }
            if(optionExists) {
                locationSelect.value = savedLocation;
            } else {
                locationSelect.value = 'mumbai';
            }
        } else {
            if(locationSelect) locationSelect.value = 'mumbai';
        }
        
        // Event listener for location change
        if(locationSelect) {
            locationSelect.addEventListener('change', function(e) {
                const selectedLocation = e.target.value;
                localStorage.setItem('vmb_location', selectedLocation);
                // Get selected option text
                const selectedText = e.target.options[e.target.selectedIndex]?.text || selectedLocation;
                showToast(`📍 Location changed to ${selectedText}`, '#9333ea');
                
                // Optional: You can dispatch custom event for other parts of website
                const locationEvent = new CustomEvent('locationChanged', { 
                    detail: { location: selectedLocation, locationName: selectedText }
                });
                window.dispatchEvent(locationEvent);
            });
        }
    }
    
    // ---------- Search Bar Functionality (non-functional demo but interactive) ----------
    function initSearchBar() {
        if(!searchInput) return;
        
        searchInput.addEventListener('keypress', function(e) {
            if(e.key === 'Enter') {
                const query = searchInput.value.trim();
                if(query) {
                    showToast(`🔍 Searching for "${query}"... (Demo mode)`, '#facc15');
                    // In future: redirect to search results page
                    console.log(`Search initiated for: ${query}`);
                } else {
                    showToast(`📝 Please enter something to search`, '#6b21a5');
                }
            }
        });
        
        // Optional: add search icon click
        const searchIcon = document.querySelector('.search-icon');
        if(searchIcon) {
            searchIcon.addEventListener('click', function() {
                const query = searchInput.value.trim();
                if(query) {
                    showToast(`🔍 Searching for "${query}"...`, '#facc15');
                } else {
                    showToast(`✨ Type movie name, then press Enter`, '#c084fc');
                }
            });
        }
    }
    
    // ---------- Responsive Nav Link Active State (simple highlight) ----------
    function initNavActiveState() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            // Remove active class from all
            link.classList.remove('active');
            // If href matches current hash or just for demo set Home active by default
            const href = link.getAttribute('href');
            if (href === '#' && currentPath === '/' || href === '#' && link.textContent.trim() === 'Home') {
                link.classList.add('active');
            }
        });
        
        // Add click handlers to update active state dynamically
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                // For demo purposes, show simple toast for menu click
                const menuText = this.textContent.trim();
                showToast(`📱 Navigating to ${menuText} (Demo)`, '#6b21a5');
            });
        });
    }
    
    // ---------- Event Listeners ----------
    if(loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    if(submitLoginBtn) {
        submitLoginBtn.addEventListener('click', handleSubmitLogin);
    }
    
    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if(logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Close modal when clicking outside modal content
    if(loginModal) {
        window.addEventListener('click', function(e) {
            if(e.target === loginModal) {
                closeModal();
            }
        });
    }
    
    // Also allow Enter key in login form
    if(loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if(e.key === 'Enter') {
                e.preventDefault();
                handleSubmitLogin();
            }
        });
    }
    if(loginUsername) {
        loginUsername.addEventListener('keypress', function(e) {
            if(e.key === 'Enter') {
                e.preventDefault();
                if(loginPassword) loginPassword.focus();
            }
        });
    }
    
    // Initialize all features
    function init() {
        checkSession();
        initLocationSelector();
        initSearchBar();
        initNavActiveState();
        
        // Optional: Demo console log
        console.log('VMB Cinemaz Header - Fully Loaded | Hardcore Login Active');
        console.log('Available credentials: admin/admin123, user/user123, vmb/cinemaz2025, demo/demo123');
    }
    
    init();
});

// Additional CSS for toast (dynamic but ensure it looks good)
(function addToastStyles() {
    if(!document.querySelector('#vmb-toast-style')) {
        const style = document.createElement('style');
        style.id = 'vmb-toast-style';
        style.textContent = `
            .vmb-toast {
                animation: slideInRight 0.3s ease-out;
                font-family: 'Poppins', sans-serif;
                backdrop-filter: blur(8px);
                background: rgba(107, 33, 165, 0.95) !important;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            /* Additional responsive adjustments for modal */
            @media (max-width: 480px) {
                .modal-content {
                    margin: 1rem;
                    padding: 1.2rem;
                }
                .modal-content h3 {
                    font-size: 1.3rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();


// Hero Banner Auto-Swipe Carousel
class HeroBanner {
    constructor() {
        this.track = document.getElementById('bannerTrack');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.slides = document.querySelectorAll('.banner-slide');
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.autoSlideInterval = null;
        this.intervalTime = 5000; // 5 seconds
        
        this.init();
    }
    
    init() {
        // Set initial position
        this.updateCarousel();
        
        // Add event listeners
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // Add dot click events
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Start auto sliding
        this.startAutoSlide();
        
        // Pause on hover
        const container = document.querySelector('.banner-container');
        container.addEventListener('mouseenter', () => this.stopAutoSlide());
        container.addEventListener('mouseleave', () => this.startAutoSlide());
        
        // Touch events for mobile
        this.addTouchEvents();
    }
    
    updateCarousel() {
        // Update track position
        const translateX = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Update active slide class
        this.slides.forEach((slide, index) => {
            if (index === this.currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update dots
        this.dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateCarousel();
        this.resetAutoSlide();
    }
    
    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
        this.resetAutoSlide();
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
        this.resetAutoSlide();
    }
    
    startAutoSlide() {
        if (this.autoSlideInterval) return;
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.intervalTime);
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
    
    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }
    
    addTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        const container = document.querySelector('.banner-container');
        
        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }
    
    handleSwipe(start, end) {
        const swipeThreshold = 50;
        const diff = start - end;
        
        if (Math.abs(diff) < swipeThreshold) return;
        
        if (diff > 0) {
            // Swipe left - next slide
            this.nextSlide();
        } else {
            // Swipe right - previous slide
            this.prevSlide();
        }
    }
}

// Initialize banner when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HeroBanner();
});


// now-showing.js
class NowShowingCarousel {
    constructor() {
        this.track = document.getElementById('moviesTrack');
        this.prevBtn = document.getElementById('swipePrev');
        this.nextBtn = document.getElementById('swipeNext');
        this.progressBar = document.getElementById('scrollProgress');
        this.container = document.querySelector('.movies-container');
        
        this.movies = [
            {
                id: 1,
                title: "Deadpool & Wolverine",
                poster: "https://image.tmdb.org/t/p/w500/8cdWjvZdiOrR4F7BxV1JqUyVh1k.jpg",
                rating: "8.7",
                language: "English",
                duration: "2h 10m",
                genre: "Action, Comedy"
            },
            {
                id: 2,
                title: "Kalki 2898 AD",
                poster: "https://image.tmdb.org/t/p/w500/8xVnz1V2vK5qX5v5aMh5wL5h5L5.jpg",
                rating: "8.9",
                language: "Telugu",
                duration: "3h",
                genre: "Sci-Fi, Epic"
            },
            {
                id: 3,
                title: "Stree 2",
                poster: "https://image.tmdb.org/t/p/w500/6Y9FL8wPqM4Zj5y9sG5nX5v5j5.jpg",
                rating: "7.8",
                language: "Hindi",
                duration: "2h 25m",
                genre: "Horror, Comedy"
            },
            {
                id: 4,
                title: "Pushpa: The Rule",
                poster: "https://image.tmdb.org/t/p/w500/7x8nV5zW4yM6j5X9rL5hW5v5L5.jpg",
                rating: "8.5",
                language: "Telugu",
                duration: "2h 45m",
                genre: "Action, Drama"
            },
            {
                id: 5,
                title: "Furiosa: A Mad Max Saga",
                poster: "https://image.tmdb.org/t/p/w500/8jW5vY5zM4xN6j5rL5hW5v5j5.jpg",
                rating: "8.3",
                language: "English",
                duration: "2h 28m",
                genre: "Action, Adventure"
            },
            {
                id: 6,
                title: "Inside Out 2",
                poster: "https://image.tmdb.org/t/p/w500/6y9FL8wPqM4Zj5y9sG5nX5v5j5.jpg",
                rating: "8.1",
                language: "English",
                duration: "1h 40m",
                genre: "Animation, Comedy"
            },
            {
                id: 7,
                title: "Bad Newz",
                poster: "https://image.tmdb.org/t/p/w500/7x8nV5zW4yM6j5X9rL5hW5v5L5.jpg",
                rating: "7.5",
                language: "Hindi",
                duration: "2h 15m",
                genre: "Comedy, Drama"
            },
            {
                id: 8,
                title: "Maharaja",
                poster: "https://image.tmdb.org/t/p/w500/8jW5vY5zM4xN6j5rL5hW5v5j5.jpg",
                rating: "8.6",
                language: "Tamil",
                duration: "2h 30m",
                genre: "Action, Thriller"
            }
        ];
        
        this.currentScroll = 0;
        this.init();
    }
    
    init() {
        this.renderMovies();
        this.attachEvents();
        this.updateScrollIndicator();
        
        // Add resize observer to update scroll indicator
        window.addEventListener('resize', () => this.updateScrollIndicator());
    }
    
    renderMovies() {
        if (!this.track) return;
        
        this.track.innerHTML = '';
        
        this.movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.setAttribute('data-id', movie.id);
            
            // Using placeholder images since TMDB images might not load without API
            // For production, use actual image URLs
            const posterUrl = movie.poster.includes('tmdb') 
                ? movie.poster 
                : `https://via.placeholder.com/300x400/2a1a4a/facc15?text=${encodeURIComponent(movie.title.substring(0, 10))}`;
            
            card.innerHTML = `
                <div class="movie-poster" style="background-image: linear-gradient(145deg, #3b0764, #1a0a3a), url('${posterUrl}'); background-size: cover; background-blend-mode: overlay;">
                    <div class="poster-overlay"></div>
                    <div class="movie-rating">
                        <i class="fas fa-star"></i> ${movie.rating}
                    </div>
                    <div class="movie-language">
                        <i class="fas fa-language"></i> ${movie.language}
                    </div>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-details">
                        <span><i class="far fa-clock"></i> ${movie.duration}</span>
                        <span><i class="fas fa-tag"></i> ${movie.language}</span>
                    </div>
                    <p class="movie-genre">${movie.genre}</p>
                    <button class="book-btn-card" data-movie="${movie.title}">
                        <i class="fas fa-ticket-alt"></i> Book Tickets
                    </button>
                </div>
            `;
            
            this.track.appendChild(card);
        });
        
        // Add event listeners to book buttons
        document.querySelectorAll('.book-btn-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const movieName = btn.getAttribute('data-movie');
                this.handleBooking(movieName);
            });
        });
    }
    
    attachEvents() {
        // Next button click
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.scrollNext());
        }
        
        // Prev button click
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.scrollPrev());
        }
        
        // Scroll event to update indicator
        if (this.container) {
            this.container.addEventListener('scroll', () => this.updateScrollIndicator());
            
            // Touch events for mobile swipe feedback
            let touchStartX = 0;
            let touchEndX = 0;
            
            this.container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            this.container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.scrollNext();
                    } else {
                        this.scrollPrev();
                    }
                }
            });
        }
    }
    
    scrollNext() {
        if (!this.container) return;
        const cardWidth = this.container.querySelector('.movie-card')?.offsetWidth || 260;
        const gap = 28; // gap between cards (1.8rem ≈ 28px)
        const scrollAmount = cardWidth + gap;
        
        this.container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
    
    scrollPrev() {
        if (!this.container) return;
        const cardWidth = this.container.querySelector('.movie-card')?.offsetWidth || 260;
        const gap = 28;
        const scrollAmount = cardWidth + gap;
        
        this.container.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    }
    
    updateScrollIndicator() {
        if (!this.container || !this.progressBar) return;
        
        const scrollLeft = this.container.scrollLeft;
        const scrollWidth = this.container.scrollWidth - this.container.clientWidth;
        
        if (scrollWidth > 0) {
            const progress = (scrollLeft / scrollWidth) * 100;
            this.progressBar.style.width = `${progress}%`;
        } else {
            this.progressBar.style.width = '0%';
        }
    }
    
    handleBooking(movieName) {
        // Simple booking alert (can be extended later)
        alert(`🎬 Booking initiated for "${movieName}"!\n\nThis feature will be connected to the database in the next phase.`);
        
        // You can trigger modal or redirect here
        console.log(`Booking requested for: ${movieName}`);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NowShowingCarousel();
});

// vmb-premier.js
class VMBPremierSection {
    constructor() {
        this.track = document.getElementById('premierTrack');
        this.prevBtn = document.getElementById('premierPrev');
        this.nextBtn = document.getElementById('premierNext');
        this.dotsContainer = document.getElementById('premierDots');
        this.container = document.querySelector('.premier-container');
        this.exploreLink = document.getElementById('exploreVMBPlus');
        
        // VMB+ Streaming Content Data
        this.shows = [
            {
                id: 1,
                title: "The Crownless King",
                type: "VMB+ Original Series",
                episodes: "10 Episodes",
                duration: "Season 1",
                genre: "Drama, Historical",
                rating: "9.2",
                description: "A royal saga of power, betrayal, and redemption set in ancient kingdom.",
                thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
                vmbplusUrl: "https://www.vmbplus.com/shows/crownless-king"
            },
            {
                id: 2,
                title: "Midnight Heist",
                type: "VMB+ Film",
                episodes: "Movie",
                duration: "2h 15m",
                genre: "Action, Thriller",
                rating: "8.8",
                description: "A high-stakes bank heist turns into a deadly game of cat and mouse.",
                thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
                vmbplusUrl: "https://www.vmbplus.com/movies/midnight-heist"
            },
            {
                id: 3,
                title: "Laugh Factory",
                type: "VMB+ Exclusive",
                episodes: "Stand-up Special",
                duration: "1h 30m",
                genre: "Comedy",
                rating: "8.5",
                description: "Top comedians bring non-stop laughter in this exclusive special.",
                thumbnail: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400",
                vmbplusUrl: "https://www.vmbplus.com/shows/laugh-factory"
            },
            {
                id: 4,
                title: "Echoes of Tomorrow",
                type: "VMB+ Sci-Fi Series",
                episodes: "8 Episodes",
                duration: "Season 2",
                genre: "Sci-Fi, Mystery",
                rating: "9.0",
                description: "Time-bending thriller where past and future collide.",
                thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
                vmbplusUrl: "https://www.vmbplus.com/shows/echoes-tomorrow"
            },
            {
                id: 5,
                title: "Culinary Wars",
                type: "VMB+ Reality Show",
                episodes: "12 Episodes",
                duration: "Season 3",
                genre: "Reality, Cooking",
                rating: "8.3",
                description: "Chefs battle for the ultimate culinary crown.",
                thumbnail: "https://images.unsplash.com/photo-1556910104-525b2e1aa79c?w=400",
                vmbplusUrl: "https://www.vmbplus.com/shows/culinary-wars"
            },
            {
                id: 6,
                title: "The Silent Witness",
                type: "VMB+ Crime Drama",
                episodes: "6 Episodes",
                duration: "Mini-Series",
                genre: "Crime, Thriller",
                rating: "9.1",
                description: "A gripping murder mystery that keeps you guessing.",
                thumbnail: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400",
                vmbplusUrl: "https://www.vmbplus.com/shows/silent-witness"
            },
            {
                id: 7,
                title: "Animeverse",
                type: "VMB+ Anime",
                episodes: "24 Episodes",
                duration: "Season 1",
                genre: "Animation, Action",
                rating: "8.9",
                description: "Epic anime adventures exclusively on VMB+.",
                thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
                vmbplusUrl: "https://www.vmbplus.com/anime/animeverse"
            },
            {
                id: 8,
                title: "Rockstar Diaries",
                type: "VMB+ Documentary",
                episodes: "4 Episodes",
                duration: "Limited Series",
                genre: "Music, Documentary",
                rating: "8.7",
                description: "Behind the scenes of India's biggest rock tour.",
                thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
                vmbplusUrl: "https://www.vmbplus.com/shows/rockstar-diaries"
            }
        ];
        
        this.currentIndex = 0;
        this.autoScrollInterval = null;
        this.init();
    }
    
    init() {
        this.renderCards();
        this.createDots();
        this.attachEvents();
        this.updateDots();
        
        // Optional: Auto-scroll every 5 seconds (gentle)
        this.startAutoScroll();
        
        // Pause on hover
        const premierSection = document.querySelector('.vmb-premier');
        if (premierSection) {
            premierSection.addEventListener('mouseenter', () => this.stopAutoScroll());
            premierSection.addEventListener('mouseleave', () => this.startAutoScroll());
        }
    }
    
    renderCards() {
        if (!this.track) return;
        this.track.innerHTML = '';
        
        this.shows.forEach(show => {
            const card = document.createElement('div');
            card.className = 'premier-card';
            card.setAttribute('data-id', show.id);
            card.setAttribute('data-url', show.vmbplusUrl);
            card.setAttribute('data-title', show.title);
            
            card.innerHTML = `
                <div class="card-thumbnail" style="background-image: linear-gradient(145deg, #2a1a4a, #1a0a3a), url('${show.thumbnail}'); background-size: cover; background-blend-mode: overlay;">
                    <div class="thumbnail-overlay"></div>
                    <div class="exclusive-badge">
                        <i class="fas fa-crown"></i> VMB+ EXCLUSIVE
                    </div>
                    <div class="watch-overlay">
                        <button class="watch-btn" data-url="${show.vmbplusUrl}" data-title="${show.title}">
                            <i class="fas fa-play"></i> Watch Now on VMB+
                        </button>
                    </div>
                </div>
                <div class="card-info">
                    <h3>${show.title}</h3>
                    <div class="meta-info">
                        <span><i class="fas fa-tv"></i> ${show.type}</span>
                        <span><i class="far fa-clock"></i> ${show.duration}</span>
                        <span><i class="fas fa-star" style="color:#facc15"></i> ${show.rating}</span>
                    </div>
                    <p class="description">${show.description}</p>
                </div>
            `;
            
            this.track.appendChild(card);
        });
        
        // Attach watch button listeners after render
        document.querySelectorAll('.watch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.getAttribute('data-url');
                const title = btn.getAttribute('data-title');
                this.openRedirectModal(url, title);
            });
        });
        
        // Also attach click to whole card
        document.querySelectorAll('.premier-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('watch-btn')) return;
                const url = card.getAttribute('data-url');
                const title = card.getAttribute('data-title');
                if (url && title) this.openRedirectModal(url, title);
            });
        });
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';
        const visibleCards = Math.ceil(this.container?.clientWidth / 290) || 3;
        const totalDots = Math.ceil(this.shows.length / visibleCards);
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('div');
            dot.className = 'premier-dot';
            dot.setAttribute('data-index', i);
            dot.addEventListener('click', () => this.scrollToDot(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    updateDots() {
        if (!this.container || !this.dotsContainer) return;
        const scrollLeft = this.container.scrollLeft;
        const cardWidth = 280 + 28; // card width + gap
        const currentPage = Math.floor(scrollLeft / (cardWidth * 2));
        
        const dots = this.dotsContainer.querySelectorAll('.premier-dot');
        dots.forEach((dot, idx) => {
            if (idx === currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    scrollToDot(dotIndex) {
        if (!this.container) return;
        const cardWidth = 280 + 28;
        const visibleCards = Math.floor(this.container.clientWidth / cardWidth);
        const scrollAmount = dotIndex * cardWidth * visibleCards;
        this.container.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
    
    attachEvents() {
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.scroll('next'));
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.scroll('prev'));
        }
        
        if (this.container) {
            this.container.addEventListener('scroll', () => {
                this.updateDots();
                this.resetAutoScrollTimer();
            });
            
            // Touch swipe support
            let touchStart = 0;
            this.container.addEventListener('touchstart', (e) => {
                touchStart = e.changedTouches[0].screenX;
            });
            this.container.addEventListener('touchend', (e) => {
                const touchEnd = e.changedTouches[0].screenX;
                const diff = touchStart - touchEnd;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) this.scroll('next');
                    else this.scroll('prev');
                }
            });
        }
        
        // Explore VMB+ link
        if (this.exploreLink) {
            this.exploreLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://www.vmbplus.com', '_blank');
            });
        }
    }
    
    scroll(direction) {
        if (!this.container) return;
        const cardWidth = 280 + 28;
        const scrollAmount = cardWidth * 2;
        
        this.container.scrollBy({
            left: direction === 'next' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
        this.resetAutoScrollTimer();
    }
    
    startAutoScroll() {
        if (this.autoScrollInterval) return;
        this.autoScrollInterval = setInterval(() => {
            if (this.container) {
                const maxScroll = this.container.scrollWidth - this.container.clientWidth;
                if (this.container.scrollLeft >= maxScroll - 10) {
                    this.container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    this.scroll('next');
                }
            }
        }, 6000);
    }
    
    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
    
    resetAutoScrollTimer() {
        this.stopAutoScroll();
        this.startAutoScroll();
    }
    
    openRedirectModal(url, title) {
        const modal = document.getElementById('redirectModal');
        const titleSpan = document.getElementById('selectedShowTitle');
        const continueBtn = document.getElementById('continueRedirect');
        const cancelBtn = document.getElementById('cancelRedirect');
        
        if (titleSpan) titleSpan.textContent = title;
        
        if (modal) {
            modal.style.display = 'flex';
            
            const handleContinue = () => {
                window.open(url, '_blank');
                modal.style.display = 'none';
                this.cleanupModalListeners(continueBtn, cancelBtn);
            };
            
            const handleCancel = () => {
                modal.style.display = 'none';
                this.cleanupModalListeners(continueBtn, cancelBtn);
            };
            
            continueBtn.onclick = handleContinue;
            cancelBtn.onclick = handleCancel;
            
            // Close on outside click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    this.cleanupModalListeners(continueBtn, cancelBtn);
                }
            };
        }
    }
    
    cleanupModalListeners(continueBtn, cancelBtn) {
        if (continueBtn) continueBtn.onclick = null;
        if (cancelBtn) cancelBtn.onclick = null;
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new VMBPremierSection();
});

// coming-soon.js
class ComingSoonSection {
    constructor() {
        // DOM Elements
        this.theaterTrack = document.getElementById('theaterTrack');
        this.streamingTrack = document.getElementById('streamingTrack');
        this.prevBtn = document.getElementById('comingPrev');
        this.nextBtn = document.getElementById('comingNext');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.theaterTab = document.getElementById('theaterTab');
        this.streamingTab = document.getElementById('streamingTab');
        this.container = document.querySelector('.coming-container.active') || document.querySelector('.coming-container');
        
        // Active track reference
        this.activeTrack = null;
        this.activeContainer = null;
        this.currentTab = 'theater';
        
        // Data
        this.theaterMovies = [
            {
                id: 1,
                title: "Avatar: The Way of Water 2",
                genre: "Sci-Fi, Adventure",
                duration: "3h 10m",
                language: "English, Hindi, Tamil, Telugu",
                releaseDate: "Dec 22, 2025",
                daysLeft: 210,
                thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
                platform: "theater"
            },
            {
                id: 2,
                title: "Jawan 2: Revenge",
                genre: "Action, Thriller",
                duration: "2h 45m",
                language: "Hindi",
                releaseDate: "Jan 15, 2026",
                daysLeft: 234,
                thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
                platform: "theater"
            },
            {
                id: 3,
                title: "Tiger vs Pathaan",
                genre: "Action, Spy",
                duration: "2h 50m",
                language: "Hindi",
                releaseDate: "Feb 5, 2026",
                daysLeft: 255,
                thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
                platform: "theater"
            },
            {
                id: 4,
                title: "Salaar 2",
                genre: "Action, Drama",
                duration: "3h",
                language: "Telugu, Hindi, Tamil",
                releaseDate: "Mar 10, 2026",
                daysLeft: 288,
                thumbnail: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400",
                platform: "theater"
            },
            {
                id: 5,
                title: "The Batman 2",
                genre: "Action, Crime",
                duration: "2h 55m",
                language: "English",
                releaseDate: "Apr 18, 2026",
                daysLeft: 327,
                thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
                platform: "theater"
            },
            {
                id: 6,
                title: "Spider-Man: Beyond",
                genre: "Animation, Action",
                duration: "2h 20m",
                language: "English, Hindi",
                releaseDate: "May 5, 2026",
                daysLeft: 344,
                thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
                platform: "theater"
            }
        ];
        
        this.streamingShows = [
            {
                id: 101,
                title: "The Last Kingdom: Seven Kings",
                type: "VMB+ Original Series",
                episodes: "8 Episodes",
                genre: "Historical, Action",
                releaseDate: "Jan 10, 2026",
                daysLeft: 229,
                thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
                platform: "streaming"
            },
            {
                id: 102,
                title: "Cyberpunk: Edge Runners S2",
                type: "VMB+ Anime",
                episodes: "10 Episodes",
                genre: "Sci-Fi, Animation",
                releaseDate: "Feb 1, 2026",
                daysLeft: 251,
                thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
                platform: "streaming"
            },
            {
                id: 103,
                title: "The Family Man S3",
                type: "VMB+ Original",
                episodes: "9 Episodes",
                genre: "Thriller, Drama",
                releaseDate: "Mar 15, 2026",
                daysLeft: 293,
                thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
                platform: "streaming"
            },
            {
                id: 104,
                title: "Panchayat S4",
                type: "VMB+ Exclusive",
                episodes: "8 Episodes",
                genre: "Comedy, Drama",
                releaseDate: "Apr 5, 2026",
                daysLeft: 314,
                thumbnail: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400",
                platform: "streaming"
            },
            {
                id: 105,
                title: "Mirzapur: The Prequel",
                type: "VMB+ Original",
                episodes: "6 Episodes",
                genre: "Crime, Action",
                releaseDate: "May 20, 2026",
                daysLeft: 359,
                thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
                platform: "streaming"
            },
            {
                id: 106,
                title: "Sacred Games S3",
                type: "VMB+ Classic",
                episodes: "7 Episodes",
                genre: "Crime, Thriller",
                releaseDate: "Jun 12, 2026",
                daysLeft: 382,
                thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
                platform: "streaming"
            }
        ];
        
        this.init();
    }
    
    init() {
        this.renderTheaterMovies();
        this.renderStreamingShows();
        this.attachEvents();
        this.updateActiveTrack('theater');
        this.startAutoScroll();
    }
    
    renderTheaterMovies() {
        if (!this.theaterTrack) return;
        this.theaterTrack.innerHTML = '';
        
        this.theaterMovies.forEach(movie => {
            const card = this.createCard(movie, 'theater');
            this.theaterTrack.appendChild(card);
        });
    }
    
    renderStreamingShows() {
        if (!this.streamingTrack) return;
        this.streamingTrack.innerHTML = '';
        
        this.streamingShows.forEach(show => {
            const card = this.createCard(show, 'streaming');
            this.streamingTrack.appendChild(card);
        });
    }
    
    createCard(item, type) {
        const card = document.createElement('div');
        card.className = 'coming-card';
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-title', item.title);
        
        const isMovie = type === 'theater';
        const platformName = isMovie ? 'In Theaters' : 'VMB+ Streaming';
        const platformClass = isMovie ? 'theater' : 'streaming';
        
        card.innerHTML = `
            <div class="card-thumb" style="background-image: linear-gradient(145deg, #2a1a4a, #1a0a3a), url('${item.thumbnail}'); background-size: cover; background-blend-mode: overlay;">
                <div class="thumb-overlay"></div>
                <div class="release-badge">
                    <i class="far fa-calendar-alt"></i> ${this.getDaysLeftText(item.daysLeft)}
                </div>
                <div class="platform-badge ${platformClass}">
                    <i class="${isMovie ? 'fas fa-film' : 'fas fa-crown'}"></i> ${platformName}
                </div>
                <div class="reminder-overlay">
                    <button class="reminder-btn" data-title="${item.title}">
                        <i class="fas fa-bell"></i> Get Reminder
                    </button>
                </div>
            </div>
            <div class="card-info">
                <h3>${item.title}</h3>
                <div class="card-meta">
                    <span><i class="fas fa-tag"></i> ${item.genre.split(',')[0]}</span>
                    <span><i class="far fa-clock"></i> ${isMovie ? item.duration : item.episodes}</span>
                </div>
                <div class="release-date">
                    <i class="fas fa-star-of-life"></i> Releases: ${item.releaseDate}
                </div>
            </div>
        `;
        
        return card;
    }
    
    getDaysLeftText(days) {
        if (days <= 7) return `🔥 ${days} days left`;
        if (days <= 30) return `📅 ${days} days`;
        return `${Math.floor(days / 30)} months`;
    }
    
    attachEvents() {
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Navigation arrows
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.scroll('prev'));
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.scroll('next'));
        }
        
        // View All buttons
        const viewAllTheater = document.getElementById('viewAllTheater');
        const viewAllStreaming = document.getElementById('viewAllStreaming');
        
        if (viewAllTheater) {
            viewAllTheater.addEventListener('click', () => {
                alert('🎬 All upcoming movies page - Coming soon! (Will connect to database)');
            });
        }
        if (viewAllStreaming) {
            viewAllStreaming.addEventListener('click', () => {
                alert('✨ VMB+ Originals catalog - Coming soon! (Will connect to streaming backend)');
            });
        }
        
        // Reminder buttons (delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('reminder-btn') || e.target.closest('.reminder-btn')) {
                const btn = e.target.closest('.reminder-btn');
                const title = btn.getAttribute('data-title');
                this.openReminderModal(title);
            }
        });
        
        // Update active container on scroll
        const updateActiveContainer = () => {
            const activeContainer = document.querySelector('.tab-content.active .coming-container');
            if (activeContainer) {
                this.activeContainer = activeContainer;
                this.activeTrack = activeContainer.querySelector('.coming-track');
            }
        };
        
        window.addEventListener('resize', updateActiveContainer);
        updateActiveContainer();
        
        // Scroll event to reset auto-scroll timer
        if (this.activeContainer) {
            this.activeContainer.addEventListener('scroll', () => this.resetAutoScroll());
        }
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update button active states
        this.tabBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update tab content visibility
        if (tab === 'theater') {
            this.theaterTab.classList.add('active');
            this.streamingTab.classList.remove('active');
        } else {
            this.streamingTab.classList.add('active');
            this.theaterTab.classList.remove('active');
        }
        
        // Update active container reference
        setTimeout(() => {
            this.activeContainer = document.querySelector('.tab-content.active .coming-container');
            this.activeTrack = this.activeContainer?.querySelector('.coming-track');
            this.resetAutoScroll();
        }, 100);
    }
    
    updateActiveTrack(tab) {
        if (tab === 'theater') {
            this.activeContainer = document.querySelector('#theaterTab .coming-container');
            this.activeTrack = this.theaterTrack;
        } else {
            this.activeContainer = document.querySelector('#streamingTab .coming-container');
            this.activeTrack = this.streamingTrack;
        }
    }
    
    scroll(direction) {
        if (!this.activeContainer) return;
        const cardWidth = 270 + 28; // card width + gap
        const scrollAmount = cardWidth * 2;
        
        this.activeContainer.scrollBy({
            left: direction === 'next' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
        this.resetAutoScroll();
    }
    
    startAutoScroll() {
        if (this.autoScrollInterval) return;
        this.autoScrollInterval = setInterval(() => {
            if (this.activeContainer) {
                const maxScroll = this.activeContainer.scrollWidth - this.activeContainer.clientWidth;
                if (this.activeContainer.scrollLeft >= maxScroll - 10) {
                    this.activeContainer.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    this.scroll('next');
                }
            }
        }, 5000);
    }
    
    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
    
    resetAutoScroll() {
        this.stopAutoScroll();
        this.startAutoScroll();
    }
    
    openReminderModal(title) {
        const modal = document.getElementById('reminderModal');
        const titleSpan = document.getElementById('reminderTitle');
        const remindBtn = document.getElementById('confirmReminder');
        const closeBtn = document.getElementById('closeReminder');
        const emailInput = document.getElementById('reminderEmail');
        
        if (titleSpan) titleSpan.textContent = title;
        if (emailInput) emailInput.value = '';
        
        if (modal) {
            modal.style.display = 'flex';
            
            const handleRemind = () => {
                const email = emailInput.value.trim();
                if (!email || !email.includes('@')) {
                    alert('Please enter a valid email address to get reminders!');
                    return;
                }
                alert(`✅ Reminder set for "${title}"! We'll notify you at ${email} when it releases.`);
                modal.style.display = 'none';
                this.cleanupModalListeners(remindBtn, closeBtn);
            };
            
            const handleClose = () => {
                modal.style.display = 'none';
                this.cleanupModalListeners(remindBtn, closeBtn);
            };
            
            if (remindBtn) remindBtn.onclick = handleRemind;
            if (closeBtn) closeBtn.onclick = handleClose;
            
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    this.cleanupModalListeners(remindBtn, closeBtn);
                }
            };
        }
    }
    
    cleanupModalListeners(remindBtn, closeBtn) {
        if (remindBtn) remindBtn.onclick = null;
        if (closeBtn) closeBtn.onclick = null;
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new ComingSoonSection();
});

// trailers.js
class TrailersSection {
    constructor() {
        // DOM Elements
        this.track = document.getElementById('trailersTrack');
        this.prevBtn = document.getElementById('trailerPrev');
        this.nextBtn = document.getElementById('trailerNext');
        this.progressBar = document.getElementById('trailerProgress');
        this.container = document.querySelector('.trailers-container');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        // Trailer Data
        this.trailers = [
            {
                id: 1,
                title: "Deadpool & Wolverine",
                category: "movie",
                categoryLabel: "Now Showing",
                duration: "2:35",
                description: "The Merc with a Mouth meets the Wolverine in this epic crossover.",
                thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
                youtubeId: "d9w8z5q7x2E",
                releaseType: "nowshowing",
                actionUrl: "#",
                actionText: "Book Tickets"
            },
            {
                id: 2,
                title: "Kalki 2898 AD",
                category: "movie",
                categoryLabel: "Now Showing",
                duration: "2:58",
                description: "A sci-fi epic set in a post-apocalyptic world.",
                thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
                youtubeId: "k8t5r7y9u1i",
                releaseType: "nowshowing",
                actionUrl: "#",
                actionText: "Book Tickets"
            },
            {
                id: 3,
                title: "The Crownless King",
                category: "show",
                categoryLabel: "VMB+ Original",
                duration: "1:45",
                description: "A royal saga of power and betrayal. Streaming exclusively on VMB+.",
                thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
                youtubeId: "m3n4b5v6c7x",
                releaseType: "show",
                actionUrl: "https://www.vmbplus.com",
                actionText: "Watch on VMB+"
            },
            {
                id: 4,
                title: "Pushpa: The Rule",
                category: "movie",
                categoryLabel: "Coming Soon",
                duration: "2:50",
                description: "Pushpa Raj returns with more action and attitude.",
                thumbnail: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400",
                youtubeId: "a1s2d3f4g5h",
                releaseType: "movie",
                actionUrl: "#",
                actionText: "Notify Me"
            },
            {
                id: 5,
                title: "Mirzapur: The Prequel",
                category: "show",
                categoryLabel: "VMB+ Original",
                duration: "2:10",
                description: "The origin story of the infamous Mirzapur empire.",
                thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
                youtubeId: "z6x7c8v9b0n",
                releaseType: "show",
                actionUrl: "https://www.vmbplus.com",
                actionText: "Watch on VMB+"
            },
            {
                id: 6,
                title: "Furiosa: A Mad Max Saga",
                category: "movie",
                categoryLabel: "Now Showing",
                duration: "2:28",
                description: "Before Furiosa became a warrior, she was a survivor.",
                thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
                youtubeId: "p9o8i7u6y5t",
                releaseType: "nowshowing",
                actionUrl: "#",
                actionText: "Book Tickets"
            },
            {
                id: 7,
                title: "The Family Man S3",
                category: "show",
                categoryLabel: "VMB+ Original",
                duration: "1:55",
                description: "Srikant Tiwari returns with a new mission.",
                thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
                youtubeId: "r4e5w6q7a8s",
                releaseType: "show",
                actionUrl: "https://www.vmbplus.com",
                actionText: "Watch on VMB+"
            },
            {
                id: 8,
                title: "Jawan 2: Revenge",
                category: "movie",
                categoryLabel: "Coming Soon",
                duration: "2:45",
                description: "The action spectacle continues.",
                thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
                youtubeId: "t1y2u3i4o5p",
                releaseType: "movie",
                actionUrl: "#",
                actionText: "Notify Me"
            },
            {
                id: 9,
                title: "Sacred Games S3",
                category: "show",
                categoryLabel: "VMB+ Original",
                duration: "2:20",
                description: "The final chapter of Sartaj Singh's journey.",
                thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
                youtubeId: "l9k8j7h6g5f",
                releaseType: "show",
                actionUrl: "https://www.vmbplus.com",
                actionText: "Watch on VMB+"
            },
            {
                id: 10,
                title: "Avatar: The Way of Water 2",
                category: "movie",
                categoryLabel: "Coming Soon",
                duration: "3:10",
                description: "Return to Pandora for an epic adventure.",
                thumbnail: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400",
                youtubeId: "d3s4a5f6g7h",
                releaseType: "movie",
                actionUrl: "#",
                actionText: "Notify Me"
            }
        ];
        
        this.currentFilter = "all";
        this.currentTrailers = [...this.trailers];
        this.autoScrollInterval = null;
        
        this.init();
    }
    
    init() {
        this.renderTrailers();
        this.attachEvents();
        this.startAutoScroll();
        
        // Pause on hover
        if (this.container) {
            this.container.addEventListener('mouseenter', () => this.stopAutoScroll());
            this.container.addEventListener('mouseleave', () => this.startAutoScroll());
        }
    }
    
    renderTrailers() {
        if (!this.track) return;
        this.track.innerHTML = '';
        
        // Filter trailers based on current filter
        let filtered = this.currentTrailers;
        if (this.currentFilter !== "all") {
            filtered = this.currentTrailers.filter(t => t.releaseType === this.currentFilter);
        }
        
        if (filtered.length === 0) {
            this.track.innerHTML = `<div class="no-results" style="text-align: center; padding: 3rem; color: #c084fc;">No trailers found for this category</div>`;
            return;
        }
        
        filtered.forEach(trailer => {
            const card = this.createTrailerCard(trailer);
            this.track.appendChild(card);
        });
    }
    
    createTrailerCard(trailer) {
        const card = document.createElement('div');
        card.className = 'trailer-card';
        card.setAttribute('data-id', trailer.id);
        card.setAttribute('data-category', trailer.releaseType);
        
        // Determine category badge class
        let badgeClass = '';
        if (trailer.releaseType === 'movie') badgeClass = 'movie';
        else if (trailer.releaseType === 'show') badgeClass = 'show';
        else if (trailer.releaseType === 'nowshowing') badgeClass = 'nowshowing';
        
        let categoryLabel = '';
        if (trailer.releaseType === 'movie') categoryLabel = 'Coming Soon';
        else if (trailer.releaseType === 'show') categoryLabel = 'VMB+ Series';
        else if (trailer.releaseType === 'nowshowing') categoryLabel = 'In Theaters';
        
        card.innerHTML = `
            <div class="trailer-thumb" style="background-image: linear-gradient(145deg, #2a1a4a, #1a0a3a), url('${trailer.thumbnail}'); background-size: cover; background-blend-mode: overlay;">
                <div class="thumb-overlay-dark"></div>
                <div class="play-icon-overlay">
                    <i class="fas fa-play"></i>
                </div>
                <div class="duration-badge">
                    <i class="far fa-clock"></i> ${trailer.duration}
                </div>
                <div class="category-badge ${badgeClass}">
                    <i class="${trailer.releaseType === 'show' ? 'fas fa-crown' : 'fas fa-film'}"></i> ${categoryLabel}
                </div>
            </div>
            <div class="trailer-info">
                <h3>${trailer.title}</h3>
                <div class="trailer-meta">
                    <span><i class="fas fa-tag"></i> ${trailer.categoryLabel}</span>
                    <span><i class="far fa-eye"></i> Trailer</span>
                </div>
                <p class="trailer-desc">${trailer.description}</p>
            </div>
        `;
        
        // Add click event to play trailer
        card.addEventListener('click', () => {
            this.openTrailerModal(trailer);
        });
        
        return card;
    }
    
    attachEvents() {
        // Navigation arrows
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.scroll('prev'));
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.scroll('next'));
        }
        
        // Scroll event to update progress
        if (this.container) {
            this.container.addEventListener('scroll', () => this.updateScrollProgress());
        }
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = btn.getAttribute('data-filter');
                this.applyFilter(filter);
            });
        });
        
        // Modal close events
        const closeModalBtn = document.getElementById('closeModalBtn');
        const modal = document.getElementById('trailerModal');
        const watchNowBtn = document.getElementById('watchNowBtn');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeTrailerModal());
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeTrailerModal();
            });
        }
        if (watchNowBtn) {
            watchNowBtn.addEventListener('click', () => {
                if (this.currentTrailer) {
                    if (this.currentTrailer.actionUrl && this.currentTrailer.actionUrl !== '#') {
                        window.open(this.currentTrailer.actionUrl, '_blank');
                    } else {
                        alert(`🎬 "${this.currentTrailer.title}" - Booking/streaming page coming soon!`);
                    }
                    this.closeTrailerModal();
                }
            });
        }
    }
    
    applyFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button state
        this.filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Re-render with filter
        this.renderTrailers();
        
        // Reset scroll position
        if (this.container) {
            this.container.scrollLeft = 0;
            this.updateScrollProgress();
        }
        
        // Reset auto-scroll
        this.resetAutoScroll();
    }
    
    scroll(direction) {
        if (!this.container) return;
        const cardWidth = 300 + 28; // card width + gap
        const scrollAmount = cardWidth * 2;
        
        this.container.scrollBy({
            left: direction === 'next' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
        this.resetAutoScroll();
    }
    
    updateScrollProgress() {
        if (!this.container || !this.progressBar) return;
        const scrollLeft = this.container.scrollLeft;
        const scrollWidth = this.container.scrollWidth - this.container.clientWidth;
        
        if (scrollWidth > 0) {
            const progress = (scrollLeft / scrollWidth) * 100;
            this.progressBar.style.width = `${progress}%`;
        } else {
            this.progressBar.style.width = '0%';
        }
    }
    
    startAutoScroll() {
        if (this.autoScrollInterval) return;
        this.autoScrollInterval = setInterval(() => {
            if (this.container && this.track.children.length > 0) {
                const maxScroll = this.container.scrollWidth - this.container.clientWidth;
                if (this.container.scrollLeft >= maxScroll - 10) {
                    this.container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    this.scroll('next');
                }
            }
        }, 6000);
    }
    
    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
    
    resetAutoScroll() {
        this.stopAutoScroll();
        this.startAutoScroll();
    }
    
    openTrailerModal(trailer) {
        this.currentTrailer = trailer;
        const modal = document.getElementById('trailerModal');
        const modalTitle = document.getElementById('modalTrailerTitle');
        const iframe = document.getElementById('trailerIframe');
        const watchNowBtn = document.getElementById('watchNowBtn');
        
        if (modalTitle) modalTitle.textContent = trailer.title;
        if (iframe) {
            // YouTube embed URL with autoplay
            iframe.src = `https://www.youtube.com/embed/${trailer.youtubeId}?autoplay=1&rel=0`;
        }
        if (watchNowBtn) {
            const icon = trailer.releaseType === 'show' ? 'fa-crown' : 'fa-ticket-alt';
            const text = trailer.releaseType === 'show' ? 'Watch on VMB+' : 'Book Tickets / Notify';
            watchNowBtn.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
        }
        
        if (modal) modal.style.display = 'flex';
        
        // Stop auto-scroll while modal is open
        this.stopAutoScroll();
    }
    
    closeTrailerModal() {
        const modal = document.getElementById('trailerModal');
        const iframe = document.getElementById('trailerIframe');
        
        if (iframe) iframe.src = ''; // Stop video playback
        if (modal) modal.style.display = 'none';
        
        // Resume auto-scroll
        this.startAutoScroll();
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new TrailersSection();
});


// footer.js
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== BACK TO TOP BUTTON FUNCTIONALITY ==========
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        // Smooth scroll to top on click
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ========== NEWSLETTER SUBSCRIPTION (Demo - Ready for Database) ==========
    const subscribeBtn = document.getElementById('subscribeBtn');
    const newsletterInput = document.getElementById('newsletterEmail');
    
    if (subscribeBtn && newsletterInput) {
        subscribeBtn.addEventListener('click', function() {
            const email = newsletterInput.value.trim();
            
            if (!email) {
                showToast('❌ Please enter your email address!', '#ef4444');
                return;
            }
            
            if (!isValidEmail(email)) {
                showToast('❌ Please enter a valid email address!', '#ef4444');
                return;
            }
            
            // Demo subscription - Will connect to database in next phase
            showToast('✅ Subscribed successfully! You\'ll receive updates on your email.', '#facc15');
            newsletterInput.value = '';
            
            // Optional: Store in localStorage for demo
            const subscribers = JSON.parse(localStorage.getItem('vmb_newsletter') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('vmb_newsletter', JSON.stringify(subscribers));
                console.log('Newsletter subscribers:', subscribers);
            }
        });
        
        // Allow Enter key to subscribe
        newsletterInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                subscribeBtn.click();
            }
        });
    }
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Toast notification (similar to previous sections)
    function showToast(message, bgColor = '#6b21a5') {
        let toast = document.querySelector('.vmb-toast-footer');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'vmb-toast-footer';
            toast.style.position = 'fixed';
            toast.style.bottom = '100px';
            toast.style.right = '20px';
            toast.style.backgroundColor = bgColor;
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '40px';
            toast.style.fontSize = '0.85rem';
            toast.style.fontWeight = '500';
            toast.style.zIndex = '9999';
            toast.style.fontFamily = "'Poppins', sans-serif";
            toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            toast.style.borderLeft = `3px solid #facc15`;
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.backgroundColor = bgColor;
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
    
    // ========== DYNAMIC YEAR UPDATE IN COPYRIGHT ==========
    const copyrightElement = document.querySelector('.bottom-container p');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.innerHTML = copyrightElement.innerHTML.replace('2025', currentYear);
    }
    
    // ========== FOOTER LINK CLICK TRACKING (Demo Analytics) ==========
    const allFooterLinks = document.querySelectorAll('.footer-links a, .social-icon, .app-btn');
    
    allFooterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // For demo purposes - prevent actual navigation if href is #
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                const linkText = this.textContent.trim() || this.getAttribute('href');
                showToast(`🔗 Navigation to "${linkText}" will be enabled in production`, '#c084fc');
            } else {
                // For real links, allow navigation
                console.log(`Navigating to: ${this.getAttribute('href')}`);
            }
        });
    });
    
    // ========== SOCIAL ICON HOVER EFFECT (Additional Polish) ==========
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            const platform = this.querySelector('i')?.className || '';
            console.log(`Hovering over: ${platform}`);
        });
    });
    
    // ========== PAYMENT METHODS INTERACTION (Demo) ==========
    const paymentIcons = document.querySelectorAll('.payment-methods i');
    paymentIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const paymentType = this.className.split(' ')[1]?.replace('fa-', '').toUpperCase() || 'Payment';
            showToast(`💳 ${paymentType} payments coming soon!`, '#facc15');
        });
    });
    
    // ========== SCROLL REVEAL ANIMATION (Optional) ==========
    const footerColumns = document.querySelectorAll('.footer-col');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    footerColumns.forEach(col => {
        col.style.opacity = '0';
        col.style.transform = 'translateY(20px)';
        col.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(col);
    });
    
    // ========== RESPONSIVE FOOTER LOGIC (Additional) ==========
    function adjustFooterLayout() {
        const footerContainer = document.querySelector('.footer-container');
        if (window.innerWidth <= 600) {
            // Mobile layout adjustments
            document.querySelectorAll('.footer-col').forEach(col => {
                col.style.textAlign = 'center';
            });
        } else {
            document.querySelectorAll('.footer-col').forEach(col => {
                col.style.textAlign = 'left';
            });
        }
    }
    
    window.addEventListener('resize', adjustFooterLayout);
    adjustFooterLayout();
    
    // Console log for initialization
    console.log('VMB Cinemaz Footer Loaded - Ready for Database Integration');
    console.log('Newsletter subscribers count:', JSON.parse(localStorage.getItem('vmb_newsletter') || '[]').length);
});