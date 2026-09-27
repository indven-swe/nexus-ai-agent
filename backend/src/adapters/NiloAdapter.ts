import type { ProviderResult } from './BaseAdapter.js';
import { BaseAdapter } from './BaseAdapter.js';

export class NiloAdapter extends BaseAdapter {
  constructor() {
    super('Nilo');
  }

  async execute(task: string): Promise<ProviderResult> {
    const lower = task.toLowerCase();
    const isWriting = /(write|email|copy|message|draft|document|proposal|script|content)/i.test(lower);
    const isResearch = /(research|analyze|compare|find|study|dig|trend|market)/i.test(lower);
    const isGeneral = /(help|summarize|explain|what|how|why)/i.test(lower);

    const summary = isWriting
      ? 'Nilo is refining the response into a polished, high-clarity outcome.'
      : isResearch
        ? 'Nilo is synthesizing the request into a research-informed, concise answer.'
        : isGeneral
          ? 'Nilo is focusing on clarity, tone, and practical guidance.'
          : 'Nilo is shaping the final response around usability and clarity.';

    const insight = 'The response should emphasize coherence, practical value, and a useful next step without exposing hidden internal reasoning.';

    const actions = [
      'Clarify the user need and expected outcome.',
      'Shape the answer in a concise, actionable manner.',
      'Deliver a final recommendation with context and options.',
    ];

    return {
      summary,
      insight,
      actions,
    };
  }
}
