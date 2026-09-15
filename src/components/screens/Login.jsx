import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

// Tela de acesso do ofertante. Ao autenticar, o listener de auth no App
// atualiza a sessão e o painel/editor são liberados.
export default function Login({ nav }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const inputClass =
    'mt-[6px] h-11 w-full rounded-xl border border-slate-200 px-3 text-[14.5px]'

  const submit = async () => {
    setError('')
    setInfo('')
    if (!isSupabaseConfigured) {
      setError('Backend não configurado (.env.local ausente).')
      return
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) throw error
        // sucesso: o App detecta a sessão e mostra o painel.
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome } },
        })
        if (error) throw error
        if (!data.session) {
          setInfo('Conta criada! Confirme o e-mail para entrar.')
          setMode('login')
        }
      }
    } catch (e) {
      setError(e.message || 'Não foi possível entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-[440px] px-6 pb-[110px] pt-14">
      <button
        onClick={nav.goHome}
        className="flex cursor-pointer items-center gap-[6px] border-none bg-transparent p-0 text-sm font-semibold text-brand-600"
      >
        ← Voltar ao início
      </button>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
        <div className="bg-brand-900 px-7 pb-5 pt-6">
          <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-brand-200">
            Painel do ofertante
          </span>
          <h1 className="mt-1 text-[24px] font-bold text-white">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
        </div>

        <div className="px-7 py-6">
          <div className="grid gap-[13px]">
            {mode === 'signup' && (
              <label className="block">
                <span className="text-[13px] font-semibold text-slate-700">Nome do ofertante</span>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: SolEnergia GD"
                  className={inputClass}
                />
              </label>
            )}
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-700">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-slate-700">Senha</span>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="••••••••"
                className={inputClass}
              />
            </label>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">
              {error}
            </p>
          )}
          {info && (
            <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-[13px] font-medium text-green-600">
              {info}
            </p>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="mt-4 w-full cursor-pointer rounded-xl border-none bg-brand-600 p-[13px] text-[15px] font-semibold text-white hover:bg-brand-700 disabled:cursor-default disabled:opacity-70"
          >
            {loading ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
              setInfo('')
            }}
            className="mt-3 w-full cursor-pointer border-none bg-transparent text-[13.5px] font-semibold text-brand-600"
          >
            {mode === 'login' ? 'Criar conta de ofertante' : 'Já tenho conta — entrar'}
          </button>

          {/* Dica só em desenvolvimento — removida do build de produção. */}
          {mode === 'login' && import.meta.env.DEV && (
            <div className="mt-5 rounded-xl border border-dashed border-brand-200 bg-brand-50 px-4 py-3 text-[12.5px] leading-[1.5] text-slate-600">
              <strong className="text-brand-700">Ofertante:</strong> demo.ofertante@wegen.dev ·{' '}
              WeGenDemo2026!
              <br />
              <strong className="text-brand-700">Admin:</strong> demo.admin@wegen.dev ·
              WeGenAdmin2026!
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
