import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeValue = await this.find({
      where: { type: 'income' },
    });

    const incomeValueTotals = incomeValue
      .map(income => income.value)
      .reduce((total, income) => total + income, 0);

    const outcomeValue = await this.find({
      where: { type: 'outcome' },
    });

    const outcomeValueTotals = outcomeValue
      .map(outcome => outcome.value)
      .reduce((total, outcome) => total + outcome, 0);

    const balance = {
      income: incomeValueTotals,
      outcome: outcomeValueTotals,
      total: incomeValueTotals - outcomeValueTotals,
    };

    return balance;
  }
}

export default TransactionsRepository;
