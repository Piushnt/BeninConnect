import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Check Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'BeninConnect National API is running' });
});

// API Payment Init (Placeholder for MTN MoMo/Moov/FedaPay)
// Le frontend appelle ce backend, ce backend gère les clés privées.
app.post('/api/payment/init', async (req, res) => {
    try {
        const { amount, phone, method, description } = req.body;
        
        // --- LOGIQUE MOBILE MONEY À INTÉGRER ICI ---
        // Exemple avec FedaPay / MTN MoMo
        // const response = await fetch('https://sandbox.fedapay.com/v1/transactions', {
        //   headers: { 'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}` }
        // });
        // --- FIN LOGIQUE ---

        // Simulation de paiement réussi
        const mockTransactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        res.json({ 
            success: true, 
            transactionId: mockTransactionId,
            message: "Paiement initié avec succès (Mode Simulation)"
        });

    } catch (error) {
        console.error("Payment error:", error);
        res.status(500).json({ success: false, error: "Payment processing failed" });
    }
});

// Webhook pour recevoir la confirmation asynchrone des opérateurs
app.post('/api/payment/webhook', async (req, res) => {
    const payload = req.body;
    // Vérifier la signature du webhook ici
    console.log("Webhook received:", payload);
    
    // Mettre à jour la base de données Supabase avec statut = PAID
    // en utilisant SUPABASE_SERVICE_ROLE_KEY
    
    res.json({ success: true, received: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 BeninConnect Secure Backend running on port ${PORT}`);
});
