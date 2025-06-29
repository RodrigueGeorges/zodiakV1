# 🔍 Vérification de la Guidance de Rodrigue Etifier

## Méthode 1 : Via l'Interface d'Administration (Recommandée)

### 1. Accéder à l'Admin
- Ouvrez votre application Zodiak dans le navigateur
- Allez sur l'URL : `https://votre-app.netlify.app/admin`
- Ou naviguez vers la page Admin depuis l'application

### 2. Rechercher Rodrigue
- Utilisez la barre de recherche en haut de la page
- Tapez "Rodrigue" ou "Etifier"
- L'interface affichera automatiquement son profil

### 3. Vérifier les Informations
Dans le profil de Rodrigue, vérifiez :

#### ✅ Informations de Base
- **Nom** : Doit afficher "Rodrigue" ou "Rodrigue Etifier"
- **Téléphone** : Doit être renseigné (format +33...)
- **Statut** : Doit être "Période d'essai" ou "Abonné" (pas "Expiré")

#### ✅ Configuration SMS
- **Dernière guidance** : Affiche la date de la dernière guidance envoyée
- Si affiche "Jamais" → Problème : Aucune guidance n'a été envoyée
- Si affiche une date → Vérifier si c'est aujourd'hui

#### ✅ Actions Possibles
- Vous pouvez changer son statut d'abonnement si nécessaire
- Vous pouvez voir quand il s'est inscrit

## Méthode 2 : Via l'Interface Supabase

### 1. Accéder à Supabase
- Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Connectez-vous à votre compte
- Sélectionnez votre projet Zodiak

### 2. Vérifier le Profil de Rodrigue
- Dans le menu de gauche, cliquez sur **"Table Editor"**
- Sélectionnez la table **"profiles"**
- Recherchez l'utilisateur nommé "Rodrigue" ou "Rodrigue Etifier"
- Vérifiez les informations suivantes :
  - ✅ **Téléphone** : Doit être renseigné
  - ✅ **SMS activé** : `daily_guidance_sms_enabled` doit être `true`
  - ✅ **Statut** : `subscription_status` doit être `active` ou `trial`
  - ✅ **Thème natal** : `natal_chart` doit être présent
  - ✅ **Dernière guidance** : `last_guidance_sent` doit être récent

### 3. Vérifier les Guidances Quotidiennes
- Dans **"Table Editor"**, sélectionnez la table **"daily_guidance"**
- Recherchez les entrées avec l'ID utilisateur de Rodrigue
- Vérifiez s'il y a une guidance pour aujourd'hui (date du jour)
- Si oui, vérifiez le contenu :
  - **Résumé** : Texte principal de la guidance
  - **Amour** : Section amour/relations
  - **Travail** : Section carrière/travail
  - **Énergie** : Section énergie/bien-être

## Méthode 3 : Test Manuel

### 1. Envoyer un SMS de Test
- Dans l'interface d'administration, trouvez Rodrigue
- Utilisez la fonction "Test SMS" si disponible
- Ou contactez-le directement pour vérifier

### 2. Vérifier la Configuration
- Assurez-vous que l'heure de guidance est correcte (8h00 par défaut)
- Vérifiez que le fuseau horaire est bien configuré

## Problèmes Courants et Solutions

### ❌ Pas de Numéro de Téléphone
- **Symptôme** : Le champ téléphone est vide dans l'admin
- **Solution** : Contacter Rodrigue pour qu'il ajoute son numéro dans son profil

### ❌ SMS Non Activé
- **Symptôme** : `daily_guidance_sms_enabled` est `false` dans Supabase
- **Solution** : Lui demander d'activer les SMS quotidiens dans son profil

### ❌ Pas de Thème Natal
- **Symptôme** : `natal_chart` est vide ou null
- **Solution** : Lui demander de compléter son profil astrologique

### ❌ Abonnement Expiré
- **Symptôme** : Statut affiche "Expiré" dans l'admin
- **Solution** : Vérifier son abonnement ou le remettre en "Période d'essai"

### ❌ Pas de Guidance Aujourd'hui
- **Symptôme** : "Dernière guidance" affiche "Jamais" ou une ancienne date
- **Solutions possibles** :
  - Le système de guidance quotidienne n'a pas fonctionné
  - Vérifier les logs de la fonction Netlify `send-daily-guidance`
  - Tester manuellement l'envoi d'une guidance

## Vérification des Logs

### Logs Netlify
- Allez sur [https://app.netlify.com](https://app.netlify.com)
- Sélectionnez votre site Zodiak
- Allez dans **"Functions"** > **"send-daily-guidance"**
- Vérifiez les logs d'exécution pour voir s'il y a des erreurs

### Logs Supabase
- Dans Supabase, allez dans **"Logs"**
- Vérifiez les requêtes récentes sur les tables `profiles` et `daily_guidance`

## Contact Direct

Si vous ne pouvez pas vérifier via ces méthodes, contactez directement Rodrigue pour lui demander :
1. S'il a reçu un SMS de guidance aujourd'hui
2. À quelle heure il l'a reçu
3. Quel était le contenu du message

## Actions Immédiates

### Si Rodrigue n'a pas reçu sa guidance :
1. **Vérifier son profil** dans l'interface admin
2. **Tester l'envoi manuel** d'une guidance
3. **Vérifier les logs** Netlify pour identifier le problème
4. **Contacter Rodrigue** pour confirmer la réception

### Si le système ne fonctionne pas :
1. **Vérifier les variables d'environnement** dans Netlify
2. **Tester la fonction** `send-daily-guidance` manuellement
3. **Vérifier les quotas** SMS et API

---

**Note** : Le système de guidance quotidienne est programmé pour s'exécuter à 8h00 du matin chaque jour. Si Rodrigue n'a pas reçu sa guidance, il est possible que le système ait rencontré un problème lors de l'exécution automatique. 