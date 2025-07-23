
import { ReactNode } from "react";
import Navigation from "@/components/Navigation";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      <main className="flex-1 overflow-hidden relative min-h-0">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default MainLayout;
