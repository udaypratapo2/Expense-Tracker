import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import json
from datetime import datetime, timedelta
import os

# Database path
DB_PATH = './expenses.db'

def get_expenses_dataframe():
    """Load expenses from SQLite into pandas DataFrame"""
    conn = sqlite3.connect(DB_PATH)
    query = "SELECT * FROM expenses"
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    # Convert date to datetime
    df['date'] = pd.to_datetime(df['date'])
    df['amount'] = pd.to_numeric(df['amount'])
    
    return df

def generate_category_pie_chart(output_path='public/charts/category_pie.png'):
    """Generate pie chart for expenses by category"""
    try:
        df = get_expenses_dataframe()
        
        if df.empty:
            return {'error': 'No expenses data'}
        
        # Create charts directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Group by category and sum amounts
        category_data = df.groupby('category')['amount'].sum().sort_values(ascending=False)
        
        # Create figure and plot
        fig, ax = plt.subplots(figsize=(10, 8), facecolor='white')
        colors = plt.cm.Set3(range(len(category_data)))
        
        wedges, texts, autotexts = ax.pie(
            category_data.values,
            labels=category_data.index,
            autopct='%1.1f%%',
            colors=colors,
            startangle=90,
            textprops={'fontsize': 10, 'weight': 'bold'}
        )
        
        # Enhance text
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontsize(9)
            autotext.set_weight('bold')
        
        ax.set_title('Expenses by Category', fontsize=14, weight='bold', pad=20)
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=100, bbox_inches='tight')
        plt.close()
        
        return {
            'success': True,
            'path': output_path,
            'data': category_data.to_dict()
        }
    except Exception as e:
        return {'error': str(e)}

def generate_monthly_analysis(output_path='public/charts/monthly_analysis.png'):
    """Generate bar chart for monthly expense analysis"""
    try:
        df = get_expenses_dataframe()
        
        if df.empty:
            return {'error': 'No expenses data'}
        
        # Create charts directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Extract year-month and sum amounts
        df['year_month'] = df['date'].dt.to_period('M')
        monthly_data = df.groupby('year_month')['amount'].sum().sort_index()
        
        # Convert period to string for plotting
        monthly_labels = [str(period) for period in monthly_data.index]
        
        # Create figure with two subplots
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6), facecolor='white')
        
        # Monthly total bar chart
        colors_bar = plt.cm.viridis(range(len(monthly_data)))
        ax1.bar(range(len(monthly_data)), monthly_data.values, color=colors_bar)
        ax1.set_xticks(range(len(monthly_data)))
        ax1.set_xticklabels(monthly_labels, rotation=45, ha='right')
        ax1.set_ylabel('Amount ($)', fontsize=11, weight='bold')
        ax1.set_xlabel('Month', fontsize=11, weight='bold')
        ax1.set_title('Monthly Expense Totals', fontsize=12, weight='bold')
        ax1.grid(axis='y', alpha=0.3)
        
        # Add value labels on bars
        for i, v in enumerate(monthly_data.values):
            ax1.text(i, v + 5, f'${v:.0f}', ha='center', va='bottom', fontweight='bold')
        
        # Monthly category breakdown (stacked bar)
        df['year_month_str'] = df['date'].dt.to_period('M').astype(str)
        category_monthly = df.groupby(['year_month_str', 'category'])['amount'].sum().unstack(fill_value=0)
        
        category_monthly.plot(kind='bar', stacked=True, ax=ax2, colormap='Set3')
        ax2.set_ylabel('Amount ($)', fontsize=11, weight='bold')
        ax2.set_xlabel('Month', fontsize=11, weight='bold')
        ax2.set_title('Monthly Breakdown by Category', fontsize=12, weight='bold')
        ax2.set_xticklabels(ax2.get_xticklabels(), rotation=45, ha='right')
        ax2.legend(title='Category', bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=9)
        ax2.grid(axis='y', alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=100, bbox_inches='tight')
        plt.close()
        
        return {
            'success': True,
            'path': output_path,
            'monthly_totals': {str(k): float(v) for k, v in monthly_data.items()},
            'monthly_by_category': category_monthly.to_dict()
        }
    except Exception as e:
        return {'error': str(e)}

def generate_category_trend(output_path='public/charts/category_trend.png'):
    """Generate trend analysis for top categories over time"""
    try:
        df = get_expenses_dataframe()
        
        if df.empty:
            return {'error': 'No expenses data'}
        
        # Create charts directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Get top 5 categories
        top_categories = df.groupby('category')['amount'].sum().nlargest(5).index.tolist()
        
        # Filter data for top categories
        df_top = df[df['category'].isin(top_categories)]
        
        # Create year-month column
        df_top['year_month'] = df_top['date'].dt.to_period('M')
        
        # Pivot for line chart
        trend_data = df_top.groupby(['year_month', 'category'])['amount'].sum().unstack(fill_value=0)
        
        # Create figure
        fig, ax = plt.subplots(figsize=(12, 6), facecolor='white')
        
        # Plot lines for each category
        for category in trend_data.columns:
            ax.plot(range(len(trend_data)), trend_data[category].values, 
                   marker='o', label=category, linewidth=2, markersize=6)
        
        # Formatting
        ax.set_xticks(range(len(trend_data)))
        ax.set_xticklabels([str(period) for period in trend_data.index], rotation=45, ha='right')
        ax.set_ylabel('Amount ($)', fontsize=11, weight='bold')
        ax.set_xlabel('Month', fontsize=11, weight='bold')
        ax.set_title('Category Spending Trends (Top 5)', fontsize=12, weight='bold')
        ax.legend(loc='best', fontsize=10)
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=100, bbox_inches='tight')
        plt.close()
        
        return {
            'success': True,
            'path': output_path
        }
    except Exception as e:
        return {'error': str(e)}

def get_summary_stats():
    """Get summary statistics for expenses"""
    try:
        df = get_expenses_dataframe()
        
        if df.empty:
            return {'error': 'No expenses data'}
        
        stats = {
            'total_expenses': len(df),
            'total_amount': float(df['amount'].sum()),
            'average_amount': float(df['amount'].mean()),
            'median_amount': float(df['amount'].median()),
            'min_amount': float(df['amount'].min()),
            'max_amount': float(df['amount'].max()),
            'top_category': df.groupby('category')['amount'].sum().idxmax(),
            'total_categories': df['category'].nunique()
        }
        
        return {'success': True, 'data': stats}
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    print("Generating visualizations...")
    
    # Generate all charts
    print("1. Generating category pie chart...")
    result1 = generate_category_pie_chart()
    print(result1)
    
    print("2. Generating monthly analysis...")
    result2 = generate_monthly_analysis()
    print(result2)
    
    print("3. Generating category trend...")
    result3 = generate_category_trend()
    print(result3)
    
    print("4. Getting summary stats...")
    result4 = get_summary_stats()
    print(result4)
    
    print("Visualizations generated successfully!")
