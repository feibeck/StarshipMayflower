const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

module.exports = composePlugins(
  withNx(),
  withReact({
    svgr: true,
  }),
  (config) => {
    // Add any custom webpack configuration here
    return config;
  }
);
