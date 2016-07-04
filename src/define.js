// Dependencies
const uuid = require('node-uuid');
const _    = require('underscore');

const TYPE_PREFIX = "RELATIVE_STORE";

const define = ({name: name, schema: schema}) => {
  let table_key = (name) => "#{name}_#{name}";

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

    const setDefaultValues = (entity) => {
      fields.forEach( (k) => {
        if (!entity[k] && !_.isUndefined(tableConfig[k].defaultVal)) {
          entity[k] = tableConfig[k].defaultVal;
        };
      });
      return entity;
    };

    const validate = (oldEnt) => {
      let ent = setDefaultValues(oldEnt);

      const errors = _.reduce(fields, (memo, field) => {
        let validations = tableConfig[field]['validations'] || [];
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
      ent.id = uuid.v1();
      [err, valid] = isValid(ent);
      if (valid) {
        let entities = all();
        entities.push(ent);
        commitTable(name, entities);
        return [null, ent];
      } else {
        return [err, null]
      }
    };

    const update = (ent) => {
      [err, valid] = isValid(ent);
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

    memo[tableName] = { save, find, destroy, all, where, validate };
    return memo;
  }, {});
};

module.exports = define;
