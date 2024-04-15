import { model, Schema } from 'mongoose';

const teamSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
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

const TeamModel = model('Team', teamSchema);

export default TeamModel;
