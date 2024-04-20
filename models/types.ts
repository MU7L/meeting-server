import { Types } from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    encryptedPassword: string;
    avatar?: string;
    teams?: Types.DocumentArray<ITeam>;
    meetings?: Types.DocumentArray<IMeeting>;
}

export interface ITeam {
    name: string;
    description?: string;
    mentor: Types.ObjectId;
    members?: Types.DocumentArray<IUser>;
}

export interface IMeeting {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    sponsor: Types.ObjectId;
    teams: Types.DocumentArray<ITeam>;
    // TODO: 可能存在类型问题 2024-04-21 00:52
    attendees: Array<{
        user: Types.ObjectId;
        response: 'pending' | 'accepted' | 'rejected';
    }>;
}
