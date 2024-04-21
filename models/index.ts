import { getModelForClass } from '@typegoose/typegoose';

import Meeting from './meeting';
import Team from './team';
import User from './user';

export const UserModel = getModelForClass(User);
export const MeetingModel = getModelForClass(Meeting);
export const TeamModel = getModelForClass(Team);
