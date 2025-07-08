// 1. Animated Stats
function animateValue(id, start, end, duration, suffix = "") {
  const obj = document.getElementById(id);
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.textContent = Math.floor(progress * (end - start) + start) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.textContent = end.toLocaleString() + suffix;
    }
  };
  window.requestAnimationFrame(step);
}

function animateStatsOnView() {
  let animated = false;
  let scrollTimeout;
  function onScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const stat = document.getElementById('stat-users');
      console.log('Scroll event, stat:', stat);
      if (!stat) return;
      if (!animated && stat.getBoundingClientRect().top < window.innerHeight) {
        animateValue('stat-users', 0, 10000, 3000, '+');
        animateValue('stat-aum', 0, 500, 3000, 'Cr+');
        animateValue('stat-rating', 0, 4.8, 3000, '★');
        animated = true;
        window.removeEventListener('scroll', onScroll);
      }
    }, 50);
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
}

// Page Transition System
class PageTransition {
    constructor() {
        this.overlay = document.getElementById('page-transition');
        this.isTransitioning = false;
    }

    show() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        this.overlay.classList.add('active');
        
        // Add enhanced exit animation to current page
        const main = document.querySelector('main');
        if (main) {
            main.style.animation = 'fadeOutDown 1s ease-out forwards';
        }

        // Add exit animation to header
        const header = document.querySelector('header');
        if (header) {
            header.style.animation = 'fadeOutDown 1s ease-out forwards';
        }
    }

    hide() {
        this.overlay.classList.remove('active');
        this.isTransitioning = false;
    }

    async navigateTo(url) {
        this.show();
        
        // Wait for the full 4-second animation cycle
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Navigate to new page
        window.location.href = url;
    }
}

// Global page transition instance
const pageTransition = new PageTransition();

// Navigation function with transition
function navigateWithTransition(url, event = null) {
    if (event) {
        event.preventDefault();
    }
    
    // Update transition content based on destination
    const transitionContent = document.querySelector('.transition-content h3');
    const subtitleContent = document.querySelector('.transition-content .subtitle');
    
    if (transitionContent && subtitleContent) {
        if (url.includes('home')) {
            transitionContent.textContent = 'Going to Home...';
            subtitleContent.textContent = 'Loading your personalized dashboard';
        } else if (url.includes('about')) {
            transitionContent.textContent = 'Loading About...';
            subtitleContent.textContent = 'Discover our story and mission';
        } else if (url.includes('dashboard')) {
            transitionContent.textContent = 'Loading Dashboard...';
            subtitleContent.textContent = 'Analyzing your portfolio data';
        } else if (url.includes('learning')) {
            transitionContent.textContent = 'Loading Learning Center...';
            subtitleContent.textContent = 'Access educational resources';
        } else if (url.includes('contact')) {
            transitionContent.textContent = 'Loading Contact...';
            subtitleContent.textContent = 'Get in touch with our team';
        } else if (url.includes('investment')) {
            transitionContent.textContent = 'Loading Investment Portal...';
            subtitleContent.textContent = 'Start your investment journey';
        } else if (url.includes('login')) {
            transitionContent.textContent = 'Loading Login...';
            subtitleContent.textContent = 'Secure authentication portal';
        } else if (url.includes('wallet')) {
            transitionContent.textContent = 'Loading Wallet...';
            subtitleContent.textContent = 'Managing your digital assets';
        } else if (url.includes('payment')) {
            transitionContent.textContent = 'Loading Payment...';
            subtitleContent.textContent = 'Secure payment processing';
        } else {
            transitionContent.textContent = 'Loading...';
            subtitleContent.textContent = 'Preparing your experience';
        }
    }
    
    pageTransition.navigateTo(url);
}

// 2. Testimonials Carousel
const testimonials = [
  {
    name: "Erica Sharma",
    text: "MoneyMap simplified my investments beyond belief! The platform is incredibly user-friendly, and the automated diversification is a game-changer.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXNuAgHBlJa1iQ5Qqpsdj-Peaipz8viRknD_OxOH2ZLeJURNWu47DlZEL9kzIngnjE7eT0uKJ1tQnEa9k31Ra08dWIYV7ftxhGy3bh_zDXqLw9SLxDZxNRtf0uMfQZIRuNucgAjVZeKgtg-i-TZ3yngvIc1zvZxXKMiiPZLkqH1mRdhRZK2X88iNIz1o3GmebX8o0QuCfqEQncjbmtNgpY2CxWlmdsuCrmuZLRa5cgZbAhKEi47GJaNUzZ_VYg2exFNI1vntknGSwa"
  },
  {
    name: "Rajesh Kumar",
    text: "As a beginner, investing felt daunting. MoneyMap made it accessible and boosted my confidence to grow my savings effectively.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLj4xBHif7W3OXgeMuE6OO6lfaFoNAUu_RK2OGfy2hGaExMgMaBOsESfjIazJqJDJb-C2zrtW7R4rc-GulQl5x3FIM7WCYXoIu4WeCJfBxeejOrNmPjz4u6pitLx_bztC18s_SVjRApViH730Nld385HDn0LozwfNpV0EksvOVY5qKngl6ULt1EUpf6-VNmUOKs9TuWVeYvTjwJX22JTewIXWwCVsz8wRWdAlO1wd_2VK84tunVXjjqCcQyUVkz7txNfp1kQfqqeN8"
  },
  {
    name: "Anjali Patel",
    text: "The portfolio dashboard is fantastic, giving me a clear overview. MoneyMap truly put me in control of my finances.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlDi1UNGS8wuw3C3EYUBYIjqMmAjXCCIFbOyjHmQDXbPvS97OXSoW8ZSjlRW0RpHI5LhZqLNocUar3W1Q0lXrbBstHf2dR4mhM-DNHTgHlLiPUQ3N15EOTOF7__Y8nV4EypoOxbr6xzg6CjBJW_qer0-yAkAj7SrufkKgWLUbB_uRH_NjkWf1_Dpet--0UWniF_15w8CMh54_qDF17MBOxs66zufNnWZNJGxqyVp5HF92pSrnVa8AJLRSNKOMdyq28DI2US2B3avhe"
  }
];
let testimonialIndex = 0;
const carousel = document.getElementById('testimonials-carousel');
const dots = document.getElementById('testimonial-dots');
function renderTestimonial(idx) {
  if (!carousel || !dots) return;
  carousel.querySelectorAll('.testimonial').forEach(e => e.remove());
  const t = testimonials[idx];
  const div = document.createElement('div');
  div.className = 'testimonial bg-white p-8 rounded-xl shadow-lg mx-auto md:col-span-1';
  div.innerHTML = `<img alt="User avatar ${t.name}" class="w-20 h-20 rounded-full mx-auto mb-5 border-4 border-indigo-500 object-cover" src="${t.img}"/>
  <p class="text-gray-600 italic mb-4">"${t.text}"</p>
  <p class="font-semibold text-indigo-600">${t.name}</p>`;
  carousel.appendChild(div);
  // Dots
  dots.innerHTML = testimonials.map((_, i) => `<button class="w-3 h-3 rounded-full ${i===idx?'bg-indigo-500':'bg-gray-300'}" style="margin:0 4px;"></button>`).join('');
  dots.querySelectorAll('button').forEach((btn, i) => btn.onclick = () => { testimonialIndex = i; renderTestimonial(i); });
}
if (carousel && dots) {
  renderTestimonial(testimonialIndex);
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  if (prevBtn) prevBtn.onclick = () => {
    testimonialIndex = (testimonialIndex - 1 + testimonials.length) % testimonials.length;
    renderTestimonial(testimonialIndex);
  };
  if (nextBtn) nextBtn.onclick = () => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    renderTestimonial(testimonialIndex);
  };
  setInterval(() => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    renderTestimonial(testimonialIndex);
  }, 6000);
}

// 3. Email Signup Validation
const ctaForm = document.getElementById('cta-form');
const ctaEmail = document.getElementById('cta-email');
const ctaSuccess = document.getElementById('cta-success');
if (ctaForm && ctaEmail && ctaSuccess) {
  ctaForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = ctaEmail.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      ctaSuccess.textContent = 'Please enter a valid email address.';
      ctaSuccess.className = 'mt-4 text-red-200 font-semibold';
      ctaSuccess.classList.remove('hidden');
      return;
    }
    ctaSuccess.textContent = 'Thank you! We will be in touch soon.';
    ctaSuccess.className = 'mt-4 text-green-200 font-semibold';
    ctaSuccess.classList.remove('hidden');
    ctaForm.reset();
    // Confetti burst at button position
    const rect = ctaForm.querySelector('button').getBoundingClientRect();
    confettiBurst(rect.left + rect.width/2 + window.scrollX, rect.top + rect.height/2 + window.scrollY);
  });
  ctaEmail.addEventListener('input', function() {
    ctaSuccess.classList.add('hidden');
  });
}

// 4. Mobile Menu
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');
if (mobileMenuBtn && mobileMenu && mobileMenuClose) {
  mobileMenuBtn.onclick = () => mobileMenu.classList.remove('hidden');
  mobileMenuClose.onclick = () => mobileMenu.classList.add('hidden');
  mobileMenu.onclick = (e) => { if (e.target === mobileMenu) mobileMenu.classList.add('hidden'); };
}

// 5. Smooth Scroll for Nav Links
[...document.querySelectorAll('a[href^="#"]')].forEach(link => {
  link.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      if (window.innerWidth < 768 && mobileMenu) mobileMenu.classList.add('hidden');
    }
  });
});

// Section fade-in on scroll
const fadeEls = document.querySelectorAll('.fade-in');
if (fadeEls.length) {
  const fadeObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach(el => fadeObs.observe(el));
}

// Confetti burst on signup
function confettiBurst(x, y) {
  for (let i = 0; i < 32; i++) {
    const conf = document.createElement('div');
    conf.style.position = 'fixed';
    conf.style.left = x + 'px';
    conf.style.top = y + 'px';
    conf.style.width = '8px';
    conf.style.height = '8px';
    conf.style.background = `hsl(${Math.random()*360},90%,60%)`;
    conf.style.borderRadius = '50%';
    conf.style.pointerEvents = 'none';
    conf.style.zIndex = 9999;
    document.body.appendChild(conf);
    const angle = Math.random() * 2 * Math.PI;
    const dist = 80 + Math.random() * 60;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    conf.animate([
      { transform: 'translate(0,0)', opacity: 1 },
      { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }
    ], { duration: 900 + Math.random()*400, easing: 'cubic-bezier(.61,-0.01,.7,1.01)' });
    setTimeout(() => conf.remove(), 1200);
  }
}

// No import needed
// gsap.from(".fade-in", { opacity: 0, y: 50, duration: 1, stagger: 0.2 });

document.addEventListener('DOMContentLoaded', function() {
  // Initialize authentication UI
  updateAuthUI();
  
  // Check for login success parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('login') === 'success') {
    showNotification('Successfully logged in!', 'success');
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  animateStatsOnView();
  AOS.init();

  const header = document.getElementById('main-header');
  const hero = document.getElementById('hero-section');
  window.addEventListener('scroll', () => {
    if (hero && header) {
      if (window.scrollY > (hero.offsetHeight - header.offsetHeight)) {
        header.classList.add('bg-white', 'text-gray-800', 'shadow-lg');
        header.classList.remove('gradient-hero', 'text-[var(--text-light)]');
      } else {
        header.classList.remove('bg-white', 'text-gray-800', 'shadow-lg');
        header.classList.add('gradient-hero', 'text-[var(--text-light)]');
      }
    }
  });

  // GSAP ScrollTrigger example (if needed)
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".my-gsap-section", {
      scrollTrigger: ".my-gsap-section",
      opacity: 0,
      x: 100,
      duration: 1.5
    });
  }
});

// Authentication handling with animations
function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userInfo = document.getElementById('user-info');
  const usernameDisplay = document.getElementById('username-display');
  
  const mobileLoginBtn = document.getElementById('mobile-login-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  const mobileUserInfo = document.getElementById('mobile-user-info');
  const mobileUsernameDisplay = document.getElementById('mobile-username-display');

  if (auth.isAuthenticated && auth.user) {
    // Show authenticated state with animation
    if (loginBtn) {
      loginBtn.style.display = 'none';
      loginBtn.classList.add('hidden');
    }
    if (mobileLoginBtn) {
      mobileLoginBtn.style.display = 'none';
      mobileLoginBtn.classList.add('hidden');
    }

    // Animate logout button appearance
    if (logoutBtn) {
      logoutBtn.classList.remove('hidden');
      logoutBtn.style.display = 'block';
      gsap.fromTo(logoutBtn, 
        { opacity: 0, scale: 0.8, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
    if (mobileLogoutBtn) {
      mobileLogoutBtn.classList.remove('hidden');
      mobileLogoutBtn.style.display = 'block';
      gsap.fromTo(mobileLogoutBtn, 
        { opacity: 0, scale: 0.8, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }

    // Animate user info appearance
    if (userInfo && usernameDisplay) {
      usernameDisplay.textContent = auth.user.username || auth.user.email || 'User';
      userInfo.classList.remove('hidden');
      userInfo.style.display = 'flex';
      gsap.fromTo(userInfo, 
        { opacity: 0, scale: 0.8, x: -20 },
        { opacity: 1, scale: 1, x: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.2 }
      );
    }
    if (mobileUserInfo && mobileUsernameDisplay) {
      mobileUsernameDisplay.textContent = auth.user.username || auth.user.email || 'User';
      mobileUserInfo.classList.remove('hidden');
      mobileUserInfo.style.display = 'block';
      gsap.fromTo(mobileUserInfo, 
        { opacity: 0, scale: 0.8, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.2 }
      );
    }
  } else {
    // Show unauthenticated state with animation
    if (logoutBtn) {
      logoutBtn.style.display = 'none';
      logoutBtn.classList.add('hidden');
    }
    if (mobileLogoutBtn) {
      mobileLogoutBtn.style.display = 'none';
      mobileLogoutBtn.classList.add('hidden');
    }
    if (userInfo) {
      userInfo.style.display = 'none';
      userInfo.classList.add('hidden');
    }
    if (mobileUserInfo) {
      mobileUserInfo.style.display = 'none';
      mobileUserInfo.classList.add('hidden');
    }

    // Animate login button appearance
    if (loginBtn) {
      loginBtn.classList.remove('hidden');
      loginBtn.style.display = 'block';
      gsap.fromTo(loginBtn, 
        { opacity: 0, scale: 0.8, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
    if (mobileLoginBtn) {
      mobileLoginBtn.classList.remove('hidden');
      mobileLoginBtn.style.display = 'block';
      gsap.fromTo(mobileLoginBtn, 
        { opacity: 0, scale: 0.8, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }
}

// Handle logout with video animation
function handleLogout() {
  // Create logout animation overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center';
  overlay.style.backdropFilter = 'blur(5px)';
  document.body.appendChild(overlay);

  // Create logout animation container with video
  const logoutContainer = document.createElement('div');
  logoutContainer.className = 'bg-white rounded-xl p-8 text-center shadow-2xl max-w-md mx-4';
  logoutContainer.innerHTML = `
    <div class="mb-4">
      <div class="logout-video-container">
        <video id="logout-video" class="w-32 h-32 mx-auto mb-4" autoplay muted loop>
          <source src="../assets/videos/logout.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">Logging Out</h3>
      <p class="text-gray-600">Thank you for using MoneyMap!</p>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
      <div id="logout-progress" class="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-1000 shadow-sm" style="width: 0%"></div>
    </div>
    <div class="text-sm text-gray-500">
      <span id="progress-text">0%</span> Complete
    </div>
  `;
  overlay.appendChild(logoutContainer);

  // Animate the logout process
  gsap.fromTo(logoutContainer, 
    { opacity: 0, scale: 0.8, y: 50 },
    { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
  );

  // Get video element
  const video = document.getElementById('logout-video');
  
  // Progress bar animation with proper timing and text updates
  const progressBar = document.getElementById('logout-progress');
  const progressText = document.getElementById('progress-text');
  
  gsap.to('#logout-progress', {
    width: '100%',
    duration: 3, // Increased duration to 3 seconds
    ease: "power2.out",
    onUpdate: function() {
      // Update progress text during animation
      const progress = Math.round(this.progress() * 100);
      if (progressText) {
        progressText.textContent = `${progress}%`;
      }
    },
    onComplete: () => {
      // Ensure progress text shows 100%
      if (progressText) {
        progressText.textContent = '100%';
      }
      
      // Wait a moment to show 100% completion
      setTimeout(() => {
        // Perform logout
        const success = auth.logout();
        
        if (success) {
          // Success animation
          logoutContainer.innerHTML = `
            <div class="mb-4">
              <span class="material-icons text-6xl text-green-500 mb-4">check_circle</span>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Successfully Logged Out</h3>
              <p class="text-gray-600">See you next time!</p>
            </div>
          `;
          
          // Animate out and update UI
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.5,
            delay: 1, // Increased delay to show success state
            onComplete: () => {
              overlay.remove();
              updateAuthUI();
              
              // Show success notification
              showNotification('Successfully logged out!', 'success');
            }
          });
        } else {
          // Error animation
          logoutContainer.innerHTML = `
            <div class="mb-4">
              <span class="material-icons text-6xl text-red-500 mb-4">error</span>
              <h3 class="text-xl font-semibold text-gray-800 mb-2">Error</h3>
              <p class="text-gray-600">Failed to logout. Please try again.</p>
            </div>
          `;
          
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.5,
            delay: 2,
            onComplete: () => overlay.remove()
          });
        }
      }, 500); // Wait 500ms after progress bar reaches 100%
    }
  });

  // Handle video loading
  video.addEventListener('loadstart', () => {
    console.log('Logout video started loading');
  });

  video.addEventListener('canplay', () => {
    console.log('Logout video can start playing');
  });

  // Handle video end event
  video.addEventListener('ended', () => {
    console.log('Logout video finished playing');
    // Restart video if it's a short loop
    if (video.duration < 3) {
      video.currentTime = 0;
      video.play();
    }
  });

  // Handle video error
  video.addEventListener('error', () => {
    console.error('Error loading logout video');
    // Fallback to icon if video fails to load
    const videoContainer = video.parentNode;
    video.style.display = 'none';
    const fallbackIcon = document.createElement('span');
    fallbackIcon.className = 'material-icons text-6xl text-red-500 mb-4 block';
    fallbackIcon.textContent = 'logout';
    videoContainer.appendChild(fallbackIcon);
  });

  // Handle video load timeout
  setTimeout(() => {
    if (video.readyState === 0) {
      console.warn('Video taking too long to load, showing fallback');
      video.dispatchEvent(new Event('error'));
    }
  }, 3000);
}

// Show notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-[9999] px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-500 text-white' : 
    type === 'error' ? 'bg-red-500 text-white' : 
    'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  gsap.fromTo(notification, 
    { opacity: 0, x: 100, scale: 0.8 },
    { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
  );
  
  // Animate out after 3 seconds
  setTimeout(() => {
    gsap.to(notification, {
      opacity: 0,
      x: 100,
      scale: 0.8,
      duration: 0.5,
      onComplete: () => notification.remove()
    });
  }, 3000);
}

// Scroll Down Fade-In Effect
function handleScrollFadeIn() {
  const fadeEls = document.querySelectorAll('.scroll-fade-in');
  fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40) {
      el.classList.add('in-view');
    } else {
      el.classList.remove('in-view');
    }
  });
}
window.addEventListener('scroll', handleScrollFadeIn);
window.addEventListener('DOMContentLoaded', handleScrollFadeIn);


