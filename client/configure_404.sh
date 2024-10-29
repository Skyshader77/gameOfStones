#!/bin/bash

# Script to configure 404 page for GitLab Pages
# Usage: ./configure_404.sh [path_to_public_dir]

# Default public directory
PUBLIC_DIR=${1:-"public"}

# Check if public directory exists
if [ ! -d "$PUBLIC_DIR" ]; then
    echo "Error: Directory '$PUBLIC_DIR' not found"
    echo "Please provide the correct path to your public directory"
    exit 1
fi

# Check if index.html exists
if [ ! -f "$PUBLIC_DIR/index.html" ]; then
    echo "Error: index.html not found in '$PUBLIC_DIR'"
    exit 1
fi

# Copy index.html to 404.html
cp "$PUBLIC_DIR/index.html" "$PUBLIC_DIR/404.html"

# Verify the copy was successful
if [ $? -eq 0 ]; then
    echo "Successfully created 404.html from index.html"
    echo "Both files are now in '$PUBLIC_DIR'"
else
    echo "Error: Failed to copy index.html to 404.html"
    exit 1
fi

# Display file sizes to confirm
echo -e "\nFile sizes:"
ls -lh "$PUBLIC_DIR/index.html" "$PUBLIC_DIR/404.html"