import { DefaultConfig } from './default';

export class ProductionConfig extends DefaultConfig {
  // TODO Over write default settings here...
  public static CONNECT_TO_STEMPERY:boolean = true;
  public static STORAGE_BUCKET:string = 'fictionio-cover';
  public static GOOGLE_PROJECT_ID:string = 'fictionio-prod';
  public static UPDATE_SEARCH_CONTENT:boolean = true;
  public static SEARCH_API_PATH:string = 'http://elastic';
}
