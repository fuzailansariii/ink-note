"use client";
import Container from "@/components/container";
import React from "react";

export default function About() {
  return (
    <Container className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-semibold font-quicksand">About Us</h1>
        <p className="mt-4 text-lg font-nunito">
          Welcome to iNK Note, your go-to platform for secure and efficient
          note-taking. We prioritize your privacy and data security while
          providing a seamless user experience.
        </p>
      </div>
    </Container>
  );
}
