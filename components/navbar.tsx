"use client";
import React, { useState } from "react";
import Container from "./container";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";
import MenuButton from "@/icons/hamburger";
import XMark from "@/icons/xMark";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./button";
import { set } from "zod";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [signingOut, setSigningOut] = useState<boolean>(true);

  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const menuItems = [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    ...(isSignedIn
      ? [
          { name: "Dashboard", href: "/dashboard" },
          { name: "Workspaces", href: "/workspaces" },
        ]
      : [
          { name: "Login", href: "/sign-in" },
          { name: "Register", href: "/sign-up" },
        ]),
  ];

  const mobileMenuToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    setSigningOut(true);
    signOut();
    setSigningOut(false);
  };

  return (
    <>
      <Container className="font-quicksand fixed top-0 left-1/2 z-50 w-full -translate-x-1/2 transform rounded-sm bg-neutral-900 px-3 py-4 shadow-md sm:px-4 md:w-3/4">
        <div className="flex items-center justify-between">
          {/* logo/title - left*/}
          <Link
            href={"/"}
            className="bg-gradient-to-b from-slate-300 to-gray-500 bg-clip-text text-2xl font-bold text-transparent"
          >
            iNK NOTE
          </Link>

          {/* Menu items - right */}
          <div className="items-center">
            {/* web menu style */}
            <div className="hidden items-center md:flex">
              {menuItems.map((item, index) => (
                <Link
                  href={item.href}
                  key={index}
                  className="mx-2 text-neutral-400 transition-colors duration-200 hover:text-neutral-500 focus:text-neutral-300"
                  aria-label={item.name}
                >
                  {item.name}
                </Link>
              ))}
              {isSignedIn && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSignOut}
                >
                  {signingOut ? "Signing Out..." : "Sign Out"}
                </Button>
              )}
            </div>
            {/* mobile menu style */}
            <div className="mr-2 flex md:hidden">
              <button
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
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
            className="fixed top-20 left-1/2 z-40 w-full -translate-x-1/2 transform space-y-3 rounded-lg bg-neutral-800 px-6 py-4 shadow-lg sm:w-3/4 md:hidden"
          >
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-neutral block font-medium transition-colors duration-200 hover:text-blue-600"
              >
                {item.name}
              </Link>
            ))}
            {isSignedIn && (
              <Button
                type="button"
                variant="primary"
                onClick={handleSignOut}
                className="w-full text-center"
              >
                {signingOut ? "Signing Out..." : "Sign Out"}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
