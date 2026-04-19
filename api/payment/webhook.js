// api/payment/webhook.js - Vercel Serverless Function
// Reçoit la confirmation asynchrone des opérateurs Mobile Money
// et met à jour le statut du dossier dans Supabase.

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;
  console.log('[BeninConnect Webhook] Received:', JSON.stringify(payload));

  try {
    // ----------------------------------------------------------------
    // ÉTAPE 1: Vérifier la signature du webhook (OBLIGATOIRE en prod)
    // ----------------------------------------------------------------
    // FedaPay — vérification de la signature:
    // const signature = req.headers['x-fedapay-signature'];
    // const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
    // const computedSig = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    // if (signature !== computedSig) {
    //   console.error('[Webhook] Invalid signature');
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    // ----------------------------------------------------------------
    // ÉTAPE 2: Extraire les données du paiement
    // ----------------------------------------------------------------
    const { transaction_id, dossier_id, status, amount } = payload;

    if (!dossier_id || !status) {
      return res.status(400).json({ error: 'dossier_id et status requis' });
    }

    // ----------------------------------------------------------------
    // ÉTAPE 3: Mettre à jour Supabase avec la clé Service Role (sécurisée)
    // ----------------------------------------------------------------
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables Supabase non configurées dans Vercel');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    if (status === 'success' || status === 'SUCCESSFUL') {
      // Mettre à jour le dossier → statut PAYÉ
      const { error: dossierError } = await supabase
        .from('dossiers')
        .update({ status_id: 'PAYÉ', updated_at: new Date().toISOString() })
        .eq('id', dossier_id);

      if (dossierError) throw dossierError;

      // Enregistrer le paiement confirmé
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'success' })
        .eq('gateway_ref', transaction_id);

      if (paymentError) console.warn('[Webhook] Payment update warning:', paymentError.message);

      console.log(`[Webhook] Dossier ${dossier_id} mis à jour → PAYÉ`);
    } else if (status === 'failed' || status === 'FAILED') {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('gateway_ref', transaction_id);

      console.log(`[Webhook] Paiement ${transaction_id} échoué`);
    }

    return res.status(200).json({ success: true, received: true });

  } catch (error) {
    console.error('[Webhook] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
