// =================== Theme Toggle ===================
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Load theme from localStorage
const currentTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', currentTheme);

// Theme toggle functionality
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const theme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}

// =================== Typewriter Animation for Subtitle ===================
const subtitleElement = document.querySelector('.hero__subtitle');
const subtitleTexts = [
    "Creative Developer & Problem Solver",
    "Full Stack Developer",
    "Web Development Enthusiast",
    "Tech Explorer"
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typewriterEffect() {
    if (!subtitleElement) return;

    const currentText = subtitleTexts[textIndex];

    if (isDeleting) {
        // Deleting characters
        subtitleElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50; // Faster when deleting

        if (charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % subtitleTexts.length;
            typingSpeed = 500; // Pause before typing next text
        }
    } else {
        // Typing characters
        subtitleElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;

        if (charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end before deleting
        }
    }

    setTimeout(typewriterEffect, typingSpeed);
}

// Start typewriter effect when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typewriterEffect, 500); // Small delay before starting
});


// =================== Smooth Scroll & Active Links ===================
const navLinks = document.querySelectorAll('.nav__link');
const sections = document.querySelectorAll('.section, .hero');

// Smooth scroll
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile menu if open
            const navMenu = document.getElementById('nav-menu');
            if (navMenu) navMenu.classList.remove('nav__menu--open');
        }
    });
});

// Active link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// =================== Header Scroll Behavior ===================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.classList.add('header--scroll');
    } else {
        header.classList.remove('header--scroll');
    }

    lastScroll = currentScroll;
});

// =================== Mobile Menu Toggle ===================
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('nav__menu--open');
        navToggle.classList.toggle('ri-close-line');
        navToggle.classList.toggle('ri-menu-3-line');
    });
}

// =================== Certifications Section ===================
let certificationsData = [];
let currentCertFilter = 'newest';

// Load certifications
async function loadCertifications() {
    try {
        const response = await fetch('certifications.json');
        const data = await response.json();
        certificationsData = data.certifications;
        displayCertifications(currentCertFilter);
        updateWittyTagline(data.wittyTaglines);
    } catch (error) {
        console.error('Error loading certifications:', error);
    }
}

// Display certifications
function displayCertifications(filter) {
    const container = document.getElementById('certifications-grid');
    if (!container) return;

    let sortedCerts = [...certificationsData];

    switch (filter) {
        case 'newest':
            sortedCerts.sort((a, b) => new Date(b.issued_date) - new Date(a.issued_date));
            break;
        case 'most-liked':
            sortedCerts.sort((a, b) => getLikes('cert', b.id) - getLikes('cert', a.id));
            break;
        case 'random':
            sortedCerts = sortedCerts.sort(() => Math.random() - 0.5);
            break;
    }

    container.innerHTML = sortedCerts.map(cert => `
        <div class="certification__card" data-cert-id="${cert.id}" onclick="openCertDetail('${cert.id}')">
            <div class="certification__thumbnail">
                <img src="${cert.thumbnail}" alt="${cert.title}" loading="lazy">
            </div>
            <div class="certification__content">
                <h3 class="certification__title">${cert.title}</h3>
                <p class="certification__provider">${cert.provider}</p>
                <div class="certification__meta">
                    <span class="certification__year">${cert.year}</span>
                    <span class="certification__likes">
                        <i class="ri-heart-line"></i> ${getLikes('cert', cert.id)}
                    </span>
                </div>
                <div class="certification__tags">
                    ${cert.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Certification filters
function filterCertifications(filter) {
    currentCertFilter = filter;
    displayCertifications(filter);

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Open certification detail panel
function openCertDetail(certId) {
    const cert = certificationsData.find(c => c.id === certId);
    if (!cert) return;

    const panel = document.getElementById('cert-detail-panel');
    const overlay = document.getElementById('cert-detail-overlay');

    if (!panel || !overlay) return;

    const likes = getLikes('cert', certId);
    const isFavorite = checkFavorite('cert', certId);

    panel.innerHTML = `
        <button class="detail-panel__close" onclick="closeCertDetail()">
            <i class="ri-close-line"></i>
        </button>
        <div class="detail-panel__content">
            <img src="${cert.thumbnail}" alt="${cert.title}" class="detail-panel__image">
            <h2 class="detail-panel__title">${cert.title}</h2>
            <p class="detail-panel__provider"><i class="ri-building-line"></i> ${cert.provider}</p>
            <p class="detail-panel__date"><i class="ri-calendar-line"></i> Issued: ${new Date(cert.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            
            <div class="detail-panel__tags">
                ${cert.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <p class="detail-panel__description">${cert.description}</p>
            
            ${cert.credential_url !== '#' ? `<a href="${cert.credential_url}" target="_blank" class="btn btn--primary">View Certificate</a>` : ''}
            
            <div class="detail-panel__actions">
                <button class="action-btn ${getLikes('cert', certId) > 0 ? 'liked' : ''}" onclick="toggleLike('cert', '${certId}')">
                    <i class="ri-heart-${getLikes('cert', certId) > 0 ? 'fill' : 'line'}"></i> ${likes} ${likes === 1 ? 'Like' : 'Likes'}
                </button>
                <button class="action-btn ${isFavorite ? 'favorited' : ''}" onclick="toggleFavorite('cert', '${certId}')">
                    <i class="ri-star-${isFavorite ? 'fill' : 'line'}"></i> ${isFavorite ? 'Favorited' : 'Favorite'}
                </button>
            </div>
        </div>
    `;

    panel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close certification detail panel
function closeCertDetail() {
    const panel = document.getElementById('cert-detail-panel');
    const overlay = document.getElementById('cert-detail-overlay');

    if (panel && overlay) {
        panel.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Update witty tagline
function updateWittyTagline(taglines) {
    const taglineElement = document.getElementById('cert-tagline');
    if (!taglineElement || !taglines) return;

    const randomTagline = taglines[Math.floor(Math.random() * taglines.length)];
    taglineElement.textContent = randomTagline;
}

// =================== Projects Section ===================
let projectsData = [];
let currentProjectFilter = 'newest';

// Load projects
async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        const data = await response.json();
        projectsData = data.projects;
        displayProjects(currentProjectFilter);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Display projects
function displayProjects(filter) {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    let sortedProjects = [...projectsData];

    switch (filter) {
        case 'newest':
            sortedProjects.sort((a, b) => b.year - a.year);
            break;
        case 'most-liked':
            sortedProjects.sort((a, b) => getLikes('project', b.id) - getLikes('project', a.id));
            break;
        case 'random':
            sortedProjects = sortedProjects.sort(() => Math.random() - 0.5);
            break;
    }

    container.innerHTML = sortedProjects.map(project => `
        <div class="project__card" data-project-id="${project.id}" onclick="openProjectModal('${project.id}')">
            <div class="project__thumbnail">
                <img src="${project.thumbnail}" alt="${project.name}" loading="lazy">
            </div>
            <div class="project__card-content">
                <h3 class="project__card-title">${project.name}</h3>
                <p class="project__card-summary">${project.summary}</p>
                <div class="project__card-tech">
                    ${project.tech.slice(0, 3).map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
                <div class="project__card-meta">
                    <span class="project__likes">
                        <i class="ri-heart-line"></i> ${getLikes('project', project.id)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Project filters
function filterProjects(filter) {
    currentProjectFilter = filter;
    displayProjects(filter);

    // Update active filter button
    document.querySelectorAll('.project-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Open project modal
function openProjectModal(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const overlay = document.getElementById('project-modal-overlay');

    if (!modal || !overlay) return;

    const likes = getLikes('project', projectId);

    modal.innerHTML = `
        <button class="modal__close" onclick="closeProjectModal()">
            <i class="ri-close-line"></i>
        </button>
        <div class="modal__content">
            <div class="modal__images">
                ${project.images.map(img => `<img src="${img}" alt="${project.name}" loading="lazy">`).join('')}
            </div>
            
            <h2 class="modal__title">${project.name}</h2>
            <p class="modal__summary">${project.summary}</p>
            
            <div class="modal__section">
                <h3>Problem Statement</h3>
                <p>${project.problem}</p>
            </div>
            
            <div class="modal__section">
                <h3>Description</h3>
                <p>${project.description}</p>
            </div>
            
            ${project.features ? `
                <div class="modal__section">
                    <h3>Key Features</h3>
                    <ul class="modal__features">
                        ${project.features.map(feature => `<li><i class="ri-check-line"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="modal__section">
                <h3>Technologies Used</h3>
                <div class="modal__tech">
                    ${project.tech.map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
            </div>
            
            <div class="modal__actions">
                <button class="action-btn ${getLikes('project', projectId) > 0 ? 'liked' : ''}" onclick="toggleLike('project', '${projectId}')">
                    <i class="ri-heart-${getLikes('project', projectId) > 0 ? 'fill' : 'line'}"></i> ${likes} ${likes === 1 ? 'Like' : 'Likes'}
                </button>
                ${project.live_url ? `<a href="${project.live_url}" target="_blank" class="btn btn--primary">Live Demo <i class="ri-external-link-line"></i></a>` : ''}
                ${project.github_url ? `<a href="${project.github_url}" target="_blank" class="btn btn--secondary">GitHub <i class="ri-github-fill"></i></a>` : ''}
            </div>
        </div>
    `;

    modal.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close project modal
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    const overlay = document.getElementById('project-modal-overlay');

    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// =================== Likes & Favorites (localStorage) ===================
function getLikes(type, id) {
    const likes = JSON.parse(localStorage.getItem(`${type}-likes`) || '{}');
    return likes[id] || 0;
}

function toggleLike(type, id) {
    event.stopPropagation();
    const likes = JSON.parse(localStorage.getItem(`${type}-likes`) || '{}');
    likes[id] = likes[id] ? 0 : 1;
    localStorage.setItem(`${type}-likes`, JSON.stringify(likes));

    // Refresh display
    if (type === 'cert') {
        displayCertifications(currentCertFilter);
        // If detail panel is open, refresh it
        const panel = document.getElementById('cert-detail-panel');
        if (panel && panel.classList.contains('active')) {
            openCertDetail(id);
        }
    } else {
        displayProjects(currentProjectFilter);
        // If modal is open, refresh it
        const modal = document.getElementById('project-modal');
        if (modal && modal.classList.contains('active')) {
            openProjectModal(id);
        }
    }
}

function checkFavorite(type, id) {
    const favorites = JSON.parse(localStorage.getItem(`${type}-favorites`) || '[]');
    return favorites.includes(id);
}

function toggleFavorite(type, id) {
    event.stopPropagation();
    let favorites = JSON.parse(localStorage.getItem(`${type}-favorites`) || '[]');

    if (favorites.includes(id)) {
        favorites = favorites.filter(fav => fav !== id);
    } else {
        favorites.push(id);
    }

    localStorage.setItem(`${type}-favorites`, JSON.stringify(favorites));

    // Refresh detail panel
    if (type === 'cert') {
        openCertDetail(id);
    }
}

// =================== Contact Form ===================
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        // Basic validation
        if (!name || !email || !subject || !message) {
            showFormMessage('Please fill in all fields', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFormMessage('Please enter a valid email address', 'error');
            return;
        }

        // Simulate form submission (replace with actual backend call)
        showFormMessage('Thank you! Your message has been sent successfully.', 'success');
        contactForm.reset();
    });
}

function showFormMessage(message, type) {
    const messageContainer = document.getElementById('form-message');
    if (!messageContainer) return;

    messageContainer.textContent = message;
    messageContainer.className = `form-message form-message--${type}`;
    messageContainer.style.display = 'block';

    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}

// =================== Scroll Animations ===================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with animation classes
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .slide-in-up, .stagger-item');
    animatedElements.forEach(el => observer.observe(el));
});

// =================== Metrics Counter Animation ===================
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    };

    updateCounter();
}

// Animate metrics on scroll
const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.metric__number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
            });
            metricsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const metricsSection = document.querySelector('.hero__metrics');
if (metricsSection) {
    metricsObserver.observe(metricsSection);
}

// =================== Initialize ===================
document.addEventListener('DOMContentLoaded', () => {
    loadCertifications();
    loadProjects();
});

// Close modals on overlay click
document.addEventListener('click', (e) => {
    if (e.target.id === 'cert-detail-overlay') {
        closeCertDetail();
    }
    if (e.target.id === 'project-modal-overlay') {
        closeProjectModal();
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCertDetail();
        closeProjectModal();
    }
});
