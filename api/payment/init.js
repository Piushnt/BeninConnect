// api/payment/init.js - Vercel Serverless Function
// Ce backend sécurisé gère les clés API privées et initie le paiement Mobile Money
// Les clés sont injectées via les variables d'environnement Vercel (Paramètres > Variables d'environnement)

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, phone, method, description, dossier_id } = req.body;

  if (!amount || !phone || !method) {
    return res.status(400).json({ success: false, error: 'Paramètres manquants: amount, phone, method requis' });
  }

  try {
    // ----------------------------------------------------------------
    //  FedaPay Integration (Décommentez et complétez en production)
    // ----------------------------------------------------------------
    // const fedapayKey = process.env.FEDAPAY_SECRET_KEY;
    // if (!fedapayKey) throw new Error('FEDAPAY_SECRET_KEY non configurée');
    //
    // const response = await fetch('https://sandbox.fedapay.com/v1/transactions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${fedapayKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     description: description || 'Paiement BeninConnect',
    //     amount,
    //     currency: { iso: 'XOF' },
    //     callback_url: `${process.env.APP_URL}/api/payment/webhook`,
    //     customer: { phone_number: { number: phone, country: 'bj' } }
    //   })
    // });
    // const data = await response.json();
    // return res.status(200).json({ success: true, transactionId: data.v1Transaction.id, ...data });

    // ----------------------------------------------------------------
    //  MTN MoMo Integration (Décommentez et complétez en production)
    // ----------------------------------------------------------------
    // if (method === 'mtn_momo') {
    //   const momoKey = process.env.MTN_MOMO_API_KEY;
    //   if (!momoKey) throw new Error('MTN_MOMO_API_KEY non configurée');
    //   // Logique MTN MoMo ici
    // }

    // ----------------------------------------------------------------
    //  Mode Simulation (Démo Vercel - À remplacer par l'intégration réelle)
    // ----------------------------------------------------------------
    console.log(`[BeninConnect API] Payment init: method=${method}, amount=${amount} XOF, phone=${phone}, dossier=${dossier_id}`);

    const mockTransactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

    // Simulation d'une latence réseau réaliste
    await new Promise(resolve => setTimeout(resolve, 500));

    return res.status(200).json({
      success: true,
      transactionId: mockTransactionId,
      amount,
      currency: 'XOF',
      method,
      message: `Paiement de ${amount} XOF initié via ${method} (Mode Simulation Vercel)`,
      instructions: method === 'mtn_momo'
        ? `Composez *880# et suivez les instructions, Réf: ${mockTransactionId}`
        : `Composez *155# et suivez les instructions, Réf: ${mockTransactionId}`,
      simulation: true // À supprimer en production
    });

  } catch (error) {
    console.error('[BeninConnect API] Payment error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'initiation du paiement',
      details: error.message
    });
  }
}
