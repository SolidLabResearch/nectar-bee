/**
 * Type definitions for SPARQL and RSPQL queries
 */

export interface SPARQLQuery {
  readonly queryString: string;
  readonly queryType: 'SELECT' | 'CONSTRUCT' | 'ASK' | 'DESCRIBE';
  readonly prefixes?: Record<string, string>;
  readonly variables?: string[];
}

export interface RSPQLQuery extends SPARQLQuery {
  readonly windowType: 'TUMBLING' | 'SLIDING' | 'LANDMARK';
  readonly windowSize?: number;
  readonly windowStep?: number;
  readonly streamUri?: string;
}

export interface QueryDifference {
  readonly additions: string[];
  readonly deletions: string[];
  readonly modifications: string[];
  readonly similarity: number;
}

export interface NectarResult {
  readonly essentialParts: string[];
  readonly optimizations: string[];
  readonly confidence: number;
}