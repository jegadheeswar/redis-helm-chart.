import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showLocation?: boolean;
  showHeader?: boolean;
}

export function PageLayout({
  children,
  title,
  showLocation = true,
  showHeader = true,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header title={title} showLocation={showLocation} />}
      <main className="pb-20 max-w-lg mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
