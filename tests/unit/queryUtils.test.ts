/**
 * Unit tests for query utilities
 */

import { normalizeQuery, extractPrefixes, isValidSPARQL } from '../../src/utils/queryUtils';

describe('queryUtils', () => {
  describe('normalizeQuery', () => {
    it('should normalize whitespace', () => {
      const query = '  SELECT   ?s   ?p   ?o  \n  WHERE  {  ?s  ?p  ?o  }  ';
      const result = normalizeQuery(query);
      
      expect(result).toBe('SELECT ?s ?p ?o WHERE { ?s ?p ?o }');
    });

    it('should handle empty strings', () => {
      expect(normalizeQuery('')).toBe('');
      expect(normalizeQuery('   ')).toBe('');
    });
  });

  describe('extractPrefixes', () => {
    it('should extract prefixes from query', () => {
      const query = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT ?name WHERE { ?person foaf:name ?name }
      `;
      
      const prefixes = extractPrefixes(query);
      
      expect(prefixes).toEqual({
        'foaf': 'http://xmlns.com/foaf/0.1/',
        'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
      });
    });

    it('should return empty object when no prefixes', () => {
      const query = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }';
      const prefixes = extractPrefixes(query);
      
      expect(prefixes).toEqual({});
    });

    it('should handle case insensitive PREFIX', () => {
      const query = 'prefix foaf: <http://xmlns.com/foaf/0.1/>';
      const prefixes = extractPrefixes(query);
      
      expect(prefixes).toEqual({
        'foaf': 'http://xmlns.com/foaf/0.1/'
      });
    });
  });

  describe('isValidSPARQL', () => {
    it('should validate SELECT queries', () => {
      expect(isValidSPARQL('SELECT ?s WHERE { ?s ?p ?o }')).toBe(true);
    });

    it('should validate CONSTRUCT queries', () => {
      expect(isValidSPARQL('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }')).toBe(true);
    });

    it('should validate ASK queries', () => {
      expect(isValidSPARQL('ASK { ?s ?p ?o }')).toBe(true);
    });

    it('should validate DESCRIBE queries', () => {
      expect(isValidSPARQL('DESCRIBE ?s WHERE { ?s ?p ?o }')).toBe(true);
    });

    it('should reject invalid queries', () => {
      expect(isValidSPARQL('INVALID QUERY')).toBe(false);
      expect(isValidSPARQL('')).toBe(false);
    });

    it('should handle case insensitive validation', () => {
      expect(isValidSPARQL('select ?s where { ?s ?p ?o }')).toBe(true);
      expect(isValidSPARQL('CONSTRUCT { ?s ?p ?o } where { ?s ?p ?o }')).toBe(true);
    });
  });
});