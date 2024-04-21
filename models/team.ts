import { prop, Ref } from '@typegoose/typegoose';

import User from './user';

export default class Team {
    @prop({ required: true })
    public name!: string;
    @prop()
    public description?: string;
    @prop({ required: true, ref: () => User })
    public mentor!: Ref<User>;
    @prop({ required: true, ref: () => User })
    public members!: Ref<User>[];
}
