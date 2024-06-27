import { ReactNode } from "react";

export const Layout = ({ children }: { children: any }): ReactNode => {
  return (
    <div className="flex w-full min-h-[100vh] bg-white text-black">
      {children}
    </div>
  );
};
