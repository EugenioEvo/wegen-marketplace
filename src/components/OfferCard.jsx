import { brl, descPct, ratingFmt } from '../lib/format'

export default function OfferCard({ offer, conta, faved, compared, onContact, onFav, onCompare }) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-card-hover ${
        compared ? 'outline outline-2 -outline-offset-1 outline-brand-500' : ''
      }`}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-[10px]">
        <div className="flex items-center gap-[10px]">
          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-brand-50 font-display text-sm font-bold text-brand-600">
            {offer.initials}
          </span>
          <div>
            <div className="text-[15.5px] font-semibold text-slate-900">{offer.name}</div>
            <div className="text-[12.5px] text-slate-400">
              {offer.dist} · {offer.uf}
            </div>
          </div>
        </div>
        <span className="whitespace-nowrap rounded-full bg-green-50 px-[9px] py-[5px] text-[12px] font-bold text-green-600">
          {descPct(offer.pct)}
        </span>
      </div>

      {/* Avaliação */}
      <div className="mt-3 flex items-center gap-[6px]">
        <span className="text-sm text-solar-400">★</span>
        <span className="text-sm font-bold text-slate-900">{ratingFmt(offer.rating)}</span>
        <span className="text-[12.5px] text-slate-400">({offer.reviews} avaliações)</span>
      </div>

      {/* Economia estimada */}
      <div className="mt-[14px] rounded-xl border border-slate-100 bg-slate-50 p-[14px]">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-green-600">
          Economia estimada
        </span>
        <div className="mt-[2px] font-display text-[26px] font-bold leading-[1.1] text-green-500">
          {brl(conta * offer.pct)}
          <span className="text-sm font-semibold text-green-600">/mês</span>
        </div>
        <div className="text-[13px] font-medium text-slate-600">
          {brl(conta * offer.pct * 12)} por ano
        </div>
      </div>

      {/* Tags */}
      <div className="mt-[14px] flex flex-wrap gap-[7px]">
        <span className="rounded-full bg-slate-100 px-[10px] py-1 text-[12px] text-slate-600">
          {offer.tipo}
        </span>
        <span className="rounded-full bg-slate-100 px-[10px] py-1 text-[12px] text-slate-600">
          Fidelidade: {offer.prazo}
        </span>
        {offer.limpa && (
          <span className="rounded-full bg-solar-50 px-[10px] py-1 text-[12px] text-solar-600">
            ⚡ Energia 100% limpa
          </span>
        )}
      </div>

      {/* Ações */}
      <button
        onClick={onContact}
        className="mt-4 w-full cursor-pointer rounded-xl border-none bg-brand-600 p-3 text-[15px] font-semibold text-white hover:bg-brand-700"
      >
        Solicitar contato
      </button>

      <div className="mt-[10px] flex items-center gap-[6px]">
        <button
          onClick={onFav}
          className="flex flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[10px] border border-slate-200 bg-white p-[9px] text-[13px] font-semibold text-slate-600 hover:border-slate-300"
        >
          {faved ? (
            <span className="text-[15px] text-red-500">♥</span>
          ) : (
            <span className="text-[15px] text-slate-400">♡</span>
          )}
          Favoritar
        </button>
        <button
          onClick={onCompare}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[10px] border p-[9px] text-[13px] font-semibold ${
            compared
              ? 'border-brand-500 bg-brand-50 text-brand-600'
              : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          {compared ? '✓ Comparando' : 'Comparar'}
        </button>
      </div>
    </div>
  )
}
