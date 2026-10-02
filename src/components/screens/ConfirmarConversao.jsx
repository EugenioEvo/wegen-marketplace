import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

// Tela pública (sem login) que o consumidor abre pelo link ?confirmar=<token>.
// Valida a conversão informada pelo ofertante — base para comissão/ROI confiável.
export default function ConfirmarConversao({ nav, token }) {
  const [info, setInfo] = useState(undefined) // undefined=carregando, null=inválido
  const [result, setResult] = useState(null) // 'confirmada' | 'rejeitada'
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured || !token) {
      setInfo(null)
      return
    }
    supabase
      .rpc('info_confirmacao', { p_token: token })
      .then(({ data }) => setInfo(Array.isArray(data) && data[0] ? data[0] : null))
  }, [token])

  const responder = async (confirma) => {
    if (!isSupabaseConfigured) return
    setSending(true)
    const { data, error } = await supabase.rpc('confirmar_conversao', {
      p_token: token,
      p_confirma: confirma,
    })
    setSending(false)
    if (!error) setResult(data)
  }

  const Card = ({ children }) => (
    <section className="mx-auto max-w-[460px] px-6 pb-[110px] pt-14">
      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="bg-brand-900 px-7 pb-5 pt-6">
          <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-brand-200">
            Confirmação de contratação
          </span>
          <h1 className="mt-1 text-[22px] font-bold text-white">WeGen · Grupo Evolight</h1>
        </div>
        <div className="px-7 py-7">{children}</div>
      </div>
    </section>
  )

  if (info === undefined) {
    return (
      <Card>
        <p className="text-[15px] text-slate-500">Carregando…</p>
      </Card>
    )
  }

  if (info === null) {
    return (
      <Card>
        <h2 className="text-[18px] font-semibold text-slate-900">Link inválido ou expirado</h2>
        <p className="mt-2 text-[14.5px] text-slate-500">
          Este link de confirmação não é mais válido.
        </p>
        <button
          onClick={nav.goHome}
          className="mt-5 cursor-pointer rounded-xl border-none bg-brand-600 px-5 py-3 text-[15px] font-semibold text-white"
        >
          Ir para o início
        </button>
      </Card>
    )
  }

  if (result === 'confirmada' || info.ja_confirmada) {
    return (
      <Card>
        <div className="text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15B86A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h2 className="mt-4 text-[20px] font-bold text-slate-900">Contratação confirmada!</h2>
          <p className="mt-2 text-[14.5px] leading-[1.5] text-slate-500">
            Obrigado. Registramos que você fechou com{' '}
            <strong className="text-brand-600">{info.ofertante_nome}</strong>.
          </p>
        </div>
      </Card>
    )
  }

  if (result === 'rejeitada') {
    return (
      <Card>
        <h2 className="text-[18px] font-semibold text-slate-900">Entendido — obrigado</h2>
        <p className="mt-2 text-[14.5px] leading-[1.5] text-slate-500">
          Registramos que você <strong>não</strong> fechou contrato com {info.ofertante_nome}. Isso
          nos ajuda a manter as informações do marketplace corretas.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-[18px] font-semibold text-slate-900">Você fechou este contrato?</h2>
      <p className="mt-2 text-[14.5px] leading-[1.55] text-slate-600">
        A <strong className="text-brand-600">{info.ofertante_nome}</strong> informou que você
        contratou a oferta de energia dela pela WeGen. Pode confirmar?
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => responder(true)}
          disabled={sending}
          className="flex-1 cursor-pointer rounded-xl border-none bg-green-500 px-5 py-3 text-[15px] font-semibold text-white hover:bg-green-600 disabled:opacity-70"
        >
          {sending ? '…' : 'Sim, fechei'}
        </button>
        <button
          onClick={() => responder(false)}
          disabled={sending}
          className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-[15px] font-semibold text-slate-600 disabled:opacity-70"
        >
          Não fechei
        </button>
      </div>
      <p className="mt-4 text-[12px] text-slate-400">
        Sua resposta é usada apenas para validar a contratação e não gera nenhum compromisso.
      </p>
    </Card>
  )
}
