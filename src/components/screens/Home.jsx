import Logo from '../Logo'
import { brl } from '../../lib/format'

// ---------- ícones dos diferenciais (linha, 1.75px) ----------
const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const FEATURES = [
  {
    title: '100% digital',
    desc: 'Do simulador ao contato, tudo online — sem papelada.',
    iconBg: 'bg-brand-50',
    icon: (
      <svg {...iconProps} stroke="#264A03">
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
  {
    title: 'Zero investimento',
    desc: 'Sem instalação, sem obras e sem custo para aderir.',
    iconBg: 'bg-brand-50',
    icon: (
      <svg {...iconProps} stroke="#264A03">
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18" />
        <circle cx="16.5" cy="14" r="1.3" fill="#264A03" />
      </svg>
    ),
  },
  {
    title: 'Economia real',
    desc: 'De 10% a 30% de desconto na sua conta, todo mês.',
    iconBg: 'bg-green-50',
    icon: (
      <svg {...iconProps} stroke="#15B86A">
        <polyline points="3 7 10 14 14 10 21 17" />
        <polyline points="15 17 21 17 21 11" />
      </svg>
    ),
  },
  {
    title: 'Previsibilidade',
    desc: 'Desconto fixo e contratado — você sabe quanto vai pagar.',
    iconBg: 'bg-brand-50',
    icon: (
      <svg {...iconProps} stroke="#264A03">
        <path d="M4 19V5" />
        <polyline points="4 16 9 11 13 14 20 6" />
        <path d="M4 19h16" />
      </svg>
    ),
  },
  {
    title: 'Liberdade de escolha',
    desc: 'Compare ofertantes de forma transparente e decida sem pressão.',
    iconBg: 'bg-brand-50',
    icon: (
      <svg {...iconProps} stroke="#264A03">
        <path d="M4 7h9l4 4h3" />
        <polyline points="17 7 20 4" />
        <path d="M4 17h9l3-3" />
      </svg>
    ),
  },
  {
    title: 'Energia limpa',
    desc: 'Geração distribuída renovável — economia que faz bem ao planeta.',
    iconBg: 'bg-solar-50',
    icon: (
      <svg {...iconProps} stroke="#FBA919">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
      </svg>
    ),
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Simule',
    desc: 'Informe sua distribuidora e o valor médio da conta. Mostramos sua economia estimada na hora.',
    badge: 'bg-brand-50 text-brand-600',
  },
  {
    n: '2',
    title: 'Compare',
    desc: 'Veja ofertas lado a lado: desconto, economia, prazo e a avaliação de cada ofertante.',
    badge: 'bg-brand-50 text-brand-600',
  },
  {
    n: '3',
    title: 'Solicite contato',
    desc: 'Escolheu? Enviamos seu pedido ao ofertante, que fecha tudo com você. Sem obras, sem dor de cabeça.',
    badge: 'bg-green-50 text-green-600',
  },
]

const STATS = [
  { value: '12.400+', label: 'simulações feitas', color: 'text-brand-600' },
  { value: 'R$ 3,2 mi', label: 'economizados pelos usuários', color: 'text-green-500' },
  { value: '48', label: 'ofertantes verificados', color: 'text-brand-600' },
  { value: '4,8★', label: 'avaliação média', color: 'text-solar-500' },
]

export default function Home({
  nav,
  dist,
  setDist,
  cidade,
  setCidade,
  conexao,
  setConexao,
  conta,
  setConta,
}) {
  const simMes = conta * 0.22

  return (
    <div>
      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: '#0E2103',
          backgroundImage:
            'radial-gradient(900px 480px at 78% -10%, rgba(53,99,13,.55), transparent 60%), radial-gradient(620px 420px at 8% 110%, rgba(251,169,25,.16), transparent 60%)',
        }}
      >
        <div className="mx-auto grid max-w-container grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-center gap-12 px-6 pb-[72px] pt-16">
          {/* Coluna esquerda */}
          <div>
            <span className="inline-flex items-center gap-[7px] rounded-full border border-[rgba(166,195,130,.35)] bg-white/[0.08] px-3 py-[6px] text-[12.5px] font-semibold text-brand-100 backdrop-blur-[4px]">
              Uma plataforma do Grupo Evolight
            </span>
            <h1 className="mt-5 text-[clamp(36px,5vw,58px)] font-bold leading-[1.08] text-white">
              A sua conta de luz
              <br />
              até <span className="text-green-500">30% mais barata</span>.
            </h1>
            <p className="mt-[18px] max-w-[500px] text-[18px] leading-[1.55] text-brand-200">
              Um marketplace que compara ofertas de energia limpa e conecta você ao melhor ofertante.
              Sem obras, sem trocar de distribuidora.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={nav.goOfertas}
                className="cursor-pointer rounded-xl border-none bg-green-500 px-6 py-[14px] text-base font-semibold text-white hover:bg-green-600"
              >
                Quero economizar →
              </button>
              <button
                onClick={nav.goPainel}
                className="cursor-pointer rounded-xl border border-[rgba(166,195,130,.4)] bg-white/[0.06] px-[22px] py-[14px] text-base font-semibold text-white hover:bg-white/[0.12]"
              >
                Sou ofertante
              </button>
            </div>
            <div className="mt-[34px] flex flex-wrap gap-7 border-t border-[rgba(166,195,130,.18)] pt-[26px]">
              <div>
                <div className="font-display text-[26px] font-bold text-white">12.400+</div>
                <div className="mt-[2px] text-[13px] text-brand-300">simulações</div>
              </div>
              <div>
                <div className="font-display text-[26px] font-bold text-green-500">R$ 3,2 mi</div>
                <div className="mt-[2px] text-[13px] text-brand-300">economizados</div>
              </div>
              <div>
                <div className="font-display text-[26px] font-bold text-solar-400">4,8★</div>
                <div className="mt-[2px] text-[13px] text-brand-300">avaliação média</div>
              </div>
            </div>
          </div>

          {/* SIMULADOR */}
          <div className="rounded-[20px] border border-slate-200 bg-white px-[26px] pb-6 pt-[26px] shadow-lg">
            <h3 className="text-[20px] font-semibold text-slate-900">Simule sua economia</h3>
            <p className="mt-1 text-[13px] text-slate-500">Leva menos de 1 minuto.</p>

            <div className="mt-[18px] grid gap-[14px]">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[13px] font-semibold text-slate-700">Distribuidora</span>
                  <select
                    value={dist}
                    onChange={(e) => setDist(e.target.value)}
                    className="mt-[6px] h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14.5px] text-slate-900"
                  >
                    <option>Equatorial GO</option>
                    <option>Cemig</option>
                    <option>CPFL</option>
                    <option>Enel</option>
                    <option>Light</option>
                    <option>Energisa</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[13px] font-semibold text-slate-700">Cidade / UF</span>
                  <input
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="mt-[6px] h-11 w-full rounded-xl border border-slate-200 px-3 text-[14.5px] text-slate-900"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-700">Tipo de conexão</span>
                <select
                  value={conexao}
                  onChange={(e) => setConexao(e.target.value)}
                  className="mt-[6px] h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14.5px] text-slate-900"
                >
                  <option>Residencial (B2C)</option>
                  <option>Comercial (B2B)</option>
                  <option>Industrial (B2B)</option>
                </select>
              </label>
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-slate-700">Valor médio da conta</span>
                  <span className="font-display text-base font-bold text-brand-600">{brl(conta)}</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="3000"
                  step="10"
                  value={conta}
                  onChange={(e) => setConta(Number(e.target.value))}
                  className="mt-[10px] h-[6px] w-full"
                />
              </div>
            </div>

            <div className="mt-[18px] rounded-[14px] border border-green-100 bg-green-50 p-4">
              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-green-600">
                Economia estimada
              </span>
              <div className="mt-1 font-display text-[clamp(28px,4vw,40px)] font-bold leading-[1.05] text-green-500">
                {brl(simMes)}
                <span className="text-base font-semibold text-green-600">/mês</span>
              </div>
              <div className="mt-[2px] text-sm font-semibold text-green-600">
                {brl(simMes * 12)} por ano
              </div>
            </div>

            <button
              onClick={nav.goOfertas}
              className="mt-4 w-full cursor-pointer rounded-xl border-none bg-green-500 p-[14px] text-base font-semibold text-white hover:bg-green-600"
            >
              Ver ofertas →
            </button>
            <p className="mt-[10px] text-center text-[11.5px] text-slate-400">
              Valor estimado, não vinculante. A economia real depende da oferta escolhida.
            </p>
          </div>
        </div>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section className="mx-auto max-w-container px-6 py-[72px]">
        <div className="mx-auto max-w-[640px] text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-brand-500">
            Como funciona
          </span>
          <h2 className="mt-[10px] text-[clamp(26px,3.4vw,30px)] font-semibold text-brand-900">
            Três passos para começar a economizar
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[22px]">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-slate-200 bg-white p-[26px] shadow-sm"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl font-display text-[18px] font-bold ${s.badge}`}
              >
                {s.n}
              </div>
              <h3 className="mt-4 text-[19px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ DIFERENCIAIS ============ */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-container px-6 py-16">
          <h2 className="text-center text-[clamp(24px,3.2vw,28px)] font-semibold text-brand-900">
            Por que escolher a WeGen
          </h2>
          <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-[14px] rounded-[14px] border border-slate-200 bg-white p-5"
              >
                <span
                  className={`flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[11px] ${f.iconBg}`}
                >
                  {f.icon}
                </span>
                <div>
                  <h4 className="font-sans text-base font-semibold">{f.title}</h4>
                  <p className="mt-[3px] text-sm leading-[1.45] text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROVA SOCIAL ============ */}
      <section className="mx-auto max-w-container px-6 py-[72px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5 border-b border-slate-200 pb-12 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className={`font-display text-[34px] font-bold ${s.color}`}>{s.value}</div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[22px]">
          {/* Depoimento 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-[26px] shadow-sm">
            <div className="text-base tracking-[2px] text-solar-400">★★★★★</div>
            <p className="mt-[14px] text-base leading-[1.55] text-slate-700">
              "Em 10 minutos eu já tinha comparado três ofertas e pedido contato. Estou economizando
              R$ 180 por mês sem ter mudado nada em casa."
            </p>
            <div className="mt-[18px] flex items-center gap-[10px]">
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-600">
                MS
              </span>
              <div>
                <div className="text-[14.5px] font-semibold">Mariana Santos</div>
                <div className="text-[13px] text-slate-400">Residência · Goiânia/GO</div>
              </div>
            </div>
          </div>
          {/* Depoimento 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-[26px] shadow-sm">
            <div className="text-base tracking-[2px] text-solar-400">★★★★★</div>
            <p className="mt-[14px] text-base leading-[1.55] text-slate-700">
              "Como o gasto de energia da padaria é alto, a economia de 22% fez muita diferença no
              caixa. Comparação transparente, recomendo."
            </p>
            <div className="mt-[18px] flex items-center gap-[10px]">
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-green-50 font-semibold text-green-600">
                RC
              </span>
              <div>
                <div className="text-[14.5px] font-semibold">Rafael Coelho</div>
                <div className="text-[13px] text-slate-400">Padaria Real · São Paulo/SP</div>
              </div>
            </div>
          </div>
          {/* Selo Evolight */}
          <div className="flex flex-col justify-center rounded-2xl bg-brand-900 p-[26px]">
            <Logo dark height={30} />
            <h3 className="mt-[14px] text-[20px] font-semibold text-white">
              Faz parte do Grupo Evolight
            </h3>
            <p className="mt-2 text-[14.5px] leading-[1.5] text-brand-200">
              Experiência consolidada em Mercado Livre e Geração Distribuída, agora a um clique de
              você.
            </p>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="bg-brand-600">
        <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-6 px-6 py-14">
          <div>
            <h2 className="text-[clamp(24px,3vw,30px)] font-semibold text-white">
              Pronto para pagar menos?
            </h2>
            <p className="mt-2 text-base text-brand-100">
              Simule agora — é grátis e leva menos de 1 minuto.
            </p>
          </div>
          <button
            onClick={nav.goHome}
            className="cursor-pointer rounded-xl border-none bg-green-500 px-7 py-[15px] text-[17px] font-semibold text-white hover:bg-green-600"
          >
            Simular minha economia
          </button>
        </div>
      </section>
    </div>
  )
}
