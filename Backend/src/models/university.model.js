import mongoose, { Schema } from "mongoose";

const universitySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        logo: {
            type: String,
            required: false,
            trim: true,
        },
        cords: {
            type: String,
            required: true,
            trim: true,
        },
        images: [
            {
                type: String,
                required: false,
                trim: true,
            }
        ],
        website: {
            type: String,
            required: false,
            trim: true,
        },
        contactEmail: {
            type: String,
            required: false,
            trim: true,
        },
        contactPhone: {
            type: String,
            required: false,
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const University = mongoose.model("University", universitySchema);
