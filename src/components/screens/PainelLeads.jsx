import { useState } from 'react'
import { STATUS_TAG } from '../../data/leads'
import { descPct } from '../../lib/format'
import LeadKanban from '../LeadKanban'
import LeadDetail from '../LeadDetail'

const LEAD_COLS = ['Consumidor', 'Distribuidora / UF', 'Valor da conta', 'Data', 'Status']
const OFFER_COLS = ['Oferta', 'Distribuidora', 'Desconto', 'Fidelidade', 'Status']

const economiaFmt = (n) => {
  if (!n) return 'R$ 0'
  if (n >= 1000) return 'R$ ' + Math.round(n / 1000) + 'k'
  return 'R$ ' + Math.round(n)
}

export default function PainelLeads({
  nav,
  leads,
  myOffers,
  metrics,
  saldo,
  unlockedIds,
  revealed,
  onReveal,
  onRecarga,
  onMove,
  onAddNota,
  fetchInteracoes,
  onNewOffer,
  onEditOffer,
  onToggleOffer,
}) {
  const [tab, setTab] = useState('pipeline')
  const [selectedLead, setSelectedLead] = useState(null)
  // mantém o lead selecionado em sincronia com os dados recém-buscados
  const selLead = selectedLead ? leads.find((l) => l.id === selectedLead.id) || selectedLead : null
  const [revealing, setRevealing] = useState(null)
  const [revealErr, setRevealErr] = useState({})
  const [recarregando, setRecarregando] = useState(false)

  const doReveal = async (lead) => {
    setRevealing(lead.id)
    setRevealErr((e) => ({ ...e, [lead.id]: '' }))
    const res = await onReveal(lead.id)
    setRevealing(null)
    if (res?.error) setRevealErr((e) => ({ ...e, [lead.id]: res.error }))
  }

  const doRecarga = async () => {
    setRecarregando(true)
    await onRecarga(100)
    setRecarregando(false)
  }

  const cards = [
    { label: 'Leads novos', value: metrics.leadsNovos, valueColor: 'text-brand-600', sub: 'aguardando contato' },
    { label: 'Ofertas ativas', value: metrics.ofertasAtivas, valueColor: 'text-brand-600', sub: `de ${myOffers.length} no total` },
    {
      label: 'Conversão',
      value: `${metrics.conversao}%`,
      valueColor: 'text-green-500',
      sub: `${metrics.confirmados} de ${metrics.convertidos} confirmada${metrics.confirmados === 1 ? '' : 's'} pelo consumidor`,
    },
    { label: 'Créditos investidos', value: metrics.gasto, valueColor: 'text-solar-600', sub: 'em desbloqueios de contato' },
    {
      label: 'Valor fechado',
      value: economiaFmt(metrics.valorFechado),
      valueColor: 'text-brand-600',
      sub:
        metrics.gasto > 0 && metrics.valorConfirmado > 0
          ? `${economiaFmt(metrics.valorConfirmado)} confirmado · ${economiaFmt(Math.round(metrics.valorConfirmado / metrics.gasto))} por crédito`
          : `${economiaFmt(metrics.valorConfirmado)} confirmado pelo consumidor`,
    },
  ]

  const tabBase = 'cursor-pointer rounded-lg border-none px-[16px] py-[8px] text-sm font-semibold'
  const tabOn = 'bg-white text-brand-600 shadow-[0_1px_2px_rgba(20,51,10,.12)]'
  const tabOff = 'bg-transparent text-slate-500'

  return (
    <section className="mx-auto max-w-container px-6 pb-[90px] pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-brand-500">
            Painel do ofertante
          </span>
          <h1 className="mt-1 text-[30px] font-bold text-brand-900">Meu painel</h1>
        </div>
        <button
          onClick={onNewOffer}
          className="cursor-pointer rounded-xl border-none bg-brand-600 px-[18px] py-3 text-[14.5px] font-semibold text-white hover:bg-brand-700"
        >
          + Nova oferta
        </button>
      </div>

      {/* Métricas */}
      <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {cards.map((m) => (
          <div key={m.label} className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-[13px] font-semibold text-slate-500">{m.label}</div>
            <div className={`mt-[6px] font-display text-[32px] font-bold ${m.valueColor}`}>{m.value}</div>
            <div className="mt-[2px] text-[12.5px] text-slate-400">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Carteira de créditos */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50 p-5">
        <div>
          <div className="text-[13px] font-semibold text-brand-700">Carteira de créditos</div>
          <div className="mt-1 font-display text-[30px] font-bold leading-none text-brand-600">
            {saldo} <span className="text-[14px] font-semibold text-slate-500">créditos</span>
          </div>
          <div className="mt-[6px] max-w-[440px] text-[12.5px] leading-[1.45] text-slate-500">
            Você paga só pelo <strong>contato do lead</strong> que abrir — 5 a 40 créditos conforme o
            valor da conta. Nome, região e status são grátis.
          </div>
        </div>
        <div className="text-right">
          <button
            onClick={doRecarga}
            disabled={recarregando}
            className="cursor-pointer rounded-xl border-none bg-brand-600 px-5 py-3 text-[14.5px] font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {recarregando ? 'Processando…' : '+ Adicionar 100 créditos'}
          </button>
          <div className="mt-[6px] text-[11px] text-slate-400">Recarga demo (mock de pagamento)</div>
        </div>
      </div>

      {/* Abas */}
      <div className="mt-6 flex w-fit flex-wrap rounded-[10px] bg-slate-100 p-[3px]">
        <button onClick={() => setTab('pipeline')} className={`${tabBase} ${tab === 'pipeline' ? tabOn : tabOff}`}>
          Pipeline
        </button>
        <button onClick={() => setTab('leads')} className={`${tabBase} ${tab === 'leads' ? tabOn : tabOff}`}>
          Lista
        </button>
        <button onClick={() => setTab('ofertas')} className={`${tabBase} ${tab === 'ofertas' ? tabOn : tabOff}`}>
          Minhas ofertas
        </button>
      </div>

      {/* Pipeline (kanban) */}
      {tab === 'pipeline' && (
        <LeadKanban
          leads={leads}
          revealed={revealed}
          onMove={onMove}
          onCardClick={setSelectedLead}
        />
      )}

      {selLead && (
        <LeadDetail
          lead={selLead}
          revealed={revealed}
          onReveal={onReveal}
          onAddNota={onAddNota}
          fetchInteracoes={fetchInteracoes}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Tabela de leads */}
      {tab === 'leads' && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-brand-600">
                  {LEAD_COLS.map((c) => (
                    <th key={c} className="px-[18px] py-[14px] text-left text-[12.5px] font-semibold text-white">
                      {c}
                    </th>
                  ))}
                  <th className="px-[18px] py-[14px] text-right text-[12.5px] font-semibold text-white">
                    Contato
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-[18px] py-10 text-center text-sm text-slate-400">
                      Nenhum lead ainda. Eles aparecem aqui quando um consumidor solicita contato numa
                      das suas ofertas.
                    </td>
                  </tr>
                )}
                {leads.map((lead, i) => (
                  <tr key={lead.id ?? lead.nome + i} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-[#F9FBFD]' : ''}`}>
                    <td className="px-[18px] py-[14px] text-sm font-semibold text-slate-900">{lead.nome}</td>
                    <td className="px-[18px] py-[14px] text-sm text-slate-600">{lead.dist} · {lead.uf}</td>
                    <td className="px-[18px] py-[14px] text-sm font-semibold text-slate-900">{lead.conta}</td>
                    <td className="px-[18px] py-[14px] text-sm text-slate-500">{lead.data}</td>
                    <td className="px-[18px] py-[14px]">
                      <span className="rounded-full px-[11px] py-1 text-[12px] font-semibold" style={STATUS_TAG[lead.kind] || STATUS_TAG.novo}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-[18px] py-[14px] text-right">
                      {revealed[lead.id] ? (
                        <div className="text-[13px]">
                          <div className="font-semibold text-slate-800">{revealed[lead.id].telefone || '—'}</div>
                          <div className="text-slate-400">{revealed[lead.id].email || '—'}</div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <button
                            onClick={() => doReveal(lead)}
                            disabled={revealing === lead.id}
                            className={`cursor-pointer rounded-lg border px-3 py-[7px] text-[13px] font-semibold disabled:opacity-70 ${
                              unlockedIds.has(lead.id)
                                ? 'border-brand-200 bg-white text-brand-600 hover:bg-brand-50'
                                : 'border-none bg-brand-600 text-white hover:bg-brand-700'
                            }`}
                          >
                            {revealing === lead.id
                              ? 'Revelando…'
                              : unlockedIds.has(lead.id)
                                ? 'Ver contato'
                                : `Desbloquear · ${lead.custo} créd.`}
                          </button>
                          {revealErr[lead.id] && (
                            <div className="mt-1 text-[11.5px] font-medium text-red-600">{revealErr[lead.id]}</div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de ofertas */}
      {tab === 'ofertas' && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className="bg-brand-600">
                  {OFFER_COLS.map((c) => (
                    <th key={c} className="px-[18px] py-[14px] text-left text-[12.5px] font-semibold text-white">
                      {c}
                    </th>
                  ))}
                  <th className="px-[18px] py-[14px] text-right text-[12.5px] font-semibold text-white">Ações</th>
                </tr>
              </thead>
              <tbody>
                {myOffers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-[18px] py-10 text-center text-sm text-slate-400">
                      Você ainda não tem ofertas. Clique em <strong>+ Nova oferta</strong> para criar a
                      primeira.
                    </td>
                  </tr>
                )}
                {myOffers.map((o, i) => (
                  <tr key={o.id} className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-[#F9FBFD]' : ''}`}>
                    <td className="px-[18px] py-[14px] text-sm font-semibold text-slate-900">{o.name}</td>
                    <td className="px-[18px] py-[14px] text-sm text-slate-600">{o.dist} · {o.uf}</td>
                    <td className="px-[18px] py-[14px] text-sm font-bold text-green-600">{descPct(Number(o.pct))}</td>
                    <td className="px-[18px] py-[14px] text-sm text-slate-600">{o.prazo}</td>
                    <td className="px-[18px] py-[14px]">
                      {o.ativo ? (
                        <span className="rounded-full bg-green-50 px-[11px] py-1 text-[12px] font-semibold text-green-600">Ativa</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-[11px] py-1 text-[12px] font-semibold text-slate-500">Pausada</span>
                      )}
                    </td>
                    <td className="px-[18px] py-[14px] text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => onEditOffer(o)} className="cursor-pointer border-none bg-transparent text-[13.5px] font-semibold text-brand-600">
                          Editar
                        </button>
                        <button onClick={() => onToggleOffer(o)} className="cursor-pointer border-none bg-transparent text-[13.5px] font-semibold text-slate-500">
                          {o.ativo ? 'Pausar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
