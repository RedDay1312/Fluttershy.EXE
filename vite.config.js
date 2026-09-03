import { defineConfig } from 'vite';
export default defineConfig({base:'./',build:{target:'es2022',sourcemap:false,assetsDir:'assets',emptyOutDir:true},server:{strictPort:true,port:5173,host:'127.0.0.1'},preview:{strictPort:true,port:4173,host:'127.0.0.1'}});
