import {
  extractBasicGraphPatterns,
  buildMinusQuery,
  normalizeQuery,
  extractPrefixes,
  removePrefixes,
  isRSPQLQuery,
  extractStreamInfo,
  extractRSPQLBasicGraphPatterns,
  buildRSPQLMinusQuery,
  normalizeRSPQLQuery,
  extractVariables
} from '../utils/queryUtils';
import { QueryDiffOptions } from '../types';

export class QueryDiff {
    private subqueries: string[];
    private superQuery: string;
    private nectarQuery: string;
    private options: QueryDiffOptions;
    private isRSPQL: boolean;

    constructor(subqueries: string[], superQuery: string, options?: Partial<QueryDiffOptions>) {
        const detectedLanguage = isRSPQLQuery(superQuery) ? 'RSPQL' : 'SPARQL';

        this.options = {
          queryLanguage: detectedLanguage,
          preservePrefixes: true,
          normalizePatterns: true,
          includeWindowAnalysis: true,
          ...options
        };

        this.isRSPQL = this.options.queryLanguage === 'RSPQL';

        if (this.isRSPQL) {
          this.subqueries = subqueries.map(query => normalizeRSPQLQuery(query));
          this.superQuery = normalizeRSPQLQuery(superQuery);
        } else {
          this.subqueries = subqueries.map(query => normalizeQuery(query));
          this.superQuery = normalizeQuery(superQuery);
        }

        this.nectarQuery = "";
    }

    public generateNectarQuery(): string {
        if (this.subqueries.length === 0) {
            this.nectarQuery = this.superQuery;
            return this.nectarQuery;
        }

        const analysis = this.analyzeDifference();
        
        if (analysis.uniqueToSuper.length === 0) {
            // All patterns are covered by subqueries, return empty result
            this.nectarQuery = this.superQuery.replace(/WHERE\s*\{[^}]*\}/, 'WHERE { FILTER(false) }');
            return this.nectarQuery;
        }

        // Generate query that selects only the missing variables
        const superPrefixes = this.options.preservePrefixes ? extractPrefixes(this.superQuery) : {};
        
        // Extract variables from unique patterns
        const uniqueVars = new Set<string>();
        analysis.uniqueToSuper.forEach(pattern => {
            const vars = extractVariables(pattern);
            vars.forEach(v => uniqueVars.add(v));
        });
        
        // Always include the key variable (assuming ?sensor is the key)
        const keyVar = 'sensor'; // This could be made configurable
        uniqueVars.add(keyVar);
        
        const selectVars = Array.from(uniqueVars).map((v: string) => `?${v}`).join(' ');
        const selectClause = `SELECT ${selectVars}`;
        
        // Build WHERE clause with common patterns + unique patterns
        const allPatterns = [...analysis.commonPatterns, ...analysis.uniqueToSuper];
        const whereClause = allPatterns.join(' . ');
        const whereBlock = `WHERE { ${whereClause} }`;
        
        // Build prefix section
        let prefixSection = '';
        if (this.options.preservePrefixes && Object.keys(superPrefixes).length > 0) {
            prefixSection = Object.entries(superPrefixes)
                .map(([prefix, uri]) => {
                    const prefixName = prefix === '' ? '' : prefix;
                    return `PREFIX ${prefixName}: <${uri}>`;
                })
                .join('\n') + '\n\n';
        }

        this.nectarQuery = prefixSection + selectClause + '\n' + whereBlock;
        return this.nectarQuery;
    }

    private extractSubqueryPatterns(): string[] {
        const allPatterns: string[] = [];

        for (const subquery of this.subqueries) {
            const patterns = this.isRSPQL
              ? extractRSPQLBasicGraphPatterns(subquery)
              : extractBasicGraphPatterns(subquery);
            allPatterns.push(...patterns);
        }

        return [...new Set(allPatterns)].filter(pattern => pattern.trim().length > 0);
    }

    public generateAdvancedNectarQuery(): string {
        if (this.subqueries.length === 0) {
            this.nectarQuery = this.options.preservePrefixes ? this.superQuery : removePrefixes(this.superQuery);
            return this.nectarQuery;
        }

        const superQueryPrefixes = this.options.preservePrefixes ? extractPrefixes(this.superQuery) : {};

        const superQueryBody = removePrefixes(this.superQuery);

        const minusPatterns = this.extractSubqueryPatterns();

        if (minusPatterns.length === 0) {
            this.nectarQuery = this.options.preservePrefixes ? this.superQuery : superQueryBody;
            return this.nectarQuery;
        }

        let prefixSection = '';
        if (this.options.preservePrefixes && Object.keys(superQueryPrefixes).length > 0) {
            prefixSection = Object.entries(superQueryPrefixes)
                .map(([prefix, uri]) => {
                    const prefixName = prefix === '' ? '' : prefix;
                    return `PREFIX ${prefixName}: <${uri}>`;
                })
                .join('\n') + '\n\n';
        }

        const queryWithMinus = this.isRSPQL
          ? buildRSPQLMinusQuery(superQueryBody, minusPatterns)
          : buildMinusQuery(superQueryBody, minusPatterns);

        this.nectarQuery = prefixSection + queryWithMinus;

        return this.nectarQuery;
    }

    public analyzeDifference(): {
        superQueryPatterns: string[];
        subqueryPatterns: string[];
        commonPatterns: string[];
        uniqueToSuper: string[];
        uniqueToSub: string[];
        streamAnalysis?: {
          superStreamInfo: any;
          subqueriesStreamInfo: any[];
          rangeStepCompatibility: boolean;
        };
    } {
        const superPatterns = this.isRSPQL
          ? extractRSPQLBasicGraphPatterns(this.superQuery)
          : extractBasicGraphPatterns(this.superQuery);
        const subPatterns = this.extractSubqueryPatterns();

        const commonPatterns = superPatterns.filter(pattern =>
            subPatterns.some(subPattern => this.patternsMatch(pattern, subPattern))
        );

        const uniqueToSuper = superPatterns.filter(pattern =>
            !subPatterns.some(subPattern => this.patternsMatch(pattern, subPattern))
        );

        const uniqueToSub = subPatterns.filter(pattern =>
            !superPatterns.some(superPattern => this.patternsMatch(pattern, superPattern))
        );

        const result: any = {
            superQueryPatterns: superPatterns,
            subqueryPatterns: subPatterns,
            commonPatterns,
            uniqueToSuper,
            uniqueToSub
        };

        if (this.isRSPQL && this.options.includeWindowAnalysis) {
          const superStreamInfo = extractStreamInfo(this.superQuery);
          const subqueriesStreamInfo = this.subqueries.map(sq => extractStreamInfo(sq));

          const rangeStepCompatibility = subqueriesStreamInfo.every(subInfo =>
            subInfo.windowRange === superStreamInfo.windowRange &&
            subInfo.windowStep === superStreamInfo.windowStep
          );

          result.streamAnalysis = {
            superStreamInfo,
            subqueriesStreamInfo,
            rangeStepCompatibility
          };
        }

        return result;
    }

    private patternsMatch(pattern1: string, pattern2: string): boolean {
        const normalizer = this.isRSPQL ? normalizeRSPQLQuery : normalizeQuery;
        return normalizer(pattern1) === normalizer(pattern2);
    }

    public setQueryLanguage(language: 'SPARQL' | 'RSPQL'): void {
        this.options.queryLanguage = language;
        this.isRSPQL = language === 'RSPQL';

        if (this.isRSPQL) {
          this.subqueries = this.subqueries.map(query => normalizeRSPQLQuery(query));
          this.superQuery = normalizeRSPQLQuery(this.superQuery);
        } else {
          this.subqueries = this.subqueries.map(query => normalizeQuery(query));
          this.superQuery = normalizeQuery(this.superQuery);
        }
    }

    public getQueryLanguage(): 'SPARQL' | 'RSPQL' {
        return this.options.queryLanguage;
    }

    public isRSPQLMode(): boolean {
        return this.isRSPQL;
    }

    public setNectarQuery(query: string): void {
        this.nectarQuery = this.isRSPQL ? normalizeRSPQLQuery(query) : normalizeQuery(query);
    }

    public getSubqueries(): string[] {
        return this.subqueries;
    }

    public getSuperQuery(): string {
        return this.superQuery;
    }

    public getNectarQuery(): string {
        return this.nectarQuery;
    }

    public getOptions(): QueryDiffOptions {
        return { ...this.options };
    }

    public getMinusPatterns(): string[] {
        return this.extractSubqueryPatterns();
    }
}