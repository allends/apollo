export interface ProposalEvidence {
  sessionId: string;
  note: string;
}

export interface InstructionProposalInput {
  target: string;
  rationale: string;
  diff: string;
  evidence: ProposalEvidence[];
  risk: "low" | "medium" | "high";
}
