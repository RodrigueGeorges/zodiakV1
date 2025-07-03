import { ApiError } from '../errors';
import type { NatalChart } from '../astrology';

interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

class OpenAIService {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly CACHE = new Map<string, { data: unknown; timestamp: number }>();
  private static readonly config: OpenAIConfig = {
    apiKey: process.env.VITE_OPENAI_API_KEY as string,
    model: 'gpt-4',
    maxTokens: 1000
  };

  private static readonly DEFAULT_GUIDANCE = {
    summary: "Les aspects planétaires du jour vous invitent à l'action réfléchie. Restez à l'écoute de votre intuition tout en avançant avec détermination vers vos objectifs.",
    love: "Vénus forme des aspects harmonieux qui favorisent les échanges authentiques. C'est le moment d'exprimer vos sentiments avec sincérité et d'ouvrir votre coeur à de nouvelles connexions.",
    work: "Mercure soutient vos projets professionnels. Votre clarté d'esprit est un atout majeur aujourd'hui. Profitez de cette énergie pour communiquer vos idées et prendre des initiatives constructives.",
    energy: "L'alignement des planètes vous apporte une belle vitalité. C'est une excellente journée pour démarrer de nouvelles activités physiques ou pour vous consacrer à des projets qui vous passionnent et rechargent vos batteries."
  };

  private static getFromCache<T>(key: string): T | null {
    const cached = this.CACHE.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    this.CACHE.delete(key);
    return null;
  }

  private static setInCache<T>(key: string, data: T): void {
    this.CACHE.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private static async callOpenAI(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      console.warn('OpenAI API key not found, using default guidance');
      return JSON.stringify(this.DEFAULT_GUIDANCE);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'Tu es un astrologue professionnel qui fournit des conseils précis et personnalisés basés sur les positions planétaires.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new ApiError('Erreur lors de l\'appel à OpenAI', response.status);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error instanceof ApiError ? error : new ApiError('Erreur lors de la génération de la guidance', 500);
    }
  }

  static async generateGuidance(natalChart: NatalChart, transits: Record<string, unknown>) {
    try {
      // Check cache first
      const cacheKey = `guidance_${JSON.stringify(natalChart)}_${JSON.stringify(transits)}`;
      const cached = this.getFromCache<typeof this.DEFAULT_GUIDANCE>(cacheKey);
      if (cached) return cached;

      const prompt = this.buildPrompt(natalChart, transits);
      const response = await this.callOpenAI(prompt);
      
      try {
        const guidance = JSON.parse(response);
        this.setInCache(cacheKey, guidance);
        return guidance;
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        return this.DEFAULT_GUIDANCE;
      }
    } catch (error) {
      console.error('Error generating guidance:', error);
      return this.DEFAULT_GUIDANCE;
    }
  }

  private static buildPrompt(natalChart: NatalChart, transits: Record<string, unknown>): string {
    return `
      Analyse les positions planétaires suivantes et génère une guidance quotidienne au format JSON.
      - summary: un résumé général de 2-3 phrases de l'énergie du jour.
      - love: un paragraphe de 3-4 phrases sur les opportunités et défis dans la vie amoureuse.
      - work: un paragraphe de 3-4 phrases sur les dynamiques professionnelles et financières.
      - energy: un paragraphe de 3-4 phrases sur la vitalité, le bien-être et les activités conseillées.
      
      IMPORTANT: Dans chaque champ, mets les mots-clés les plus importants entre astérisques. Par exemple: "Aujourd'hui, la *communication* sera essentielle. Faites preuve de *prudence*."
      Le ton doit être encourageant, clair et personnalisé pour la personne recevant la guidance.

      Thème natal:
      ${JSON.stringify(natalChart, null, 2)}

      Transits du jour:
      ${JSON.stringify(transits, null, 2)}

      Format de réponse attendu (uniquement du JSON valide):
      {
        "summary": "résumé général...",
        "love": "conseils amour...",
        "work": "conseils travail...",
        "energy": "conseils énergie..."
      }
    `;
  }

  private static buildNatalChartInterpretationPrompt(natalChart: NatalChart): string {
    return `
      Tu es un astrologue expérimenté et bienveillant. En te basant sur le thème natal suivant, rédige une interprétation astrologique complète, riche et personnalisée en plusieurs paragraphes. Adresse-toi directement à la personne.

      Le texte doit être structuré, facile à lire et couvrir les points suivants :
      1.  **Introduction** : Une brève présentation de la "signature astrale" (Soleil, Lune, Ascendant) et ce qu'elle révèle de la personnalité centrale.
      2.  **Forces et Talents** : Analyse des positions planétaires (notamment le Soleil, Mercure, Vénus, Mars) pour mettre en lumière les forces, les talents naturels et les domaines où la personne peut briller.
      3.  **Défis et Axes de Croissance** : Identification des aspects plus complexes ou des positions (comme Saturne ou les nœuds lunaires) qui représentent des défis à surmonter ou des leçons de vie importantes pour son développement personnel.
      4.  **Conclusion** : Un paragraphe de conclusion encourageant qui résume le potentiel global du thème et donne un conseil pour naviguer la vie en harmonie avec sa nature astrale.

      Utilise un ton chaleureux, inspirant et positif, même en abordant les défis. L'objectif est de fournir un aperçu puissant et utile qui aide la personne à mieux se comprendre.

      Voici les données du thème natal :
      ${JSON.stringify(natalChart, null, 2)}

      Rédige uniquement l'interprétation textuelle, sans aucun autre formatage.
    `;
  }

  private static buildNatalSummaryPrompt(natalChart: NatalChart, firstName: string): string {
    return `
      Tu es un astrologue professionnel. En te basant sur le thème natal suivant, génère un résumé astrologique court et personnalisé (2-3 phrases maximum) qui capture l'essence de la personnalité de ${firstName}.

      Le résumé doit :
      - Être adressé directement à ${firstName}
      - Mentionner les 3 éléments clés : Soleil, Lune, Ascendant
      - Être inspirant et positif
      - Utiliser un ton chaleureux et accessible
      - Ne pas dépasser 3 phrases
      - Être en français

      Voici les données du thème natal :
      ${JSON.stringify(natalChart, null, 2)}

      Rédige uniquement le résumé, sans formatage supplémentaire.
    `;
  }

  static async generateNatalChartInterpretation(natalChart: NatalChart): Promise<string> {
    if (!natalChart) {
      throw new ApiError('Les données du thème natal sont requises.', 400);
    }

    try {
      const cacheKey = `interpretation_${JSON.stringify(natalChart)}`;
      const cached = this.getFromCache<string>(cacheKey);
      if (cached) {
        console.log('Returning cached interpretation');
        return cached;
      }
      
      console.log('Generating new interpretation');
      const prompt = this.buildNatalChartInterpretationPrompt(natalChart);
      const interpretation = await this.callOpenAI(prompt);
      
      this.setInCache(cacheKey, interpretation);
      return interpretation;

    } catch (error) {
      console.error('Erreur lors de la génération de l\'interprétation du thème natal:', error);
      throw error instanceof ApiError ? error : new ApiError('Erreur interne du serveur', 500);
    }
  }

  static async generateNatalSummary(natalChart: NatalChart, firstName: string): Promise<string> {
    if (!natalChart) {
      throw new ApiError('Les données du thème natal sont requises.', 400);
    }

    try {
      const cacheKey = `summary_${firstName}_${JSON.stringify(natalChart)}`;
      const cached = this.getFromCache<string>(cacheKey);
      if (cached) {
        console.log('Returning cached summary');
        return cached;
      }
      
      console.log('Generating new summary');
      const prompt = this.buildNatalSummaryPrompt(natalChart, firstName);
      const summary = await this.callOpenAI(prompt);
      
      this.setInCache(cacheKey, summary);
      return summary;

    } catch (error) {
      console.error('Erreur lors de la génération du résumé astrologique:', error);
      throw error instanceof ApiError ? error : new ApiError('Erreur interne du serveur', 500);
    }
  }
}

export default OpenAIService;