#!/usr/bin/env bash

# Create the cache directory if it doesn't exist
mkdir -p /opt/render/.cache/puppeteer

# Install Chromium into Puppeteer cache
echo "Installing Chromium for Puppeteer..."
npx puppeteer browsers install chrome
