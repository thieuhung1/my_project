import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  // ...vite configures
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  plugins: [
    ...VitePluginNode({
      // Nodejs native Request adapter
      // currently this plugin support 'express', 'nest', 'koa' and 'fastify' out of box,
      // you can also pass a function if you are using other frameworks, see Custom Adapter section
      adapter: 'express',

      // tell the plugin where is your project entry
      appPath: './src/app.jsc',

      // Optional, default: 'viteNodeApp'
      // the name of named export of you app from the appPath file
      exportName: 'viteNodeApp',

      // Optional, default: false
      // if you want to init your app on boot, set this to true
      initAppOnBoot: false,

      // Optional, default: false
      // if you want to reload your app on file changes, set this to true, rebounce delay is 500ms
      reloadAppOnFileChange: false,

      // Optional, default: 'vite'
      // The TypeScript compiler mode you want to use
      // 'vite' uses Vite's default transformer pipeline (Oxc)
      // 'swc' is supported as an opt-in path (e.g. decorator metadata workflows)
      // you need to INSTALL `@swc/core` as dev dependency if you want to use swc
      tsCompiler: 'vite',

      // Optional, default: {
      // jsc: {
      //   target: 'es2019',
      //   parser: {
      //     syntax: 'typescript',
      //     decorators: true
      //   },
      //  transform: {
      //     legacyDecorator: true,
      //     decoratorMetadata: true
      //   }
      // }
      // }
      // swc configs, see [swc doc](https://swc.rs/docs/configuration/swcrc)
      swcOptions: {}
    })
  ],
});