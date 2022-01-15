import { BaseCustomClass } from './baseCustomClass';
import { FieldValue, Timestamp } from '@google-cloud/firestore';

export class Comment extends BaseCustomClass {
  public comment: string;
  public userCif: string;
  public userDisplayName: string;
  public runningNumber: number;
  public commentDate: Date;
  public isDeleted: boolean;

  public constructor(init?: Partial<Comment>) {
    super();
    Object.assign(this, init);
  }

  public convertToPlainObject(): object {
    const returnObject: any = Object.assign({}, this);

    return returnObject;
  }
}

export const returnFireStoreComment = (input: any): Comment => {
  const returnComment: Comment = new Comment({
    comment: input.comment,
    userCif: input.userCif,
    userDisplayName: input.userDisplayName,
    runningNumber: input.runningNumber,
    isDeleted: input.isDeleted,
  });
  return returnComment;
};

export const transformCommentToFirestoreObject = (input: Comment): any => {
  const returnObject: any = {};
  returnObject.comment = input.comment;
  returnObject.userCif = input.userCif;
  returnObject.userDisplayName = input.userDisplayName;
  returnObject.runningNumber = input.runningNumber;
  returnObject.isDeleted = false;
  return returnObject;
};

export const sortCommentFunction = (a, b) => {
  if (a.runningNumber > b.runningNumber) {
    return -1;
  }
  if (a.runningNumber < b.runningNumber) {
    return 1;
  }
  return 0;
};
