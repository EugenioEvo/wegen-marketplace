import Logo from './Logo'

export default function Header({ nav, authed, isAdmin, onSignOut }) {
  const links = [
    { label: 'Para minha casa', onClick: nav.goHome },
    { label: 'Para minha empresa', onClick: nav.goEmpresa },
    { label: 'Ofertas', onClick: nav.goOfertas },
    { label: 'Sou ofertante', onClick: nav.goPainel },
  ]

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200 border-white/60 bg-white/[0.55] backdrop-blur-[18px] backdrop-saturate-[170%]"
    >
      <div className="mx-auto flex h-[68px] max-w-container items-center justify-between gap-4 px-6">
        {/* Logo */}
        <button onClick={nav.goHome} className="flex cursor-pointer items-center border-none bg-transparent p-0">
          <Logo height={36} />
        </button>

        {/* Navegação */}
        <nav className="flex flex-wrap items-center gap-[6px]">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={l.onClick}
              className="cursor-pointer rounded-[9px] border-none bg-transparent px-3 py-2 text-[14.5px] font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-[10px]">
          {isAdmin && (
            <button
              onClick={nav.goAdmin}
              className="cursor-pointer border-none bg-transparent px-[6px] py-2 text-[14.5px] font-semibold text-solar-600"
            >
              Admin
            </button>
          )}
          {authed ? (
            <button
              onClick={onSignOut}
              className="cursor-pointer border-none bg-transparent px-[6px] py-2 text-[14.5px] font-semibold text-brand-600"
            >
              Sair
            </button>
          ) : (
            <button
              onClick={nav.goPainel}
              className="cursor-pointer border-none bg-transparent px-[6px] py-2 text-[14.5px] font-semibold text-brand-600"
            >
              Entrar
            </button>
          )}
          <button
            onClick={nav.goHome}
            className="cursor-pointer rounded-xl border-none bg-brand-600 px-[18px] py-[11px] text-[14.5px] font-semibold text-white hover:bg-brand-700"
          >
            Simular economia
          </button>
        </div>
      </div>
    </header>
  )
}
