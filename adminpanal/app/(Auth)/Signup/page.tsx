"use client";
import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import User from "@/types/user.type";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { isAxiosError } from "axios";

// Added validation helpers
const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password: string) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
};

const validateMobileNumber = (mobile: string) => {
    // Assumes 10-digit mobile number, adjust regex as needed
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(mobile);
};

const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        mobileno: "",
        magicCode: "", // Added magicCode field
    });

    const [formErrors, setFormErrors] = useState({
        fullname: "",
        email: "",
        password: "",
        mobileno: "",
        magicCode: "", // Added magicCode error
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
            fullname: formData.fullname.trim() ? "" : "Full name is required",
            email: validateEmail(formData.email) ? "" : "Invalid email address",
            password: validatePassword(formData.password)
                ? ""
                : "Password must be at least 8 characters, include uppercase, lowercase, and a number",
            mobileno: validateMobileNumber(formData.mobileno)
                ? ""
                : "Mobile number must be 10 digits",
            magicCode: formData.magicCode === process.env.NEXT_PUBLIC_MAGIC_CODE
                ? ""
                : "Invalid magic code", // Validation for magic code
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
        toast({
            title: "Creating Account",
        })
        setError("");

        try {
            const response = await axios.post<{ data: { user: User, refreshToken: string } }>(
                `${process.env.NEXT_PUBLIC_URL}/Admin/register`,
                formData,
                {
                    withCredentials: true,
                }
            );

            //console.log(response.data.data);
            const { user } = response.data.data;
            const refreshToken = response.data.data.refreshToken;
            localStorage.setItem("refreshToken", refreshToken);
            dispatch(setUser(user));

            toast({
                title: "Account created successfully",
                description: "You have successfully created your account",
            });

            router.push("/");

        } catch (error: unknown) {
            console.error("API Error:", error);

            let errorMessage = "An unexpected error occurred. Please try again.";

            if (isAxiosError(error)) {
                if (error.response) {
                    if (error.response.status === 409) {
                        errorMessage = "User with this email or mobile number already exists.";
                    } else {
                        errorMessage = error.response.data?.errors || "An error occurred during registration.";
                    }
                } else if (error.request) {
                    errorMessage = "No response received from the server. Please try again.";
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            setError(errorMessage);

            toast({
                title: "Error",
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
                  
                    <h3 className="text-2xl font-bold font-inter">Create Admin Account</h3>
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
                        {/* Full Name Input */}
                        <div className="w-full">
                            <label htmlFor="fullname" className="block text-sm font-medium text-[#000000]">
                                Full Name<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                id="fullname"
                                className={`mt-1 w-full p-3 border rounded-lg bg-white ${formErrors.fullname
                                    ? 'border-red-500'
                                    : 'border-black'
                                    }`}
                                required
                                value={formData.fullname}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {formErrors.fullname && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.fullname}</p>
                            )}
                        </div>

                        {/* Email Input */}
                        <div className="w-full">
                            <label htmlFor="email" className="block text-sm font-medium text-[#000000]">
                                Email<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                className={`mt-1 w-full p-3 border rounded-lg bg-white ${formErrors.email
                                    ? 'border-red-500'
                                    : 'border-black'
                                    }`}
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {formErrors.email && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
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

                        {/* Mobile Number Input */}
                        <div className="w-full">
                            <label htmlFor="mobileno" className="block text-sm font-medium text-[#000000]">
                                Mobile Number<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="tel"
                                id="mobileno"
                                className={`mt-1 w-full p-3 border rounded-lg bg-white ${formErrors.mobileno
                                    ? 'border-red-500'
                                    : 'border-black'
                                    }`}
                                required
                                value={formData.mobileno}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {formErrors.mobileno && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.mobileno}</p>
                            )}
                        </div>

                        {/* Magic Code Input */}
                        <div className="w-full">
                            <label htmlFor="magicCode" className="block text-sm font-medium text-[#000000]">
                                Magic Code<span className="text-red-500"> *</span>
                            </label>
                            <input
                                type="text"
                                id="magicCode"
                                className={`mt-1 w-full p-3 border rounded-lg bg-white ${formErrors.magicCode
                                    ? 'border-red-500'
                                    : 'border-black'
                                    }`}
                                required
                                value={formData.magicCode}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            {formErrors.magicCode && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.magicCode}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 text-white bg-custom-red rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                    </form>
                    <hr className="h-[1px] w-full bg-[#E5E5E5]" />
                    <Link href="/Login" className="font-inter w-full text-center gap-2 text-lg">
                        Already have an account?{" "}
                        <span className="font-inter text-lg text-[#A11D25] cursor-pointer">Log in</span>
                    </Link>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-1/3 hidden lg:flex flex-col justify-center items-start">
                <Image
                    src={"https://res.cloudinary.com/djwzwq4cu/image/upload/v1739719891/utyzinvxayebtrt5vugc.jpg"}
                    height={800}
                    width={800}
                    alt="Signup Pls"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default SignupPage;