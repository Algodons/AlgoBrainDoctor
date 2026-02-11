import { ReactNode } from 'react';
import TopNav from './TopNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-layout">
      <TopNav />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
