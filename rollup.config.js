import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'

const bundle = (config) =>
  defineConfig({
    ...config,
    input: 'src/bootstrap.ts',
    external: (id) => !/^[./]/.test(id),
  })

const config = defineConfig([
  bundle({
    plugins: [esbuild(), terser()],
    output: [
      {
        file: `bin/bootstrap.js`,
        format: 'cjs',
      },
    ],
  }),
])

export default config
