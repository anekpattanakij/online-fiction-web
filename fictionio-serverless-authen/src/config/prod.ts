import { DefaultConfig } from './default';

export class ProductionConfig extends DefaultConfig {
  // TODO Over write default settings here...
  public static RECAPTCHA_LOGIN_REGISTER_MINIMUM_SCORE: number = 0.5;
  public static GOOGLE_PROJECT_ID:string = 'fictionio-prod';
}
