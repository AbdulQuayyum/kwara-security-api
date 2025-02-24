import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    userID: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    isViewed: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    time: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

schema.index({ userID: 1, time: -1 });

const CaseSchema = mongoose.model('Case', schema);

export default CaseSchema;
