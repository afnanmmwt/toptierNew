"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@src/actions";
import { useUser } from "@hooks/use-user";
import { Icon } from "@iconify/react";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { user, checkSession } = useUser();

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
// console.log(user)
  const handleLogout =async () => {
    // add your logout logic here (clear token, call API, etc.)

          await signOut();
          await checkSession?.();
          router.refresh();
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Profile Image (toggle button) */}
      <Image
        src={
    typeof user?.profile_photo === "string" && user.profile_photo.trim() !== ""
      ? user.profile_photo
      : "https://images.unsplash.com/photo-1633332755192-727a05c4013d"
  }
        alt="User"
        width={40}
        height={40}
        className="h-10 w-10 cursor-pointer rounded-full object-cover"
        onClick={() => setOpen((prev) => !prev)}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 h-auto w-57 md:w-75 mt-2 rounded-md border border-gray-200 bg-white shadow-lg">
          <ul className="py-2 px-2 space-y-2">
            {/* My Profile */}
            <li>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3  text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                <Image
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d"
                  alt="User Avatar"
                  width={28}
                  height={28}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="text-[15px] font-base font-medium">My Profile</span>
              </Link>
            </li>

            {/* My Bookings */}
            {/* <li>
              <Link
                href="/bookings"
                className="flex items-center gap-4 px-4 py-3  text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >

<svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 8.11111C1 4.75911 1 3.08267 2.04178 2.04178C3.08356 1.00089 4.75911 1 8.11111 1H9.88889C13.2409 1 14.9173 1 15.9582 2.04178C16.9991 3.08356 17 4.75911 17 8.11111V11.6667C17 15.0187 17 16.6951 15.9582 17.736C14.9164 18.7769 13.2409 18.7778 9.88889 18.7778H8.11111C4.75911 18.7778 3.08267 18.7778 2.04178 17.736C1.00089 16.6942 1 15.0187 1 11.6667V8.11111Z" stroke="#112233" stroke-opacity="0.6" stroke-width="1.5"/>
<path d="M5.44446 8.11115H12.5556M5.44446 11.6667H9.8889" stroke="#112233" stroke-opacity="0.6" stroke-width="1.5" stroke-linecap="round"/>
</svg>
                <span className="text-[15px] font-base font-medium">My Bookings</span>
              </Link>
            </li> */}
              <li>
              <Link
                href="/dashboard"
                className="flex items-center gap-4 px-4 py-3  text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >

{/* <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 8.11111C1 4.75911 1 3.08267 2.04178 2.04178C3.08356 1.00089 4.75911 1 8.11111 1H9.88889C13.2409 1 14.9173 1 15.9582 2.04178C16.9991 3.08356 17 4.75911 17 8.11111V11.6667C17 15.0187 17 16.6951 15.9582 17.736C14.9164 18.7769 13.2409 18.7778 9.88889 18.7778H8.11111C4.75911 18.7778 3.08267 18.7778 2.04178 17.736C1.00089 16.6942 1 15.0187 1 11.6667V8.11111Z" stroke="#112233" stroke-opacity="0.6" stroke-width="1.5"/>
<path d="M5.44446 8.11115H12.5556M5.44446 11.6667H9.8889" stroke="#112233" stroke-opacity="0.6" stroke-width="1.5" stroke-linecap="round"/>
</svg> */}
<Icon icon="lucide:layout-dashboard" className="font-light text-gray-500" width="24" height="24" />
                <span className="text-[15px] font-base font-medium">Dashbaord</span>
              </Link>
            </li>
            {/* Settings */}
            <li>
              {/* <Link
                href="/settings"
                className="flex items-center gap-4 px-4 py-3  text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
              <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.4282 14C12.0851 14 13.4282 12.6569 13.4282 11C13.4282 9.34315 12.0851 8 10.4282 8C8.77137 8 7.42822 9.34315 7.42822 11C7.42822 12.6569 8.77137 14 10.4282 14Z" stroke="#112233" stroke-opacity="0.6" stroke-width="1.5"/>
<path d="M12.1932 1.152C11.8262 1 11.3602 1 10.4282 1C9.49618 1 9.03018 1 8.66318 1.152C8.42037 1.25251 8.19974 1.3999 8.01391 1.58572C7.82808 1.77155 7.6807 1.99218 7.58019 2.235C7.48819 2.458 7.45118 2.719 7.43718 3.098C7.43067 3.37193 7.35479 3.63973 7.21663 3.87635C7.07846 4.11298 6.88254 4.31069 6.64718 4.451C6.40799 4.58477 6.13877 4.65567 5.86472 4.65707C5.59066 4.65847 5.32073 4.59032 5.08018 4.459C4.74418 4.281 4.50118 4.183 4.26018 4.151C3.7345 4.08187 3.20288 4.22431 2.78219 4.547C2.46819 4.79 2.23418 5.193 1.76818 6C1.30218 6.807 1.06818 7.21 1.01718 7.605C0.98282 7.86545 1.0001 8.13012 1.06805 8.38389C1.136 8.63767 1.25328 8.87556 1.41318 9.084C1.56118 9.276 1.76818 9.437 2.08918 9.639C2.56218 9.936 2.86619 10.442 2.86619 11C2.86619 11.558 2.56218 12.064 2.08918 12.36C1.76818 12.563 1.56018 12.724 1.41318 12.916C1.25328 13.1244 1.136 13.3623 1.06805 13.6161C1.0001 13.8699 0.98282 14.1345 1.01718 14.395C1.06918 14.789 1.30218 15.193 1.76718 16C2.23418 16.807 2.46719 17.21 2.78219 17.453C2.99062 17.6129 3.22852 17.7302 3.48229 17.7981C3.73606 17.8661 4.00073 17.8834 4.26119 17.849C4.50119 17.817 4.74418 17.719 5.08018 17.541C5.32073 17.4097 5.59066 17.3415 5.86472 17.3429C6.13877 17.3443 6.40799 17.4152 6.64718 17.549C7.13018 17.829 7.41718 18.344 7.43718 18.902C7.45118 19.282 7.48719 19.542 7.58019 19.765C7.6807 20.0078 7.82808 20.2284 8.01391 20.4143C8.19974 20.6001 8.42037 20.7475 8.66318 20.848C9.03018 21 9.49618 21 10.4282 21C11.3602 21 11.8262 21 12.1932 20.848C12.436 20.7475 12.6566 20.6001 12.8425 20.4143C13.0283 20.2284 13.1757 20.0078 13.2762 19.765C13.3682 19.542 13.4052 19.282 13.4192 18.902C13.4392 18.344 13.7262 17.828 14.2092 17.549C14.4484 17.4152 14.7176 17.3443 14.9917 17.3429C15.2657 17.3415 15.5356 17.4097 15.7762 17.541C16.1122 17.719 16.3552 17.817 16.5952 17.849C16.8556 17.8834 17.1203 17.8661 17.3741 17.7981C17.6278 17.7302 17.8657 17.6129 18.0742 17.453C18.3892 17.211 18.6222 16.807 19.0882 16C19.5542 15.193 19.7882 14.79 19.8392 14.395C19.8735 14.1345 19.8563 13.8699 19.7883 13.6161C19.7204 13.3623 19.6031 13.1244 19.4432 12.916C19.2952 12.724 19.0882 12.563 18.7672 12.361C18.5331 12.2184 18.339 12.0187 18.2032 11.7807C18.0673 11.5427 17.994 11.2741 17.9902 11C17.9902 10.442 18.2942 9.936 18.7672 9.64C19.0882 9.437 19.2962 9.276 19.4432 9.084C19.6031 8.87556 19.7204 8.63767 19.7883 8.38389C19.8563 8.13012 19.8735 7.86545 19.8392 7.605C19.7872 7.211 19.5542 6.807 19.0892 6C18.6222 5.193 18.3892 4.79 18.0742 4.547C17.8657 4.38709 17.6278 4.26981 17.3741 4.20187C17.1203 4.13392 16.8556 4.11664 16.5952 4.151C16.3552 4.183 16.1122 4.281 15.7752 4.459C15.5348 4.59014 15.265 4.6582 14.9912 4.6568C14.7173 4.6554 14.4483 4.58459 14.2092 4.451C13.9738 4.31069 13.7779 4.11298 13.6397 3.87635C13.5016 3.63973 13.4257 3.37193 13.4192 3.098C13.4052 2.718 13.3692 2.458 13.2762 2.235C13.1757 1.99218 13.0283 1.77155 12.8425 1.58572C12.6566 1.3999 12.436 1.25251 12.1932 1.152Z" stroke="#112233" stroke-opacity="0.6" stroke-width="1.5"/>
</svg>

                <span className="text-[15px] font-base font-medium">Settings</span>
              </Link> */}
            </li>

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className="flex w-full items-center cursor-pointer gap-4 px-4 py-3  text-gray-500 hover:bg-gray-100 rounded-lg transition text-left"
              >
               <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13 4.5C12.953 3.407 12.815 2.71 12.402 2.174C12.2423 1.96591 12.0561 1.77966 11.848 1.62C11.038 1 9.863 1 7.513 1H7.012C4.178 1 2.761 1 1.88 1.879C1 2.757 1 4.172 1 7V14C1 16.828 1 18.243 1.88 19.121C2.76 19.999 4.178 20 7.012 20H7.512C9.863 20 11.038 20 11.848 19.38C12.0573 19.2193 12.242 19.0347 12.402 18.826C12.815 18.29 12.953 17.593 13 16.5M19 10.5H7M16.5 14C16.5 14 20 11.422 20 10.5C20 9.578 16.5 7 16.5 7" stroke="#112233" stroke-opacity="0.6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

                <span className="text-[15px] font-base font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
