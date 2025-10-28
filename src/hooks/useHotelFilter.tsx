import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import useHotelSearch from "./useHotelSearch";
import { setHotels } from "@lib/redux/base";
import { useDispatch } from "react-redux";
import {  useQueryClient } from "@tanstack/react-query";
import { hotel_search_multi } from "@src/actions";
import { useAppSelector } from "@lib/redux/store";


interface HotelData {
  hotel_id: string;
  name: string;
  location: string;
  actual_price: string;
  actual_price_per_night: string;
  img: string;
  rating: string;
  stars: string;
  amenities: string[];
  favorite: number;
  address: string;
  latitude: string;
  longitude: string;
  currency: string;
  supplier_name: string;
}


interface FilterState {
  priceRange: [number, number];
  selectedStars: number[];
  selectedRating: number;
  searchQuery: string;
  selectedAmenities: string[];
  sortBy:string
}

interface UseHotelFilterProps {
  hotelsData: any[];
  isLoading?: boolean;
  // formData?: any;
  // setFormData?: (data: any) => void;
}

const useHotelFilter = () => {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [1, 5000],
    selectedStars: [],
    selectedRating:1,
    searchQuery: '',
    selectedAmenities: [],
    sortBy: '', // default sort
  });
const {hotelSearchMutation,form,hotelModuleNames,removeDuplicates,setIsSearching,isSearching,setIsInitialLoading,handleSubmit,callAllModulesAPI,allHotelsData}=useHotelSearch()
    const dispatch = useDispatch();
      const {country, currency, locale}=useAppSelector((state)=>state.root)

const queryClient = useQueryClient();
  const [selectedStars, setSelectedStars] = useState<number | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const hotelsData=[...allHotelsData]
  // Calculate price range from actual data
//  static price range
const priceRange = useMemo(() => {
  return { min: 0, max: 5000 };
}, []);

//  initialize filters once when component mounts
useEffect(() => {
  setFilters(prev => ({
    ...prev,
    priceRange: [1, 5000],
  }));
}, []);


  // Get unique amenities from data
  const availableAmenities = useMemo(() => {
    if (!hotelsData) return [];

    const amenitiesSet = new Set<string>();
    hotelsData.forEach(hotel => {
      if (hotel.amenities && Array.isArray(hotel.amenities)) {
        hotel.amenities.forEach((amenity:any) => amenitiesSet.add(amenity));
      }
    });

    return Array.from(amenitiesSet);
  }, [hotelsData]);

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    if (!hotelsData || hotelsData?.length === 0) return [];

     const filtered = hotelsData.filter(hotel => {
      // Price filter
      // const hotelPrice = parseFloat(hotel.actual_price_per_night) || 0;
      // if (hotelPrice <= filters.priceRange[0] || hotelPrice >= filters.priceRange[1]) {
      //   return false;
      // }

      // Stars filter
      // if (filters.selectedStars?.length > 0) {
      //   const hotelStars = parseInt(hotel.stars) || 0;
      //   if (!filters.selectedStars.includes(hotelStars)) {
      //     return false;
      //   }
      // }

      // Rating filter
      // const hotelRating = parseFloat(hotel.rating) || 0;

      // if (hotelRating < filters.selectedRating) {
      //   return false;
      // }

      // Search query filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = hotel.name.toLowerCase().includes(query);
        const matchesLocation = hotel.location.toLowerCase().includes(query);
        const matchesAddress = hotel.address?.toLowerCase().includes(query);

        if (!matchesName && !matchesLocation && !matchesAddress) {
          return false;
        }
      }

      // Amenities filter
      if (filters.selectedAmenities?.length > 0) {
        if (!hotel.amenities || !Array.isArray(hotel.amenities)) {
          return false;
        }

        const hasAllAmenities = filters.selectedAmenities.every(amenity =>
          hotel.amenities.includes(amenity)
        );

        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });

    // Sort hotels
    if (filters.sortBy) {
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_low':
        return (parseFloat(a.actual_price) || 0) - (parseFloat(b.actual_price) || 0);
      case 'price_high':
        return (parseFloat(b.actual_price) || 0) - (parseFloat(a.actual_price) || 0);
      case 'rating':
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      case 'name':
        return a.name.localeCompare(b.name || "");
      default:
        return 0;
    }
  });
}
    return filtered;
  }, [hotelsData, filters]);

  // Filter update functions
const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

const updatePriceRange = useCallback(
  (newRange: [number, number]) => {
    // Update local state instantly
    setFilters(prev => ({ ...prev, priceRange: newRange }));

    // Clear any existing debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new debounce delay (e.g., 600ms)
    debounceTimeout.current = setTimeout(async () => {
      try {
        setIsFilterLoading(true);
        dispatch(setHotels([])); // Clear old data

        const savedForm = localStorage.getItem("hotelSearchForm");
        if (!savedForm) return;
        const parsedForm = JSON.parse(savedForm);

        const result = await hotel_search_multi(
          {
            destination: parsedForm.destination,
            checkin: parsedForm.checkin,
            checkout: parsedForm.checkout,
            rooms: parsedForm.rooms,
            adults: parsedForm.adults,
            children: parsedForm.children,
            nationality: parsedForm.nationality,
            page: 1,
            price_from: String(newRange[0]),
            price_to: String(newRange[1]),
            rating: "", // keep current rating
            currency:currency,
            language:locale,
             child_age: parsedForm.children_ages || [],
          },
          hotelModuleNames
        );

        dispatch(setHotels([...result.success]));
        queryClient.setQueryData(["hotel-search"], result.success);
      } catch (err) {
        console.error("Price filter fetch failed", err);
      } finally {
        setIsFilterLoading(false);
      }
    }, 600);
  },
  [hotelModuleNames, dispatch, queryClient]
);

// attach static ref container to function
(updatePriceRange as any).debounceRef = { current: null };

  const toggleStarFilter = useCallback((stars: number) => {
    setFilters(prev => ({
      ...prev,
      selectedStars: prev.selectedStars.includes(stars)
        ? prev.selectedStars.filter(s => s !== stars)
        : [...prev.selectedStars, stars]
    }));
  }, []);

const updateRatingFilter = useCallback(
  async (rating: number) => {
    setFilters((prev) => ({ ...prev, selectedRating: rating }));
    try {

      dispatch(setHotels([])); // Clear old data
      setIsFilterLoading(true);

      const savedForm = localStorage.getItem("hotelSearchForm");
      if (!savedForm) return;

      const parsedForm = JSON.parse(savedForm);

      //  Use hotel_search_multi instead of manual loop
      const result = await hotel_search_multi(
        {
          destination: parsedForm.destination,
          checkin: parsedForm.checkin,
          checkout: parsedForm.checkout,
          rooms: parsedForm.rooms,
          adults: parsedForm.adults,
          children: parsedForm.children,
          nationality: parsedForm.nationality,
          page: 1,
          price_from: String(filters.priceRange[0]),
          price_to: String(filters.priceRange[1]),
          rating: String(rating),
          currency:currency,
          language:locale,
          child_age: parsedForm.children_ages || [],

        },
        hotelModuleNames
      );
      //  Sync to Redux
      dispatch(setHotels(result.success));
      // Optional: update React Query cache if you're using it elsewhere
      queryClient.setQueryData(["hotel-search"], result.success);
    } catch (err) {
      console.error("Rating filter fetch failed", err);
    } finally {
      setIsFilterLoading(false);
    }
  },
  [
    hotelModuleNames,
    queryClient,
    dispatch,
    filters.priceRange,
    // removeDuplicates is now handled inside hotel_search_multi if needed
  ]
);

  const updateSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const toggleAmenityFilter = useCallback((amenity: string) => {
    setFilters(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenity)
        ? prev.selectedAmenities.filter(a => a !== amenity)
        : [...prev.selectedAmenities, amenity]
    }));
  }, []);

  const updateSortBy = useCallback((sortBy: FilterState['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);
const resetFilters = useCallback(async (e?: any) => {
    try {
      setIsFilterLoading(true);
      // Reset filter state first
      setFilters({
        priceRange: [priceRange.min, priceRange.max],
        selectedStars: [],
        selectedRating: 1,
        searchQuery: '',
        selectedAmenities: [],
        sortBy: 'price_low'
      });
      setSelectedStars(null);

      // Clear existing data
      dispatch(setHotels([]));
      queryClient.setQueryData(["hotel-search"], []);

      // Get saved form data for reset
      const savedForm = localStorage.getItem("hotelSearchForm");
      if (!savedForm) {
        // console.error('No saved form data found');
        return;
      }

      const parsedForm = JSON.parse(savedForm);

      // FIX 3: Use callAllModulesAPI directly instead of handleSubmit
      const result = await callAllModulesAPI({
        ...parsedForm,
        price_from: "", // Reset to no price filter
        price_to: "",
        rating: "" // Reset to no rating filter
      }, 1);

      if (result.success && result.data) {
        // Update both cache and Redux with reset data
        queryClient.setQueryData(["hotel-search"], result.data);
        dispatch(setHotels(result.data));
      } else {
        // console.error('Reset failed:', result.error);
      }

    } catch (error) {
      console.error('Reset filters error:', error);
    } finally {
      setIsFilterLoading(false);
    }
  }, [callAllModulesAPI, dispatch, queryClient, priceRange]);


  const hasActiveFilters = useMemo(() => {
    return (
      filters.selectedStars?.length > 0 ||
      filters.selectedRating > 1 ||
      filters.searchQuery.trim() !== '' ||
      filters.selectedAmenities?.length > 0 ||
      filters.priceRange[0] > priceRange.min ||
      filters.priceRange[1] < priceRange.max
    );
  }, [filters, priceRange]);

  return {
    // Filtered data
    filteredHotels,
    totalResults: filteredHotels?.length,

    // Filter state
    filters,
    hasActiveFilters,

    // Data info
    priceRange,
    availableAmenities,


    // Update functions
    updatePriceRange,
    toggleStarFilter,
    updateRatingFilter,
    updateSearchQuery,
    toggleAmenityFilter,
    updateSortBy,
    resetFilters,

    selectedStars, setSelectedStars,isFilterLoading
  };
};

export default useHotelFilter;