import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Read the data
df = pd.read_csv('sparql_performance_results.csv')

# Create subplots
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle('SPARQL Performance Comparison: Super Query vs Parallel Subqueries (10 Runs)', fontsize=16)

# 1. Execution Time Comparison
ax1.plot(df['iteration'], df['super_time'], 'o-', label='Super Query', color='red', linewidth=2)
ax1.plot(df['iteration'], df['parallel_total_time'], 's-', label='Parallel + Combination', color='blue', linewidth=2)
ax1.plot(df['iteration'], df['parallel_query_time'], '^-', label='Parallel Query Only', color='green', linewidth=2, alpha=0.7)
ax1.set_xlabel('Iteration')
ax1.set_ylabel('Execution Time (ms)')
ax1.set_title('Execution Time Comparison')
ax1.legend()
ax1.grid(True, alpha=0.3)

# 2. Memory Usage
ax2.bar(df['iteration'] - 0.2, df['super_memory'], 0.4, label='Super Query', color='red', alpha=0.7)
ax2.set_xlabel('Iteration')
ax2.set_ylabel('Memory Usage (MB)')
ax2.set_title('Memory Usage (Super Query Only)')
ax2.legend()
ax2.grid(True, alpha=0.3)

# 3. CPU Usage
ax3.plot(df['iteration'], df['super_cpu'], 'o-', label='Super Query CPU', color='red', linewidth=2)
ax3.set_xlabel('Iteration')
ax3.set_ylabel('CPU Time (ms)')
ax3.set_title('CPU Usage (Super Query)')
ax3.legend()
ax3.grid(True, alpha=0.3)

# 4. Performance Improvement
improvement = ((df['super_time'] - df['parallel_total_time']) / df['super_time']) * 100
ax4.bar(df['iteration'], improvement, color='green', alpha=0.7)
ax4.set_xlabel('Iteration')
ax4.set_ylabel('Performance Improvement (%)')
ax4.set_title('Parallel Approach Performance Improvement')
ax4.grid(True, alpha=0.3)
ax4.axhline(y=0, color='black', linestyle='-', alpha=0.5)

plt.tight_layout()
plt.savefig('sparql_performance_comparison.png', dpi=300, bbox_inches='tight')
plt.show()

# Print statistics
print("\n=== PERFORMANCE STATISTICS ===")
print(f"Average Super Query Time: {df['super_time'].mean():.2f}ms ± {df['super_time'].std():.2f}ms")
print(f"Average Parallel Total Time: {df['parallel_total_time'].mean():.2f}ms ± {df['parallel_total_time'].std():.2f}ms")
print(f"Average Performance Improvement: {improvement.mean():.1f}% ± {improvement.std():.1f}%")
print(f"Average Memory Usage: {df['super_memory'].mean():.2f}MB ± {df['super_memory'].std():.2f}MB")
print(f"Average CPU Usage: {df['super_cpu'].mean():.2f}ms ± {df['super_cpu'].std():.2f}ms")

# Speed ratio
speed_ratio = df['super_time'] / df['parallel_total_time']
print(f"\nParallel approach is {speed_ratio.mean():.1f}x faster on average")
