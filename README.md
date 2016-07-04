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

// Let's create a book
let [err, book] = Store.books.create({ title: "War And Peace" });
console.log(book); // => { id: "0326d5ce-d3db-4bf7-853f-37d4d5adf6a8", title: "War And Peace", genre: 'fiction' }

// Note that we have an id now, and that genre was populated with a default value

// Let's try another one
let [err, book] = Store.books.create({ year: "1993" }); // I only remember the year...
console.log(book); // => null

// Was there some errors?
console.log(err); // => { 'year': ['should be an integer'], 'title': ['should be present'] }
```
