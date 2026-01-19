// Simple SPA Router using History API

let routes = {};

// Load routes from JSON file
async function loadRoutes() {
  const response = await fetch('/routes.json');
  const data = await response.json();
  
  // Transform JSON data into route objects with render functions
  for (const [path, route] of Object.entries(data)) {
    routes[path] = {
      title: route.title,
      render: () => `
        <h1>${route.heading}</h1>
        ${route.content.map(p => `<p>${p}</p>`).join('')}
        <div class="path-info">Current path: ${location.pathname}</div>
      `
    };
  }
}

// Router class
class Router {
  constructor(routes) {
    this.routes = routes;
    this.appElement = document.getElementById('app');
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => this.render());
    
    // Handle link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
    
    // Initial render
    this.render();
  }
  
  navigate(path) {
    if (path !== location.pathname) {
      history.pushState(null, null, path);
      this.render();
    }
  }
  
  render() {
    const path = location.pathname;
    const route = this.routes[path] || this.notFound();
    
    // Update page title
    document.title = `${route.title} | SPA Demo`;
    
    // Render content
    this.appElement.innerHTML = route.render();
    
    // Update active nav link
    document.querySelectorAll('nav a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === path);
    });
  }
  
  notFound() {
    return {
      title: '404',
      render: () => `
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <div class="path-info">Requested path: ${location.pathname}</div>
      `
    };
  }
}

// Initialize router
async function init() {
  await loadRoutes();
  const router = new Router(routes);
}

init();
