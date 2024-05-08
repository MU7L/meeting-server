import { isDocument } from '@typegoose/typegoose';
import { TeamModel, UserModel } from '../models';
import { MemberType } from '../models/Team';
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
                    status: MemberType.MENTOR,
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
        await TeamModel.findByIdAndUpdate(tid, {
            $push: { members: { user: uid, status: MemberType.NEW } },
        });
    },

    /** 同意将用户加入课题组 */
    async addMember(tid: string, uid: string) {
        const userDoc = await UserModel.findById(uid);
        if (!userDoc) throw new CustomError('用户不存在', 404);
        const teamDoc = await TeamModel.findByIdAndUpdate(
            tid,
            {
                $set: { 'members.$.role': MemberType.MEMBER },
            },
            { new: true },
        );
        if (!teamDoc) throw new Error('课题组不存在', { cause: 404 });
        userDoc.teams.push(teamDoc.id);
        await teamDoc.save();
    },
};

export default teamService;
