<div align="center">

# Semester Project

## Aegis Finance
### An Integrated Expense Tracker and Asset Management System

<br>

| Field | Detail |
|:---|:---|
| **University** | Air University Karachi Campus |
| **Department** | Cyber Security |
| **Submission** | June 2026 |

<br>

| Course | Instructor |
|:---|:---|
| Object-Oriented Programming Structures | Miss Muneeba Ahmed |
| Introduction to Software Engineering | Miss Almas Ayesha Ansari |

<br>

| # | Author | Student ID |
|:---:|:---|:---:|
| 1 | Syed Muhammad Hasan | 2540040 |
| 2 | Ibad ur Rehman Khan | 2540042 |
| 3 | Ahmed Memon | 2540194 |

</div>

---

## Table of Contents

1. [Description of the Application](#1-description-of-the-application)
   - [Languages and Modules Used](#11-languages-and-modules-used)
   - [How We Made It](#12-how-we-made-it)
   - [What the App Does](#13-what-the-app-does)
   - [Features](#14-features)
   - [Why This App is Necessary](#15-why-this-app-is-necessary)
   - [Why Users Should Use It](#16-why-users-should-use-it)
2. [Author's Note](#2-authors-note)
3. [Summary](#3-summary)

---

## 1. Description of the Application

### 1.1 Languages and Modules Used

Aegis Finance is a hybrid desktop application that layers three distinct programming environments on top of each other. Each layer was chosen for what it does best: C++ for raw computation and data management, Rust for safe native system integration, and React/TypeScript for a modern, responsive user interface.

**Backend Core Engine — C++17**

The entire financial logic of the application is written in standard C++17. This layer handles all calculations, transaction recording, file reading, file writing, and balance validation. It uses the following standard library headers:

- `<iostream>` — console I/O used during IPC communication with the Rust layer
- `<vector>` — dynamic container storage for transaction histories and bill records
- `<string>` — string manipulation for serializing and parsing ledger data
- `<fstream>` — reading from and writing to the local flat-file database (`ledger.txt`, `bills.txt`, `stocks.txt`)
- `<sstream>` — in-memory string streams for parsing incoming command data
- `<iomanip>` — output formatting for currency values and tabular display

The Standard Template Library (STL) is used throughout for managing collections of transaction objects, iterating over bill records, and building the serialized output that gets piped back to the Rust layer. Custom text-based serialization and deserialization routines are written by hand rather than using an external JSON library, keeping the binary dependency-free.

**Desktop IPC Bridge — Rust and Tauri v2**

Rust acts as the glue between the compiled C++ binary and the JavaScript/TypeScript frontend. The Tauri v2 framework was used to package the entire application as a native desktop window while keeping the web UI as the visual layer. The following Tauri packages are used:

- `@tauri-apps/api` — exposes Rust backend commands to the TypeScript frontend via asynchronous `invoke()` calls
- `tauri-plugin-shell` — allows Tauri to spawn external processes (the C++ binary) as sidecars, pipe data through their standard input, and read from their standard output

Rust handles thread safety when multiple async operations are in flight, ensures the child C++ process is properly managed and cleaned up, and acts as the message broker between the two ends of the pipeline.

**Frontend Graphical User Interface — React and TypeScript**

The visual layer is a single-page React application written in TypeScript, bundled and served through Vite. The full list of frontend dependencies:

- `React 19` and `TypeScript` — component architecture and type-safe development
- `Vite` — fast development server and optimized production build tooling
- `Vanilla CSS3` — hand-written styles using custom CSS variables for theming; no utility framework
- `ApexCharts` and `react-apexcharts` — renders all chart types: candlestick charts for asset price history, donut charts for budget category breakdowns, and tabular order book views
- `Lucide React` — provides the icon set used throughout the dashboard UI

---

### 1.2 How We Made It

The project follows a strict **three-tier architecture** where each tier has a single, well-defined responsibility. No tier reaches across its boundary — the C++ engine has no knowledge of the UI, and the React layer has no knowledge of how financial logic works.

#### The Three-Tier Pipeline

```
[ React UI — TypeScript/Vite ]
           |
           |  User triggers an action (e.g. "Add Bill")
           |  Frontend serializes parameters to JSON
           |  Calls: invoke("run_finance_command", { cmd_json })
           v
[ Rust / Tauri v2 — IPC Bridge ]
           |
           |  Receives the invoke call asynchronously
           |  Spawns the compiled C++ binary as a child process
           |  Pipes the JSON command string through stdin
           |  Waits for the process to complete
           |  Reads the updated ledger state from stdout
           |  Returns the result back to the React caller
           v
[ C++ Backend Binary — Domain Logic ]
           |
           |  Parses the incoming JSON command
           |  Instantiates the correct Transaction subclass
           |  Calls .apply() to update the in-memory state
           |  Validates balance constraints
           |  Writes the updated state to disk
           |  Serializes the new ledger snapshot to stdout
           v
[ Local Text File Database ]
    ledger.txt / bills.txt / stocks.txt
```

#### A. The C++ Object-Oriented Domain Layer

The core of the application is built around a strict OOP inheritance hierarchy. The base class is `Transaction`, which declares a pure virtual method `.apply()`. Every financial event in the system — receiving a salary, paying a bill, buying a stock, selling a position — is modeled as a concrete subclass that overrides `.apply()` with its specific balance effect.

| Class | Inheritance Role | What `.apply()` Does |
|:---|:---|:---|
| `Transaction` | Abstract base class | Declares the interface; holds amount and timestamp |
| `SalaryIncome` | Concrete subclass | Credits the cash balance; increments the income counter |
| `Expense` | Concrete subclass | Deducts the cash balance; records category (tax, bill, penalty) |
| `InvestmentExpense` | Concrete subclass | Deducts cash; adds the amount to the active investment principal pool |
| `InvestmentRefund` | Concrete subclass | Credits cash; deducts the cost basis from the principal pool on position close |
| `InvestmentProfit` | Concrete subclass | Credits or deducts cash with the net capital gain or loss value |
| `SavingsTransfer` | Concrete subclass | Moves an amount from liquid cash into the long-term savings balance |

This design means that adding a new transaction type in the future requires only writing a new subclass and implementing `.apply()` — no changes to the ledger engine or the file I/O layer are needed.

Three manager classes sit above the transaction hierarchy and coordinate the system:

**`Ledger`**  
The central accounting engine. It maintains the current cash balance, total savings, cumulative income, investment principal pool, and net worth. Every transaction passes through the Ledger before being committed to disk. It enforces double-entry bookkeeping — every credit has a corresponding debit record — which is what makes the stock sale recording accurate (see Features section). The Ledger reads from and writes to `ledger.txt` using a fixed-format serialization scheme.

**`BillManager`**  
Handles all recurring bill logic. It reads `bills.txt` on startup and reconstructs the full bill list. When a utility bill is recorded, BillManager automatically splits it: 95% is recorded as the bill expense and 5% is logged as a tax payment to the state. If a bill's due date has passed, BillManager calculates the late fee using a 3% base penalty rate plus a daily compounding amount for each day overdue. All writes are atomic — the entire `bills.txt` file is rewritten on each update.

**`PortfolioManager`**  
Tracks all active stock and crypto positions. It stores the ticker symbol, quantity held, average cost basis per unit, and current market value per position. When a sell order is placed, PortfolioManager calculates the cost basis of the units being sold, creates both an `InvestmentRefund` transaction (returning the principal) and an `InvestmentProfit` transaction (recording the gain or loss), and updates the position. If the entire position is closed, the entry is removed from `stocks.txt`.

#### B. The Rust and Tauri IPC Bridge

The C++ binary is compiled as a standalone executable that reads a JSON command from `stdin` and writes a JSON ledger snapshot to `stdout`. It has no window, no GUI, and no direct connection to Tauri — it is just a command-line program.

Tauri v2 exposes a single Rust async command function to the frontend:

```rust
#[tauri::command]
async fn run_finance_command(cmd_json: String) -> Result<String, String> {
    // spawn C++ sidecar
    // write cmd_json to stdin
    // read updated ledger from stdout
    // return to frontend
}
```

When the React frontend calls `invoke("run_finance_command", { cmd_json })`, Tauri routes it to this Rust function. Rust spawns the binary, handles the pipe I/O asynchronously so the UI does not freeze, and returns the result. The frontend awaits the promise and updates its state with the new ledger data.

This architecture has a practical benefit: the C++ binary can be run and debugged directly in a terminal by any developer without needing to launch the GUI at all. The entire financial engine is independently testable.

#### C. The React State Management Layer

Because the market simulator updates asset prices every second through `setInterval` calls, the charting layer required careful state management to prevent visual artifacts.

The problem: React re-renders the component tree whenever state changes. If zoom level, pan position, and price data all live in React state, every price tick triggers a full re-render including recomputing the chart viewport — causing visible jitter and coordinate lag during user interaction.

The solution implemented uses ref-state separation:

- Chart viewport coordinates (zoom min/max, pan offset) are stored in a `useRef` — a mutable container that React does not track. Reads and writes to the ref are synchronous and never trigger a re-render.
- A debounced state sync function fires 150ms after the user stops scrolling or dragging. Only then does the chart commit the new viewport to React state, and only for the purpose of persisting the view across price-tick re-renders.
- Price tick updates write directly to a separate state slice that only the chart data array reads from.

This keeps the native canvas drawing operations completely decoupled from React's virtual DOM reconciliation cycle. The result is smooth panning and zooming even while prices are actively updating.

---

### 1.3 What the App Does

Aegis Finance is a desktop financial sandbox. It gives users a single workspace to manage a virtual personal budget and practice simulated investing, with all data stored locally in plain text files.

On the **budget side**, users start by recording their monthly income sources. They then add bills — utility payments, subscriptions, or any recurring expense. The application calculates tax splits on utility bills automatically and tracks which bills are overdue. All transactions are logged in a persistent history with timestamps, categories, and running balance snapshots.

On the **investment side**, users see a simulated live market of stock and cryptocurrency assets with prices that update every second. They can buy positions using their current cash balance, watch their portfolio value fluctuate in real time on candlestick charts, and sell positions at any point. When a position is sold, the system records both the return of the original cost basis and the profit or loss separately — so the ledger always shows an accurate picture of where money came from and where it went.

Before any batch of transactions is committed, the application runs a pre-commit scan across everything in the staged queue. If the total outflows exceed available cash plus staged inflows, the commit is blocked and the UI displays the exact shortfall amount. Nothing is written to disk until the numbers balance.

All data persists between sessions through three local files:
- `ledger.txt` — full transaction history and current balance state
- `bills.txt` — all bill records with due dates and payment status
- `stocks.txt` — all open investment positions with cost basis data

There is no login, no cloud sync, and no network connection required at any point.

---

### 1.4 Features

**Integrated Cash-Flow Ledger**  
A complete log of every financial event: salary credits, savings deposits, bill payments, tax allocations, and investment activity. Each entry stores the transaction type, amount, timestamp, category, and the resulting balance after the operation. The history is persistent across sessions and displayed in a paginated table in the dashboard.

**Double-Entry Stock Sale Recording**  
Most basic expense trackers log an investment return as a single line item showing the net amount received. Aegis Finance handles this correctly: when a stock position is sold, two separate transactions are created. The first records the return of the original cost basis (the `InvestmentRefund`). The second records the capital gain or loss (the `InvestmentProfit`). This matters because the net worth calculation, the investment principal pool, and the cash balance must all update independently — collapsing them into one number breaks the accounting.

**Staged Transaction Validator**  
Users can stage multiple transactions before committing them in a batch. The validator runs continuously as items are added or modified. It computes the cumulative net effect of all staged items against the current cash balance. If at any point the staged outflows would exceed available funds, the commit button is disabled and an alert card appears in the UI specifying the exact shortfall in currency. Nothing is written to `ledger.txt` until the user resolves the imbalance.

**Automatic Bill Tax and Overdue Penalties**  
When a utility bill is logged, BillManager automatically splits it into two transactions: 95% recorded as the bill expense and 5% recorded as a tax payment. This mirrors real-world tax-inclusive billing structures. If the bill is past its due date, the system calculates the penalty as a 3% flat fee on the original amount plus a compounding daily charge for each calendar day the payment is overdue. The penalty is shown as a separate expense entry so users can see exactly how much late payment is costing them.

**Live Market Simulator**  
A set of simulated stock and cryptocurrency assets are available for trading. Prices update every second using randomized volatility multipliers that produce realistic price movement patterns. Each asset has its own volatility coefficient, so some assets are stable and some are highly erratic. Users buy and sell positions using real cash from their ledger balance — there is no separate "play money." This makes the simulator actually connected to the budget tracking system rather than being a separate toy.

**Candlestick Charts with Zoom and Pan**  
Each asset has a candlestick chart showing its full simulated price history. Users can scroll to zoom in on specific time windows and click-drag to pan across the timeline. The viewport state is managed through React refs and a debounced sync mechanism (described in the architecture section) to keep interactions smooth even while live price ticks are writing to the chart data.

**Live Order Book and Time and Sales Feed**  
The trading panel includes an order book showing current simulated bid and ask levels for the selected asset, and a rolling Time and Sales feed showing recent transactions with price, quantity, and direction. These panels update in real time alongside the price ticker and candlestick chart.

**Net Worth Dashboard**  
The main dashboard aggregates cash balance, total savings, active investment principal, and unrealized portfolio gains/losses into a single net worth figure. Individual cards break down income sources, expense categories, and investment performance.

---

### 1.5 Why This App is Necessary

The tools available for learning personal finance and investing tend to fall into two categories, and neither works well for students.

Spreadsheets give full control but require the user to manually implement every calculation — tax splits, compound penalties, cost basis tracking, portfolio valuation. A first-year student spending time building spreadsheet formulas is not learning finance; they are learning spreadsheets.

Commercial platforms like brokerage apps and budgeting tools connect to real bank accounts and real markets. That makes them unsuitable for coursework and experimentation. Mistakes have real consequences, privacy concerns are real, and the apps are designed to encourage spending and trading rather than understanding.

There is a gap between "fully manual spreadsheet" and "live financial account," and that is where Aegis Finance sits. It provides a complete, mathematically correct financial environment — with real accounting rules, real penalty structures, and real market simulation — but entirely offline, entirely sandboxed, and entirely under the user's control.

For a Cyber Security student specifically, local data storage matters. Every piece of financial data entered into Aegis Finance stays on the machine. There are no API calls to external services, no authentication tokens, no third-party SDKs phoning home. The codebase is fully auditable because it is fully local.

From an educational standpoint, the project also demonstrates that desktop software does not need to choose between computational correctness and visual quality. The combination of C++ business logic, Rust system integration, and React UI is a real production architecture pattern used in tools like VS Code, which uses a similar model. Students working on this project got exposure to multi-language systems integration, IPC design, and frontend state management — not just syntax.

---

### 1.6 Why Users Should Use It

**It is fully private.** Every transaction, bill, and investment position is stored in three plain text files on your computer. No account creation, no cloud backup, no telemetry. You can open `ledger.txt` in Notepad and read it directly.

**It works offline, permanently.** The application has no network dependency at runtime. The market simulator generates prices locally. You can use it on a plane, in an exam environment, or on a machine with no internet connection.

**It prevents budgeting mistakes before they happen.** The staged transaction validator is not a warning — it is a hard block. If your planned expenses exceed your income for the month, the application will not let you commit the budget until you fix it. This is a stricter constraint than any spreadsheet.

**It teaches investment accounting correctly.** Most introductory tools show investing as "you put in X and got back Y." Aegis Finance shows you the actual accounting: the principal that was returned, the gain or loss that was realized, and how both affect your net worth and cash balance independently. That distinction matters when you move to real investing.

**The interface is premium.** Dark mode glassmorphic UI, smooth candlestick charts, live order books, real-time price tickers. It does not look or feel like a student project. The same visual care that went into the architecture went into the interface.

**The codebase is readable and educational.** The C++ backend is clean, well-structured OOP. The Rust bridge is a single async command. The React components follow standard patterns. Anyone studying the code to understand multi-tier desktop architecture will find it straightforward to trace from a button click in the UI all the way down to a line being written in a text file.

---

## 2. Author's Note

This project started as a semester requirement and became something more involved than any of us expected. The decision to connect a C++ backend to a React frontend through a Rust IPC bridge was not the obvious path — a Python backend or a Node.js server would have been simpler to wire up. But the Cyber Security curriculum emphasizes understanding systems at a low level, and using C++ for the financial engine forced us to think carefully about memory, file I/O, and data serialization in ways that a scripting language would have abstracted away.

The hardest part of the project was not writing the C++ classes or building the React components — it was making the two ends of the pipeline talk to each other correctly and handling the edge cases where the C++ binary's output format did not match what the React layer expected. That debugging process, tracing data across three languages and two process boundaries, was the most valuable part of the whole exercise.

The candlestick chart zoom and pan implementation also took longer than expected. The first version caused visible frame drops because we had zoom coordinates in React state, which meant every price tick triggered a viewport recalculation. The ref-based debounce solution came after studying how professional charting libraries handle the same problem.

We would like to thank **Miss Muneeba Ahmed** for her detailed feedback on our OOP design — specifically for pushing us to justify every inheritance decision and not use inheritance where composition would be more appropriate — and **Miss Almas Ayesha Ansari** for her guidance on software engineering documentation, requirements traceability, and the discipline of writing architecture decisions down before writing code.

---

## 3. Summary

Aegis Finance is a desktop personal finance application built across three programming languages: C++17 for business logic, Rust and Tauri v2 for native desktop integration and IPC, and React with TypeScript for the user interface. All financial data is stored locally in plain text files with no cloud dependency.

The application combines a complete cash-flow ledger — tracking income, bills, savings, and tax obligations — with a simulated live investment market where users can trade virtual stock and crypto assets using their budget balance. A pre-commit transaction validator enforces budget integrity before any data is written to disk. Bill management includes automatic tax splitting and compound late-penalty calculations. Investment tracking uses double-entry recording that separately logs the principal refund and the capital gain or loss on every position close.

The architecture demonstrates real-world multi-tier desktop software design: a standalone C++ binary acting as a domain engine, a Rust sidecar launcher managing process I/O, and a debounced React state layer keeping the live-updating chart interface smooth. The result is an application that is computationally correct, visually premium, and entirely offline — suitable as both a personal finance learning tool and a demonstration of systems programming integrated with modern frontend development.

---

<div align="center">

*Aegis Finance is a student project submitted in partial fulfillment of course requirements at Air University Karachi Campus.*  
*It does not connect to any real financial institutions, live market data feeds, or cloud services.*  
*All market prices and simulated data are generated locally.*

</div>
