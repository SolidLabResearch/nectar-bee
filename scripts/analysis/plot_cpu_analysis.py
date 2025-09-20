import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Set style for better-looking plots
plt.style.use('seaborn-v0_8')

# Read the data
df = pd.read_csv('../../docs/data/sparql_comprehensive_performance.csv')

# CPU Usage Analysis
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle('CPU Usage Analysis - Super Query Performance', fontsize=16)

# 1. CPU usage over iterations
cpu_usage = df['super_cpu']
iterations = df['iteration']

ax1.plot(iterations, cpu_usage, 'o-', color='orange', linewidth=2, markersize=6)
ax1.fill_between(iterations, cpu_usage.mean() - cpu_usage.std(), 
                cpu_usage.mean() + cpu_usage.std(), alpha=0.2, color='orange')
ax1.axhline(y=cpu_usage.mean(), color='red', linestyle='--', alpha=0.7, 
           label=f'Mean: {cpu_usage.mean():.1f}ms')
ax1.set_xlabel('Iteration')
ax1.set_ylabel('CPU Usage (ms)')
ax1.set_title(f'CPU Usage Over Time\n(μ={cpu_usage.mean():.1f}±{cpu_usage.std():.1f}ms)')
ax1.legend()
ax1.grid(True, alpha=0.3)

# 2. CPU usage distribution
ax2.hist(cpu_usage, bins=12, alpha=0.7, color='orange', edgecolor='black')
ax2.axvline(cpu_usage.mean(), color='red', linestyle='--', 
           label=f'Mean: {cpu_usage.mean():.1f}ms')
ax2.axvline(cpu_usage.median(), color='green', linestyle='-', 
           label=f'Median: {cpu_usage.median():.1f}ms')
ax2.set_xlabel('CPU Usage (ms)')
ax2.set_ylabel('Frequency')
ax2.set_title('CPU Usage Distribution')
ax2.legend()
ax2.grid(True, alpha=0.3)

# 3. CPU vs Execution Time correlation
execution_time = df['super_time']
correlation = np.corrcoef(cpu_usage, execution_time)[0, 1]

ax3.scatter(cpu_usage, execution_time, alpha=0.7, s=60, color='orange')
z = np.polyfit(cpu_usage, execution_time, 1)
p = np.poly1d(z)
ax3.plot(cpu_usage, p(cpu_usage), "r--", alpha=0.8)
ax3.set_xlabel('CPU Usage (ms)')
ax3.set_ylabel('Execution Time (ms)')
ax3.set_title(f'CPU vs Execution Time\nCorrelation: r={correlation:.3f}')
ax3.grid(True, alpha=0.3)

# 4. CPU usage statistics table
ax4.axis('tight')
ax4.axis('off')

cpu_stats = [
    ['Statistic', 'Value'],
    ['Mean', f'{cpu_usage.mean():.1f} ms'],
    ['Std Dev', f'{cpu_usage.std():.1f} ms'],
    ['Min', f'{cpu_usage.min():.1f} ms'],
    ['Max', f'{cpu_usage.max():.1f} ms'],
    ['Median', f'{cpu_usage.median():.1f} ms'],
    ['CV (%)', f'{(cpu_usage.std()/cpu_usage.mean()*100):.1f}%'],
    ['Range', f'{cpu_usage.max()-cpu_usage.min():.1f} ms'],
    ['IQR', f'{cpu_usage.quantile(0.75)-cpu_usage.quantile(0.25):.1f} ms'],
    ['CPU Efficiency', f'{(execution_time.mean()/cpu_usage.mean()*100):.1f}%']
]

table = ax4.table(cellText=cpu_stats, cellLoc='center', loc='center',
                 colWidths=[0.4, 0.6])
table.auto_set_font_size(False)
table.set_fontsize(11)
table.scale(1, 2)

# Style the header row
for i in range(len(cpu_stats[0])):
    table[(0, i)].set_facecolor('#FF9800')
    table[(0, i)].set_text_props(weight='bold', color='white')

plt.tight_layout()
plt.savefig('cpu_usage_analysis.png', dpi=300, bbox_inches='tight')
plt.show()

print("="*60)
print("CPU USAGE ANALYSIS")
print("="*60)
print(f"CPU Usage Statistics:")
print(f"  Mean: {cpu_usage.mean():.1f} ms ± {cpu_usage.std():.1f} ms")
print(f"  Range: {cpu_usage.min():.1f} - {cpu_usage.max():.1f} ms")
print(f"  Coefficient of Variation: {(cpu_usage.std()/cpu_usage.mean()*100):.1f}%")
print(f"  CPU-Time Correlation: r = {correlation:.3f}")

print(f"\nCPU Efficiency Analysis:")
cpu_efficiency = execution_time.mean() / cpu_usage.mean() * 100
print(f"  CPU Efficiency: {cpu_efficiency:.1f}% (Execution Time / CPU Time)")

if cpu_efficiency > 80:
    print(f"  → Highly efficient CPU usage")
elif cpu_efficiency > 60:
    print(f"  → Moderately efficient CPU usage")
else:
    print(f"  → Low CPU efficiency (high overhead)")

if abs(correlation) > 0.7:
    print(f"  → Strong {'positive' if correlation > 0 else 'negative'} correlation with execution time")
elif abs(correlation) > 0.5:
    print(f"  → Moderate {'positive' if correlation > 0 else 'negative'} correlation with execution time")
else:
    print(f"  → Weak correlation with execution time")

print(f"\nCPU Consistency:")
if cpu_usage.std() / cpu_usage.mean() < 0.1:
    print(f"  → Very consistent CPU usage (CV < 10%)")
elif cpu_usage.std() / cpu_usage.mean() < 0.2:
    print(f"  → Moderately consistent CPU usage (CV < 20%)")
else:
    print(f"  → Variable CPU usage (CV ≥ 20%)")
