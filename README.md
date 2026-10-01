# WeGen — Marketplace de energia

Front-end da **WeGen**, o marketplace de energia do Grupo Evolight. Esta é a
implementação fiel do protótipo `WeGen v2.dc.html` (handoff do Claude Design),
recriado como um app React real.

> Modelo do produto: marketplace de conexão/leads (B2C e B2B). O usuário
> **simula** a economia, **compara** ofertas de Geração Distribuída e
> **solicita contato** — a plataforma entrega o lead ao ofertante. Ver
> `../Escopo_MVP_Marketplace_Energia.md` e `../WeGen_DesignSystem_e_Prompt.md`.

## Stack

- [Vite](https://vite.dev/) + [React 18](https://react.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/) — os tokens da WeGen (verde da marca,
  dourado, Poppins/Inter, sombras) ficam em [`tailwind.config.js`](tailwind.config.js)
- [Supabase](https://supabase.com/) — ofertas e leads (Postgres + RLS). Com
  fallback local (`src/data/`) para rodar sem backend configurado.

## Rodando

```bash
npm install
cp .env.example .env.local   # preencha com URL + chave publishable do Supabase
npm run dev      # servidor de desenvolvimento (http://localhost:5173)
npm run build    # build de produção em dist/
npm run preview  # serve o build de produção
```

Sem `.env.local`, o app roda com os dados fictícios locais (nada quebra).

**Produção:** https://wegen-marketplace.vercel.app — deploy automático a cada
push na `main` deste repositório (GitHub `EugenioEvo/wegen-marketplace` →
Vercel, projeto `wegen-marketplace`). O `.env.production` commitado traz a URL
e a chave *publishable* do Supabase (pública por design).

## Backend (Supabase)

Projeto **wegen-energy** (região `sa-east-1`). O marketplace convive no mesmo
projeto do sistema de gestão de usinas do Grupo Evolight (tabelas `clientes`,
`usinas_remotas`, etc.) — **um pipeline só**: um lead vira cliente, que se vincula
a uma usina. As tabelas do marketplace têm Row Level Security:

| Tabela | RLS | Uso |
|---|---|---|
| `ofertas` | `SELECT` público de `ativo=true`; dono vê/insere/edita as próprias (`owner_id = auth.uid()`) | grade de ofertas + editor |
| `leads` | `INSERT` público com `status='novo'`; `SELECT` **só do dono/admin** (colunas `telefone`/`email` revogadas — só via RPC) | contato grava; painel lê |
| `lead_notificacoes` | `SELECT` do dono | outbox — 1 linha `pendente` por novo lead (trigger) |
| `creditos_ofertante` | `SELECT` do dono | carteira de créditos (escrita só via RPC) |
| `credito_transacoes` | `SELECT` do dono | extrato (recarga / débito) |
| `lead_desbloqueios` | `SELECT` do dono | evento faturável: contato desbloqueado |
| `eventos_funil` | `INSERT` público; `SELECT` admin | instrumentação do funil |

Fluxo end-to-end: **simular → comparar → Solicitar contato** grava um lead
(com a oferta escolhida + contexto do simulador) → o trigger enfileira uma
notificação → o lead aparece no **Painel do ofertante** (autenticado), onde o
**contato (telefone/e-mail) é desbloqueado pagando créditos** — ver Monetização.

### Acesso do ofertante (auth)

O painel e o editor exigem login (Supabase Auth, e-mail + senha). A leitura de
`leads` é escopada por ofertante via RLS — **não há mais leitura pública** (o
furo de segurança do protótipo foi fechado). Cada oferta tem um `owner_id`
(`auth.users`), e o ofertante só vê os leads das ofertas que possui.

Contas demo (papéis separados — ofertante paga por lead, admin é oversight):

```
Ofertante: demo.ofertante@wegen.dev · WeGenDemo2026!   (200 créditos semeados)
Admin:     demo.admin@wegen.dev     · WeGenAdmin2026!  (vê leads de Mercado Livre)
```

> A dica de credenciais só aparece em **desenvolvimento** (`import.meta.env.DEV`)
> — é removida do build de produção. A confirmação de e-mail está ligada no
> projeto, então **novos** cadastros precisam confirmar o e-mail antes de entrar.
> A conta demo já está confirmada.

### Landing B2B — Mercado Livre de Energia

"**Para minha empresa**" (header) leva a uma landing sobre o **Mercado Livre de
Energia** (média/alta tensão) — sem ofertas/comparação, apenas captura de lead
(empresa, CNPJ, consumo). O lead é gravado em `leads` com `origem='mercado_livre'`
(sem `oferta_id`), separado dos leads do marketplace de GD. O **admin WeGen**
(tabela `wegen_admins`, link "Admin" no header) vê esses leads e revela o contato.

## Monetização

Modelo do v1: **CPL pré-pago** — o ofertante compra créditos e **paga só pelo
contato do lead que abrir** (nome, região e status são grátis; telefone/e-mail
custam créditos). Isso alinha o preço ao valor entregue e dá caixa antecipado.

- **Evento faturável:** desbloquear o contato de um lead (RPC `revelar_contato`).
  Débito transacional + idempotente (não recobra o mesmo lead) + registra no
  extrato e no funil. Admin revela **grátis** (oversight).
- **Preço por valor:** custo escalonado pelo valor da conta do lead —
  `least(40, greatest(5, ceil(conta/200)))` créditos (R$ 320 → 5, R$ 3.400 → 17).
  Espelhado no cliente em `custoLead()` e no banco em `custo_desbloqueio()`.
- **Contato protegido no servidor:** `SELECT` das colunas `telefone`/`email` foi
  **revogado** de anon/authenticated; só a RPC (SECURITY DEFINER, com checagem de
  dono + saldo) devolve o contato. Não dá para burlar via API direta.
- **Carteira:** `creditos_ofertante` (saldo) + `credito_transacoes` (extrato). A
  recarga (`recarregar_creditos`) é **MOCK de demonstração**.
- **Funil:** `eventos_funil` registra `ver_ofertas` → `solicitou_contato` →
  `contato_desbloqueado` (base para medir e precificar).

> ⚠️ **Pagamento real (próximo passo):** a `recarregar_creditos` atual é mock e
> **não deve** ir para produção como está. Substituir por uma função service-role
> acionada por **webhook do gateway** (Asaas / Iugu / Pagar.me — Pix + boleto +
> NF-e) após o pagamento confirmado. Nunca deixar o cliente creditar a si mesmo.

## CRM de leads

O painel do ofertante tem um **pipeline kanban** (aba Pipeline) com 4 estágios —
`novo → em contato → convertido | perdido`:

- **Arrastar** o card muda o estágio. `convertido` pede o **valor do contrato**;
  `perdido` pede o **motivo** (validado por trigger no banco).
- **Auto-move:** desbloquear o contato de um lead `novo` já o leva para
  `em contato` (o evento faturável é o sinal de engajamento).
- **Timeline por trigger:** toda mudança de estágio e cada nota entram em
  `lead_interacoes` — o card abre um detalhe com histórico, nota e o contato.
- **Confirmação de conversão pelo consumidor** (anti-fraude / base de comissão):
  ao marcar `convertido`, o banco gera um `confirmacao_token`; o ofertante envia
  o **link público** `?confirmar=<token>`; o consumidor abre (sem login) e
  responde "fechei / não fechei" (RPCs `info_confirmacao` + `confirmar_conversao`,
  anon, protegidas pelo token). Só após confirmar o `convertido` é confiável.
- **RLS:** o ofertante só faz `UPDATE` das **colunas de CRM** (`status`,
  `valor_contrato`, `motivo_perda`, `retorno_em`) das próprias leads; nunca de
  `nome`/`telefone`/`email`/`consent`. Admin gerencia os leads de Mercado Livre.

> As RPCs `info_confirmacao`/`confirmar_conversao` são `anon`-executáveis **por
> design** (o consumidor não tem login; o token é a credencial) — aparecem como
> WARN nos advisors, o que é esperado.

## Telas

Tudo é um SPA com roteamento por estado (sem React Router), espelhando o
protótipo. Trocar de tela acontece pelos botões do header e CTAs.

1. **Home** — hero + simulador de economia, como funciona, diferenciais, prova
   social, CTA final. (B2C — residência)
2. **Para minha empresa** — landing do **Mercado Livre de Energia** (B2B) com
   captura de lead; sem ofertas.
3. **Ofertas** — filtros + grade de cards de oferta, ordenação (economia /
   avaliação), favoritar e comparar (até 3).
3. **Comparação** — colunas lado a lado das ofertas selecionadas.
4. **Login do ofertante** — entra/cria conta; protege o painel e o editor.
5. **Painel do ofertante — Leads** — métricas + tabela de leads (do banco, via RLS).
6. **Editor de oferta** — nome, desconto, distribuidora, faixas, energia limpa,
   condições, ativar/pausar; **Salvar** grava a oferta no banco.

Mais: **barra de comparação** fixa (aparece na tela de ofertas) e **modal
"Solicitar contato"** com consentimento LGPD e tela de sucesso.

## Estrutura

```
src/
  App.jsx                  # estado central + auth + roteamento de telas
  main.jsx                 # bootstrap React
  index.css                # base (fontes, reset, slider, placeholder)
  assets/                  # wegen-logo.png + wegen-logo-light.png (logo oficial)
  data/                    # ofertas e leads fictícios (fallback sem backend)
  lib/
    format.js              # brl(), descPct(), ratingFmt(), dataFmt(), STATUS_LABEL
    supabase.js            # client (lê VITE_SUPABASE_* do .env.local)
  components/
    Header.jsx Footer.jsx Logo.jsx   # Logo = <img> do arquivo oficial
    OfferCard.jsx CompareBar.jsx ContactModal.jsx
    screens/
      Home.jsx Ofertas.jsx Comparar.jsx
      Login.jsx PainelLeads.jsx EditorOferta.jsx
```

## Observações

- Os valores de economia são **estimativas não vinculantes** (exigência do
  escopo/LGPD) — o aviso aparece no simulador e nos cards.
- Os cards de métrica do painel são **reais**: leads novos, ofertas ativas,
  conversão (com quantas foram confirmadas pelo consumidor), créditos investidos
  em desbloqueios e **valor fechado** (total + confirmado + retorno por crédito)
  — tudo calculado dos dados do próprio ofertante.
- **Consentimento LGPD (limitação do protótipo):** a inserção de leads é anônima
  (chave publishable), então o campo `consent` é enviado pelo cliente. Um chamador
  malicioso poderia forjar `consent=true` via REST direto. Produção precisa de
  **consentimento verificado** (OTP de e-mail/telefone) + **rate limiting/captcha**
  no endpoint de leads. Nos dados atuais não há PII real (leads fictícios).
- **lead → cliente (bloqueado por design):** converter um lead do marketplace
  num `cliente` da gestão de usinas **não é automático**. A tabela `clientes`
  exige `cnpj` e `email` (NOT NULL) — é um modelo **B2B**; leads B2C
  (residenciais) não têm CNPJ. A conversão é uma decisão de produto (tratar B2C
  vs B2B, coletar CNPJ do ofertante) e **não deve mutar as tabelas do sistema de
  usinas** sem esse desenho. Por isso não foi implementada.

## Próximos passos

- [x] Autenticação de ofertante + RLS por-ofertante nos `leads`.
- [x] Editor de oferta → grava/pausa em `ofertas`.
- [x] Filtros funcionais na tela de ofertas.
- [x] Outbox de notificação de novo lead (`lead_notificacoes` + trigger).
- [ ] **Enviar** a notificação de fato: Edge Function que consome
  `lead_notificacoes` (`status='pendente'`) e chama um provider de e-mail
  (ex.: Resend) ou WhatsApp. Precisa da escolha do provider + chave de API.
- [ ] **lead → cliente**: desenhar a conversão B2C/B2B (ver Observações) e ligar
  o marketplace à gestão de usinas.
- [ ] Gestão de ofertas do ofertante (listar/editar as próprias, não só criar).
- [ ] Desligar a confirmação de e-mail **ou** adicionar fluxo de confirmação para
  cadastro self-service de ofertantes.
