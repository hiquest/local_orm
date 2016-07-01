// Validation is a function that takes a single value,
// and returns an array of error and validity.

const _ = require('underscore');

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

const maxLength = (max) => {
  return (val) => {
    if (val.length) {
      if (val.length > max) {
        return ["max length exceeded", false];
      } else {
        return [null, true];
      };
    } else {
      return ["can't limit a max length: length is undefined", false];
    };
  };
};

const minLength = (min) => {
  return (val) => {
    if (val.length) {
      if (val.length < min) {
        return ["min length exceeded", false];
      } else {
        return [null, true];
      };
    } else {
      return ["can't limit a min length: length is undefined", false];
    };
  };
};

module.exports = { requireBoolean, requireInteger, requireString, maxLength, minLength };
