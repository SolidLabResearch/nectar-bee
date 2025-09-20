import { QueryDiff } from '../../src/lib/QueryDiff';

describe('QueryDiff', () => {
  describe('generateNectarQuery', () => {
    it('should generate nectar query using MINUS for simple patterns', () => {
      const superQuery = `
        SELECT ?person ?name ?age
        WHERE {
          ?person foaf:name ?name .
          ?person foaf:age ?age .
          ?person rdf:type foaf:Person
        }
      `;

      const subqueries = [
        'SELECT ?person ?name WHERE { ?person foaf:name ?name }'
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const nectarQuery = queryDiff.generateNectarQuery();

      expect(nectarQuery).toContain('MINUS');
      expect(nectarQuery).toContain('?person foaf:name ?name');
      expect(queryDiff.getNectarQuery()).toBe(nectarQuery);
    });

    it('should handle multiple subqueries with different patterns', () => {
      const superQuery = `
        SELECT ?person ?name ?age ?email
        WHERE {
          ?person foaf:name ?name .
          ?person foaf:age ?age .
          ?person foaf:mbox ?email .
          ?person rdf:type foaf:Person
        }
      `;

      const subqueries = [
        'SELECT ?person ?name WHERE { ?person foaf:name ?name }',
        'SELECT ?person ?age WHERE { ?person foaf:age ?age }'
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const nectarQuery = queryDiff.generateNectarQuery();

      expect(nectarQuery).toContain('MINUS');
      expect(nectarQuery).toContain('?person foaf:name ?name');
      expect(nectarQuery).toContain('?person foaf:age ?age');
    });

    it('should return original query when no subqueries provided', () => {
      const superQuery = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }';
      const subqueries: string[] = [];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const nectarQuery = queryDiff.generateNectarQuery();

      expect(nectarQuery).toBe(superQuery);
    });

    it('should handle queries with prefixes', () => {
      const superQuery = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT ?person ?name ?age
        WHERE {
          ?person foaf:name ?name .
          ?person foaf:age ?age .
          ?person rdf:type foaf:Person
        }
      `;

      const subqueries = [
        'SELECT ?person ?name WHERE { ?person foaf:name ?name }'
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const nectarQuery = queryDiff.generateAdvancedNectarQuery();

      expect(nectarQuery).toContain('PREFIX foaf:');
      expect(nectarQuery).toContain('PREFIX rdf:');
      expect(nectarQuery).toContain('MINUS');
    });
  });

  describe('analyzeDifference', () => {
    it('should correctly analyze patterns between super and sub queries', () => {
      const superQuery = `
        SELECT ?person ?name ?age
        WHERE {
          ?person foaf:name ?name .
          ?person foaf:age ?age .
          ?person rdf:type foaf:Person
        }
      `;

      const subqueries = [
        'SELECT ?person ?name WHERE { ?person foaf:name ?name }'
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const analysis = queryDiff.analyzeDifference();

      expect(analysis.superQueryPatterns).toHaveLength(3);
      expect(analysis.subqueryPatterns).toHaveLength(1);
      expect(analysis.commonPatterns).toHaveLength(1);
      expect(analysis.uniqueToSuper).toHaveLength(2);
    });
  });

  describe('getMinusPatterns', () => {
    it('should return unique patterns from all subqueries', () => {
      const superQuery = 'SELECT ?s ?p ?o WHERE { ?s ?p ?o }';
      const subqueries = [
        'SELECT ?person ?name WHERE { ?person foaf:name ?name }',
        'SELECT ?person ?age WHERE { ?person foaf:age ?age }',
        'SELECT ?person ?name WHERE { ?person foaf:name ?name }'
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const minusPatterns = queryDiff.getMinusPatterns();

      expect(minusPatterns).toHaveLength(2);
      expect(minusPatterns).toContain('?person foaf:name ?name');
      expect(minusPatterns).toContain('?person foaf:age ?age');
    });
  });

  describe('setters and getters', () => {
    it('should properly set and get nectar query', () => {
      const queryDiff = new QueryDiff([], 'SELECT ?s WHERE { ?s ?p ?o }');
      const customNectar = 'SELECT ?custom WHERE { ?custom ?p ?o }';

      queryDiff.setNectarQuery(customNectar);
      expect(queryDiff.getNectarQuery()).toBe(customNectar);
    });

    it('should return normalized subqueries and super query', () => {
      const superQuery = '  SELECT  ?s  WHERE  {  ?s  ?p  ?o  }  ';
      const subqueries = ['  SELECT  ?person  WHERE  {  ?person  ?name  ?value  }  '];

      const queryDiff = new QueryDiff(subqueries, superQuery);

      expect(queryDiff.getSuperQuery()).toBe('SELECT ?s WHERE { ?s ?p ?o }');
      expect(queryDiff.getSubqueries()[0]).toBe('SELECT ?person WHERE { ?person ?name ?value }');
    });
  });
});
