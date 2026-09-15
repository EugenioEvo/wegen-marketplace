import { useEffect, useState } from 'react'
import { STATUS_LABEL } from '../lib/format'

const interacaoLabel = (it) => {
  if (it.tipo === 'status')
    return `Estágio: ${STATUS_LABEL[it.de_status] || it.de_status || '—'} → ${STATUS_LABEL[it.para_status] || it.para_status}`
  if (it.tipo === 'nota') return 'Nota'
  if (it.tipo === 'conversao_confirmada') return 'Consumidor confirmou a contratação'
  if (it.tipo === 'conversao_rejeitada') return 'Consumidor negou a contratação'
  return it.tipo
}
const fmtDataHora = (iso) => {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export default function LeadDetail({ lead, revealed, onReveal, onAddNota, fetchInteracoes, onClose }) {
  const [interacoes, setInteracoes] = useState([])
  const [nota, setNota] = useState('')
  const [savingNota, setSavingNota] = useState(false)
  const [revealing, setRevealing] = useState(false)
  const [revealErr, setRevealErr] = useState('')
  const [copied, setCopied] = useState(false)

  const refresh = () => fetchInteracoes(lead.id).then(setInteracoes)
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id])

  const contato = revealed[lead.id]
  const doReveal = async () => {
    setRevealing(true)
    setRevealErr('')
    const res = await onReveal(lead.id)
    setRevealing(false)
    if (res?.error) setRevealErr(res.error)
    else refresh()
  }
  const salvarNota = async () => {
    if (!nota.trim()) return
    setSavingNota(true)
    const res = await onAddNota(lead.id, nota.trim())
    setSavingNota(false)
    if (res?.ok) {
      setNota('')
      refresh()
    }
  }

  const link =
    lead.confirmacaoToken && typeof window !== 'undefined'
      ? `${window.location.origin}/?confirmar=${lead.confirmacaoToken}`
      : null
  const copiar = () => {
    if (!link) return
    navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,51,10,.55)] p-5 backdrop-blur-[2px]">
      <div className="max-h-[88vh] w-full max-w-[520px] overflow-auto rounded-[20px] bg-white shadow-modal">
        <div className="flex items-start justify-between bg-brand-900 px-6 pb-5 pt-6">
          <div>
            <div className="text-[19px] font-bold text-white">{lead.nome}</div>
            <div className="mt-1 text-[13px] text-brand-200">
              {lead.dist} · {lead.uf} · conta {lead.conta}
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer border-none bg-transparent text-[22px] leading-none text-brand-200">
            ×
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Contato */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[12.5px] font-semibold uppercase tracking-[0.04em] text-slate-500">Contato</div>
            {contato ? (
              <div className="mt-1 text-[14.5px]">
                <div className="font-semibold text-slate-800">{contato.telefone || '—'}</div>
                <div className="text-slate-500">{contato.email || '—'}</div>
              </div>
            ) : (
              <div className="mt-2">
                <button
                  onClick={doReveal}
                  disabled={revealing}
                  className="cursor-pointer rounded-lg border-none bg-brand-600 px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
                >
                  {revealing ? 'Revelando…' : `Desbloquear contato · ${lead.custo} créd.`}
                </button>
                {revealErr && <div className="mt-1 text-[12px] font-medium text-red-600">{revealErr}</div>}
              </div>
            )}
          </div>

          {/* Conversão / confirmação */}
          {lead.kind === 'convertido' && (
            <div className="mt-3 rounded-xl border border-green-100 bg-green-50 p-4">
              <div className="text-[13px] font-semibold text-green-700">
                Convertido — {lead.valorContrato != null ? `R$ ${lead.valorContrato.toLocaleString('pt-BR')}` : 'valor não informado'}
              </div>
              {lead.conversaoConfirmada ? (
                <div className="mt-1 text-[13px] font-semibold text-green-600">✓ Confirmado pelo consumidor</div>
              ) : (
                <div className="mt-2">
                  <div className="text-[12.5px] text-slate-600">
                    Aguardando confirmação do consumidor. Envie o link:
                  </div>
                  {link && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        readOnly
                        value={link}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-500"
                      />
                      <button
                        onClick={copiar}
                        className="cursor-pointer whitespace-nowrap rounded-lg border border-brand-200 bg-white px-3 py-2 text-[12.5px] font-semibold text-brand-600"
                      >
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {lead.kind === 'perdido' && lead.motivoPerda && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-4 text-[13px] text-red-600">
              <strong>Perdido:</strong> {lead.motivoPerda}
            </div>
          )}

          {/* Timeline */}
          <div className="mt-5">
            <div className="text-[13px] font-semibold text-slate-700">Histórico</div>
            <div className="mt-2 grid gap-2">
              {interacoes.length === 0 && (
                <div className="text-[13px] text-slate-400">Sem interações ainda.</div>
              )}
              {interacoes.map((it) => (
                <div key={it.id} className="rounded-lg border border-slate-100 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-slate-700">{interacaoLabel(it)}</span>
                    <span className="text-[11.5px] text-slate-400">{fmtDataHora(it.created_at)}</span>
                  </div>
                  {it.texto && <div className="mt-1 text-[13px] text-slate-500">{it.texto}</div>}
                  <div className="mt-1 text-[11px] uppercase tracking-[0.03em] text-slate-400">{it.autor}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar nota */}
          <div className="mt-4">
            <textarea
              rows={2}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Adicionar uma nota (ligação, follow-up)…"
              className="w-full resize-y rounded-xl border border-slate-200 p-3 text-[14px]"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={salvarNota}
                disabled={savingNota || !nota.trim()}
                className="cursor-pointer rounded-lg border-none bg-brand-600 px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {savingNota ? 'Salvando…' : 'Salvar nota'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
