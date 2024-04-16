import { model, Schema } from 'mongoose';

const meetingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    start: {
        type: Date,
        default: Date.now,
        required: true,
    },
    end: Date,
    sponsor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
    },
    participants: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected', 'no-show'],
                default: 'pending',
            },
        },
    ],
});

const MeetingModel = model('Team', meetingSchema);

export default MeetingModel;
