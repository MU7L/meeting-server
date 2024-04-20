import { model, Schema } from 'mongoose';

import { IMeeting } from './types';

const meetingSchema = new Schema<IMeeting>({
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
    end: {
        type: Date,
        default: Date.now,
        required: true,
    },
    sponsor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    teams: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
    ],
    attendees: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            response: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending',
            },
        },
    ],
});

const MeetingModel = model<IMeeting>('Team', meetingSchema);

export default MeetingModel;
