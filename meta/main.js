// Declare global variables for data, commits, brush selection, and scales
let data;
let commits;
let selectedCommits = []; // New variable to replace brushSelection
let xScale, yScale; // Global scales for mapping commit data to chart coordinates
let commitProgress = 100;
let timeScale;
let filteredCommits;
let commitMaxTime;
let NUM_ITEMS; // Will be set to the length of commits
let ITEM_HEIGHT = 120; // Increased from 30 to accommodate narrative text
let VISIBLE_COUNT = 5; // Show 5 commits at a time
let totalHeight;
let visibleCommits = []; // Store currently visible commits

// Function to control the tooltip's visibility
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

// Function to position the tooltip near the mouse cursor
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top  = `${event.clientY}px`;
}

// Function to process commit data from 'data'
function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      const first = lines[0];
      const { author, date, time, timezone, datetime } = first;
      const ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        // Calculate the commit time as a fractional hour
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        // Total number of lines modified in this commit
        totalLines: lines.length,
      };

      // Attach the raw line data as a hidden property
      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: true,
        configurable: true,
        enumerable: false,
      });
      return ret;
    });

  // Create the time scale after commits are processed
  timeScale = d3.scaleTime()
    .domain([
      d3.min(commits, d => d.datetime),
      d3.max(commits, d => d.datetime)
    ])
    .range([0, 100]);
  
  // Initialize filtered commits
  filterCommitsByTime();
}
  
// Function to display statistics in a <dl> list
function displayStats() {
  // Process commits so that 'commits' is ready for stats display
  processCommits();

  // Create the <dl> element and assign a class for styling
  const dl = d3.select('#stats')
    .append('dl')
    .attr('class', 'stats');

  // Add total lines of code (LOC)
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total number of commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Example: Average line length
  const avgLineLength = d3.mean(data, (d) => d.length);
  dl.append('dt').text('Average line length');
  dl.append('dd').text(avgLineLength ? avgLineLength.toFixed(2) : 'N/A');

  // Example: Number of files in the codebase (if your data contains a 'file' property)
  const distinctFiles = d3.group(data, (d) => d.file).size;
  dl.append('dt').text('Distinct files');
  dl.append('dd').text(distinctFiles);
}
  
// Updated loadData function: loads the CSV and then displays stats
async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  // Display stats (which processes the commits in the process)
  displayStats();
}

// Function to update the tooltip content on hover
function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');

  // If commit is empty, clear the tooltip contents
  if (Object.keys(commit).length === 0) {
    link.href = '';
    link.textContent = '';
    date.textContent = '';
    return;
  }

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
}

// -------------------- BRUSHING AND SELECTION --------------------

// Updated isCommitSelected function that's much simpler
function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

// Update the visual state of dots based on brush selection
function updateSelection() {
  d3.selectAll('circle').classed('selected', d => isCommitSelected(d));
}

// Update the count of selected commits
function updateSelectionCount() {
  const selectedCommits = selectedCommits.length ? selectedCommits : [];
  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
  return selectedCommits;
}

// Update the language breakdown for the selected commits
function updateLanguageBreakdown() {
  const selectedCommits = selectedCommits.length ? selectedCommits : commits;
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  // Use selected commits if available; otherwise use all commits.
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  // Flatten the lines arrays from all commits
  const lines = requiredCommits.flatMap(d => d.lines);

  // Count lines per language using d3.rollup
  const breakdown = d3.rollup(
    lines,
    v => v.length,
    d => d.type
  );

  // Update DOM with line counts per language
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);
    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }

  return breakdown;
}

// Updated brushed function that updates selectedCommits directly
function brushed(event) {
  const brushSelection = event.selection;
  selectedCommits = !brushSelection
    ? []
    : commits.filter((commit) => {
        const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        const max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        const x = xScale(commit.datetime);
        const y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });
  
  // Update the visual state of dots based on selection
  d3.selectAll('circle').classed('selected', d => isCommitSelected(d));
  updateSelectionCount();
  updateLanguageBreakdown();
}

// Function to set up the brush on the SVG element
function brushSelector() {
  // Select the SVG element
  const svg = document.querySelector('svg');

  // Attach the brush behavior and listen for brush events (start, brush, and end)
  d3.select(svg).call(d3.brush().on('start brush end', brushed));

  // Move (raise) the dots and any following elements above the brush overlay
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

// -------------------- SCATTERPLOT WITH DOT SIZES --------------------

// Function to filter commits by time
function filterCommitsByTime() {
  commitMaxTime = timeScale.invert(commitProgress);
  filteredCommits = commits.filter(commit => commit.datetime <= commitMaxTime);
}

// Function to update the time display
function updateTimeDisplay() {
  // This is no longer needed but kept as a placeholder to avoid errors
  // if it's called elsewhere in the code
}

// Replace createScatterplot with updateScatterplot
function updateScatterplot(commits) {
  // Clear existing SVG
  d3.select('#chart svg').remove();
  
  // If no commits, don't try to draw the chart
  if (!commits || commits.length === 0) {
    return;
  }
  
  // Define overall dimensions for the scatterplot
  const width = 1000;
  const height = 600;

  // Create the SVG container inside the #chart <div>
  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // Define margins and calculate usable area
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Create global scales for the x and y axes so they can be used by brushing logic
  xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .nice()
    .range([usableArea.left, usableArea.right]);

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  // Add horizontal grid lines
  const gridlines = svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and long ticks
  gridlines.call(
    d3.axisLeft(yScale)
      .tickFormat('')
      .tickSize(-usableArea.width)
  );

  // Style gridlines based on the time of day: blue for night, orange for day
  gridlines.selectAll('.tick line')
    .attr('stroke', d => (d <= 6 || d >= 18) ? "#1E90FF" : "#FF8C00")
    .attr('stroke-opacity', 0.5);

  // Sort commits by totalLines in descending order so that larger dots are drawn first.
  const sortedCommits = d3.sort(commits, (a, b) => b.totalLines - a.totalLines);

  // Determine the range of total lines modified across commits
  const [minLines, maxLines] = d3.extent(commits, d => d.totalLines);

  // Create a square root scale for the radius so that circle area is proportional to totalLines
  const rScale = d3.scaleSqrt()
    .domain([minLines || 1, maxLines || 10]) // Avoid NaN by providing fallback values
    .range([2, 30]);

  // Draw the commit dots with tooltip interactions and size based on lines edited
  const dots = svg.append('g').attr('class', 'dots');
  dots.selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .style('--r', d => rScale(d.totalLines)) // Set CSS variable for transition
    .classed('selected', d => isCommitSelected(d))
    .on('mouseenter', function (event, d) {
      d3.select(this)
        .style('fill-opacity', 1)
        .classed('selected', isCommitSelected(d));
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', function (event, d) {
      d3.select(this)
        .style('fill-opacity', 0.7)
        .classed('selected', isCommitSelected(d));
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });

  // Add axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  // Re-attach the brush after re-creating the SVG
  brushSelector();
}
  
// -------------------- INITIALIZATION --------------------

// Function to render items in the scroll container
function renderItems(startIndex) {
  // Clear existing items
  d3.select('#items-container').selectAll('div').remove();
  
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  visibleCommits = commits.slice(startIndex, endIndex);
  
  // Update the scatterplot with visible commits
  updateScatterplot(visibleCommits);
  
  // Update the file visualization
  displayCommitFiles();
  
  // Create new items
  const items = d3.select('#items-container').selectAll('div')
    .data(visibleCommits)
    .enter()
    .append('div')
    .attr('class', 'item')
    .style('position', 'absolute')
    .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`)
    .style('width', '100%')
    .style('height', `${ITEM_HEIGHT}px`);
    
  // Add narrative content to each item
  items.html((d, i) => {
    const commitIndex = startIndex + i;
    return `
      <p>
        On ${d.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})}, I made
        <a href="${d.url}" target="_blank">
          ${commitIndex > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
        </a>. 
        I edited ${d.totalLines} lines across 
        ${d3.rollups(d.lines, D => D.length, d => d.file).length} files. 
        Then I looked over all I had made, and I saw that it was very good.
      </p>
    `;
  });
}

// Function to display file visualization based on visible commits
function displayCommitFiles() {
  const lines = visibleCommits.flatMap((d) => d.lines);
  const fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  
  let files = d3.groups(lines, (d) => d.file)
    .map(([name, lines]) => ({ name, lines }));
  
  files = d3.sort(files, (d) => -d.lines.length);
  
  d3.select('.files').selectAll('div').remove();
  
  const filesContainer = d3.select('.files')
    .selectAll('div')
    .data(files)
    .enter()
    .append('div');
  
  filesContainer.append('dt')
    .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);
  
  filesContainer.append('dd')
    .selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class', 'line')
    .style('background', d => fileTypeColors(d.type));
}

// Initialize scrollytelling after data is loaded
function initScrollytelling() {
  NUM_ITEMS = commits.length;
  totalHeight = NUM_ITEMS * ITEM_HEIGHT;
  
  // Set up the spacer height
  const spacer = d3.select('#spacer');
  spacer.style('height', `${totalHeight}px`);
  
  // Create the date indicator
  const dateIndicator = d3.select('#scroll-date-indicator');
  
  // Set up scroll event
  const scrollContainer = d3.select('#scroll-container');
  scrollContainer.on('scroll', () => {
    const scrollTop = scrollContainer.property('scrollTop');
    let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
    
    // Update the visible items
    renderItems(startIndex);
    
    // Update the date indicator position and text
    if (commits.length > 0) {
      const containerHeight = scrollContainer.node().clientHeight;
      const scrollRatio = scrollTop / (totalHeight - containerHeight);
      const scrollableHeight = scrollContainer.node().clientHeight - 30; // Adjust for indicator height
      
      // Calculate position based on scroll ratio
      const indicatorTop = scrollRatio * scrollableHeight;
      
      // Get the commit date that corresponds to the current scroll position
      const dateIndex = Math.floor(scrollRatio * commits.length);
      const clampedIndex = Math.max(0, Math.min(dateIndex, commits.length - 1));
      const currentDate = commits[clampedIndex].datetime;
      
      // Format the date
      const dateStr = currentDate.toLocaleDateString('en', {
        month: 'short',
        day: 'numeric', 
        year: 'numeric'
      });
      
      // Update the indicator
      dateIndicator
        .style('top', `${indicatorTop}px`)
        .text(dateStr);
    }
  });
  
  // Initial render
  renderItems(0);
}

// Update the DOM ContentLoaded handler
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initScrollytelling();
});