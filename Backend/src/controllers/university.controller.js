import { University } from "../models/university.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { deletefromcloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/apiresponse.js';

// Create a new university with validation and Cloudinary upload
export const createUniversity = asyncHandler(async (req, res) => {
    const { name, country, city, cords, address, description, website, contactEmail, contactPhone } = req.body;

    if (!name || !country || !city || !address || !description || !cords) {
        throw new ApiError(400, "All required fields must be provided");
    }

    let logoUrl = "";
    let imageUrls = [];

    if (req.files?.logo) {
        const uploadedLogo = await uploadOnCloudinary(req.files.logo[0].path);
        logoUrl = uploadedLogo.secure_url;
    }

    if (req.files?.images) {
        for (const file of req.files.images) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            imageUrls.push(uploadedImage.secure_url);
        }
    }

    const university = await University.create({ name, country, cords, city, address, description, logo: logoUrl, images: imageUrls, website, contactEmail, contactPhone });

    res.status(201).json(new ApiResponse(201, university, "University created successfully"));
});

// Get all universities with pagination and filters
export const getAllUniversities = asyncHandler(async (req, res) => {
    const { country, page = 1, limit = 10 } = req.query;
    const filter = country ? { country } : {};

    const universities = await University.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await University.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, { universities, total }, "Universities fetched successfully"));
});

// Get a single university by ID
export const getUniversityById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const university = await University.findById(id);

    if (!university) {
        throw new ApiError(404, "University not found");
    }
    res.status(200).json(new ApiResponse(200, university, "University fetched successfully"));
});

// Update a university with validation and Cloudinary upload
export const updateUniversity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (!updates.name || !updates.country || !updates.city || !updates.address || !updates.description || !updates.cords) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (req.files?.logo) {
        const uploadedLogo = await uploadOnCloudinary(req.files.logo[0].path);
        updates.logo = uploadedLogo.secure_url;
    }

    if (req.files?.images) {
        updates.images = [];
        for (const file of req.files.images) {
            const uploadedImage = await uploadOnCloudinary(file.path);
            updates.images.push(uploadedImage.secure_url);
        }
    }

    const university = await University.findByIdAndUpdate(id, updates, { new: true });

    if (!university) {
        throw new ApiError(404, "University not found");
    }
    res.status(200).json(new ApiResponse(200, university, "University updated successfully"));
});

// Delete a university
export const deleteUniversity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const university = await University.findByIdAndDelete(id);

    if (!university) {
        throw new ApiError(404, "University not found");
    }
    res.status(200).json(new ApiResponse(200, {}, "University deleted successfully"));
});
