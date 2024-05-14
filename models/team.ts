import { Types } from 'mongoose';

import { modelOptions, prop, PropType, Ref } from '@typegoose/typegoose';

import User from './user';

export enum MemberType {
    MENTOR = 'mentor',
    MEMBER = 'member',
    NEW = 'new',
}

@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
})
class Member {
    @prop({ required: true, ref: () => User })
    user!: Ref<User>;

    @prop({ required: true, enum: MemberType, default: MemberType.NEW })
    type!: MemberType;
}

export default class Team {
    @prop({ required: true, type: String })
    name!: string;

    @prop({ type: String })
    description?: string;

    @prop({ required: true, ref: () => User })
    mentor!: Ref<User>;

    @prop(
        { required: true, _id: false, type: () => [Member], default: [] },
        PropType.ARRAY,
    )
    members!: Types.Array<Member>;
}
