import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Read the data
df = pd.read_csv('sparql_realistic_performance.csv')

# Create subplots
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
fig.suptitle('SPARQL Performance: Super Query vs Sequential vs Parallel (Cache-Cleared)', fontsize=16)

# 1. Execution Time Comparison
ax1.plot(df['iteration'], df['super_time'], 'o-', label='Super Query', color='red', linewidth=2, markersize=8)
ax1.plot(df['iteration'], df['seq_final_time'], 's-', label='Sequential + Combination', color='blue', linewidth=2, markersize=8)
ax1.plot(df['iteration'], df['par_total_time'], '^-', label='Parallel + Combination', color='green', linewidth=2, markersize=8)
ax1.set_xlabel('Iteration')
ax1.set_ylabel('Total Execution Time (ms)')
ax1.set_title('Total Execution Time Comparison')
ax1.legend()
ax1.grid(True, alpha=0.3)

# 2. Query-only execution time breakdown
width = 0.25
x = df['iteration']
ax2.bar(x - width, df['super_time'], width, label='Super Query', color='red', alpha=0.7)
ax2.bar(x, df['seq_total_time'], width, label='Sequential Queries', color='blue', alpha=0.7)
ax2.bar(x + width, df['par_query_time'], width, label='Parallel Queries', color='green', alpha=0.7)
ax2.set_xlabel('Iteration')
ax2.set_ylabel('Query Execution Time (ms)')
ax2.set_title('Query Execution Time Only (No Combination)')
ax2.legend()
ax2.grid(True, alpha=0.3)

# 3. Memory Usage
ax3.bar(df['iteration'], df['super_memory'], color='red', alpha=0.7, label='Super Query Memory')
ax3.set_xlabel('Iteration')
ax3.set_ylabel('Memory Usage (MB)')
ax3.set_title('Memory Usage (Super Query)')
ax3.legend()
ax3.grid(True, alpha=0.3)

# 4. Performance Ratios
seq_ratio = df['super_time'] / df['seq_final_time']
par_ratio = df['super_time'] / df['par_total_time']
ax4.plot(df['iteration'], seq_ratio, 'o-', label='Super vs Sequential', color='blue', linewidth=2, markersize=8)
ax4.plot(df['iteration'], par_ratio, 's-', label='Super vs Parallel', color='green', linewidth=2, markersize=8)
ax4.axhline(y=1, color='red', linestyle='--', alpha=0.7, label='Equal Performance')
ax4.set_xlabel('Iteration')
ax4.set_ylabel('Speed Ratio (Super Time / Approach Time)')
ax4.set_title('Performance Ratios (>1 means approach is faster)')
ax4.legend()
ax4.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('sparql_performance_detailed.png', dpi=300, bbox_inches='tight')
plt.show()

# Print detailed statistics
print("\n=== DETAILED PERFORMANCE ANALYSIS ===")
print(f"Super Query Average: {df['super_time'].mean():.2f}ms ± {df['super_time'].std():.2f}ms")
print(f"Sequential Total Average: {df['seq_final_time'].mean():.2f}ms ± {df['seq_final_time'].std():.2f}ms")
print(f"Parallel Total Average: {df['par_total_time'].mean():.2f}ms ± {df['par_total_time'].std():.2f}ms")
print()
print(f"Sequential Queries Only: {df['seq_total_time'].mean():.2f}ms ± {df['seq_total_time'].std():.2f}ms")
print(f"Parallel Queries Only: {df['par_query_time'].mean():.2f}ms ± {df['par_query_time'].std():.2f}ms")
print()
print(f"Sequential Speedup vs Super: {seq_ratio.mean():.2f}x")
print(f"Parallel Speedup vs Super: {par_ratio.mean():.2f}x")
print()
print(f"Parallel vs Sequential Speedup: {(df['seq_final_time'] / df['par_total_time']).mean():.2f}x")

# Detailed breakdown
print("\n=== OVERHEAD ANALYSIS ===")
seq_overhead = df['seq_combination_time'] / df['seq_final_time'] * 100
par_overhead = df['par_combination_time'] / df['par_total_time'] * 100
print(f"Sequential Combination Overhead: {seq_overhead.mean():.1f}% ± {seq_overhead.std():.1f}%")
print(f"Parallel Combination Overhead: {par_overhead.mean():.1f}% ± {par_overhead.std():.1f}%")
