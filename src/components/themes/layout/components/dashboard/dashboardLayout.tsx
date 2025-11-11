'use client'
import type { CommonProps } from '@src/@types/common';
import { Main } from '../app';
// import { navIcons } from './nav-icons';
// import { navItems } from './sidebarRoutes';
// import { usePathname } from 'next/navigation';
// import { useAppSelector } from '@lib/redux/store';
// import useDictionary from "@hooks/useDict";
// import useLocale from "@hooks/useLocale";
// import useDirection from "@hooks/useDirection"
// import {DashboardSidebar} from "./components"

type DashboardLayoutProps = CommonProps;
// import TransitionLayout from '@src/utils/pageTransition'

const DashboardLayout = ({ children, }: DashboardLayoutProps) => {
    //   const expanded = useAppSelector((state) => state?.root.sidebarExpanded);
    
    //   const { locale } = useLocale();
        // const { data: dict, isLoading } = useDictionary(locale as any);
        // const [direction] = useDirection();

    // const pathname = usePathname();
    // const data = navItems?.map((item: any) => ({
    //     title: item.title,
    //     menus: item.menus.map((menu: any) => {
    //         if (!menu) return null;


    //         return {
    //             key: menu.key,
    //             icon: navIcons[menu.icon] || menu.icon,
    //             text: menu.text,
    //             href: menu.href,
    //             active: pathname === menu.href,
    //             children: Array.isArray(menu?.children)
    //                 ? menu.children?.map((child: any) => ({
    //                     key: child.key,
    //                     text: child.text,
    //                     href: child.href,
    //                     active: pathname === child.href,
    //                 }))
    //                 : undefined,
    //         }
    //     }),

    // }));

    return (
        <Main>
            <div className="flex h-auto  py-6 w-full mx-auto bg-[#DFE5EC] dark:bg-gray-800 dark:text-gray-50">
                <div className='w-full max-w-[1200px] mx-auto h-full flex md:px-6  '>
                <div className='w-full h-full flex  gap-3.5 rounded-xl bg-[#DFE5EC] dark:bg-gray-800 dark:text-gray-50'>
                    {/* sidebar  */}
                    {/* <div className='   h-full'>
                        <DashboardSidebar  menuItems={navItems}/>
                    </div> */}
                    {/* main content  */}
                    <div className='bg-white mx-6 md:mx-0 dark:bg-gray-900   overflow-hidden w-full h-full rounded-lg'>
                        {children}
                    </div>
                </div>
                </div>

                {/* <SideNav navConfig={data} />
                <div className={`${expanded  ? "ps-62" : "ps-20"} flex-1 dark:bg-gray-800  transition-all duration-300 ease-in-out overflow-auto`}>
                    {children}
                </div> */}
            </div>

         </Main>
    );
};

export default DashboardLayout;
