/**
 * Utility functions for SPARQL query processing
 */

/**
 * Normalizes whitespace in a SPARQL query string
 */
export function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts prefixes from a SPARQL query
 */
export function extractPrefixes(query: string): Record<string, string> {
  const prefixes: Record<string, string> = {};
  const prefixRegex = /PREFIX\s+(\w+):\s*<([^>]+)>/gi;
  let match;
  
  while ((match = prefixRegex.exec(query)) !== null) {
    prefixes[match[1]] = match[2];
  }
  
  return prefixes;
}

/**
 * Validates if a string is a valid SPARQL query
 */
export function isValidSPARQL(query: string): boolean {
  const normalizedQuery = normalizeQuery(query.toUpperCase());
  const queryTypes = ['SELECT', 'CONSTRUCT', 'ASK', 'DESCRIBE'];
  
  return queryTypes.some(type => normalizedQuery.includes(type));
}