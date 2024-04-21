import { prop, Ref } from '@typegoose/typegoose';

import Meeting from './meeting';
import Team from './team';

export default class User {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true, index: true, unique: true })
    public email!: string;

    @prop({ required: true })
    public encryptedPassword!: string;

    @prop()
    public avatar?: string;

    @prop({ required: true, ref: () => Team })
    public teams!: Ref<Team>[];

    @prop({ required: true, ref: () => Meeting })
    public meetings!: Ref<Meeting>[];
}
