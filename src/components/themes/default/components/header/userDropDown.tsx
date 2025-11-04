"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccessToken, signOut, verify_token } from "@src/actions";
import { useUser } from "@hooks/use-user";
import { Icon } from "@iconify/react";
import useLocale from "@hooks/useLocale";
import useDictionary from "@hooks/useDict";
import { toast } from "react-toastify";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { user, checkSession } = useUser();
  const [isRTL, setIsRTL] = useState(false);
  const { locale } = useLocale();
    const { data: dict } = useDictionary(locale as any);
// useEffect(()=>{
//   const clearAccessToken = () => {
//   document.cookie =
//     "access-token=; path=/; domain=.toptiertravel.vip; expires=Thu, 01 Jan 1970 00:00:00 GMT";
// };
//   if(user){
// clearAccessToken()
//   }
// },[user])

  useEffect(() => {
    try {
      const d =
        document?.dir || document?.documentElement.getAttribute("dir") || "";
      const lang = document?.documentElement.getAttribute("lang") || "";

      setIsRTL(
        d.toLowerCase() === "rtl" || lang.toLowerCase().startsWith("ar")
      );
    } catch {
      setIsRTL(false);
    }
  }, []);

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    await checkSession?.();
    toast.success("Logged out successfully");
    router.push("/");
  };

const defaultImage =
  user?.profile_photo && user.profile_photo !== null
    ? user.profile_photo
    : "https://images.unsplash.com/photo-1633332755192-727a05c4013d";

  // Safe URL resolver for profile photos
  const getValidSrc = (src?: string) => {
    try {
      if (src && src.trim() !== "") {
        if (src.startsWith("/")) {
          return `${process.env.NEXT_PUBLIC_BASE_URL || ""}${src}`;
        }
        new URL(src); // throws if invalid absolute URL
        return src;
      }
    } catch {
      return defaultImage;
    }
    return defaultImage;
  };
const handleDashboardClick =async() =>{
     if (!user) return;
      (async () => {
        try {
          const verify_response = await verify_token();
          if (!verify_response?.status) {
            toast.error('token not verifying something went wrong')
            router.push("/auth/login");
            return;
          }
          if (user.user_type === "Customer") {
            router.push("/dashboard");
          } else if (user.user_type === "Agent") {

            const token = await getAccessToken();
            const url = `https://toptier-agent-d-ua92.vercel.app/?token=${encodeURIComponent(
              token
            )}&user_id=${user.user_id}`;
            window.location.href = url;
          }
           else {
            router.push("/auth/login");
          }
        } catch {
          console.log('some thing went wrong ')
        }
      })();
}
const handleProfiledClick =async() =>{
     if (!user) return;
      (async () => {
        try {
          const verify_response = await verify_token();
          if (!verify_response?.status) {
            router.push("/auth/login");
            return;
          }
          if (user.user_type === "Customer") {
            router.push("/profile");
          } else if (user.user_type === "Agent") {
            const token = await getAccessToken();
            const url = `https://toptier-agent-d-ua92.vercel.app/settings?token=${encodeURIComponent(
              token
            )}&user_id=${user.user_id}`;
            window.location.href = url;
          } else {
            router.push("/auth/login");
          }
        } catch {
        console.log('something went wrong')
        }
      })();
}
  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Profile Image (toggle button) */}
      <Image
        src={defaultImage as string}
        alt="User"
        width={40}
        height={40}
        className="h-10 w-10 cursor-pointer rounded-full ms-4 object-cover"
        onClick={() => setOpen((prev) => !prev)}
      />

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute ${
            isRTL ? "left-10 md:left-0" : "right-10 md:right-0"
          } h-auto w-52 md:w-75 mt-2 rounded-md border border-gray-200 bg-white shadow-lg`}
        >
          <ul className="py-2 px-2 space-y-2">
            {/* My Profile (Customer only) */}
            {/* {user?.user_type === "Customer" && ( */}
              <li>
                <button
                  // href="/profile"
                  onClick={handleProfiledClick}
                  className="flex items-center w-full cursor-pointer gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  <Image
                  src={defaultImage as string}
                    alt="User Avatar"
                    width={28}
                    height={28}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-[15px] font-base font-medium">
                    {dict?.header?.myprofile || "My Profile"}
                  </span>
                </button>
              </li>
            {/* )} */}

            {/* Dashboard */}
            <li>
              <button
                // href="/dashboard"
                onClick={handleDashboardClick}
                className="flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                <Icon
                  icon="lucide:layout-dashboard"
                  className="font-light text-gray-500"
                  width="24"
                  height="24"
                />
                <span className="text-[15px] font-base font-medium">
                   {dict?.header?.dashboard || "Dashboard"}
                </span>
              </button>
            </li>

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className="flex w-full items-center cursor-pointer gap-4 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-lg transition text-left"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 4.5C12.953 3.407 12.815 2.71 12.402 2.174C12.2423 1.96591 12.0561 1.77966 11.848 1.62C11.038 1 9.863 1 7.513 1H7.012C4.178 1 2.761 1 1.88 1.879C1 2.757 1 4.172 1 7V14C1 16.828 1 18.243 1.88 19.121C2.76 19.999 4.178 20 7.012 20H7.512C9.863 20 11.038 20 11.848 19.38C12.0573 19.2193 12.242 19.0347 12.402 18.826C12.815 18.29 12.953 17.593 13 16.5M19 10.5H7M16.5 14C16.5 14 20 11.422 20 10.5C20 9.578 16.5 7 16.5 7"
                    stroke="#112233"
                    strokeOpacity="0.6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="text-[15px] font-base font-medium">
                  {dict?.header?.logout || "Logout"}
                </span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
