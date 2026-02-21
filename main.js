/* ============================================
   MAX VERSTAPPEN PORTFOLIO - MAIN JS
   Three.js 3D Particles + GSAP Scroll Animations
   ============================================ */

// ---- Utility ----
const lerp = (a, b, t) => a + (b - a) * t;

// ---- Custom Cursor ----
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX = lerp(cursorX, mouseX, 0.2);
    cursorY = lerp(cursorY, mouseY, 0.2);
    followerX = lerp(followerX, mouseX, 0.08);
    followerY = lerp(followerY, mouseY, 0.08);

    if (cursor) {
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
    }
    if (follower) {
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effects
document.querySelectorAll('a, button, .btn, .gallery-item, .stat-card, .video-card, .timeline-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor?.classList.add('hover');
        follower?.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor?.classList.remove('hover');
        follower?.classList.remove('hover');
    });
});

// ---- Three.js 3D Particle System ----
class ParticleField {
    constructor() {
        this.canvas = document.getElementById('three-canvas');
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);

        this.clock = new THREE.Clock();

        this.createParticles();
        this.createFloatingGeometry();
        this.addLights();
        this.setupEvents();
        this.animate();
    }

    createParticles() {
        const count = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorRed = new THREE.Color(0xe10600);
        const colorGold = new THREE.Color(0xf5a623);
        const colorBlue = new THREE.Color(0x1e3799);
        const colorCyan = new THREE.Color(0x00d4ff);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 40;
            positions[i3 + 1] = (Math.random() - 0.5) * 40;
            positions[i3 + 2] = (Math.random() - 0.5) * 30 - 5;

            const colorChoice = Math.random();
            let color;
            if (colorChoice < 0.3) color = colorRed;
            else if (colorChoice < 0.5) color = colorGold;
            else if (colorChoice < 0.7) color = colorBlue;
            else color = colorCyan;

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = Math.random() * 3 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        this.particlePositions = positions;
        this.particleCount = count;
    }

    createFloatingGeometry() {
        this.floatingMeshes = [];

        // Floating wireframe torus rings (like tire outlines)
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0xe10600,
            wireframe: true,
            transparent: true,
            opacity: 0.12,
        });

        for (let i = 0; i < 5; i++) {
            const torusGeom = new THREE.TorusGeometry(
                1 + Math.random() * 2,
                0.03 + Math.random() * 0.05,
                8,
                40
            );
            const torus = new THREE.Mesh(torusGeom, torusMaterial.clone());
            torus.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                -5 - Math.random() * 10
            );
            torus.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                0
            );
            torus.userData = {
                rotSpeed: (Math.random() - 0.5) * 0.005,
                floatSpeed: 0.3 + Math.random() * 0.5,
                floatAmp: 0.3 + Math.random() * 0.5,
                baseY: torus.position.y,
            };
            this.floatingMeshes.push(torus);
            this.scene.add(torus);
        }

        // Add wireframe icosahedrons
        const icoMaterial = new THREE.MeshBasicMaterial({
            color: 0xf5a623,
            wireframe: true,
            transparent: true,
            opacity: 0.08,
        });

        for (let i = 0; i < 3; i++) {
            const icoGeom = new THREE.IcosahedronGeometry(0.8 + Math.random() * 1.5, 1);
            const ico = new THREE.Mesh(icoGeom, icoMaterial.clone());
            ico.position.set(
                (Math.random() - 0.5) * 25,
                (Math.random() - 0.5) * 15,
                -8 - Math.random() * 8
            );
            ico.userData = {
                rotSpeed: (Math.random() - 0.5) * 0.008,
                floatSpeed: 0.2 + Math.random() * 0.4,
                floatAmp: 0.5 + Math.random() * 0.5,
                baseY: ico.position.y,
            };
            this.floatingMeshes.push(ico);
            this.scene.add(ico);
        }
    }

    addLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambient);
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsed = this.clock.getElapsedTime();

        // Smooth mouse following
        this.mouse.x = lerp(this.mouse.x, this.targetMouse.x, 0.05);
        this.mouse.y = lerp(this.mouse.y, this.targetMouse.y, 0.05);

        // Animate particles
        if (this.particles) {
            this.particles.rotation.y = elapsed * 0.02 + this.mouse.x * 0.3;
            this.particles.rotation.x = this.mouse.y * 0.2;

            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += Math.sin(elapsed * 0.5 + i * 0.01) * 0.002;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Animate floating meshes
        this.floatingMeshes.forEach(mesh => {
            mesh.rotation.x += mesh.userData.rotSpeed;
            mesh.rotation.y += mesh.userData.rotSpeed * 1.3;
            mesh.position.y = mesh.userData.baseY +
                Math.sin(elapsed * mesh.userData.floatSpeed) * mesh.userData.floatAmp;
        });

        // Camera subtle movement
        this.camera.position.x = lerp(this.camera.position.x, this.mouse.x * 1.5, 0.02);
        this.camera.position.y = lerp(this.camera.position.y, this.mouse.y * 1, 0.02);
        this.camera.position.z = 12;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// ---- Loading Screen ----
function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loader-fill');
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('hidden');
                initHeroAnimations();
            }, 400);
        }
        fill.style.width = progress + '%';
    }, 200);
}

// ---- Hero Animations ----
function initHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 1, delay: 0.2 })
        .to('.hero-title-line:nth-child(1)', { opacity: 1, y: 0, duration: 1.2 }, '-=0.6')
        .to('.hero-title-line:nth-child(2)', { opacity: 1, y: 0, duration: 1.2 }, '-=0.8')
        .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
}

// ---- GSAP ScrollTrigger Animations ----
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Nav scroll effect
    ScrollTrigger.create({
        start: 100,
        onUpdate: (self) => {
            const nav = document.getElementById('nav');
            if (self.direction === 1 && self.scroll() > 100) {
                nav.classList.add('scrolled');
            } else if (self.scroll() < 100) {
                nav.classList.remove('scrolled');
            }
        }
    });

    // About section
    gsap.from('.about-image-wrapper', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
        },
        x: -100,
        opacity: 0,
    });

    gsap.from('.about-content', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
        },
        x: 100,
        opacity: 0,
    });

    // Stats counters
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 60,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power3.out',
            onStart: () => animateCounter(card),
        });
    });

    // Timeline items
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        const direction = item.classList.contains('left') ? -80 : 80;
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            x: direction,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.08,
            ease: 'power3.out',
        });
    });

    // Gallery items
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 80,
            opacity: 0,
            scale: 0.9,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power3.out',
        });
    });

    // Video cards
    document.querySelectorAll('.video-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 60,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'power3.out',
        });
    });

    // Quote section
    gsap.from('.quote-text', {
        scrollTrigger: {
            trigger: '.quote-section',
            start: 'top 70%',
            toggleActions: 'play none none none',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
    });

    gsap.from('.quote-author', {
        scrollTrigger: {
            trigger: '.quote-section',
            start: 'top 60%',
            toggleActions: 'play none none none',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out',
    });

    // Section labels and titles
    document.querySelectorAll('.section-label, .section-title').forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
        });
    });

    // Parallax on quote bg
    gsap.to('.quote-bg img', {
        scrollTrigger: {
            trigger: '.quote-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
        y: -100,
        ease: 'none',
    });
}

// ---- Counter Animation ----
function animateCounter(card) {
    const target = parseInt(card.dataset.count);
    const counter = card.querySelector('.counter');
    if (!counter || counter.dataset.animated) return;
    counter.dataset.animated = 'true';

    let current = 0;
    const duration = 2000;
    const step = target / (duration / 16);

    function update() {
        current += step;
        if (current >= target) {
            counter.textContent = target;
            return;
        }
        counter.textContent = Math.floor(current);
        requestAnimationFrame(update);
    }
    update();
}

// ---- Navigation ----
function initNavigation() {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('open');
            mobileMenu?.classList.remove('open');
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    scrollTo: { y: target, offsetY: 70 },
                    duration: 1,
                    ease: 'power3.inOut',
                });
            }
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 150;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                navLink?.classList.add('active');
            }
        });
    });
}

// ---- Tilt Effect on Cards ----
function initTiltEffects() {
    const cards = document.querySelectorAll('.stat-card, .timeline-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -5;
            const rotateY = (x - centerX) / centerX * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ---- Stats Background Particles (CSS-based) ----
function initStatsParticles() {
    const container = document.getElementById('stats-particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: ${Math.random() > 0.5 ? 'rgba(225, 6, 0, 0.3)' : 'rgba(245, 166, 35, 0.2)'};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float-particle ${3 + Math.random() * 5}s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
        `;
        container.appendChild(dot);
    }

    // Add CSS keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float-particle {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
            25% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
            50% { transform: translateY(-10px) translateX(-10px); opacity: 0.5; }
            75% { transform: translateY(-30px) translateX(5px); opacity: 0.8; }
        }
    `;
    document.head.appendChild(style);
}

// ---- Magnetic Buttons ----
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.3,
                ease: 'power2.out',
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)',
            });
        });
    });
}

// ---- Gallery Lightbox-style hover ----
function initGalleryEffects() {
    const items = document.querySelectorAll('.gallery-item');

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.02,
                duration: 0.4,
                ease: 'power2.out',
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
            });
        });
    });
}

// ---- Initialize Everything ----
document.addEventListener('DOMContentLoaded', () => {
    // Start Three.js
    new ParticleField();

    // Start loader
    initLoader();

    // Init navigation
    initNavigation();

    // Init scroll animations
    initScrollAnimations();

    // Init interactive effects
    initTiltEffects();
    initStatsParticles();
    initMagneticButtons();
    initGalleryEffects();
});
