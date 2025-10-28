'use client'
// import React from 'react'
import useHotelSearch from '@hooks/useHotelSearch'
import  HotelsDetails  from './hotelDetails'
// import { BookingDetails } from '../bookingDetails'
// import BookingPage from './bookingpage'

const HotelsListingMain = () => {
  // use your custom hook
  const {   allHotelsData,
 isSearching } = useHotelSearch()

  return (
    <div className="">
         <HotelsDetails/>
    </div>
  )
}

export default HotelsListingMain
