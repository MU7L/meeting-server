import { MeetingModel, TeamModel, UserModel } from '../models';
import { AttendeeResponse } from '../models/meeting';
import { MemberType } from '../models/team';
import CustomError from '../utils/error';

const meetingService = {
    /** 创建会议 */
    async create(
        sponsorId: string,
        {
            title,
            description,
            start,
            end,
            teamIdList,
        }: Partial<{
            title: string;
            description?: string;
            start: Date;
            end: Date;
            teamIdList: string[];
        }>,
    ) {
        // 查找发起人
        const sponsorDoc = await UserModel.findById(sponsorId, 'name meetings');
        if (!sponsorDoc) {
            throw new CustomError('用户不存在', 404);
        }

        // 获取与会人员
        const attendeeIdSet = new Set([sponsorId]);
        if (teamIdList && teamIdList.length > 0) {
            const teamDocList = await TeamModel.find({
                _id: { $in: teamIdList },
            }).select('members');
            teamDocList.forEach(teamDoc => {
                teamDoc.members.forEach(member => {
                    if (member.type === MemberType.NEW) return;
                    attendeeIdSet.add(String(member.user._id));
                });
            });
        }
        const attendeeIdList = [...attendeeIdSet];

        // 创建会议
        const now = Date.now();
        const meetingDoc = await MeetingModel.create({
            title: title ?? `${sponsorDoc.name} 创建的会议`,
            description: description ?? '',
            start: start ?? new Date(now),
            end: end ?? new Date(now + 3600 * 1000),
            sponsor: sponsorId,
            attendees: attendeeIdList.map(attendeeId => ({
                user: attendeeId,
                response:
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
        return { mid: meetingDoc._id };
    },

    /** 查找会议详情 */
    async getMeeting(mid: string, uid: string) {
        const meetingDoc = await MeetingModel.findById(mid)
            .populate('sponsor', 'name avatar email')
            .populate({
                path: 'attendees',
                populate: {
                    path: 'user',
                    select: 'name avatar email',
                },
            })
            .select('-__v');
        if (!meetingDoc) {
            throw new CustomError('会议不存在', 404);
        }
        return meetingDoc;
    },

    /** 提交会议响应 */
    async updateResponse(mid: string, uid: string, response: AttendeeResponse) {
        const meetingDoc = await MeetingModel.findByIdAndUpdate(
            mid,
            {
                $set: {
                    'attendees.$[attendee].response': response,
                },
            },
            {
                arrayFilters: [{ 'attendee.user': uid }],
            },
        );
        if (!meetingDoc) {
            throw new CustomError('会议不存在', 404);
        }
    },
};

export default meetingService;
