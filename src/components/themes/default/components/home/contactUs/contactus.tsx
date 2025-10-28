"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSelector } from "react-redux";


// Fix Leaflet marker icon issue in Next.js / React
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
import useLocale from "@hooks/useLocale";
import useDictionary from "@hooks/useDict";

  import L from "leaflet";
import { useAppSelector } from "@lib/redux/store";



const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

  
  

// Lahore Coordinates
const lahorePosition: [number, number] = [31.582045, 74.329376];



export default function Contactus() {

  const { locale } = useLocale();
        const { data: dict, isLoading } = useDictionary(locale as any);



const app = useAppSelector((state) => state.appData?.data);



console.log("App data in contact us:", app);

  return (
    <div className="appHorizantalSpacing max-w-[1200px] mx-auto">
      <div className="border border-gray-300 rounded-md my-6">
          <h1 className="font-bold p-5">{dict?.contact?.contact_us || "Contact us"}</h1>
          <hr className="border-gray-300" />
          <div className="grid grid-cols-12 p-5 gap-4">
            
            {/* LEFT SIDE - CONTACT INFO */}
            <div className="col-span-12 md:col-span-4 p-5">
              <div className="flex flex-col gap-6">

                {/* Address */}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </span>
                    <strong>{dict?.contact?.address || "Address"}</strong>
                  </div>
                  <p className="font-[400]">{app?.app?.address}</p>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4
                        c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <strong>{dict?.contact?.email || "Email"}</strong>
                  </div>
                  <p className="font-[400]">{app?.app?.contact_email}</p>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                        viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2
                        19.79 19.79 0 0 1-8.63-3.07 19.5 19.5
                        0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2
                        2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72
                        12.84 12.84 0 0 0 .7 2.81 2 2 0 0
                        1-.45 2.11L8.09 9.91a16 16 0 0 0
                        6 6l1.27-1.27a2 2 0 0 1
                        2.11-.45 12.84 12.84 0 0 0
                        2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </span>
                    <strong>{dict?.contact?.phone || "Phone"}</strong>
                  </div>
                  <p className="font-[400]">{app?.app?.contact_phone}</p>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE - MAP */}
            <div className="col-span-12 md:col-span-8 h-[400px] w-full">
              <MapContainer
                center={lahorePosition}
                zoom={12}
                style={{ width: "100%", height: "100%", borderRadius: "8px", zIndex: 0 }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={lahorePosition}>
                  <Popup>Lahore, Pakistan 🇵🇰</Popup>
                </Marker>
              </MapContainer>
            </div>

          </div>
        </div>
    </div>
  );
}



// import React, { useState } from 'react';
// import { Icon } from '@iconify/react';
// import L from 'leaflet';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';   