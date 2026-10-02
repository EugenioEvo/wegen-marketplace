import { useState } from 'react'

const COLUNAS = [
  { key: 'novo', label: 'Novo', accent: 'border-t-brand-500', dot: 'bg-brand-500' },
  { key: 'contato', label: 'Em contato', accent: 'border-t-solar-400', dot: 'bg-solar-500' },
  { key: 'convertido', label: 'Convertido', accent: 'border-t-green-500', dot: 'bg-green-500' },
  { key: 'perdido', label: 'Perdido', accent: 'border-t-slate-300', dot: 'bg-slate-400' },
]

export default function LeadKanban({ leads, revealed, onMove, onCardClick }) {
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)
  const [prompt, setPrompt] = useState(null) // { lead, toStatus }
  const [campo, setCampo] = useState('')
  const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)

  const byStatus = (k) => leads.filter((l) => l.kind === k)

  const handleDrop = (toStatus) => {
    setOverCol(null)
    const lead = leads.find((l) => l.id === dragId)
    setDragId(null)
    if (!lead || lead.kind === toStatus) return
    if (toStatus === 'convertido' || toStatus === 'perdido') {
      setCampo('')
      setErro('')
      setPrompt({ lead, toStatus })
    } else {
      onMove(lead.id, toStatus)
    }
  }

  const confirmarPrompt = async () => {
    setErro('')
    if (prompt.toStatus === 'convertido') {
      const v = Number(String(campo).replace(/\D/g, ''))
      if (!v) return setErro('Informe o valor do contrato.')
      setSaving(true)
      const res = await onMove(prompt.lead.id, 'convertido', { valor_contrato: v })
      setSaving(false)
      if (res?.error) return setErro(res.error)
    } else {
      if (!campo.trim()) return setErro('Informe o motivo da perda.')
      setSaving(true)
      const res = await onMove(prompt.lead.id, 'perdido', { motivo_perda: campo.trim() })
      setSaving(false)
      if (res?.error) return setErro(res.error)
    }
    setPrompt(null)
  }

  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
      {COLUNAS.map((col) => {
        const items = byStatus(col.key)
        return (
          <div
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault()
              setOverCol(col.key)
            }}
            onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
            onDrop={() => handleDrop(col.key)}
            className={`glass rounded-2xl border-t-[3px] ${col.accent} p-3 ${
              overCol === col.key ? 'ring-2 ring-brand-300' : ''
            }`}
          >
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${col.dot}`} />
              <span className="text-[13px] font-semibold text-slate-700">{col.label}</span>
              <span className="ml-auto rounded-full bg-white px-2 py-[1px] text-[12px] font-semibold text-slate-500">
                {items.length}
              </span>
            </div>

            <div className="grid gap-2">
              {items.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragId(lead.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => onCardClick(lead)}
                  className="glass-strong glass-hover cursor-pointer rounded-xl p-3"
                >
                  <div className="text-[14px] font-semibold text-slate-900">{lead.nome}</div>
                  <div className="mt-[2px] text-[12px] text-slate-400">
                    {lead.dist} · {lead.uf} · {lead.conta}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-[6px]">
                    {lead.kind === 'convertido' ? (
                      lead.conversaoConfirmada ? (
                        <span className="rounded-full bg-green-50 px-2 py-[2px] text-[11px] font-semibold text-green-600">
                          ✓ confirmado
                        </span>
                      ) : (
                        <span className="rounded-full bg-solar-50 px-2 py-[2px] text-[11px] font-semibold text-solar-600">
                          aguardando confirmação
                        </span>
                      )
                    ) : revealed[lead.id] ? (
                      <span className="rounded-full bg-brand-50 px-2 py-[2px] text-[11px] font-semibold text-brand-600">
                        contato liberado
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] font-semibold text-slate-500">
                        {lead.custo} créd. p/ contato
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-[12px] text-slate-300">
                  arraste um lead aqui
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Prompt de valor / motivo ao mover */}
      {prompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,51,10,.55)] p-5 backdrop-blur-[2px]">
          <div className="glass-strong w-full max-w-[400px] rounded-2xl p-6">
            <h3 className="text-[18px] font-semibold text-slate-900">
              {prompt.toStatus === 'convertido' ? 'Marcar como convertido' : 'Marcar como perdido'}
            </h3>
            <p className="mt-1 text-[13.5px] text-slate-500">
              {prompt.lead.nome} ·{' '}
              {prompt.toStatus === 'convertido'
                ? 'informe o valor do contrato fechado.'
                : 'informe o motivo da perda.'}
            </p>
            {prompt.toStatus === 'convertido' ? (
              <input
                value={campo}
                onChange={(e) => setCampo(e.target.value)}
                placeholder="Ex.: 4.800"
                className="mt-4 h-11 w-full rounded-xl border border-slate-200 px-3 text-[14.5px]"
              />
            ) : (
              <textarea
                rows={2}
                value={campo}
                onChange={(e) => setCampo(e.target.value)}
                placeholder="Ex.: fechou com outro ofertante"
                className="mt-4 w-full resize-y rounded-xl border border-slate-200 p-3 text-[14.5px]"
              />
            )}
            {erro && <p className="mt-2 text-[13px] font-medium text-red-600">{erro}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setPrompt(null)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-[14px] font-semibold text-slate-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPrompt}
                disabled={saving}
                className="cursor-pointer rounded-xl border-none bg-brand-600 px-5 py-2 text-[14px] font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
              >
                {saving ? 'Salvando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
