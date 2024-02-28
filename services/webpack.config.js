module.exports = function (options) {
  return {
    ...options,
    devtool: options.mode === 'production' ? 'nosources-source-map' : 'source-map',
  }
};
