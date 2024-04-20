import { model, Schema, Types } from 'mongoose';

import { IUser } from './types';

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    encryptedPassword: {
        type: String,
        required: true,
    },
    avatar: String,
    teams: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Team',
        },
    ],
    meetings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Meeting',
        },
    ],
});

const UserModel = model<IUser>('User', userSchema);

export default UserModel;
