import { useRef, useState } from 'react'

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#264A03',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const BENEFITS = [
  {
    title: 'Economia previsível',
    desc: 'Contratos de médio e longo prazo com preço travado — sem a volatilidade das bandeiras tarifárias.',
    icon: (
      <svg {...iconProps}>
        <path d="M4 19V5" />
        <polyline points="4 16 9 11 13 14 20 6" />
        <path d="M4 19h16" />
      </svg>
    ),
  },
  {
    title: 'Liberdade de escolha',
    desc: 'Sua empresa compra energia de quem oferece as melhores condições — não mais só da distribuidora.',
    icon: (
      <svg {...iconProps}>
        <path d="M4 7h9l4 4h3" />
        <polyline points="17 7 20 4" />
        <path d="M4 17h9l3-3" />
      </svg>
    ),
  },
  {
    title: 'Energia 100% limpa',
    desc: 'Fontes renováveis certificadas (I-REC), reforçando as metas de ESG da sua empresa.',
    icon: (
      <svg {...iconProps} stroke="#15B86A">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
      </svg>
    ),
  },
  {
    title: 'Migração sem obras',
    desc: 'Nada muda na sua instalação — a distribuidora continua entregando a energia pela mesma rede.',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18" />
        <circle cx="16.5" cy="14" r="1.3" fill="#264A03" />
      </svg>
    ),
  },
]

const STEPS = [
  { n: '1', title: 'Diagnóstico', desc: 'Analisamos suas faturas e o perfil de consumo para dimensionar a economia real.' },
  { n: '2', title: 'Proposta', desc: 'Apresentamos as opções de contrato, o desconto estimado e o prazo de migração.' },
  { n: '3', title: 'Migração e gestão', desc: 'Cuidamos da adesão à CCEE e da gestão mensal — você acompanha a economia.' },
]

const DISTS = ['Equatorial GO', 'Cemig', 'CPFL', 'Enel', 'Light', 'Energisa']

const parseNum = (v) => {
  const n = Number(String(v).replace(/\D/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function MercadoLivre({ nav, onSubmit }) {
  const formRef = useRef(null)
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [dist, setDist] = useState('Equatorial GO')
  const [consumo, setConsumo] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const inputClass =
    'mt-[6px] h-11 w-full rounded-xl border border-slate-200 px-3 text-[14.5px]'

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const submit = async () => {
    setError('')
    if (!empresa.trim() || !email.trim()) {
      setError('Informe ao menos a empresa e um e-mail para contato.')
      return
    }
    if (!consent) {
      setError('É preciso autorizar o contato (LGPD) para enviar.')
      return
    }
    setSubmitting(true)
    const res = await onSubmit({
      nome,
      empresa,
      cnpj,
      email,
      telefone,
      dist,
      consumo: parseNum(consumo),
      consent,
    })
    setSubmitting(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    setSent(true)
  }

  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background: '#0E2103',
          backgroundImage:
            'radial-gradient(900px 480px at 80% -10%, rgba(53,99,13,.55), transparent 60%), radial-gradient(620px 420px at 5% 110%, rgba(251,169,25,.16), transparent 60%)',
        }}
      >
        <div className="mx-auto max-w-container px-6 pb-[72px] pt-16">
          <span className="inline-flex items-center gap-[7px] rounded-full border border-[rgba(166,195,130,.35)] bg-white/[0.08] px-3 py-[6px] text-[12.5px] font-semibold text-brand-100 backdrop-blur-[4px]">
            Mercado Livre de Energia · Empresas
          </span>
          <h1 className="mt-5 max-w-[760px] text-[clamp(34px,5vw,56px)] font-bold leading-[1.08] text-white">
            Sua empresa escolhe <span className="text-solar-400">de quem compra</span> energia.
          </h1>
          <p className="mt-[18px] max-w-[620px] text-[18px] leading-[1.55] text-brand-200">
            Empresas de média e alta tensão podem comprar energia diretamente de geradores no
            Mercado Livre — com <strong className="text-white">20% a 35%</strong> de economia,
            previsibilidade de custo e energia limpa. A WeGen, do Grupo Evolight, cuida da migração
            e da gestão.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={scrollToForm}
              className="cursor-pointer rounded-xl border-none bg-green-500 px-6 py-[14px] text-base font-semibold text-white hover:bg-green-600"
            >
              Quero uma proposta →
            </button>
            <button
              onClick={nav.goHome}
              className="cursor-pointer rounded-xl border border-[rgba(166,195,130,.4)] bg-white/[0.06] px-[22px] py-[14px] text-base font-semibold text-white hover:bg-white/[0.12]"
            >
              Sou residência
            </button>
          </div>
          <div className="mt-[34px] flex flex-wrap gap-8 border-t border-[rgba(166,195,130,.18)] pt-[26px]">
            <div>
              <div className="font-display text-[26px] font-bold text-white">20–35%</div>
              <div className="mt-[2px] text-[13px] text-brand-300">de economia</div>
            </div>
            <div>
              <div className="font-display text-[26px] font-bold text-solar-400">Zero</div>
              <div className="mt-[2px] text-[13px] text-brand-300">investimento</div>
            </div>
            <div>
              <div className="font-display text-[26px] font-bold text-green-500">100%</div>
              <div className="mt-[2px] text-[13px] text-brand-300">digital e limpa</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="mx-auto max-w-container px-6 py-[72px]">
        <div className="mx-auto max-w-[640px] text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-brand-500">
            Por que migrar
          </span>
          <h2 className="mt-[10px] text-[clamp(26px,3.4vw,30px)] font-semibold text-brand-900">
            O Mercado Livre trabalha a favor do seu caixa
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[18px]">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-[22px] shadow-sm">
              <span className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-brand-50">
                {b.icon}
              </span>
              <h3 className="mt-4 text-[17px] font-semibold">{b.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.5] text-slate-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUEM PODE + COMO FUNCIONA */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-container px-6 py-16">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-10">
            <div>
              <h2 className="text-[clamp(24px,3.2vw,28px)] font-semibold text-brand-900">
                Sua empresa pode migrar?
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.6] text-slate-600">
                Desde 2024, qualquer consumidor do <strong>Grupo A</strong> (média e alta tensão)
                pode comprar no Mercado Livre. É ideal para indústrias, comércios, redes, hospitais e
                agronegócio.
              </p>
              <ul className="mt-5 grid gap-3">
                {[
                  'Atendimento em média/alta tensão (Grupo A)',
                  'Conta de energia a partir de ~R$ 10 mil/mês',
                  'Sem obras e sem trocar de distribuidora',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-[10px] text-[15px] text-slate-700">
                    <span className="mt-[2px] flex h-5 w-5 flex-none items-center justify-center rounded-full bg-green-50">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15B86A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[12.5px] text-slate-400">
                Elegibilidade sujeita a análise da fatura e do enquadramento regulatório (Lei nº
                14.300/2022 e regras da CCEE/ANEEL).
              </p>
            </div>

            <div>
              <h2 className="text-[clamp(24px,3.2vw,28px)] font-semibold text-brand-900">
                Como funciona
              </h2>
              <div className="mt-5 grid gap-3">
                {STEPS.map((s) => (
                  <div key={s.n} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-[18px]">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-50 font-display text-[17px] font-bold text-brand-600">
                      {s.n}
                    </div>
                    <div>
                      <h3 className="font-sans text-[16px] font-semibold">{s.title}</h3>
                      <p className="mt-1 text-[14px] leading-[1.45] text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM DE CAPTURA */}
      <section ref={formRef} className="mx-auto max-w-container px-6 py-[72px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-10">
          <div>
            <h2 className="text-[clamp(26px,3.4vw,32px)] font-bold text-brand-900">
              Solicite uma proposta sem compromisso
            </h2>
            <p className="mt-4 text-[16px] leading-[1.6] text-slate-600">
              Preencha os dados da sua empresa. Um especialista do Grupo Evolight analisa seu
              consumo e retorna com a economia estimada em até 1 dia útil.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-brand-900 p-5">
              <span className="font-display text-[30px] font-bold text-solar-400">4,8★</span>
              <p className="text-[14px] leading-[1.5] text-brand-200">
                Experiência consolidada em Mercado Livre e Geração Distribuída — energia que faz bem
                ao caixa e ao planeta.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-[26px] shadow-md">
            {!sent ? (
              <>
                <div className="grid gap-[13px]">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                    <label className="block">
                      <span className="text-[13px] font-semibold text-slate-700">Responsável</span>
                      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className={inputClass} />
                    </label>
                    <label className="block">
                      <span className="text-[13px] font-semibold text-slate-700">Empresa</span>
                      <input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Razão social" className={inputClass} />
                    </label>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                    <label className="block">
                      <span className="text-[13px] font-semibold text-slate-700">CNPJ</span>
                      <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" className={inputClass} />
                    </label>
                    <label className="block">
                      <span className="text-[13px] font-semibold text-slate-700">Telefone</span>
                      <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 90000-0000" className={inputClass} />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-[13px] font-semibold text-slate-700">E-mail corporativo</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" className={inputClass} />
                  </label>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                    <label className="block">
                      <span className="text-[13px] font-semibold text-slate-700">Distribuidora</span>
                      <select value={dist} onChange={(e) => setDist(e.target.value)} className={`${inputClass} bg-white`}>
                        {DISTS.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-[13px] font-semibold text-slate-700">Consumo médio (R$/mês)</span>
                      <input value={consumo} onChange={(e) => setConsumo(e.target.value)} placeholder="Ex.: 25.000" className={inputClass} />
                    </label>
                  </div>
                  <label className="mt-[2px] flex cursor-pointer items-start gap-[9px]">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-[1px] h-[17px] w-[17px] flex-none accent-brand-600" />
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
                  onClick={submit}
                  disabled={submitting}
                  className="mt-4 w-full cursor-pointer rounded-xl border-none bg-green-500 p-[14px] text-base font-semibold text-white hover:bg-green-600 disabled:cursor-default disabled:opacity-70"
                >
                  {submitting ? 'Enviando…' : 'Solicitar proposta'}
                </button>
                <p className="mt-[10px] text-center text-[11.5px] text-slate-400">
                  Proposta gratuita e sem compromisso. Economia estimada, sujeita a análise.
                </p>
              </>
            ) : (
              <div className="py-8 text-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15B86A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <h3 className="mt-[18px] text-[22px] font-semibold text-slate-900">Proposta a caminho!</h3>
                <p className="mx-auto mt-2 max-w-[340px] text-[15px] leading-[1.5] text-slate-500">
                  Recebemos os dados da <strong className="text-brand-600">{empresa || 'sua empresa'}</strong>. Um
                  especialista do Grupo Evolight entra em contato em até 1 dia útil.
                </p>
                <button
                  onClick={nav.goHome}
                  className="mt-6 cursor-pointer rounded-xl border-none bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white hover:bg-brand-700"
                >
                  Voltar ao início
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
