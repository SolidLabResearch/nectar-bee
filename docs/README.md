# Documentation

This directory contains all documentation, analysis reports, data files, and generated visualizations for the nectar-bee project.

## Directory Structure

```
docs/
├── analysis/          # Analysis reports and summaries
│   ├── COMPREHENSIVE_PERFORMANCE_ANALYSIS.md
│   ├── MEMORY_ANALYSIS.md
│   ├── PERFORMANCE_ANALYSIS.md
│   ├── RESOURCE_COMPARISON_ANALYSIS.md
│   └── performance_summary.txt
├── data/              # Raw experimental data (CSV files)
│   ├── sparql_comprehensive_performance.csv
│   ├── sparql_performance_results.csv
│   └── sparql_realistic_performance.csv
└── images/            # Generated plots and visualizations
    ├── comprehensive_sparql_analysis.png
    ├── memory_usage_analysis.png
    ├── performance_comparison.png
    └── resource_usage_comparison.png
```

## Key Analysis Files

### Performance Analysis Reports
- **`RESOURCE_COMPARISON_ANALYSIS.md`** - Complete comparison of latency, memory, and CPU usage between Super Query vs Parallel+Join approaches
- **`COMPREHENSIVE_PERFORMANCE_ANALYSIS.md`** - Detailed technical analysis of SPARQL performance experiments
- **`MEMORY_ANALYSIS.md`** - Memory usage analysis for Super Query approach
- **`PERFORMANCE_ANALYSIS.md`** - Initial performance comparison analysis

### Data Files
- **`sparql_comprehensive_performance.csv`** - Raw data from 35-run comprehensive performance experiment
- **`sparql_performance_results.csv`** - Performance comparison data
- **`sparql_realistic_performance.csv`** - Realistic sensor data performance results

### Visualizations
All PNG files contain statistical plots and analysis visualizations generated from the experimental data.

## Running Analysis Scripts

The Python plotting scripts are located in `scripts/analysis/`. To regenerate plots:

```bash
cd scripts/analysis
python3 plot_resource_comparison.py  # Main resource comparison
python3 plot_comprehensive_results.py  # Comprehensive analysis plots
```

## Key Findings Summary

The analysis demonstrates that the **Parallel+Join approach** provides:
- **7.2x faster execution** (32.02ms → 4.44ms)
- **76% less memory usage** (4.56MB → 1.10MB)
- **86% less CPU usage** (46.48ms → 6.34ms)
- **Identical result accuracy** (20 records, 100% consistency)

See `RESOURCE_COMPARISON_ANALYSIS.md` for complete details.</content>
<parameter name="filePath">/Users/kushbisen/Code/nectar-bee/docs/README.md
