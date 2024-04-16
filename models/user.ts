import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
    },
    encryptedPassword: {
        type: String,
        required: true,
    },
    avatar: String,
    team: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Team',
        },
    ],
});

const UserModel = model('User', userSchema);

export default UserModel;
