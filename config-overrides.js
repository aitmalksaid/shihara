module.exports = function override(config, env) {
  // Fallbacks pour les modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": false,
    "os": false
  };

  return config;
}