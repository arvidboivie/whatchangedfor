export function sharedParserInterface(): string {
  return 'shared-parser-interface';
}

export interface ChangeSet {
  patch: string;
  unit: string;
  changes: string[];
}

export interface ParserInterface {
  supportedPatches: string[];
  parse(): Promise<ChangeSet[]>;
}
