const { define: define, types: t, validations: v } = require("../src/index");

describe("An example store",() => {
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
        },
        readersCount: {
          type: t.integer,
          validations: [v.present],
          defaultVal: () => 0
        }
      },
      authors: {
        name: {
          type: t.string
        }
      }
    }
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("#build", () => {
    it("populates model with default values", () => {
      const book = Store.books.build();
      expect(book.genre).toEqual("fiction");
      expect(book.readersCount).toEqual(0);
    });
  });

  describe("#validate", () => {
    it("allows valid entities", () => {
      let book = { title: "War And Peace" };
      let [errors, valid] = Store.books.validate(book);
      expect(valid).toBe(true);
      expect(errors).toEqual({});
    });

    it("not allows invalid entities", () => {
      let book = {};
      let [errors, valid] = Store.books.validate(book);
      expect(valid).toBe(false);
      expect(errors['title']).toEqual(
        [ "should be present" ]
      );

      book = {
        year: "1995",
        title: 'This is a way too long title, you really should not call the books like that',
        genre: 'sci-fi'
      };
      [errors, valid] = Store.books.validate(book);
      expect(valid).toBe(false);
      expect(errors['year']).toEqual(
        [ "should be an integer" ]
      );
      expect(errors['title']).toEqual(
        [ "max length exceeded" ]
      );
      expect(errors['genre']).toEqual(
        [ "should be one of [fiction,non-fiction]" ]
      );
    });
  });

  describe("#save", () => {
    it("refuse to save the enity if it is invalid", () => {
      let input = {}
      let [errors, book] = Store.books.save(input);
      expect(input).toEqual({});
      expect(book).toBe(null);
      expect(errors['title']).toEqual(
        [ "should be present" ]
      );
    });

    it("successfully save the entity if it is valid", () => {
      let [errors, book] = Store.books.save({title: "Test Title"});
      expect(book.id).toBeDefined();
      expect(book.title).toEqual("Test Title");
      expect(book.genre).toEqual("fiction");
      expect(errors).toBe(null);
    });
  });

  describe("#find", () => {
    it("throws an error if entity doesn't exist", () => {
      expect(() => {
        let ent = Store.books.find("not-exists");
      }).toThrow();
    });

    it("returns an entity if it exists", () => {
      let [errors, book] = Store.books.save({title: "Test Title"});
      let ent = Store.books.find(book.id);
      expect(ent.title).toBe("Test Title");
    });
  });

  describe("#destroy", () => {
    it("throws an error if entity doesn't exist", () => {
      expect(() => {
        let ent = Store.books.destroy("not-exists");
      }).toThrow();
    });

    it("deletes the entity if it exists", () => {
      let [errors, book] = Store.books.save({title: "Test Title"});

      let success = Store.books.destroy(book.id);
      expect(success).toBe(true);

      let entities = Store.books.where({id: book.id});
      expect(entities.length).toEqual(0);
    });
  });

  describe("#where", () => {
    beforeEach(() => {
      let [e, b] = Store.books.save({year: 1996, title: "X"});
      [e, b] = Store.books.save({year: 2005, title: "Y"});
    });

    it("loads all entities when no arguments provided", () => {
      let books = Store.books.where();
      expect(books.length).toEqual(2);
    });

    it("filters every item with function", () => {
      let books = Store.books.where((x) => x.year > 2000);
      expect(books.length).toEqual(1);
      expect(books[0].title).toEqual('Y');
    });

    it("filters when object provided", () => {
      let books = Store.books.where({year: 1996});
      expect(books.length).toEqual(1);
      expect(books[0].title).toEqual('X');
    });

    it("prevents from using not defined key when object provided", () => {
      expect(() => {
        let ent = Store.books.where({some: 'something'});
      }).toThrow();
    });
  });

  describe("Integrity", () => {
    it("don't mix up tables", () => {
      [_, author] = Store.authors.save({name: "Author"});
      [_, book] = Store.books.save({title: "Title"});
      expect(Store.authors.all().length).toEqual(1);
      expect(Store.books.all().length).toEqual(1);
    });
  })
});
