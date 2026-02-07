import { useState } from 'react';
import HomePage from './pages/HomePage';
import OperatorDashboard from './pages/OperatorDashboard';
import './styles/index.css';
import './styles/components.css';

type Page = 'home' | 'operator';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', page === 'home' ? '/' : `/${page}`);
  };

  window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    if (path === '/operator') setCurrentPage('operator');
    else setCurrentPage('home');
  });

  return (
    <div className="app" onClick={(e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href === '/operator') handleNavigation('operator');
        else if (href === '/') handleNavigation('home');
      }
    }}>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'operator' && <OperatorDashboard />}
    </div>
  );
}
