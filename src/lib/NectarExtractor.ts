/**
 * NectarExtractor - Extracts the essential parts (nectar) from query differences
 */

import { QueryDifference, NectarResult } from '../types/Query';

export class NectarExtractor {
  /**
   * Extracts the nectar (essential differences) from query comparison results
   */
  public extractNectar(difference: QueryDifference): NectarResult {
    const essentialParts = this.identifyEssentialParts(difference);
    const optimizations = this.suggestOptimizations(difference);
    const confidence = this.calculateConfidence(difference);

    return {
      essentialParts,
      optimizations,
      confidence
    };
  }

  /**
   * Batch processes multiple query differences to extract common patterns
   */
  public extractBatchNectar(differences: QueryDifference[]): NectarResult {
    const commonPatterns = this.findCommonPatterns(differences);
    const aggregatedOptimizations = this.aggregateOptimizations(differences);
    const averageConfidence = differences.reduce((sum, diff) => 
      sum + this.calculateConfidence(diff), 0) / differences.length;

    return {
      essentialParts: commonPatterns,
      optimizations: aggregatedOptimizations,
      confidence: averageConfidence
    };
  }

  private identifyEssentialParts(difference: QueryDifference): string[] {
    const essential: string[] = [];

    // Identify critical additions
    difference.additions.forEach(addition => {
      if (this.isCriticalKeyword(addition)) {
        essential.push(`Critical addition: ${addition}`);
      }
    });

    // Identify critical deletions
    difference.deletions.forEach(deletion => {
      if (this.isCriticalKeyword(deletion)) {
        essential.push(`Critical deletion: ${deletion}`);
      }
    });

    // Add modifications
    essential.push(...difference.modifications);

    return essential;
  }

  private suggestOptimizations(difference: QueryDifference): string[] {
    const optimizations: string[] = [];

    if (difference.similarity > 0.8) {
      optimizations.push('High similarity detected - consider query caching');
    }

    if (difference.additions.length > difference.deletions.length) {
      optimizations.push('Query complexity increased - consider indexing strategies');
    }

    if (difference.modifications.some(mod => mod.toLowerCase().includes('window'))) {
      optimizations.push('Window parameters changed - review memory usage');
    }

    return optimizations;
  }

  private calculateConfidence(difference: QueryDifference): number {
    // Base confidence on similarity and number of changes
    const changeRatio = (difference.additions.length + difference.deletions.length) / 
                       Math.max(difference.additions.length + difference.deletions.length + 10, 1);
    
    return Math.max(0, Math.min(1, difference.similarity * (1 - changeRatio)));
  }

  private isCriticalKeyword(token: string): boolean {
    const criticalKeywords = [
      'select', 'where', 'filter', 'group', 'order', 'limit',
      'window', 'stream', 'tumbling', 'sliding', 'landmark'
    ];
    
    return criticalKeywords.includes(token.toLowerCase());
  }

  private findCommonPatterns(differences: QueryDifference[]): string[] {
    const patternCounts = new Map<string, number>();

    differences.forEach(diff => {
      [...diff.additions, ...diff.deletions, ...diff.modifications].forEach(item => {
        const count = patternCounts.get(item) || 0;
        patternCounts.set(item, count + 1);
      });
    });

    // Return patterns that appear in more than 50% of differences
    const threshold = differences.length * 0.5;
    return Array.from(patternCounts.entries())
      .filter(([, count]) => count >= threshold)
      .map(([pattern]) => pattern);
  }

  private aggregateOptimizations(differences: QueryDifference[]): string[] {
    const allOptimizations = differences.flatMap(diff => 
      this.suggestOptimizations(diff)
    );

    // Remove duplicates and return unique optimizations
    return Array.from(new Set(allOptimizations));
  }
}