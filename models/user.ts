import { Types } from 'mongoose';

import { prop, PropType, Ref } from '@typegoose/typegoose';

import Meeting from './Meeting';
import Team from './Team';

export default class User {
    @prop({ required: true, type: String })
    name!: string;

    @prop({ required: true, unique: true, type: String })
    email!: string;

    @prop({ required: true, select: false, type: String })
    encryptedPassword!: string;

    @prop({ type: String })
    avatar?: string;

    @prop({ required: true, ref: () => Team, default: [] }, PropType.ARRAY)
    teams!: Types.Array<Ref<Team>>;

    @prop({ required: true, ref: () => Meeting, default: [] }, PropType.ARRAY)
    meetings!: Types.Array<Ref<Meeting>>;
}
