import MeetingModel from '../models/meeting';
import { IMeeting } from '../models/types';
import UserModel from '../models/user';

const meetingService = {
    /**
     * 根据范围查找会议
     * @param {Date} start 起始日期
     * @param {Date} end 结束日期
     */
    async getByRange(userId: string, start: Date, end: Date) {
        const userDoc = await UserModel.findById(userId, 'meetings').populate<{
            meetings: IMeeting[];
        }>({
            path: 'meetings',
            match: {
                start: { $gte: start, $lte: end },
            },
            model: MeetingModel,
            options: {
                sort: { start: 1 },
            },
            populate: ['sponsor', 'teams', 'attendees'],
        });
        if (!userDoc) {
            throw new Error('用户不存在', { cause: 404 });
        }
        return userDoc.meetings;
    },
};

export default meetingService;
