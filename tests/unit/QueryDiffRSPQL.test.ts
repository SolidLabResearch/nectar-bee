import { QueryDiff } from '../../src/lib/QueryDiff';

describe('QueryDiff with RSP-QL Support', () => {
  describe('SPARQL Mode', () => {
    it('should generate nectar query using MINUS for SPARQL queries', () => {
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

      const queryDiff = new QueryDiff(subqueries, superQuery, { queryLanguage: 'SPARQL' });
      const nectarQuery = queryDiff.generateNectarQuery();

      expect(queryDiff.getQueryLanguage()).toBe('SPARQL');
      expect(queryDiff.isRSPQLMode()).toBe(false);
      expect(nectarQuery).toContain('MINUS');
      expect(nectarQuery).toContain('?person foaf:name ?name');
    });
  });

  describe('RSP-QL Mode', () => {
    it('should auto-detect RSP-QL queries', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?s ?p ?o
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 10 STEP 2]
        WHERE{
            WINDOW :w1 { ?s ?p ?o }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?s ?p ?o
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 10 STEP 2]
         WHERE{
             WINDOW :w1 { ?s ?p ?o }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
console.log(queryDiff);

      expect(queryDiff.getQueryLanguage()).toBe('RSPQL');
      expect(queryDiff.isRSPQLMode()).toBe(true);
    });

    it('should generate RSP-QL nectar query with stream syntax preserved', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?s ?temp ?humidity
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3]
        WHERE{
            WINDOW :w1 {
              ?s :hasTemp ?temp .
              ?s :hasHumidity ?humidity
            }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?s ?temp
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3]
         WHERE{
             WINDOW :w1 { ?s :hasTemp ?temp }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const nectarQuery = queryDiff.generateNectarQuery();

      console.log(nectarQuery);
      
      expect(nectarQuery).toContain('REGISTER RStream');
      expect(nectarQuery).toContain('FROM NAMED WINDOW');
      expect(nectarQuery).toContain('[RANGE 15 STEP 3]');
      expect(nectarQuery).toContain('WINDOW :w1');
      expect(nectarQuery).toContain('MINUS');
    });

    it('should analyze stream information correctly', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?s ?temp
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 20 STEP 5]
        WHERE{
            WINDOW :w1 {
              ?s :hasTemp ?temp .
              ?s :isActive true
            }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?s ?temp
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 20 STEP 5]
         WHERE{
             WINDOW :w1 { ?s :hasTemp ?temp }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery, {
        queryLanguage: 'RSPQL',
        includeWindowAnalysis: true
      });

      const analysis = queryDiff.analyzeDifference();

      expect(analysis.streamAnalysis).toBeDefined();
      expect(analysis.streamAnalysis!.superStreamInfo.windowType).toBe('SLIDING');
      expect(analysis.streamAnalysis!.superStreamInfo.windowRange).toBe(20);
      expect(analysis.streamAnalysis!.superStreamInfo.windowStep).toBe(5);
      expect(analysis.streamAnalysis!.rangeStepCompatibility).toBe(true);
    });

    it('should detect window incompatibility', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?s ?value
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 10 STEP 2]
        WHERE{
            WINDOW :w1 { ?s :hasValue ?value }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?s ?value
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 20 STEP 5]
         WHERE{
             WINDOW :w1 { ?s :hasValue ?value }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const analysis = queryDiff.analyzeDifference();

      expect(analysis.streamAnalysis!.rangeStepCompatibility).toBe(false);
    });
  });

  describe('Language Switching', () => {
    it('should allow switching between SPARQL and RSP-QL', () => {
      const queryDiff = new QueryDiff(
        ['SELECT ?s WHERE { ?s ?p ?o }'],
        'SELECT ?s ?p WHERE { ?s ?p ?o }'
      );

      expect(queryDiff.getQueryLanguage()).toBe('SPARQL');

      queryDiff.setQueryLanguage('RSPQL');
      expect(queryDiff.getQueryLanguage()).toBe('RSPQL');
      expect(queryDiff.isRSPQLMode()).toBe(true);

      queryDiff.setQueryLanguage('SPARQL');
      expect(queryDiff.getQueryLanguage()).toBe('SPARQL');
      expect(queryDiff.isRSPQLMode()).toBe(false);
    });
  });

  describe('Configuration Options', () => {
    it('should respect preservePrefixes option', () => {
      const superQuery = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        SELECT ?person ?name ?age
        WHERE {
          ?person foaf:name ?name .
          ?person foaf:age ?age
        }
      `;

      const subqueries = ['SELECT ?person ?name WHERE { ?person foaf:name ?name }'];

      const queryDiffWithPrefixes = new QueryDiff(subqueries, superQuery, {
        preservePrefixes: true
      });
      const queryDiffWithoutPrefixes = new QueryDiff(subqueries, superQuery, {
        preservePrefixes: false
      });

      const nectarWithPrefixes = queryDiffWithPrefixes.generateAdvancedNectarQuery();
      const nectarWithoutPrefixes = queryDiffWithoutPrefixes.generateAdvancedNectarQuery();

      expect(nectarWithPrefixes).toContain('PREFIX foaf:');
      expect(nectarWithoutPrefixes).not.toContain('PREFIX foaf:');
    });

    it('should return configuration options', () => {
      const options = {
        queryLanguage: 'RSPQL' as const,
        preservePrefixes: false,
        normalizePatterns: true,
        includeWindowAnalysis: false
      };

      const queryDiff = new QueryDiff([], 'SELECT ?s WHERE { ?s ?p ?o }', options);
      const retrievedOptions = queryDiff.getOptions();

      expect(retrievedOptions.queryLanguage).toBe('RSPQL');
      expect(retrievedOptions.preservePrefixes).toBe(false);
      expect(retrievedOptions.normalizePatterns).toBe(true);
      expect(retrievedOptions.includeWindowAnalysis).toBe(false);
    });
  });

  describe('Pattern Extraction', () => {
    it('should extract patterns correctly from RSP-QL queries', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?s ?temp ?active
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3]
        WHERE{
            WINDOW :w1 {
              ?s :hasTemp ?temp .
              ?s :isActive ?active .
              ?s :type :Sensor
            }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?s ?temp ?active
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3]
         WHERE{
             WINDOW :w1 {
               ?s :hasTemp ?temp .
               ?s :isActive ?active
             }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const minusPatterns = queryDiff.getMinusPatterns();

      expect(minusPatterns).toHaveLength(2);
      expect(minusPatterns).toContain('?s :hasTemp ?temp');
      expect(minusPatterns).toContain('?s :isActive ?active');
    });
  });
});
