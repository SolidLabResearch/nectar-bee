# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added
- Initial release of nectar-bee TypeScript library
- QueryProcessor for SPARQL and RSPQL query analysis
- QueryDiffer for comparing queries and finding differences
- NectarExtractor for identifying essential query parts and optimizations
- Full TypeScript support with comprehensive type definitions
- Jest test suite with unit and integration tests
- ESLint configuration for code quality
- Comprehensive documentation and examples
- Support for RSPQL streaming queries with window operations
- Batch processing capabilities for multiple query comparisons

### Features
- Parse and analyze SPARQL queries (SELECT, CONSTRUCT, ASK, DESCRIBE)
- Extract prefixes, variables, and query types
- Process RSPQL queries with window and stream information
- Compare queries to find additions, deletions, and modifications
- Calculate similarity scores between queries
- Extract essential differences and suggest optimizations
- Batch analysis of multiple query sets
- TypeScript declarations for excellent IDE support

### Development
- Complete TypeScript project template
- Jest testing framework configuration
- ESLint with TypeScript support
- npm scripts for building, testing, and linting
- Comprehensive folder structure
- Example usage scripts
- Continuous integration ready