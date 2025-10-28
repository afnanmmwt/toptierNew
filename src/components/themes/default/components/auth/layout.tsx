import * as React from "react";
// import Image from "next/image";

export interface LayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  dict?: any;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
   <div className="min-h-screen w-full bg-amber-200 flex flex-col md:flex-row">

  {/* ------------------ IMAGE SECTION ------------------ */}
  <div
    className="w-full md:w-3/5 min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800"
    style={{
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.7)), url('/images/auth_image.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    <div className="max-w-lg xl:max-w-md lg:max-w-full mx-auto  flex flex-col justify-center items-center text-center px-4">
      <h2 className="text-4xl font-extrabold text-white mb-3">
        Top Tier Travel
      </h2>
      <p className="text-white text-lg mb-6">
        Discover extraordinary destinations and create unforgettable memories
      </p>
    </div>
  </div>

  {/* ------------------ FORMS SECTION ------------------ */}
  <div className="bg-white dark:bg-gray-800 w-full md:w-2/5 min-h-screen flex items-center justify-center">
    <section className="w-full h-full">
      {children}
    </section>
  </div>

</div>

  );
}
