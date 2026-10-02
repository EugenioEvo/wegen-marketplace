import { useState } from 'react'
import { STATUS_TAG } from '../../data/leads'

const COLS = ['Empresa', 'CNPJ', 'Contato', 'Distribuidora', 'Consumo', 'Data', 'Status']

export default function AdminMercadoLivre({ nav, leads, revealed, onReveal }) {
  const [revealing, setRevealing] = useState(null)
  const doReveal = async (id) => {
    setRevealing(id)
    await onReveal(id)
    setRevealing(null)
  }
  const novos = leads.filter((l) => l.kind === 'novo').length
  const emContato = leads.filter((l) => l.kind === 'contato').length

  const cards = [
    { label: 'Leads recebidos', value: leads.length, color: 'text-brand-600' },
    { label: 'Novos', value: novos, color: 'text-green-500' },
    { label: 'Em contato', value: emContato, color: 'text-solar-500' },
  ]

  return (
    <section className="mx-auto max-w-container px-6 pb-[90px] pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-solar-600">
            Admin · Grupo Evolight
          </span>
          <h1 className="mt-1 text-[30px] font-bold text-brand-900">Leads · Mercado Livre</h1>
          <p className="mt-[6px] text-[14.5px] text-slate-500">
            Empresas que pediram proposta de Mercado Livre de Energia (média/alta tensão).
          </p>
        </div>
        <button
          onClick={nav.goHome}
          className="cursor-pointer rounded-xl border-[1.5px] border-brand-600 bg-white px-4 py-[10px] text-sm font-semibold text-brand-600 hover:bg-brand-50"
        >
          Voltar ao site
        </button>
      </div>

      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {cards.map((m) => (
          <div key={m.label} className="glass glass-hover rounded-[16px] p-5">
            <div className="text-[13px] font-semibold text-slate-500">{m.label}</div>
            <div className={`mt-[6px] font-display text-[32px] font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 glass-strong overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-brand-600">
                {COLS.map((c) => (
                  <th key={c} className="px-[16px] py-[14px] text-left text-[12.5px] font-semibold text-white">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={COLS.length} className="px-[16px] py-10 text-center text-sm text-slate-400">
                    Nenhum lead de Mercado Livre ainda.
                  </td>
                </tr>
              )}
              {leads.map((l, i) => (
                <tr key={l.id ?? i} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-[#F9FBFD]' : ''}`}>
                  <td className="px-[16px] py-[14px] text-sm font-semibold text-slate-900">{l.empresa}</td>
                  <td className="px-[16px] py-[14px] text-[13px] text-slate-600">{l.cnpj}</td>
                  <td className="px-[16px] py-[14px] text-[13px] text-slate-600">
                    <div className="font-semibold text-slate-800">{l.nome}</div>
                    {revealed[l.id] ? (
                      <>
                        <div className="text-slate-400">{revealed[l.id].email || '—'}</div>
                        <div className="text-slate-400">{revealed[l.id].telefone || '—'}</div>
                      </>
                    ) : (
                      <button
                        onClick={() => doReveal(l.id)}
                        disabled={revealing === l.id}
                        className="mt-1 cursor-pointer rounded-lg border border-brand-200 bg-white px-[10px] py-1 text-[12px] font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-70"
                      >
                        {revealing === l.id ? 'Revelando…' : 'Revelar contato'}
                      </button>
                    )}
                  </td>
                  <td className="px-[16px] py-[14px] text-sm text-slate-600">{l.dist} · {l.uf}</td>
                  <td className="px-[16px] py-[14px] text-sm font-semibold text-slate-900">{l.conta}<span className="font-normal text-slate-400">/mês</span></td>
                  <td className="px-[16px] py-[14px] text-sm text-slate-500">{l.data}</td>
                  <td className="px-[16px] py-[14px]">
                    <span className="rounded-full px-[11px] py-1 text-[12px] font-semibold" style={STATUS_TAG[l.kind] || STATUS_TAG.novo}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
