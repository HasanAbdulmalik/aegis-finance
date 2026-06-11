# Aegis Finance
### An Integrated Expense Tracker and Asset Management System

> A desktop personal finance application built for Air University Karachi — Semester Project, June 2026.  
> Combines a C++ backend engine, a Rust/Tauri IPC bridge, and a React/TypeScript frontend.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Screenshots](#screenshots)
- [Academic Context](#academic-context)
- [Authors](#authors)

---

## Overview

Aegis Finance is a fully offline desktop financial dashboard. It lets you log income, track recurring bills with automatic tax and penalty calculations, and practice buying and selling simulated stock and crypto assets — all from a single workspace.

The motivation behind the project is a real gap in personal finance tooling: most budget apps and investment platforms work separately and require cloud accounts or live bank connections. Aegis Finance runs entirely on your machine. All data is stored in local flat-text files (`ledger.txt`, `bills.txt`, `stocks.txt`). Nothing leaves your device.

It is primarily a sandbox tool — suitable for students who want to understand how portfolio math works without risking real money or exposing their financial data.

---

## Architecture

The application is split into three tiers that communicate in a strict pipeline:

```
React (TypeScript/Vite)
        |
        |  Tauri IPC (invoke call with serialized JSON)
        v
Rust / Tauri v2 Sidecar Launcher
        |
        |  stdin/stdout pipe
        v
C++ Backend Binary (compiled separately)
        |
        |  read/write
        v
Local Text File Database (ledger.txt, bills.txt, stocks.txt)
```

### C++ Domain Layer

The business logic lives entirely in C++17. The core design uses a polymorphic `Transaction` base class with a virtual `.apply()` method. Every financial event in the system is a subclass of `Transaction`:

| Class | What It Does |
|---|---|
| `SalaryIncome` | Credits the ledger and records an income entry |
| `Expense` | Deducts balance, categorizes the outflow (taxes, bills, penalties) |
| `InvestmentExpense` | Deducts cash and adds to the active investment principal pool |
| `InvestmentRefund` | Returns principal to cash when a stock position is liquidated |
| `InvestmentProfit` | Records capital gain or loss separately from the principal refund |
| `SavingsTransfer` | Moves liquid cash into long-term savings |

Three manager classes handle file I/O and computation:
- **`Ledger`** — tracks cash, savings, net worth, and income breakdown. Handles double-entry bookkeeping.
- **`BillManager`** — reads and writes `bills.txt`, computes the 5% utility tax split, and applies overdue penalty logic (3% base + daily compounding).
- **`PortfolioManager`** — tracks open stock positions, handles sell orders and cost-basis calculation, and serializes updates to `stocks.txt`.

### Rust / Tauri Bridge

The C++ engine compiles into a standalone console binary. Tauri wraps around it using an async Rust command — `run_finance_command(cmd_json: String)` — that:
1. Serializes the frontend action into JSON
2. Spawns the C++ binary as a child process
3. Pipes the JSON command through `stdin`
4. Reads the updated ledger state from `stdout`
5. Returns the result to React

This design keeps the C++ logic completely decoupled from the UI layer. The binary can be tested standalone from the terminal.

### React Frontend

The UI is built in React 19 with TypeScript. Because stock prices update every second via live ticker intervals, the component state management had to be designed carefully to avoid chart jitter:

- Zoom and pan coordinates are tracked in a `useRef` (synchronous, no re-render cost)
- A debounced state updater flushes those coordinates to React state 150ms after scroll/drag activity stops
- This separates native canvas drawing from React's virtual DOM cycle

Charting uses **ApexCharts** for candlestick, donut, and order book visualizations. Icons are from **Lucide React**. Styling is plain CSS3 with custom properties and glassmorphism layout.

---

## Features

**Cash-Flow Ledger**  
Logs all income, savings transfers, and bill payments in a persistent history. Every transaction type is categorized and timestamped.

**Double-Entry Stock Recording**  
When you sell a position, the system records two separate entries: the cost-basis principal refund and the net capital gain/loss. This keeps your ledger accurate rather than logging only the net return.

**Staged Transaction Validator**  
Before committing a batch of transactions, the app scans the entire queue. If the total of staged expenses exceeds your current cash balance plus staged income, it disables the commit button and shows an alert card with the exact shortfall amount.

**Bill Tax and Late Penalties**  
Utility bills automatically allocate a 5% component to tax. If a bill is overdue, a 3% base penalty is applied, plus additional daily compounding fees.

**Live Market Simulator**  
A simulated market updates asset prices every second using randomized volatility multipliers. You can buy and sell assets using your ledger cash balance and watch your portfolio value change in real time.

**Candlestick Charting with Zoom and Pan**  
Scroll to zoom and click-drag to pan across historical price data. Built with native canvas operations so chart interactions stay smooth regardless of React re-render cycles.

**Live Order Book and Time and Sales Feed**  
The trading panel shows active bid/ask levels and a rolling log of recent simulated transactions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend logic | C++17, STL (`<vector>`, `<fstream>`, `<sstream>`, `<iomanip>`) |
| IPC bridge | Rust, Tauri v2 (`@tauri-apps/api`, `tauri-plugin-shell`) |
| Frontend | React 19, TypeScript, Vite |
| Styling | Vanilla CSS3, custom properties |
| Charts | ApexCharts, `react-apexcharts` |
| Icons | Lucide React |
| Data storage | Local flat-text files |

---

## How It Works

1. Launch the Tauri desktop app. The React UI loads.
2. Add your monthly salary and bills through the dashboard forms.
3. The frontend serializes each action and sends it to the Rust bridge via a Tauri invoke call.
4. Rust spawns the C++ binary, pipes the command in, and reads the result back.
5. The ledger state updates in the UI and the corresponding `.txt` file is rewritten on disk.
6. Navigate to the trading panel to buy or sell simulated assets. Your cash balance is deducted or credited in real time.
7. The staged transaction validator runs on every input change. If your budget does not balance, you will see a shortfall warning before anything is committed.

---

## Screenshots

| Figure | Description |
|---|---|
| Figure 1 | Core Dashboard Overview |
| Figure 2 | Live Trading Panel with Candlestick Zooming |
| Figure 3 | Insufficient Funds Validation Banner |

*(Screenshots to be added)*

---

## Academic Context

| Field | Detail |
|---|---|
| University | Air University Karachi Campus |
| Department | Cyber Security |
| Course 1 | Object-Oriented Programming Structures (Miss Muneeba Ahmed) |
| Course 2 | Introduction to Software Engineering (Miss Almas Ayesha Ansari) |
| Submission | June 2026 |

---

## Authors

| Name | Student ID |
|---|---|
| Syed Muhammad Hasan | 2540040 |
| Ibad ur Rehman Khan | 2540042 |
| Ahmed Memon | 2540194 |

---

*Aegis Finance is a student project. It does not connect to any real financial institutions, market feeds, or cloud services. All market data is simulated.*
