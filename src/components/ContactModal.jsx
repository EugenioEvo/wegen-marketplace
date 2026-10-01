import { useState } from 'react'

export default function ContactModal({ name, sent, onSubmit, closeContact, closeAndOfertas }) {
  const inputClass =
    'mt-[6px] h-11 w-full rounded-xl border border-slate-200 px-3 text-[14.5px]'

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!nome.trim()) return setError('Informe seu nome.')
    if (!telefone.trim() && !email.trim())
      return setError('Informe um telefone ou e-mail para o ofertante falar com você.')
    if (!consent) return setError('É preciso autorizar o contato (LGPD) para enviar.')
    setSubmitting(true)
    try {
      const res = await onSubmit({ nome, telefone, email, consent })
      if (res?.error) setError(res.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,51,10,.55)] p-5 backdrop-blur-[2px]">
      <div className="w-full max-w-[460px] overflow-hidden rounded-[20px] bg-white shadow-modal">
        {!sent && (
          <div className="px-[26px] pb-6 pt-[26px]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[21px] font-semibold text-slate-900">Solicitar contato</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Oferta de <strong className="text-brand-600">{name}</strong>. O ofertante fala com
                  você em até 24h.
                </p>
              </div>
              <button
                onClick={closeContact}
                className="cursor-pointer border-none bg-transparent p-0 text-[22px] leading-none text-slate-400"
              >
                ×
              </button>
            </div>

            <div className="mt-[18px] grid gap-[13px]">
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-700">Nome completo</span>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className={inputClass}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[13px] font-semibold text-slate-700">Telefone</span>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] font-semibold text-slate-700">E-mail</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@email.com"
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="mt-[2px] flex cursor-pointer items-start gap-[9px]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-[1px] h-[17px] w-[17px] flex-none accent-brand-600"
                />
                <span className="text-[12.5px] leading-[1.45] text-slate-500">
                  Autorizo o contato e o tratamento dos meus dados conforme a{' '}
                  <a href="#" className="font-semibold text-brand-600 no-underline">
                    Política de Privacidade (LGPD)
                  </a>
                  .
                </span>
              </label>
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
                {error}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-[18px] w-full cursor-pointer rounded-xl border-none bg-green-500 p-[14px] text-base font-semibold text-white hover:bg-green-600 disabled:cursor-default disabled:opacity-70"
            >
              {submitting ? 'Enviando…' : 'Enviar solicitação'}
            </button>
            <p className="mt-[10px] text-center text-[11.5px] text-slate-400">
              Seus dados são usados apenas para esta solicitação de oferta.
            </p>
          </div>
        )}

        {sent && (
          <div className="px-[30px] pb-[34px] pt-10 text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#15B86A"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <h3 className="mt-[18px] text-[22px] font-semibold text-slate-900">
              Solicitação enviada!
            </h3>
            <p className="mx-auto mt-2 max-w-[330px] text-[15px] leading-[1.5] text-slate-500">
              <strong className="text-brand-600">{name}</strong> recebeu seu pedido e entra em contato
              em até 24h. Você também pode comparar outras ofertas enquanto isso.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-[10px]">
              <button
                onClick={closeContact}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-[15px] font-semibold text-slate-600"
              >
                Fechar
              </button>
              <button
                onClick={closeAndOfertas}
                className="cursor-pointer rounded-xl border-none bg-brand-600 px-[22px] py-3 text-[15px] font-semibold text-white hover:bg-brand-700"
              >
                Ver mais ofertas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
