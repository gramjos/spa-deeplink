import os
import json
import argparse
from pathlib import Path

def create_slug(path, root):
    """Generates a URL-friendly slug relative to the vault root."""
    rel_path = os.path.relpath(path, root)
    if rel_path == ".":
        return "root"
    # Convert OS path separators to URL slashes
    return rel_path.replace(os.sep, "/")

def get_content_path(path, root):
    """Generates the absolute web path to the HTML chunk."""
    rel_path = os.path.relpath(path, root)
    # Ensure it starts with / for web serving
    return "/" + rel_path.replace(os.sep, "/")

def process_directory(current_path, root_path):
    """
    Recursively builds the manifest node for a directory.
    Returns None if the directory is invalid (missing README).
    """
    dir_name = os.path.basename(current_path)
    
    # RULE 2: The graphics directory exception.
    # Skip 'graphics' directory entirely.
    if dir_name == "graphics":
        return None

    # Check for README.md to validate directory
    # (We check .md for the 'Signal', but serve the .html)
    readme_md = os.path.join(current_path, "README.md")
    readme_html = os.path.join(current_path, "README.html")

    # RULE 1: The README signal.
    # If no README.md exists, this directory is not a valid node.
    if not os.path.exists(readme_md):
        # Exception: If we are at the very root, we might assume validity, 
        # but the rule is strict.
        return None

    # Build the Directory Node (Blue Node)
    node = {
        "type": "directory",
        "title": dir_name if current_path != root_path else "Home",
        "slug": create_slug(current_path, root_path),
        # Point to the compiled HTML version of the README
        "content_path": get_content_path(readme_html, root_path),
        "children": []
    }

    # Iterate over items in the directory
    # Sort to ensure consistent order in JSON
    for item in sorted(os.listdir(current_path)):
        item_path = os.path.join(current_path, item)

        # Ignore hidden files
        if item.startswith("."):
            continue

        if os.path.isdir(item_path):
            # Recurse into subdirectories
            child_node = process_directory(item_path, root_path)
            if child_node:
                node["children"].append(child_node)
        
        elif os.path.isfile(item_path):
            # Process Files (Red Nodes)
            # We only list .html files that are NOT the README
            if item.endswith(".html") and item != "README.html":
                # Derive the markdown source name (assuming strict naming parity)
                title = os.path.splitext(item)[0]
                
                file_node = {
                    "type": "file",
                    "title": title,
                    "slug": create_slug(os.path.join(current_path, title), root_path),
                    "content_path": get_content_path(item_path, root_path)
                }
                node["children"].append(file_node)

    return node

def main():
    parser = argparse.ArgumentParser(description="Generate SPA Manifest JSON.")
    parser.add_argument("path", help="Path to the ready-to-serve vault directory")
    args = parser.parse_args()

    root_path = os.path.abspath(args.path)

    if not os.path.exists(root_path):
        print(f"Error: Path '{root_path}' does not exist.")
        return

    # Start recursion from the root
    root_node = process_directory(root_path, root_path)

    if root_node:
        # Wrap in the strict schema structure
        manifest = {
            "root": root_node
        }
        print(json.dumps(manifest, indent=2))
    else:
        print("Error: Root directory missing README.md or is invalid.")

if __name__ == "__main__":
    main()
