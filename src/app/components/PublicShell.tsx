"use client";

import { usePathname } from "next/navigation";
import Preloader from "./Preloader";
import Headers from "./Headers";
import Footer from "./footer/Footer";
import BookingModal from "./booking/BookingModal";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-screen flex flex-col bg-[#111204] text-neutral-100">{children}</div>;
  }

  return (
    <>
      <Preloader />
      <Headers />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <BookingModal />
    </>
  );
}
