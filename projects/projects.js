
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { fetchJSON } from '../global.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Select the SVG element where the pie chart will be drawn.
  const svg = d3.select('#projects-pie-plot');

  // 2. Fetch your project data (from projects.json).
  const projects = await fetchJSON('../lib/projects.json');

  // 3. Group projects by year using d3.rollups().
  //    This returns an array of arrays in the form: [ [year, count], ... ]
  const rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year
  );
  
  // 4. Convert the rolled data into the data format we need for the pie chart.
  //    Each element now is an object: { value: count, label: year }
  const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  // 5. Use d3.pie() configured with a value accessor to calculate arc angles.
  const sliceGenerator = d3.pie().value(d => d.value);
  const arcData = sliceGenerator(data);

  // 6. Create an arc generator for drawing each slice.
  const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  // 7. Create a color scale that maps each year (label) to a color.
  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.label))
    .range(d3.schemeCategory10);

  // 8. Append the arcs (slices) to the SVG.
  arcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colorScale(data[i].label))
      .attr('stroke', 'none');
  });

  // --- Create the legend using the created data and color scale ---
  const legend = d3.select('.legend');

  data.forEach((d) => {
      legend.append('li')
            .attr('style', `--color: ${colorScale(d.label)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
});


