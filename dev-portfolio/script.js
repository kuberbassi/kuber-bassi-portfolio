document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);
    const mainContent = document.getElementById('main-content');

    // --- SETUP FUNCTIONS ---
    setupInteractiveText();
    setupMobileNav(); // <-- New function for the mobile menu
    fetchGitHubRepos();
    setupInteractiveImage();
    setupScrollBasedAnimations();
    setupCustomCursor();
    setupHeaderInversion();
    setupAdvancedAnimations();
    createFloatingSymbols();
    setupParallax();

    // --- PRELOADER TIMELINE ---
    const tl = gsap.timeline();
    tl.to('.loading-bar', { width: '100%', duration: 2.5, ease: 'power3.inOut' })
        .to('.loading-percent', { innerText: 100, duration: 2.5, ease: 'power3.inOut', snap: 'innerText' }, '<')
        .to('.preloader-content', { opacity: 0, duration: 0.5, ease: 'power1.in' }, '-=0.5')
        .to('.top-gate', { height: 0, duration: 1.2, ease: 'expo.inOut' })
        .to('.bottom-gate', { height: 0, duration: 1.2, ease: 'expo.inOut' }, '<')
        .set('#preloader', { display: 'none' })
        .set(mainContent, { visibility: 'visible' })
        .from('.main-header', { y: '-100%', duration: 1, ease: 'expo.out' }, '-=0.8')
        .from('#hero .main-heading .char', { y: '100%', opacity: 0, stagger: 0.02, duration: 1, ease: 'expo.out' }, '-=1')
        .from('.hero-subtext', { opacity: 0, y: 20, duration: 1, ease: 'expo.out' }, '-=0.8')
        .from(['.hero-graphic', '.hero-blob'], { opacity: 0, scale: 0.5, stagger: 0.05, duration: 1.2, ease: 'expo.out' }, '<');


    // --- FUNCTION DEFINITIONS ---

    // NEW FUNCTION FOR MOBILE NAVIGATION
    function setupMobileNav() {
        const toggleButton = document.querySelector('.mobile-nav-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        const navLinks = document.querySelectorAll('.mobile-nav-link');

        if (!toggleButton || !mobileNav) return;

        // Function to close the menu
        const closeMenu = () => {
            toggleButton.classList.remove('is-active');
            mobileNav.classList.remove('is-active');
            document.body.classList.remove('no-scroll');
        };

        // Toggle menu on button click
        toggleButton.addEventListener('click', () => {
            toggleButton.classList.toggle('is-active');
            mobileNav.classList.toggle('is-active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu if a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu if the overlay (background) is clicked
        mobileNav.addEventListener('click', (e) => {
            if (e.target === mobileNav) {
                closeMenu();
            }
        });
    }

    function createFloatingSymbols() {
        const symbols = ['{}', '/>', ';', '+', '0', '1', 'Σ', '>', '<', '#', '&', '*', '@', '$', '%'];
        document.querySelectorAll('.symbol-container').forEach(container => {
            const symbolCount = container.parentElement.id === 'hero' ? 80 : 20;
            for (let i = 0; i < symbolCount; i++) {
                const span = document.createElement('span');
                span.classList.add('floating-symbol');
                span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                span.style.top = `${Math.random() * 100}%`;
                span.style.left = `${Math.random() * 100}%`;
                span.style.fontSize = `${Math.random() * 16 + 10}px`;
                span.style.opacity = Math.random() * 0.6 + 0.2;
                container.appendChild(span);
            }
        });
    }

    function setupParallax() {
        const parallaxLayers = {
            '.hero-blob': 25,
            '.hero-graphic': 50,
            '.floating-symbol': 80
        };
        window.addEventListener('mousemove', (e) => {
            let x = (e.clientX / window.innerWidth) - 0.5;
            let y = (e.clientY / window.innerHeight) - 0.5;
            for (const layer in parallaxLayers) {
                if (document.querySelector(layer)) {
                    const speed = parallaxLayers[layer];
                    gsap.to(layer, { x: x * speed, y: y * speed, duration: 1, ease: 'power2.out' });
                }
            }
        });
    }

    function setupInteractiveText(scope = document) {
        scope.querySelectorAll(".interactive-text").forEach(element => {
            if (element.classList.contains('js-processed')) return;
            element.classList.add('js-processed');
            const lines = element.querySelectorAll('.line');
            if (lines.length > 0) {
                lines.forEach(line => {
                    const originalText = line.textContent.trim();
                    line.innerHTML = originalText.split("").map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join("");
                });
            } else {
                const originalText = element.textContent.trim();
                element.innerHTML = originalText.split("").map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join("");
            }
            gsap.utils.toArray(element.querySelectorAll('.char')).forEach(char => {
                char.addEventListener('mouseenter', () => gsap.to(char, { y: -5, scale: 1.2, duration: 0.3, ease: 'power3.out' }));
                char.addEventListener('mouseleave', () => gsap.to(char, { y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }));
            });
        });
    }

    function setupKineticProjects() {
        document.querySelectorAll('.project-item').forEach(item => {
            const title = item.querySelector('.project-title');
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(title, { duration: 1, x: x * 0.05, y: y * 0.05, ease: 'power3.out' });
            });
            item.addEventListener('mouseleave', () => {
                gsap.to(title, { duration: 0.5, x: 0, y: 0, ease: 'elastic.out(1, 0.5)' });
            });
        });
    }

    async function fetchGitHubRepos() {
        const GITHUB_USERNAME = "kuberbassi";
        const projectList = document.querySelector('.project-list');
        const viewAllContainer = document.getElementById('view-all-container');
        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
            if (!response.ok) throw new Error('Network response was not ok');
            const repos = await response.json();
            const sortedRepos = repos.filter(repo => !repo.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
            const topRepos = sortedRepos.slice(0, 4);
            projectList.innerHTML = '';
            topRepos.forEach((repo, index) => {
                const titleHTML = repo.name.replace(/[-_]/g, ' ').split(' ').map(word => `<span>${word}</span>`).join(' ');
                const projectItem = `<a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-item">
                        <div class="project-number">0${index + 1}</div>
                        <h3 class="project-title">${titleHTML}</h3>
                        <p class="project-description">${repo.description || 'A project on my GitHub.'}</p>
                        <div class="project-arrow">&rarr;</div>
                    </a>`;
                projectList.innerHTML += projectItem;
            });
            if (sortedRepos.length > 4) {
                viewAllContainer.innerHTML = `<a href="https://github.com/${GITHUB_USERNAME}?tab=repositories" target="_blank" rel="noopener noreferrer" class="view-all-button">View All Projects</a>`;
            }
            setupKineticProjects();
        } catch (error) {
            console.error("Fetch error:", error);
            projectList.innerHTML = `<p class="error-message">Could not fetch projects from GitHub.</p>`;
        }
    }

    function setupHeaderInversion() {
        const mainHeader = document.querySelector('.main-header');
        if (!mainHeader) return;
        const darkSections = gsap.utils.toArray('.bg-dark');
        const headerHeight = mainHeader.offsetHeight;
        darkSections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: `top ${headerHeight}px`,
                end: `bottom ${headerHeight}px`,
                onEnter: () => mainHeader.classList.add('header-is-inverted'),
                onLeave: () => mainHeader.classList.remove('header-is-inverted'),
                onEnterBack: () => mainHeader.classList.add('header-is-inverted'),
                onLeaveBack: () => mainHeader.classList.remove('header-is-inverted')
            });
        });
    }

    function setupInteractiveImage() {
        const imageContainer = document.querySelector('.floating-image-container');
        if (!imageContainer) return;
        imageContainer.addEventListener('mousemove', (e) => {
            const rect = imageContainer.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(imageContainer, { duration: 0.8, rotationX: -y / 20, rotationY: x / 20, ease: 'power2.out' });
        });
        imageContainer.addEventListener('mouseleave', () => {
            gsap.to(imageContainer, { duration: 1, rotationX: 0, rotationY: 0, ease: 'elastic.out(1, 0.5)' });
        });
    }

    function setupScrollBasedAnimations() {
        const progressBar = document.getElementById('scroll-progress-bar');
        if (progressBar) {
            window.addEventListener('scroll', () => {
                const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
                progressBar.style.width = scrollHeight > clientHeight ? `${(scrollTop / (scrollHeight - clientHeight)) * 100}%` : '0%';
            });
        }
        gsap.utils.toArray('.reveal-fade-up').forEach(el => {
            gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 90%' }, y: 50, opacity: 0, duration: 1, ease: 'power3.out' });
        });
        gsap.utils.toArray('.bg-graphic:not(.hero-graphic)').forEach(el => {
            gsap.to(el, {
                scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 },
                opacity: el.classList.contains('contact-graphic-pulse') ? 0.25 : 1,
                y: (i, target) => (target.parentElement.offsetHeight * 0.1) * (Math.random() - 0.5)
            });
        });
    }

    function setupAdvancedAnimations() {
        if (document.querySelector('.works-graphic-line.line-v')) {
            gsap.from('.works-graphic-line.line-v', {
                scrollTrigger: { trigger: '#works', start: 'top 80%', end: 'bottom top', scrub: 1 },
                scaleY: 0, transformOrigin: 'top'
            });
        }
        if (document.querySelector('.works-graphic-line.line-h')) {
            gsap.from('.works-graphic-line.line-h', {
                scrollTrigger: { trigger: '#works', start: 'top 80%', end: 'bottom top', scrub: 1 },
                scaleX: 0, transformOrigin: 'left'
            });
        }
        if (document.querySelector('.contact-graphic-blob')) {
            gsap.to('.contact-graphic-blob', {
                duration: 20, x: 'random(-50, 50)', y: 'random(-50, 50)', rotation: 'random(-45, 45)',
                repeat: -1, yoyo: true, ease: 'none'
            });
        }
        if (document.querySelector('.floating-symbol')) {
            gsap.utils.toArray('.floating-symbol').forEach(symbol => {
                gsap.to(symbol, {
                    x: `random(-20, 20)`, y: `random(-20, 20)`, duration: `random(10, 20)`,
                    repeat: -1, yoyo: true, ease: 'sine.inOut'
                });
            });
        }
    }

    function setupCustomCursor() {
        const cursorOutline = document.querySelector('.cursor-outline');
        const cursorDot = document.querySelector('.cursor-dot');
        if (!cursorOutline || !cursorDot) return;
        // Only run on non-touch devices
        if (window.matchMedia("(pointer: fine)").matches) {
            gsap.set([cursorOutline, cursorDot], { xPercent: -50, yPercent: -50 });
            window.addEventListener('mousemove', e => {
                gsap.to(cursorDot, { duration: 0.2, x: e.clientX, y: e.clientY });
                gsap.to(cursorOutline, { duration: 0.7, x: e.clientX, y: e.clientY, ease: 'power2.out' });
            });
            document.querySelectorAll('a, button, .skill-tag').forEach(el => {
                el.addEventListener('mouseenter', () => gsap.to(cursorOutline, { scale: 1.8, duration: 0.3 }));
                el.addEventListener('mouseleave', () => gsap.to(cursorOutline, { scale: 1, duration: 0.3 }));
            });
        } else {
            // Hide custom cursor on touch devices
            cursorOutline.style.display = 'none';
            cursorDot.style.display = 'none';
        }
    }
});