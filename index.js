import { fetchJSON, renderProjects, fetchGithubData } from './global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Select the DOM elements needed: projects container and search input.
    const projectsContainer = document.querySelector('.projects');
    const searchInput = document.querySelector('.searchBar');

    // 2. Fetch all project data.
    const projectsData = await fetchJSON('../lib/projects.json');

    // Global variable for tracking the selected wedge.
    let selectedIndex = -1;

    // Debug: log fetched data
    console.log("Loaded projectsData:", projectsData);

    // 3. Function to render projects in the container.
    function renderProjectsList(projects) {
        projectsContainer.innerHTML = '';
        projects.forEach(project => {
            const article = document.createElement('article');
            article.innerHTML = `
                <h2>${project.title}</h2>
                <img src="${project.image}" alt="${project.title}">
                <p>${project.description}</p>
            `;
            projectsContainer.appendChild(article);
        });
    }

    // 4. Refactored pie chart rendering function including toggle (click to filter or reset) behavior.
    function renderPieChart(projectsGiven) {
        // Select the SVG and legend containers.
        const svg = d3.select('#projects-pie-plot');
        const legend = d3.select('.legend');

        // Clear existing SVG paths and legend items.
        svg.selectAll('path').remove();
        legend.selectAll('li').remove();

        // Group projects by year using d3.rollups().
        const newRolledData = d3.rollups(
            projectsGiven,
            (v) => v.length,
            (d) => d.year
        );

        // Convert the grouped data into objects { value: count, label: year }
        const newData = newRolledData.map(([year, count]) => ({ value: count, label: year }));

        // If no projects are visible, stop the rendering.
        if (newData.length === 0) return;

        // Create a pie slice generator using the new data.
        const newSliceGenerator = d3.pie().value(d => d.value);
        const newArcData = newSliceGenerator(newData);

        // Create an arc generator for drawing slices.
        const newArcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(50);

        // Create a color scale for mapping labels to colors.
        const colorScale = d3.scaleOrdinal()
            .domain(newData.map(d => d.label))
            .range(d3.schemeCategory10);

        // Append the arc paths to the SVG with click events.
        newArcData.forEach((d, i) => {
            svg.append('path')
                .attr('d', newArcGenerator(d))
                .attr('fill', colorScale(newData[i].label))
                .attr('stroke', 'none')
                .style('cursor', 'pointer')
                .on('click', () => {
                    // Toggle selection: if already selected, deselect; otherwise select.
                    selectedIndex = selectedIndex === i ? -1 : i;
                    
                    // Update highlighting on all wedges based on the new selectedIndex.
                    svg.selectAll('path')
                        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');
                    // Also update the legend's highlighting.
                    legend.selectAll('li')
                        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

                    // Filter the projects from the original data.
                    if (selectedIndex === -1) {
                        // No wedge is selected—show all projects.
                        renderProjectsList(projectsData);
                    } else {
                        // Filter projects by the selected year.
                        const selectedYear = newData[i].label;
                        const filteredByYear = projectsData.filter(
                          project => project.year === selectedYear
                        );
                        renderProjectsList(filteredByYear);
                    }
                });
        });

        // Append legend items with click events.
        newData.forEach((d, i) => {
            legend.append('li')
                .attr('style', `--color: ${colorScale(d.label)}`)
                .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
                .style('cursor', 'pointer')
                .on('click', () => {
                    selectedIndex = selectedIndex === i ? -1 : i;
                    svg.selectAll('path')
                        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');
                    legend.selectAll('li')
                        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');
                    
                    if (selectedIndex === -1) {
                        renderProjectsList(projectsData);
                    } else {
                        const selectedYear = newData[i].label;
                        const filteredByYear = projectsData.filter(
                          project => project.year === selectedYear
                        );
                        renderProjectsList(filteredByYear);
                    }
                });
        });
    }

    // 5. Initial rendering of all projects.
    renderProjectsList(projectsData);
    renderPieChart(projectsData);

    // 6. Listen for input events on the search field.
    searchInput.addEventListener('input', (event) => {
        // Clear any active wedge selection.
        selectedIndex = -1;
        const query = event.target.value;
        console.log("Search query:", query);
      
        // Filter projects based on search query.
        const filteredProjects = projectsData.filter(project => {
          const values = Object.values(project).join('\n').toLowerCase();
          return values.includes(query.toLowerCase());
        });
      
        console.log("Filtered projects count:", filteredProjects.length);
      
        renderProjectsList(filteredProjects);
        renderPieChart(filteredProjects);
    });

    // 7. Load GitHub Stats if the element exists.
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
