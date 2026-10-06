# Project: Expense & Budget Tracker (full-stack, individual assignment)
Stack: client = React + Vite (JavaScript, no TS), Tailwind CSS v4 (@tailwindcss/vite), React Router, axios, recharts. server = Node + Express, MongoDB + Mongoose, JWT, bcryptjs, express-validator, cors, helmet, dotenv.
Rules: ES modules, clean readable code, small files, comments only where needed, consistent JSON errors {message, errors?}, proper HTTP codes, never commit .env (provide .env.example), small focused git commits with conventional messages.
Server structure: src/{config,models,controllers,routes,middleware,utils}, app.js, server.js.
Client structure: src/{api,components,context,hooks,pages,utils}.
Features: JWT auth + protected routes; dashboard (income, expenses, balance, recent transactions); transaction CRUD (income/expense) with categories, search, filter, pagination; monthly budgets with progress; charts; form validation + error handling; responsive UI; CSV export.
Models: User{name,email unique,password hashed}; Transaction{user,type[income|expense],amount>0,category,description,date}; Budget{user,month 'YYYY-MM',category|null for overall,limit} unique(user,month,category).
Keep answers short; don't over-explain.
