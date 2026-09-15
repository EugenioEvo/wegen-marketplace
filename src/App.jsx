import { useCallback, useEffect, useState } from 'react'
import { OFFERS } from './data/offers'
import { LEADS } from './data/leads'
import { supabase, isSupabaseConfigured } from './lib/supabase'
import { brl, dataFmt, STATUS_LABEL, custoLead } from './lib/format'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './components/screens/Home'
import Ofertas from './components/screens/Ofertas'
import Comparar from './components/screens/Comparar'
import PainelLeads from './components/screens/PainelLeads'
import EditorOferta from './components/screens/EditorOferta'
import MercadoLivre from './components/screens/MercadoLivre'
import AdminMercadoLivre from './components/screens/AdminMercadoLivre'
import ConfirmarConversao from './components/screens/ConfirmarConversao'
import Login from './components/screens/Login'
import CompareBar from './components/CompareBar'
import ContactModal from './components/ContactModal'

const MAX_COMPARE = 3

// UF por distribuidora — usado ao criar oferta e ao capturar leads.
const UF_BY_DIST = {
  'Equatorial GO': 'GO',
  CPFL: 'SP',
  Cemig: 'MG',
  Enel: 'RJ',
  Light: 'RJ',
  Energisa: 'MS',
}

const mapOffer = (o) => ({
  id: o.id,
  name: o.name,
  initials: o.initials,
  dist: o.dist,
  uf: o.uf,
  pct: Number(o.pct),
  rating: Number(o.rating),
  reviews: o.reviews,
  tipo: o.tipo,
  prazo: o.prazo,
  limpa: o.limpa,
})

const mapLead = (r) => ({
  id: r.id,
  nome: r.nome,
  dist: r.dist || '—',
  uf: r.uf || '',
  conta: r.conta != null ? brl(Number(r.conta)) : '—',
  contaNum: r.conta != null ? Number(r.conta) : 0,
  custo: custoLead(r.conta),
  data: dataFmt(r.created_at),
  kind: r.status,
  status: STATUS_LABEL[r.status] || r.status,
  valorContrato: r.valor_contrato != null ? Number(r.valor_contrato) : null,
  motivoPerda: r.motivo_perda || '',
  conversaoConfirmada: !!r.conversao_confirmada,
  confirmacaoToken: r.confirmacao_token || null,
})

// telefone/email não vêm no SELECT (ocultos por grant) — revelados via RPC.
const mapMlLead = (r) => ({
  id: r.id,
  empresa: r.empresa || '—',
  cnpj: r.cnpj || '—',
  nome: r.nome,
  dist: r.dist || '—',
  uf: r.uf || '',
  conta: r.conta != null ? brl(Number(r.conta)) : '—',
  data: dataFmt(r.created_at),
  kind: r.status,
  status: STATUS_LABEL[r.status] || r.status,
})

export default function App() {
  // ----- estado central -----
  const [screen, setScreen] = useState('home')
  const [dist, setDist] = useState('Equatorial GO')
  const [cidade, setCidade] = useState('Goiânia/GO')
  const [conexao, setConexao] = useState('Residencial (B2C)')
  const [conta, setConta] = useState(480)
  const [sort, setSort] = useState('eco')
  const [faved, setFaved] = useState({})
  const [compared, setCompared] = useState([])
  const [contactId, setContactId] = useState(null)
  const [sent, setSent] = useState(false)

  // ----- dados do backend (fallback local só quando NÃO há Supabase) -----
  const [offers, setOffers] = useState(isSupabaseConfigured ? [] : OFFERS)
  const [leads, setLeads] = useState(isSupabaseConfigured ? [] : LEADS)
  const [myOffers, setMyOffers] = useState([])
  const [editingOffer, setEditingOffer] = useState(null)
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mlLeads, setMlLeads] = useState([])
  // ----- monetização (carteira + desbloqueio de contato) -----
  const [saldo, setSaldo] = useState(0)
  const [gasto, setGasto] = useState(0) // créditos já gastos em desbloqueios
  const [unlockedIds, setUnlockedIds] = useState(() => new Set())
  const [revealed, setRevealed] = useState({}) // { leadId: { telefone, email } }
  const [confirmToken, setConfirmToken] = useState(null)

  // Link público de confirmação de conversão: ?confirmar=<token>
  useEffect(() => {
    try {
      const tk = new URLSearchParams(window.location.search).get('confirmar')
      if (tk) {
        setConfirmToken(tk)
        setScreen('confirmar')
      }
    } catch {
      /* ignore */
    }
  }, [])

  const refetchOffers = useCallback(async () => {
    if (!isSupabaseConfigured) return
    // colunas explícitas: não expor owner_id (uuid do ofertante) ao público
    const { data, error } = await supabase
      .from('ofertas')
      .select('id,name,initials,dist,uf,pct,rating,reviews,tipo,prazo,limpa,ativo,ordem,created_at')
      .eq('ativo', true)
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) return
    setOffers(data.map(mapOffer))
    // poda seleções de comparação que não existem mais no conjunto novo
    setCompared((cur) => cur.filter((id) => data.some((o) => o.id === id)))
  }, [])

  // Leads do marketplace (GD) do ofertante. Filtra origem para não misturar
  // leads de Mercado Livre (que só o admin vê no painel próprio).
  // colunas explícitas: telefone/email NÃO são selecionáveis (só via RPC paga)
  const LEAD_COLS =
    'id,oferta_id,nome,dist,uf,conta,status,created_at,valor_contrato,motivo_perda,conversao_confirmada,confirmacao_token'
  const fetchLeads = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const { data, error } = await supabase
      .from('leads')
      .select(LEAD_COLS)
      .eq('origem', 'marketplace')
      .order('created_at', { ascending: false })
    if (!error && data) setLeads(data.map(mapLead))
  }, [])

  // Ofertas do ofertante logado (ativas + pausadas) — RLS ofertas_select_owner.
  const fetchMyOffers = useCallback(async (uid) => {
    if (!isSupabaseConfigured || !uid) return
    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .eq('owner_id', uid)
      .order('ativo', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error && data) setMyOffers(data)
  }, [])

  // Admin WeGen? Se for, carrega os leads de Mercado Livre (RLS leads_select_admin).
  const checkAdmin = useCallback(async (uid) => {
    if (!isSupabaseConfigured || !uid) {
      setIsAdmin(false)
      setMlLeads([])
      return
    }
    const { data: row } = await supabase
      .from('wegen_admins')
      .select('user_id')
      .eq('user_id', uid)
      .maybeSingle()
    const admin = !!row
    setIsAdmin(admin)
    if (admin) {
      const { data } = await supabase
        .from('leads')
        .select('id,empresa,cnpj,nome,dist,uf,conta,status,created_at')
        .eq('origem', 'mercado_livre')
        .order('created_at', { ascending: false })
      setMlLeads((data || []).map(mapMlLead))
    } else {
      setMlLeads([])
    }
  }, [])

  // Carteira do ofertante: saldo + quais leads já foram desbloqueados.
  const fetchCarteira = useCallback(async (uid) => {
    if (!isSupabaseConfigured || !uid) return
    const { data: c } = await supabase
      .from('creditos_ofertante')
      .select('saldo')
      .eq('ofertante_id', uid)
      .maybeSingle()
    setSaldo(c?.saldo ?? 0)
    const { data: d } = await supabase
      .from('lead_desbloqueios')
      .select('lead_id,custo')
      .eq('ofertante_id', uid)
    setUnlockedIds(new Set((d || []).map((x) => x.lead_id)))
    setGasto((d || []).reduce((s, x) => s + (x.custo || 0), 0))
  }, [])

  // Rastreio de funil (fire-and-forget).
  const track = useCallback((evento, extra) => {
    if (!isSupabaseConfigured) return
    let sid = null
    try {
      sid = localStorage.getItem('wg_sid')
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
        localStorage.setItem('wg_sid', sid)
      }
    } catch {
      /* ignore */
    }
    supabase
      .from('eventos_funil')
      .insert({ evento, session_id: sid, ...(extra || {}) })
      .then(() => {})
  }, [])

  // Revela telefone/email de um lead (RPC): admin = grátis; ofertante = debita.
  const revelarContato = async (leadId) => {
    if (!isSupabaseConfigured || !session) return { error: 'Faça login.' }
    const { data, error } = await supabase.rpc('revelar_contato', { p_lead_id: leadId })
    if (error) {
      const m = error.message || ''
      if (m.includes('saldo_insuficiente')) return { error: 'Saldo insuficiente — recarregue créditos.' }
      if (m.includes('sem_permissao')) return { error: 'Sem permissão para este lead.' }
      return { error: 'Não foi possível revelar o contato.' }
    }
    const row = Array.isArray(data) ? data[0] : data
    setRevealed((r) => ({ ...r, [leadId]: { telefone: row?.telefone, email: row?.email } }))
    setUnlockedIds((s) => new Set(s).add(leadId))
    if (!isAdmin) fetchCarteira(session.user.id)
    return { ok: true }
  }

  // Recarga de créditos (MOCK — em produção via webhook do gateway).
  const recarregar = async (qtd) => {
    if (!isSupabaseConfigured || !session) return
    const { error } = await supabase.rpc('recarregar_creditos', { p_quantidade: qtd })
    if (!error) fetchCarteira(session.user.id)
  }

  // ----- CRM: mover estágio, nota, timeline -----
  const moveLeadStatus = async (leadId, novoStatus, extra) => {
    if (!isSupabaseConfigured || !session) return { error: 'Faça login.' }
    const { error } = await supabase
      .from('leads')
      .update({ status: novoStatus, ...(extra || {}) })
      .eq('id', leadId)
    if (error) {
      const m = error.message || ''
      if (m.includes('valor_contrato_obrigatorio')) return { error: 'Informe o valor do contrato.' }
      if (m.includes('motivo_perda_obrigatorio')) return { error: 'Informe o motivo da perda.' }
      return { error: 'Não foi possível mover o lead.' }
    }
    await fetchLeads()
    return { ok: true }
  }

  const addNota = async (leadId, texto) => {
    if (!isSupabaseConfigured || !session) return { error: 'Faça login.' }
    const { error } = await supabase.rpc('adicionar_nota', { p_lead_id: leadId, p_texto: texto })
    return error ? { error: 'Não foi possível salvar a nota.' } : { ok: true }
  }

  const fetchInteracoes = async (leadId) => {
    if (!isSupabaseConfigured) return []
    const { data } = await supabase
      .from('lead_interacoes')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true })
    return data || []
  }

  // carga inicial de ofertas (pública) + assinatura de auth
  useEffect(() => {
    if (!isSupabaseConfigured) return
    refetchOffers()
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [refetchOffers])

  // leads + ofertas próprias + admin dependem de sessão (RLS)
  useEffect(() => {
    if (session) {
      fetchLeads()
      fetchMyOffers(session.user.id)
      checkAdmin(session.user.id)
      fetchCarteira(session.user.id)
    } else {
      setLeads(isSupabaseConfigured ? [] : LEADS)
      setMyOffers([])
      setIsAdmin(false)
      setMlLeads([])
      setSaldo(0)
      setGasto(0)
      setUnlockedIds(new Set())
      setRevealed({})
    }
  }, [session, fetchLeads, fetchMyOffers, checkAdmin, fetchCarteira])

  // ----- navegação -----
  const go = (s) => {
    setScreen(s)
    window.scrollTo(0, 0)
  }
  const nav = {
    goHome: () => go('home'),
    goOfertas: () => {
      track('ver_ofertas')
      go('ofertas')
    },
    goComparar: () => go('comparar'),
    goPainel: () => go('painel'),
    goEditor: () => go('editor'),
    goEmpresa: () => go('empresa'),
    goAdmin: () => go('admin'),
  }

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    go('home')
  }

  // ----- favoritar / comparar -----
  const toggleFav = (id) => setFaved((st) => ({ ...st, [id]: !st[id] }))
  const toggleCompare = (id) =>
    setCompared((st) => {
      if (st.includes(id)) return st.filter((x) => x !== id)
      if (st.length >= MAX_COMPARE) return st
      return [...st, id]
    })

  // ----- modal de contato -----
  const openContact = (id) => {
    setContactId(id)
    setSent(false)
  }
  const closeContact = () => {
    setContactId(null)
    setSent(false)
  }
  const closeAndOfertas = () => {
    setContactId(null)
    setSent(false)
    setScreen('ofertas')
  }
  const contactOffer = offers.find((o) => o.id === contactId) || null

  const submitContact = async (form) => {
    if (isSupabaseConfigured && contactOffer) {
      const uf = (cidade.split('/')[1] || '').trim()
      const { error } = await supabase.from('leads').insert({
        oferta_id: contactOffer.id,
        ofertante_nome: contactOffer.name,
        nome: form.nome?.trim() || 'Consumidor',
        telefone: form.telefone?.trim() || null,
        email: form.email?.trim() || null,
        dist,
        uf,
        conta,
        consent: !!form.consent,
        status: 'novo',
      })
      if (error) {
        console.warn('[wegen] falha ao gravar lead:', error.message)
        return { error: 'Não foi possível enviar agora. Tente novamente.' }
      }
      track('solicitou_contato', { oferta_id: contactOffer.id })
      if (session) fetchLeads()
    }
    setSent(true)
    return { ok: true }
  }

  // ----- lead B2B de Mercado Livre (landing "Para minha empresa") -----
  const submitEmpresaLead = async (form) => {
    if (!isSupabaseConfigured) return { ok: true }
    const { error } = await supabase.from('leads').insert({
      origem: 'mercado_livre',
      nome: form.nome?.trim() || form.empresa?.trim() || 'Contato',
      empresa: form.empresa?.trim() || null,
      cnpj: form.cnpj?.trim() || null,
      email: form.email?.trim() || null,
      telefone: form.telefone?.trim() || null,
      dist: form.dist || null,
      uf: UF_BY_DIST[form.dist] || null,
      conta: form.consumo || null,
      consent: !!form.consent,
      status: 'novo',
    })
    if (error) return { error: error.message }
    return { ok: true }
  }

  // ----- criar / editar oferta (editor) -----
  const saveOffer = async (form, editId) => {
    if (!isSupabaseConfigured || !session) return { error: 'Faça login para salvar.' }
    const initials =
      form.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || 'OF'
    const payload = {
      name: form.name.trim(),
      initials,
      dist: form.dist,
      uf: UF_BY_DIST[form.dist] || '',
      pct: form.pct,
      tipo: form.tipo,
      prazo: form.prazo,
      limpa: form.limpa,
      ativo: form.ativo,
      condicoes: form.condicoes,
      consumo_min: form.consumoMin,
      consumo_max: form.consumoMax,
    }
    const { error } = editId
      ? await supabase.from('ofertas').update(payload).eq('id', editId)
      : await supabase
          .from('ofertas')
          .insert({ owner_id: session.user.id, rating: 0, reviews: 0, ...payload })
    if (error) return { error: error.message }
    await refetchOffers()
    await fetchMyOffers(session.user.id)
    return { ok: true }
  }

  const toggleOfferActive = async (offer) => {
    if (!isSupabaseConfigured || !session) return
    await supabase.from('ofertas').update({ ativo: !offer.ativo }).eq('id', offer.id)
    await refetchOffers()
    await fetchMyOffers(session.user.id)
  }

  const editOffer = (offer) => {
    setEditingOffer(offer)
    go('editor')
  }
  const newOffer = () => {
    setEditingOffer(null)
    go('editor')
  }

  // métricas do painel a partir dos dados reais
  const convertidos = leads.filter((l) => l.kind === 'convertido')
  const confirmados = convertidos.filter((l) => l.conversaoConfirmada)
  const metrics = {
    leadsNovos: leads.filter((l) => l.kind === 'novo').length,
    ofertasAtivas: myOffers.filter((o) => o.ativo).length,
    conversao: leads.length ? Math.round((convertidos.length / leads.length) * 100) : 0,
    convertidos: convertidos.length,
    confirmados: confirmados.length,
    gasto,
    // valor fechado: só contratos com valor informado; confirmado = validado pelo consumidor
    valorFechado: convertidos.reduce((s, l) => s + (l.valorContrato || 0), 0),
    valorConfirmado: confirmados.reduce((s, l) => s + (l.valorContrato || 0), 0),
  }

  const authed = !!session || !isSupabaseConfigured
  const needsLogin = (screen === 'painel' || screen === 'editor' || screen === 'admin') && !authed

  return (
    <div className="flex min-h-screen flex-col">
      <Header nav={nav} authed={!!session} isAdmin={isAdmin} onSignOut={signOut} />

      <main className="flex-1">
        {screen === 'home' && (
          <Home
            nav={nav}
            dist={dist}
            setDist={setDist}
            cidade={cidade}
            setCidade={setCidade}
            conexao={conexao}
            setConexao={setConexao}
            conta={conta}
            setConta={setConta}
          />
        )}

        {screen === 'empresa' && <MercadoLivre nav={nav} onSubmit={submitEmpresaLead} />}

        {screen === 'confirmar' && <ConfirmarConversao nav={nav} token={confirmToken} />}

        {screen === 'ofertas' && (
          <Ofertas
            nav={nav}
            offers={offers}
            conta={conta}
            conexao={conexao}
            dist={dist}
            sort={sort}
            setSort={setSort}
            faved={faved}
            compared={compared}
            toggleFav={toggleFav}
            toggleCompare={toggleCompare}
            openContact={openContact}
          />
        )}

        {screen === 'comparar' && (
          <Comparar
            nav={nav}
            offers={offers}
            conta={conta}
            compared={compared}
            openContact={openContact}
          />
        )}

        {needsLogin && <Login nav={nav} />}

        {screen === 'painel' && !needsLogin && (
          <PainelLeads
            nav={nav}
            leads={leads}
            myOffers={myOffers}
            metrics={metrics}
            saldo={saldo}
            unlockedIds={unlockedIds}
            revealed={revealed}
            onReveal={revelarContato}
            onRecarga={recarregar}
            onMove={moveLeadStatus}
            onAddNota={addNota}
            fetchInteracoes={fetchInteracoes}
            onNewOffer={newOffer}
            onEditOffer={editOffer}
            onToggleOffer={toggleOfferActive}
          />
        )}

        {screen === 'editor' && !needsLogin && (
          <EditorOferta
            nav={nav}
            offer={editingOffer}
            onSave={(form) => saveOffer(form, editingOffer?.id)}
          />
        )}

        {screen === 'admin' &&
          !needsLogin &&
          (isAdmin ? (
            <AdminMercadoLivre nav={nav} leads={mlLeads} revealed={revealed} onReveal={revelarContato} />
          ) : (
            <section className="mx-auto max-w-container px-6 py-24 text-center">
              <h1 className="text-[24px] font-bold text-brand-900">Acesso restrito</h1>
              <p className="mx-auto mt-3 max-w-[420px] text-slate-500">
                Esta área é do time WeGen (admin). Sua conta de ofertante não tem acesso.
              </p>
              <button
                onClick={nav.goHome}
                className="mt-6 cursor-pointer rounded-xl border-none bg-brand-600 px-6 py-3 text-[15px] font-semibold text-white"
              >
                Voltar ao início
              </button>
            </section>
          ))}
      </main>

      <Footer />

      {compared.length > 0 && screen === 'ofertas' && (
        <CompareBar count={compared.length} goComparar={nav.goComparar} />
      )}

      {contactOffer && (
        <ContactModal
          name={contactOffer.name}
          sent={sent}
          onSubmit={submitContact}
          closeContact={closeContact}
          closeAndOfertas={closeAndOfertas}
        />
      )}
    </div>
  )
}
