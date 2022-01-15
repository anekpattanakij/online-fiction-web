import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { Config } from '../config/index';
import { BaseCustomClass } from './baseCustomClass';

const RANDOM_LENGTH: number = 20;

export class User extends BaseCustomClass {
  public static decodeUser(json: any) {
    const user: User = Object.create(User.prototype);
    try {
      return Object.assign(user, json, {
        lastLoginDate: new Date(json.lastLoginDate),
        registerDate: new Date(json.registerDate),
        dateOfBirth: new Date(json.dateOfBirth),
        resetPasswordDate: new Date(json.resetPasswordDate),
      });
    } catch (err) {
      return user;
    }
  }

  public cif: string;
  public firstName: string;
  public lastName: string;
  public sex: string;
  public displayName: string;
  public email: string;
  public coin: number;
  public password: string;
  public usertype: number;
  public dateOfBirth: Date;
  public accessToken: string;
  public refreshToken: string;
  public lastLoginDate: Date;
  public registerDate: Date;
  public logonStatus: boolean;
  public googleUid: string;
  public facebookUid: string;
  public resetPasswordToken: string;
  public resetPasswordDate: Date;

  public constructor(init?: Partial<User>) {
    super();
    Object.assign(this, init);
  }

  // override encode because it has data object
  public encode() {
    return Object.assign({}, this, {
      lastLoginDate: this.lastLoginDate.toString(),
      registerDate: this.registerDate.toString(),
      dateOfBirth: this.dateOfBirth.toString(),
      resetPasswordDate: this.resetPasswordDate.toString(),
    });
  }

  public stampTime(): void {
    this.lastLoginDate = new Date();
    if (!this.registerDate) {
      this.registerDate = this.lastLoginDate;
    }
  }

  public assignValueFromJWT(input: any): void {
    this.cif = input.cif;
    this.displayName = input.displayName;
    this.email = input.email;
    this.usertype = input.usertype;
    this.refreshToken = input.refreshToken;
    this.accessToken = input.accessToken;
    this.lastLoginDate = input.lastLoginDate;
    this.registerDate = input.registerDate;
    this.coin = input.coin;
  }

  public stampNewRefreshToken(): void {
    this.refreshToken = crypto.randomBytes(RANDOM_LENGTH).toString('base64');
  }

  public generateAccessToken(): string {
    const token: string = jwt.sign(
      {
        cif: this.cif,
        displayName: this.displayName,
        email: this.email,
        usertype: this.usertype,
        dateOfBirth: this.dateOfBirth,
      },
      Config.SIGN_TOKEN,
      { expiresIn: Config.ACCESS_TOKEN_TIMEOUT_SECOND },
    );
    this.accessToken = token;
    return token;
  }

  public toPlainObject() {
    const tempPassword = this.password;
    this.password = '';
    const returnObject = Object.assign({}, this);
    this.password = tempPassword;
    return returnObject;
  }

}
