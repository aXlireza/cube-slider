const plugins = [];
if (!process.env.SKIP_POSTCSS) {
  plugins.push('@tailwindcss/postcss');
}

export default { plugins };
