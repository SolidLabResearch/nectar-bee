import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Set style for better-looking plots
plt.style.use('seaborn-v0_8')

# Read the data
df = pd.read_csv('../../docs/data/sparql_comprehensive_performance.csv')

# Memory Usage Analysis
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle('Memory Usage Analysis - Super Query Performance', fontsize=16)

# 1. Memory usage over iterations
memory_usage = df['super_memory']
iterations = df['iteration']

ax1.plot(iterations, memory_usage, 'o-', color='purple', linewidth=2, markersize=6)
ax1.fill_between(iterations, memory_usage.mean() - memory_usage.std(), 
                memory_usage.mean() + memory_usage.std(), alpha=0.2, color='purple')
ax1.axhline(y=memory_usage.mean(), color='red', linestyle='--', alpha=0.7, 
           label=f'Mean: {memory_usage.mean():.1f}MB')
ax1.set_xlabel('Iteration')
ax1.set_ylabel('Memory Usage (MB)')
ax1.set_title(f'Memory Usage Over Time\n(μ={memory_usage.mean():.1f}±{memory_usage.std():.1f}MB)')
ax1.legend()
ax1.grid(True, alpha=0.3)

# 2. Memory usage distribution
ax2.hist(memory_usage, bins=12, alpha=0.7, color='purple', edgecolor='black')
ax2.axvline(memory_usage.mean(), color='red', linestyle='--', 
           label=f'Mean: {memory_usage.mean():.2f}MB')
ax2.axvline(memory_usage.median(), color='green', linestyle='-', 
           label=f'Median: {memory_usage.median():.2f}MB')
ax2.set_xlabel('Memory Usage (MB)')
ax2.set_ylabel('Frequency')
ax2.set_title('Memory Usage Distribution')
ax2.legend()
ax2.grid(True, alpha=0.3)

# 3. Memory vs Execution Time correlation
execution_time = df['super_time']
correlation = np.corrcoef(memory_usage, execution_time)[0, 1]

ax3.scatter(memory_usage, execution_time, alpha=0.7, s=60, color='purple')
z = np.polyfit(memory_usage, execution_time, 1)
p = np.poly1d(z)
ax3.plot(memory_usage, p(memory_usage), "r--", alpha=0.8)
ax3.set_xlabel('Memory Usage (MB)')
ax3.set_ylabel('Execution Time (ms)')
ax3.set_title(f'Memory vs Execution Time\nCorrelation: r={correlation:.3f}')
ax3.grid(True, alpha=0.3)

# 4. Memory usage statistics table
ax4.axis('tight')
ax4.axis('off')

memory_stats = [
    ['Statistic', 'Value'],
    ['Mean', f'{memory_usage.mean():.2f} MB'],
    ['Std Dev', f'{memory_usage.std():.2f} MB'],
    ['Min', f'{memory_usage.min():.2f} MB'],
    ['Max', f'{memory_usage.max():.2f} MB'],
    ['Median', f'{memory_usage.median():.2f} MB'],
    ['CV (%)', f'{(memory_usage.std()/memory_usage.mean()*100):.1f}%'],
    ['Range', f'{memory_usage.max()-memory_usage.min():.2f} MB'],
    ['IQR', f'{memory_usage.quantile(0.75)-memory_usage.quantile(0.25):.2f} MB']
]

table = ax4.table(cellText=memory_stats, cellLoc='center', loc='center',
                 colWidths=[0.4, 0.6])
table.auto_set_font_size(False)
table.set_fontsize(11)
table.scale(1, 2)

# Style the header row
for i in range(len(memory_stats[0])):
    table[(0, i)].set_facecolor('#9C27B0')
    table[(0, i)].set_text_props(weight='bold', color='white')

plt.tight_layout()
plt.savefig('memory_usage_analysis.png', dpi=300, bbox_inches='tight')
plt.show()

print("="*60)
print("MEMORY USAGE ANALYSIS")
print("="*60)
print(f"Memory Usage Statistics:")
print(f"  Mean: {memory_usage.mean():.2f} MB ± {memory_usage.std():.2f} MB")
print(f"  Range: {memory_usage.min():.2f} - {memory_usage.max():.2f} MB")
print(f"  Coefficient of Variation: {(memory_usage.std()/memory_usage.mean()*100):.1f}%")
print(f"  Memory-Time Correlation: r = {correlation:.3f}")

if abs(correlation) > 0.5:
    print(f"  → Strong {'positive' if correlation > 0 else 'negative'} correlation with execution time")
elif abs(correlation) > 0.3:
    print(f"  → Moderate {'positive' if correlation > 0 else 'negative'} correlation with execution time")
else:
    print(f"  → Weak correlation with execution time")

print(f"\nMemory Efficiency:")
if memory_usage.std() / memory_usage.mean() < 0.1:
    print(f"  → Very consistent memory usage (CV < 10%)")
elif memory_usage.std() / memory_usage.mean() < 0.2:
    print(f"  → Moderately consistent memory usage (CV < 20%)")
else:
    print(f"  → Variable memory usage (CV ≥ 20%)")
