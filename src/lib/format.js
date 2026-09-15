// Formata valor em reais, arredondado, no padrão pt-BR. Ex.: brl(480) => "R$ 480".
export const brl = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')

// Desconto formatado com sinal de menos tipográfico. Ex.: descPct(0.28) => "−28%".
export const descPct = (pct) => '−' + Math.round(pct * 100) + '%'

// Nota com vírgula decimal pt-BR. Ex.: ratingFmt(4.9) => "4,9".
export const ratingFmt = (n) => n.toFixed(1).replace('.', ',')

// Data curta pt-BR sem ponto. Ex.: "2026-06-24" => "24 jun".
export const dataFmt = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return d.getDate() + ' ' + mes
}

// Custo (créditos) para desbloquear o contato de um lead — escalonado pelo
// valor da conta. Espelha public.custo_desbloqueio() no banco.
export const custoLead = (conta) => {
  const n = Number(conta) || 0
  return Math.min(40, Math.max(5, Math.ceil(n / 200)))
}

// Rótulo de status a partir do "kind" armazenado.
export const STATUS_LABEL = {
  novo: 'Novo',
  contato: 'Em contato',
  convertido: 'Convertido',
  perdido: 'Perdido',
}
