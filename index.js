import { fetchJSON, renderProjects, fetchGithubData } from './global.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Load Latest Projects
    const projectsContainer = document.querySelector('.projects');
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
    
    renderProjects(latestProjects, projectsContainer, 'h2');

    // Load GitHub Stats
    const profileStats = document.querySelector('#profile-stats');
    if (profileStats) {
        try {
            const githubData = await fetchGithubData('rxhxm');

            profileStats.innerHTML = `
                <dl>
                    <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                    <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
                    <dt>Followers:</dt><dd>${githubData.followers}</dd>
                    <dt>Following:</dt><dd>${githubData.following}</dd>
                </dl>
            `;
        } catch (error) {
            console.error('Error fetching GitHub data:', error);
        }
    }
});
