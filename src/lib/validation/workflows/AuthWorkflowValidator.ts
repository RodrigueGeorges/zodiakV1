import { WorkflowValidator } from '../WorkflowValidator';
import { SuperAuthService } from '../../auth';
import { StorageService } from '../../storage';
import { validatePhone, validateCode } from '../auth';

export class AuthWorkflowValidator {
  private static validator = WorkflowValidator.getInstance();

  static initialize() {
    this.validator.registerWorkflow('phoneAuth', [
      {
        name: 'validatePhoneFormat',
        validate: async () => {
          const phone = '0612345678'; // Test phone
          const result = validatePhone(phone);
          return result.success;
        },
        errorMessage: 'La validation du format du numéro de téléphone a échoué'
      },
      {
        name: 'validateCodeFormat',
        validate: async () => {
          const code = '123456'; // Test code
          const result = validateCode(code);
          return result.success;
        },
        errorMessage: 'La validation du format du code a échoué'
      },
      {
        name: 'validateAuthService',
        validate: async () => {
          try {
            const response = await SuperAuthService.sendVerificationCode('0612345678');
            return response.success;
          } catch {
            return false;
          }
        },
        errorMessage: 'Le service d\'authentification ne répond pas correctement'
      },
      {
        name: 'validateStorage',
        validate: async () => {
          return StorageService.isStorageAvailable();
        },
        errorMessage: 'Le stockage local n\'est pas disponible'
      }
    ]);
  }

  static async validateAuthWorkflow(): Promise<boolean> {
    try {
      const results = await this.validator.validateWorkflow('phoneAuth');
      
      if (!results.success) {
        console.error('Auth workflow validation failed:', 
          results.steps.find(step => !step.success)?.error
        );
      }
      
      return results.success;
    } catch (error) {
      console.error('Error validating auth workflow:', error);
      return false;
    }
  }
}