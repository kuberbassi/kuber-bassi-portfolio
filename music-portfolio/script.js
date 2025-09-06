document.addEventListener('DOMContentLoaded', () => {
    // --- SMOOTH SCROLL SETUP ---
    const lenis = new Lenis();
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- GSAP & ANIMATIONS ---
    gsap.registerPlugin(ScrollTrigger);

    // --- NEW: "ONEPLUS-STYLE" PRELOADER ANIMATION ---
    function initPreloader() {
        const counterElement = document.querySelector(".preloader-counter");
        const preloaderLogo = document.querySelector(".preloader-logo");
        const tl = gsap.timeline();

        tl.delay(0.5);

        // Animate the counter from 0 to 100
        let counter = { value: 0 };
        tl.to(counter, {
            value: 100,
            duration: 2.5,
            ease: "power2.out",
            onUpdate: () => {
                counterElement.textContent = `${Math.round(counter.value)}%`;
            }
        });

        // Fade out counter and fade in logo
        tl.to(counterElement, { opacity: 0, duration: 0.3 }, "-=0.3");
        tl.to(preloaderLogo, { opacity: 1, duration: 1 }, "-=0.3");

        // Hold the logo for a moment
        tl.to(preloaderLogo, { duration: 0.8 });

        // Fade out logo
        tl.to(preloaderLogo, { opacity: 0, duration: 0.5 });

        // --- SMOOTH SHUTTER ANIMATION ---
        tl.to(".preloader-gate-top", {
            yPercent: -100,
            ease: "power4.inOut",
            duration: 1.1
        }, "-=0.3");
        tl.to(".preloader-gate-bottom", {
            yPercent: 100,
            ease: "power4.inOut",
            duration: 1.1
        }, "<");
        tl.to(".preloader-doodles", {
            opacity: 0,
            duration: 0.7,
            ease: "power1.inOut"
        }, "<");

        // Ensure scroll is at top before showing content
        tl.add(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }, "<");

        // Animate main content into view with depth
        tl.fromTo("main", {
            scale: 0.96,
            opacity: 0,
            filter: "blur(16px)"
        }, {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.1,
            ease: "power4.out"
        }, "-=0.7");

        tl.fromTo(".main-header, .dot-nav", {
            y: -20,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
        }, "-=0.9");

        tl.fromTo(".hero-content, .scroll-down-indicator", {
            y: 20,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
        }, "<");

        // Remove the preloader from the DOM after animation
        tl.to(".preloader", { display: 'none' });
    }

    initPreloader();

    // --- Glitch Grid Canvas Background ---
    const canvas = document.getElementById('glitch-grid-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let points = [];
        let mouse = { x: width / 2, y: height / 2, radius: 100 };
        class Point {
            constructor(x, y) { this.x = x; this.y = y; this.originalX = x; this.originalY = y; }
            update() {
                const dx = this.x - mouse.x; const dy = this.y - mouse.y; const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) { const force = (mouse.radius - dist) / mouse.radius; this.x += (dx / dist) * force * 2; this.y += (dy / dist) * force * 2; }
                this.x += (this.originalX - this.x) * 0.1; this.y += (this.originalY - this.y) * 0.1;
                if (Math.random() < 0.005) { this.x += (Math.random() - 0.5) * 10; this.y += (Math.random() - 0.5) * 10; }
            }
        }
        function initGrid() {
            width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; points = []; const gridSize = 30;
            for (let x = 0; x < width + gridSize; x += gridSize) { for (let y = 0; y < height + gridSize; y += gridSize) { points.push(new Point(x, y)); } }
        }
        function animateGrid() {
            ctx.clearRect(0, 0, width, height);
            points.forEach(p => {
                p.update(); ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
                const dx = p.x - mouse.x; const dy = p.y - mouse.y; const dist = Math.sqrt(dx * dx + dy * dy); const intensity = Math.max(0, 1 - dist / 200);
                if (intensity > 0.5 && Math.random() < 0.1) { ctx.fillStyle = `rgba(255, 0, 51, ${intensity})`; } else { ctx.fillStyle = `rgba(163, 163, 163, ${0.2 + intensity * 0.5})`; }
                ctx.fill();
            });
            requestAnimationFrame(animateGrid);
        }
        initGrid(); animateGrid(); window.addEventListener('resize', initGrid); window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    }

    // --- Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', e => {
            gsap.to(cursor, { duration: 0.3, x: e.clientX, y: e.clientY, ease: 'power2.out' });
        });
    } else { if (cursor) cursor.style.display = 'none'; }

    // --- Magnetic Elements ---
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            gsap.to(el, { x: (e.clientX - rect.left - rect.width / 2) * 0.3, y: (e.clientY - rect.top - rect.height / 2) * 0.3, duration: 0.5, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        });
    });

    // --- OnePlus Glitch Effect (FIXED) ---
    function applyGlitchRed() {
        document.querySelectorAll(
            '.logo, .header-tagline span, main h1, main h2, main h3, main h4, main p, main li, main a:not(.hub-button):not(.hub-button *), main span'
        ).forEach(element => {
            if (element.closest('.video-item')) return;
            if (element.classList.contains('glitch-processed')) return;
            const text = element.textContent;
            if (!text) return;
            let glitched = '';
            for (let i = 0; i < text.length; i++) {
                if (Math.random() < 0.03 && text[i] !== ' ') {
                    glitched += `<span style="color:var(--color-accent);transition:color 0.3s;">${text[i]}</span>`;
                } else {
                    glitched += text[i];
                }
            }
            element.innerHTML = glitched;
            element.classList.add('glitch-processed');
        });
    }
    // Run glitch effect every 2.2s for a subtle, seamless feel
    setInterval(() => {
        document.querySelectorAll('.glitch-processed').forEach(el => el.classList.remove('glitch-processed'));
        applyGlitchRed();
    }, 2200);

    // --- Precise Header Inversion ---
    const header = document.querySelector('.main-header');
    gsap.utils.toArray('section').forEach(section => {
        const theme = section.getAttribute('data-section-theme');
        if (theme === 'light') {
            ScrollTrigger.create({
                trigger: section,
                start: 'top 10%',
                end: 'bottom 10%',
                onEnter: () => header.classList.add('header-inverted'),
                onLeaveBack: () => header.classList.remove('header-inverted'),
                onLeave: () => header.classList.remove('header-inverted'),
                onEnterBack: () => header.classList.add('header-inverted'),
            });
        }
    });

    // --- Dot Nav Active State ---
    gsap.utils.toArray('section').forEach(section => {
        ScrollTrigger.create({
            trigger: section, start: 'top center', end: 'bottom center',
            onToggle: self => {
                const link = document.querySelector(`.dot-link[href="#${section.id}"]`);
                if (link) {
                    document.querySelectorAll('.dot-link').forEach(l => l.classList.remove('active'));
                    if (self.isActive) link.classList.add('active');
                }
            }
        });
    });

    // --- Speed Slide Catalogue ---
    const musicCatalogue = document.getElementById('music-catalogue');
    const catalogueWrapper = document.querySelector('.catalogue-wrapper');

    // Replace your old initSpeedSlideCatalogue function with this new one

    async function initSpeedSlideCatalogue() {
        if (!musicCatalogue || !catalogueWrapper) return;

        try {
            const response = await fetch('songs.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const songs = await response.json();

            catalogueWrapper.innerHTML = '';
            songs.forEach(song => {
                const item = document.createElement('a');
                item.className = 'catalogue-item';
                item.href = song.streamUrl || '#';
                item.target = '_blank';
                item.innerHTML = `<img src="${song.coverArtUrl}" alt="${song.title}">`;
                catalogueWrapper.appendChild(item);
            });

            // Clone items for infinite loop
            const items = gsap.utils.toArray('.catalogue-item');
            items.forEach(item => {
                const clone = item.cloneNode(true);
                catalogueWrapper.appendChild(clone);
            });

            // --- SCROLL LOGIC ---
            let x = 0;
            const wrapperWidth = catalogueWrapper.scrollWidth / 2;
            const allCatalogueItems = gsap.utils.toArray('.catalogue-item');

            // Desktop mouse variables
            let mouseVelocity = 0;
            let isHoveringItem = false;
            const idleVelocity = 0.5;

            // Mobile/Tablet touch variables
            let isDragging = false;
            let startX = 0;
            let startScrollX = 0;
            let dragVelocity = 0;
            let lastX = 0;

            // Desktop mouse listeners
            musicCatalogue.addEventListener('mousemove', e => {
                if (isDragging) return; // Don't run if user is dragging
                const rect = musicCatalogue.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const normalizedX = (mouseX / rect.width) * 2 - 1;
                mouseVelocity = normalizedX * 30; // 30 is max velocity
            });
            musicCatalogue.addEventListener('mouseleave', () => {
                mouseVelocity = 0;
            });

            // Mobile/Tablet touch listeners
            musicCatalogue.addEventListener('touchstart', e => {
                isDragging = true;
                startX = e.touches[0].clientX;
                startScrollX = x;
                mouseVelocity = 0;
                dragVelocity = 0;
                lastX = startX;
                catalogueWrapper.style.willChange = 'transform';
            }, { passive: true });

            musicCatalogue.addEventListener('touchmove', e => {
                if (!isDragging) return;
                const currentX = e.touches[0].clientX;
                const deltaX = currentX - startX;
                x = startScrollX + deltaX;
                dragVelocity = currentX - lastX;
                lastX = currentX;
                gsap.set(catalogueWrapper, { x }); // Update position during drag
            }, { passive: true });

            musicCatalogue.addEventListener('touchend', () => {
                isDragging = false;
                catalogueWrapper.style.willChange = 'auto';
            });

            // Hover listeners for all items
            allCatalogueItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    if (isDragging) return;
                    isHoveringItem = true;
                    mouseVelocity = 0;
                    gsap.to(item, { scale: 1.12, boxShadow: "0 16px 48px 0 rgba(255,0,51,0.18)", filter: "brightness(1.08) saturate(1.1)", duration: 0.4, ease: "power2.out" });
                    allCatalogueItems.forEach(otherItem => { if (otherItem !== item) gsap.to(otherItem, { scale: 0.9, opacity: 0.5, duration: 0.4, ease: 'power2.out' }); });
                });
                item.addEventListener('mouseleave', () => {
                    isHoveringItem = false;
                    gsap.to(allCatalogueItems, { scale: 1, opacity: 1, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)", filter: "brightness(1) saturate(1)", duration: 0.4, ease: 'power2.out' });
                });
            });

            // Main animation ticker
            gsap.ticker.add(() => {
                if (!isHoveringItem && !isDragging) {
                    if (Math.abs(dragVelocity) > 0.1) {
                        // Apply momentum from drag
                        x += dragVelocity;
                        dragVelocity *= 0.92; // Friction
                    } else {
                        // Apply mouse or idle velocity
                        x -= mouseVelocity || idleVelocity;
                    }
                }
                // Infinite loop logic
                if (x < -wrapperWidth) x += wrapperWidth;
                if (x > 0) x -= wrapperWidth;
                gsap.set(catalogueWrapper, { x });
            });

            // --- Guidance Graphics ---
            if (!document.querySelector('.catalogue-guidance')) {
                const guidance = document.createElement('div');
                guidance.className = 'catalogue-guidance';
                guidance.innerHTML = `<div class="arrow-left"></div><span class="guidance-text">Hover or drag to explore</span><div class="arrow-right"></div>`;
                musicCatalogue.appendChild(guidance);
            }
        } catch (error) {
            console.error("Could not load or initialize the music catalogue:", error);
        }
    }

    initSpeedSlideCatalogue();
});

// --- Animated Intro Loader ---
window.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('intro-loader');
    if (loader) {
        setTimeout(() => {
            gsap.to(loader, {
                opacity: 0,
                duration: 1.2,
                ease: "power2.inOut",
                onComplete: () => loader.classList.add('hide')
            });
        }, 2400); // Loader stays for 2.4s, then fades out
    }
});

function fillPreloaderDoodles() {
    const doodleContainer = document.querySelector('.preloader-doodles');
    if (!doodleContainer) return;
    doodleContainer.innerHTML = '';
    const doodleChars = ['&#119070;', '&#9835;', '&#119071;', '&#119082;', '&#9833;', '&#119073;', '&#119074;', '&#119075;', '&#119076;', '&#119077;', '&#119078;', '&#119079;'];
    const count = 60; // Number of doodles for texture
    for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.innerHTML = doodleChars[Math.floor(Math.random() * doodleChars.length)];
        span.style.left = `${Math.random() * 98}%`;
        span.style.top = `${Math.random() * 98}%`;
        span.style.fontSize = `${0.9 + Math.random() * 0.8}rem`;
        span.style.opacity = `${0.12 + Math.random() * 0.18}`;
        doodleContainer.appendChild(span);
    }
}
fillPreloaderDoodles();

function oneplusLogoEffect() {
    const logo = document.querySelector('.preloader-logo');
    if (!logo) return;
    const text = "KUβER βΔSSI*";
    let result = '';
    for (let i = 0; i < text.length; i++) {
        if (text[i] !== ' ' && Math.random() < 0.13) {
            result += `<span style="color:var(--color-accent);">${text[i]}</span>`;
        } else {
            result += text[i];
        }
    }
    logo.innerHTML = result;
}
oneplusLogoEffect();

// --- Smooth Scroll for Dot Navigation ---
document.querySelectorAll('.dot-link').forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            e.preventDefault();
            const lenis = window.lenis || null;
            if (lenis) {
                lenis.scrollTo(targetSection, { duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) });
            } else {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});