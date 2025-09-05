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

    // --- OnePlus Glitch Effect ---
    function applyGlitchRed() {
        document.querySelectorAll('h1, h2, h3, h4, p, li, a, span').forEach(element => {
            if (element.classList.contains('glitch-processed') || element.closest('.dot-nav')) return;
            const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === 3 && node.textContent.trim().length > 0);
            textNodes.forEach(node => {
                const text = node.textContent;
                const newHTML = text.split('').map(char => (Math.random() < 0.012) ? `<span class="glitch-red">${char}</span>` : char).join('');
                const newNode = document.createElement('span');
                newNode.innerHTML = newHTML;
                node.parentNode.replaceChild(newNode, node);
                element.classList.add('glitch-processed');
            });
        });
    }
    setTimeout(applyGlitchRed, 1000);

    // --- Precise Header Inversion ---
    const header = document.querySelector('.main-header');
    if(header) {
        ScrollTrigger.create({
            onUpdate: () => {
                const pointElement = document.elementFromPoint(window.innerWidth / 2, header.offsetHeight / 2);
                const section = pointElement ? pointElement.closest('section') : null;
                if (section && section.dataset.sectionTheme === 'light') {
                    header.classList.add('header-inverted');
                } else {
                    header.classList.remove('header-inverted');
                }
            }
        });
    }

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

    async function initSpeedSlideCatalogue() {
        if (!musicCatalogue || !catalogueWrapper) return;

        try {
            const response = await fetch('songs.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const songs = await response.json();

            // 1. Populate the catalogue
            catalogueWrapper.innerHTML = ''; // Clear any existing content
            songs.forEach(song => {
                const item = document.createElement('a');
                item.className = 'catalogue-item';
                item.href = song.streamUrl || '#'; // Assuming streamUrl might exist in JSON
                item.target = '_blank';
                item.innerHTML = `<img src="${song.coverArtUrl}" alt="${song.title}">`;
                catalogueWrapper.appendChild(item);
            });

            const items = gsap.utils.toArray('.catalogue-item');
            let velocity = 0;
            let maxVelocity = 30;
            let isHoveringItem = false;
            
            musicCatalogue.addEventListener('mousemove', e => {
                if (isHoveringItem) return;
                const rect = musicCatalogue.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const normalizedX = (mouseX / rect.width) * 2 - 1;
                velocity = normalizedX * maxVelocity;
            });
            
            musicCatalogue.addEventListener('mouseleave', () => { velocity = 0; });

            items.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    isHoveringItem = true; velocity = 0;
                    gsap.to(item, { scale: 1.1, ease: 'power2.out', duration: 0.4, overwrite: true });
                    items.forEach(otherItem => {
                        if (otherItem !== item) {
                            gsap.to(otherItem, { scale: 0.9, opacity: 0.5, ease: 'power2.out', duration: 0.4, overwrite: true });
                        }
                    });
                });
                item.addEventListener('mouseleave', () => {
                    isHoveringItem = false;
                    gsap.to(items, { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.4, overwrite: true });
                });
            });

            gsap.ticker.add(() => {
                if (!isHoveringItem) {
                    let currentX = gsap.getProperty(catalogueWrapper, "x");
                    let newX = currentX - velocity;

                    const wrapperWidth = catalogueWrapper.offsetWidth;
                    const containerWidth = musicCatalogue.offsetWidth;
                    
                    // Calculate total width of items + gaps
                    const totalItemsWidth = items.reduce((sum, item) => sum + item.offsetWidth, 0);
                    const totalGapWidth = (items.length - 1) * 40; // 40px is gap
                    const effectiveWrapperWidth = totalItemsWidth + totalGapWidth;

                    const maxScroll = (containerWidth - effectiveWrapperWidth) / 2; // Center initially
                    const minScroll = (containerWidth - effectiveWrapperWidth) / 2 - (effectiveWrapperWidth - containerWidth);
                    
                    // Adjusted boundary logic
                    if (newX > maxScroll) newX = maxScroll;
                    if (newX < minScroll) newX = minScroll;
                    
                    gsap.set(catalogueWrapper, { x: newX });
                }
            });

        } catch (error) {
            console.error("Could not load or initialize the music catalogue:", error);
        }
    }
    
    initSpeedSlideCatalogue();
});