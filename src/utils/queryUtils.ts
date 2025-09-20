export function normalizeQuery(query: string): string {
  return query
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractPrefixes(query: string): Record<string, string> {
  const prefixes: Record<string, string> = {};
  const prefixRegex = /PREFIX\s+([^:\s]*?):\s*<([^>]+)>/gi;
  let match;

  while ((match = prefixRegex.exec(query)) !== null) {
    const prefixName = match[1].trim() || '';
    prefixes[prefixName] = match[2];
  }

  return prefixes;
}

export function isValidSPARQL(query: string): boolean {
  if (!query || query.trim().length === 0) {
    return false;
  }

  const normalizedQuery = query.trim().toUpperCase();
  const validTypes = ['SELECT', 'CONSTRUCT', 'ASK', 'DESCRIBE'];

  return validTypes.some(type => normalizedQuery.startsWith(type));
}

export function extractBasicGraphPatterns(query: string): string[] {
  const patterns: string[] = [];

  const whereMatch = query.match(/WHERE\s*\{([^}]*)\}/i);
  if (!whereMatch) {
    return patterns;
  }

  const whereClause = whereMatch[1].trim();

  const triplePatterns = whereClause
    .split(/[.;]/)
    .map(pattern => pattern.trim())
    .filter(pattern => pattern.length > 0 && !pattern.match(/^\s*FILTER/i));

  return triplePatterns;
}

export function extractVariables(query: string): string[] {
  const variables: string[] = [];
  const variableRegex = /\?(\w+)/g;
  let match;

  while ((match = variableRegex.exec(query)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

export function removePrefixes(query: string): string {
  return query.replace(/PREFIX\s+[^:]*:\s*<[^>]+>\s*/gi, '').trim();
}

export function buildMinusQuery(superQuery: string, minusPatterns: string[]): string {
  if (minusPatterns.length === 0) {
    return superQuery;
  }

  const whereMatch = superQuery.match(/(.*WHERE\s*\{)([^}]*)\}(.*)/is);
  if (!whereMatch) {
    return superQuery;
  }

  const [, beforeWhere, whereClause, afterWhere] = whereMatch;

  const minusClause = minusPatterns
    .map(pattern => `  MINUS { ${pattern} }`)
    .join('\n');

  return `${beforeWhere}${whereClause.trim()}\n${minusClause}\n}${afterWhere}`;
}

export function isRSPQLQuery(query: string): boolean {
  const streamKeywords = [
    'REGISTER RSTREAM',
    'FROM NAMED WINDOW',
    'ON STREAM',
    'RANGE',
    'STEP',
    'WINDOW :'
  ];

  const normalizedQuery = query.toUpperCase();
  return streamKeywords.some(keyword => normalizedQuery.includes(keyword));
}

export function extractStreamInfo(query: string): {
  streamSources: string[];
  windowType: 'SLIDING';
  windowRange: number;
  windowStep: number;
  namedWindows: Record<string, string>;
  outputStream?: string;
} {
  const streamSources: string[] = [];
  const namedWindows: Record<string, string> = {};
  let windowRange = 10;
  let windowStep = 2;
  let outputStream: string | undefined;

  const outputMatch = query.match(/REGISTER\s+RSTREAM\s+<([^>]+)>/i);
  if (outputMatch) {
    outputStream = outputMatch[1];
  }

  const namedWindowMatch = query.match(/FROM\s+NAMED\s+WINDOW\s+:(\w+)\s+ON\s+STREAM\s+:(\w+)/i);
  if (namedWindowMatch) {
    const windowName = namedWindowMatch[1];
    const streamName = namedWindowMatch[2];
    namedWindows[windowName] = streamName;
    streamSources.push(streamName);
  }

  const rangeStepMatch = query.match(/\[RANGE\s+(\d+)\s+STEP\s+(\d+)\]/i);
  if (rangeStepMatch) {
    windowRange = parseInt(rangeStepMatch[1]);
    windowStep = parseInt(rangeStepMatch[2]);
  }

  return {
    streamSources,
    windowType: 'SLIDING',
    windowRange,
    windowStep,
    namedWindows,
    outputStream
  };
}

export function extractRSPQLBasicGraphPatterns(query: string): string[] {
  const patterns: string[] = [];

  const windowMatch = query.match(/WHERE\s*\{\s*WINDOW\s+:(\w+)\s*\{\s*([^}]*)\s*\}\s*\}/i);
  if (!windowMatch) {
    const whereMatch = query.match(/WHERE\s*\{([^}]*)\}/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      const triplePatterns = whereClause
        .split(/[.;]/)
        .map(pattern => pattern.trim())
        .filter(pattern => pattern.length > 0 && !pattern.match(/^\s*FILTER/i));
      return triplePatterns;
    }
    return patterns;
  }

  const windowClause = windowMatch[2].trim();

  const triplePatterns = windowClause
    .split(/[.;]/)
    .map(pattern => pattern.trim())
    .filter(pattern => pattern.length > 0 && !pattern.match(/^\s*FILTER/i));

  return triplePatterns;
}

export function buildRSPQLMinusQuery(superQuery: string, minusPatterns: string[]): string {
  if (minusPatterns.length === 0) {
    return superQuery;
  }

  const rspqlMatch = superQuery.match(/(.*?REGISTER\s+RSTREAM\s+<[^>]+>\s+AS\s+SELECT[^F]*)(FROM\s+NAMED\s+WINDOW[^W]*)(WHERE\s*\{\s*WINDOW\s+:[^{]*\{)([^}]*)\}(\s*\}.*)/is);

  if (!rspqlMatch) {
    return buildMinusQuery(superQuery, minusPatterns);
  }

  const [, beforeFrom, fromClause, beforeWindow, windowClause, afterWindow] = rspqlMatch;

  const minusClause = minusPatterns
    .map(pattern => `    MINUS { ${pattern} }`)
    .join('\n');

  return `${beforeFrom}${fromClause}${beforeWindow}${windowClause.trim()}\n${minusClause}\n}${afterWindow}`;
}

export function normalizeRSPQLQuery(query: string): string {
  return query
    .replace(/\s+/g, ' ')
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/RANGE\s+/g, 'RANGE ')
    .replace(/STEP\s+/g, 'STEP ')
    .trim();
}
