// Leads fictícios do painel do ofertante (mesmos do protótipo WeGen v2).
export const LEADS = [
  { nome: 'Mariana Santos', dist: 'Equatorial GO', uf: 'GO', conta: 'R$ 480', data: '24 jun', status: 'Novo', kind: 'novo' },
  { nome: 'Padaria Real', dist: 'CPFL', uf: 'SP', conta: 'R$ 2.100', data: '23 jun', status: 'Em contato', kind: 'contato' },
  { nome: 'João Pereira', dist: 'Cemig', uf: 'MG', conta: 'R$ 320', data: '22 jun', status: 'Convertido', kind: 'convertido' },
  { nome: 'Ana Lima', dist: 'Equatorial GO', uf: 'GO', conta: 'R$ 650', data: '21 jun', status: 'Novo', kind: 'novo' },
  { nome: 'Mercado Bom Preço', dist: 'CPFL', uf: 'SP', conta: 'R$ 3.400', data: '19 jun', status: 'Perdido', kind: 'perdido' },
]

// Cores das tags de status (pill) — fundo + texto.
export const STATUS_TAG = {
  novo: { background: '#ECF3E1', color: '#264A03' },
  contato: { background: '#FFF6DE', color: '#B7791F' },
  convertido: { background: '#E7F7EF', color: '#0E9457' },
  perdido: { background: '#FDEDED', color: '#C7383C' },
}
