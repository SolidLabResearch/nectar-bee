/**
 * QueryDiffer - Compares SPARQL/RSPQL queries to find differences
 */

import { SPARQLQuery, RSPQLQuery, QueryDifference } from '../types/Query';

export class QueryDiffer {
  /**
   * Compares two SPARQL queries and returns the differences
   */
  public compare(query1: SPARQLQuery, query2: SPARQLQuery): QueryDifference {
    const tokens1 = this.tokenizeQuery(query1.queryString);
    const tokens2 = this.tokenizeQuery(query2.queryString);

    const additions = tokens2.filter(token => !tokens1.includes(token));
    const deletions = tokens1.filter(token => !tokens2.includes(token));
    const modifications = this.findModifications(tokens1, tokens2);
    const similarity = this.calculateSimilarity(tokens1, tokens2);

    return {
      additions,
      deletions,
      modifications,
      similarity
    };
  }

  /**
   * Compares two RSPQL queries including stream-specific differences
   */
  public compareRSPQL(query1: RSPQLQuery, query2: RSPQLQuery): QueryDifference {
    const baseDiff = this.compare(query1, query2);
    
    // Add stream-specific comparisons
    const streamDifferences = this.compareStreamFeatures(query1, query2);
    
    return {
      additions: [...baseDiff.additions, ...streamDifferences.additions],
      deletions: [...baseDiff.deletions, ...streamDifferences.deletions],
      modifications: [...baseDiff.modifications, ...streamDifferences.modifications],
      similarity: (baseDiff.similarity + streamDifferences.similarity) / 2
    };
  }

  private tokenizeQuery(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private findModifications(_tokens1: string[], _tokens2: string[]): string[] {
    const modifications: string[] = [];
    
    // This is a simplified implementation
    // In a real scenario, you'd use more sophisticated diff algorithms
    
    return modifications;
  }

  private calculateSimilarity(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 1 : intersection.size / union.size;
  }

  private compareStreamFeatures(query1: RSPQLQuery, query2: RSPQLQuery): QueryDifference {
    const additions: string[] = [];
    const deletions: string[] = [];
    const modifications: string[] = [];

    if (query1.windowType !== query2.windowType) {
      modifications.push(`Window type changed from ${query1.windowType} to ${query2.windowType}`);
    }

    if (query1.windowSize !== query2.windowSize) {
      modifications.push(`Window size changed from ${query1.windowSize} to ${query2.windowSize}`);
    }

    if (query1.streamUri !== query2.streamUri) {
      modifications.push(`Stream URI changed from ${query1.streamUri} to ${query2.streamUri}`);
    }

    return {
      additions,
      deletions,
      modifications,
      similarity: modifications.length === 0 ? 1 : 0.5
    };
  }
}