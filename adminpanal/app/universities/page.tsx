"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, ExternalLink, Images } from "lucide-react";
import Image from "next/image";

interface University {
    _id: string;
    name: string;
    country: string;
    city: string;
    address: string;
    description: string;
    logo?: string;
    images?: string[];
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    statusCode: number;
    data: {
        universities: University[];
        total: number;
    };
    message: string;
    success: boolean;
}

const UniversitiesPage = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            const response = await axios.get<ApiResponse>(
                `${process.env.NEXT_PUBLIC_URL}/university`,
                { withCredentials: true }
            );
            setUniversities(response.data.data.universities);
            setTotal(response.data.data.total);
        } catch (error) {
            console.error("Failed to fetch universities:", error);
            setError("Failed to load universities");
            toast({
                title: "Error",
                description: "Failed to load universities",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/universities/edit/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this university?")) {
            return;
        }

        setDeleteLoading(id);
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_URL}/university/${id}`,
                { withCredentials: true }
            );

            setUniversities(prevUniversities =>
                prevUniversities.filter(university => university._id !== id)
            );
            setTotal(prev => prev - 1);

            toast({
                title: "Success",
                description: "University deleted successfully",
            });
        } catch (error) {
            console.error("Failed to delete university:", error);
            toast({
                title: "Error",
                description: "Failed to delete university",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading universities...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFF9EA] p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Universities</h1>
                        <p className="text-gray-600 mt-1">Total: {total} universities</p>
                    </div>
                    <button
                        onClick={() => router.push('/adduniversity')}
                        className="flex items-center gap-2 px-4 py-2 bg-custom-red text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Plus size={20} />
                        Add University
                    </button>
                </div>

                {error ? (
                    <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {universities.map(university => (
                        <div
                            key={university._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            {/* University Logo */}
                            <div className="relative h-48 bg-gray-200">
                                {university.logo ? (
                                    <Image
                                        src={university.logo}
                                        alt={`${university.name} logo`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500">
                                        No logo available
                                    </div>
                                )}
                            </div>

                            {/* University Information */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold">{university.name}</h2>
                                    {university.images && university.images.length > 0 && (
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Images size={16} />
                                            <span className="text-sm">{university.images.length}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-gray-600">
                                        <strong>Location:</strong> {university.city}, {university.country}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>Address:</strong> {university.address}
                                    </p>
                                    <p className="text-gray-600 line-clamp-3">
                                        <strong>Description:</strong> {university.description}
                                    </p>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-2 mb-4">
                                    {university.website && (
                                        <a
                                            href={university.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:underline"
                                        >
                                            <ExternalLink size={16} />
                                            Website
                                        </a>
                                    )}
                                    {university.contactEmail && (
                                        <p className="text-gray-600">
                                            <strong>Email:</strong>{" "}
                                            <a
                                                href={`mailto:${university.contactEmail}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {university.contactEmail}
                                            </a>
                                        </p>
                                    )}
                                    {university.contactPhone && (
                                        <p className="text-gray-600">
                                            <strong>Phone:</strong> {university.contactPhone}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleEdit(university._id)}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        <Pencil size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(university._id)}
                                        disabled={deleteLoading === university._id}
                                        className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        {deleteLoading === university._id ? (
                                            "Deleting..."
                                        ) : (
                                            <>
                                                <Trash2 size={16} />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {universities.length === 0 && !error && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No universities found</p>
                        <p className="text-gray-500 mt-2">Click the Add University button to create one</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UniversitiesPage;