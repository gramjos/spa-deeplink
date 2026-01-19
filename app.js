// Simple SPA Router using History API

const routes = {
  '/': {
    title: 'Home',
    render: () => `
      <h1>🏠 Home Page</h1>
      <p>Welcome to the SPA Deep Link Demo!</p>
      <p>This is a minimal single-page application that supports deep linking using the History API and the 404 redirect hack.</p>
      <div class="path-info">Current path: ${location.pathname}</div>
    `
  },
  '/about': {
    title: 'About',
    render: () => `
      <h1>ℹ️ About Page</h1>
      <p>This page demonstrates client-side routing.</p>
      <p>Try refreshing this page or copying the URL to a new tab - deep linking works!</p>
      <div class="path-info">Current path: ${location.pathname}</div>
    `
  },
  '/contact': {
    title: 'Contact',
    render: () => `
      <h1>📧 Contact Page</h1>
      <p>Get in touch with us!</p>
      <p>This route is handled entirely on the client side.</p>
      <div class="path-info">Current path: ${location.pathname}</div>
    `
  }
};

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
const router = new Router(routes);
