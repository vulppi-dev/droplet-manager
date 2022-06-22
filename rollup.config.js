import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const config = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'module',
    },
    plugins: [
      nodeResolve(),
      typescript({
        outputToFilesystem: false,
      }),
      commonjs(),
      terser(),
    ],
  },
]

export default config
