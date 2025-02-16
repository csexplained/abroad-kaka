"use client";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <h1 className="text-2xl font-bold mb-6">Admin Management</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">                    
                    <Link href="/adduniversity" className="px-6 py-3 text-center bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
                       Add University
                    </Link>
                    <Link href="/universities" className="px-6 py-3 text-center bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
                       Show All University
                    </Link>
                </div>
            </div>
        </>
    );
}
