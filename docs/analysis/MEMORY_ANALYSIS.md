# Memory Usage Analysis: Super Query Performance

## Memory Usage Results Summary

| Metric | Value |
|--------|-------|
| **Average Memory Usage** | 8.60 MB |
| **Standard Deviation** | 0.33 MB |
| **Min Memory Usage** | 8.17 MB |
| **Max Memory Usage** | 9.78 MB |
| **Median Memory Usage** | 8.58 MB |
| **Coefficient of Variation** | 3.8% |
| **Memory-Time Correlation** | r = 0.286 (weak) |

## Detailed Memory Usage by Iteration

| Iteration | Memory Usage (MB) | CPU Usage (ms) | Execution Time (ms) |
|-----------|-------------------|----------------|---------------------|
| 4         | 9.78              | 158.72         | 46.31               |
| 5         | 8.71              | 126.42         | 42.29               |
| 6         | 8.98              | 143.02         | 43.78               |
| 7         | 8.77              | 146.06         | 45.43               |
| 8         | 8.74              | 137.23         | 43.80               |
| 9         | 8.61              | 131.06         | 44.37               |
| 10        | 9.02              | 152.76         | 47.03               |
| 11        | 9.02              | 158.73         | 48.37               |
| 12        | 8.58              | 136.95         | 45.34               |
| 13        | 8.46              | 137.98         | 45.61               |
| 14        | 8.67              | 146.36         | 47.01               |
| 15        | 8.59              | 153.70         | 47.02               |
| 16        | 8.41              | 141.05         | 45.96               |
| 17        | 8.58              | 134.16         | 44.03               |
| 18        | 9.04              | 141.37         | 44.80               |
| 19        | 8.35              | 155.57         | 44.47               |
| 20        | 8.54              | 139.47         | 44.88               |
| 21        | 8.17              | 139.01         | 42.97               |
| 22        | 8.30              | 143.53         | 45.52               |
| 23        | 8.46              | 152.07         | 45.43               |
| 24        | 8.32              | 146.50         | 44.61               |
| 25        | 8.42              | 140.06         | 44.18               |
| 26        | 8.35              | 146.54         | 44.63               |
| 27        | 8.39              | 151.84         | 44.97               |
| 28        | 8.34              | 137.36         | 45.45               |
| 29        | 8.45              | 132.73         | 42.88               |
| 30        | 8.35              | 149.19         | 45.83               |
| 31        | 8.39              | 152.01         | 46.43               |
| 32        | 8.35              | 142.11         | 46.13               |
| 33        | 8.81              | 142.89         | 47.01               |

## Memory Usage Analysis

### Statistical Insights
- **Very Consistent Memory Usage**: Coefficient of variation of 3.8% indicates low variability
- **Weak Correlation with Execution Time**: r = 0.286 suggests memory usage is relatively independent of query execution time
- **Memory Range**: 8.17 MB to 9.78 MB across all iterations
- **Median Usage**: 8.58 MB, close to the mean of 8.60 MB

### Memory Efficiency Assessment
- **Low Variability**: CV < 10% indicates very consistent memory consumption
- **Stable Performance**: Memory usage remains stable across different query executions
- **Resource Efficiency**: Relatively low memory footprint for SPARQL query processing

### Correlation Analysis
- **Memory vs Time**: Weak positive correlation (r = 0.286)
- **Memory vs CPU**: Moderate correlation expected (higher CPU usage may require more memory)
- **Overall Stability**: Memory usage shows good stability across the experiment

---

*Memory analysis based on 30 filtered iterations (excluding warmup/cooldown runs)*  
*Data collected from Super Query performance measurements*
