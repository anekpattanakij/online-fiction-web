import { BaseCustomClass } from './BaseCustomClass';

export default class User extends BaseCustomClass {
  static decodeUser(json) {
    const user = Object.create(User.prototype);
    try {
      return Object.assign(user, json, {
        lastLoginDate: new Date(json.lastLoginDate),
        registerDate: new Date(json.registerDate),
        dateOfBirth: new Date(json.dateOfBirth),
      });
    } catch (err) {
      return user;
    }
  }

  cif;
  firstName;
  lastName;
  sex;
  displayName;
  email;
  coin;
  password;
  usertype;
  dateOfBirth;
  accessToken;
  refreshToken;
  lastLoginDate;
  registerDate;
  logonStatus;
  preferredLanguage;
  withdrawableCoin;
  totalIncomeAsAuthor;
  totalIncomeFromTranslated;
  publishedChapterCount;
  publishedFictionCount;

  constructor(init) {
    super();
    Object.assign(this, init);
  }

  encode() {
    return Object.assign({}, this, {
      lastLoginDate: this.lastLoginDate.toString(),
      registerDate: this.registerDate.toString(),
      dateOfBirth: this.dateOfBirth.toString(),
    });
  }

  toPlainObject() {
    const tempPassword = this.password;
    this.password = '';
    const returnObject = Object.assign({}, this);
    this.password = tempPassword;
    return returnObject;
  }
}
