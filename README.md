# local-orm
[![Code Climate](https://codeclimate.com/github/hiquest/local_orm/badges/gpa.svg)](https://codeclimate.com/github/hiquest/local_orm)

A simple ORM-like wrapper around localStorage

Features
======
* Functional interface
* Familiar ORM-like DSL
* Types
* Validations

Usage
======
First of all, let's define a schema (yes, we have a schema):

```javascript
const { define: define, types: t, validations: v } = require("../index");

const Store = define({
  name: "books_schema",
  schema: {
    books: {
      title: {
        type: t.string,
        validations: [v.present, v.maxLength(32)]
      },
      year: {
        type: t.integer,
        validations: [v.min(1900), v.max(2999)]
      },
      genre: {
        type: t.string,
        validations: [v.present, v.oneOf('fiction', 'non-fiction')],
        defaultVal: 'fiction'
      }
    }
  }
});

```
