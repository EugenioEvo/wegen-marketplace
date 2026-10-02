import { useState } from 'react'
import { brl } from '../../lib/format'
import OfferCard from '../OfferCard'

const DISTS = [
  { key: 'Equatorial GO', label: 'Equatorial GO' },
  { key: 'CPFL', label: 'CPFL' },
  { key: 'Cemig', label: 'Cemig' },
  { key: 'EnelLight', label: 'Enel · Light' },
]

export default function Ofertas({
  nav,
  offers,
  conta,
  conexao,
  dist,
  sort,
  setSort,
  faved,
  compared,
  toggleFav,
  toggleCompare,
  openContact,
}) {
  // ----- estado dos filtros (defaults iguais aos do protótipo) -----
  const [distSel, setDistSel] = useState({
    'Equatorial GO': true,
    CPFL: true,
    Cemig: true,
    EnelLight: false,
  })
  const [ecoMin, setEcoMin] = useState(10)
  const [ratingMin, setRatingMin] = useState(4.0)
  const [limpaOnly, setLimpaOnly] = useState(true)

  const toggleDist = (key) => setDistSel((s) => ({ ...s, [key]: !s[key] }))
  const anyDist = Object.values(distSel).some(Boolean)

  const passDist = (o) => {
    if (!anyDist) return true
    if (distSel.EnelLight && (o.dist === 'Enel' || o.dist === 'Light')) return true
    return !!distSel[o.dist]
  }

  const filtered = offers.filter(
    (o) =>
      passDist(o) &&
      Math.round(o.pct * 100) >= ecoMin &&
      // oferta sem avaliações ainda ("nova") não é punida pelo filtro de nota
      (ratingMin == null || !o.reviews || o.rating >= ratingMin) &&
      (!limpaOnly || o.limpa),
  )

  const sortedOffers = [...filtered].sort((a, b) =>
    sort === 'aval' ? b.rating - a.rating : b.pct - a.pct,
  )

  const tabBase =
    'cursor-pointer rounded-lg border-none px-[14px] py-[7px] text-[13px] font-semibold'
  const tabOn = 'bg-white text-brand-600 shadow-[0_1px_2px_rgba(20,51,10,.12)]'
  const tabOff = 'bg-transparent text-slate-500'

  const chipOn =
    'rounded-full border border-brand-100 bg-brand-50 px-[11px] py-[5px] text-[13px] font-semibold text-brand-600'
  const chipOff =
    'rounded-full border border-slate-200 px-[11px] py-[5px] text-[13px] font-semibold text-slate-500'

  const setRating = (v) => setRatingMin((cur) => (cur === v ? null : v))

  return (
    <section className="mx-auto max-w-container px-6 pb-[110px] pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-bold text-brand-900">Ofertas para você</h1>
          <p className="mt-[6px] text-[14.5px] text-slate-500">
            Com base em {brl(conta)}/mês · {conexao} · {dist}
          </p>
        </div>
        <button
          onClick={nav.goHome}
          className="cursor-pointer rounded-xl border-[1.5px] border-brand-600 bg-white px-4 py-[10px] text-sm font-semibold text-brand-600 hover:bg-brand-50"
        >
          Refazer simulação
        </button>
      </div>

      <div className="mt-6 grid grid-cols-[260px_1fr] items-start gap-7">
        {/* FILTROS */}
        <aside className="glass sticky top-[84px] rounded-2xl p-5">
          <h3 className="font-sans text-base font-semibold">Filtros</h3>

          <div className="mt-4">
            <div className="text-[13px] font-semibold text-slate-700">Distribuidora</div>
            <div className="mt-[10px] grid gap-[9px]">
              {DISTS.map((d) => (
                <label
                  key={d.key}
                  className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
                >
                  <input
                    type="checkbox"
                    checked={distSel[d.key]}
                    onChange={() => toggleDist(d.key)}
                    className="h-4 w-4 accent-brand-500"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-[18px]">
            <div className="text-[13px] font-semibold text-slate-700">Economia mínima</div>
            <input
              type="range"
              min="0"
              max="30"
              value={ecoMin}
              onChange={(e) => setEcoMin(Number(e.target.value))}
              className="mt-3 h-[6px] w-full"
            />
            <div className="mt-1 text-[12.5px] text-slate-400">
              A partir de {ecoMin}% de desconto
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-[18px]">
            <div className="text-[13px] font-semibold text-slate-700">Avaliação mínima</div>
            <div className="mt-[10px] flex flex-wrap gap-2">
              <button onClick={() => setRating(4.0)} className={ratingMin === 4.0 ? chipOn : chipOff}>
                ★ 4,0+
              </button>
              <button onClick={() => setRating(4.5)} className={ratingMin === 4.5 ? chipOn : chipOff}>
                ★ 4,5+
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-[18px]">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={limpaOnly}
                onChange={(e) => setLimpaOnly(e.target.checked)}
                className="h-4 w-4 accent-green-500"
              />
              Apenas energia 100% limpa
            </label>
          </div>
        </aside>

        {/* RESULTADOS */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-[10px]">
            <span className="text-sm text-slate-500">
              <strong className="text-slate-900">{sortedOffers.length}</strong> ofertas encontradas
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-500">Ordenar por</span>
              <div className="flex rounded-[10px] bg-slate-100 p-[3px]">
                <button
                  onClick={() => setSort('eco')}
                  className={`${tabBase} ${sort === 'eco' ? tabOn : tabOff}`}
                >
                  Economia
                </button>
                <button
                  onClick={() => setSort('aval')}
                  className={`${tabBase} ${sort === 'aval' ? tabOn : tabOff}`}
                >
                  Avaliação
                </button>
              </div>
            </div>
          </div>

          {sortedOffers.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px]">
              {sortedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  conta={conta}
                  faved={!!faved[offer.id]}
                  compared={compared.includes(offer.id)}
                  onContact={() => openContact(offer.id)}
                  onFav={() => toggleFav(offer.id)}
                  onCompare={() => toggleCompare(offer.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="text-[36px]">🔍</div>
              <h3 className="mt-2 text-[18px] font-semibold">Nenhuma oferta com esses filtros</h3>
              <p className="mt-[6px] text-[14px] text-slate-500">
                Tente reduzir a economia mínima ou incluir mais distribuidoras.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
