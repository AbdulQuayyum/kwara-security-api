import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    emailAddress: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    state: { type: String, required: true },
    lga: { type: String, required: true },
    ward: { type: String, required: true },
    community: { type: String, required: true },
    nin: { type: Number, required: true, unique: true },
    phoneNumber: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: null }
});

const UserSchema = mongoose.model('User', schema);

export default UserSchema;
