import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  category: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    category,
    title,
    value,
    type,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance =
        (await (await transactionsRepository.getBalance()).total) - value;

      if (balance < 0) {
        throw new AppError('You don´t have enougth money for that');
      }
    }

    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      category: transactionCategory,
      value,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
