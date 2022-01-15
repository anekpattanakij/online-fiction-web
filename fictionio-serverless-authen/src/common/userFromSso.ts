export enum enumChannel {
  CHANNEL_FACEBOOK = 'FACEBOOK',
  CHANNEL_GOOGLE = 'GOOGLE',
}

export class UserDataFromSso {
  public channel: enumChannel;
  public socialId: string;
  public displayName: string;
  public dataOfBirth: Date;
  public email: string;
  public firstName: string;
  public lastName: string;
  public gender: string;
}
