import { isDocument } from '@typegoose/typegoose';
import { TeamModel, UserModel } from '../models';
import { MemberType } from '../models/team';
import CustomError from '../utils/error';

const teamService = {
    /** 创建课题组 */
    async create({
        name,
        description,
        mentorId,
    }: {
        name: string;
        description?: string;
        mentorId: string;
    }) {
        const userDoc = await UserModel.findById(mentorId);
        if (!userDoc) throw new Error('用户不存在', { cause: 404 });
        const teamDoc = await TeamModel.create({
            name,
            description,
            mentor: mentorId,
            members: [
                {
                    user: mentorId,
                    type: MemberType.MENTOR,
                },
            ],
        });
        userDoc.teams.push(teamDoc.id);
        await userDoc.save();
        return teamDoc;
    },

    /** 查找课题组 */
    async find({
        tid,
        name,
        mentorName,
        mentorEmail,
    }: Partial<{
        tid: string;
        name: string;
        mentorName: string;
        mentorEmail: string;
    }>) {
        if (tid || name) {
            return await TeamModel.find({
                $or: [{ _id: tid }, { name }],
            })
                .select('-members')
                .populate({
                    path: 'mentor',
                    select: '-teams -meetings',
                });
        } else {
            const userDoc = await UserModel.findOne({
                $or: [{ name: mentorName }, { email: mentorEmail }],
            })
                .select('teams')
                .populate({
                    path: 'teams',
                    select: '-members',
                    populate: {
                        path: 'mentor',
                        select: '-teams -meetings',
                    },
                });
            if (!userDoc) throw new CustomError('用户不存在', 404);
            return userDoc.teams.filter(
                team => isDocument(team) && team.mentor._id.equals(userDoc._id),
            );
        }
    },

    /** 请求加入 */
    async join(tid: string, uid: string) {
        const teamDoc = await TeamModel.findById(tid);
        if (!teamDoc) throw new CustomError('课题组不存在', 404);
        const member = teamDoc.members.find(member =>
            member.user._id.equals(uid),
        );
        if (member) {
            if (member.type === MemberType.NEW)
                throw new CustomError('用户已申请加入课题组', 400);
            else throw new CustomError('用户已加入课题组', 400);
        }
        await TeamModel.findByIdAndUpdate(tid, {
            $push: { members: { user: uid, status: MemberType.NEW } },
        });
    },

    /** 同意将用户加入课题组 */
    async addMember(tid: string, uid: string) {
        const userDoc = await UserModel.findById(uid);
        if (!userDoc) throw new CustomError('用户不存在', 404);
        const teamDoc = await TeamModel.findById(tid);
        if (!teamDoc) throw new CustomError('课题组不存在', 404);
        const userDocinTeam = teamDoc.members.find(member =>
            member.user._id.equals(uid),
        );
        if (!userDocinTeam) throw new CustomError('无申请记录', 404);
        // 更新课题组数据
        if (userDocinTeam.type !== MemberType.NEW)
            throw new CustomError('用户已加入课题组', 400);
        userDocinTeam.type = MemberType.MEMBER;
        await teamDoc.save();
        // 同步用户数据
        userDoc.teams.push(teamDoc._id);
        await userDoc.save();
    },
};

export default teamService;
