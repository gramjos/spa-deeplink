// SPA Entry Point
// Modules: config.js, manifest.js, content.js, ui.js, router.js

import { Router } from './router.js';
import { loadManifest } from './manifest.js';

// Initialize the SPA
async function init() {
  const router = new Router();
  
  // Show loading state
  router.appElement.innerHTML = '<p>Loading...</p>';
  
  // Load manifest and build routes
  await loadManifest();
  
  // Build navigation from manifest
  router.buildNav();
  
  // Render current route
  router.render();
}

init();
