# nectar-bee

Distilling the difference to find the nectar for SPARQL-RSPQL queries.

A TypeScript library for analyzing and comparing SPARQL and RSPQL queries to extract essential differences and optimization opportunities.

## Features

- **Query Processing**: Parse and analyze SPARQL and RSPQL queries
- **Query Comparison**: Find differences between similar queries
- **Nectar Extraction**: Identify essential query parts and optimization opportunities
- **Stream Support**: Handle RSPQL streaming queries with window operations
- **TypeScript**: Full TypeScript support with type definitions

## Installation

```bash
npm install nectar-bee
```

## Quick Start

```typescript
import { QueryProcessor, QueryDiffer, NectarExtractor } from 'nectar-bee';

// Initialize components
const processor = new QueryProcessor();
const differ = new QueryDiffer();
const extractor = new NectarExtractor();

// Process SPARQL queries
const query1 = processor.processSPARQL('SELECT ?s ?p ?o WHERE { ?s ?p ?o }');
const query2 = processor.processSPARQL('SELECT ?s ?p ?o WHERE { ?s ?p ?o . FILTER(?o > 100) }');

// Find differences
const differences = differ.compare(query1, query2);

// Extract nectar (essential parts)
const nectar = extractor.extractNectar(differences);

console.log('Essential parts:', nectar.essentialParts);
console.log('Optimizations:', nectar.optimizations);
console.log('Confidence:', nectar.confidence);
```

## RSPQL Stream Queries

```typescript
// Process RSPQL with streaming features
const streamQuery = processor.processRSPQL(`
  SELECT ?temp 
  FROM STREAM <http://example.org/temperature> [TUMBLING WINDOW [10 SECONDS]]
  WHERE { ?sensor :temperature ?temp }
`);

console.log('Window type:', streamQuery.windowType);
console.log('Window size:', streamQuery.windowSize);
console.log('Stream URI:', streamQuery.streamUri);
```

## API Reference

### QueryProcessor

- `processSPARQL(queryString: string): SPARQLQuery` - Process a SPARQL query
- `processRSPQL(queryString: string): RSPQLQuery` - Process an RSPQL query

### QueryDiffer

- `compare(query1: SPARQLQuery, query2: SPARQLQuery): QueryDifference` - Compare two SPARQL queries
- `compareRSPQL(query1: RSPQLQuery, query2: RSPQLQuery): QueryDifference` - Compare two RSPQL queries

### NectarExtractor

- `extractNectar(difference: QueryDifference): NectarResult` - Extract nectar from differences
- `extractBatchNectar(differences: QueryDifference[]): NectarResult` - Extract nectar from multiple differences

## Development

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/SolidLabResearch/nectar-bee.git
cd nectar-bee

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Run tests with coverage
npm run test:coverage
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Compile in watch mode
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and auto-fix issues
- `npm run clean` - Clean build directory
- `npm run dev` - Run development server
- `npm start` - Run compiled application

### Project Structure

```
src/
├── lib/              # Core library classes
│   ├── QueryProcessor.ts    # SPARQL/RSPQL query processing
│   ├── QueryDiffer.ts       # Query comparison logic
│   └── NectarExtractor.ts   # Nectar extraction algorithms
├── types/            # TypeScript type definitions
│   └── Query.ts      # Query-related interfaces
├── utils/            # Utility functions
│   ├── queryUtils.ts # Query processing utilities
│   └── index.ts      # Utility exports
└── index.ts          # Main entry point

tests/
├── unit/             # Unit tests
│   ├── QueryProcessor.test.ts
│   └── queryUtils.test.ts
└── integration/      # Integration tests
    └── workflow.test.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests for your changes
5. Run the test suite: `npm test`
6. Run the linter: `npm run lint`
7. Commit your changes: `git commit -am 'Add feature'`
8. Push to the branch: `git push origin feature-name`
9. Submit a pull request

## License

ISC

## Support

For questions and support, please open an issue on the GitHub repository.