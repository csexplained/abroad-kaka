"use client"
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";

interface UniversityFormData {
    name: string;
    country: string;
    city: string;
    address: string;
    description: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
}

interface FileState {
    logo?: File[];
    images?: File[];
}

const AddUniversityPage = () => {
    const [formData, setFormData] = useState<UniversityFormData>({
        name: "",
        country: "",
        city: "",
        address: "",
        description: "",
        website: "",
        contactEmail: "",
        contactPhone: "",
    });

    const [files, setFiles] = useState<FileState>({});
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof UniversityFormData, string>>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const { toast } = useToast();

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
        }
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

        if (files.logo?.[0]) {
            formDataToSend.append('logo', files.logo[0]);
        }

        if (files.images) {
            files.images.forEach(image => {
                formDataToSend.append('images', image);
            });
        }

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/university`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            toast({
                title: "University Added",
                description: "University has been successfully created",
            });

            router.push("/universities");
        } catch (error: unknown) {
            console.error("API Error:", error);

            let errorMessage = "An unexpected error occurred. Please try again.";

            if (isAxiosError(error)) {
                errorMessage = error.response?.data?.message || "Failed to add university";
            }

            setError(errorMessage);

            toast({
                title: "University Creation Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FFF9EA] min-h-screen flex justify-center items-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Add New University</h2>

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

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                                University Logo
                            </label>
                            <input
                                type="file"
                                id="logo"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                                University Images
                            </label>
                            <input
                                type="file"
                                id="images"
                                onChange={handleFileChange}
                                accept="image/*"
                                multiple
                                className="mt-1 w-full p-3 border border-gray-300 rounded-lg"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 text-white bg-custom-red rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Adding University..." : "Add University"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddUniversityPage;