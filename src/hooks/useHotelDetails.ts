'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import useHotelSearch from './useHotelSearch';
import { useAppDispatch } from '@lib/redux/store';
import { setSeletecRoom } from '@lib/redux/base';
import { toast } from 'react-toastify';

// ✅ Updated: Add children_ages
export interface HotelForm {
  checkin: string;
  checkout: string;
  rooms: number;
  adults: number;
  children: number;
  nationality: string;
  currency: string;
  children_ages?: number[]; //  NEW
}

// ✅ Updated schema with optional children_ages
export const hotelSearchSchema = z
  .object({
    checkin: z.string().min(1, "Check-in date is required"),
    checkout: z.string().min(1, "Check-out date is required"),
    rooms: z.number().min(1).max(8),
    adults: z.number().min(1).max(16),
    children: z.number().min(0).max(10),
    nationality: z.string().min(1, "Nationality is required"),
    children_ages: z.array(z.number().int().min(0).max(17)).optional(),
  })
  .refine((data) => {
    // Validate child ages only if children > 0
    if (data.children > 0) {
      return (
        data.children_ages &&
        data.children_ages.length === data.children &&
        data.children_ages.every(age => age !== undefined && age !== null)
      );
    }
    return true;
  }, {
    message: "Please select age for each child",
    path: ["children_ages"],
  })
  .refine((data) => new Date(data.checkout) > new Date(data.checkin), {
    message: "Check-out date must be after check-in date",
    path: ["checkout"],
  });

interface UseHotelDetailsOptions {
  initialCheckin?: string;
  initialCheckout?: string;
  initialNationality?: string;
  initialCurrency?: string;
  onSearchSuccess?: (formData: HotelForm) => void;
  onSearchError?: (error: string) => void;
  onSearchRefetch?: (formData: HotelForm) => void;
}

export const useHotelDetails = ({
  initialCheckin,
  initialCheckout,
  initialNationality = "PK",
  initialCurrency = "USD",
  onSearchSuccess,
  onSearchError,
  onSearchRefetch,
}: UseHotelDetailsOptions = {}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { setSelectedRoom } = useHotelSearch();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const today = new Date();
  const defaultCheckin = initialCheckin || formatDate(today);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const defaultCheckout = initialCheckout || formatDate(tomorrow);
// Get saved form (if any)
const storedForm = typeof window !== "undefined"
  ? localStorage.getItem("hotelSearchForm")
  : null;

let initialForm: HotelForm = {

  checkin: defaultCheckin,
  checkout: defaultCheckout,
  rooms: 1,
  adults: 2,
  children: 0,
  children_ages: [],
  nationality: initialNationality || "PK",
  currency: initialCurrency || "USD",

};

// If localStorage has previous form, parse and merge it
if (storedForm) {
  try {
    const parsed = JSON.parse(storedForm);
    initialForm = {
      ...initialForm,
      ...parsed,
      children_ages: parsed.children_ages || [],
      adults: parsed.adults ?? 2,
      rooms: parsed.rooms ?? 1,
      children: parsed.children ?? 0,
    };
  } catch (error) {
    console.warn("Error parsing hotelSearchForm:", error);
  }
}

//  Initialize state
const [form, setForm] = useState<HotelForm>(initialForm);


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const guestsDropdownRef = useRef<HTMLDivElement | null>(null);
  const totalGuests = form.adults + form.children;
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? Number(value) : value;
    setForm(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  //  Enhanced updateForm to handle children_ages
  const updateForm = useCallback((updates: Partial<HotelForm>) => {
      if (updates.children !== undefined && updates.children > 12) {
          toast.warning("You’ve reached the maximum limit of children.");
          return;
        }
    setForm(prev => {
      const newForm = { ...prev, ...updates };

      // Auto-manage children_ages when children count changes
      if (updates.children !== undefined) {
        const newChildren = updates.children;
        const currentAges = prev.children_ages || [];
        if (newChildren > currentAges.length) {
          // Add new slots (default age 0)
          const newAges = [...currentAges, ...Array(newChildren - currentAges.length).fill(0)];
          newForm.children_ages = newAges;
        } else if (newChildren < currentAges.length) {
          // Trim excess
          newForm.children_ages = currentAges.slice(0, newChildren);
        }
      }

      return newForm;
    });

    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        if (newErrors[field]) delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  const validateForm = useCallback(() => {
    try {
      hotelSearchSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.errors.forEach(err => {
          errorMap[err.path[0] as string] = err.message;
        });
        setErrors(errorMap);
      }
      return false;
    }
  }, [form]);

  const toggleGuestsDropdown = useCallback(() => {
    setShowGuestsDropdown(prev => !prev);
  }, []);

  const closeGuestsDropdown = useCallback(() => {
    setShowGuestsDropdown(false);
  }, []);

  const onSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return { success: false, errors };

    setIsSearching(true);
    try {
      localStorage.setItem('hotelSearchForm', JSON.stringify(form));

      const currentHotelString = localStorage.getItem("currentHotel");
      if (!currentHotelString) {
        throw new Error("No current hotel found in storage");
      }

      const currentHotel = JSON.parse(currentHotelString);
      const nationality = form.nationality;
      const slugName = currentHotel.name.toLowerCase().replace(/\s+/g, "-");
      // const supplier=storedForm?.suplier_name
      //  Include children_ages in URL
      const childrenAgesParam = form.children_ages?.join(",") || "";
      const url = `/hotelDetails/${currentHotel.hotel_id}/${slugName}/${form.checkin}/${form.checkout}/${form.rooms}/${form.adults}/${form.children}/${nationality}/${childrenAgesParam}`;

      if (onSearchRefetch) {
        onSearchRefetch(form);
        return { success: true, data: form };
      }

      onSearchSuccess?.(form);
      router.push(url);
      return { success: true, data: form };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setErrors({ submit: 'Search failed. Please try again.' });
      onSearchError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSearching(false);
    }
  }, [form, validateForm, router, errors, onSearchSuccess, onSearchError, onSearchRefetch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestsDropdownRef.current && !guestsDropdownRef.current.contains(event.target as Node)) {
        closeGuestsDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeGuestsDropdown]);

  const handleReserveRoom = (room: any, option: any, hotelDetails: any) => {
    const roomData = {
      hotelDetails,
      room,
      option,
    };
    dispatch(setSeletecRoom(roomData));
  };

  const resetForm = useCallback(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setForm({
      checkin: formatDate(today),
      checkout: formatDate(tomorrow),
      rooms: 1,
      adults: 2,
      children: 0,
      nationality: initialNationality,
      currency: initialCurrency || "USD",
      children_ages: [], // 👈 Reset
    });
    setErrors({});
    closeGuestsDropdown();
  }, [initialNationality, closeGuestsDropdown, formatDate]);

  const setExternalForm = useCallback((newForm: Partial<HotelForm>) => {
    setForm(prev => ({ ...prev, ...newForm }));
  }, []);

  return {
    form,
    errors,
    showGuestsDropdown,
    isSearching,
    totalGuests,
    isFormValid,
    guestsDropdownRef,
    handleChange,
    updateForm, // Now handles children_ages
    toggleGuestsDropdown,
    closeGuestsDropdown,
    onSubmit,
    resetForm,
    setExternalForm,
    validateForm,
    formatDate,
    handleReserveRoom,
  };
};