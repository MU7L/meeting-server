import { getModelForClass } from '@typegoose/typegoose';

// linux 文件名区分大小写
import Meeting from './meeting';
import Team from './team';
import User from './user';

export const UserModel = getModelForClass(User);
export const MeetingModel = getModelForClass(Meeting);
export const TeamModel = getModelForClass(Team);
