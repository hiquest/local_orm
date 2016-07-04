const { define: define, types: t, validations: v } = require("../index");

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
});
