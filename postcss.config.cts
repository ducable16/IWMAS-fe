import type postcssrc from 'postcss-load-config'

const config: postcssrc.Config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export = config
