console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let navLinks = $$("nav a");

let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

currentLink?.classList.add('current');



let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'cv/', title: 'CV' },
    { url: 'https://github.com/rxhxm', title: 'GitHub' }
  ];




  let nav = document.createElement('nav');
  document.body.prepend(nav);
  
  const ARE_WE_HOME = document.documentElement.classList.contains('home');
  
  for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    // Adjust URL for non-home pages
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    // Create link element
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
  
    // Highlight current page
    a.classList.toggle(
      'current',
      a.host === location.host && a.pathname === location.pathname
    );
  
    // Open external links in a new tab
    a.toggleAttribute('target', a.host !== location.host);
  
    // Append link to nav
    nav.append(a);
  }


// Insert the theme switcher HTML
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="theme-switch">
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );
  
  const themeSwitch = document.getElementById('theme-switch');
  
  // Function to set the color scheme
  function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    themeSwitch.value = colorScheme;
  }
  
  // Load saved preference
  if ("colorScheme" in localStorage) {
    setColorScheme(localStorage.colorScheme);
  }
  
  // Add an event listener to handle theme changes
  themeSwitch.addEventListener('change', (event) => {
    const selectedScheme = event.target.value;
    setColorScheme(selectedScheme);
    localStorage.colorScheme = selectedScheme;
  });
  
  // Update the "Automatic" option text
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const automaticOption = themeSwitch.querySelector('option[value="light dark"]');
  automaticOption.textContent = `Automatic (${isDarkMode ? 'Dark' : 'Light'})`;







  
  export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        // Parse the JSON data
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}





export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) {
    console.error('Invalid container element');
    return;
  }

  // Clear existing content
  containerElement.innerHTML = '';

  // Check if projects is an array
  if (Array.isArray(projects)) {
    projects.forEach(project => {
      // Create an article element for each project
      const article = document.createElement('article');
      
      // Populate the article with project details
      article.innerHTML = `
        <${headingLevel}>${project.title}</${headingLevel}>
        <img src="${project.image}" alt="${project.title}">
        <p>${project.description}</p>
      `;
      
      // Append the article to the container
      containerElement.appendChild(article);
    });
  } else {
    console.error('Projects must be an array');
  }
}






export async function fetchGithubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}

// export { fetchJSON, renderProjects, fetchGithubData };


// const githubData = await fetchGitHubData('rxhxm');

// const profileStats = document.querySelector('#profile-stats');


