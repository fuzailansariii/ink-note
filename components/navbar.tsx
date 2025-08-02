"use client";
import React from "react";
import Container from "./container";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import MenuButton from "@/icons/hamburger";
import XMark from "@/icons/xMark";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const { isSignedIn } = useUser();
  const menuItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    ...(isSignedIn
      ? [{ name: "Dashboard", href: "/dashboard" }]
      : [
          { name: "Login", href: "/sign-in" },
          { name: "Register", href: "/sign-up" },
        ]),
  ];

  const mobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <>
      <Container className="w-full sm:px-4 md:w-3/4 px-3 py-4 font-quicksand rounded-sm fixed top-0 left-1/2 transform -translate-x-1/2 bg-white shadow-md z-50">
        <div className="flex justify-between items-center">
          {/* logo/title - left*/}
          <Link href={"/"} className="text-2xl font-bold text-gray-800">
            iNK NOTE
          </Link>

          {/* Menu items - right */}
          <div className="items-center">
            {/* web menu style */}
            <div className="hidden md:flex">
              {menuItems.map((item, index) => (
                <Link
                  href={item.href}
                  key={index}
                  className="mx-2 text-gray-600 hover:text-gray-800"
                  aria-label={item.name}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {/* mobile menu style */}
            <div className="flex md:hidden mr-2">
              <button
                className=" text-gray-600 hover:text-gray-800 focus:outline-none"
                onClick={mobileMenuToggle}
              >
                {mobileMenuOpen ? <XMark /> : <MenuButton />}
              </button>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile menu animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden fixed top-20 left-1/2 transform -translate-x-1/2 w-full sm:w-3/4 bg-white shadow-lg rounded-lg z-40 px-6 py-4 space-y-3"
          >
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
