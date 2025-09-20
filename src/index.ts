export { QueryDiff } from './lib/QueryDiff';

export {
  normalizeQuery,
  extractPrefixes,
  isValidSPARQL,
  extractBasicGraphPatterns,
  extractVariables,
  removePrefixes,
  buildMinusQuery,
  isRSPQLQuery,
  extractStreamInfo,
  extractRSPQLBasicGraphPatterns,
  buildRSPQLMinusQuery,
  normalizeRSPQLQuery
} from './utils/queryUtils';

export type {
  ProcessedQuery,
  RSPQLQuery,
  QueryDiffOptions,
  QueryDifference,
  NectarResult,
  BatchNectarResult
} from './types';

export { QueryDiff as default } from './lib/QueryDiff';
