import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { AstrologyService, NatalChart } from '../../src/lib/astrology';
import type { Database, Profile } from '../../src/lib/types/supabase';
import { toZonedTime, format } from 'date-fns-tz';

// Initialiser le client Supabase
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const TIMEZONE = 'Europe/Paris'; // Fuseau horaire par défaut

// --- Duplication de la logique des services pour l'environnement serveur ---

// Logique OpenAI
async function generateGuidanceForSms(natalChart: NatalChart, transits: any): Promise<any> {
  const prompt = `
Tu es un astrologue expert, bienveillant et moderne, qui rédige des guidances quotidiennes pour une application innovante de guidance astrologique personnalisée.

Ta mission :
- Génère une guidance du jour inspirante, actionable, innovante et personnalisée, basée sur le thème natal (fourni) et les transits planétaires du jour (fournis).
- Utilise un ton positif, motivant, accessible à tous, sans jargon technique.
- Sois créatif et INNOVANT : propose chaque jour une guidance originale, évite toute répétition ou formulation déjà utilisée précédemment.
- Structure la réponse en 4 parties :
  1. Résumé général (2 phrases max, synthétique et engageant)
  2. Amour : conseil concret et bienveillant (2-3 phrases, score sur 100)
  3. Travail : conseil pratique et motivant (2-3 phrases, score sur 100)
  4. Bien-être/Énergie : conseil pour l'équilibre personnel (2-3 phrases, score sur 100)
- Termine par un mantra du jour ou une inspiration courte, adaptée à l'énergie du jour.
- Sois créatif, mais toujours pertinent et encourageant.

Format de réponse JSON attendu :
{
  "summary": "Résumé général du jour, positif et engageant.",
  "love": { "text": "Conseil amour personnalisé.", "score": 0-100 },
  "work": { "text": "Conseil travail personnalisé.", "score": 0-100 },
  "energy": { "text": "Conseil bien-être personnalisé.", "score": 0-100 },
  "mantra": "Mantra ou inspiration du jour."
}

Données à utiliser :
- Thème natal : ${JSON.stringify(natalChart, null, 2)}
- Transits du jour : ${JSON.stringify(transits, null, 2)}

Exemple de ton attendu :
- "Aujourd'hui, une belle énergie de renouveau t'invite à oser de nouvelles choses. Profite de cette dynamique pour avancer sereinement."
- "Côté amour, exprime tes sentiments avec authenticité…"
- "Au travail, une opportunité pourrait se présenter si tu restes ouvert…"
- "Prends soin de ton énergie en t'accordant un moment de pause…"
- "Mantra : 'Je m'ouvre aux belles surprises de l'univers.'"

Génère la guidance du jour selon ce format et ce ton.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'system', content: 'Tu es un astrologue expert.' }, { role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur OpenAI: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Logique SMS (utiliser Vonage au lieu de Brevo pour la cohérence)
async function sendSms(phoneNumber: string, content: string): Promise<void> {
  // Utiliser la fonction send-sms existante
  const response = await fetch(`${process.env.URL || 'https://zodiak.netlify.app'}/.netlify/functions/send-sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: phoneNumber,
      text: content,
      from: 'Zodiak'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Erreur SMS: ${errorData.error || 'Envoi SMS échoué'}`);
  }

  console.log(`SMS envoyé avec succès à ${phoneNumber}`);
}

// --- Logique principale de la fonction ---

const sendGuidanceSms = async (profile: Profile & { _guidanceDate?: string }) => {
  if (!profile.phone || !profile.natal_chart) {
    console.warn(`Profil incomplet pour l'utilisateur ${profile.id}.`);
    return;
  }
  
  try {
    console.log(`🚀 Génération de guidance pour l'utilisateur ${profile.id}...`);
    
    // 1. Calculer les transits du jour
    const today = profile._guidanceDate || format(toZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd', { timeZone: TIMEZONE });
    const transits = await AstrologyService.calculateDailyTransits(today);

    // 2. Générer la guidance personnalisée
    const guidance = await generateGuidanceForSms(profile.natal_chart as any, transits);
    
    // 3. Formatter un message SMS plus détaillé
    const appUrl = process.env.URL || 'https://zodiak.netlify.app';
    const smsContent = `✨ Bonjour ${profile.name || 'cher utilisateur'} !

Votre guidance du jour :
${guidance.summary}

💖 Amour : ${guidance.love.text}
💼 Travail : ${guidance.work.text}
⚡ Énergie : ${guidance.energy.text}

Découvrez votre guidance complète : ${appUrl}/guidance

🌟 Que les astres vous guident !`;

    // 4. Envoyer le SMS
    await sendSms(profile.phone, smsContent);

    // 5. Sauvegarder la guidance dans la base de données pour la page web
    await supabase
      .from('daily_guidance')
      .upsert({
        user_id: profile.id,
        date: today,
        summary: guidance.summary,
        love: guidance.love,
        work: guidance.work,
        energy: guidance.energy,
      });

    // 6. Mettre à jour la date de dernière guidance envoyée
    await supabase
      .from('profiles')
      .update({ 
        last_guidance_sent: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);

    console.log(`✅ Guidance envoyée avec succès à l'utilisateur ${profile.id}`);

  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de la guidance à ${profile.id}:`, error);
    
    // Envoyer un SMS d'erreur simple si la génération échoue
    try {
      const fallbackMessage = `✨ Bonjour ${profile.name || 'cher utilisateur'} !

Votre guidance quotidienne est prête sur l'application Zodiak.

Découvrez vos conseils personnalisés : ${process.env.URL || 'https://zodiak.netlify.app'}/guidance

🌟 Que les astres vous guident !`;
      
      await sendSms(profile.phone, fallbackMessage);
      
      // Mettre à jour quand même la date d'envoi
      await supabase
        .from('profiles')
        .update({ 
          last_guidance_sent: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
        
      console.log(`✅ SMS de fallback envoyé à l'utilisateur ${profile.id}`);
    } catch (fallbackError) {
      console.error(`❌ Erreur même pour le SMS de fallback à ${profile.id}:`, fallbackError);
    }
  }
};

const handler: Handler = async () => {
  try {
    console.log('🕐 Début de la vérification des guidances quotidiennes...');
    
    // Récupérer tous les utilisateurs avec SMS activé et abonnement valide
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('daily_guidance_sms_enabled', true)
      .in('subscription_status', ['active', 'trial']);

    if (error) {
      console.error("❌ Erreur lors de la récupération des profils:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    if (!profiles || profiles.length === 0) {
      console.log("ℹ️ Aucun utilisateur à notifier.");
      return { statusCode: 200, body: JSON.stringify({ message: "Aucun utilisateur à notifier." }) };
    }
    
    console.log(`📊 Trouvé ${profiles.length} utilisateurs avec SMS activé.`);

    // Heure et date locale Europe/Paris
    const nowUtc = new Date();
    const nowParis = toZonedTime(nowUtc, TIMEZONE);
    const currentHourParis = nowParis.getHours();
    const currentMinuteParis = nowParis.getMinutes();
    const todayParis = format(nowParis, 'yyyy-MM-dd', { timeZone: TIMEZONE });
    console.log(`🕗 Heure locale Paris: ${format(nowParis, 'yyyy-MM-dd HH:mm', { timeZone: TIMEZONE })}`);

    let sentCount = 0;
    let skippedCount = 0;

    for (const profile of profiles) {
      try {
        // Vérifier si l'utilisateur a un numéro de téléphone
        if (!profile.phone) {
          console.log(`⚠️ Utilisateur ${profile.id} n'a pas de numéro de téléphone`);
          continue;
        }

        // Vérifier si l'utilisateur a un thème natal
        if (!profile.natal_chart) {
          console.log(`⚠️ Utilisateur ${profile.id} n'a pas de thème natal`);
          continue;
        }

        // Date du jour (Europe/Paris)
        const todayParis = format(toZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd', { timeZone: TIMEZONE });

        // Vérifier si la guidance du jour existe déjà
        const { data: existingGuidance, error: guidanceError } = await supabase
          .from('daily_guidance')
          .select('*')
          .eq('user_id', profile.id)
          .eq('date', todayParis)
          .maybeSingle();

        if (!existingGuidance) {
          // Générer la guidance et l'envoyer par SMS
          console.log(`🚀 Génération et envoi de la guidance pour ${profile.id} (${profile.name})`);
          await sendGuidanceSms({ ...profile, _guidanceDate: todayParis });
          sentCount++;
        } else {
          console.log(`⏭️ Guidance déjà existante pour aujourd'hui pour l'utilisateur ${profile.id}`);
          skippedCount++;
        }
      } catch (profileError) {
        console.error(`❌ Erreur lors du traitement de l'utilisateur ${profile.id}:`, profileError);
      }
    }

    console.log(`✅ Vérification terminée. ${sentCount} SMS envoyés, ${skippedCount} ignorés.`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Vérification des guidances terminée.',
        sent: sentCount,
        skipped: skippedCount,
        total: profiles.length
      }),
    };
  } catch (error) {
    console.error('❌ Erreur générale dans le handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        message: 'Erreur lors de la vérification des guidances'
      }),
    };
  }
};

export { handler }; 