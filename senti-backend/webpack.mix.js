const mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js')
   .react() // Add this line to enable React support
   .sass('resources/sass/app.scss', 'public/css')
   .sourceMaps(); // Optional: for generating source maps

if (mix.inProduction()) {
    mix.version(); // Optional: versioning files for cache busting in production
}
