// Background Image Configuration System
const backgroundConfig = {
    // Background images from your images folder
    hero: {
        background: 'url("images/hero-cityscape.jpg")',
    },
    mission: {
        background: 'linear-gradient(rgba(100,100,100,0.7), rgba(60,60,60,0.8)), url("images/hero-cityscape.jpg")',
    },
    feature: {
        background: 'url("images/mountain-range.jpg")',
    },
    cta: {
        background: 'url("images/city-sunset.jpg")',
    },

};

// Apply background configurations
function applyBackgrounds() {
    const heroBg = document.getElementById('hero-bg');
    const missionBg = document.getElementById('mission-bg');
    const featureImg = document.getElementById('feature-img');
    const ctaImg = document.getElementById('cta-img');
    if (heroBg) heroBg.style.background = backgroundConfig.hero.background;
    if (missionBg) missionBg.style.background = backgroundConfig.mission.background;
    if (featureImg) featureImg.style.background = backgroundConfig.feature.background;
    if (ctaImg) ctaImg.style.background = backgroundConfig.cta.background;
}

// Function to update background images dynamically
function updateBackground(section, imageUrl) {
    const element = document.getElementById(section);
    if (element) {
        element.style.background = `url("${imageUrl}")`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
    }
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Apply background configurations
    applyBackgrounds();

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Reload button functionality
    const reloadBtn = document.querySelector('.reload-btn');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', function() {
            location.reload();
        });
    }

    // CTA button functionality
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Navigate to models page
            window.location.href = 'models.html';
        });
    }

    // Learn more button functionality
    const learnMoreBtn = document.querySelector('.learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // Scroll to CTA section
            const ctaSection = document.querySelector('.cta-section');
            if (ctaSection) {
                ctaSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Take action button functionality
    const takeActionBtn = document.querySelector('.take-action-btn');
    if (takeActionBtn) {
        takeActionBtn.addEventListener('click', function() {
            // Scroll to newsletter section
            const newsletterSection = document.querySelector('.newsletter');
            if (newsletterSection) {
                newsletterSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('.email-input');
            const email = emailInput.value;
            
            if (email) {
                // Here you would typically send the email to your backend
                alert('Thank you for signing up! We\'ll keep you updated on our events.');
                emailInput.value = '';
            }
        });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.1)';
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections for fade-in effect
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });


});

// Background Image Management Functions
// These functions allow you to easily update background images

function setHeroBackground(imageUrl) {
    updateBackground('hero-bg', imageUrl);
}

function setMissionBackground(imageUrl) {
    updateBackground('mission-bg', imageUrl);
}

function setFeatureBackground(imageUrl) {
    updateBackground('feature-img', imageUrl);
}

function setCTABackground(imageUrl) {
    updateBackground('cta-img', imageUrl);
}



// Example usage:
// setHeroBackground('images/city-sunset.jpg');
// setMissionBackground('images/sky-background.jpg');
// setFeatureBackground('images/mountain-range.jpg');
// setCTABackground('images/city-skyline.jpg');


// Export functions for external use
window.ClimatologyWebsite = {
    setHeroBackground,
    setMissionBackground,
    setFeatureBackground,
    setCTABackground,

    updateBackground
}; 

// Dropdown menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.nav-dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    if (dropdown && dropdownToggle && dropdownContent) {
        // Toggle dropdown on click
        dropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                dropdownContent.style.display = 'none';
            }
        });
        
        // Keep dropdown open when hovering over it
        dropdown.addEventListener('mouseenter', function() {
            dropdownContent.style.display = 'block';
        });
        
        dropdown.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (!dropdown.matches(':hover')) {
                    dropdownContent.style.display = 'none';
                }
            }, 100);
        });
    }
}); 