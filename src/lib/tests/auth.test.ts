import { AuthService } from '../auth';
import { AuthWorkflowValidator } from '../validation/workflows/AuthWorkflowValidator';
import { createSafeTimer } from '../utils';

describe('Auth System', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('AuthWorkflowValidator', () => {
    it('should initialize and validate workflow successfully', async () => {
      AuthWorkflowValidator.initialize();
      const result = await AuthWorkflowValidator.validateAuthWorkflow();
      expect(result).toBe(true);
    });
  });

  describe('SafeTimer', () => {
    it('should handle timer correctly', () => {
      let called = false;
      const timer = createSafeTimer(() => {
        called = true;
      }, 1000);

      timer.start();
      expect(timer.isRunning()).toBe(true);
      
      jest.advanceTimersByTime(1000);
      expect(called).toBe(true);
      expect(timer.isRunning()).toBe(false);
    });

    it('should clean up timer on stop', () => {
      let called = false;
      const timer = createSafeTimer(() => {
        called = true;
      }, 1000);

      timer.start();
      timer.stop();
      
      jest.advanceTimersByTime(1000);
      expect(called).toBe(false);
      expect(timer.isRunning()).toBe(false);
    });
  });

  describe('AuthService', () => {
    it('should handle phone verification flow', async () => {
      const phone = '0612345678';
      const code = '123456';

      const sendResult = await AuthService.sendVerificationCode(phone);
      expect(sendResult.success).toBe(true);

      const verifyResult = await AuthService.verifyCode(phone, code);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.session).toBeDefined();
    });
  });
});