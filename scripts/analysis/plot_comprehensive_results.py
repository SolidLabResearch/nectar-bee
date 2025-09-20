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

# Create comprehensive figure with subplots
fig = plt.figure(figsize=(20, 16))
gs = fig.add_gridspec(4, 3, hspace=0.3, wspace=0.3)

# 1. Time comparison with error bars
ax1 = fig.add_subplot(gs[0, :2])
iterations = df['iteration']
super_times = df['super_time']
parallel_times = df['par_total_time']

ax1.errorbar(iterations, super_times, yerr=super_times.std(), 
            label=f'Super Query (μ={super_times.mean():.1f}±{super_times.std():.1f}ms)', 
            marker='o', capsize=3, linewidth=2)
ax1.errorbar(iterations, parallel_times, yerr=parallel_times.std(), 
            label=f'Parallel+Join (μ={parallel_times.mean():.1f}±{parallel_times.std():.1f}ms)', 
            marker='s', capsize=3, linewidth=2)
ax1.set_xlabel('Iteration')
ax1.set_ylabel('Execution Time (ms)')
ax1.set_title('Performance Comparison with Standard Deviation')
ax1.legend()
ax1.grid(True, alpha=0.3)

# 2. Statistical distribution comparison
ax2 = fig.add_subplot(gs[0, 2])
data_to_plot = [super_times, parallel_times]
box_plot = ax2.boxplot(data_to_plot, labels=['Super', 'Parallel'], patch_artist=True)
ax2.set_ylabel('Execution Time (ms)')
ax2.set_title('Distribution Comparison')
ax2.grid(True, alpha=0.3)

# Color the boxes
colors = ['lightblue', 'lightcoral']
for patch, color in zip(box_plot['boxes'], colors):
    patch.set_facecolor(color)

# 3. Performance ratio over time
ax3 = fig.add_subplot(gs[1, :2])
speedup_ratios = df['speedup_ratio']
ax3.plot(iterations, speedup_ratios, 'o-', linewidth=2, markersize=6)
ax3.axhline(y=1, color='red', linestyle='--', alpha=0.7, label='Equal Performance')
ax3.axhline(y=speedup_ratios.mean(), color='green', linestyle='-', alpha=0.7, 
           label=f'Average Speedup: {speedup_ratios.mean():.2f}x')
ax3.fill_between(iterations, speedup_ratios.mean() - speedup_ratios.std(), 
                speedup_ratios.mean() + speedup_ratios.std(), alpha=0.2, color='green')
ax3.set_xlabel('Iteration')
ax3.set_ylabel('Speedup Ratio (Super Time / Parallel Time)')
ax3.set_title('Performance Ratio Analysis')
ax3.legend()
ax3.grid(True, alpha=0.3)

# 4. Histogram of speedup ratios
ax4 = fig.add_subplot(gs[1, 2])
ax4.hist(speedup_ratios, bins=10, alpha=0.7, color='skyblue', edgecolor='black')
ax4.axvline(speedup_ratios.mean(), color='red', linestyle='--', 
           label=f'Mean: {speedup_ratios.mean():.2f}')
ax4.axvline(speedup_ratios.median(), color='green', linestyle='-', 
           label=f'Median: {speedup_ratios.median():.2f}')
ax4.set_xlabel('Speedup Ratio')
ax4.set_ylabel('Frequency')
ax4.set_title('Speedup Distribution')
ax4.legend()
ax4.grid(True, alpha=0.3)

# 5. Memory usage comparison
ax5 = fig.add_subplot(gs[2, 0])
super_memory = df['super_memory']
parallel_memory = df['par_memory']
ax5.plot(iterations, super_memory, 'o-', color='purple', linewidth=2, label='Super Query')
ax5.plot(iterations, parallel_memory, 's-', color='darkviolet', linewidth=2, label='Parallel+Join')
ax5.fill_between(iterations, super_memory.mean() - super_memory.std(), 
                super_memory.mean() + super_memory.std(), alpha=0.2, color='purple')
ax5.fill_between(iterations, parallel_memory.mean() - parallel_memory.std(), 
                parallel_memory.mean() + parallel_memory.std(), alpha=0.2, color='darkviolet')
ax5.set_xlabel('Iteration')
ax5.set_ylabel('Memory Usage (MB)')
ax5.set_title(f'Memory Usage Comparison\nSuper: μ={super_memory.mean():.1f}±{super_memory.std():.1f}MB\nParallel: μ={parallel_memory.mean():.1f}±{parallel_memory.std():.1f}MB')
ax5.legend()
ax5.grid(True, alpha=0.3)

# 6. CPU usage comparison
ax6 = fig.add_subplot(gs[2, 1])
super_cpu = df['super_cpu']
parallel_cpu = df['par_cpu']
ax6.plot(iterations, super_cpu, 'o-', color='orange', linewidth=2, label='Super Query')
ax6.plot(iterations, parallel_cpu, 's-', color='darkorange', linewidth=2, label='Parallel+Join')
ax6.fill_between(iterations, super_cpu.mean() - super_cpu.std(), 
                super_cpu.mean() + super_cpu.std(), alpha=0.2, color='orange')
ax6.fill_between(iterations, parallel_cpu.mean() - parallel_cpu.std(), 
                parallel_cpu.mean() + parallel_cpu.std(), alpha=0.2, color='darkorange')
ax6.set_xlabel('Iteration')
ax6.set_ylabel('CPU Usage (ms)')
ax6.set_title(f'CPU Usage Comparison\nSuper: μ={super_cpu.mean():.1f}±{super_cpu.std():.1f}ms\nParallel: μ={parallel_cpu.mean():.1f}±{parallel_cpu.std():.1f}ms')
ax6.legend()
ax6.grid(True, alpha=0.3)

# 7. Correlation analysis
ax7 = fig.add_subplot(gs[2, 2])
correlation = np.corrcoef(super_times, parallel_times)[0, 1]
ax7.scatter(super_times, parallel_times, alpha=0.7, s=50)
ax7.set_xlabel('Super Query Time (ms)')
ax7.set_ylabel('Parallel Time (ms)')
ax7.set_title(f'Time Correlation\n(r={correlation:.3f})')
ax7.grid(True, alpha=0.3)

# Add trend line
z = np.polyfit(super_times, parallel_times, 1)
p = np.poly1d(z)
ax7.plot(super_times, p(super_times), "r--", alpha=0.8)

# 8. Performance summary table
ax8 = fig.add_subplot(gs[3, :])
ax8.axis('tight')
ax8.axis('off')

# Create summary statistics table
summary_data = [
    ['Metric', 'Super Query', 'Parallel+Join', 'Difference'],
    ['Mean Time (ms)', f'{super_times.mean():.2f}', f'{parallel_times.mean():.2f}', 
     f'{abs(super_times.mean() - parallel_times.mean()):.2f}'],
    ['Std Dev (ms)', f'{super_times.std():.2f}', f'{parallel_times.std():.2f}', 
     f'{abs(super_times.std() - parallel_times.std()):.2f}'],
    ['Min Time (ms)', f'{super_times.min():.2f}', f'{parallel_times.min():.2f}', 
     f'{abs(super_times.min() - parallel_times.min()):.2f}'],
    ['Max Time (ms)', f'{super_times.max():.2f}', f'{parallel_times.max():.2f}', 
     f'{abs(super_times.max() - parallel_times.max()):.2f}'],
    ['CV (%)', f'{(super_times.std()/super_times.mean()*100):.1f}', 
     f'{(parallel_times.std()/parallel_times.mean()*100):.1f}', '-'],
    ['Avg Memory (MB)', f'{super_memory.mean():.2f}±{super_memory.std():.2f}', 
     f'{parallel_memory.mean():.2f}±{parallel_memory.std():.2f}', 
     f'{abs(super_memory.mean() - parallel_memory.mean()):.2f}'],
    ['Avg CPU (ms)', f'{super_cpu.mean():.2f}±{super_cpu.std():.2f}', 
     f'{parallel_cpu.mean():.2f}±{parallel_cpu.std():.2f}', 
     f'{abs(super_cpu.mean() - parallel_cpu.mean()):.2f}']
]

table = ax8.table(cellText=summary_data, cellLoc='center', loc='center',
                 colWidths=[0.25, 0.25, 0.25, 0.25])
table.auto_set_font_size(False)
table.set_fontsize(10)
table.scale(1, 2)

# Style the header row
for i in range(len(summary_data[0])):
    table[(0, i)].set_facecolor('#4CAF50')
    table[(0, i)].set_text_props(weight='bold', color='white')

plt.suptitle('Comprehensive SPARQL Performance Analysis (35 Runs, Filtered)', 
            fontsize=16, y=0.98)

plt.tight_layout()
plt.savefig('../../docs/images/comprehensive_sparql_analysis.png', dpi=300, bbox_inches='tight')
plt.show()

# Print detailed statistical analysis
print("\n" + "="*80)
print("COMPREHENSIVE STATISTICAL ANALYSIS")
print("="*80)

# Perform t-test
t_stat, p_value = stats.ttest_rel(super_times, parallel_times)
print(f"\nPaired t-test results:")
print(f"t-statistic: {t_stat:.4f}")
print(f"p-value: {p_value:.6f}")
print(f"Significant difference: {'Yes' if p_value < 0.05 else 'No'}")

# Effect size (Cohen's d)
pooled_std = np.sqrt(((len(super_times)-1)*super_times.var() + (len(parallel_times)-1)*parallel_times.var()) / (len(super_times)+len(parallel_times)-2))
cohens_d = (super_times.mean() - parallel_times.mean()) / pooled_std
print(f"\nEffect size (Cohen's d): {cohens_d:.4f}")
effect_size_interpretation = "Large" if abs(cohens_d) >= 0.8 else "Medium" if abs(cohens_d) >= 0.5 else "Small"
print(f"Effect size interpretation: {effect_size_interpretation}")

# Confidence interval for mean difference
diff_mean = super_times.mean() - parallel_times.mean()
diff_std = np.sqrt(super_times.var()/len(super_times) + parallel_times.var()/len(parallel_times))
ci_95 = 1.96 * diff_std
print(f"\n95% CI for mean difference: {diff_mean:.2f} ± {ci_95:.2f} ms")
print(f"Range: [{diff_mean-ci_95:.2f}, {diff_mean+ci_95:.2f}] ms")

print(f"\nWinner analysis:")
super_wins = sum(1 for ratio in speedup_ratios if ratio > 1)
parallel_wins = len(speedup_ratios) - super_wins
print(f"Super Query wins: {super_wins}/{len(speedup_ratios)} ({super_wins/len(speedup_ratios)*100:.1f}%)")
print(f"Parallel wins: {parallel_wins}/{len(speedup_ratios)} ({parallel_wins/len(speedup_ratios)*100:.1f}%)")
