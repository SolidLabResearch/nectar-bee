import { QueryDiff } from '../../src/lib/QueryDiff';

describe('QueryDiff with RSP-QL RANGE/STEP Support', () => {
  describe('SPARQL Mode', () => {
    it('should still work with regular SPARQL queries', () => {
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

  describe('RSP-QL RANGE/STEP Mode', () => {
    it('should auto-detect RSP-QL queries with RANGE/STEP syntax', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT *
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 10 STEP 2]
        WHERE{
            WINDOW :w1 { ?s ?p ?o }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT *
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 10 STEP 2]
         WHERE{
             WINDOW :w1 { ?s ?p ?o }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);

      expect(queryDiff.getQueryLanguage()).toBe('RSPQL');
      expect(queryDiff.isRSPQLMode()).toBe(true);
    });

    it('should generate RSP-QL nectar query with RANGE/STEP syntax preserved', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?s ?p ?o ?value
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3]
        WHERE{
            WINDOW :w1 {
              ?s ?p ?o .
              ?s :hasValue ?value
            }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?s ?p ?o
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 15 STEP 3]
         WHERE{
             WINDOW :w1 { ?s ?p ?o }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const nectarQuery = queryDiff.generateNectarQuery();

      expect(nectarQuery).toContain('REGISTER RStream');
      expect(nectarQuery).toContain('FROM NAMED WINDOW');
      expect(nectarQuery).toContain('[RANGE 15 STEP 3]');
      expect(nectarQuery).toContain('WINDOW :w1');
      expect(nectarQuery).toContain('MINUS');
    });

    it('should analyze sliding window information correctly', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <sensorOutput> AS
        SELECT ?sensor ?temp
        FROM NAMED WINDOW :w1 ON STREAM :sensorStream [RANGE 20 STEP 5]
        WHERE{
            WINDOW :w1 {
              ?sensor :hasTemp ?temp .
              ?sensor :isActive true
            }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <tempOutput> AS
         SELECT ?sensor ?temp
         FROM NAMED WINDOW :w1 ON STREAM :sensorStream [RANGE 20 STEP 5]
         WHERE{
             WINDOW :w1 { ?sensor :hasTemp ?temp }
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
      expect(analysis.streamAnalysis!.superStreamInfo.namedWindows).toEqual({ 'w1': 'sensorStream' });
      expect(analysis.streamAnalysis!.superStreamInfo.outputStream).toBe('sensorOutput');
      expect(analysis.streamAnalysis!.rangeStepCompatibility).toBe(true);
    });

    it('should detect RANGE/STEP incompatibility', () => {
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
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 20 STEP 5]
         WHERE{
             WINDOW :w1 { ?s ?p ?o }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const analysis = queryDiff.analyzeDifference();

      expect(analysis.streamAnalysis!.rangeStepCompatibility).toBe(false);
    });

    it('should extract patterns correctly from WINDOW clauses', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?sensor ?temp ?humidity
        FROM NAMED WINDOW :w1 ON STREAM :sensors [RANGE 30 STEP 10]
        WHERE{
            WINDOW :w1 {
              ?sensor :hasTemp ?temp .
              ?sensor :hasHumidity ?humidity .
              ?sensor :isActive true
            }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?sensor ?temp
         FROM NAMED WINDOW :w1 ON STREAM :sensors [RANGE 30 STEP 10]
         WHERE{
             WINDOW :w1 { ?sensor :hasTemp ?temp }
         }`
      ];

      const queryDiff = new QueryDiff(subqueries, superQuery);
      const minusPatterns = queryDiff.getMinusPatterns();

      expect(minusPatterns).toHaveLength(1);
      expect(minusPatterns[0]).toContain('?sensor :hasTemp ?temp');
    });

    it('should handle multiple named windows', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        REGISTER RStream <output> AS
        SELECT ?s ?p ?o
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 10 STEP 2]
        WHERE{
            WINDOW :w1 { ?s ?p ?o }
        }`;

      const queryDiff = new QueryDiff([], superQuery);
      const analysis = queryDiff.analyzeDifference();

      expect(analysis.streamAnalysis!.superStreamInfo.namedWindows).toEqual({ 'w1': 'stream1' });
      expect(analysis.streamAnalysis!.superStreamInfo.streamSources).toEqual(['stream1']);
    });
  });

  describe('Configuration Options', () => {
    it('should respect preservePrefixes option for RSP-QL', () => {
      const superQuery = `PREFIX : <https://rsp.js/>
        PREFIX sensor: <http://example.org/sensor/>
        REGISTER RStream <output> AS
        SELECT ?s ?temp ?active
        FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 10 STEP 2]
        WHERE{
            WINDOW :w1 {
              ?s sensor:hasTemp ?temp .
              ?s :isActive ?active
            }
        }`;

      const subqueries = [
        `PREFIX : <https://rsp.js/>
         REGISTER RStream <output> AS
         SELECT ?s ?temp
         FROM NAMED WINDOW :w1 ON STREAM :stream1 [RANGE 10 STEP 2]
         WHERE{
             WINDOW :w1 { ?s sensor:hasTemp ?temp }
         }`
      ];

      const queryDiffWithPrefixes = new QueryDiff(subqueries, superQuery, {
        preservePrefixes: true
      });
      const queryDiffWithoutPrefixes = new QueryDiff(subqueries, superQuery, {
        preservePrefixes: false
      });

      const nectarWithPrefixes = queryDiffWithPrefixes.generateAdvancedNectarQuery();
      const nectarWithoutPrefixes = queryDiffWithoutPrefixes.generateAdvancedNectarQuery();

      expect(nectarWithPrefixes).toContain('PREFIX :');
      expect(nectarWithPrefixes).toContain('PREFIX sensor:');
      expect(nectarWithoutPrefixes).not.toContain('PREFIX :');
      expect(nectarWithoutPrefixes).not.toContain('PREFIX sensor:');
    });
  });
});
