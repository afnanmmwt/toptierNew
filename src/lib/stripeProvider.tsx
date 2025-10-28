
'use client';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';

// Load your publishable key
const publishable="pk_test_8AC8l99Oese5uC8AChEM1mfD003RlIODfs"
const stripePromise = loadStripe(publishable);

export default function StripeProvider({ children }: { children: React.ReactNode }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}

