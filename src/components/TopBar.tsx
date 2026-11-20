import { useState } from 'react';
import { Menu, Upload, X } from 'lucide-react';
import type { ActiveSection } from '../types/portfolio';

interface TopBarProps {
  portfolioName: string;
  activeSection: ActiveSection;
  onNavigate: (section: ActiveSection) => void;
  onOpenUpload: () => void;
}

const NAV_ITEMS: { id: ActiveSection; label: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'archivos', label: 'Archivos' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'administrar', label: 'Administrar' },
];

export function TopBar({
  portfolioName,
  activeSection,
  onNavigate,
  onOpenUpload,
}: TopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: ActiveSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E3DFD6] bg-[#F6F4EF]/92 backdrop-blur-md dark:border-[#2A2926] dark:bg-[#131312]/92">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 md:gap-8 lg:px-8">
        {/* Zone 1: Single-line brand title */}
        <button
          type="button"
          onClick={() => handleNavClick('inicio')}
          className="font-display min-w-0 flex-1 truncate text-left text-base font-bold tracking-tight text-[#22211F] transition-colors hover:text-[#4E687A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4E687A] whitespace-nowrap md:flex-none md:max-w-[260px] sm:text-lg dark:text-[#F2EFE9] dark:hover:text-[#9DB6C8]"
        >
          {portfolioName}
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-6 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4E687A] ${
                  isActive
                    ? 'text-[#22211F] dark:text-[#F2EFE9]'
                    : 'text-[#666159] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:text-[#F2EFE9]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-[#4E687A] dark:bg-[#89A5B8]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (+ mobile menu trigger on small screens) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4E687A] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#3F5666] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4E687A] whitespace-nowrap shrink-0 sm:gap-2 sm:px-4 sm:text-sm dark:bg-[#5E7C91] dark:hover:bg-[#4E687A]"
          >
            <Upload className="h-4 w-4" />
            <span>Subir</span>
            <span className="hidden sm:inline">archivo</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#DCD6CA] bg-[#FDFCF9] text-[#4C4842] hover:bg-[#EFECE4] md:hidden dark:border-[#2E2D2A] dark:bg-[#1C1B19] dark:text-[#D5D0C7] dark:hover:bg-[#262522]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navegación móvil"
          className="border-t border-[#E3DFD6] bg-[#FDFCF9] px-4 py-3 md:hidden dark:border-[#2A2926] dark:bg-[#181816]"
        >
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E9EFF3] text-[#2B3F4D] dark:bg-[#232D35] dark:text-[#DDE7EE]'
                      : 'text-[#5E5951] hover:bg-[#F3F0E9] hover:text-[#22211F] dark:text-[#A39E94] dark:hover:bg-[#22211E] dark:hover:text-[#F2EFE9]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="text-xs font-medium text-[#4E687A] dark:text-[#9DB6C8]">
                      Actual
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
