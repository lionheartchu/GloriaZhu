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
        const hiString = "Welcome :)";
        const welcomeString = "Here’s a slice of what I’m making.";
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
                    setTimeout(typeHi, 70);
                } else {
                    // Step 2: After typing "Hi :)", start typing "Welcome to my site."
                    setTimeout(() => {
                        welcomeMessage.style.opacity = "1";
                        
                        // Typing effect for welcome message
                        function typeWelcome() {
                            if (welcomeIndex < welcomeString.length) {
                                welcomeMessage.textContent += welcomeString.charAt(welcomeIndex);
                                welcomeIndex++;
                                setTimeout(typeWelcome, );
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
                    }, 400);
                }
            }
            
            typeHi(); // Start the animation sequence
        }, 400);
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

// Improved location toggle functionality with debugging and error handling
document.addEventListener('DOMContentLoaded', function() {
    
    // First check if the elements exist
    const locationLabels = document.querySelectorAll('.location-label');
    const usInfo = document.querySelectorAll('.us-info');
    const chinaInfo = document.querySelectorAll('.china-info');
    
    if (locationLabels.length === 0) {
        console.error("Location labels not found");
        return;
    }

    
    // Click event for location labels with improved error handling
    locationLabels.forEach(label => {
        label.addEventListener('click', function(e) {
            console.log(`Location label clicked: ${this.dataset.location}`);
            e.preventDefault();
            
            // Skip if already active
            if (this.classList.contains('active')) {
                console.log("Already active, skipping");
                return;
            }
            
            try {
                const isUS = this.dataset.location === 'us';
                
                // Toggle active class
                locationLabels.forEach(l => {
                    l.classList.remove('active');
                });
                this.classList.add('active');
                
                // Toggle visibility
                usInfo.forEach(el => el.style.display = isUS ? 'flex' : 'none');
                chinaInfo.forEach(el => el.style.display = isUS ? 'none' : 'flex');
                
                console.log(`Switched to ${isUS ? 'US' : 'China'} contact info`);
            } catch (error) {
                console.error("Error in location toggle:", error);
            }
        });
    });
    
    // Alternative approach: add a backup direct implementation
    const usLabel = document.querySelector('.location-label[data-location="us"]');
    const cnLabel = document.querySelector('.location-label[data-location="china"]');
    
    if (usLabel && cnLabel) {
        // Direct approach as backup
        usLabel.onclick = function() {
            usLabel.classList.add('active');
            cnLabel.classList.remove('active');
            usInfo.forEach(el => el.style.display = 'flex');
            chinaInfo.forEach(el => el.style.display = 'none');
            console.log("Switched to US via direct method");
            return false;
        };
        
        cnLabel.onclick = function() {
            cnLabel.classList.add('active');
            usLabel.classList.remove('active');
            usInfo.forEach(el => el.style.display = 'none');
            chinaInfo.forEach(el => el.style.display = 'flex');
            console.log("Switched to China via direct method");
            return false;
        };
    }
});

// Backup onload handler in case DOMContentLoaded doesn't fire
window.onload = function() {
    console.log("Window loaded");
    if (!document.querySelector('.location-label.active')) {
        console.log("Location toggle not initialized by DOMContentLoaded, initializing now");
        // Trigger the DOMContentLoaded handler manually
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
    }
};

// Refined aurora effect with smoother transitions and post-animation display
document.addEventListener('DOMContentLoaded', function() {
    const aurora = document.querySelector('.aurora-container');
    const welcomeSection = document.getElementById('welcome');
    
    if (!aurora || !welcomeSection) return;
    
    // Hide aurora initially
    aurora.style.opacity = '0';
    aurora.style.transition = 'opacity 1.5s ease';
    
    // Position aurora container correctly in the welcome section
    aurora.style.height = welcomeSection.offsetHeight + 'px';
    
    // Update aurora height on window resize
    window.addEventListener('resize', function() {
        aurora.style.height = welcomeSection.offsetHeight + 'px';
    });
    
    // Show aurora after welcome animation completes (approx 2.5 seconds)
    setTimeout(() => {
        aurora.style.opacity = '1';
        initializeAurora();
    }, 3000); // Wait for the hi/welcome animation to complete
    
    // Add subtle aurora to other sections
    addSubtleAuroraToSections();
    
    function initializeAurora() {
        // Subtle mouse movement effect
        document.addEventListener('mousemove', function(e) {
            // Only apply effect when mouse is in the welcome section
            const rect = welcomeSection.getBoundingClientRect();
            if (e.clientY < rect.bottom) {
                const x = e.clientX / window.innerWidth;
                const y = e.clientY / window.innerHeight;
                
                const layers = document.querySelectorAll('.aurora-layer');
                
                // Create subtle movement based on mouse position
                layers.forEach((layer, index) => {
                    const speed = (index + 1) * 2;
                    const offsetX = (x - 0.5) * speed;
                    const offsetY = (y - 0.5) * speed;
                    
                    layer.style.transform = `translate(${offsetX}%, ${offsetY}%) scale(${1 + (index * 0.1)})`;
                });
            }
        });
        
        // Extra smooth color changes with the same rich palette
        function changeAuroraColors() {
            const colors = [
                // Deep blue to cyan to white
                ['rgba(12, 25, 180, 0.9)', 'rgba(76, 201, 240, 0.7)', 'rgba(255, 255, 255, 0.8)'],
                
                // Electric blue to white to light blue
                ['rgba(67, 97, 238, 0.8)', 'rgba(255, 255, 255, 0.6)', 'rgba(58, 134, 255, 0.7)'],
                
                // Deep navy to bright cyan
                ['rgba(0, 41, 107, 0.8)', 'rgba(0, 119, 182, 0.7)', 'rgba(3, 206, 243, 0.9)'],
                
                // White to pale blue to deep blue
                ['rgba(255, 255, 255, 0.7)', 'rgba(173, 216, 230, 0.6)', 'rgba(0, 53, 102, 0.8)'],
                
                // Deep blue to white to dark cyan
                ['rgba(0, 68, 136, 0.9)', 'rgba(255, 255, 255, 0.7)', 'rgba(0, 141, 151, 0.8)']
            ];
            
            const directions = ['120deg', '-60deg', '30deg', '170deg', '-30deg', '60deg'];
            
            const layers = document.querySelectorAll('.aurora-layer');
            layers.forEach((layer, index) => {
                const randomColors = colors[Math.floor(Math.random() * colors.length)];
                const direction = directions[Math.floor(Math.random() * directions.length)];
                
                // Apply new colors with a much slower transition
                layer.style.transition = 'background 18s ease-in-out'; // Even slower transition (18s instead of 12s)
                layer.style.background = `linear-gradient(${direction}, ${randomColors[0]}, ${randomColors[1]}, ${randomColors[2]})`;
            });
            
            // Change colors less frequently for more gradual effect
            setTimeout(changeAuroraColors, Math.random() * 10000 + 18000); // Between 18-28 seconds
        }
        
        // Initial call with slightly longer delay
        setTimeout(changeAuroraColors, 2000);
        
        // Set initial colors without transition
        const layers = document.querySelectorAll('.aurora-layer');
        layers.forEach((layer, index) => {
            layer.style.transition = 'none'; // No transition for initial setup
            
            const colors = [
                // Deep blue to cyan to white
                ['rgba(12, 25, 180, 0.9)', 'rgba(76, 201, 240, 0.7)', 'rgba(255, 255, 255, 0.8)'],
                // Electric blue to white to light blue
                ['rgba(67, 97, 238, 0.8)', 'rgba(255, 255, 255, 0.6)', 'rgba(58, 134, 255, 0.7)'],
                // Deep navy to bright cyan
                ['rgba(0, 41, 107, 0.8)', 'rgba(0, 119, 182, 0.7)', 'rgba(3, 206, 243, 0.9)']
            ];
            
            const randomColors = colors[index % colors.length]; // Use deterministic colors for initial state
            const direction = ['120deg', '-60deg', '30deg'][index % 3];
            
            layer.style.background = `linear-gradient(${direction}, ${randomColors[0]}, ${randomColors[1]}, ${randomColors[2]})`;
            
            // Re-enable transitions after a short delay
            setTimeout(() => {
                layer.style.transition = 'background 18s ease-in-out';
            }, 100);
        });
    }
    
    // Add subtle aurora effect to other sections
    function addSubtleAuroraToSections() {
        const sections = document.querySelectorAll('section:not(#welcome)');
        
        sections.forEach((section, sectionIndex) => {
            // Create subtle aurora container
            const subtleAurora = document.createElement('div');
            subtleAurora.className = 'subtle-aurora-container';
            
            // Create layers
            for (let i = 0; i < 2; i++) {
                const layer = document.createElement('div');
                layer.className = `subtle-aurora-layer subtle-aurora-${i+1}`;
                subtleAurora.appendChild(layer);
            }
            
            // Insert before first child of section
            section.insertBefore(subtleAurora, section.firstChild);
            
            // Position correctly
            subtleAurora.style.height = section.offsetHeight + 'px';
            
            // Update height on window resize
            window.addEventListener('resize', function() {
                subtleAurora.style.height = section.offsetHeight + 'px';
            });
            
            // Set initial colors without transition
            const layers = subtleAurora.querySelectorAll('.subtle-aurora-layer');
            layers.forEach((layer, index) => {
                const colors = [
                    // Very subtle variations of white and pale blue
                    ['rgba(255, 255, 255, 0.4)', 'rgba(240, 248, 255, 0.2)', 'rgba(248, 249, 250, 0.3)'],
                    ['rgba(240, 248, 255, 0.3)', 'rgba(255, 255, 255, 0.2)', 'rgba(230, 240, 250, 0.2)']
                ];
                
                layer.style.transition = 'none';
                const direction = ['120deg', '-60deg'][index % 2];
                layer.style.background = `linear-gradient(${direction}, ${colors[index][0]}, ${colors[index][1]}, ${colors[index][2]})`;
                
                // Enable transitions after initialization
                setTimeout(() => {
                    layer.style.transition = 'background 30s ease-in-out';
                }, 100);
            });
            
            // Very subtle color changes for other sections
            function changeSubtleColors(subtleAurora) {
                const colors = [
                    // Extremely subtle variations - almost white with hints of blue
                    ['rgba(255, 255, 255, 0.4)', 'rgba(240, 248, 255, 0.15)', 'rgba(248, 249, 250, 0.3)'],
                    ['rgba(240, 248, 255, 0.2)', 'rgba(255, 255, 255, 0.3)', 'rgba(230, 240, 250, 0.15)'],
                    ['rgba(248, 249, 250, 0.25)', 'rgba(240, 248, 255, 0.2)', 'rgba(255, 255, 255, 0.3)'],
                    ['rgba(245, 250, 255, 0.2)', 'rgba(255, 255, 255, 0.25)', 'rgba(235, 245, 250, 0.15)']
                ];
                
                const directions = ['120deg', '-60deg', '30deg', '170deg'];
                
                const layers = subtleAurora.querySelectorAll('.subtle-aurora-layer');
                layers.forEach((layer, index) => {
                    const randomColors = colors[Math.floor(Math.random() * colors.length)];
                    const direction = directions[Math.floor(Math.random() * directions.length)];
                    
                    layer.style.transition = 'background 30s ease-in-out';
                    layer.style.background = `linear-gradient(${direction}, ${randomColors[0]}, ${randomColors[1]}, ${randomColors[2]})`;
                });
                
                // Change colors very infrequently for subtle sections
                setTimeout(() => changeSubtleColors(subtleAurora), Math.random() * 15000 + 25000);
            }
            
            // Start subtle color changes after a random delay
            setTimeout(() => changeSubtleColors(subtleAurora), Math.random() * 5000 + 5000);
        });
    }
});

// Create a more visible mouse halo with deeper blues
document.addEventListener('DOMContentLoaded', function() {
    // Remove the existing halo if present
    const existingHalo = document.querySelector('.new-projects-halo');
    if (existingHalo) {
        existingHalo.remove();
    }
    
    const projectsSection = document.getElementById('projects');
    if (!projectsSection) return;
    
    // Create a halo with deeper blues and smaller white section
    const halo = document.createElement('div');
    halo.className = 'new-projects-halo';
    halo.style.cssText = `
        position: absolute;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: radial-gradient(circle, 
            rgba(255,255,255,0.9) 0%,
            rgba(255,255,255,0.7) 8%, /* Smaller white section (was 15%) */
            rgba(67,97,238,0.85) 25%, /* Deeper blue with higher opacity */
            rgba(45,75,205,0.6) 50%, /* Added deeper mid-blue */
            rgba(30,60,180,0.4) 70%, /* Added even deeper outer blue */
            rgba(0,0,0,0) 90%);
        pointer-events: none;
        z-index: 5;
        filter: blur(12px);
        transform: translate(-50%, -50%);
        mix-blend-mode: screen;
        box-shadow: 0 0 40px rgba(45,75,205,0.7); /* Deeper blue glow */
    `;
    
    // Add to body instead of projects section for absolute positioning
    document.body.appendChild(halo);
    
    // Track mouse
    document.addEventListener('mousemove', function(e) {
        const rect = projectsSection.getBoundingClientRect();
        
        // Check if mouse is in projects section
        if (e.clientY >= rect.top && 
            e.clientY <= rect.bottom && 
            e.clientX >= rect.left && 
            e.clientX <= rect.right) {
            
            // Mouse in projects section - show and position halo
            halo.style.opacity = '1';
            halo.style.left = e.clientX + 'px';
            halo.style.top = (e.clientY + window.scrollY) + 'px';
            
        } else {
            // Hide halo outside projects section
            halo.style.opacity = '0';
        }
    });
});

// --- Auto-build poster overlays on project images ---
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
      try {
        const imgWrap = card.querySelector('.project-img-container');
        const titleEl = card.querySelector('.project-title');
        const catEl = card.querySelector('.project-category');
        const yearEl = card.querySelector('.project-time');
        const linkEl = card.querySelector('.project-link');
  
        if (!imgWrap || !titleEl) return;
  
        // 组装叠层 DOM
        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        overlay.setAttribute('aria-hidden','true');
  
        const inner = document.createElement('div');
        inner.className = 'overlay-inner';
  
        const left = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'overlay-title';
        title.textContent = titleEl.textContent.trim();
  
        const meta = document.createElement('div');
        meta.className = 'overlay-meta';
        const cat = catEl ? catEl.textContent.trim() : '';
        const yr = yearEl ? yearEl.textContent.trim() : '';
        meta.textContent = [cat, yr].filter(Boolean).join(' • ');
  
        left.appendChild(title);
        if (cat || yr) left.appendChild(meta);
  
        const right = document.createElement('div');
        right.className = 'overlay-cta';
        right.innerHTML = `View <i class="fas fa-arrow-right"></i>`;
  
        // 让整个图片可点击（复用已有链接）
        if (linkEl && linkEl.getAttribute('href')) {
          // 只在图片区域增加点击，不盖住原有按钮
          imgWrap.style.cursor = 'pointer';
          imgWrap.addEventListener('click', () => {
            window.location.href = linkEl.getAttribute('href');
          });
        }
  
        inner.appendChild(left);
        inner.appendChild(right);
        overlay.appendChild(inner);
        imgWrap.appendChild(overlay);
      } catch (e) {
        console.warn('overlay build failed for a project-card:', e);
      }
    });
  });
  

  // --- Build bottom-anchored slide panel with description on hover ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-card').forEach(card => {
      const imgWrap = card.querySelector('.project-img-container');
      const descEl  = card.querySelector('.project-desc'); // 取原描述文本:contentReference[oaicite:9]{index=9}
      if (!imgWrap) return;
  
      const panel = document.createElement('div');
      panel.className = 'slide-panel';
  
      const desc = document.createElement('p');
      desc.className = 'slide-desc';
      desc.textContent = descEl ? descEl.textContent.trim() : '';
  
      panel.appendChild(desc);
      // 放在 card 内（与图片同级），便于绝对定位
      card.appendChild(panel);
    });
  });
  
  // --- Underline indicator for project filter tabs ---
document.addEventListener('DOMContentLoaded', () => {
    const group = document.querySelector('#projects .filter-buttons');
    const btns  = group ? group.querySelectorAll('.filter-btn') : [];
    if (!group || !btns.length) return;
  
    // 创建共享下划线
    let underline = group.querySelector('.filter-underline');
    if (!underline) {
      underline = document.createElement('div');
      underline.className = 'filter-underline';
      group.appendChild(underline);
    }
  
    // 定位函数：把细下划线移到目标按钮下方
    function moveUnderline(target){
      const gb = group.getBoundingClientRect();
      const bb = target.getBoundingClientRect();
      const left = bb.left - gb.left + group.scrollLeft;
      underline.style.width = bb.width + 'px';
      underline.style.transform = `translateX(${left}px)`;
      underline.style.opacity = '1';
    }
  
    // 初始：找到当前激活按钮（你已有 .active 切换逻辑）并定位
    const initActive = group.querySelector('.filter-btn.active') || btns[0];
    if (initActive) moveUnderline(initActive);
  
    // 点击时移动（不改你的过滤逻辑，只负责动画）
    btns.forEach(btn => btn.addEventListener('click', () => moveUnderline(btn)));
  
    // 容器滚动/窗口尺寸变化时重算
    group.addEventListener('scroll', () => {
      const active = group.querySelector('.filter-btn.active');
      if (active) moveUnderline(active);
    });
    window.addEventListener('resize', () => {
      const active = group.querySelector('.filter-btn.active');
      if (active) moveUnderline(active);
    });
  });
  
// --- Whispers v3: single-node fade in/out with gradient text ---
document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.whispers .whisper');
    if (!el) return;
  
    const lines = [
      'Some freshly brewed projects',
      'Glad you’re here!',
      'Experiments with steady intention',
      'Please enjoy:)',
    ];
    let i = 0;
  
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // 减少动画用户直接静态显示
  
    function fadeSwap(nextText){
      // 先淡出
      el.classList.add('is-fading-out');
      setTimeout(() => {
        // 切文案并标记“将要淡入”的初始状态
        el.textContent = nextText;
        el.classList.remove('is-fading-out');
        el.classList.add('is-fading-in');
        // 触发重排以确保动画
        void el.offsetWidth;
        // 再淡入
        el.classList.remove('is-fading-in');
      }, 220);
    }
  
    setInterval(() => {
      i = (i + 1) % lines.length;
      fadeSwap(lines[i]);
    }, 5000);
  });
  
  