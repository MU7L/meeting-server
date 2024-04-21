import { prop, Ref } from '@typegoose/typegoose';

import Team from './team';
import User from './user';

class Attendee {
    @prop({ required: true, ref: () => User })
    public user!: Ref<User>;
    @prop({ required: true, enum: ['pending', 'accepted', 'rejected'] })
    public response!: 'pending' | 'accepted' | 'rejected';
}

export default class Meeting {
    @prop({ required: true })
    public title!: string;
    @prop()
    public description?: string;
    @prop({ required: true })
    public start!: Date;
    @prop({ required: true })
    public end!: Date;
    @prop({ required: true, ref: () => User })
    public sponsor!: Ref<User>;
    @prop({ required: true, ref: () => Team })
    public teams!: Ref<Team>[];
    @prop({ required: true, _id: false, type: () => [Attendee] })
    public attendees!: Attendee[];
}
