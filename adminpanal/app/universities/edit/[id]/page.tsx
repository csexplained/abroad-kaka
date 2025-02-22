"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";
import Image from "next/image";
import { X } from "lucide-react";

interface UniversityFormData {
    name: string;
    country: string;
    city: string;
    address: string;
    cords: string;
    description: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
}

interface FileState {
    logo?: File[];
    images?: File[];
}

const EditUniversityPage = () => {
    const [formData, setFormData] = useState<UniversityFormData>({
        name: "",
        country: "",
        city: "",
        address: "",
        cords: "",
        description: "",
        website: "",
        contactEmail: "",
        contactPhone: "",
    });

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [existingLogo, setExistingLogo] = useState<string>("");
    const [files, setFiles] = useState<FileState>({});
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof UniversityFormData, string>>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fetchingData, setFetchingData] = useState(true);

    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const universityId = params.id;

    useEffect(() => {
        fetchUniversityData();
    }, [universityId]);

    const fetchUniversityData = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_URL}/university/${universityId}`,
                { withCredentials: true }
            );
            const university = response.data.data;

            setFormData({
                name: university.name,
                country: university.country,
                cords: university.cords,
                city: university.city,
                address: university.address,
                description: university.description,
                website: university.website || "",
                contactEmail: university.contactEmail || "",
                contactPhone: university.contactPhone || "",
            });

            if (university.logo) {
                setExistingLogo(university.logo);
            }

            if (university.images) {
                setExistingImages(university.images);
            }
        } catch (error) {
            console.error("Failed to fetch university:", error);
            toast({
                title: "Error",
                description: "Failed to fetch university data",
                variant: "destructive",
            });
        } finally {
            setFetchingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));

        if (formErrors[id as keyof UniversityFormData]) {
            setFormErrors(prev => ({
                ...prev,
                [id]: "",
            }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, files: uploadedFiles } = e.target;
        if (uploadedFiles) {
            setFiles(prev => ({
                ...prev,
                [id]: Array.from(uploadedFiles)
            }));

            // Clear existing files when new ones are selected
            if (id === 'logo') {
                setExistingLogo("");
            }
        }
    };

    const removeExistingImage = (imageUrl: string) => {
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof UniversityFormData, string>> = {};
        const requiredFields: (keyof UniversityFormData)[] = ['name', 'country', 'city', 'address', 'description'];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            }
        });

        if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
            newErrors.contactEmail = "Please enter a valid email address";
        }

        if (formData.website && !/^https?:\/\/\S+\.\S+$/.test(formData.website)) {
            newErrors.website = "Please enter a valid URL";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");

        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) formDataToSend.append(key, value);
        });

        // Add the existing images that weren't removed
        formDataToSend.append('existingImages', JSON.stringify(existingImages));

        // Add existing logo if it wasn't changed
        if (existingLogo) {
            formDataToSend.append('existingLogo', existingLogo);
        }

        // Add new files
        if (files.logo?.[0]) {
            formDataToSend.append('logo', files.logo[0]);
        }

        if (files.images) {
            files.images.forEach(image => {
                formDataToSend.append('images', image);
            });
        }

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_URL}/university/${universityId}`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            toast({
                title: "University Updated",
                description: "University has been successfully updated",
            });

            router.push("/universities");
        } catch (error: unknown) {
            console.error("API Error:", error);

            let errorMessage = "An unexpected error occurred. Please try again.";

            if (isAxiosError(error)) {
                errorMessage = error.response?.data?.message || "Failed to update university";
            }

            setError(errorMessage);

            toast({
                title: "University Update Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading university data...</div>
            </div>
        );
    }


    return (
        <div className="bg-[#FFF9EA] min-h-screen flex justify-center items-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Edit University</h2>

                {error && (
                    <div className="w-full p-3 bg-red-100 text-red-600 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                University Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`mt-1 w-full p-3 border rounded-lg ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                Country <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="country"
                                value={formData.country}
                                onChange={handleChange}
                                className={`mt-1 w-full p-3 border rounded-lg ${formErrors.country ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {formErrors.country && <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>}
                        </div>
                    </div>

                    {/* Location Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={`mt-1 w-full p-3 border rounded-lg ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={`mt-1 w-full p-3 border rounded-lg ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className={`mt-1 w-full p-3 border rounded-lg ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                            disabled={loading}
                        />
                        {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                Website
                            </label>
                            <input
                                type="url"
                                id="website"
                                value={formData.website}
                                onChange={handleChange}
                                className={`mt-1 w-full p-3 border rounded-lg ${formErrors.website ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {formErrors.website && <p className="text-red-500 text-sm mt-1">{formErrors.website}</p>}
                        </div>

                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                id="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                className={`mt-1 w-full p-3 border rounded-lg ${formErrors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={loading}
                            />
                            {formErrors.contactEmail && <p className="text-red-500 text-sm mt-1">{formErrors.contactEmail}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            id="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="cords" className="block text-sm font-medium text-gray-700">
                            Cords for location
                        </label>
                        <input
                            type="tel"
                            id="cords"
                            value={formData.cords}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
                            disabled={loading}
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                        {/* Logo Section */}
                        <div>
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                                University Logo
                            </label>
                            {existingLogo && (
                                <div className="mt-2 relative w-32 h-32">
                                    <Image
                                        src={existingLogo}
                                        alt="Current logo"
                                        fill
                                        className="object-cover rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setExistingLogo("")}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                id="logo"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="mt-2"
                                disabled={loading}
                            />
                        </div>

                        {/* Images Section */}
                        <div>
                            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                                University Images
                            </label>
                            {existingImages.length > 0 && (
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {existingImages.map((image, index) => (
                                        <div key={index} className="relative pt-[100%]">
                                            <Image
                                                src={image}
                                                alt={`University image ${index + 1}`}
                                                fill
                                                className="object-cover rounded absolute top-0 left-0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(image)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                type="file"
                                id="images"
                                onChange={handleFileChange}
                                accept="image/*"
                                multiple
                                className="mt-2"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.push("/universities")}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update University"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUniversityPage