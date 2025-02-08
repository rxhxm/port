import { fetchJSON, renderProjects, fetchGithubData } from './global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Global variables
let currentQuery = '';
let selectedIndex = -1;   // -1 means no pie slice is selected
let projectsData = [];    // this should hold your fetched projects

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Select the DOM elements needed: projects container and search input.
    const projectsContainer = document.querySelector('.projects');
    const searchInput = document.querySelector('.searchBar');

    // 2. Fetch all project data.
    projectsData = await fetchJSON('../lib/projects.json');

    // Debug: log fetched data
    console.log("Loaded projectsData:", projectsData);

    // 3. Function to render projects in the container.
    function renderProjectsList(filteredProjects) {
        projectsContainer.innerHTML = '';
        filteredProjects.forEach(project => {
            const article = document.createElement('article');
            article.innerHTML = `
                <h2>${project.title}</h2>
                <img src="${project.image}" alt="${project.title}">
                <p>${project.description}</p>
            `;
            projectsContainer.appendChild(article);
        });
    }

    // 4. Refactored pie chart rendering function.
    //
    // Note:
    // • We always use the full projectsData for the pie chart so that
    //   all wedges (for all years) always appear.
    // • When a wedge is clicked, we filter the projects list but re-render
    //   the pie chart with projectsData.
    function renderPieChart() {
        // Select the SVG and legend containers.
        const svg = d3.select('#projects-pie-plot');
        const legend = d3.select('.legend');

        // Clear existing SVG paths and legend items.
        svg.selectAll('path').remove();
        legend.selectAll('li').remove();

        // Group projects (the full list) by year.
        const rolledData = d3.rollups(
            projectsData,
            v => v.length,
            d => d.year
        );

        // Convert the grouped data into objects { value: count, label: year }
        const fullData = rolledData.map(([year, count]) => ({ value: count, label: year }));

        // If no projects are visible, stop rendering.
        if (fullData.length === 0) return;

        // Create a pie slice generator.
        const pieGenerator = d3.pie().value(d => d.value);
        const arcData = pieGenerator(fullData);

        // Create an arc generator.
        const arcGenerator = d3.arc()
            .innerRadius(0)
            .outerRadius(50);

        // Create a color scale for mapping labels to colors.
        const colorScale = d3.scaleOrdinal()
            .domain(fullData.map(d => d.label))
            .range(d3.schemeCategory10);

        // Append the arc paths to the SVG with click events.
        arcData.forEach((d, i) => {
            svg.append('path')
                .attr('d', arcGenerator(d))
                .attr('fill', colorScale(fullData[i].label))
                .attr('stroke', 'none')
                .style('cursor', 'pointer')
                .attr('class', i === selectedIndex ? 'selected' : '')
                .on('click', () => {
                    // Toggle the selection.
                    selectedIndex = selectedIndex === i ? -1 : i;

                    // Update highlighting for all wedges and legend items.
                    svg.selectAll('path')
                        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');
                    legend.selectAll('li')
                        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

                    if (selectedIndex === -1) {
                        // No wedge selected: show all projects.
                        renderProjectsList(projectsData);
                    } else {
                        // Filter projects using the selected wedge's year.
                        const selectedYear = fullData[selectedIndex].label;
                        const filteredProjects = projectsData.filter(
                            project => project.year === selectedYear
                        );
                        renderProjectsList(filteredProjects);
                    }
                    // Always re-render the pie chart with the full data.
                    renderPieChart();
                });
        });

        // Append legend items with click events.
        fullData.forEach((d, i) => {
            legend.append('li')
                .attr('style', `--color: ${colorScale(d.label)}`)
                .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
                .style('cursor', 'pointer')
                .attr('class', i === selectedIndex ? 'selected' : '')
                .on('click', () => {
                    // Toggle selection for the legend similarly.
                    selectedIndex = selectedIndex === i ? -1 : i;

                    svg.selectAll('path')
                        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');
                    legend.selectAll('li')
                        .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

                    if (selectedIndex === -1) {
                        renderProjectsList(projectsData);
                    } else {
                        const selectedYear = fullData[selectedIndex].label;
                        const filteredProjects = projectsData.filter(
                            project => project.year === selectedYear
                        );
                        renderProjectsList(filteredProjects);
                    }
                    // Always re-render the pie chart with the full data.
                    renderPieChart();
                });
        });
    }

    // 5. Initial rendering of all projects and the full pie chart.
    renderProjectsList(projectsData);
    renderPieChart();

    // 6. Listen for input events on the search field.
    // When searching, clear any wedge selection and filter projects.
    // (Here we leave the pie chart based on the full projectsData to keep our filtering UI consistent.)
    searchInput.addEventListener('input', (event) => {
        currentQuery = event.target.value.toLowerCase();
       
        // Reset the pie slice selection when typing.
        selectedIndex = -1;
  
        // First, apply the search query filter.
        let filteredProjects = projectsData.filter(project => {
            const values = Object.values(project).join('\n').toLowerCase();
            return values.includes(currentQuery);
        });
  
        // Render the projects (currently filtered only by search)
        renderProjectsList(filteredProjects);
  
        // Optionally, you may also want to update the pie chart
        // to reflect the search filtering. If so, call renderPieChart() here.
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
