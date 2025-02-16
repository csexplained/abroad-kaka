'use client';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from "@/store";


const Navbar = () => {

  const user = useSelector((state: RootState) => state.user);


  return (
    <>
      <div className="sticky top-0 w-full px-6 md:px-16 lg:px-16 h-[105px] flex justify-between items-center bg-white shadow-md z-50">

        {/* Logo */}
        <Link href={"/dashboard"} className="flex items-center gap-4">
          <Image src={"https://res.cloudinary.com/djwzwq4cu/image/upload/v1739719891/utyzinvxayebtrt5vugc.jpg"} width={200} height={200} alt="logo" className="h-14 sm:h-20 w-auto cursor-pointer" />


        </Link>


        <div className="flex items-center gap-4">


          {/* Icons */}
          <div className='flex gap-4 justify-center items-center'>
            {
              user?.fullname !== "" ? (
                <div className="rounded-full flex justify-center items-center text-white w-10 h-10 bg-green-800">
                  {user?.fullname.slice(0, 2)}
                </div>
              ) : (
                <Link href={"/Login"}>
                  <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer hover:opacity-75 transition-opacity duration-200">
                    <path d="M26.8588 23.7842C24.9323 20.4536 21.9635 18.0654 18.4988 16.9333C20.2126 15.9131 21.5441 14.3585 22.2888 12.5083C23.0336 10.6581 23.1504 8.61461 22.6213 6.6916C22.0923 4.76859 20.9466 3.07242 19.3602 1.86356C17.7739 0.6547 15.8345 0 13.8401 0C11.8456 0 9.90629 0.6547 8.31993 1.86356C6.73357 3.07242 5.58789 4.76859 5.05882 6.6916C4.52976 8.61461 4.64656 10.6581 5.3913 12.5083C6.13605 14.3585 7.46754 15.9131 9.18132 16.9333C5.71666 18.0642 2.74786 20.4524 0.821366 23.7842C0.750718 23.8994 0.703858 24.0276 0.68355 24.1612C0.663242 24.2948 0.669899 24.4311 0.703126 24.5621C0.736353 24.6931 0.795478 24.8161 0.877013 24.9238C0.958548 25.0316 1.06084 25.1219 1.17786 25.1895C1.29487 25.2571 1.42424 25.3006 1.55833 25.3174C1.69241 25.3342 1.8285 25.3239 1.95857 25.2872C2.08863 25.2506 2.21004 25.1882 2.31562 25.1039C2.4212 25.0195 2.50882 24.9149 2.5733 24.7962C4.95644 20.6775 9.16867 18.2185 13.8401 18.2185C18.5115 18.2185 22.7237 20.6775 25.1068 24.7962C25.1713 24.9149 25.2589 25.0195 25.3645 25.1039C25.4701 25.1882 25.5915 25.2506 25.7216 25.2872C25.8516 25.3239 25.9877 25.3342 26.1218 25.3174C26.2559 25.3006 26.3853 25.2571 26.5023 25.1895C26.6193 25.1219 26.7216 25.0316 26.8031 24.9238C26.8847 24.8161 26.9438 24.6931 26.977 24.5621C27.0102 24.4311 27.0169 24.2948 26.9966 24.1612C26.9763 24.0276 26.9294 23.8994 26.8588 23.7842ZM6.75644 9.11097C6.75644 7.70996 7.17189 6.34041 7.95025 5.17551C8.72861 4.01062 9.83492 3.10269 11.1293 2.56655C12.4236 2.0304 13.8479 1.89012 15.222 2.16345C16.5961 2.43677 17.8583 3.11142 18.849 4.10208C19.8396 5.09275 20.5143 6.35493 20.7876 7.72902C21.0609 9.10311 20.9206 10.5274 20.3845 11.8218C19.8484 13.1161 18.9404 14.2224 17.7755 15.0008C16.6106 15.7792 15.2411 16.1946 13.8401 16.1946C11.962 16.1926 10.1614 15.4456 8.83341 14.1176C7.5054 12.7896 6.75845 10.989 6.75644 9.11097Z" fill="black" />
                  </svg>
                </Link>
              )
            }
          </div>

        </div>
      </div >
    </>
  );
};

export default Navbar;