import { useState } from 'react'

const DISTS = ['Equatorial GO', 'CPFL', 'Cemig', 'Enel', 'Light']

// "5.000" -> 5000, "200" -> 200, "" -> null
const parseNum = (v) => {
  const n = Number(String(v).replace(/\D/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

export default function EditorOferta({ nav, offer, onSave }) {
  const isEdit = !!offer
  const [name, setName] = useState(offer?.name || '')
  const [desc, setDesc] = useState(offer ? Math.round(Number(offer.pct) * 100) : 20)
  const [dist, setDist] = useState(offer?.dist || 'Equatorial GO')
  const [tipo, setTipo] = useState(offer?.tipo || 'Residencial e Comercial')
  const [prazo, setPrazo] = useState(offer?.prazo || 'Sem fidelidade')
  const [limpa, setLimpa] = useState(offer ? !!offer.limpa : true)
  const [consumoMin, setConsumoMin] = useState(offer?.consumo_min != null ? String(offer.consumo_min) : '200')
  const [consumoMax, setConsumoMax] = useState(offer?.consumo_max != null ? String(offer.consumo_max) : '5.000')
  const [condicoes, setCondicoes] = useState(
    offer?.condicoes || 'Energia 100% limpa de geração distribuída solar. Sem custo de adesão.',
  )
  const [ativo, setAtivo] = useState(offer ? !!offer.ativo : true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const inputClass =
    'mt-[6px] h-11 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-[14.5px]'

  const save = async () => {
    setError('')
    if (!name.trim()) {
      setError('Informe o nome da oferta.')
      return
    }
    setSaving(true)
    const res = await onSave({
      name,
      pct: desc / 100,
      dist,
      tipo,
      prazo,
      limpa,
      ativo,
      condicoes,
      consumoMin: parseNum(consumoMin),
      consumoMax: parseNum(consumoMax),
    })
    setSaving(false)
    if (res?.error) {
      setError(res.error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <section className="mx-auto max-w-[560px] px-6 pb-[90px] pt-14 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15B86A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1 className="mt-5 text-[26px] font-bold text-brand-900">Oferta salva!</h1>
        <p className="mx-auto mt-3 max-w-[400px] text-[15px] leading-[1.5] text-slate-500">
          A oferta <strong className="text-brand-600">{name}</strong> foi {isEdit ? 'atualizada' : 'criada'} e está{' '}
          {ativo ? (
            <><strong className="text-green-600">ativa</strong> — já aparece nos resultados da simulação.</>
          ) : (
            <><strong className="text-slate-600">pausada</strong> — fica oculta até você ativá-la.</>
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={nav.goPainel}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-[15px] font-semibold text-slate-600"
          >
            Voltar ao painel
          </button>
          {ativo && (
            <button
              onClick={nav.goOfertas}
              className="cursor-pointer rounded-xl border-none bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white hover:bg-brand-700"
            >
              Ver no marketplace
            </button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[840px] px-6 pb-[90px] pt-8">
      <button
        onClick={nav.goPainel}
        className="flex cursor-pointer items-center gap-[6px] border-none bg-transparent p-0 text-sm font-semibold text-brand-600"
      >
        ← Voltar ao painel
      </button>
      <h1 className="mt-[14px] text-[30px] font-bold text-brand-900">
        {isEdit ? 'Editar oferta' : 'Criar oferta'}
      </h1>
      <p className="mt-[6px] text-[14.5px] text-slate-500">
        Defina o desconto e a cobertura. Os consumidores verão sua oferta nos resultados da simulação.
      </p>

      <div className="glass-strong mt-6 rounded-2xl p-[26px]">
        {/* Nome */}
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Nome da oferta</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: SolEnergia GD"
            className={inputClass}
          />
        </label>

        {/* Desconto */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-[22px]">
          <div>
            <div className="text-sm font-semibold text-slate-700">Percentual de desconto</div>
            <div className="text-[12.5px] text-slate-400">
              Aplicado sobre a parcela de energia da conta.
            </div>
          </div>
          <div className="font-display text-[40px] font-bold text-green-500">{desc}%</div>
        </div>
        <input
          type="range"
          min="5"
          max="35"
          value={desc}
          onChange={(e) => setDesc(Number(e.target.value))}
          className="mt-2 h-[6px] w-full accent-green-500"
        />

        {/* Cobertura */}
        <div className="mt-6 border-t border-slate-100 pt-[22px]">
          <div className="text-sm font-semibold text-slate-700">Distribuidora atendida</div>
          <div className="mt-3 flex flex-wrap gap-[9px]">
            {DISTS.map((d) => (
              <button
                key={d}
                onClick={() => setDist(d)}
                className={
                  d === dist
                    ? 'rounded-full border border-brand-100 bg-brand-50 px-[13px] py-[7px] text-[13px] font-semibold text-brand-600'
                    : 'rounded-full border border-slate-200 bg-white px-[13px] py-[7px] text-[13px] font-semibold text-slate-500'
                }
              >
                {d} {d === dist ? '✓' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Faixas e condições */}
        <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 border-t border-slate-100 pt-[22px]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Consumo mínimo (R$/mês)</span>
            <input value={consumoMin} onChange={(e) => setConsumoMin(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Consumo máximo (R$/mês)</span>
            <input value={consumoMax} onChange={(e) => setConsumoMax(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Tipo de conexão</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={`${inputClass} bg-white`}>
              <option>Residencial e Comercial</option>
              <option>Apenas Residencial</option>
              <option>Apenas Comercial / Industrial</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Fidelidade</span>
            <select value={prazo} onChange={(e) => setPrazo(e.target.value)} className={`${inputClass} bg-white`}>
              <option>Sem fidelidade</option>
              <option>12 meses</option>
              <option>24 meses</option>
            </select>
          </label>
        </div>

        {/* Energia limpa */}
        <div className="mt-6 border-t border-slate-100 pt-[22px]">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={limpa}
              onChange={(e) => setLimpa(e.target.checked)}
              className="h-4 w-4 accent-green-500"
            />
            Energia 100% limpa (geração distribuída renovável)
          </label>
        </div>

        {/* Condições */}
        <div className="mt-6 border-t border-slate-100 pt-[22px]">
          <span className="text-sm font-semibold text-slate-700">Condições e observações</span>
          <textarea
            rows={3}
            value={condicoes}
            onChange={(e) => setCondicoes(e.target.value)}
            placeholder="Ex.: energia 100% limpa de geração distribuída solar; sem custo de adesão; cancelamento gratuito após 12 meses."
            className="mt-[6px] w-full resize-y rounded-xl border border-slate-200 p-3 text-[14.5px]"
          />
        </div>

        {/* Status / toggle */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-[22px]">
          <div>
            <div className="text-sm font-semibold text-slate-700">Status da oferta</div>
            {ativo ? (
              <div className="text-[13px] font-semibold text-green-500">
                Ativa — visível nos resultados
              </div>
            ) : (
              <div className="text-[13px] font-semibold text-slate-400">
                Pausada — oculta dos consumidores
              </div>
            )}
          </div>
          <button
            onClick={() => setAtivo((a) => !a)}
            className={`relative h-[30px] w-[54px] cursor-pointer rounded-full border-none transition-colors ${
              ativo ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <span
              className="absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.3)] transition-[left]"
              style={{ left: ativo ? '27px' : '3px' }}
            />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={nav.goPainel}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-[15px] font-semibold text-slate-600"
        >
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="cursor-pointer rounded-xl border-none bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white hover:bg-brand-700 disabled:cursor-default disabled:opacity-70"
        >
          {saving ? 'Salvando…' : 'Salvar oferta'}
        </button>
      </div>
    </section>
  )
}
