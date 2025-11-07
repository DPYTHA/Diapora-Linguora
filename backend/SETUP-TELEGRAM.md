# Configuration des Alertes Telegram

## Étape 1: Créer un Bot Telegram

1. Ouvrez Telegram et cherchez `@BotFather`
2. Envoyez `/newbot`
3. Donnez un nom à votre bot
4. Donnez un username à votre bot (doit finir par "bot")
5. **Copiez le token** qui vous est donné

## Étape 2: Obtenir votre Chat ID

### Méthode Automatique (Recommandée):
1. Envoyez un message à votre nouveau bot
2. Le système détectera automatiquement votre Chat ID

### Méthode Manuelle:
1. Ouvrez Telegram et cherchez `@userinfobot`
2. Envoyez `/start`
3. **Copiez votre Chat ID** (numérique)

## Étape 3: Configuration

1. Remplacez `VOTRE_BOT_TOKEN_ICI` dans `telegram-config.js` par votre token
2. Ouvrez le dashboard admin (`receiptdevis.html`)
3. Vérifiez le status Telegram dans la sidebar
4. Si nécessaire, entrez manuellement votre Chat ID

## Étape 4: Test

1. Cliquez sur "Tester" dans le dashboard
2. Vous devriez recevoir un message de test sur Telegram
3. Les nouvelles commandes déclencheront des alertes automatiques

## Dépannage

- **Token invalide**: Vérifiez que vous avez copié le token entier
- **Chat ID incorrect**: Utilisez @userinfobot pour obtenir le bon ID
- **Aucune alerte**: Vérifiez que le bot n'est pas bloqué