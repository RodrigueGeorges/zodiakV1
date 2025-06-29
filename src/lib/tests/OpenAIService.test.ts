import { OpenAIService } from '../services/OpenAIService';
import { NatalChart } from '../astrology';

describe('OpenAIService', () => {
  const mockNatalChart: NatalChart = {
    planets: [
      { name: 'Soleil', longitude: 120, house: 1, sign: 'Lion', retrograde: false }
    ],
    houses: [
      { number: 1, sign: 'Lion', degree: 15 }
    ],
    ascendant: { sign: 'Lion', degree: 15 }
  };

  const mockTransits = {
    date: '2024-02-26',
    planets: [
      { name: 'Soleil', sign: 'Bélier', degree: 15 }
    ]
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should generate guidance successfully', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: `🌟 **Guidance du jour** 🌟
✨ Climat du jour : Le Soleil en Lion apporte confiance et créativité
✅ Conseil : Exprimez vos talents avec assurance
🔮 Mantra du jour : "Je brille de ma propre lumière"`
        }
      }]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const guidance = await OpenAIService.generateGuidance(mockNatalChart, mockTransits);

    expect(guidance).toEqual({
      summary: 'Le Soleil en Lion apporte confiance et créativité',
      work: 'Exprimez vos talents avec assurance',
      energy: 'Je brille de ma propre lumière',
      love: expect.any(String)
    });
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    await expect(OpenAIService.generateGuidance(mockNatalChart, mockTransits))
      .rejects.toThrow('Erreur lors de la génération de la guidance');
  });
});