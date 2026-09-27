export interface ProviderResult {
  summary: string;
  insight: string;
  actions: string[];
}

export abstract class BaseAdapter {
  protected readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract execute(task: string): Promise<ProviderResult>;
}
