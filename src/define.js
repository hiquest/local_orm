// Dependencies
const uuid = require('node-uuid');
const _    = require('underscore');

const t = require('./types');
const v = require('./validations');

const PREFIX = "LOCAL_ORM";

const define = ({name: name, schema: schema}) => {
  let table_key = (name) => `${PREFIX}_${name}`;

  const loadTable = (table_name) => {
    let s = window.localStorage[table_key(table_name)];
    return s ? JSON.parse(s) : [];
  }

  const commitTable = (table_name, entities) => {
    return window.localStorage[table_key(table_name)] = JSON.stringify(entities);
  }

  return _.reduce(Object.keys(schema), (memo, tableName) => {
    const tableConfig = schema[tableName];

    const fields = Object.keys(tableConfig);

    const all = () => loadTable(name);

    const setDefaultValues = (oldEntity) => {
      let entity = _.clone(oldEntity);
      fields.forEach( (k) => {
        if (!entity[k] && !_.isUndefined(tableConfig[k].defaultVal)) {
          entity[k] = tableConfig[k].defaultVal;
        };
      });
      return entity;
    };

    const addTypeValidation = (validations, type) => {
      let out = _.clone(validations);
      if (type === t.string) {
        out.unshift(v.requireString);
      } else if (type === t.integer) {
        out.unshift(v.requireInteger);
      } else if (type === t.boolean) {
        out.unshift(v.requireBoolean);
      } else {
        throw "Unsupported type";
      }
      return out;
    };

    // Exposed

    const validate = (oldEnt) => {
      let ent = setDefaultValues(oldEnt);

      const errors = _.reduce(fields, (memo, field) => {
        let validations = tableConfig[field]['validations'] || [];
        validations = addTypeValidation(validations, tableConfig[field]['type']);
        let fieldErrors = validations.map((validator) => {
          let [err, valid] = validator(ent[field]);
          return err;
        });
        fieldErrors = _.filter(fieldErrors, (x) => x !== null);
        if (fieldErrors.length > 0 ) {
          memo[field] = fieldErrors;
        }
        return memo;
      }, {});

      const valid = _.reduce(
        _.pairs(errors),
        (memo, val) => { return memo && (val[1].length === 0) }
        , true
      );

      return [errors, valid];
    }

    const create = (ent) => {
      const [err, valid] = validate(ent);
      if (valid) {
        ent.id = uuid.v1();
        let entities = all();
        entities.push(ent);
        commitTable(name, entities);
        return [null, ent];
      } else {
        return [err, null]
      }
    };

    const update = (ent) => {
      const [err, valid] = validate(ent);
      if (valid) {
        let entities = all();
        const ind = _.findIndex(entities, { id: ent.id });
        if (ind > -1) {
          entities[ind] = ent;
          commitTable(name, entities);
          return [null, ent];
        } else {
          throw "Not Found";
          return ['Not Found', null];
        }
      } else {
        return [err, null];
      }
    };

    const build = (opts = {}) => {
      let ent = setDefaultValues(opts);
      return ent;
    };

    const save = (oldEnt) => {
      let ent = setDefaultValues(oldEnt);
      if (ent.id) {
        return update(ent);
      } else {
        return create(ent);
      }
    };

    const find = (id) => {
      const ent = _.find(all(), {id: id});
      if (ent) {
        return [null, ent];
      } else {
        return ["Not Found", null];
      }
    };

    const destroy = (id) => {
      [err, ent] = find(id)
      if (err) {
        return [err, false];
      } else {
        let entities = all();
        let e = _.find(entities, { id: ent.id });
        let updatedEntities = _.without(entities, e);
        commitTable(name, updatedEntities);
        return [null, true];
      }
    };

    const where = (filters) => {
      return _.filter(loadTable(name), filters);
    };

    memo[tableName] = { save, find, destroy, all, where, validate, build };
    return memo;
  }, {});
};

module.exports = define;
