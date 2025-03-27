// Custom cursor with inner and outer circles
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('click', () => {
    cursor.style.transform = 'scale(0.8)';
    setTimeout(() => {
        cursor.style.transform = 'scale(1)';
    }, 100);
});

// Navigation toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Project filtering
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectsContainer = document.querySelector('.projects-container');
    
    // Initial filter - show only featured projects by default
    projectCards.forEach(card => {
        if (card.getAttribute('data-category').includes('featured')) {
            card.style.display = 'grid';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category').includes(filter)) {
                    card.style.display = 'grid';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Skip if no project cards (not on projects page)
    if (projectCards.length === 0) return;
    
    // Add event listeners to each card
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Blur all other cards
            projectCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.filter = 'blur(3px)';
                    otherCard.style.opacity = '0.7';
                    otherCard.style.transform = 'scale(0.98)';
                }
            });
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset this specific card when mouse leaves
            projectCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.style.filter = '';
                    otherCard.style.opacity = '';
                    otherCard.style.transform = '';
                }
            });
        });
    });
    
    // Reset all cards when mouse leaves the container
    if (projectsContainer) {
        projectsContainer.addEventListener('mouseleave', () => {
            projectCards.forEach(card => {
                card.style.filter = '';
                card.style.opacity = '';
                card.style.transform = '';
            });
        });
    }
});

// Scroll animations
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
        header.style.backgroundColor = 'rgba(248, 249, 250, 0.95)';
    } else {
        header.style.boxShadow = 'none';
        header.style.backgroundColor = 'rgba(248, 249, 250, 0.8)';
    }
});

// Welcome section animation with typing effect for both texts
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const hiText = document.querySelector('.hi-text');
    const welcomeMessage = document.querySelector('.welcome-message');
    const nameContainer = document.querySelector('.name-container');
    const titleContainer = document.querySelector('.title-container');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const introAnimation = document.querySelector('.intro-animation');
    
    // Only run welcome animation if on homepage
    if (hiText && welcomeMessage) {
        // Clear any existing content first
        hiText.textContent = '';
        welcomeMessage.textContent = '';
        
        // Text for typing animations
        const hiString = "Hi :)";
        const welcomeString = "Welcome to my site.";
        let hiIndex = 0;
        let welcomeIndex = 0;
        
        // Animation sequence timing
        setTimeout(() => {
            // Make the container visible
            hiText.style.opacity = "1";
            
            // Step 1: Type "Hi :)"
            function typeHi() {
                if (hiIndex < hiString.length) {
                    hiText.textContent += hiString.charAt(hiIndex);
                    hiIndex++;
                    setTimeout(typeHi, 100);
                } else {
                    // Step 2: After typing "Hi :)", start typing "Welcome to my site."
                    setTimeout(() => {
                        welcomeMessage.style.opacity = "1";
                        
                        // Typing effect for welcome message
                        function typeWelcome() {
                            if (welcomeIndex < welcomeString.length) {
                                welcomeMessage.textContent += welcomeString.charAt(welcomeIndex);
                                welcomeIndex++;
                                setTimeout(typeWelcome, 40);
                            } else {
                                // Step 3: After typing completes, quickly fade out intro
                                setTimeout(() => {
                                    introAnimation.style.animation = "fadeOut 0.4s forwards";
                                    
                                    // Step 4: Show main name and titles
                                    setTimeout(() => {
                                        // Hide intro completely
                                        introAnimation.style.visibility = "hidden";
                                        
                                        // Show main elements
                                        nameContainer.style.visibility = "visible";
                                        titleContainer.style.visibility = "visible";
                                        scrollIndicator.style.visibility = "visible";
                                        
                                        nameContainer.style.animation = "fadeIn 0.6s forwards";
                                        
                                        // After name appears, show titles and scroll indicator
                                        setTimeout(() => {
                                            titleContainer.style.animation = "fadeIn 0.6s forwards";
                                            scrollIndicator.style.animation = "fadeIn 0.6s forwards";
                                        }, 300);
                                    }, 400);
                                }, 600);
                            }
                        }
                        
                        typeWelcome();
                    }, 300);
                }
            }
            
            typeHi(); // Start the animation sequence
        }, 300);
    }
    
    // Text duplicator for Let's Talk section
    const talkContainer = document.querySelector('.lets-talk');
    const talkText = document.querySelector('.talk-text');
    if (talkContainer && talkText) {
        const width = talkText.offsetWidth;
        
        // Ensure we have enough text to fill the screen
        const screensNeeded = Math.ceil(window.innerWidth / width) + 1;
        
        // We already have 2 copies from the HTML, so we'll add more if needed
        for (let i = 0; i < screensNeeded - 2; i++) {
            const clone = talkText.cloneNode(true);
            talkContainer.appendChild(clone);
        }
    }
});

// Simplified location toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Click event for location labels
    document.querySelectorAll('.location-label').forEach(label => {
        label.addEventListener('click', function() {
            // Skip if already active
            if (this.classList.contains('active')) return;
            
            const isUS = this.dataset.location === 'us';
            const usInfo = document.querySelectorAll('.us-info');
            const chinaInfo = document.querySelectorAll('.china-info');
            
            // Toggle active class
            document.querySelectorAll('.location-label').forEach(l => {
                l.classList.remove('active');
            });
            this.classList.add('active');
            
            // Toggle visibility
            usInfo.forEach(el => el.style.display = isUS ? 'flex' : 'none');
            chinaInfo.forEach(el => el.style.display = isUS ? 'none' : 'flex');
        });
    });
}); 