import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from scipy import stats

# Set style for better-looking plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

# Read the data
df = pd.read_csv('../../docs/data/sparql_comprehensive_performance.csv')

# Extract metrics
super_times = df['super_time']
super_memory = df['super_memory']
super_cpu = df['super_cpu']
parallel_times = df['par_total_time']
parallel_memory = df['par_memory']
parallel_cpu = df['par_cpu']
iterations = df['iteration']

print("=== COMPREHENSIVE RESOURCE USAGE ANALYSIS ===")
print(f"Analyzed {len(df)} experimental runs")
print()

# Create comprehensive figure with resource usage focus
fig = plt.figure(figsize=(20, 12))
gs = fig.add_gridspec(3, 4, hspace=0.3, wspace=0.3)

# 1. Latency comparison (time series)
ax1 = fig.add_subplot(gs[0, :2])
ax1.plot(iterations, super_times, 'o-', color='blue', linewidth=2, label='Super Query')
ax1.plot(iterations, parallel_times, 's-', color='red', linewidth=2, label='Parallel+Join')
ax1.fill_between(iterations, super_times.mean() - super_times.std(),
                super_times.mean() + super_times.std(), alpha=0.2, color='blue')
ax1.fill_between(iterations, parallel_times.mean() - parallel_times.std(),
                parallel_times.mean() + parallel_times.std(), alpha=0.2, color='red')
ax1.set_xlabel('Iteration')
ax1.set_ylabel('Execution Time (ms)')
ax1.set_title(f'Latency Comparison\\nSuper: {super_times.mean():.1f}±{super_times.std():.1f}ms | Parallel: {parallel_times.mean():.1f}±{parallel_times.std():.1f}ms')
ax1.legend()
ax1.grid(True, alpha=0.3)

# 2. Memory usage comparison (absolute values, filtering out extreme negatives)
ax2 = fig.add_subplot(gs[0, 2:])
# Filter out extreme negative memory values for parallel (likely GC artifacts)
valid_parallel_memory = parallel_memory[parallel_memory > parallel_memory.quantile(0.1)]
ax2.plot(iterations[:len(valid_parallel_memory)], super_memory[:len(valid_parallel_memory)],
         'o-', color='purple', linewidth=2, label='Super Query')
ax2.plot(iterations[:len(valid_parallel_memory)], valid_parallel_memory,
         's-', color='darkviolet', linewidth=2, label='Parallel+Join (filtered)')
ax2.fill_between(iterations[:len(valid_parallel_memory)],
                super_memory[:len(valid_parallel_memory)].mean() - super_memory[:len(valid_parallel_memory)].std(),
                super_memory[:len(valid_parallel_memory)].mean() + super_memory[:len(valid_parallel_memory)].std(),
                alpha=0.2, color='purple')
ax2.fill_between(iterations[:len(valid_parallel_memory)],
                valid_parallel_memory.mean() - valid_parallel_memory.std(),
                valid_parallel_memory.mean() + valid_parallel_memory.std(),
                alpha=0.2, color='darkviolet')
ax2.set_xlabel('Iteration')
ax2.set_ylabel('Memory Usage (MB)')
ax2.set_title(f'Memory Usage Comparison\\nSuper: {super_memory.mean():.2f}±{super_memory.std():.2f}MB\\nParallel: {valid_parallel_memory.mean():.2f}±{valid_parallel_memory.std():.2f}MB')
ax2.legend()
ax2.grid(True, alpha=0.3)

# 3. CPU usage comparison
ax3 = fig.add_subplot(gs[1, :2])
ax3.plot(iterations, super_cpu, 'o-', color='orange', linewidth=2, label='Super Query')
ax3.plot(iterations, parallel_cpu, 's-', color='darkorange', linewidth=2, label='Parallel+Join')
ax3.fill_between(iterations, super_cpu.mean() - super_cpu.std(),
                super_cpu.mean() + super_cpu.std(), alpha=0.2, color='orange')
ax3.fill_between(iterations, parallel_cpu.mean() - parallel_cpu.std(),
                parallel_cpu.mean() + parallel_cpu.std(), alpha=0.2, color='darkorange')
ax3.set_xlabel('Iteration')
ax3.set_ylabel('CPU Usage (ms)')
ax3.set_title(f'CPU Usage Comparison\\nSuper: {super_cpu.mean():.1f}±{super_cpu.std():.1f}ms | Parallel: {parallel_cpu.mean():.1f}±{parallel_cpu.std():.1f}ms')
ax3.legend()
ax3.grid(True, alpha=0.3)

# 4. Resource efficiency radar chart
ax4 = fig.add_subplot(gs[1, 2], projection='polar')

# Normalize metrics for radar chart (0-1 scale, lower is better for all metrics)
time_norm = 1 - (parallel_times.mean() / super_times.mean())  # Higher is better for efficiency
memory_norm = min(1, max(0, 1 - (abs(parallel_memory.mean()) / abs(super_memory.mean()))))  # Approximate
cpu_norm = 1 - (parallel_cpu.mean() / super_cpu.mean())  # Higher is better for efficiency

categories = ['Latency\\nEfficiency', 'Memory\\nEfficiency', 'CPU\\nEfficiency']
values = [time_norm, memory_norm, cpu_norm]

# Close the polygon
values += values[:1]
angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
angles += angles[:1]

ax4.plot(angles, values, 'o-', linewidth=2, label='Parallel+Join Efficiency', color='green')
ax4.fill(angles, values, alpha=0.25, color='green')
ax4.set_xticks(angles[:-1])
ax4.set_xticklabels(categories)
ax4.set_ylim(0, 1)
ax4.set_title('Resource Efficiency Comparison\\n(Higher = More Efficient)', size=10)
ax4.grid(True, alpha=0.3)

# 5. Correlation analysis: Time vs Memory
ax5 = fig.add_subplot(gs[2, 0])
super_corr = np.corrcoef(super_times, super_memory)[0, 1]
parallel_corr = np.corrcoef(parallel_times, parallel_memory)[0, 1]

ax5.scatter(super_times, super_memory, alpha=0.7, s=50, color='blue', label='Super Query')
ax5.scatter(parallel_times, parallel_memory, alpha=0.7, s=50, color='red', label='Parallel+Join')
ax5.set_xlabel('Execution Time (ms)')
ax5.set_ylabel('Memory Usage (MB)')
ax5.set_title(f'Resource Correlation Analysis\\nSuper r={super_corr:.3f} | Parallel r={parallel_corr:.3f}')
ax5.legend()
ax5.grid(True, alpha=0.3)

# 6. Performance summary table
ax6 = fig.add_subplot(gs[2, 1:])
ax6.axis('tight')
ax6.axis('off')

# Create summary statistics table
summary_data = [
    ['Metric', 'Super Query', 'Parallel+Join', 'Improvement'],
    ['Mean Time (ms)', f'{super_times.mean():.2f}', f'{parallel_times.mean():.2f}',
     f'{((super_times.mean() - parallel_times.mean())/super_times.mean()*100):.1f}% faster'],
    ['Mean Memory (MB)', f'{super_memory.mean():.2f}', f'{valid_parallel_memory.mean():.2f}*',
     f'{((super_memory.mean() - abs(valid_parallel_memory.mean()))/super_memory.mean()*100):.1f}% less'],
    ['Mean CPU (ms)', f'{super_cpu.mean():.2f}', f'{parallel_cpu.mean():.2f}',
     f'{((super_cpu.mean() - parallel_cpu.mean())/super_cpu.mean()*100):.1f}% less'],
    ['Std Dev Time', f'{super_times.std():.2f}', f'{parallel_times.std():.2f}', '-'],
    ['Std Dev Memory', f'{super_memory.std():.2f}', f'{valid_parallel_memory.std():.2f}', '-'],
    ['Std Dev CPU', f'{super_cpu.std():.2f}', f'{parallel_cpu.std():.2f}', '-'],
    ['Speedup Ratio', '-', f'{super_times.mean()/parallel_times.mean():.2f}x', '-']
]

table = ax6.table(cellText=summary_data, cellLoc='center', loc='center',
                 colWidths=[0.2, 0.2, 0.2, 0.4])
table.auto_set_font_size(False)
table.set_fontsize(9)
table.scale(1, 1.5)

# Style the header row
for i in range(len(summary_data[0])):
    table[(0, i)].set_facecolor('#4CAF50')
    table[(0, i)].set_text_props(weight='bold', color='white')

plt.suptitle('Comprehensive SPARQL Performance Analysis: Latency, Memory & CPU Comparison', fontsize=16, y=0.98)

plt.tight_layout()
plt.savefig('../../docs/images/resource_usage_comparison.png', dpi=300, bbox_inches='tight')
plt.show()

print("RESOURCE USAGE STATISTICS:")
print("=" * 50)
print(f"Latency: Super Query {super_times.mean():.2f}ms vs Parallel {parallel_times.mean():.2f}ms")
print(f"         Speedup: {super_times.mean()/parallel_times.mean():.2f}x faster")
print()
print(f"Memory:  Super Query {super_memory.mean():.2f}MB vs Parallel {valid_parallel_memory.mean():.2f}MB (filtered)")
print(f"         Reduction: {((super_memory.mean() - abs(valid_parallel_memory.mean()))/super_memory.mean()*100):.1f}%")
print()
print(f"CPU:     Super Query {super_cpu.mean():.2f}ms vs Parallel {parallel_cpu.mean():.2f}ms")
print(f"         Reduction: {((super_cpu.mean() - parallel_cpu.mean())/super_cpu.mean()*100):.1f}%")
print()
print("STATISTICAL SIGNIFICANCE:")
print("-" * 30)

# Perform statistical tests
t_stat_time, p_value_time = stats.ttest_rel(super_times, parallel_times)
print(f"Latency: t={t_stat_time:.2f}, p={p_value_time:.2e} {'(significant)' if p_value_time < 0.05 else '(not significant)'}")

t_stat_cpu, p_value_cpu = stats.ttest_rel(super_cpu, parallel_cpu)
print(f"CPU:     t={t_stat_cpu:.2f}, p={p_value_cpu:.2e} {'(significant)' if p_value_cpu < 0.05 else '(not significant)'}")

print()
print("* Parallel memory values filtered to remove extreme negative outliers")
print("  (likely garbage collection artifacts during fast execution)")
