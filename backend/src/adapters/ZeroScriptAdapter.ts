import type { ProviderResult } from './BaseAdapter.js';
import { BaseAdapter } from './BaseAdapter.js';

export class ZeroScriptAdapter extends BaseAdapter {
  constructor() {
    super('ZeroScript');
  }

  async execute(task: string): Promise<ProviderResult> {
    const lower = task.toLowerCase();
    const isCoding = /(code|bug|typescript|react|build|debug|api|refactor|lint|test)/i.test(lower);
    const isPlanning = /(plan|roadmap|strategy|workflow|architecture|system|feature)/i.test(lower);

    const summary = isCoding
      ? 'ZeroScript is evaluating the task for implementation structure and technical feasibility.'
      : isPlanning
        ? 'ZeroScript is mapping the request into a clear execution framework.'
        : 'ZeroScript is reducing the task into actionable steps and first principles.';

    const insight = isCoding
      ? 'The request appears technical, so the adapter is prioritizing implementation logic, sequencing, and operational clarity.'
      : 'The request benefits from structured decomposition, sequencing, and concise specification.';

    const actions = [
      'Identify the primary goal and constraints.',
      'Break the work into a clear sequence.',
      'Define the technical approach before building the answer.',
    ];

    return {
      summary,
      insight,
      actions,
    };
  }
}
