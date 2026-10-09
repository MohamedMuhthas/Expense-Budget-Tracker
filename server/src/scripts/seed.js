import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const demoEmail = 'demo@example.com';
const demoPassword = 'DemoPass123!';
const templates = [
  { type: 'income', amount: 3200, category: 'Salary', description: 'Monthly salary' },
  { type: 'expense', amount: 85, category: 'Food', description: 'Weekly groceries' },
  { type: 'expense', amount: 24, category: 'Transport', description: 'Bus and train fares' },
  { type: 'expense', amount: 950, category: 'Rent', description: 'Monthly rent' },
  { type: 'expense', amount: 115, category: 'Utilities', description: 'Electricity and water bill' },
  { type: 'expense', amount: 68, category: 'Shopping', description: 'Household supplies' },
  { type: 'income', amount: 180, category: 'Freelance', description: 'Freelance design work' },
  { type: 'expense', amount: 42, category: 'Health', description: 'Pharmacy purchase' },
  { type: 'expense', amount: 36, category: 'Entertainment', description: 'Cinema tickets' },
  { type: 'expense', amount: 55, category: 'Education', description: 'Online course subscription' },
  { type: 'income', amount: 45, category: 'Investment', description: 'Investment dividend' },
  { type: 'expense', amount: 31, category: 'Food', description: 'Lunch with coworkers' },
  { type: 'expense', amount: 19, category: 'Transport', description: 'Taxi ride' },
  { type: 'expense', amount: 27, category: 'Shopping', description: 'Stationery and notebooks' },
  { type: 'income', amount: 60, category: 'Gift', description: 'Birthday gift received' },
  { type: 'expense', amount: 48, category: 'Food', description: 'Dinner at local cafe' },
  { type: 'expense', amount: 16, category: 'Entertainment', description: 'Music subscription' },
  { type: 'expense', amount: 38, category: 'Health', description: 'Doctor visit copay' },
  { type: 'expense', amount: 22, category: 'Utilities', description: 'Mobile phone plan' },
  { type: 'expense', amount: 14, category: 'Other', description: 'Postage and supplies' },
];

const run = async () => {
  await connectDB();
  let user = await User.findOne({ email: demoEmail });
  if (!user) user = await User.create({ name: 'Demo User', email: demoEmail, password: demoPassword });

  for (let index = 0; index < 40; index += 1) {
    const template = templates[index % templates.length];
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - index * 4);
    date.setUTCHours(12, 0, 0, 0);
    const description = `Demo ${String(index + 1).padStart(2, '0')} - ${template.description}`;
    const exists = await Transaction.exists({ user: user._id, description });
    if (!exists) await Transaction.create({ ...template, user: user._id, description, date });
  }

  const month = new Date().toISOString().slice(0, 7);
  const budgetRows = [
    { category: null, limit: 2200 },
    { category: 'Food', limit: 400 },
    { category: 'Transport', limit: 180 },
    { category: 'Entertainment', limit: 120 },
  ];
  for (const budget of budgetRows) {
    await Budget.findOneAndUpdate(
      { user: user._id, month, category: budget.category },
      { $set: { limit: budget.limit }, $setOnInsert: { user: user._id, month, category: budget.category } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  }

  console.log(`Seed complete. Demo login: ${demoEmail} / ${demoPassword}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`Seed failed: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});
