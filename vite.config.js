import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { createRequire } from 'node:module';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { normalizePath } from 'vite';

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));

export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: cMapsDir,
                    dest: '', // This will copy the cMaps to the root of the output directory
                },
            ],
        }),
    ],
});
