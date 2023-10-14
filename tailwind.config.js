module.exports = {
  content: [`./views/*.html`],
  daisyui: {
    themes: ['retro'],
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

