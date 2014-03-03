var _ = require('lodash');

_.extend(Error.prototype, {
    isError: true
});

module.exports = Error;
