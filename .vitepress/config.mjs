import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Site of Tom Yang ",
  description: "A website to write some things.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [

    ],

    search: {
      provider: 'local'
    },
    outline: {
      level: [1, 4]
    },
    lastUpdated: true,
    cleanUrls: true,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  markdown: {
    image: {
      lazyLoading: true
    },
    toc: { level: [2, 3, 4] },
  }
})
