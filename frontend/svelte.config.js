import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: '../backend/public',
      assets: '../backend/public',
      fallback: 'index.html'
    })
  }
};
