# Guide de Déploiement - Webhook Chariow

## 🔧 Étape 1: Installer Supabase CLI (si pas déjà fait)

```bash
npm install -g supabase
```

## 🔐 Étape 2: Se connecter à Supabase

```bash
npx supabase login
```

Cette commande ouvrira ton navigateur pour te connecter à ton compte Supabase.

## 🚀 Étape 3: Déployer la fonction

```bash
cd d:\Tafsir\ramadan-app
npx supabase functions deploy chariow-webhook --project-ref hdtqmwrzbgdtkkurwktx
```

## ✅ Étape 4: Vérifier le déploiement

Après le déploiement, l'URL de ton webhook sera:

```
https://hdtqmwrzbgdtkkurwktx.supabase.co/functions/v1/chariow-webhook
```

## 📝 Étape 5: Configurer Chariow

1. Va dans ton dashboard Chariow
2. Settings > Webhooks
3. Ajoute l'URL: `https://hdtqmwrzbgdtkkurwktx.supabase.co/functions/v1/chariow-webhook`
4. Sauvegarde

## 🧪 Étape 6: Tester le webhook

Tu peux tester avec curl:

```bash
curl -X POST https://hdtqmwrzbgdtkkurwktx.supabase.co/functions/v1/chariow-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "successful.sale",
    "sale": {"id": "TEST-123"},
    "customer": {"phone": "+221771234567", "name": "Test User", "email": "test@example.com"}
  }'
```

## ⚠️ Note importante

Quand tu changeras de domaine custom, l'URL du webhook restera la même car elle est hébergée sur Supabase, pas sur Vercel.
