/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
    daisyui: {
        themes: ['light', 'dark', 'cupcake'], // Available DaisyUI themes
        darkTheme: 'dark', // Default dark mode theme
        base: true, // Enable/disable DaisyUI's base styles (default: true)
        styled: true, // Enable/disable component styling (default: true)
        utils: true, // Enable/disable utility classes (default: true)
        logs: true, // Enable/disable DaisyUI logs in the console (default: true)
        rtl: false, // Enable/disable right-to-left text direction (default: false)
        prefix: '', // Add a prefix to DaisyUI classes (e.g., 'daisy-' makes `btn` => `daisy-btn`)
    },
};
