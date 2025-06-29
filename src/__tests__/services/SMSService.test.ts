import { SMSService } from '../../lib/sms';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('SMSService', () => {
  beforeAll(() => {
    server.use(
      http.post('https://api.brevo.com/v3/transactionalSMS/sms', async ({ request }) => {
        const body = await request.json();
        
        if (!body.recipient || !body.content) {
          return new HttpResponse(null, { status: 400 });
        }

        return HttpResponse.json({
          messageId: 'test-message-id'
        });
      })
    );
  });

  describe('sendVerificationCode', () => {
    it('should send verification code successfully', async () => {
      const phone = '+33612345678';
      const code = '123456';

      const response = await SMSService.sendVerificationCode(phone, code);

      expect(response).toEqual({
        messageId: expect.any(String)
      });
    });

    it('should handle invalid phone number', async () => {
      const phone = 'invalid';
      const code = '123456';

      const response = await SMSService.sendVerificationCode(phone, code);

      expect(response).toEqual({
        error: expect.any(String)
      });
    });
  });

  describe('sendSMS', () => {
    it('should send SMS successfully', async () => {
      const smsData = {
        to: '+33612345678',
        message: 'Test message',
        sender: 'Zodiak'
      };

      const response = await SMSService.sendSMS(smsData);

      expect(response).toEqual({
        messageId: expect.any(String)
      });
    });

    it('should handle API errors', async () => {
      server.use(
        http.post('https://api.brevo.com/v3/transactionalSMS/sms', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const smsData = {
        to: '+33612345678',
        message: 'Test message',
        sender: 'Zodiak'
      };

      const response = await SMSService.sendSMS(smsData);

      expect(response).toEqual({
        error: expect.any(String)
      });
    });
  });
});