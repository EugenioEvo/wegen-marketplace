// Edge Function: consome a fila lead_notificacoes (status='pendente') e, por lead:
//  1) avisa o OFERTANTE ("novo lead") — sem expor o contato do consumidor (pago);
//  2) confirma ao CONSUMIDOR ("recebemos sua solicitação") — melhor esforço.
// Idempotente: marca cada linha como 'enviada' ou 'falha' (constraint da tabela).
// Secrets: RESEND_API_KEY (dashboard); SUPABASE_URL/SERVICE_ROLE vêm do runtime.
// Agendada por pg_cron ('wegen-notificar-leads', a cada minuto, via pg_net).
import { createClient } from 'npm:@supabase/supabase-js@2'

const APP_URL = 'https://wegen-marketplace.vercel.app'
const FROM = 'WeGen <onboarding@resend.dev>' // trocar após verificar domínio no Resend

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return json({ error: 'RESEND_API_KEY ausente' }, 500)

  const { data: fila, error } = await supabase
    .from('lead_notificacoes')
    .select('id, lead_id, ofertante_id')
    .eq('status', 'pendente')
    .limit(20)
  if (error) return json({ error: error.message }, 500)
  if (!fila?.length) return json({ enviados: 0 })

  let enviados = 0
  const detalhes: string[] = []
  for (const n of fila) {
    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('nome, email, dist, uf, conta, oferta_id, origem')
        .eq('id', n.lead_id)
        .single()
      if (!lead?.oferta_id) {
        detalhes.push(await marcar(supabase, n.id, 'falha'))
        continue
      }
      const { data: oferta } = await supabase
        .from('ofertas')
        .select('name, owner_id')
        .eq('id', lead.oferta_id)
        .single()
      const { data: owner, error: oerr } = await supabase.auth.admin.getUserById(
        n.ofertante_id ?? oferta!.owner_id,
      )
      if (oerr) throw new Error('admin.getUserById: ' + oerr.message)
      const email = owner?.user?.email
      if (!email) {
        detalhes.push('sem-email; ' + (await marcar(supabase, n.id, 'falha')))
        continue
      }

      const conta = lead.conta != null ? `R$ ${Number(lead.conta).toLocaleString('pt-BR')}` : '—'
      const res = await enviar(resendKey, {
        from: FROM,
        to: [email],
        subject: `⚡ Novo lead na oferta ${oferta!.name}`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto">
            <h2 style="color:#264A03">Você recebeu um novo lead na WeGen</h2>
            <p>Um consumidor pediu contato na sua oferta <strong>${oferta!.name}</strong>.</p>
            <table style="border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:4px 12px 4px 0;color:#64748B">Região</td><td><strong>${lead.dist ?? '—'} · ${lead.uf ?? ''}</strong></td></tr>
              <tr><td style="padding:4px 12px 4px 0;color:#64748B">Conta média</td><td><strong>${conta}/mês</strong></td></tr>
            </table>
            <p>O nome e o contato ficam disponíveis no seu painel — o desbloqueio usa seus créditos.</p>
            <a href="${APP_URL}" style="display:inline-block;background:#264A03;color:#fff;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:600">Abrir meu painel</a>
            <p style="color:#94A2B5;font-size:12px;margin-top:24px">WeGen · Grupo Evolight — marketplace de energia.</p>
          </div>`,
      })
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`)

      // Confirmação ao consumidor — não derruba a notificação se falhar
      if (lead.email) {
        await enviar(resendKey, {
          from: FROM,
          to: [lead.email],
          subject: `✓ Recebemos sua solicitação — ${oferta!.name}`,
          html: `
            <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto">
              <h2 style="color:#264A03">Solicitação recebida${lead.nome ? ', ' + lead.nome.split(' ')[0] : ''}!</h2>
              <p>Encaminhamos seu pedido ao ofertante <strong>${oferta!.name}</strong>. Ele entra em contato com você <strong>em até 24h</strong> pelo telefone ou e-mail informados.</p>
              <p style="margin-top:12px">Enquanto isso, você pode comparar outras ofertas no marketplace.</p>
              <a href="${APP_URL}" style="display:inline-block;background:#15B86A;color:#fff;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:600;margin-top:8px">Ver mais ofertas</a>
              <p style="color:#94A2B5;font-size:12px;margin-top:24px">WeGen · Grupo Evolight — você recebeu este e-mail porque pediu contato em uma oferta. A economia apresentada é estimativa não vinculante.</p>
            </div>`,
        }).catch(() => {})
      }

      detalhes.push('ok; ' + (await marcar(supabase, n.id, 'enviada')))
      enviados++
    } catch (e) {
      detalhes.push(String(e).slice(0, 220) + '; ' + (await marcar(supabase, n.id, 'falha')))
    }
  }
  return json({ enviados, processados: fila.length, detalhes })
})

function enviar(key: string, payload: unknown) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

async function marcar(supabase: ReturnType<typeof createClient>, id: string, status: string) {
  const { error } = await supabase
    .from('lead_notificacoes')
    .update({ status, sent_at: new Date().toISOString() })
    .eq('id', id)
  return error ? 'marcar-falhou: ' + error.message : 'marcado:' + status
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
