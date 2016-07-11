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
        }
      }
    }
  });

  describe("#build", () => {
    it("populates model with default values", () => {
      const book = Store.books.build();
      expect(book).toEqual({genre: "fiction"});
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
    it("returns an errors if entity doesn't exist", () => {
      let [err, ent] = Store.books.find("not-exists");
      expect(err).toBeDefined();
      expect(ent).toBeNull();
    });

    it("returns an entity if it exists", () => {
      let [errors, book] = Store.books.save({title: "Test Title"});

      let [err, ent] = Store.books.find(book.id);
      expect(err).toBeNull();
      expect(ent.title).toBe("Test Title");
    });
  });

  describe("#destroy", () => {
    it("returns an errors if entity doesn't exist", () => {
      let [err, success] = Store.books.destroy("not-exists");
      expect(err).toBeDefined();
      expect(success).toBe(false);
    });

    it("deletes the entity if it exists", () => {
      let [errors, book] = Store.books.save({title: "Test Title"});

      let [err, success] = Store.books.destroy(book.id);
      expect(err).toBeNull();
      expect(success).toBe(true);

      let [err2, entity] = Store.books.find(book.id);
      expect(err2).toBeDefined();
      expect(entity).toBeNull();
    });
  });
});
