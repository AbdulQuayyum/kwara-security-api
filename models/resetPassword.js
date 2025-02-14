import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    phoneNumber: { type: String, required: true, unique: true },
    token: { type: String, required: true, unique: true },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const ResetPasswordSchema = mongoose.model('ResetPassword', schema);

export default ResetPasswordSchema;
