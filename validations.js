// Validation is a function that takes a single value,
// and returns an array of error and validity.

const _    = require('underscore');

const wrap = (fn, err) => {
  return (val) => {
    if (fn(val)) {
      return [null, true];
    } else {
      return [err, false];
    }
  };
};

const requireBoolean = wrap(_.isBoolean, "should be a boolean");
const requireString  = wrap(_.isString, "should be a string");
const requireInteger = wrap(Number.isInteger, "should be an integer");

module.exports = { requireBoolean, requireInteger, requireString };
