import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 min-h-screen overflow-hidden bg-gray-900">
      <img
        src="/images/signin/image.png"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gray-950/55" />
      <div className="relative flex min-h-screen w-full flex-col justify-center sm:p-0 lg:flex-row">
        <div className="relative z-10 flex min-h-screen w-full flex-1 flex-col justify-center bg-white/87 px-6 backdrop-blur-sm sm:p-0 lg:w-1/2 lg:bg-white/80 dark:bg-gray-900/90">
          {children}
        </div>
        <div className="relative hidden h-full w-full items-center overflow-hidden lg:grid lg:w-1/2">
          <div className="relative z-1 flex items-center justify-center">
            <GridShape />
          </div>
        </div>

        <div className="fixed inset-e-6 bottom-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
