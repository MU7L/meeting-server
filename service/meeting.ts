import { MeetingModel, TeamModel, UserModel } from '../models';
import { AttendeeResponse } from '../models/Meeting';
import { MemberType } from '../models/Team';
import CustomError from '../utils/error';

const meetingService = {
    /**
     * 根据范围查找会议
     * @param {Date} start 起始日期
     * @param {Date} end 结束日期
     */
    async getByRange(userId: string, start: Date, end: Date) {
        const userDoc = await UserModel.findById(userId, 'meetings').populate({
            path: 'meetings',
            match: {
                start: { $gte: start, $lte: end },
            },
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

    /** 创建会议 */
    async create(
        sponsorId: string,
        info: Partial<{
            title: string;
            description?: string;
            start: Date;
            end: Date;
            teamIdList: string[];
        }>,
    ) {
        // 查找发起人
        const sponsorDoc = await UserModel.findById(sponsorId, 'meetings');
        if (!sponsorDoc) {
            throw new CustomError('用户不存在', 404);
        }
        // 查找与会人员
        const attendeeIdSet = new Set([sponsorId]);
        const teamDocList = await TeamModel.find({
            _id: { $in: info.teamIdList },
        })
            .select('members')
            .populate({
                path: 'members',
                match: { role: MemberType.MEMBER },
                populate: 'user',
            });
        teamDocList.forEach(teamDoc => {
            teamDoc.members.forEach(member => {
                attendeeIdSet.add(String(member.user._id));
            });
        });
        const attendeeIdList = [...attendeeIdSet];
        // 创建会议
        const meetingDoc = await MeetingModel.create({
            ...info,
            attendees: attendeeIdList.map(attendeeId => ({
                user: attendeeId,
                type:
                    attendeeId === sponsorId
                        ? AttendeeResponse.ACCEPTED
                        : AttendeeResponse.PENDING,
            })),
        });
        // 通知用户
        await UserModel.updateMany(
            { _id: { $in: attendeeIdList } },
            { $push: { meetings: meetingDoc._id } },
        );
        return meetingDoc.id;
    },
};

export default meetingService;
