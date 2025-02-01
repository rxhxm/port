// import { fetchJSON, renderProjects } from '../global.js';

// const projects = await fetchJSON('../lib/projects.json');
// // const projects = await fetchJSON('../lib/projects.json');

// const projectsContainer = document.querySelector('.projects');

// renderProjects(projects, projectsContainer, 'h2');




// document.addEventListener('DOMContentLoaded', async () => {
//     const projectsContainer = document.querySelector('.projects');
//     const projectsTitle = document.querySelector('.projects-title');
    
//     try {xq
//         const projects = await fetchJSON('../lib/projects.json');
        
//         // Update the project count
//         projectsTitle.textContent = `My Projects (${projects.length})`;
        
//         projects.forEach(project => {
//             renderProjects(project, projectsContainer, 'h2');
//         });
//     } catch (error) {
//         console.error('Error loading projects:', error);
//     }
// });


import { fetchJSON, renderProjects } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');

    try {
        const projects = await fetchJSON('../lib/projects.json');

        // Update the project count
        if (projectsTitle) {
            projectsTitle.textContent = `My Projects (${projects.length})`;
        }

        // Render all projects at once
        renderProjects(projects, projectsContainer, 'h2');

    } catch (error) {
        console.error('Error loading projects:', error);
    }
});
