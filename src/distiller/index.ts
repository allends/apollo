export interface DistillResult {
  summariesCreated: number;
  observationsCreated: number;
  proposalsStaged: number;
}

export async function distillNewHistory(): Promise<DistillResult> {
  return { summariesCreated: 0, observationsCreated: 0, proposalsStaged: 0 };
}
