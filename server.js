const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'splash.html'));
});

app.get('/Trad_commande', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Trad_commande.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

app.get('/receiptdevis', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'receiptdevis.html'));
});

// API pour les données (optionnel - pour persistance)
let orders = [];

app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const order = req.body;
    order.id = Date.now().toString();
    order.createdAt = new Date().toISOString();
    orders.push(order);
    res.json({ success: true, order });
});

// Route de santé pour Railway
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Diaspora Linguora Translation Service'
    });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📧 Application Diaspora Linguora en ligne`);
    console.log(`🌐 Accédez à: http://localhost:${PORT}`);
});