"use client";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHotelsLocations,
  hotel_search,
  hotel_search_multi,
} from "@src/actions";
import { z } from "zod";
import { useAppSelector } from "@lib/redux/store";
import { usePathname, useRouter } from "next/navigation";
import { currency, setHotels, setSeletecHotel } from "@lib/redux/base";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const hotelSearchSchema = z
  .object({
    destination: z.string().min(2, "Destination must be at least 2 characters"),
    checkin: z.string().min(1, "Check-in date is required"),
    checkout: z.string().min(1, "Check-out date is required"),
    rooms: z.number().min(1).max(8),
    adults: z.number().min(1).max(16),
    children: z.number().min(0).max(10),
    nationality: z.string().min(1, "Nationality is required"),
    children_ages: z.array(z.number().int().min(0).max(17)).optional(),
  })
  .refine(
    (data) => {
      if (!data.checkin || !data.checkout) return true;
      return new Date(data.checkout) > new Date(data.checkin);
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkout"],
    }
  );

interface HotelForm {
  destination: string;
  checkin: string;
  checkout: string;
  rooms: number;
  adults: number;
  children: number;
  nationality: string;
  latitude?: string;
  longitude?: string;
  children_ages: any[];
}

interface LocationObj {
  id: string;
  city: string;
  country: string;
  country_code: string;
  latitude?: string;
  longitude?: string;
  status?: string;
}

interface Module {
  id: string;
  name: string;
  active: string;
  type: string;
  status: string;
  c1: string | null;
  c2: string | null;
  c3: string | null;
  c4: string | null;
  c5: string | null;
  c6: string | null;
  dev_mode: string;
  payment_mode: string;
  currency: string;
  module_color: string;
  order: string;
  prn_type: string;
}

function useDebounce(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const useHotelSearch = () => {
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const today = new Date();
  const checkin = formatDate(today);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const checkout = formatDate(tomorrow);

  const [form, setForm] = useState<HotelForm>({
    destination: "",
    checkin: checkin,
    checkout: checkout,
    rooms: 1,
    adults: 2,
    children: 0,
    nationality: "PK",
    children_ages: [], //  NEW
  });
  const hotelSearch_path = usePathname();

  const queryClient = useQueryClient();
    const {country, currency, locale}=useAppSelector((state)=>state.root)

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [hotelLocations, setHotelLocations] = useState<LocationObj[]>([]);
  const [locationError, setLocationError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isloadingMore, setIsLoadingMore] = useState(false);
  const [noMoreData, setNoMoreData] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>({});
  const [selectedRomm, setSelectedRoom] = useState<any>({});
  // FIX 1: Add separate loading states
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
 
  const listRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(1);

  // Add ref to prevent multiple simultaneous calls
  const isProcessingRef = useRef(false);
  // Add ref to track if initial load has run
  const hasInitialLoadRun = useRef(false);

  const { modules } = useAppSelector((state) => state.appData?.data);
  const router = useRouter();
  const allHotelsData = useAppSelector((state) => state.root.hotels);
  const dispatch = useDispatch();

  const hotelModuleNames = useMemo(() => {
    return (
      modules
        ?.filter((module: Module) => module.type === "hotels")
        .map((module: Module) => module.name) || []
    );
  }, [modules]);

  const debouncedDestination = useDebounce(form.destination, 450);

  // Location search query
  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationsQueryError,
  } = useQuery({
    queryKey: ["hotel-locations", debouncedDestination],
    queryFn: () => fetchHotelsLocations(debouncedDestination.trim()),
    enabled: debouncedDestination.trim()?.length >= 3,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (
      locationData?.status &&
      Array.isArray(locationData?.data) &&
      locationData?.data?.length > 0
    ) {
      setHotelLocations(locationData.data);
      setLocationError("");
    } else if (locationData?.error || locationsQueryError) {
      setHotelLocations([]);
      setLocationError("Try different search");
    } else if (debouncedDestination.trim()?.length >= 3) {
      setHotelLocations([]);
      setLocationError("No Hotel Destination Found");
    } else {
      setHotelLocations([]);
      setLocationError("");
    }
  }, [locationData, locationsQueryError, debouncedDestination]);

  // Event handlers
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const newValue = type === "number" ? Number(value) : value;

      setForm((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      if (name === "destination") {
        setShowDestinationDropdown(true);
        setActiveIndex(-1);
        setLocationError("");
      }

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const handleSelectLocation = useCallback((loc: LocationObj) => {
    setForm((prev) => ({
      ...prev,
      destination: loc.city,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));
    setShowDestinationDropdown(false);
    setHotelLocations([]);
    setActiveIndex(-1);
  }, []);

  const handleDestinationKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDestinationDropdown) return;
      const maxIndex = hotelLocations?.length - 1;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < maxIndex ? i + 1 : maxIndex));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && hotelLocations[activeIndex]) {
          handleSelectLocation(hotelLocations[activeIndex]);
        }
      } else if (e.key === "Escape") {
        setShowDestinationDropdown(false);
      }
    },
    [showDestinationDropdown, hotelLocations, activeIndex, handleSelectLocation]
  );

  // Fixed deduplication function
  const removeDuplicates = useCallback((hotels: any[]) => {
    if (!Array.isArray(hotels) || hotels?.length === 0) {
      return [];
    }

    const seen = new Set();
    return hotels.filter((hotel) => {
      if (!hotel || !hotel.hotel_id) {
        return false;
      }

      if (seen.has(hotel.hotel_id)) {
        return false;
      }

      seen.add(hotel.hotel_id);
      return true;
    });
  }, []);

  // Fixed mutation - NO onSuccess to prevent data mixing
  const hotelSearchMutation = useMutation({
    mutationFn: hotel_search,
    // Remove onSuccess to prevent data mixing
  });

  // Fixed batch API call function
  const callAllModulesAPI = useCallback(
    async (searchParams: any, pageNumber: number = 1) => {
      if (isProcessingRef.current) {
        return { success: false, error: "Already processing" };
      }
      if (!hotelModuleNames || hotelModuleNames.length === 0) {
        return { success: false, error: "No modules available" };
      }
      try {
        isProcessingRef.current = true;

        const promises = hotelModuleNames.map(async (mod: string) => {
          try {
            const result = await hotel_search({
              ...searchParams,
              page: pageNumber,
              modules: mod,
            });
            return { mod, result };
          } catch (err) {
            // console.error(`Module ${mod} failed:`, err);
            return { mod, result: null };
          }
        });

        const results: any[] = [];
        for await (const p of promises) {
          if (p?.result?.response?.length) {
            results.push(...p.result.response);

            //  Emit partial data so UI can render incrementally
            // e.g. setHotels((prev) => [...prev, ...p.result.response]);
          }
        }

        return { success: true, data: results };
      } catch (err) {
        // console.error("Batch API call failed:", err);
        return { success: false, error: (err as Error).message };
      } finally {
        isProcessingRef.current = false;
      }
    },
    [hotelModuleNames]
  );


  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Reset previous errors
      setErrors({});

      //  Step 1: Validate form first (no loading yet)
      try {
        hotelSearchSchema.parse(form);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const msgMap: Record<string, string> = {};
          err.errors.forEach((zErr) => {
            msgMap[zErr.path[0] as string] = zErr.message;
          });
          setErrors(msgMap);
        }
        return { success: false, error: "Form validation failed" };
      }

      //  Step 2: Start loading AFTER validation passes
      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          destination: form.destination,
          checkin: form.checkin,
          checkout: form.checkout,
          rooms: String(form.rooms),
          adults: String(form.adults),
          children: String(form.children),
          nationality: form.nationality,
        });

        localStorage.setItem("hotelSearchForm", JSON.stringify(form));
    
        const destinationSlug = form.destination.trim().replace(/\s+/g, "-");

        const url = `/hotel/${destinationSlug}/${params.get(
          "checkin"
        )}/${params.get("checkout")}/${params.get("rooms")}/${params.get(
          "adults"
        )}/${params.get("children")}/${params.get("nationality")}`;

        //  optional delay for UX smoothness
        setTimeout(() => {
          router.push(url);
        }, 500);
      } catch (err) {
        console.error("Search error:", err);
        toast.error("Search failed. Please try again.");
        return { success: false, error: "Search failed" };
      } finally {
        //  Keep loader visible for a bit to avoid flicker
        setTimeout(() => setIsSearching(false), 800);
      }
    },
    [form, router]
  );

  // Fixed load more data
  // multi module aproad in server
  const loadMoreData = useCallback(
    async (filters?: any) => {
      // e?.preventDefault();
      if ( isloadingMore || isProcessingRef.current) return;
      const { priceRange, selectedRating } = filters;
      const from_price = priceRange[0];
      const to_price = priceRange[1];

      setIsLoadingMore(true);
      setNoMoreData(false)
      try {
        const savedForm = localStorage.getItem("hotelSearchForm");
        if (!savedForm) return;

        const parsedForm: HotelForm = JSON.parse(savedForm);
        const nextPage = page + 1;

        // Use hotel_search_multi for pagination
        const result = await hotel_search_multi(
          {
            destination: parsedForm.destination,
            checkin: parsedForm.checkin,
            checkout: parsedForm.checkout,
            rooms: parsedForm.rooms,
            adults: parsedForm.adults,
            children: parsedForm.children,
            nationality: parsedForm.nationality,
            page: nextPage, //  next page
            price_from: from_price, // or keep current filters if needed
            price_to: to_price,
            rating: selectedRating > 1 ? selectedRating : "",
            currency:currency,
            language:locale,
            child_age: parsedForm.children_ages || [],
          },
          hotelModuleNames
        );
        if (result.success.length > 0) {
          if (result.success.length > 0) {
            const updatedHotels = [...allHotelsData, ...result.success];
            dispatch(setHotels(updatedHotels));
            queryClient.setQueryData(["hotel-search"], updatedHotels);
            setPage(nextPage);
            setIsLoadingMore(false);
                    setNoMoreData(false); // Reset the flag


            return { success: true, data: result.success };

          } else {
                                setNoMoreData(true);
            return { success: false, error: "No new hotels found" };
          }
        } else {
          setIsLoadingMore(false);
             setNoMoreData(true);
          return { success: false, error: "No more data" };
        }
      } catch (err) {
        console.error("Load more error:", err);
        return { success: false, error: "Load more failed" };
      } finally {
        setIsLoadingMore(false);


      }
    },
    [
      page,
      allHotelsData,
      hotelModuleNames,
      dispatch,
      queryClient,
      isloadingMore,
    ]
  );

  // DETAISL BOOK NOW HANDLER
  const detailsBookNowHandler = async (hotel: any) => {
    // if (!hotel?.hotel_id || !hotel?.name || !hotel?.supplier_name) return;
    dispatch(setSeletecHotel({}));
    //  store full hotel object in localStorage
    localStorage.setItem("currentHotel", JSON.stringify(hotel));
    const selectedNationality = localStorage.getItem("hotelSearchForm");
    //  generate slug
    const slugName = hotel.name.toLowerCase().replace(/\s+/g, "-");
    let parsedFormData:any;
    let suplier_name;
    if (selectedNationality) {
       parsedFormData = JSON.parse(selectedNationality); // now it's an object

    
    }
    //  construct URL
    const url = `/hotelDetails/${hotel.hotel_id}/${slugName}/${form.checkin}/${form.checkout}/${form.rooms}/${form.adults}/${parsedFormData.children}/${parsedFormData.nationality}`;
    dispatch(setSeletecHotel(hotel));
    //  navigate
    router.push(url);
   
  };

  // Other utility functions
  const updateForm = useCallback((updates: Partial<HotelForm>) => {
    // Check children limit before updating state
    if (updates.children !== undefined && updates.children > 12) {
      toast.warning("You’ve reached the maximum limit of children.");
      return;
    }

    setForm((prev) => {
      const newForm = { ...prev, ...updates };

      if (updates.children !== undefined) {
        const newChildrenCount = updates.children;
        const currentAges = prev.children_ages || [];

        if (newChildrenCount > currentAges.length) {
          const newAges = [
            ...currentAges,
            ...Array(newChildrenCount - currentAges.length).fill(1),
          ];
          newForm.children_ages = newAges;
        } else if (newChildrenCount < currentAges.length) {
          newForm.children_ages = currentAges.slice(0, newChildrenCount);
        }
      }

      return newForm;
    });

    // Clear validation errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedFields.forEach((field) => {
        if (newErrors[field]) delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  // HANDLE BOOK NOW TO FOR DETAILS PAGE

  const resetForm = useCallback(() => {
    setForm({
      destination: "",
      checkin: checkin,
      checkout: checkout,
      rooms: 1,
      adults: 2,
      children: 0,
      nationality: "PK",
      children_ages: [],
    });
    setErrors({});
    setShowDestinationDropdown(false);
    setShowGuestsDropdown(false);
    setHotelLocations([]);
    setActiveIndex(-1);
    dispatch(setHotels([]));
    queryClient.setQueryData(["hotel-search"], []);
    setPage(1);
    hasInitialLoadRun.current = false;
    // Reset loading states
    setIsSearching(false);
    setIsInitialLoading(false);
    setIsLoadingMore(false);
  }, []);

  const validateForm = useCallback(() => {
    try {
      hotelSearchSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.errors.forEach((err) => {
          errorMap[err.path[0] as string] = err.message;
        });
        setErrors(errorMap);
      }
      return false;
    }
  }, [form]);

  const hotels_Data = useQueryClient().getQueryData<any[]>(["hotel-search"]);
  const totalGuests = form.adults + form.children;
  const isFormValid = Object.keys(errors)?.length === 0;
  const hasLocationResults = hotelLocations?.length > 0;
  const isPending = hotelSearchMutation.isPending;

  return {
    // Form state
    form,
    setForm,
    updateForm,
    resetForm,
    errors,
    setErrors,
    isFormValid,
    totalGuests,
    validateForm,

    // Location search
    hotelLocations,
    locationLoading,
    locationError,
    hasLocationResults,
    showDestinationDropdown,
    setShowDestinationDropdown,
    activeIndex,
    setActiveIndex,
    removeDuplicates,

    // Guests dropdown
    showGuestsDropdown,
    setShowGuestsDropdown,

    // Search state - FIX 6: Return proper loading states
    hotelSearchMutation,
    isSearching, // For submit button loading
    isInitialLoading, // For page reload loading
    setIsInitialLoading,
    isPending,
    setIsLoadingMore,
    isloadingMore, // For load more button
    allHotelsData,
    noMoreData,
    hotels_Data,
    searchError: hotelSearchMutation.error,
    listRef,
    hotelModuleNames,
    setIsSearching,
    callAllModulesAPI, // Export for use in filters
    isProcessingRef,
    setSelectedRoom,
    selectedHotel,
    selectedRomm,

    // Event handlers
    handleChange,
    handleSelectLocation,
    handleDestinationKeyDown,
    handleSubmit,
    loadMoreData,
    detailsBookNowHandler,
    // Schema for external validation
    hotelSearchSchema,
  };
};

export default useHotelSearch;
