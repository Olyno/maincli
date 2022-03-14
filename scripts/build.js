import esbuild from 'esbuild';

const isDev = process.argv.includes('--dev');

esbuild
  .build({
    logLevel: 'info',
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/cli.cjs',
    platform: 'node',
    target: 'esnext',
    watch: isDev,
  })
  .catch(() => process.exit(1));
