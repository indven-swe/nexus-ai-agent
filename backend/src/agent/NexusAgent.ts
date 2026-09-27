import { ZeroScriptAdapter } from '../adapters/ZeroScriptAdapter.js';
import { NiloAdapter } from '../adapters/NiloAdapter.js';
import type { AgentInput, AgentResult, AgentStep } from '../types.js';

export class NexusAgent {
  private readonly zeroScript = new ZeroScriptAdapter();
  private readonly nilo = new NiloAdapter();

  async process(input: AgentInput): Promise<AgentResult> {
    const initialSteps: AgentStep[] = [
      { name: 'Thinking', detail: 'Assessing the user request and expected outcome.', provider: 'Nexus' },
      { name: 'Planning', detail: 'Deciding whether a structured, writing, or hybrid approach is needed.', provider: 'Nexus' },
    ];

    const lower = input.message.toLowerCase();
    const requiresZero = /(code|debug|react|typescript|api|build|bug|refactor|architecture|app|feature|system)/i.test(lower);
    const requiresNilo = /(write|draft|summarize|research|analyze|plan|explain|help|strategy|compare|message|email|document)/i.test(lower);

    const steps: AgentStep[] = [...initialSteps];
    let zeroScriptSummary = 'Not required for this request.';
    let niloSummary = 'Not required for this request.';
    let combinedSummary = 'A single-agent response is sufficient for this request.';

    if (requiresZero) {
      const zeroResult = await this.zeroScript.execute(input.message);
      zeroScriptSummary = zeroResult.summary;
      steps.push({ name: 'Using ZeroScript', detail: zeroResult.insight, provider: 'ZeroScript' });
    }

    if (requiresNilo) {
      const niloResult = await this.nilo.execute(input.message);
      niloSummary = niloResult.summary;
      steps.push({ name: 'Using Nilo', detail: niloResult.insight, provider: 'Nilo' });
    }

    const useBoth = requiresZero && requiresNilo;
    if (useBoth) {
      combinedSummary = 'Nexus combined a technical framework with a clear, user-friendly final response.';
      steps.push({ name: 'Combining results', detail: 'Merging the technical and communication layers into a coherent answer.', provider: 'Nexus' });
    } else if (requiresZero || requiresNilo) {
      combinedSummary = 'Nexus applied the relevant capability to produce the most direct answer.';
      steps.push({ name: 'Combining results', detail: 'Turning the selected capability into a reusable final response.', provider: 'Nexus' });
    }

    steps.push({ name: 'Finished', detail: 'The final answer has been prepared for the user.', provider: 'Nexus' });

    const response = this.buildResponse({
      message: input.message,
      zeroScriptSummary,
      niloSummary,
      combinedSummary,
      requiresZero,
      requiresNilo,
    });

    return {
      response,
      activity: 'Finished',
      steps,
      providers: {
        zeroScript: zeroScriptSummary,
        nilo: niloSummary,
        combined: combinedSummary,
      },
    };
  }

  private buildResponse({
    message,
    zeroScriptSummary,
    niloSummary,
    combinedSummary,
    requiresZero,
    requiresNilo,
  }: {
    message: string;
    zeroScriptSummary: string;
    niloSummary: string;
    combinedSummary: string;
    requiresZero: boolean;
    requiresNilo: boolean;
  }): string {
    const intro = `I reviewed your request: "${message}" and routed it through the relevant Nexus capabilities.`;

    const sections: string[] = [intro];

    if (requiresZero) {
      sections.push(`ZeroScript: ${zeroScriptSummary}`);
    }

    if (requiresNilo) {
      sections.push(`Nilo: ${niloSummary}`);
    }

    if (!requiresZero && !requiresNilo) {
      sections.push('Nexus used a general-purpose response flow for a direct and helpful answer.');
    }

    sections.push(`Combined outcome: ${combinedSummary}`);
    sections.push('Here is the final response:');
    sections.push(this.defaultAnswer(message));

    return sections.join('\n\n');
  }

  private defaultAnswer(message: string): string {
    const task = message.trim();
    if (!task) {
      return 'I can help with planning, writing, coding, analysis, or general problem solving. Please share the task.';
    }

    return [
      'I can help with this request by breaking it into clear steps and delivering a practical answer.',
      'Start by defining the goal, the constraints, and the success criteria.',
      'From there, I can turn the task into a structured plan, a polished written response, or a technical implementation path.',
    ].join(' ');
  }
}
