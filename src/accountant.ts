/**
 * Self-Paying Agent - Accountant Module
 * 
 * Tracks operational costs and manages profit distribution
 * Ensures agent stays profitable and pays its own bills
 */

interface Expense {
  id: string;
  category: 'api' | 'compute' | 'gas' | 'other';
  amount: number;
  description: string;
  timestamp: number;
  paid: boolean;
}

interface Revenue {
  id: string;
  source: 'trading' | 'yield' | 'mev';
  amount: number;
  timestamp: number;
  txHash?: string;
}

interface FinancialState {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  unpaidExpenses: number;
  treasuryBalance: number;
}

/**
 * Accountant manages the agent's finances
 * Tracks costs, pays expenses, distributes profits
 */
export class Accountant {
  private expenses: Expense[] = [];
  private revenues: Revenue[] = [];
  private ownerAddress: string;
  private profitSharePercent: number = 80; // 80% to owner, 20% stays in treasury

  constructor(ownerAddress: string, profitShare: number = 80) {
    this.ownerAddress = ownerAddress;
    this.profitSharePercent = profitShare;
  }

  /**
   * Record revenue from successful trade
   */
  recordRevenue(revenue: Omit<Revenue, 'id' | 'timestamp'>): Revenue {
    const record: Revenue = {
      ...revenue,
      id: `rev-${Date.now()}`,
      timestamp: Date.now()
    };
    this.revenues.push(record);
    return record;
  }

  /**
   * Add new expense to be paid
   */
  addExpense(expense: Omit<Expense, 'id' | 'timestamp' | 'paid'>): Expense {
    const record: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      timestamp: Date.now(),
      paid: false
    };
    this.expenses.push(record);
    return record;
  }

  /**
   * Mark expense as paid
   */
  markExpensePaid(expenseId: string): void {
    const expense = this.expenses.find(e => e.id === expenseId);
    if (expense) {
      expense.paid = true;
      console.log(`💸 Paid ${expense.amount} SUI for ${expense.description}`);
    }
  }

  /**
   * Calculate current financial state
   */
  getFinancialState(): FinancialState {
    const totalRevenue = this.revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = this.expenses
      .filter(e => e.paid)
      .reduce((sum, e) => sum + e.amount, 0);
    const unpaidExpenses = this.expenses
      .filter(e => !e.paid)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses - unpaidExpenses,
      unpaidExpenses,
      treasuryBalance: totalRevenue - totalExpenses // Simplified
    };
  }

  /**
   * Check if agent can afford its expenses
   */
  canAffordExpenses(): boolean {
    const state = this.getFinancialState();
    return state.treasuryBalance > state.unpaidExpenses;
  }

  /**
   * Distribute profits to owner
   * Returns amount to distribute
   */
  calculateProfitDistribution(): { toOwner: number; toTreasury: number } {
    const state = this.getFinancialState();
    const distributableProfit = state.netProfit * (this.profitSharePercent / 100);
    const retained = state.netProfit - distributableProfit;

    return {
      toOwner: distributableProfit,
      toTreasury: retained
    };
  }

  /**
   * Generate financial report
   */
  generateReport(): string {
    const state = this.getFinancialState();
    const distribution = this.calculateProfitDistribution();

    return `
╔══════════════════════════════════════════════════════════╗
║          SELF-PAYING AGENT - FINANCIAL REPORT            ║
╠══════════════════════════════════════════════════════════╣
║  Period: ${new Date().toISOString().split('T')[0]}                                    ║
╠══════════════════════════════════════════════════════════╣
║  REVENUE                                                 ║
║    Total Trading Revenue: ${state.totalRevenue.toFixed(4)} SUI                ║
║    Number of Trades: ${this.revenues.length}                                    ║
╠══════════════════════════════════════════════════════════╣
║  EXPENSES                                                ║
║    Total Paid: ${state.totalExpenses.toFixed(4)} SUI                        ║
║    Unpaid: ${state.unpaidExpenses.toFixed(4)} SUI                            ║
╠══════════════════════════════════════════════════════════╣
║  PROFIT                                                  ║
║    Net Profit: ${state.netProfit.toFixed(4)} SUI                           ║
║    To Owner (${this.profitSharePercent}%): ${distribution.toOwner.toFixed(4)} SUI              ║
║    Retained in Treasury: ${distribution.toTreasury.toFixed(4)} SUI                 ║
╠══════════════════════════════════════════════════════════╣
║  TREASURY BALANCE: ${state.treasuryBalance.toFixed(4)} SUI                      ║
║  STATUS: ${this.canAffordExpenses() ? '✅ SELF-SUSTAINING' : '⚠️ NEEDS FUNDS'}                          ║
╚══════════════════════════════════════════════════════════╝
    `;
  }

  /**
   * Get unpaid expenses that need to be paid
   */
  getPendingPayments(): Expense[] {
    return this.expenses.filter(e => !e.paid);
  }
}

// Demo usage
if (require.main === module) {
  const accountant = new Accountant('0x1234567890abcdef');

  // Simulate some activity
  accountant.recordRevenue({
    source: 'trading',
    amount: 0.5,
    txHash: '0xabc123'
  });

  accountant.recordRevenue({
    source: 'trading',
    amount: 0.3,
    txHash: '0xdef456'
  });

  accountant.addExpense({
    category: 'api',
    amount: 0.05,
    description: 'OpenAI API costs'
  });

  accountant.addExpense({
    category: 'gas',
    amount: 0.02,
    description: 'Transaction fees'
  });

  // Mark expenses as paid
  accountant.expenses.forEach(e => accountant.markExpensePaid(e.id));

  // Print report
  console.log(accountant.generateReport());
}
