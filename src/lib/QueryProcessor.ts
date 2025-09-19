/**
 * QueryProcessor - Main class for processing SPARQL/RSPQL queries
 */

import { SPARQLQuery, RSPQLQuery } from '../types/Query';
import { normalizeQuery, extractPrefixes, isValidSPARQL } from '../utils/queryUtils';

export class QueryProcessor {
  /**
   * Processes a SPARQL query string and returns a structured query object
   */
  public processSPARQL(queryString: string): SPARQLQuery {
    if (!isValidSPARQL(queryString)) {
      throw new Error('Invalid SPARQL query provided');
    }

    const normalized = normalizeQuery(queryString);
    const queryType = this.extractQueryType(normalized);
    const prefixes = extractPrefixes(queryString);
    const variables = this.extractVariables(normalized);

    return {
      queryString: normalized,
      queryType,
      prefixes,
      variables
    };
  }

  /**
   * Processes an RSPQL query string and returns a structured query object
   */
  public processRSPQL(queryString: string): RSPQLQuery {
    const baseQuery = this.processSPARQL(queryString);
    
    // Extract stream-specific information
    const windowType = this.extractWindowType(queryString);
    const windowSize = this.extractWindowSize(queryString);
    const streamUri = this.extractStreamUri(queryString);

    return {
      ...baseQuery,
      windowType,
      windowSize,
      streamUri
    };
  }

  private extractQueryType(query: string): SPARQLQuery['queryType'] {
    const upperQuery = query.toUpperCase();
    
    if (upperQuery.includes('SELECT')) return 'SELECT';
    if (upperQuery.includes('CONSTRUCT')) return 'CONSTRUCT';
    if (upperQuery.includes('ASK')) return 'ASK';
    if (upperQuery.includes('DESCRIBE')) return 'DESCRIBE';
    
    throw new Error('Unable to determine query type');
  }

  private extractVariables(query: string): string[] {
    const variableRegex = /\?(\w+)/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(query)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  private extractWindowType(query: string): RSPQLQuery['windowType'] {
    const upperQuery = query.toUpperCase();
    
    if (upperQuery.includes('TUMBLING')) return 'TUMBLING';
    if (upperQuery.includes('SLIDING')) return 'SLIDING';
    if (upperQuery.includes('LANDMARK')) return 'LANDMARK';
    
    return 'TUMBLING'; // Default
  }

  private extractWindowSize(query: string): number | undefined {
    const windowSizeRegex = /WINDOW\s+\[(\d+)\s*SECONDS?\]/i;
    const match = windowSizeRegex.exec(query);
    
    return match ? parseInt(match[1], 10) : undefined;
  }

  private extractStreamUri(query: string): string | undefined {
    const streamRegex = /FROM\s+STREAM\s+<([^>]+)>/i;
    const match = streamRegex.exec(query);
    
    return match ? match[1] : undefined;
  }
}