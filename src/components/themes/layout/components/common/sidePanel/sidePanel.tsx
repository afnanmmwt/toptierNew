
// import Drawer from '@components/core/drawer'
// import SidePanelContent from './sidePanelContent'
// import type { CommonProps } from '@src/@types/common'
// import { useAppSelector } from '@lib/redux/store'

// type SidePanelProps = CommonProps & {
//     open: boolean;
//     setOpen: (open: boolean) => void;
//     dict: any
//     isLoading: boolean
// }

// const SidePanel = (props: SidePanelProps) => {
//     const {  open, setOpen, isLoading, dict, } = props


//     const direction = useAppSelector((state) => state.root.direction)

//     const closePanel = () => {
//         setOpen(false)
//         if (document) {
//             const bodyClassList = document.body.classList
//             if (bodyClassList.contains('drawer-lock-scroll')) {
//                 bodyClassList.remove('drawer-lock-scroll', 'drawer-open')
//             }
//         }
//     }

//     return (
//         <>

//             <Drawer
//                 title={<span className='text-xl font-bold'>{isLoading ? <>loading...</> : dict?.sidebar?.app_settings}</span>}
//                 isOpen={open}
//                 placement={direction === 'rtl' ? 'left' : 'right'}
//                 width={375}
//                 onClose={closePanel}
//                 onRequestClose={closePanel}
//             >
//                 <SidePanelContent callBackClose={closePanel}{...{ isLoading, dict }} />
//             </Drawer>
//         </>
//     )
// }



// export default SidePanel
