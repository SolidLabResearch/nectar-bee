/**
 * Unit tests for QueryProcessor
 */

import { QueryProcessor } from '../../src/lib/QueryProcessor';

describe('QueryProcessor', () => {
  let processor: QueryProcessor;

  beforeEach(() => {
    processor = new QueryProcessor();
  });

  describe('processSPARQL', () => {
    it('should process a simple SELECT query', () => {
      const queryString = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }';
      const result = processor.processSPARQL(queryString);

      expect(result.queryType).toBe('SELECT');
      expect(result.variables).toEqual(['s', 'p', 'o']);
      expect(result.queryString).toBe(queryString);
    });

    it('should extract prefixes from query', () => {
      const queryString = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT ?name WHERE { ?person foaf:name ?name }
      `;
      const result = processor.processSPARQL(queryString);

      expect(result.prefixes).toEqual({
        'foaf': 'http://xmlns.com/foaf/0.1/',
        'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
      });
    });

    it('should throw error for invalid SPARQL', () => {
      const invalidQuery = 'INVALID QUERY SYNTAX';
      
      expect(() => processor.processSPARQL(invalidQuery)).toThrow('Invalid SPARQL query provided');
    });

    it('should handle CONSTRUCT queries', () => {
      const queryString = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }';
      const result = processor.processSPARQL(queryString);

      expect(result.queryType).toBe('CONSTRUCT');
    });

    it('should handle ASK queries', () => {
      const queryString = 'ASK { ?s ?p ?o }';
      const result = processor.processSPARQL(queryString);

      expect(result.queryType).toBe('ASK');
    });
  });

  describe('processRSPQL', () => {
    it('should process RSPQL with window information', () => {
      const queryString = `
        SELECT ?temp 
        FROM STREAM <http://example.org/temperature> [TUMBLING WINDOW [10 SECONDS]]
        WHERE { ?sensor :temperature ?temp }
      `;
      const result = processor.processRSPQL(queryString);

      expect(result.windowType).toBe('TUMBLING');
      expect(result.windowSize).toBe(10);
      expect(result.streamUri).toBe('http://example.org/temperature');
    });

    it('should default to TUMBLING window when not specified', () => {
      const queryString = 'SELECT ?s WHERE { ?s ?p ?o }';
      const result = processor.processRSPQL(queryString);

      expect(result.windowType).toBe('TUMBLING');
    });
  });
});