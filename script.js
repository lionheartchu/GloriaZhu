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
// 让鼠标移到指定文字上时，放大成“柔和白圆”
const hoverTargets = document.querySelectorAll(
    '.nav-links li a, .gloria, .zhu, .section-title, .project-title, .title-item, .fb-title, .project-category, .project-time, .sec-title'
  );
  
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-big'));
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
    
    // Simple hover effects - no need for complex blur effects
    projectCards.forEach(card => {
        // Basic hover effects are handled by CSS
    });
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
                                setTimeout(typeWelcome, 60);
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

// Improved location toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const locationLabels = document.querySelectorAll('.location-label');
    const usInfo = document.querySelectorAll('.us-info');
    const chinaInfo = document.querySelectorAll('.china-info');
    
    if (!locationLabels.length) return;

    locationLabels.forEach(label => {
        label.addEventListener('click', function(e) {
            e.preventDefault();
            const isUS = this.dataset.location === 'us';
            
            // Toggle active class
            locationLabels.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Toggle visibility
            usInfo.forEach(el => el.style.display = isUS ? 'flex' : 'none');
            chinaInfo.forEach(el => el.style.display = isUS ? 'none' : 'flex');
        });
    });
});

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
    
//     function initializeAurora() {
//         // Subtle mouse movement effect
//         document.addEventListener('mousemove', function(e) {
//             // Only apply effect when mouse is in the welcome section
//             const rect = welcomeSection.getBoundingClientRect();
//             if (e.clientY < rect.bottom) {
//                 const x = e.clientX / window.innerWidth;
//                 const y = e.clientY / window.innerHeight;
                
//                 const layers = document.querySelectorAll('.aurora-layer');
                
//                 // Create subtle movement based on mouse position
//                 layers.forEach((layer, index) => {
//                     const speed = (index + 1) * 2;
//                     const offsetX = (x - 0.5) * speed;
//                     const offsetY = (y - 0.5) * speed;
                    
//                     layer.style.transform = `translate(${offsetX}%, ${offsetY}%) scale(${1 + (index * 0.1)})`;
//                 });
//             }
//         });
        
//         // Extra smooth color changes with the same rich palette
//         function changeAuroraColors() {
//             const colors = [
//                 ['rgba(112,152,218,0.75)','rgba(179,214,255,0.60)','rgba(169,255,247,0.55)'],
//   // periwinkle → lilac → sage-teal（冷紫边+青尾）
//   ['rgba(98,124,216,0.72)','rgba(188,182,255,0.52)','rgba(130,171,161,0.44)'],
//   // deep teal shade → cornflower → white（暗缘+亮芯）
//   ['rgba(20,88,122,0.36)','rgba(112,152,218,0.58)','rgba(248,251,255,0.60)']
//             ];
//             const directions = ['120deg', '-60deg', '30deg', '170deg', '-30deg', '60deg'];
            
            
//             const layers = document.querySelectorAll('.aurora-layer');
//             layers.forEach((layer, index) => {
//                 const randomColors = colors[Math.floor(Math.random() * colors.length)];
//                 const direction = directions[Math.floor(Math.random() * directions.length)];
                
//                 // Apply new colors with a much slower transition
//                 layer.style.transition = 'background 18s ease-in-out'; // Even slower transition (18s instead of 12s)
//                 layer.style.background = `linear-gradient(${direction}, ${randomColors[0]}, ${randomColors[1]}, ${randomColors[2]})`;
//             });
            
//             // Change colors less frequently for more gradual effect
//             setTimeout(changeAuroraColors, Math.random() * 10000 + 18000); // Between 18-28 seconds
//         }
        
//         // Initial call with slightly longer delay
//         setTimeout(changeAuroraColors, 2000);
        
//         // Set initial colors without transition
//         const layers = document.querySelectorAll('.aurora-layer');
//         layers.forEach((layer, index) => {
//             layer.style.transition = 'none'; // No transition for initial setup
            
//             const colors = [
//                 ['rgba(112,152,218,0.75)','rgba(179,214,255,0.60)','rgba(169,255,247,0.55)'],
//   // periwinkle → lilac → sage-teal（冷紫边+青尾）
//   ['rgba(98,124,216,0.72)','rgba(188,182,255,0.52)','rgba(130,171,161,0.44)'],
//   // deep teal shade → cornflower → white（暗缘+亮芯）
//   ['rgba(20,88,122,0.36)','rgba(112,152,218,0.58)','rgba(248,251,255,0.60)']
//             ];
            
//             const randomColors = colors[index % colors.length]; // Use deterministic colors for initial state
//             const direction = ['120deg', '-60deg', '30deg'][index % 3];
            
//             layer.style.background = `linear-gradient(${direction}, ${randomColors[0]}, ${randomColors[1]}, ${randomColors[2]})`;
            
//             // Re-enable transitions after a short delay
//             setTimeout(() => {
//                 layer.style.transition = 'background 12s ease-in-out';
//             }, 100);
//         });
//     }
    

  function initializeAurora() {
    // ===== layers & parallax (gentle + rAF throttled) =====
    const layers = document.querySelectorAll('.aurora-layer');
    if (!layers.length) return;
  
    let rafId = 0, relX = 0, relY = 0;
    document.addEventListener('mousemove', (e) => {
      const rect = welcomeSection.getBoundingClientRect();
      const inside = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (inside) {
        relX = (e.clientX / window.innerWidth) - 0.5;
        relY = ((e.clientY - rect.top) / rect.height) - 0.5;
      } else { relX = 0; relY = 0; }
      if (!rafId) rafId = requestAnimationFrame(applyParallax);
    });
  
    function applyParallax() {
      rafId = 0;
      layers.forEach((layer, i) => {
        const speed = (i + 1) * 1.4;
        const offsetX = relX * speed;
        const offsetY = relY * speed;
        const scale   = 1 + i * 0.06;
        layer.style.transform = `translate(${offsetX}%, ${offsetY}%) scale(${scale})`;
      });
    }
  
    // ===== Light Dreamcore Palette: Icy Blue, Cyan, & Soft Pink accents =====
    const BASE = [
      // Icy Cyan to Blue (Clean & Fresh)
      ['rgba(170,240,255,0.45)','rgba(200,230,255,0.40)','rgba(220,245,255,0.38)'],
      // Soft Blue to Lavender (Dreamy base)
      ['rgba(180,210,255,0.42)','rgba(210,200,255,0.38)','rgba(240,245,255,0.40)'],
      // White-Blue to Mint (Bright & Light)
      ['rgba(200,240,255,0.40)','rgba(230,255,250,0.38)','rgba(250,250,255,0.42)']
    ];
    const ACCENT = [
      // Dreamcore Pink/Purple Punch (Subtle but visible)
      ['rgba(255,190,220,0.38)','rgba(200,180,255,0.40)','rgba(180,220,255,0.42)'],
      // Electric Cyan Accent
      ['rgba(140,240,255,0.45)','rgba(180,220,255,0.40)','rgba(230,250,255,0.42)'],
      // Soft Lilac & Cloud
      ['rgba(210,190,255,0.40)','rgba(230,210,250,0.38)','rgba(245,245,255,0.42)']
    ];
    const DIRS = ['120deg','30deg','-60deg','75deg','-30deg','150deg'];
  
    // Control accent frequency and transition timing - calm and intentional
    const ACCENT_RATIO = 0.35;
    const DURATION = 25;
    const MIN_INTERVAL = 20, MAX_INTERVAL = 32;
  
    // Initial coloring with premium palette
    layers.forEach((layer, i) => {
      const useAccent = (i === Math.floor(Math.random()*layers.length));
      const pal = useAccent ? ACCENT[Math.floor(Math.random()*ACCENT.length)]
                            : BASE[i % BASE.length];
      const dir = DIRS[i % DIRS.length];
      layer.style.transition = 'none';
      layer.style.background = `linear-gradient(${dir}, ${pal[0]}, ${pal[1]}, ${pal[2]})`;
      setTimeout(() => {
        layer.style.transition = `background ${DURATION}s cubic-bezier(.22,1,.36,1)`;
      }, 120);
    });
  
    // Smooth color transitions
    function changeAuroraColors() {
      const idx = Math.floor(Math.random() * layers.length);
      const layer = layers[idx];
      const useAccent = Math.random() < ACCENT_RATIO;
      const pal = (useAccent ? ACCENT : BASE)[Math.floor(Math.random() * (useAccent ? ACCENT.length : BASE.length))];
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
      layer.style.background = `linear-gradient(${dir}, ${pal[0]}, ${pal[1]}, ${pal[2]})`;
      const next = (MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)) * 1000;
      setTimeout(changeAuroraColors, next);
    }
    setTimeout(changeAuroraColors, 2000);
  }
  function initializeAurora() {
    // ===== layers & parallax (更温和 + rAF 节流) =====
    const layers = document.querySelectorAll('.aurora-layer');
    if (!layers.length) return;
  
    let rafId = 0, relX = 0, relY = 0;
    document.addEventListener('mousemove', (e) => {
      const rect = welcomeSection.getBoundingClientRect();
      const inside = e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (inside) {
        relX = (e.clientX / window.innerWidth) - 0.5;
        relY = ((e.clientY - rect.top) / rect.height) - 0.5;
      } else { relX = 0; relY = 0; }
      if (!rafId) rafId = requestAnimationFrame(applyParallax);
    });
  
    function applyParallax() {
      rafId = 0;
      layers.forEach((layer, i) => {
        const speed = (i + 1) * 1.4; // 温和一点
        const offsetX = relX * speed;
        const offsetY = relY * speed;
        const scale   = 1 + i * 0.06;
        layer.style.transform = `translate(${offsetX}%, ${offsetY}%) scale(${scale})`;
      });
    }
  
    // ===== Light Dreamcore Palette: Icy Blue, Cyan, & Soft Pink accents =====
    const BASE = [
      // Icy Cyan to Blue (Clean & Fresh)
      ['rgba(170,240,255,0.45)','rgba(200,230,255,0.40)','rgba(220,245,255,0.38)'],
      // Soft Blue to Lavender (Dreamy base)
      ['rgba(180,210,255,0.42)','rgba(210,200,255,0.38)','rgba(240,245,255,0.40)'],
      // White-Blue to Mint (Bright & Light)
      ['rgba(200,240,255,0.40)','rgba(230,255,250,0.38)','rgba(250,250,255,0.42)']
    ];
    const ACCENT = [
      // Dreamcore Pink/Purple Punch (Subtle but visible)
      ['rgba(255,190,220,0.38)','rgba(200,180,255,0.40)','rgba(180,220,255,0.42)'],
      // Electric Cyan Accent
      ['rgba(140,240,255,0.45)','rgba(180,220,255,0.40)','rgba(230,250,255,0.42)'],
      // Soft Lilac & Cloud
      ['rgba(210,190,255,0.40)','rgba(230,210,250,0.38)','rgba(245,245,255,0.42)']
    ];
    const DIRS = ['120deg','30deg','-60deg','75deg','-30deg','150deg'];
  
    // Control accent frequency and transition timing - calm and intentional
    const ACCENT_RATIO = 0.35;
    const DURATION = 20;
    const MIN_INTERVAL = 15, MAX_INTERVAL = 25;
  
    // ===== 初始着色：多用清淡，随机挑一层用重色，立刻有“点睛” =====
    layers.forEach((layer, i) => {
      const useAccent = (i === Math.floor(Math.random()*layers.length)); // 仅一层
      const pal = useAccent ? ACCENT[Math.floor(Math.random()*ACCENT.length)]
                            : BASE[i % BASE.length];
      const dir = DIRS[i % DIRS.length];
      layer.style.transition = 'none';
      layer.style.background = `linear-gradient(${dir}, ${pal[0]}, ${pal[1]}, ${pal[2]})`;
      setTimeout(() => {
        layer.style.transition = `background ${DURATION}s cubic-bezier(.22,1,.36,1)`;
      }, 120);
    });
  
    // ===== 平滑换色：每次只换“一层”，且有概率使用重色 =====
    function changeAuroraColors() {
      const idx = Math.floor(Math.random() * layers.length);   // 随机一层
      const layer = layers[idx];
      const useAccent = Math.random() < ACCENT_RATIO;          // 偶尔加重色
      const pal = (useAccent ? ACCENT : BASE)[Math.floor(Math.random() * (useAccent ? ACCENT.length : BASE.length))];
      const dir = DIRS[Math.floor(Math.random() * DIRS.length)];
      layer.style.background = `linear-gradient(${dir}, ${pal[0]}, ${pal[1]}, ${pal[2]})`;
      const next = (MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)) * 1000;
      setTimeout(changeAuroraColors, next);
    }
    setTimeout(changeAuroraColors, 2000);
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
        width: 180px;
        height: 180px;
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
// Disabled - no longer showing overlays on project images
  

  
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
    }, 7000);
  });
  
  
  // === Sticky Projects v2: image-first, then content reveal ===
(function initStickyProjectsV2() {
    const container = document.querySelector('#projects .projects-container');
    if (!container) return;
  
    const cards = Array.from(container.querySelectorAll('.project-card'));
    if (!cards.length) return;
  
    // 避免重复初始化
    if (container.querySelector('.sticky-block')) return;
  
    // 1) 包裹每张卡，并标记 sticky 样式
    cards.forEach(card => {
      const wrap = document.createElement('div');
      wrap.className = 'sticky-block';
      card.classList.add('sticky-panel');
      container.insertBefore(wrap, card);
      wrap.appendChild(card);
    });
  
    const blocks = Array.from(container.querySelectorAll('.sticky-block'));
  
    // 2) 根据滚动计算每块的进度 p(0→1)
    let ticking = false;
    function update() {
      ticking = false;
      const vh = window.innerHeight;
  
      blocks.forEach(block => {
        const panel = block.firstElementChild; // .project-card
        const rect = block.getBoundingClientRect();
        const stickRange = block.offsetHeight - vh; // 可粘住滚动区间
        let p = 0;
  
        if (stickRange > 0) {
          if (rect.top <= 0 && rect.bottom >= vh) {
            p = Math.min(1, Math.max(0, -rect.top / stickRange));
          } else if (rect.top > 0) p = 0;
          else if (rect.bottom < vh) p = 1;
        }
  
        // —— 分段映射：进入 → 停留(hold) → 退出 ——
// 可微调三个段落的分界：进入结束(ENTER_END) & 停留结束(HOLD_END)
const ENTER_START = 0.18;
const ENTER_END   = 0.38;  // 文字开始清晰的时间点
const HOLD_END    = 0.68;  // 在这里之前保持“停留感”

const clamp01 = v => Math.max(0, Math.min(1, v));
const invLerp = (a, b, x) => clamp01((x - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;

// 文字透明度：先出现→完全可读→停留一段→轻微淡出（保持对比，不会突然消失）
let contentAlpha =
  (p < ENTER_START) ? 0 :
  (p < ENTER_END)   ? invLerp(ENTER_START, ENTER_END, p) :       // 渐显
  (p < HOLD_END)    ? 1 :                                        // 停留（完全可读）
                      1 - invLerp(HOLD_END, 1, p) * 0.15;        // 轻微淡出到 0.85

// 文字上移：在“停留”区间内慢慢上移到 18px，其余时刻不动
let textShiftPx =
  (p < ENTER_END) ? 0 :
  (p < HOLD_END)  ? lerp(0, 18, invLerp(ENTER_END, HOLD_END, p)) :
                    18;

// 图片模糊：开始略微 2px，进入完成后基本清晰（提升可读性）
let imgBlur =
  (p < ENTER_END) ? lerp(2, 0, invLerp(0, ENTER_END, p)) : 0;

// 写入 CSS 变量
panel.style.setProperty('--progress', p.toFixed(3));
panel.style.setProperty('--img-blur', `${imgBlur.toFixed(2)}px`);
panel.style.setProperty('--content-alpha', contentAlpha.toFixed(3));
panel.style.setProperty('--text-shift', `${textShiftPx.toFixed(1)}px`);

      });
    }
  
    function onScroll() {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }
  
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll(); // 初始计算
  })();
  
  // === Intro Full-Bleed: sticky float-up + blurred bg slideshow ===
(function initIntroFullBleed(){
    const block   = document.querySelector('#intro-fb .fb-sticky');
    const content = document.querySelector('#intro-fb .fb-content');
    const media   = document.querySelector('#intro-fb .fb-media');
    if (!block || !content || !media) return;
  
    // 1) 滚动进度 p(0→1) —— 驱动文字上浮 & 背景模糊微调
    let ticking = false;
    function update(){
      ticking = false;
      const vh   = window.innerHeight;
      const rect = block.getBoundingClientRect();
      const range = Math.max(0, block.offsetHeight - vh);
      let p = 0;
      if (range > 0){
        if (rect.top <= 0 && rect.bottom >= vh) p = Math.min(1, Math.max(0, -rect.top / range));
        else if (rect.top > 0) p = 0;
        else if (rect.bottom < vh) p = 1;
      }
      content.style.setProperty('--fb-p', p.toFixed(3));
  
      // 背景模糊：开始 6px → 结束约 3.5px（更清晰一点，便于阅读）
      const blurPx = 2 - p * 2.5;
      media.querySelectorAll('img').forEach(img=>{
        img.style.filter = `blur(${blurPx.toFixed(2)}px) brightness(.95) saturate(.95)`;
      });
    }
    function onScroll(){ if (!ticking){ requestAnimationFrame(update); ticking = true; } }
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll);
    onScroll();
  
    // 2) 背景轮播：逐张淡入
    const slides = Array.from(media.querySelectorAll('img'));
    slides.forEach((img,i)=> img.classList.toggle('is-active', i===0));
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && slides.length > 1){
      let i = 0;
      setInterval(()=>{
        slides[i].classList.remove('is-active');
        i = (i + 1) % slides.length;
        slides[i].classList.add('is-active');
      }, 3600); // 每 3.6s 切换
    }
  })();
  
