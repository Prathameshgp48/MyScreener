import mongoose from "mongoose"

const TokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    issuedAt: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true })

export const TokenStore = mongoose.model('TokenStore', TokenSchema)


