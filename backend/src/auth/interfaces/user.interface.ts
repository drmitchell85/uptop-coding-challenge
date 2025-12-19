export interface IUser {
  _id?: string;
  email: string;
  name?: string;
  points: number;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
