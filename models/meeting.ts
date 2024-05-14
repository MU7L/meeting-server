import { Types } from 'mongoose';

import { modelOptions, prop, PropType, Ref } from '@typegoose/typegoose';

import User from './user';

export enum AttendeeResponse {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

class Attendee {
    @prop({ required: true, ref: () => User })
    user!: Ref<User>;

    @prop({
        required: true,
        enum: AttendeeResponse,
        default: AttendeeResponse.PENDING,
    })
    response!: AttendeeResponse;
}

@modelOptions({
    schemaOptions: {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
})
export default class Meeting {
    @prop({ required: true, type: String })
    title!: string;

    @prop({ type: String })
    description?: string;

    @prop({ required: true })
    start!: Date;

    @prop({ required: true })
    end!: Date;

    @prop({ required: true, ref: () => User })
    sponsor!: Ref<User>;

    @prop(
        { required: true, _id: false, type: () => [Attendee], default: [] },
        PropType.ARRAY,
    )
    attendees!: Types.Array<Attendee>;

    get status() {
        const now = new Date();
        if (now < this.start) {
            return 'pending';
        } else if (now > this.end) {
            return 'finished';
        } else {
            return 'ongoing';
        }
    }
}
