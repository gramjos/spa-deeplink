// Manifest loading and route flattening

export let manifest = null;  // The full manifest tree
export let routes = {};      // Flat lookup: { "/notes/nature/tundra": node }

// Flatten the nested manifest into a route lookup
// All vault routes are prefixed with /notes
function flattenManifest(node, parentSlug = '') {
  let urlPath;
  if (node.slug === 'root') {
    urlPath = '/notes';
  } else {
    urlPath = '/notes/' + node.slug;
  }
  
  // Add to routes lookup
  routes[urlPath] = node;
  
  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      flattenManifest(child, node.slug);
    }
  }
}

// Load manifest and build routes
export async function loadManifest() {
  const response = await fetch('/manifest.json');
  const data = await response.json();
  manifest = data.root;
  console.log('manifest:', manifest);
  console.log('routes BEFORE flattenManifest:', JSON.parse(JSON.stringify(routes)));
  flattenManifest(manifest);
  console.log('routes AFTER flattenManifest:', JSON.parse(JSON.stringify(routes)));
  console.log('routes keys:', Object.keys(routes));
}
