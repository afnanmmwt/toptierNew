"use client";

import React, { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useAppSelector } from "@lib/redux/store";
import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";
import {
  cancel_payment,
  prapare_payment,
  processed_payment,
} from "@src/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Traveller {
  traveller_type: string;
  title: string;
  first_name: string;
  last_name: string;
}

interface RoomData {
  id: string;
  name: string;
  price: string;
  currency: string;
  room_price: string;
  room_name: string;
  room_quantity: string;
  room_price_per_night: string;
}

interface HotelInvoiceProps {
  invoiceDetails: any[];
}

const HotelInvoice: React.FC<HotelInvoiceProps> = ({ invoiceDetails }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const appData = useAppSelector((state) => state.appData?.data?.app);
  // console.log(appData);
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);
  const [showInvoiceImage, setShowInvoiceImage] = useState(false);
  const lang = locale || "en";
  const router = useRouter();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    invoiceDetails[0]?.payment_gateway || ""
  );

  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!invoiceDetails?.length) {
    return (
      <div className="container">
        <div className="invoiceCard flex items-center justify-center min-h-[500px] text-gray-600 text-lg">
          {dict?.hotelInvoice?.errors?.noInvoiceFound}
        </div>
      </div>
    );
  }

  const data = invoiceDetails[0];
  const travellers: Traveller[] = JSON.parse(data.guest || "[]");
  const rooms: RoomData[] = JSON.parse(data.room_data || "[]");
  const child_ages: any[] = JSON.parse(data.child_ages || "[]");
  let childCounter = 0;
  const booking_Data = JSON.parse(data.booking_data);
  const invoiceDetailsBooking = JSON.parse(data.booking_data || "{}");
  const invoiceUrl = `${window.location.origin}/hotels/invoice/${data.booking_ref_no}`;
  const bookingData = {
    paymentStatus: data.payment_status,
    bookingStatus: data.booking_status,
    phone: data.phone || "N/A",
    email: data.email || "N/A",
    bookingId: data.booking_id,
    bookingReference: data.booking_ref_no,
    bookingDate: data.booking_date,
    travellers,
    hotel: {
      name: data.hotel_name,
      rating: Number(data.stars) || 0,
      address: data.hotel_address || "N/A",
      location: data.location,
      phone: data.hotel_phone || "N/A",
      email: data.hotel_email || "N/A",
      website: data.hotel_website || "N/A",
      image: data.hotel_img,
    },
    room: {
      checkin: data.checkin,
      checkout: data.checkout,
      totalNights: 1,
      type: rooms[0]?.room_name || "N/A",
      quantity: rooms[0].room_quantity,
      price: rooms[0]?.room_price_per_night || data.price_markup,
      currency: rooms[0]?.currency || data.currency_markup,
    },
    taxes: data.tax || "0",
    total: `${booking_Data.currency} ${booking_Data.markup_price}`,
    customer: {
      email: data.email || "N/A",
      contact: data.phone || "N/A",
      address: data.address || "N/A",
    },
    customerCare: {
      email: "support@toptiertravel.vip",
      contact: "+971-000-0000",
      website: "https://toptiertravel.vip",
    },
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setIsDownloading(true);

    // make src absolute + set crossorigin BEFORE load
    const ensureAbsoluteUrls = () => {
      const images = invoiceRef.current!.querySelectorAll("img");
      images.forEach((img) => {
        // VERY IMPORTANT: set crossOrigin first
        img.setAttribute("crossorigin", "anonymous");

        const raw = img.getAttribute("src") || "";
        if (raw && !/^https?:\/\//i.test(raw)) {
          try {
            img.src = new URL(raw, window.location.origin).href;
          } catch {
            img.src = "https://via.placeholder.com/150?text=No+Image";
          }
        }
      });
    };

    // off-origin images ko apni proxy se guzaro (so canvas is readable)
    const routeExternalThroughProxy = () => {
      const origin = window.location.origin;
      const images = invoiceRef.current!.querySelectorAll("img");
      images.forEach((img) => {
        try {
          const u = new URL(img.src);
          if (u.origin !== origin) {
            img.setAttribute("crossorigin", "anonymous");
            img.src = `${origin}/api/image-proxy?url=${encodeURIComponent(
              img.src
            )}`;
          }
        } catch {
          // ignore
        }
      });
    };

    // Preload after swapping to proxy
    const preloadImages = async () => {
      const images = Array.from(invoiceRef.current!.querySelectorAll("img"));
      await Promise.all(
        images.map((img) =>
          img.complete && img.naturalHeight > 0
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              })
        )
      );
    };

    ensureAbsoluteUrls();
    routeExternalThroughProxy();
    await preloadImages();

    const style = document.createElement("style");
    style.innerHTML = `
    .pdf-rendering {
      width: 800px !important;
      margin: 0 auto !important;
      padding: 15px !important; /* Reduced from 20px */
      background: white !important;
      box-sizing: border-box !important;
      font-family: Arial, sans-serif !important;
      font-size: 11px !important; /* Slightly smaller */
      line-height: 1.3 !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    .pdf-rendering * {
      box-sizing: border-box !important;
      font-family: inherit !important;
      font-size: inherit !important;
      line-height: inherit !important;
      color: #000 !important;
      background: none !important;
      border: none !important;
      outline: none !important;
      padding: 0 !important;
      margin: 0 !important;
      text-align: left !important;
      vertical-align: top !important;
    }

    /* Header */
    .pdf-rendering .header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 15px !important;
      padding: 15px 0 !important;
      border-bottom: 1px solid #e5e7eb !important;
    }

    .pdf-rendering .logo {
      height: 70px !important;
      width: auto !important;
      object-fit: contain !important;
    }

    .pdf-rendering .headerInfo {
      flex: 1 !important;
      text-align: left !important;
    }

    .pdf-rendering .headerText {
      font-size: 11px !important;
      font-weight: 600 !important;
      display: inline-block !important;
      margin-right: 5px !important;
    }

    .pdf-rendering .paymentStatus{
      font-size: 11px !important;
      font-weight: 600 !important;
      color: #16a34a !important;
    }
    .pdf-rendering .bookingStatus {
      font-size: 11px !important;
      font-weight: 600 !important;
      color: #4f63eb !important;
    }

    .pdf-rendering .contactInfo {
      font-size: 11px !important;
      color: #4b5563 !important;
      margin-top: 5px !important;
    }

    .pdf-rendering .qrCode {
      width: 70px !important;
      height: 70px !important;
      cursor: pointer !important;
    }

    .pdf-rendering .qrImage {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
    }

    /* Booking Info in Header */
    .pdf-rendering .bookingInfoInHeader {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 10px !important;
      margin-top: 5px !important;

    }

    .pdf-rendering .bookingInfoItem {
      display: flex !important;
      flex-direction: column !important;
      font-size: 10px !important;
      gap: 2px !important;
    }

    .pdf-rendering .bookingInfoLabel {
      font-weight: 600 !important;
      color: #6b7280 !important;
    }

    .pdf-rendering .bookingInfoValue {
      font-weight: 500 !important;
      color: #111827 !important;
    }

    /* Payment Section */
    .pdf-rendering .paymentSection {
      margin-top: 15px !important;
      padding: 10px !important;
      background: white !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 6px !important;
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 10px !important;
      align-items: center !important;
    }

    .pdf-rendering .paymentTitle {
      font-size: 12px !important;
      font-weight: 600 !important;
      color: #1f2937 !important;
    }

    .pdf-rendering .dropdownButton {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 6px 10px !important;
      border: 1px solid #d1d5db !important;
      border-radius: 4px !important;
      background: white !important;
      font-size: 11px !important;
      color: #111827 !important;
    }

    .pdf-rendering .dropdownContent {
      padding: 6px !important;
      max-height: 120px !important;
      overflow-y: auto !important;
    }

    .pdf-rendering .paymentOption {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      cursor: pointer !important;
      padding: 6px !important;
      font-size: 11px !important;
      border-radius: 4px !important;
    }

    .pdf-rendering .paymentOptionSelected {
      background: #dbeafe !important;
      color: #1e40af !important;
    }

    .pdf-rendering .paymentIcon {
      width: 18px !important;
      height: 18px !important;
      border-radius: 3px !important;
    }

    .pdf-rendering .iconPlaceholder {
      width: 18px !important;
      height: 18px !important;
      background: #e5e7eb !important;
      border-radius: 3px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 9px !important;
    }

    .pdf-rendering .payButton {
      padding: 6px 12px !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      font-weight: 500 !important;
      color: white !important;
      width: 100% !important;
      background: #1e3a8a !important;
      text-align: center !important;
    }

    .pdf-rendering .payButton:disabled {
      background: #9ca3af !important;
      cursor: not-allowed !important;
    }

    .pdf-rendering .totalAmount {
      font-size: 14px !important;
      font-weight: 700 !important;
      color: #1f2937 !important;
      text-align: right !important;
    }

    /* Content */
    .pdf-rendering .content {
      padding: 15px 0 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 15px !important;
    }

    .pdf-rendering .bookingNote {
      border: 1px solid #fecaca !important;
      background: #fee2e2 !important;
      border-radius: 4px !important;
      padding: 8px !important;
      text-align: start !important;
    }

    .pdf-rendering .bookingGrid {
      display: grid !important;
      grid-template-columns: repeat(5, 1fr) !important;
      gap: 8px !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 4px !important;
      padding-bottom: 13px !important;
      padding-left: 8px !important;
    }

    .pdf-rendering .bookingItem {
      display: flex !important;
      flex-direction: column !important;
    }

    .pdf-rendering .bookingLabel {
      font-size: 10px !important;
      font-weight: 600 !important;
      color: #6b7280 !important;
      margin-bottom: 3px !important;
    }

    .pdf-rendering .bookingValue {
      font-size: 11px !important;
      font-weight: 500 !important;
    }

    .pdf-rendering .travellersSection {
      border: 1px solid #e5e7eb !important;
      border-radius: 4px !important;
      padding: 8px !important;
    }

    .pdf-rendering .travellersTitle {
      font-size: 11px !important;
      font-weight: 700 !important;
      color: #374151 !important;
      margin-bottom: 12px !important;
      padding-bottom: 8px !important;
      text-transform: uppercase !important;
    }

    .pdf-rendering .tableContainer {
      overflow-x: auto !important;
    }

    .pdf-rendering .table {
      width: 100% !important;
      font-size: 11px !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 3px !important;
    }

    .pdf-rendering .tableHeader {
      background: #f9fafb !important;
    }

    .pdf-rendering .tableCell {
      text-align: left !important;
      padding-left: 8px !important;
      padding-top: 5px !important;
      padding-bottom: 13px !important;
      font-weight: 600 !important;
      color: #4b5563 !important;
    }

    .pdf-rendering .tableRow {
      border-top: 1px solid #f3f4f6 !important;
    }

    .pdf-rendering .hotelCard {
      display: flex !important;
      gap: 40px !important;
      flex-direction: row !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 6px !important;
      overflow: hidden !important;
      background: white !important;
    }

    .pdf-rendering .hotelImage {
      width: 350px !important; /* Reduced from 300px */
      height: 210px !important;
      object-fit: cover !important;
    }

    .pdf-rendering .hotelInfo {
      flex: 1 !important;
      padding: 8px !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
    }

    .pdf-rendering .hotelName {
      font-size: 1.25rem !important;
      font-weight: 700 !important;
      color: #111827 !important;
      margin-bottom: 4px !important;
    }

    .pdf-rendering .starRating {
      display: flex !important;
      align-items: center !important;
      margin-bottom: 12px !important;
    }

    .pdf-rendering .star {
      color: #f97316 !important;
      font-size: 1rem !important;
    }

    .pdf-rendering .hotelAddress {
      font-size: 0.75rem !important;
      color: #4b5563 !important;
      margin-bottom: 12px !important;
    }

    .pdf-rendering .hotelContact {
      font-size: 0.75rem !important;
      color: #374151 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 3px !important;
    }

    .pdf-rendering .roomSection {
      border: 1px solid #e5e7eb !important;
      border-radius: 4px !important;
      padding-top: 5px !important;
      padding-bottom: 6px !important;
      padding-left: 8px !important;
    }

    .pdf-rendering .roomTitle {
      font-size: 12px !important;
      font-weight: 700 !important;
      color: #1f2937 !important;
      margin-bottom: 6px !important;
      border-bottom: 1px solid #e5e7eb !important;
      padding-bottom: 15px !important;
    }

    .pdf-rendering .roomTable {
      width: 100% !important;
      font-size: 11px !important;
    }

    .pdf-rendering .roomRow {
      border-bottom: 1px solid #f3f4f6 !important;
    }

    .pdf-rendering .roomCell {
      font-weight: 600 !important;
      padding-top: 4px !important;
      padding-bottom: 15px !important;
      padding-right: 8px !important;
    }

    .pdf-rendering .fareSection {
      border: 1px solid #e5e7eb !important;
      border-radius: 6px !important;
      padding: 8px !important;
    }

    .pdf-rendering .rateComment {
      margin-bottom: 6px !important;
    }

    .pdf-rendering .rateCommentTitle {
      font-weight: 700 !important;
      text-align: center !important;
      padding-bottom: 6px !important;
    }

    .pdf-rendering .rateCommentList {
      border: 1px solid #e5e7eb !important;
      border-radius: 4px !important;
      margin-bottom: px !important;
    }

    .pdf-rendering .rateCommentItem {
      padding-bottom: 12px !important;
      padding-left: 7px !important;

    }



    .pdf-rendering .taxRow {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 0px 6px 13px 6px !important;

      background: #f9fafb !important;
      border-radius: 3px !important;
      margin-bottom: 6px !important;
    }

    .pdf-rendering .taxLabel {

      font-size: 11px !important;
      font-weight: 600 !important;
    }

    .pdf-rendering .totalRow {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
       padding: 0px 6px 13px 6px !important;
      background: #f3f4f6 !important;
      border-radius: 3px !important;
    }

    .pdf-rendering .totalLabel {
      font-size: 11px !important;
      font-weight: 700 !important;
    }

    .pdf-rendering .customerGrid {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px !important;
    }

    .pdf-rendering .customerCard {
      border: 1px solid #e5e7eb !important;
      background: #f9fafb !important;
      padding: 4px 8px 17px 8px !important;
      border-radius: 4px !important;
    }

    .pdf-rendering .customerTitle {
      font-size: 11px !important;
      font-weight: 700 !important;
      color: #374151 !important;
      margin-bottom: 6px !important;
    }

    .pdf-rendering .customerInfo {
      font-size: 11px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 3px !important;
    }

    .pdf-rendering .non-printable {
      display: none !important;
    }

    /* Remove scrollbars */
    .pdf-rendering ::-webkit-scrollbar {
      display: none !important;
    }
    .pdf-rendering {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
  `;
    document.head.appendChild(style);
    invoiceRef.current.classList.add("pdf-rendering");

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: false, // ← MUST be false when useCORS is true
        // removeContainer: true,
        imageTimeout: 15000,
        // foreignObjectRendering: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");

      // Fit entire canvas to A4 page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // If height exceeds A4, scale down
      const maxHeight = 297; // A4 height in mm
      let scale = 1;
      if (imgHeight > maxHeight) {
        scale = maxHeight / imgHeight;
      }

      const scaledWidth = pdfWidth * scale;
      const scaledHeight = imgHeight * scale;

      pdf.addImage(imgData, "JPEG", 0, 0, scaledWidth, scaledHeight);

      pdf.save(`Hotel-Invoice-${bookingData.bookingReference}.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Failed to generate PDF. Some images may be blocked by CORS.");
    } finally {
      invoiceRef.current.classList.remove("pdf-rendering");
      style.remove();
      setIsDownloading(false);
    }
  };

  const handleCancellation = async () => {
    setIsCancelling(true);
    try {
      const response = await cancel_payment(invoiceDetails[0].booking_ref_no);
      if (response.status) {
        toast.success(response.message);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error("Cancellation error:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Hotel Booking Confirmation
Booking Reference: ${bookingData.bookingReference}
Hotel: ${bookingData.hotel.name}
Check-in: ${bookingData.room.checkin}
Check-out: ${bookingData.room.checkout}
Guest: ${travellers[0]?.first_name || "N/A"}
Total: ${bookingData.total}
View Invoice: ${invoiceUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="container">
      {/* Printable Invoice Content */}
      <div ref={invoiceRef} className="invoiceCard">
        {/* Header */}
        <div className="header">
          <img
            src={appData.header_logo_img || "https://via.placeholder.com/150"}
            alt="Hotel"
            className="logo"
          />
          <div className="headerRight">
            <div className={lang === "ar" ? "headerInfoAr" : "headerInfo"}>
              <div>
                <span className="headerText">
                  {dict?.hotelInvoice?.header?.paymentStatus}
                </span>
                <span className="paymentStatus">
                  {bookingData.paymentStatus.charAt(0).toUpperCase() +
                    bookingData.paymentStatus.slice(1)}
                </span>
              </div>
              <div>
                <span className="headerText">
                  {dict?.hotelInvoice?.header?.bookingStatus}
                </span>
                <span className="bookingStatus">
                  {bookingData.bookingStatus.charAt(0).toUpperCase() +
                    bookingData.bookingStatus.slice(1)}
                </span>
              </div>
              <div className="contactInfo">
                <div>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.header?.phone}
                  </span>{" "}
                  {bookingData.phone}
                </div>
                <div>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.header?.email}
                  </span>{" "}
                  {bookingData.email}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="qrCode" onClick={() => setShowInvoiceImage(true)}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  invoiceUrl
                )}`}
                alt="QR Code"
                className="qrImage"
              />
            </div>
          </div>
        </div>
        {/* Booking Details */}
        <div className="content">
          {bookingData.paymentStatus === "paid" &&
            data.cancellation_request === "0" && (
              <ul className="rateCommentList">
                <li className="rateCommentItem">
                  <p>
                    <span>
                      Payable through{" "}
                      <span className="font-semibold">{data.supplier}</span>,
                      acting as agent for the service operating company, details
                      of which can be provided upon request. VAT:
                      <span className="font-semibold">{data.vat}</span>{" "}
                      Reference:
                      <span className="font-semibold">{data.pnr}</span>
                    </span>
                  </p>
                </li>
              </ul>
            )}

          {invoiceDetails[0].cancellation_request === "1" && (
            <div className="bookingNote">{dict?.hotelInvoice?.bookingNote}</div>
          )}

          <div className="bookingGrid">
            {[
              {
                label: dict?.hotelInvoice?.bookingInfo?.bookingId,
                value: bookingData.bookingId,
              },
              {
                label: dict?.hotelInvoice?.bookingInfo?.reference,
                value: bookingData.bookingReference,
              },
              {
                label: dict?.hotelInvoice?.bookingInfo?.bookingpnr,
                value: invoiceDetails[0]?.pnr || "N/A",
              },
              {
                label: dict?.hotelInvoice?.bookingInfo?.date,
                value: bookingData.bookingDate,
              },
              {
                label: dict?.hotelInvoice?.bookingInfo?.location,
                value: bookingData.hotel.location,
              },
            ].map((item, i) => (
              <div key={i} className="bookingItem">
                <div className="bookingLabel">{item.label}</div>
                <div className="bookingValue">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="travellersSection">
            <h3 className="travellersTitle">
              {dict?.hotelInvoice?.travellers?.title}
            </h3>
            <div className="tableContainer">
              <table className="table">
                <thead className="tableHeader">
                  <tr>
                    <th className="tableCell">
                      {dict?.hotelInvoice?.travellers?.table?.number}
                    </th>
                    <th className="tableCell">
                      {dict?.hotelInvoice?.travellers?.table?.type}
                    </th>
                    <th className="tableCell">
                      {dict?.hotelInvoice?.travellers?.table?.name}
                    </th>
                    <th className="tableCell">
                      {dict?.hotelInvoice?.travellers?.travellerType}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {travellers.map((t, index) => (
                    <tr key={index} className="tableRow">
                      <td className="tableCell">{index + 1}</td>
                      <td className="tableCell">{t.title}</td>
                      <td className="tableCell">
                        {t.first_name} {t.last_name}
                      </td>
                      <td className="tableCell">
                        {t.traveller_type === "child"
                          ? `${t.traveller_type} (${
                              child_ages[childCounter++]?.ages
                            } year${
                              child_ages[childCounter - 1]?.ages > 1 ? "s" : ""
                            })`
                          : t.traveller_type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hotelCard">
            <div className="hotelImageWrapper">
              <img
                src={bookingData.hotel.image || "/images/default-hotel.jpg"}
                alt={bookingData.hotel.name}
                className="hotelImage"
              />
            </div>
            <div className="hotelInfo">
              <h2 className="hotelName">{bookingData.hotel.name}</h2>
              <div className="starRating">
                {[...Array(bookingData.hotel.rating)].map((_, i) => (
                  <span key={i} className="star">
                    ★
                  </span>
                ))}
              </div>
              <p className="hotelAddress">{bookingData.hotel.address}</p>
              <div className="hotelContact">
                <div>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.hotelInfo?.phone}
                  </span>{" "}
                  {bookingData.hotel.phone || "N/A"}
                </div>
                <div>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.hotelInfo?.email}
                  </span>{" "}
                  {bookingData.hotel.email || "N/A"}
                </div>
                <div>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.hotelInfo?.website}
                  </span>{" "}
                  {bookingData.hotel.website || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="roomSection">
            <h3 className="roomTitle">
              {dict?.hotelInvoice?.roomDetails?.title}
            </h3>
            <table className="roomTable">
              <tbody>
                <tr className="roomRow">
                  <td className="roomCell">
                    {dict?.hotelInvoice?.roomDetails?.checkin}
                  </td>
                  <td className="roomCell">{bookingData.room.checkin}</td>
                </tr>
                <tr className="roomRow">
                  <td className="roomCell">
                    {dict?.hotelInvoice?.roomDetails?.checkout}
                  </td>
                  <td className="roomCell">{bookingData.room.checkout}</td>
                </tr>
                <tr className="roomRow">
                  <td className="roomCell">
                    {dict?.hotelInvoice?.roomDetails?.type}
                  </td>
                  <td className="roomCell">{bookingData.room.type}</td>
                </tr>
                <tr className="roomRow">
                  <td className="roomCell">
                    {dict?.hotelInvoice?.roomDetails?.quantity}
                  </td>
                  <td className="roomCell">{rooms[0]?.room_quantity}</td>
                </tr>
                <tr>
                  <td className="roomCell">{dict?.modal?.roomPriceLabel}</td>
                  <td className="roomCell">
                    {bookingData.room.currency} {bookingData.room.price}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="fareSection">
            {invoiceDetailsBooking?.rateComment !== undefined &&
              invoiceDetailsBooking?.rateComment !== null && (
                <div className="rateComment">
                  <h3 className="rateCommentTitle">Rate Comment</h3>
                  <ul className="rateCommentList">
                    <li className="rateCommentItem">
                      <p>{invoiceDetailsBooking?.rateComment}</p>
                    </li>
                  </ul>
                </div>
              )}

            <div className="taxRow">
              <span className="taxLabel">
                {dict?.hotelInvoice?.fareAndTax?.taxLabel}
              </span>
              <span className="taxLabel">
                {invoiceDetails[0].tax} {"%"}
              </span>
            </div>
            <div className="totalRow">
              <span className="totalLabel">
                {dict?.hotelInvoice?.fareAndTax?.totalLabel}
              </span>
              <span className="totalLabel">{bookingData.total}</span>
            </div>
          </div>

          <div className="customerGrid">
            <div className="customerCard">
              <h4 className="customerTitle">
                {dict?.hotelInvoice?.customer?.title}
              </h4>
              <div className="customerInfo">
                <p>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.customer?.email}
                  </span>{" "}
                  {bookingData.customer.email}
                </p>
                <p>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.customer?.contact}
                  </span>{" "}
                  {bookingData.customer.contact}
                </p>
                <p>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.customer?.address}
                  </span>{" "}
                  {bookingData.customer.address}
                </p>
              </div>
            </div>

            <div className="customerCard">
              <h4 className="customerTitle">
                {dict?.hotelInvoice?.customerCare?.title}
              </h4>
              <div className="customerInfo">
                <p>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.customerCare?.email}
                  </span>{" "}
                  {appData.contact_email}
                </p>
                <p>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.customerCare?.contact}
                  </span>{" "}
                  {appData.contact_phone}
                </p>
                <p>
                  <span className="contactLabel">
                    {dict?.hotelInvoice?.customerCare?.website}
                  </span>{" "}
                  {appData.site_url}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons — Outside printable area */}
      <div className="actionBarOutside">
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="actionButton"
        >
          {isDownloading ? (
            <>
              <Icon
                icon="eos-icons:loading"
                className="loadingIcon"
                width="20"
                height="20"
              />
              <span>{dict?.featured_hotels?.loading || "Loading..."}</span>
            </>
          ) : (
            <>
              <Icon icon="mdi:tray-arrow-down" width="20" height="20" />
              <span>
                {dict?.hotelInvoice?.buttons?.downloadPdf || "Download as PDF"}
              </span>
            </>
          )}
        </button>

        <button onClick={handleShareWhatsApp} className="actionButton">
          <Icon icon="mdi:whatsapp" width="20" height="20" />
          <span>
            {dict?.hotelInvoice?.buttons?.sendToWhatsApp || "Send to WhatsApp"}
          </span>
        </button>

        {booking_Data.cancellation === "1" ? (
          <button
            onClick={handleCancellation}
            className="actionButton cancellationButton"
          >
            {isCancelling ? (
              <>
                <Icon
                  icon="eos-icons:loading"
                  className="loadingIcon"
                  width="20"
                  height="20"
                />
                <span>
                  {dict?.featured_hotels?.cancelling || "جارٍ الإلغاء..."}
                </span>
              </>
            ) : (
              <>
                <Icon icon="mdi:close" width="20" height="20" />
                <span>
                  {dict?.hotelInvoice?.buttons?.requestCancellation ||
                    "Request for Cancellation"}
                </span>
              </>
            )}
          </button>
        ) : (
          <button
            // onClick={handleCancellation}
            className="flex items-center justify-center gap-2 w-full min-w-[160px] bg-white border border-gray-300 rounded-lg shadow-sm px-6 h-11 font-semibold text-gray-800 cursor-not-allowed transition-opacity duration-200"
          >
            {isCancelling ? (
              <>
                <Icon
                  icon="eos-icons:loading"
                  className="animate-spin"
                  width="20"
                  height="20"
                />
                <span>
                  {dict?.featured_hotels?.cancelling || "جارٍ الإلغاء..."}
                </span>
              </>
            ) : (
              <>
                <Icon icon="mdi:close" width="20" height="20" />
                <span>Cancellation Not Available</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default HotelInvoice;
