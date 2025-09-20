import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Set style for better-looking plots
plt.style.use('seaborn-v0_8')

# Read the data
df = pd.read_csv('../../docs/data/sparql_comprehensive_performance.csv')

# Performance Comparison Analysis
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle('Performance Comparison: Super Query vs Parallel+Join', fontsize=16)

# 1. Execution time comparison with error bars
iterations = df['iteration']
super_times = df['super_time']
parallel_times = df['par_total_time']

ax1.errorbar(iterations, super_times, yerr=super_times.std(), 
            label=f'Super Query (μ={super_times.mean():.1f}±{super_times.std():.1f}ms)', 
            marker='o', capsize=3, linewidth=2, color='red', alpha=0.8)
ax1.errorbar(iterations, parallel_times, yerr=parallel_times.std(), 
            label=f'Parallel+Join (μ={parallel_times.mean():.1f}±{parallel_times.std():.1f}ms)', 
            marker='s', capsize=3, linewidth=2, color='blue', alpha=0.8)
ax1.set_xlabel('Iteration')
ax1.set_ylabel('Execution Time (ms)')
ax1.set_title('Execution Time Comparison')
ax1.legend()
ax1.grid(True, alpha=0.3)

# 2. Box plot comparison
data_to_plot = [super_times, parallel_times]
box_plot = ax2.boxplot(data_to_plot, tick_labels=['Super Query', 'Parallel+Join'], patch_artist=True)
ax2.set_ylabel('Execution Time (ms)')
ax2.set_title('Performance Distribution Comparison')
ax2.grid(True, alpha=0.3)

# Color the boxes
colors = ['lightcoral', 'lightblue']
for patch, color in zip(box_plot['boxes'], colors):
    patch.set_facecolor(color)

# 3. Speedup ratio analysis
speedup_ratios = df['speedup_ratio']
ax3.plot(iterations, speedup_ratios, 'o-', linewidth=2, markersize=6, color='green')
ax3.axhline(y=1, color='red', linestyle='--', alpha=0.7, label='Equal Performance')
ax3.axhline(y=speedup_ratios.mean(), color='green', linestyle='-', alpha=0.7, 
           label=f'Avg Speedup: {speedup_ratios.mean():.1f}x')
ax3.fill_between(iterations, speedup_ratios.mean() - speedup_ratios.std(), 
                speedup_ratios.mean() + speedup_ratios.std(), alpha=0.2, color='green')
ax3.set_xlabel('Iteration')
ax3.set_ylabel('Speedup Ratio (Super Time / Parallel Time)')
ax3.set_title('Performance Ratio Analysis')
ax3.legend()
ax3.grid(True, alpha=0.3)

# 4. Performance statistics table
ax4.axis('tight')
ax4.axis('off')

# Perform t-test
t_stat, p_value = stats.ttest_rel(super_times, parallel_times)
effect_size = (super_times.mean() - parallel_times.mean()) / np.sqrt((super_times.var() + parallel_times.var()) / 2)

perf_stats = [
    ['Metric', 'Super Query', 'Parallel+Join', 'Difference'],
    ['Mean (ms)', f'{super_times.mean():.1f}', f'{parallel_times.mean():.1f}', 
     f'{super_times.mean() - parallel_times.mean():.1f}'],
    ['Std Dev (ms)', f'{super_times.std():.1f}', f'{parallel_times.std():.1f}', 
     f'{abs(super_times.std() - parallel_times.std()):.1f}'],
    ['Min (ms)', f'{super_times.min():.1f}', f'{parallel_times.min():.1f}', 
     f'{super_times.min() - parallel_times.min():.1f}'],
    ['Max (ms)', f'{super_times.max():.1f}', f'{parallel_times.max():.1f}', 
     f'{super_times.max() - parallel_times.max():.1f}'],
    ['CV (%)', f'{(super_times.std()/super_times.mean()*100):.1f}', 
     f'{(parallel_times.std()/parallel_times.mean()*100):.1f}', '-'],
    ['Speedup', '-', f'{speedup_ratios.mean():.1f}x', f'±{speedup_ratios.std():.1f}x'],
    ['p-value', f'{p_value:.2e}', 'Significant' if p_value < 0.05 else 'Not Sig.', '-'],
    ['Effect Size', f'{abs(effect_size):.2f}', 'Large' if abs(effect_size) > 0.8 else 'Medium' if abs(effect_size) > 0.5 else 'Small', '-']
]

table = ax4.table(cellText=perf_stats, cellLoc='center', loc='center',
                 colWidths=[0.25, 0.25, 0.25, 0.25])
table.auto_set_font_size(False)
table.set_fontsize(9)
table.scale(1, 1.8)

# Style the header row
for i in range(len(perf_stats[0])):
    table[(0, i)].set_facecolor('#4CAF50')
    table[(0, i)].set_text_props(weight='bold', color='white')

plt.tight_layout()
plt.savefig('performance_comparison.png', dpi=300, bbox_inches='tight')
plt.show()

print("="*70)
print("COMPREHENSIVE PERFORMANCE COMPARISON")
print("="*70)

print(f"\nExecution Time Analysis:")
print(f"  Super Query:    {super_times.mean():.1f}ms ± {super_times.std():.1f}ms")
print(f"  Parallel+Join:  {parallel_times.mean():.1f}ms ± {parallel_times.std():.1f}ms")
print(f"  Performance Gain: {speedup_ratios.mean():.1f}x faster with parallel approach")

print(f"\nStatistical Significance:")
print(f"  t-statistic: {t_stat:.2f}")
print(f"  p-value: {p_value:.2e}")
print(f"  Result: {'Highly significant difference' if p_value < 0.001 else 'Significant difference' if p_value < 0.05 else 'No significant difference'}")
print(f"  Effect size: {abs(effect_size):.2f} ({'Large' if abs(effect_size) > 0.8 else 'Medium' if abs(effect_size) > 0.5 else 'Small'} effect)")

print(f"\nConsistency Analysis:")
super_cv = (super_times.std() / super_times.mean()) * 100
parallel_cv = (parallel_times.std() / parallel_times.mean()) * 100
print(f"  Super Query CV: {super_cv:.1f}% ({'Low' if super_cv < 10 else 'Moderate' if super_cv < 20 else 'High'} variability)")
print(f"  Parallel CV: {parallel_cv:.1f}% ({'Low' if parallel_cv < 10 else 'Moderate' if parallel_cv < 20 else 'High'} variability)")

print(f"\nWinner Analysis:")
parallel_wins = sum(1 for ratio in speedup_ratios if ratio > 1)
print(f"  Parallel wins: {parallel_wins}/{len(speedup_ratios)} runs ({parallel_wins/len(speedup_ratios)*100:.0f}%)")
print(f"  Average advantage: {speedup_ratios.mean():.1f}x faster")
