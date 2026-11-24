interface TopBarProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenPutaway: () => void;
  onOpenSearch: () => void;
}

export function TopBar({
  onNavigateSection,
  onOpenPutaway,
  onOpenSearch,
}: TopBarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#indicadores"
          onClick={(e) => {
            e.preventDefault();
            onNavigateSection('indicadores');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Gestão WMS
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#indicadores"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('indicadores');
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-slate-300"
          >
            Indicadores
          </a>
          <a
            href="#mapa-armazem"
            onClick={(e) => {
              e.preventDefault();
              onNavigateSection('mapa-armazem');
            }}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-slate-300"
          >
            Mapa Visual
          </a>
          <button
            type="button"
            onClick={onOpenPutaway}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-slate-300 cursor-pointer"
          >
            Recebimento
          </button>
          <button
            type="button"
            onClick={onOpenSearch}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-slate-300 cursor-pointer"
          >
            Consulta e Picking
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenPutaway}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Nova Entrada
          </button>
        </div>
      </div>
    </header>
  );
}
