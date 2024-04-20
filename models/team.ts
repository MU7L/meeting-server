import { model, Schema } from 'mongoose';

import { ITeam } from './types';

const teamSchema = new Schema<ITeam>({
    name: {
        type: String,
        required: true,
    },
    description: String,
    mentor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
});

const TeamModel = model<ITeam>('Team', teamSchema);

export default TeamModel;
