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