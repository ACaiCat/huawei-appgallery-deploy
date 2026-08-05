// See: https://rollupjs.org/introduction/

import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

const config = {
  input: 'src/index.ts',
  output: {
    esModule: true,
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    typescript(),
    nodeResolve({ preferBuiltins: true }),
    commonjs({ transformMixedEsModules: true }),
    json()
  ],
  onwarn(warning, warn) {
    // 静默 @actions/core 自身 CJS 代码带来的无害警告
    if (
      warning.code === 'THIS_IS_UNDEFINED' ||
      warning.code === 'CIRCULAR_DEPENDENCY'
    ) {
      return
    }
    warn(warning)
  }
}

export default config
