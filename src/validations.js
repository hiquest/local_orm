// Validation is a function that takes a single value,
// and returns an array of error and validity.

// TODO: implement min, max, oneOf

const _ = require('underscore');

const wrap = (fn, err) => {
  return (val) => {
    if (_.isUndefined(val) || fn(val)) {
      return [null, true];
    } else {
      return [err, false];
    }
  };
};

const requireBoolean = wrap(_.isBoolean, "should be a boolean");
const requireString  = wrap(_.isString, "should be a string");
const requireInteger = wrap(Number.isInteger, "should be an integer");

const present = (val) => {
  if (_.isUndefined(val) || _.isNull(val)) {
    return [ "should be present", false];
  } else {
    return [null, true];
  }
};

const maxLength = (max) => {
  return (val) => {
    if (_.isUndefined(val)) {
      return [null, true];
    }

    if (val.length) {
      if (val.length > max) {
        return ["max length exceeded", false];
      } else {
        return [null, true];
      }
    } else {
      return ["can't limit a max length: length is undefined", false];
    }
  };
};

const minLength = (min) => {
  return (val) => {
    if (_.isUndefined(val)) {
      return [null, true];
    }

    if (val && val.length) {
      if (val.length < min) {
        return ["min length exceeded", false];
      } else {
        return [null, true];
      }
    } else {
      return ["can't limit a min length: length is undefined", false];
    };
  };
};

const min = (min) => {
  return (val) => {
    if (val < min) {
      return [`should be more or equal to ${min}`, false]
    } else {
      return [null, true];
    };
  };
};

const max = (max) => {
  return (val) => {
    if (val > max) {
      return [`should be less or equal to ${max}`, false]
    } else {
      return [null, true];
    };
  };
};

const oneOf = (...args) => {
  return (val) => {
    if ((args || []).indexOf(val) > -1) {
      return [null, true];
    } else {
      return [`should be one of [${args}]`, false]
    };
  };
};

// Composite or
// Usage:
//   let outerRange = or(minLength(10), maxLength(2));
const or = (v1, v2) => {
  return (val) => {
    let [err1, valid1] = v1(val);
    if (valid1) {
      return [null, true];
    }

    let [err2, valid2] = v2(val);
    if (valid2) {
      return [null, true];
    }

    return [`${err1}, ${err2}`, false];
  };
};

// Runs a value over a list of validations
const run = (val, validations) => {
  return _.reduce(validations, (memo, validation) => {
    const [err, valid] = validation(val);
    if (!valid) {
      memo[0].push(err);
      memo[1] = false;
    }
    return memo;
  }, [ [], true ]);
};

module.exports = {
  requireBoolean,
  requireInteger,
  requireString,
  present,
  min,
  max,
  maxLength,
  minLength,
  oneOf,
  or,
  run
};
