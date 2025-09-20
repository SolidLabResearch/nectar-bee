export interface ProcessedQuery {
  queryType: 'SELECT' | 'CONSTRUCT' | 'ASK' | 'DESCRIBE';
  variables: string[];
  prefixes: Record<string, string>;
  queryString: string;
  basicGraphPatterns: string[];
}

export interface RSPQLQuery extends ProcessedQuery {
  isStreamQuery: true;
  windowType: 'SLIDING';
  windowRange: number;
  windowStep: number;
  streamUri?: string;
  streamSources: string[];
  namedWindows: Record<string, string>; 
  outputStream?: string; 
}

export interface QueryDiffOptions {
  queryLanguage: 'SPARQL' | 'RSPQL';
  preservePrefixes: boolean;
  normalizePatterns: boolean;
  includeWindowAnalysis?: boolean; 
}

export interface QueryDifference {
  similarity: number;
  additions: string[];
  deletions: string[];
  modifications: string[];
}

export interface NectarResult {
  confidence: number;
  essentialParts: string[];
  optimizations: string[];
}

export interface BatchNectarResult extends NectarResult {
  commonPatterns: string[];
}
