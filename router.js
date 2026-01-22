// Router class for SPA navigation

import { staticPages } from './config.js';
import { routes } from './manifest.js';
import { fetchContent, processContentLinks } from './content.js';
import { buildBreadcrumbs, buildFilesAndDirs } from './ui.js';

export class Router {
  constructor() {
    this.appElement = document.getElementById('app');
    this.navElement = document.getElementById('main-nav');
    
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
  }
  
  // Build fixed nav: Home, About, Notes
  buildNav() {
    this.navElement.innerHTML = `
      <a href="/" data-link>Home</a>
      <a href="/about" data-link>About</a>
      <a href="/notes" data-link>Notes</a>
    `;
  }
  
  navigate(path) {
    if (path !== location.pathname) {
      history.pushState(null, null, path);
      this.render();
    }
  }
  
  async render() {
    const path = location.pathname;
    
    // Check for static pages first (Home, About)
    if (staticPages[path]) {
      const page = staticPages[path];
      document.title = `${page.title} | Vault`;
      this.appElement.innerHTML = `
        <article class="content">
          ${page.content}
        </article>
      `;
      this.updateActiveNav(path);
      return;
    }
    
    // Check for vault routes (/notes/...)
    const node = routes[path];
    
    if (!node) {
      this.renderNotFound();
      return;
    }
    
    // Update page title
    document.title = `${node.title} | Vault`;
    
    // Fetch the HTML content
    const content = await fetchContent(node.content_path);
    
    // Build the page based on wireframe layout
    const breadcrumbs = buildBreadcrumbs(path);
    const filesDirs = node.type === 'directory' ? buildFilesAndDirs(node) : '';
    
    this.appElement.innerHTML = `
      ${breadcrumbs}
      ${filesDirs}
      <article class="content">
        ${content}
      </article>
    `;
    
    // Fix internal links in content
    processContentLinks(path);
    
    // Update active nav link
    this.updateActiveNav(path);
  }
  
  updateActiveNav(path) {
    document.querySelectorAll('#main-nav a').forEach(link => {
      const href = link.getAttribute('href');
      let isActive = false;
      if (href === '/') {
        isActive = path === '/';
      } else if (href === '/notes') {
        isActive = path.startsWith('/notes');
      } else {
        isActive = path === href;
      }
      link.classList.toggle('active', isActive);
    });
  }
  
  renderNotFound() {
    document.title = '404 | Vault';
    this.appElement.innerHTML = `
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p><a href="/" data-link>← Back to Home</a></p>
      <div class="path-info">Requested: ${location.pathname}</div>
    `;
  }
}
