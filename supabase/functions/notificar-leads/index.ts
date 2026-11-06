// Edge Function: consome a fila lead_notificacoes (status='pendente') e envia
// o e-mail "novo lead" ao ofertante via Resend. Idempotente: marca cada linha
// como 'enviada' ou 'erro'. Sem parâmetros de entrada — segura para agendar.
// Secrets necessários: RESEND_API_KEY (dashboard). SUPABASE_URL e
// SUPABASE_SERVICE_ROLE_KEY são injetados pelo runtime.
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
  for (const n of fila) {
    try {
      // lead (sem telefone/e-mail do consumidor — o contato é pago) + dono da oferta
      const { data: lead } = await supabase
        .from('leads')
        .select('dist, uf, conta, oferta_id, origem')
        .eq('id', n.lead_id)
        .single()
      if (!lead?.oferta_id) {
        await marcar(supabase, n.id, 'ignorada')
        continue
      }
      const { data: oferta } = await supabase
        .from('ofertas')
        .select('name, owner_id')
        .eq('id', lead.oferta_id)
        .single()
      const { data: owner } = await supabase.auth.admin.getUserById(n.ofertante_id ?? oferta!.owner_id)
      const email = owner?.user?.email
      if (!email) {
        await marcar(supabase, n.id, 'erro')
        continue
      }

      const conta = lead.conta != null ? `R$ ${Number(lead.conta).toLocaleString('pt-BR')}` : '—'
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        }),
      })
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
      await marcar(supabase, n.id, 'enviada')
      enviados++
    } catch (_e) {
      await marcar(supabase, n.id, 'erro')
    }
  }
  return json({ enviados, processados: fila.length })
})

async function marcar(supabase: ReturnType<typeof createClient>, id: string, status: string) {
  await supabase.from('lead_notificacoes').update({ status, sent_at: new Date().toISOString() }).eq('id', id)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
