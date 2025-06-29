import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock pour l'API SMS
  http.post('https://api.brevo.com/v3/transactionalSMS/sms', async ({ request }) => {
    const body = await request.json();
    
    if (!body.recipient || !body.content) {
      return new HttpResponse(null, { status: 400 });
    }

    return HttpResponse.json({
      messageId: 'test-message-id'
    });
  }),

  // Mock pour l'API astrologique
  http.post('https://api.prokerala.com/v2/astrology/natal-chart', () => {
    return HttpResponse.json({
      planets: [
        { name: 'Soleil', longitude: 120, house: 1, sign: 'Lion', retrograde: false }
      ],
      houses: [
        { number: 1, sign: 'Lion', degree: 15 }
      ],
      ascendant: { sign: 'Lion', degree: 15 }
    });
  }),

  http.post('https://api.prokerala.com/v2/astrology/daily-guidance', () => {
    return HttpResponse.json({
      summary: 'Test summary',
      love: 'Test love guidance',
      work: 'Test work guidance',
      energy: 'Test energy guidance'
    });
  })
];