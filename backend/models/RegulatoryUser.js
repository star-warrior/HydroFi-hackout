const mongoose = require('mongoose');

const RegulatoryUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'regulatory',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const RegulatoryUser = mongoose.model('RegulatoryUser', RegulatoryUserSchema);

module.exports = RegulatoryUser;