import React from "react";
import Container from "./container";
import Button from "./button";

export default function Hero() {
  return (
    <Container className="my-40 flex">
      <div className="mx-3 flex w-full flex-col md:mx-auto md:max-w-2xl">
        <h1 className="bg-gradient-to-b from-slate-300 to-gray-500 bg-clip-text text-center text-3xl leading-tight font-bold tracking-tight text-transparent sm:text-2xl md:text-5xl">
          Take Notes, Stay Organized Collaborate in Real-Time
        </h1>
        <p className="text-md mt-2 w-full text-center tracking-wide text-neutral-500 sm:text-sm md:mt-4 md:text-xl">
          Write, edit, and manage your notes with autosave, private folders, and
          seamless collaboration — all in a clean, modern interface.
        </p>
        <div className="mt-6 flex w-full items-center justify-center gap-4">
          <Button variant="primary">Start Writing</Button>
          <Button variant="secondary">Explore Features</Button>
        </div>
      </div>
    </Container>
  );
}
