// Configuration Telegram automatique
class TelegramNotifier {
    constructor() {
        this.botToken = '8382796514:AAFP03lQVDrh2EAdOpPpREYnaZT-VMEKSTU';
        this.chatId = this.getSavedChatId();
        this.enabled = true;
        this.initialized = false;
        
        // Initialiser automatiquement
        this.initialize();
    }

    // Récupérer le chatId sauvegardé
    getSavedChatId() {
        return localStorage.getItem('telegram_chat_id') || null;
    }

    // Sauvegarder le chatId
    saveChatId(chatId) {
        localStorage.setItem('telegram_chat_id', chatId);
        this.chatId = chatId;
        console.log('✅ ChatId sauvegardé:', chatId);
    }

    // Initialiser et vérifier la configuration
    async initialize() {
        // Vérifier si le token est configuré
        if (!this.botToken) {
            console.warn('⚠️ Token bot non configuré');
            this.enabled = false;
            return;
        }

        // Vérifier si le chatId est déjà configuré
        if (this.chatId) {
            console.log('✅ ChatId déjà configuré:', this.chatId);
            this.initialized = true;
            return;
        }

        // Essayer de récupérer le chatId automatiquement
        await this.tryAutoDiscoverChatId();
    }

    // Tenter de découvrir automatiquement le chatId
    async tryAutoDiscoverChatId() {
        console.log('🔄 Tentative de découverte automatique du chatId...');
        
        try {
            // Méthode 1: Récupérer les mises à jour du bot
            const updates = await this.getBotUpdates();
            if (updates && updates.result && updates.result.length > 0) {
                const lastUpdate = updates.result[updates.result.length - 1];
                const discoveredChatId = lastUpdate.message.chat.id;
                this.saveChatId(discoveredChatId);
                this.initialized = true;
                console.log('✅ ChatId découvert automatiquement:', discoveredChatId);
                return;
            }
        } catch (error) {
            console.log('❌ Impossible de découvrir le chatId automatiquement:', error);
        }

        // Si la découverte automatique échoue
        console.log('📝 En attente de configuration manuelle du chatId...');
    }

    // Récupérer les mises à jour du bot
    async getBotUpdates() {
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getUpdates`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur récupération updates:', error);
            return null;
        }
    }

    // Configurer manuellement le chatId
    setManualChatId(chatId) {
        if (chatId && chatId.toString().trim() !== '') {
            this.saveChatId(chatId.toString().trim());
            this.initialized = true;
            return true;
        }
        return false;
    }

    // Vérifier si le bot est opérationnel
    isReady() {
        return this.enabled && this.initialized && this.chatId;
    }

    // Tester la connexion
    async testConnection() {
        if (!this.botToken) {
            return { success: false, message: '❌ Token bot non configuré' };
        }

        try {
            // Tester d'abord la connexion au bot
            const botResponse = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
            const botResult = await botResponse.json();
            
            if (!botResult.ok) {
                return { success: false, message: '❌ Token bot invalide' };
            }

            // Si le chatId n'est pas configuré
            if (!this.isReady()) {
                return { 
                    success: false, 
                    message: '⚠️ Bot valide mais chatId non configuré',
                    botName: botResult.result.username
                };
            }

            // Tester l'envoi d'un message
            const testSent = await this.sendTestMessage();
            if (testSent) {
                return { 
                    success: true, 
                    message: '✅ Bot opérationnel - Message de test envoyé',
                    botName: botResult.result.username,
                    chatId: this.chatId
                };
            } else {
                return { 
                    success: false, 
                    message: '❌ Erreur envoi message - Vérifiez le chatId',
                    botName: botResult.result.username
                };
            }

        } catch (error) {
            return { success: false, message: '❌ Erreur de connexion: ' + error.message };
        }
    }

    // Envoyer un message de test
    async sendTestMessage() {
        if (!this.isReady()) return false;

        const message = '🔔 Test de notification - Votre bot Telegram est configuré avec succès!\n\n' +
                       'Vous recevrez désormais des alertes pour chaque nouvelle commande de traduction.';
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const result = await response.json();
            return result.ok;
        } catch (error) {
            console.error('Erreur envoi message test:', error);
            return false;
        }
    }

    // Formater le message de commande
    formatOrderMessage(orderData) {
        const documentsList = orderData.cart.map(item => 
            `├ ${item.name} × ${item.quantity} - ${(item.priceRub * item.quantity).toLocaleString('fr-FR')} RUB`
        ).join('\n');

        const totalItems = orderData.cart.reduce((sum, item) => sum + item.quantity, 0);

        // Construire l'URL pour le dashboard (utilisation de l'origine actuelle)
        const dashboardUrl = window.location.origin + '/receiptdevis';

        return `🚨 <b>NOUVELLE COMMANDE DE TRADUCTION</b> 🚨

<b>📋 Numéro:</b> <code>${orderData.orderNumber}</code>
<b>👤 Client:</b> ${orderData.clientName || 'Non renseigné'}
<b>📧 Email:</b> ${orderData.clientEmail || 'Non renseigné'}
<b>📞 Téléphone:</b> ${orderData.clientPhone || 'Non renseigné'}

<b>🌐 Traduction:</b> ${orderData.languageName}
<b>📊 Documents:</b> ${totalItems} document(s)
<b>💰 Total:</b> <b>${orderData.totalRub.toLocaleString('fr-FR')} RUB</b>

<b>📄 Détails:</b>
${documentsList}

<b>📝 Notes:</b> ${orderData.clientNotes || 'Aucune note'}

<b>⏰ Reçu le:</b> ${new Date(orderData.submissionDate).toLocaleString('fr-FR')}`;
    }

    // Envoyer une alerte de commande
    async sendOrderAlert(orderData) {
        if (!this.isReady()) {
            console.warn('❌ Bot Telegram non configuré - Alerte non envoyée');
            return false;
        }

        const message = this.formatOrderMessage(orderData);

        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const result = await response.json();
            
            if (result.ok) {
                console.log('✅ Alerte Telegram envoyée avec succès');
                return true;
            } else {
                console.error('❌ Erreur Telegram:', result.description);
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur envoi Telegram:', error);
            return false;
        }
    }

    // Envoyer une notification de confirmation
    async sendConfirmation(orderNumber, clientName = '') {
        if (!this.isReady()) return false;

        const message = `✅ <b>Commande confirmée</b>\n\nN°: <code>${orderNumber}</code>\nClient: ${clientName}\n📅 ${new Date().toLocaleString('fr-FR')}`;

        try {
            await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });
            return true;
        } catch (error) {
            console.error('Erreur confirmation Telegram:', error);
            return false;
        }
    }

    // Méthode pour vider la configuration (débogage)
    resetConfig() {
        localStorage.removeItem('telegram_chat_id');
        this.chatId = null;
        this.initialized = false;
        console.log('🔄 Configuration Telegram réinitialisée');
    }
}

// Instance globale
const telegramNotifier = new TelegramNotifier();