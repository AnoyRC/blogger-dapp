const webpack = require('webpack');
module.exports = function override(config) {
		const fallback = config.resolve.fallback || {};
		Object.assign(fallback, {
    	"fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
      "buffer": false,
      "assert": require.resolve("assert/"),
      "os": false,
      "process": require.resolve("process/browser"),
      "util": require.resolve("util/") 
      }
  )
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
   	  new webpack.ProvidePlugin({
    	process: 'process/browser',
      buffer: ['buffer', 'Buffer']
    })
   ])
   return config;
}
