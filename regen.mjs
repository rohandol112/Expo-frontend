import { Generator, getConfig } from '@tanstack/router-generator';
const config = getConfig({
  routesDirectory: './src/routes',
  generatedRouteTree: './src/routeTree.gen.ts',
  quoteStyle: 'double',
  semicolons: true,
}, process.cwd());
const gen = new Generator({ config, root: process.cwd() });
await gen.run();
console.log('route tree regenerated OK');
