# local_orm
[![CodeShip](https://codeship.com/projects/0876cb80-2453-0134-45d7-7a46f2e0a594/status?branch=master)](https://codeship.com/projects/0876cb80-2453-0134-45d7-7a46f2e0a594/status?branch=master)
[![Code Climate](https://codeclimate.com/github/hiquest/local_orm/badges/gpa.svg)](https://codeclimate.com/github/hiquest/local_orm)

A simple ORM-like wrapper around localStorage

Features
======
* Functional interface
* Familiar ORM-like DSL
* Types
* Validations

Installation
------
```
npm install local_orm --save
```

Usage
------
Define a schema (yes, we call it a schema):

```javascript
const { define: define, types: t, validations: v } = require("local_orm");

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

Let's save some books.

```javascript

// Create a book
let [err, book] = Store.books.create({ title: "War And Peace" });
console.log(book);
// => { id: "0326d5ce-d3db-4bf7-853f-37d4d5adf6a8", title: "War And Peace", genre: 'fiction' }
// ( Note that we have an id now, and that genre was populated with a default value )

// Let's try another one
let [err, book] = Store.books.create({ year: "1984" }); // I only remember the year...
console.log(book); // => null

// Was there some errors?
console.log(err); // => { 'year': ['should be an integer'], 'title': ['should be present'] }

// Oh, I see now...
let [err, book] = Store.books.create({ title: "So Long, and Thanks for all the Fish", year: 1984 }); // I only remember the year...
```

We can load books from localStorage now.

```javascript
// Find a book by id
let book = Store.books.find(id);

// Load all books
let books = Store.books.all();

// Filter by title
let books = Store.books.where({title: 'War And Peace'});

// Any function is also accepted
let books = Store.books.where((b) => b.year > 1980);
```

Validations
------
Validation is a simple plain JavaScript function that takes a value and returns an array like this one [error, valid]. Local_orm comes with several predefined validations.

* `present` requires a value to be present (not undefined and not null)
```javascript
validations: [v.present]
```

* `min`, `max` define a range for integer types (inclusive)
```javascript
validations: [v.min(0), v.max(127)]
```

* `minLength`, `maxLength` define a length range for strings or arrays (really, anything that has length)
```javascript
validations: [v.maxLength(32)]
```

* `oneOf` require a value to be in a particular set of values (like enum)
```javascript
validations: [v.oneOf("sun", "moon")]
```

Also, note that when you define a type, under the curtains the corresponding validation is added to the list.

As noted earlier, validations are just functions, so it is easy to define your own:
```
const positive = (val) => {
  if (val > 0) {
    return [null, true];
  } else {
    return ["should be positive", false];
  }
};

validations: [ positive ]
```

Contributing
------
Yes, please.
