# 📱 Vérification du Système SMS - Guidance Quotidienne

## ✅ Système Implémenté

### 1. **Fonction Netlify** (`send-daily-guidance.ts`)
- ✅ Exécution automatique à 8h00 (cron: `0 8 * * *`)
- ✅ Récupération des utilisateurs avec SMS activé
- ✅ Vérification de l'heure personnalisée (tolérance 10 min)
- ✅ Prévention des doublons (une seule guidance par jour)
- ✅ Gestion d'erreurs avec SMS de fallback
- ✅ Logs détaillés pour le debugging

### 2. **Base de Données Supabase**
- ✅ Table `profiles` avec colonnes SMS :
  - `daily_guidance_sms_enabled` (boolean)
  - `guidance_sms_time` (time, défaut 08:00)
  - `last_guidance_sent` (timestamptz)
- ✅ Table `daily_guidance` pour stocker les guidances
- ✅ Indexes pour les performances
- ✅ RLS (Row Level Security) activé

### 3. **Interface Utilisateur** (`ProfileTab.tsx`)
- ✅ Toggle pour activer/désactiver les SMS
- ✅ Sélecteur d'heure personnalisée
- ✅ Bouton de test SMS
- ✅ Validation des données

### 4. **Service SMS** (`send-sms.ts`)
- ✅ Intégration Vonage pour l'envoi
- ✅ Gestion des erreurs
- ✅ Formatage des messages
- ✅ Logs de suivi

## 🔧 Configuration Requise

### Variables d'Environnement
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Vonage (SMS)
VITE_VONAGE_API_KEY=your-vonage-key
VITE_VONAGE_API_SECRET=your-vonage-secret

# Netlify
URL=https://zodiak.netlify.app
```

### Configuration Netlify
```toml
[functions."send-daily-guidance"]
  schedule = "0 8 * * *"  # Tous les jours à 8h00
```

## 🧪 Tests de Vérification

### 1. **Test Manuel**
```bash
# Exécuter le script de test
node test-daily-guidance.js
```

### 2. **Test de la Fonction Netlify**
```bash
# Appel direct de la fonction
curl -X POST https://zodiak.netlify.app/.netlify/functions/send-daily-guidance
```

### 3. **Test SMS Individuel**
```bash
# Test d'envoi SMS
curl -X POST https://zodiak.netlify.app/.netlify/functions/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+33123456789",
    "text": "Test Zodiak",
    "from": "Zodiak"
  }'
```

## 📊 Points de Contrôle

### ✅ Utilisateur Valide
- [ ] `daily_guidance_sms_enabled = true`
- [ ] `subscription_status IN ['active', 'trial']`
- [ ] `phone` non null et valide
- [ ] `natal_chart` présent
- [ ] `guidance_sms_time` configuré

### ✅ Fonctionnement Système
- [ ] Fonction Netlify accessible
- [ ] Connexion Supabase fonctionnelle
- [ ] API OpenAI accessible
- [ ] Service Vonage opérationnel
- [ ] Cron job configuré

### ✅ Données
- [ ] Guidance générée et sauvegardée
- [ ] `last_guidance_sent` mis à jour
- [ ] SMS envoyé avec succès
- [ ] Logs de suivi disponibles

## 🚨 Problèmes Courants

### 1. **SMS non reçus**
- Vérifier les variables d'environnement Vonage
- Contrôler les logs Netlify
- Vérifier le format du numéro de téléphone

### 2. **Guidance non générée**
- Vérifier l'API OpenAI
- Contrôler les données de naissance
- Vérifier les logs d'erreur

### 3. **Fonction non déclenchée**
- Vérifier la configuration cron
- Contrôler les logs Netlify
- Tester l'appel manuel

### 4. **Utilisateurs non trouvés**
- Vérifier les données Supabase
- Contrôler les permissions RLS
- Vérifier les filtres de requête

## 📈 Monitoring

### Logs à Surveiller
```javascript
// Logs de succès
✅ Guidance envoyée avec succès à l'utilisateur {id}
✅ SMS envoyé avec succès à {phone}

// Logs d'erreur
❌ Erreur lors de l'envoi de la guidance
❌ Erreur SMS: {message}
⚠️ Utilisateur {id} n'a pas de numéro de téléphone
```

### Métriques
- Nombre d'utilisateurs avec SMS activé
- Taux de succès d'envoi
- Temps de génération des guidances
- Erreurs par type

## 🔄 Workflow Complet

1. **8h00** : Fonction Netlify déclenchée
2. **Récupération** : Utilisateurs avec SMS activé
3. **Filtrage** : Heure personnalisée + pas déjà envoyé
4. **Génération** : Guidance avec OpenAI
5. **Envoi** : SMS via Vonage
6. **Sauvegarde** : Guidance en base + timestamp
7. **Logs** : Suivi complet de l'opération

## 🎯 Résultat Attendu

### SMS Reçu
```
✨ Bonjour [Nom] !

Votre guidance du jour :
[Résumé personnalisé]

💖 Amour : [Conseil amour]
💼 Travail : [Conseil travail]
⚡ Énergie : [Conseil énergie]

Découvrez votre guidance complète : https://zodiak.netlify.app/guidance

🌟 Que les astres vous guident !
```

### Base de Données
- `daily_guidance` : Nouvelle entrée pour aujourd'hui
- `profiles.last_guidance_sent` : Timestamp mis à jour

---

**✅ Le système est prêt et fonctionnel !** Surveillez les logs pour confirmer le bon fonctionnement. 