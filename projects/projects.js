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


// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// let arc = d3.arc().innerRadius(0).outerRadius(50)({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
//   });

// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');







// let data = [1, 2];

// let total = 0;

// for (let d of data) {
//   total += d;
// }

// let angle = 0;
// let arcData = [];

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }


// let arcs = arcData.map((d) => arcGenerator(d));


// arcs.forEach((arc, i) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', i === 0 ? 'red' : 'blue');  // Red for the first slice, blue for the second
//   });



import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

document.addEventListener('DOMContentLoaded', () => {
  // Select the SVG element where the pie chart will be drawn.
  const svg = d3.select('#projects-pie-plot');

  // Define the new data array with both values and labels.
  const data = [
      { value: 1, label: 'apples' },
      { value: 2, label: 'oranges' },
      { value: 3, label: 'mangos' },
      { value: 4, label: 'pears' },
      { value: 5, label: 'limes' },
      { value: 5, label: 'cherries' },
  ];

  // Use d3.pie() configured with a value accessor to convert the data.
  const sliceGenerator = d3.pie().value(d => d.value);
  const arcData = sliceGenerator(data);

  // Create an arc generator that will be used to draw each slice.
  const arcGenerator = d3.arc()
      .innerRadius(0)
      .outerRadius(50);

  // Create a color scale that maps labels to colors.
  const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(d3.schemeCategory10);

  // Append the arcs (slices) to the SVG.
  arcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colorScale(data[i].label))
      .attr('stroke', 'none');
  });

  // *** NEW CODE: Create the legend ***
  // Select the <ul> element with class "legend"
  const legend = d3.select('.legend');
  
  // For each data element, create an <li> element.
  data.forEach((d) => {
      legend.append('li')
            .attr('style', `--color: ${colorScale(d.label)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
});



let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('class', 'legend-item') // (optional) add a class if you want to target specific items
          .attr('style', `--color: ${colorScale(d.label)}`) 
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});