import { brl, descPct, ratingFmt } from '../../lib/format'

function CompareColumn({ offer, conta, onContact }) {
  const rows = [
    { label: 'Desconto', value: descPct(offer.pct), valueClass: 'font-bold text-green-600' },
    { label: 'Distribuidora', value: offer.dist, valueClass: 'font-semibold text-slate-700' },
    { label: 'UF', value: offer.uf, valueClass: 'font-semibold text-slate-700' },
    { label: 'Conexão', value: offer.tipo, valueClass: 'font-semibold text-slate-700' },
    { label: 'Fidelidade', value: offer.prazo, valueClass: 'font-semibold text-slate-700' },
    {
      label: 'Energia limpa',
      value: offer.limpa ? 'Sim' : 'Não',
      valueClass: 'font-semibold text-slate-700',
    },
  ]

  return (
    <div className="glass-strong min-w-[260px] flex-1 overflow-hidden rounded-2xl">
      <div className="bg-brand-600 px-[18px] pb-4 pt-[18px]">
        <div className="flex items-center gap-[10px]">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white font-display text-[13px] font-bold text-brand-600">
            {offer.initials}
          </span>
          <div>
            <div className="text-[15px] font-semibold text-white">{offer.name}</div>
            <div className="text-[12px] text-brand-200">
              {offer.reviews > 0 ? `★ ${ratingFmt(offer.rating)} · ${offer.reviews}` : 'Nova no marketplace'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-[18px]">
        <div className="rounded-xl bg-green-50 p-[14px] text-center">
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-green-600">
            Economia / mês
          </div>
          <div className="mt-[2px] font-display text-[30px] font-bold text-green-500">
            {brl(conta * offer.pct)}
          </div>
          <div className="text-[13px] font-semibold text-green-600">
            {brl(conta * offer.pct * 12)} / ano
          </div>
        </div>

        <div className="mt-4 grid gap-0">
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`flex justify-between py-[10px] ${
                i < rows.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <span className="text-[13px] text-slate-400">{r.label}</span>
              <span className={`text-[13.5px] ${r.valueClass}`}>{r.value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onContact}
          className="mt-[14px] w-full cursor-pointer rounded-xl border-none bg-green-500 p-3 text-[15px] font-semibold text-white hover:bg-green-600"
        >
          Solicitar contato
        </button>
      </div>
    </div>
  )
}

export default function Comparar({ nav, offers, conta, compared, openContact }) {
  const compareOffers = offers.filter((o) => compared.includes(o.id))

  return (
    <section className="mx-auto max-w-container px-6 pb-[90px] pt-8">
      <button
        onClick={nav.goOfertas}
        className="flex cursor-pointer items-center gap-[6px] border-none bg-transparent p-0 text-sm font-semibold text-brand-600"
      >
        ← Voltar para ofertas
      </button>
      <h1 className="mt-[14px] text-[30px] font-bold text-brand-900">Comparação lado a lado</h1>

      {compareOffers.length > 0 && (
        <div className="mt-6 flex gap-[18px] overflow-x-auto pb-2">
          {compareOffers.map((offer) => (
            <CompareColumn
              key={offer.id}
              offer={offer}
              conta={conta}
              onContact={() => openContact(offer.id)}
            />
          ))}
        </div>
      )}

      {compareOffers.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
          <div className="text-[40px]">⚖️</div>
          <h3 className="mt-2 text-[20px] font-semibold">Nenhuma oferta selecionada</h3>
          <p className="mt-[6px] text-[15px] text-slate-500">
            Volte para a lista e toque em <strong>Comparar</strong> em até 3 ofertas.
          </p>
          <button
            onClick={nav.goOfertas}
            className="mt-5 cursor-pointer rounded-xl border-none bg-brand-600 px-[22px] py-3 text-[15px] font-semibold text-white"
          >
            Ver ofertas
          </button>
        </div>
      )}
    </section>
  )
}
