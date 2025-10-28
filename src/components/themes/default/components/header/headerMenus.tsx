"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
// import Button from "@components/core/button";
import HeaderLogo from "@components/themes/layout/components/common/headerLogo";
import { useUser } from "@hooks/use-user";
// import Alert from "@components/core/alert";
// import { signOut } from "@src/actions";
// import { Router } from "next/router";
import Dropdown from "@components/core/Dropdown";

import ProfileDropdown from "./userDropDown";
import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";
import { useAppSelector } from "@lib/redux/store";



const HeaderMenus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any) as any;
  // const router=Router()
  const {cms , modules} = useAppSelector((state) => state.appData?.data)
  const headerPages = cms?.filter((page: any) => page.name === 'Header')
 const filteredModules = modules.filter(
  (item:any, index:number, self:any) =>
    index === self.findIndex((m:any) => m.type === item.type)
);

  return (
    <header className="w-full  max-w-[1200px] mx-auto overflow-visible">
      <div className="flex items-center justify-between h-22 appHorizantalSpacing">
        {/* Left: Logo + Menu */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold pt-1.5 text-blue-800">
            <HeaderLogo imgClass='w-32' />
          </Link>
          {/* Desktop Menu */}
         <nav className="text-[16px] pt-1.5">
      <div className="hidden md:flex items-center gap-8 text-gray-700 ">
       {filteredModules?.map((item:any, index:number) => (
       <Link
        key={index}
        href={`/${item.type}`}
        target={""}
        className="text-[#11223399] text-base hover:text-blue-700 transition-colors duration-200 ease-in-out"
      >
       <h3 className="text-base font-medium text-gray-800 mb-4">{item.type}</h3>
      </Link>
    ))}
    {headerPages?.map((item:any, index:number) => (
      <Link
        key={index}
        href={`/page/${item.slug_url}`}
        target={""}
        className="text-[#11223399] text-base hover:text-blue-700 transition-colors duration-200 ease-in-out"
      >
       <h3 className="text-base font-medium text-gray-800 mb-4">{item.page_name}</h3>
      </Link>
    ))}


  </div>
</nav>

        </div>
        {/* Right: Auth Buttons - Desktop Only */}
        {!(user ) ? <div className="hidden md:flex items-center gap-3">

           <Dropdown
        label={
          <div className="flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000"
              className="pe-1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {dict?.header?.agents || "Agents"}
            {/* <ChevronDown className="w-4 h-4" /> */}
          </div>
        }
      >
        <div className="flex flex-col">
          <Link
            href="https://toptier-agent-d-kwk7.vercel.app/login"
            target=""
            className="block text-sm font-medium rounded-xl px-4 py-2 text-gray-700 hover:bg-blue-50"
          >
            {dict?.header?.login || "Login"}
          </Link>
          <Link
            href="https://toptier-agent-d-kwk7.vercel.app/signup"
            target=""
            className="block text-sm font-medium rounded-xl px-4 py-2 text-gray-700 hover:bg-blue-50"
          >
            {dict?.header?.signup || "Signup"}
          </Link>
        </div>
      </Dropdown>

      {/* ===== Customers Dropdown ===== */}
      <Dropdown
        buttonClassName=""
        label={
          <div className="flex items-center gap-1.5">
            <svg
              stroke="#000"
              className="pe-1"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            {dict?.header?.customers || "Customers"}
            {/* <ChevronDown className="w-4 h-4" /> */}
          </div>
        }
      >
        <div className="flex flex-col">
          <Link
            href="/auth/login"
            className="block text-sm font-medium rounded-xl px-4 py-2 text-gray-700 hover:bg-blue-50"
          >
            {dict?.header?.login || "Login"}
          </Link>
          <Link
            href="/auth/signup"
            className="block text-sm font-medium rounded-xl px-4 py-2 text-gray-700 hover:bg-blue-50"
          >
            {dict?.header?.signup || "Signup"}
          </Link>
        </div>
      </Dropdown>
        </div> :
        <div className="hidden md:block">
          <ProfileDropdown/>
          </div>
        }

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Icon
            icon={isOpen ? "mdi:close" : "mdi:menu"}
            width={28}
            height={28}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? "translate-x-0" : "translate-x-full py-4"
          }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b">
          <Link
            href="/"
            className="text-lg font-bold text-blue-800"
            onClick={() => setIsOpen(false)}
          >
            <HeaderLogo imgClass='w-32' />
          </Link>
          <button onClick={() => setIsOpen(false)}>
            <Icon icon="mdi:close" width={28} height={28} />
          </button>
        </div>

        {/* Mobile Nav Links */}
        <nav className="flex flex-col  space-y-3 text-gray-700">
          <div className="flex flex-col  space-y-3 text-gray-700 pt-3">
{filteredModules?.map((item:any, index:number) => (
      <Link
        key={index}
        href={`/${item.type}`}
        target={""}
        className="text-[#11223399] text-base hover:text-blue-700 transition-colors duration-200 ease-in-out"
      >
       <h3 className="text-base font-medium text-gray-800 px-4">{item.type}</h3>
      </Link>
    ))}
           {headerPages?.map((item:any, index:number) => (
      <Link
        key={index}
        href={`/pages/${item.slug_url}`}
        target={""}
        className="text-[#11223399] text-base hover:text-blue-700 transition-colors duration-200 ease-in-out"
      >
       <h3 className="text-base font-medium text-gray-800 px-4">{item.page_name}</h3>
      </Link>
    ))}

          {/* Mobile Auth Buttons */}
          {!(user) ? <div className="flex flex-col ">
               <Dropdown
        label={
          <div className="flex items-center gap-1.5 ps-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000"
              className="pe-1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Agents
            {/* <ChevronDown className="w-4 h-4" /> */}
          </div>
        }
      >
        <div className="flex flex-col">
          <Link
            href="https://toptier-agent-d-kwk7.vercel.app/login"
            target=""
            className="block text-sm font-medium rounded-xl px-4 py-2 text-gray-700 hover:bg-blue-50"
          >
            Login
          </Link>
          <Link
            href="https://toptier-agent-d-kwk7.vercel.app/signup"
            target=""
            className="block text-sm font-medium rounded-xl px-4 py-2 text-gray-700 hover:bg-blue-50"
          >
            Signup
          </Link>
        </div>
      </Dropdown>
      {/* ===== Customers Dropdown ===== */}
      <Dropdown
        label={
          <div className="flex items-center gap-1.5 ps-0.5">
            <svg
              stroke="#000"
              className="pe-1"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Customers
            {/* <ChevronDown className="w-4 h-4" /> */}
          </div>
        }
      >
        <div className="flex flex-col">
          <Link
            href="/auth/login"
            className="block text-sm font-medium rounded-xl px-4 py-2 text-gray-700 hover:bg-blue-50"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="block text-sm font-medium rounded-xl px-4 py-2 text-gray-700 hover:bg-blue-50"
          >
            Signup
          </Link>
        </div>
      </Dropdown>
          </div> :   <div className="">
          <ProfileDropdown/>
          </div>}
          </div>

        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}
    </header>
  );
};

export default HeaderMenus;