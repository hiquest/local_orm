// Dependencies
const uuid = require('node-uuid');
const _    = require('underscore');

const t = require('./types');
const v = require('./validations');

const PREFIX = "LOCAL_ORM";

const define = ({name: schemaName, schema: schema}) => {

  let table_key = (table_name) => `${PREFIX}_${schemaName}_${table_name}`;

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

    const fetchAll = () => loadTable(tableName);

    const setDefaultValues = (oldEntity) => {
      let entity = _.clone(oldEntity);
      fields.forEach( (k) => {
        if (!entity[k] && !_.isUndefined(tableConfig[k].defaultVal)) {
          let dv = tableConfig[k].defaultVal;
          entity[k] = _.isFunction(dv) ? dv() : dv
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
        let entities = fetchAll();
        entities.push(ent);
        commitTable(tableName, entities);
        return [null, ent];
      } else {
        return [err, null]
      }
    };

    const update = (ent) => {
      const [err, valid] = validate(ent);
      if (valid) {
        let entities = fetchAll();
        const ind = _.findIndex(entities, { id: ent.id });
        if (ind > -1) {
          entities[ind] = ent;
          commitTable(tableName, entities);
          return [null, ent];
        } else {
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
      const ent = _.find(fetchAll(), {id: id});
      if (ent) {
        return ent;
      } else {
        throw `Entity with id ${id} does not exist`;
      }
    };

    const destroy = (id) => {
      let ent = find(id);
      let entities = fetchAll();
      let e = _.find(entities, { id: ent.id });
      let updatedEntities = _.without(entities, e);
      commitTable(tableName, updatedEntities);
      return true;
    };

    const all = (filterWith) => {
      return fetchAll();
    };

    const where = (filterWith) => {
      let allFields = _.union(fields, ['id']);
      if (_.isObject(filterWith)) {
        let keys = Object.keys(filterWith);
        _.each(keys, (key) => {
          if(allFields.indexOf(key) < 0) {
            throw `Key ${key} doesn't exists`;
          }
        });
      };
      if (!filterWith) {
        return fetchAll();
      } else {
        return _.filter(fetchAll(), filterWith);
      }
    };

    memo[tableName] = { save, find, destroy, all, where, validate, build };
    return memo;
  }, {});
};

module.exports = define;
