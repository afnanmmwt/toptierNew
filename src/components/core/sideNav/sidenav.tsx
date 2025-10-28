// import React, { useContext } from 'react'
// import Sidebar, { SidebarItem, SidebarCollapse, SidebarContext } from './context';

// function SideNavContent({ navConfig }: { navConfig: any[] }) {
//     const context = useContext(SidebarContext);
//     const { expanded } = context || { expanded: true };
//     return (
//         <>
//             {navConfig.map((section, idx) => (
//                 <React.Fragment key={section.title + idx}>
//                     {expanded && (
//                         <div className="px-3 pt-4 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 select-none transition-all">
//                             {section.title}
//                         </div>
//                     )}
//                     <ul>
//                         {section.menus.map((menu: any, idx: number) =>
//                             menu.children && menu.children.length > 0 ? (
//                                 <SidebarCollapse
//                                     key={(menu.key || menu.text) + '-' + idx}
//                                     icon={menu.icon}
//                                     text={menu.text}
//                                     list={menu.children}
//                                 >
//                                     {menu.children.map((child: any, childIdx: number) => (
//                                         <SidebarItem
//                                             key={(menu.key || menu.text) + '-' + (child.key || child.text || childIdx)}
//                                             icon={child.icon || ''}
//                                             text={child.text}
//                                             href={child.href}
//                                             active={child.active}
//                                             alert={child.alert}
//                                         />
//                                     ))}
//                                 </SidebarCollapse>
//                             ) : (
//                                 <SidebarItem
//                                     key={menu.key || menu.text}
//                                     icon={menu.icon}
//                                     text={menu.text}
//                                     href={menu.href}
//                                     active={menu.active}
//                                     alert={menu.alert}
//                                 />
//                             )
//                         )}
//                     </ul>
//                 </React.Fragment>
//             ))}
//         </>
//     );
// }

// function SideNav({ navConfig }: { navConfig: any[] }) {
//     return (
//         <Sidebar>
//             <SideNavContent navConfig={navConfig} />
//         </Sidebar>
//     )
// }

// export default SideNav