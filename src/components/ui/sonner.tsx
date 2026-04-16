"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#ffffff",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
