document.addEventListener('DOMContentLoaded', () => {
    // Replace with your GitHub username
    const githubUsername = "kuberbassi";

    // This is the URL of the serverless function you will create later
    // For now, we will use the public GitHub API URL for testing
    const apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=6`;

    const projectsGrid = document.getElementById('projects-grid');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(repos => {
            // Clear the loading text
            projectsGrid.innerHTML = '';

            repos.forEach(repo => {
                // Skip forked repos if you want
                if (repo.fork) {
                    return;
                }

                const card = document.createElement('div');
                card.classList.add('project-card');

                card.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description provided.'}</p>
                    <div class="project-footer">
                        <div class="project-stats">
                            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                        </div>
                        <div class="project-links">
                            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub</a>
                        </div>
                    </div>
                `;
                projectsGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching GitHub repos:', error);
            projectsGrid.innerHTML = '<p class="loading-text">Failed to load projects. Please try again later.</p>';
        });
});

// In animations.js
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add this to animations.js

const glow = document.querySelector('.mouse-glow');

window.addEventListener('mousemove', (e) => {
    // We use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Replace with your GitHub username
    const githubUsername = "kuberbassi"; 
    
    const projectImages = {
        "Attendance-Tracker": "images/project-attendance.jpg", // Example
        "kuber-bassi-portfolio": "/projects/images/portfolio-proj.png", // Example
        // Add all the projects you want to display here
    };

    const apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=9`;
    const projectsContainer = document.getElementById('projects-container');

    fetch(apiUrl)
        .then(response => response.json())
        .then(repos => {
            projectsContainer.innerHTML = ''; // Clear the loading text

            repos.forEach(repo => {
                // Filter to hide forks, projects without images, and the portfolio itself
                if (repo.fork || !projectImages[repo.name] || repo.name === 'kuber-bassi-portfolio') {
                    return; 
                }

                const projectItem = document.createElement('div');
                projectItem.classList.add('project-item');
                
                const tagsHTML = repo.topics.map(topic => `<span class="project-tag">${topic}</span>`).join('');

                projectItem.innerHTML = `
                    <div class="project-card">
                        <img src="${projectImages[repo.name]}" alt="${repo.name}">
                        <a href="${repo.html_url}" class="project-info-overlay" target="_blank" rel="noopener noreferrer">
                            <div class="project-text">
                                <h3 class="project-title">${repo.name}</h3>
                                <div class="project-tags">
                                    ${tagsHTML}
                                </div>
                            </div>
                        </a>
                    </div>
                `;
                projectsContainer.appendChild(projectItem);
            });
        })
        .catch(error => {
            console.error('Error fetching GitHub repos:', error);
            projectsContainer.innerHTML = '<p class="loading-text">Failed to load projects.</p>';
        });
});