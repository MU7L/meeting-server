import { getModelForClass } from '@typegoose/typegoose';

import Meeting from './Meeting';
import Team from './Team';
import User from './User';

export const UserModel = getModelForClass(User);
export const MeetingModel = getModelForClass(Meeting);
export const TeamModel = getModelForClass(Team);
