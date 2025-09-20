# Scripts

This directory contains utility scripts for analysis, plotting, and automation.

## Directory Structure

```
scripts/
└── analysis/          # Data analysis and plotting scripts
    ├── plot_comprehensive_results.py
    ├── plot_cpu_analysis.py
    ├── plot_memory_analysis.py
    ├── plot_performance_comparison.py
    ├── plot_realistic_results.py
    ├── plot_resource_comparison.py
    └── plot_results.py
```

## Analysis Scripts

All scripts generate statistical plots and analysis from experimental data. They automatically read data from `docs/data/` and save plots to `docs/images/`.

### Main Scripts

- **`plot_resource_comparison.py`** - Comprehensive comparison of latency, memory, and CPU usage
- **`plot_comprehensive_results.py`** - Full statistical analysis with multiple plot types

### Specialized Scripts

- **`plot_memory_analysis.py`** - Memory usage analysis and correlation plots
- **`plot_cpu_analysis.py`** - CPU usage analysis and patterns
- **`plot_performance_comparison.py`** - Basic performance comparison plots

## Usage

```bash
# Run from project root
python3 scripts/analysis/plot_resource_comparison.py

# Or from scripts directory
cd scripts/analysis
python3 plot_resource_comparison.py
```

## Dependencies

Requires Python 3 with:
- pandas
- matplotlib
- seaborn
- scipy
- numpy

## Output

Scripts generate:
- PNG plot images (saved to `docs/images/`)
- Statistical analysis output (printed to console)
- CSV data summaries (if applicable)</content>
<parameter name="filePath">/Users/kushbisen/Code/nectar-bee/scripts/README.md
