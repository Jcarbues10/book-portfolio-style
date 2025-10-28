/* =============================================
   DIGITAL BOOK PORTFOLIO - JAVASCRIPT
   ============================================= */

// === STATE MANAGEMENT ===
let currentPage = 0;
let totalPages = 0;
let isAnimating = false;

// === INITIALIZE ===
document.addEventListener('DOMContentLoaded', () => {
    initializeBook();
    initializeNavigation();
    initializeTableOfContents();
    initializeForm();
    initializeKeyboardNavigation();
    initializeSwipeGestures();
});

// === INITIALIZE BOOK ===
function initializeBook() {
    const pages = document.querySelectorAll('.page');
    totalPages = pages.length;
    
    // Update total pages counter
    document.querySelector('.total-pages').textContent = totalPages;
    
    // Set first page as active
    if (pages.length > 0) {
        pages[0].classList.add('active');
        updatePageCounter();
        updateNavigationButtons();
    }
}

// === NAVIGATION ===
function initializeNavigation() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.addEventListener('click', () => goToPreviousPage());
    nextBtn.addEventListener('click', () => goToNextPage());
}

function goToNextPage() {
    if (isAnimating || currentPage >= totalPages - 1) return;
    
    isAnimating = true;
    const pages = document.querySelectorAll('.page');
    const currentPageElement = pages[currentPage];
    const nextPageElement = pages[currentPage + 1];
    
    // Animate current page turning
    currentPageElement.classList.add('turning-next');
    currentPageElement.classList.remove('active');
    
    // After animation completes
    setTimeout(() => {
        currentPageElement.classList.remove('turning-next');
        nextPageElement.classList.add('active');
        currentPage++;
        updatePageCounter();
        updateNavigationButtons();
        isAnimating = false;
        
        // Scroll to top of new page
        nextPageElement.querySelector('.page-content').scrollTop = 0;
    }, 1200); // Match CSS animation duration
}

function goToPreviousPage() {
    if (isAnimating || currentPage <= 0) return;
    
    isAnimating = true;
    const pages = document.querySelectorAll('.page');
    const currentPageElement = pages[currentPage];
    const prevPageElement = pages[currentPage - 1];
    
    // Animate previous page turning back
    currentPageElement.classList.remove('active');
    prevPageElement.classList.add('turning-prev');
    
    // After animation completes
    setTimeout(() => {
        prevPageElement.classList.remove('turning-prev');
        prevPageElement.classList.add('active');
        currentPage--;
        updatePageCounter();
        updateNavigationButtons();
        isAnimating = false;
        
        // Scroll to top of new page
        prevPageElement.querySelector('.page-content').scrollTop = 0;
    }, 1200); // Match CSS animation duration
}

function goToPage(pageIndex) {
    if (isAnimating || pageIndex === currentPage || pageIndex < 0 || pageIndex >= totalPages) return;
    
    isAnimating = true;
    const pages = document.querySelectorAll('.page');
    const currentPageElement = pages[currentPage];
    const targetPageElement = pages[pageIndex];
    
    // Determine direction
    const goingForward = pageIndex > currentPage;
    
    if (goingForward) {
        currentPageElement.classList.add('turning-next');
    } else {
        currentPageElement.classList.add('turning-prev');
    }
    
    currentPageElement.classList.remove('active');
    
    setTimeout(() => {
        currentPageElement.classList.remove('turning-next', 'turning-prev');
        targetPageElement.classList.add('active');
        currentPage = pageIndex;
        updatePageCounter();
        updateNavigationButtons();
        isAnimating = false;
        
        // Scroll to top of new page
        targetPageElement.querySelector('.page-content').scrollTop = 0;
    }, 1200);
}

function updatePageCounter() {
    document.querySelector('.current-page').textContent = currentPage + 1;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
}

// === TABLE OF CONTENTS ===
function initializeTableOfContents() {
    const tocToggle = document.getElementById('tocToggle');
    const tocClose = document.getElementById('tocClose');
    const toc = document.getElementById('toc');
    const tocLinks = document.querySelectorAll('.toc-list a');
    
    // Toggle TOC
    tocToggle.addEventListener('click', () => {
        toc.classList.add('open');
    });
    
    // Close TOC
    tocClose.addEventListener('click', () => {
        toc.classList.remove('open');
    });
    
    // Close TOC when clicking outside
    document.addEventListener('click', (e) => {
        if (!toc.contains(e.target) && !tocToggle.contains(e.target)) {
            toc.classList.remove('open');
        }
    });
    
    // Navigate to page from TOC
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageIndex = parseInt(link.getAttribute('data-page'));
            goToPage(pageIndex);
            toc.classList.remove('open');
        });
    });
}

// === KEYBOARD NAVIGATION ===
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in a form
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case 'ArrowRight':
            case 'PageDown':
            case ' ': // Space bar
                e.preventDefault();
                goToNextPage();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                goToPreviousPage();
                break;
            case 'Home':
                e.preventDefault();
                goToPage(0);
                break;
            case 'End':
                e.preventDefault();
                goToPage(totalPages - 1);
                break;
        }
    });
}

// === SWIPE GESTURES (for mobile) ===
function initializeSwipeGestures() {
    const book = document.getElementById('book');
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let isSwiping = false;
    
    book.addEventListener('touchstart', (e) => {
        // Don't interfere with scrollable content
        const target = e.target;
        if (target.closest('.page-content') && target.closest('.page-content').scrollHeight > target.closest('.page-content').clientHeight) {
            const content = target.closest('.page-content');
            const scrollTop = content.scrollTop;
            const scrollHeight = content.scrollHeight;
            const clientHeight = content.clientHeight;
            
            // Allow swipe only at top or bottom of scroll
            if (scrollTop > 10 && scrollTop < scrollHeight - clientHeight - 10) {
                return;
            }
        }
        
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
        isSwiping = false;
    }, { passive: true });
    
    book.addEventListener('touchmove', (e) => {
        const touchMoveX = e.changedTouches[0].screenX;
        const touchMoveY = e.changedTouches[0].screenY;
        const deltaX = Math.abs(touchMoveX - touchStartX);
        const deltaY = Math.abs(touchMoveY - touchStartY);
        
        // Determine if horizontal swipe
        if (deltaX > deltaY && deltaX > 20) {
            isSwiping = true;
        }
    }, { passive: true });
    
    book.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const touchEndTime = Date.now();
        handleSwipe(touchEndTime - touchStartTime);
    }, { passive: true });
    
    function handleSwipe(duration) {
        const swipeThreshold = 50;
        const velocityThreshold = 0.3; // pixels per ms
        const horizontalSwipe = Math.abs(touchEndX - touchStartX);
        const verticalSwipe = Math.abs(touchEndY - touchStartY);
        const velocity = horizontalSwipe / duration;
        
        // Only handle horizontal swipes (not vertical scrolling)
        if (horizontalSwipe > verticalSwipe && (horizontalSwipe > swipeThreshold || velocity > velocityThreshold)) {
            if (touchEndX < touchStartX) {
                // Swipe left - go to next page
                goToNextPage();
            } else {
                // Swipe right - go to previous page
                goToPreviousPage();
            }
        }
    }
}

// === CONTACT FORM ===
function initializeForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validate
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Success (in a real application, this would send data to a server)
        showNotification('Thank you! Your message has been sent.', 'success');
        form.reset();
        
        // Simulate form submission
        console.log('Form submitted:', { name, email, message });
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// === NOTIFICATION SYSTEM ===
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// === PAGE LOAD ANIMATION ===
window.addEventListener('load', () => {
    // Add entrance animation to cover page
    const coverPage = document.querySelector('.cover-page');
    if (coverPage) {
        coverPage.style.opacity = '0';
        coverPage.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            coverPage.style.transition = 'opacity 1s ease, transform 1s ease';
            coverPage.style.opacity = '1';
            coverPage.style.transform = 'scale(1)';
        }, 100);
    }
});

// === SCROLL ANIMATIONS FOR CHAPTER CONTENT ===
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll('.project-image-wrapper, .project-details, .tool-tags, .project-stats');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize scroll animations after DOM is loaded
document.addEventListener('DOMContentLoaded', initializeScrollAnimations);

// === MOUSE INTERACTION EFFECTS ===
function initializeMouseEffects() {
    // Only enable on non-touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        return;
    }
    
    const pages = document.querySelectorAll('.page');
    
    pages.forEach(page => {
        // Add subtle tilt effect on mouse move
        page.addEventListener('mousemove', (e) => {
            if (page.classList.contains('active')) {
                const rect = page.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / centerY * 2;
                const rotateY = (x - centerX) / centerX * 2;
                
                // Very subtle tilt
                page.style.transform = `perspective(1000px) rotateX(${-rotateX * 0.5}deg) rotateY(${rotateY * 0.5}deg)`;
            }
        });
        
        page.addEventListener('mouseleave', () => {
            page.style.transform = '';
        });
    });
}

// Initialize mouse effects
document.addEventListener('DOMContentLoaded', initializeMouseEffects);

// === TOUCH FEEDBACK ===
function initializeTouchFeedback() {
    const buttons = document.querySelectorAll('.page-control, .toc-toggle, .submit-btn, .social-link');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.opacity = '0.7';
        }, { passive: true });
        
        button.addEventListener('touchend', () => {
            setTimeout(() => {
                button.style.opacity = '';
            }, 150);
        }, { passive: true });
        
        button.addEventListener('touchcancel', () => {
            button.style.opacity = '';
        }, { passive: true });
    });
}

// Initialize touch feedback
document.addEventListener('DOMContentLoaded', initializeTouchFeedback);

// === PERFORMANCE OPTIMIZATION ===
// Preload next page images
function preloadNextPageImage() {
    if (currentPage < totalPages - 1) {
        const pages = document.querySelectorAll('.page');
        const nextPage = pages[currentPage + 1];
        const nextImage = nextPage.querySelector('.project-image');
        
        if (nextImage && nextImage.dataset.src) {
            nextImage.src = nextImage.dataset.src;
        }
    }
}

// Call after each page turn
document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        if (index === 0) {
            page.addEventListener('transitionend', preloadNextPageImage);
        }
    });
});

// === UTILITY FUNCTIONS ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// === ACCESSIBILITY ENHANCEMENTS ===
function initializeAccessibility() {
    // Add ARIA attributes
    const pages = document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        page.setAttribute('role', 'article');
        page.setAttribute('aria-label', `Page ${index + 1} of ${totalPages}`);
    });
    
    // Focus management
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.setAttribute('aria-label', 'Go to previous page');
    nextBtn.setAttribute('aria-label', 'Go to next page');
}

document.addEventListener('DOMContentLoaded', initializeAccessibility);

// === RESPONSIVE HANDLING ===
let isMobile = window.matchMedia('(max-width: 768px)').matches;

window.addEventListener('resize', debounce(() => {
    const wasMobile = isMobile;
    isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Reinitialize certain features if switching between mobile and desktop
    if (wasMobile !== isMobile) {
        console.log('Device type changed, adjusting layout...');
    }
}, 250));

// === ANALYTICS (Optional) ===
function trackPageView(pageNumber) {
    // In a real application, you would send this data to your analytics service
    console.log(`Page ${pageNumber + 1} viewed`);
    
    // Example: Google Analytics
    // gtag('event', 'page_view', { page_number: pageNumber + 1 });
}

// Track page views
document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.classList.contains('active')) {
                    const pageIndex = Array.from(pages).indexOf(entry.target);
                    trackPageView(pageIndex);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(page);
    });
});

// === DEBUG MODE (Development only) ===
const DEBUG = false;

if (DEBUG) {
    console.log('Digital Book Portfolio - Debug Mode');
    console.log('Total Pages:', totalPages);
    console.log('Current Page:', currentPage);
    
    // Add visual indicators for page states
    document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = `
            .page { outline: 2px solid rgba(255, 0, 0, 0.3) !important; }
            .page.active { outline: 2px solid rgba(0, 255, 0, 0.8) !important; }
        `;
        document.head.appendChild(style);
    });
}

// === EXPORT FOR TESTING (if needed) ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        goToNextPage,
        goToPreviousPage,
        goToPage,
        showNotification,
        isValidEmail
    };
}
