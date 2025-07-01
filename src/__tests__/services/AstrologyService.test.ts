import { describe, it, expect, vi } from 'vitest';
import { AstrologyService } from '../../lib/services/AstrologyService';

// Mock des dépendances
vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('AstrologyService', () => {
  const mockBirthData = {
    date_of_birth: '1990-01-01',
    time_of_birth: '12:00',
    location: '48.8566,2.3522'
  };

  describe('calculateNatalChart', () => {
    it('should calculate natal chart correctly', async () => {
      const chart = await AstrologyService.calculateNatalChart(mockBirthData);
      
      expect(chart).toHaveProperty('planets');
      expect(chart).toHaveProperty('houses');
      expect(chart).toHaveProperty('ascendant');
      
      expect(chart.planets).toHaveLength(7); // Vérifie le nombre de planètes
      expect(chart.houses).toHaveLength(12); // Vérifie le nombre de maisons
      
      // Vérifie la structure d'une planète
      const sun = chart.planets.find(p => p.name === 'Soleil');
      expect(sun).toMatchObject({
        name: 'Soleil',
        longitude: expect.any(Number),
        house: expect.any(Number),
        sign: expect.any(String),
        retrograde: expect.any(Boolean)
      });
    });

    it('should throw error for invalid location format', async () => {
      const invalidData = { ...mockBirthData, location: 'invalid' };
      await expect(AstrologyService.calculateNatalChart(invalidData))
        .rejects.toThrow('Format de localisation invalide');
    });
  });

  describe('generateDailyGuidance', () => {
    const mockNatalChart = {
      planets: [
        { name: 'Soleil', longitude: 120, house: 1, sign: 'Lion', retrograde: false }
      ],
      houses: [
        { number: 1, sign: 'Lion', degree: 15 }
      ],
      ascendant: { sign: 'Lion', degree: 15 }
    };

    it('should generate daily guidance', async () => {
      const guidance = await AstrologyService.generateDailyGuidance('test-user', mockNatalChart);
      
      expect(guidance).toMatchObject({
        summary: expect.any(String),
        love: expect.any(String),
        work: expect.any(String),
        energy: expect.any(String)
      });
    });

    it('should cache guidance for the same day', async () => {
      const userId = 'test-user';
      
      // Premier appel
      const guidance1 = await AstrologyService.generateDailyGuidance(userId, mockNatalChart);
      // Deuxième appel immédiat
      const guidance2 = await AstrologyService.generateDailyGuidance(userId, mockNatalChart);
      
      // Les deux guidances doivent être identiques car mises en cache
      expect(guidance1).toEqual(guidance2);
    });
  });
});