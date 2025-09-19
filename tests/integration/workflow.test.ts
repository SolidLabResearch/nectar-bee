/**
 * Integration tests for the complete nectar-bee workflow
 */

import { QueryProcessor, QueryDiffer, NectarExtractor } from '../../src';

describe('Nectar Bee Integration', () => {
  let processor: QueryProcessor;
  let differ: QueryDiffer;
  let extractor: NectarExtractor;

  beforeEach(() => {
    processor = new QueryProcessor();
    differ = new QueryDiffer();
    extractor = new NectarExtractor();
  });

  describe('Complete workflow', () => {
    it('should process and compare two similar SPARQL queries', () => {
      const query1String = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }';
      const query2String = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o . FILTER(?o > 100) }';

      const query1 = processor.processSPARQL(query1String);
      const query2 = processor.processSPARQL(query2String);

      expect(query1.queryType).toBe('SELECT');
      expect(query2.queryType).toBe('SELECT');

      const difference = differ.compare(query1, query2);
      expect(difference.similarity).toBeGreaterThan(0);
      expect(difference.additions.length).toBeGreaterThan(0);

      const nectar = extractor.extractNectar(difference);
      expect(nectar.confidence).toBeDefined();
      expect(nectar.essentialParts).toBeDefined();
      expect(nectar.optimizations).toBeDefined();
    });

    it('should handle RSPQL queries with streaming features', () => {
      const query1String = `
        SELECT ?temp 
        FROM STREAM <http://example.org/temperature> [TUMBLING WINDOW [10 SECONDS]]
        WHERE { ?sensor :temperature ?temp }
      `;
      const query2String = `
        SELECT ?temp 
        FROM STREAM <http://example.org/temperature> [SLIDING WINDOW [15 SECONDS]]
        WHERE { ?sensor :temperature ?temp }
      `;

      const query1 = processor.processRSPQL(query1String);
      const query2 = processor.processRSPQL(query2String);

      expect(query1.windowType).toBe('TUMBLING');
      expect(query2.windowType).toBe('SLIDING');
      expect(query1.windowSize).toBe(10);
      expect(query2.windowSize).toBe(15);

      const difference = differ.compareRSPQL(query1, query2);
      expect(difference.modifications.length).toBeGreaterThan(0);
      
      const nectar = extractor.extractNectar(difference);
      expect(nectar.optimizations).toContain('Window parameters changed - review memory usage');
    });

    it('should extract batch nectar from multiple query comparisons', () => {
      const queries = [
        'SELECT ?s WHERE { ?s ?p ?o }',
        'SELECT ?s WHERE { ?s ?p ?o . FILTER(?s > 10) }',
        'SELECT ?s WHERE { ?s ?p ?o . FILTER(?s > 20) }'
      ];

      const processedQueries = queries.map(q => processor.processSPARQL(q));
      const differences = [];

      for (let i = 0; i < processedQueries.length - 1; i++) {
        differences.push(differ.compare(processedQueries[i], processedQueries[i + 1]));
      }

      const batchNectar = extractor.extractBatchNectar(differences);
      
      expect(batchNectar.essentialParts).toBeDefined();
      expect(batchNectar.optimizations).toBeDefined();
      expect(batchNectar.confidence).toBeGreaterThanOrEqual(0);
      expect(batchNectar.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed queries gracefully', () => {
      expect(() => processor.processSPARQL('INVALID QUERY')).toThrow();
    });

    it('should handle empty queries', () => {
      const query1 = processor.processSPARQL('SELECT ?s WHERE { ?s ?p ?o }');
      const query2 = processor.processSPARQL('ASK { ?s ?p ?o }');

      const difference = differ.compare(query1, query2);
      const nectar = extractor.extractNectar(difference);

      expect(nectar).toBeDefined();
      expect(nectar.confidence).toBeGreaterThanOrEqual(0);
    });
  });
});