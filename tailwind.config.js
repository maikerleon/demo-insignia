/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'ins': {
          '50': '#fff9e4',
          '100': '#fff5c5',
          '200': '#ffef92',
          '300': '#ffea53',
          '400': '#fce91f',
          '500': '#e2d100',
          '600': '#b5ad00',
          '700': '#898402',
          '800': '#6c6908',
          '900': '#5b5a0c',
          '950': '#323300',
          'green-light': '#00ae4b',
          'green-dark': '#008f3b',
        },      
      }
    }
  },
  plugins: [require("daisyui")],
};