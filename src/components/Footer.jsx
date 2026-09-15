import Logo from './Logo'

const COLUMNS = [
  {
    title: 'Para você',
    links: ['Simular economia', 'Ver ofertas', 'Como funciona', 'Energia para empresas'],
  },
  {
    title: 'Ofertantes',
    links: ['Seja um ofertante', 'Painel de leads', 'Criar oferta'],
  },
  {
    title: 'Institucional',
    links: ['Grupo Evolight', 'Privacidade (LGPD)', 'Termos de uso', 'Contato'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-200">
      <div className="mx-auto grid max-w-container grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8 px-6 pb-8 pt-12">
        <div>
          <Logo dark height={32} />

          <p className="mt-[14px] max-w-[240px] text-[13.5px] leading-[1.55]">
            Marketplace de energia do Grupo Evolight. Conecta quem quer vender com quem quer comprar.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="text-[13px] font-semibold uppercase tracking-[0.05em] text-white">
              {col.title}
            </div>
            <div className="mt-[14px] grid gap-[10px] text-sm">
              {col.links.map((link) => (
                <a key={link} href="#" className="text-brand-200 no-underline">
                  {link}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-brand-700">
        <div className="mx-auto max-w-container px-6 py-[18px] text-[12.5px] text-brand-300">
          © 2026 WeGen · Grupo Evolight. Valores de economia são estimativas não vinculantes.
        </div>
      </div>
    </footer>
  )
}
