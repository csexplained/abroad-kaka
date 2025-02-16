"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { Loader2 } from "lucide-react";
import User from "@/types/user.type";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Home() {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true); // 
    const router = useRouter();
    async function getUserState() {
        try {
            const token = localStorage.getItem("refreshToken");
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await axios.post<{ data: { data: User; refreshToken: string } }>(
                `${process.env.NEXT_PUBLIC_URL}/Admin/refreashtoken`,
                { refreshToken: token },
                { withCredentials: true }
            );

            console.log(response.data.data);
            const { data } = response.data.data;
            const refreshToken = response.data.data.refreshToken;
            localStorage.setItem("refreshToken", refreshToken);

            dispatch(setUser(data));
            router.push("/dashboard");
        } catch (error) {
            router.push("/Login");
            console.error("Error fetching user state:", error);
        } finally {
            setLoading(false); // Ensure loading is set to false after fetching
        }
    }

    useEffect(() => {
        getUserState();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-green-700" />
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <h1 className="text-2xl font-bold mb-6">Admin Management</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <Link href="/Login" className="px-6 w-full text-center py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
                        Login
                    </Link>
                    <Link className="px-6 py-3 w-full text-center bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600" href={"/Signup"}>
                        Signup
                    </Link>

                </div>
            </div>
        </>
    );
}
