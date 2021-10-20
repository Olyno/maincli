import esbuild from 'esbuild';

esbuild
  .build({
    logLevel: 'info',
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/cli.cjs',
    platform: 'node',
    target: 'esnext',
  })
  .catch(() => process.exit(1));
