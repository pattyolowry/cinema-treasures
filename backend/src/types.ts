import mongoose from 'mongoose'

export interface UserInfo {
    id: string,
    name: string,
    username: string,
    password: string
}

declare global {
  namespace Express {
    interface Request {
      token?: string | null;
      user?: mongoose.Model<UserInfo> | null;
    }
  }
}