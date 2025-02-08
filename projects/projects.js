import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON, applyFilters } from '../global.js';

// Access global filtering variables from index.js if they are in the same scope.
// Otherwise, you may need to import/export them between modules.

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Select the SVG element where the pie chart will be drawn.
  const svg = d3.select('#projects-pie-plot');

  // 2. Fetch your project data
  const projects = await fetchJSON('../lib/projects.json');
  window.projectsData = projects; // Make projectsData global if needed

  // 3. Group projects by year and prepare the pie chart data.
  const rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year
  );
  
  const data = rolledData.map(([year, count]) => ({ value: count, label: year }));
  // Save the pie data globally so that applyFilters() can reference it.
  window.projectsPieData = data;

  // 4. Generate the arc angles.
  const sliceGenerator = d3.pie().value(d => d.value);
  const arcData = sliceGenerator(data);

  // 5. Create an arc generator.
  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  // 6. Create a color scale.
  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.label))
    .range(d3.schemeCategory10);

  // 7. Append arcs and add click events.
  arcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colorScale(data[i].label))
      .attr('stroke', 'none')
      .attr('cursor', 'pointer')
      .on('click', () => {
        // Toggle the pie slice selection.
        window.selectedIndex = window.selectedIndex === i ? -1 : i;
        // Invoke the unified filter function.
        applyFilters();
      });
  });

  // --- Create the legend using the data and color scale ---
  const legend = d3.select('.legend');
  data.forEach((d) => {
    legend.append('li')
          .attr('style', `--color: ${colorScale(d.label)}`)
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
});


