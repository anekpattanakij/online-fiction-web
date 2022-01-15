export class BaseCustomClass {
  toPlainObject() {
    return Object.assign({}, this);
  }
}
