// generate-sitemap.js
const SitemapGenerator = require('sitemap-generator');
const fs = require('fs');

// Set the base URL of your deployed site
const BASE_URL = 'https://rayyanshaikh123.github.io/schedulingAlgo/';

// Create a generator
const generator = SitemapGenerator(BASE_URL, {
  stripQuerystring: false,
});

// Event listeners
generator.on('done', () => {
  console.log('Sitemap generation complete');
});

// Error handling
generator.on('error', (error) => {
  console.log('Error:', error);
});

// Start the generator
generator.start();

