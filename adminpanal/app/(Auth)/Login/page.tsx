"use client"
import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { isAxiosError } from "axios";
import User from "@/types/user.type";

// Validation helpers
const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateMobileNumber = (mobile: string) => {
    // Adjust regex as needed for your specific mobile number format
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
};

const LoginPage = () => {
    const [formData, setFormData] = useState({
        login: "", // Changed from fullName to login (can be email or mobile)
        password: "",
    });

    const [formErrors, setFormErrors] = useState({
        login: "",
        password: "",
    });

    const router = useRouter();
    const { toast } = useToast();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));

        // Clear previous error when user starts typing
        if (formErrors[id as keyof typeof formErrors]) {
            setFormErrors((prev) => ({
                ...prev,
                [id]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            login: formData.login
                ? (validateEmail(formData.login) || validateMobileNumber(formData.login)
                    ? ""
                    : "Please enter a valid email or mobile number")
                : "Email or mobile number is required",
            password: formData.password.length >= 8
                ? ""
                : "Password must be at least 8 characters",
        };

        setFormErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== "");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.post<{ data: { user: User, refreshToken: string } }>(
                `${process.env.NEXT_PUBLIC_URL}/Admin/login`,
                {
                    mobileno: formData.login,
                    email: formData.login,
                    password: formData.password,
                },
                {
                    withCredentials: true,
                }
            );

            console.log(response.data.data);
            const { user } = response.data.data;
            const refreshToken = response.data.data.refreshToken;
            localStorage.setItem("refreshToken", refreshToken);

            dispatch(setUser(user));
            toast({
                title: "Login Successful",
                description: "You have successfully logged in",
            });

            // Redirect to dashboard or home page
            router.push("/");
        } catch (error: unknown) {
            console.error("API Error:", error);

            let errorMessage = "An unexpected error occurred. Please try again.";

            if (isAxiosError(error)) {
                if (error.response) {
                    if (error.response.status === 401) {
                        errorMessage = "Invalid credentials. Please try again.";
                    } else {
                        errorMessage = error.response.data?.errors || "An error occurred during login.";
                    }
                } else if (error.request) {
                    errorMessage = "No response received from the server. Please check your connection.";
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            setError(errorMessage);

            toast({
                title: "Login Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col lg:flex-row justify-center items-center w-full">
            {/* Left Section */}
            <div className="w-full lg:w-1/2 py-8 px-4 lg:px-16 gap-8 flex flex-col justify-center items-center">
                <div className="w-full max-w-[470px] gap-8 flex flex-col justify-center items-start">
                    
                    <h3 className="text-2xl font-bold font-inter">Admin Panal Login</h3>

                    {error && (
                        <div className="w-full p-3 bg-red-100 text-red-600 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form
                        className="gap-6 flex justify-center items-start flex-col w-full"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        {/* Login Input (Email or Mobile) */}
                        <div className="w-full">
                            <label htmlFor="login" className="block text-sm font-medium text-[#000000]">
                                Email or Mobile Number<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                id="login"
                                placeholder="Enter email or mobile number"
                                className={`mt-1 w-full p-3 border rounded-lg bg-white ${formErrors.login
                                    ? 'border-red-500'
                                    : 'border-black'
                                    }`}
                                required
                                value={formData.login}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {formErrors.login && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.login}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="w-full">
                            <label htmlFor="password" className="block text-sm font-medium text-[#000000]">
                                Password<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                className={`mt-1 w-full p-3 border rounded-lg bg-white ${formErrors.password
                                    ? 'border-red-500'
                                    : 'border-black'
                                    }`}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {formErrors.password && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 text-white bg-custom-red rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Logging In..." : "Submit"}
                        </button>
                    </form>
                    <hr className="h-[1px] w-full bg-[#E5E5E5]" />
                    <Link href="/Signup" className="font-inter w-full text-center gap-2 text-lg">
                        Don't have an account?{" "}
                        <span className="font-inter text-lg text-[#A11D25] cursor-pointer">Sign up now</span>
                    </Link>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-1/3 hidden lg:flex flex-col justify-center items-start">
                <Image
                    src={"https://res.cloudinary.com/djwzwq4cu/image/upload/v1739719891/utyzinvxayebtrt5vugc.jpg"}
                    height={800}
                    width={800}
                    alt="Login Illustration"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default LoginPage;