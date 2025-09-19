/**
 * Example usage of nectar-bee library
 * Run with: npm run dev
 */

import { QueryProcessor, QueryDiffer, NectarExtractor } from './src';

function main() {
  console.log('🐝 Nectar Bee - SPARQL Query Analysis Example\n');

  // Initialize components
  const processor = new QueryProcessor();
  const differ = new QueryDiffer();
  const extractor = new NectarExtractor();

  // Example 1: Basic SPARQL Query Processing
  console.log('=== Example 1: Basic SPARQL Processing ===');
  
  const sparqlQuery = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name ?email 
    WHERE { 
      ?person foaf:name ?name ;
              foaf:mbox ?email 
    }
  `;

  try {
    const processed = processor.processSPARQL(sparqlQuery);
    console.log('Query Type:', processed.queryType);
    console.log('Variables:', processed.variables);
    console.log('Prefixes:', processed.prefixes);
  } catch (error) {
    console.error('Error processing SPARQL:', error);
  }

  console.log('\n=== Example 2: Query Comparison ===');

  // Example 2: Query Comparison
  const query1 = processor.processSPARQL('SELECT ?s ?p ?o WHERE { ?s ?p ?o }');
  const query2 = processor.processSPARQL('SELECT ?s ?p ?o WHERE { ?s ?p ?o . FILTER(?o > 100) }');

  const differences = differ.compare(query1, query2);
  console.log('Similarity:', differences.similarity.toFixed(2));
  console.log('Additions:', differences.additions);
  console.log('Deletions:', differences.deletions);

  // Example 3: Nectar Extraction
  console.log('\n=== Example 3: Nectar Extraction ===');
  
  const nectar = extractor.extractNectar(differences);
  console.log('Essential Parts:', nectar.essentialParts);
  console.log('Optimizations:', nectar.optimizations);
  console.log('Confidence:', nectar.confidence.toFixed(2));

  // Example 4: RSPQL Stream Processing
  console.log('\n=== Example 4: RSPQL Stream Processing ===');
  
  const rspqlQuery = `
    SELECT ?temp ?timestamp
    FROM STREAM <http://sensors.example.org/temperature> [TUMBLING WINDOW [30 SECONDS]]
    WHERE { 
      ?sensor :temperature ?temp ;
              :timestamp ?timestamp 
    }
  `;

  try {
    const streamQuery = processor.processRSPQL(rspqlQuery);
    console.log('Window Type:', streamQuery.windowType);
    console.log('Window Size:', streamQuery.windowSize, 'seconds');
    console.log('Stream URI:', streamQuery.streamUri);
    console.log('Variables:', streamQuery.variables);
  } catch (error) {
    console.error('Error processing RSPQL:', error);
  }

  // Example 5: Batch Analysis
  console.log('\n=== Example 5: Batch Query Analysis ===');
  
  const queries = [
    'SELECT ?s WHERE { ?s ?p ?o }',
    'SELECT ?s WHERE { ?s ?p ?o . FILTER(?s > 10) }',
    'SELECT ?s WHERE { ?s ?p ?o . FILTER(?s > 20) }'
  ];

  const processedQueries = queries.map(q => processor.processSPARQL(q));
  const allDifferences = [];

  for (let i = 0; i < processedQueries.length - 1; i++) {
    allDifferences.push(differ.compare(processedQueries[i], processedQueries[i + 1]));
  }

  const batchNectar = extractor.extractBatchNectar(allDifferences);
  console.log('Common Patterns:', batchNectar.essentialParts);
  console.log('Batch Optimizations:', batchNectar.optimizations);
  console.log('Average Confidence:', batchNectar.confidence.toFixed(2));

  console.log('\n🎉 Analysis complete!');
}

// Run the example if this file is executed directly
if (require.main === module) {
  main();
}