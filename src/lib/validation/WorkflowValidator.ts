import { Logger } from '../logging/Logger';
import { Analytics } from '../monitoring/Analytics';

interface ValidationStep {
  name: string;
  validate: () => Promise<boolean>;
  errorMessage: string;
}

interface ValidationResult {
  success: boolean;
  steps: {
    name: string;
    success: boolean;
    error?: string;
  }[];
}

export class WorkflowValidator {
  private static instance: WorkflowValidator;
  private validationSteps: Map<string, ValidationStep[]> = new Map();

  private constructor() {}

  static getInstance(): WorkflowValidator {
    if (!this.instance) {
      this.instance = new WorkflowValidator();
    }
    return this.instance;
  }

  registerWorkflow(workflowName: string, steps: ValidationStep[]) {
    this.validationSteps.set(workflowName, steps);
    Logger.info(`Workflow registered: ${workflowName}`, { stepsCount: steps.length });
  }

  async validateWorkflow(workflowName: string): Promise<ValidationResult> {
    const steps = this.validationSteps.get(workflowName);
    if (!steps) {
      throw new Error(`Workflow not found: ${workflowName}`);
    }

    const results: ValidationResult = {
      success: true,
      steps: []
    };

    Logger.info(`Starting workflow validation: ${workflowName}`);
    
    for (const step of steps) {
      try {
        const stepStart = performance.now();
        const success = await step.validate();
        const stepDuration = performance.now() - stepStart;

        results.steps.push({
          name: step.name,
          success,
          error: success ? undefined : step.errorMessage
        });

        if (!success) {
          results.success = false;
          Logger.error(`Validation failed at step: ${step.name}`, {
            workflow: workflowName,
            error: step.errorMessage
          });
          Analytics.trackError(new Error(`Workflow validation failed: ${step.name}`), {
            workflow: workflowName,
            step: step.name
          });
          break;
        }

        Analytics.trackPerformance(`workflow_step_${workflowName}_${step.name}`, stepDuration);
        Logger.info(`Step validated: ${step.name}`, { duration: stepDuration });

      } catch (error) {
        results.success = false;
        results.steps.push({
          name: step.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        Logger.error(`Error in validation step: ${step.name}`, {
          workflow: workflowName,
          error
        });
        
        Analytics.trackError(error instanceof Error ? error : new Error('Validation error'), {
          workflow: workflowName,
          step: step.name
        });
        
        break;
      }
    }

    Logger.info(`Workflow validation completed: ${workflowName}`, {
      success: results.success,
      stepsCompleted: results.steps.length
    });

    return results;
  }
}