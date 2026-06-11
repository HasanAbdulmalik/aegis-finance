# Semester Project: Aegis Finance 🛡️
### An Integrated Expense Tracker and Asset Management System

---

## 🏛️ Academic & Project Metadata
*   **University:** Air University Karachi Campus
*   **Department:** Cyber Security
*   **Course(s):**
    1.  **Object-Oriented Programming Structures** (Instructor: *Miss Muneeba Ahmed*)
    2.  **Introduction to Software Engineering** (Instructor: *Miss Almas Ayesha Ansari*)
*   **Authors:**
    1.  **Syed Muhammad Hasan** (ID: `2540040`)
    2.  **Ibad ur Rehman Khan** (ID: `2540042`)
    3.  **Ahmed Memon** (ID: `2540194`)
*   **Submission Date:** June 2026

---

## 📝 Description of the Application

### 1. Languages and Modules Used

The system is built as a hybrid desktop application combining low-level object-oriented systems programming with high-end, responsive web graphical interfaces:

*   **Backend Core Engine (C++)**: 
    *   Written in **ISO C++17** using standard libraries (`<iostream>`, `<vector>`, `<string>`, `<fstream>`, `<sstream>`, `<iomanip>`).
    *   Leverages the **Standard Template Library (STL)** for container management and customized text-file serialization/deserialization.
*   **Desktop IPC Bridge (Rust / Tauri v2)**:
    *   Implements **Rust** for native application windows, system shell execution, and thread safety.
    *   Uses **Tauri v2** (`@tauri-apps/api` and `tauri-plugin-shell`) as a secure, fast IPC (Inter-Process Communication) bridge between React and the C++ engine.
*   **Frontend Graphical User Interface (React / TypeScript)**:
    *   Built with **TypeScript** and **React (v19)** powered by **Vite** for optimized, fast dev and production builds.
    *   Styled with **Vanilla CSS3** utilizing custom CSS variables, custom-designed glassmorphism layouts, and smooth animations.
*   **Data Visualization & Styling (Lucide & ApexCharts)**:
    *   Uses **ApexCharts** and `react-apexcharts` to render real-time candlestick charts for simulated stocks/crypto assets, donut charts for budget shares, and order books.
    *   Uses **Lucide React** for modern, crisp vector iconography.

---

### 2. How We Made It (Architecture & OOP Details)

The project is structured under a **three-tier architecture**:

#### A. The C++ Object-Oriented Domain Layer
The foundation of Aegis Finance lies in its strict C++ Object-Oriented design:
*   **Inheritance Hierarchy**: We established a polymorphic base class `Transaction` containing virtual method `.apply()`. Specialized transaction models inherit from this:
    *   `SalaryIncome`: Credits the ledger and increments salary incomes.
    *   `Expense`: Deducts balance and categorizes general outflows (Taxes, Penalties, Bills).
    *   `InvestmentExpense`: Deducts cash and increments the active investment principal pool.
    *   `InvestmentRefund`: Credits cash and deducts the active principal pool upon stock liquidation.
    *   `InvestmentProfit`: Credits/deducts cash with capital gain/loss values.
    *   `SavingsTransfer`: Transfers liquid cash into long-term savings.
*   **Encapsulated Managers**: 
    *   `Ledger`: Tracks cash balance, total savings, income breakdown, net worth, and handles double-entry balance bookkeeping.
    *   `BillManager`: Reads and writes bill records from `bills.txt`, handles automatic tax splits, and computes overdue late fees.
    *   `PortfolioManager`: Oversees active stock positions, processes liquidations, and serializes updates to `stocks.txt`.

#### B. The Rust-Tauri IPC Bridging Layer
The C++ core compiles into a separate backend console application. The Tauri wrapper coordinates execution using asynchronous Rust tasks:
*   Tauri exposes a Rust invocation command: `run_finance_command(cmd_json: String)`.
*   When a user clicks an action in the GUI, the JSON parameters are serialized and sent over the Tauri bridge.
*   The Rust sidecar launcher spawns the compiled C++ binary, pipes the command through standard input (`stdin`), listens to standard output (`stdout`), reads the updated JSON ledger database, and pipes it back to React.

#### C. The State-Ref Debounced React Layer
Because the app updates live stock prices every second, we designed a custom state synchronization protocol:
*   **Ref-State Separation**: Staging coordinates and manual zoom/pan levels are tracked in a React ref (`chartMinMaxValRef`) synchronously. A debounced state updater updates the React state 150ms after scroll/drag operations stop. This separates the native canvas drawing operations from React's virtual DOM re-renders, preventing chart jitter and coordinate lag.
*   **Live Tickers**: Utilizes intervals to update asset prices based on randomized volatility multipliers.

---

### 3. What the App Does

Aegis Finance is a desktop financial dashboard that helps users organize their budget, track recurring bills, and simulate trading stock/cryptocurrency assets. It functions as a complete sandbox database:
*   Users add their monthly income and bills.
*   The application reads and writes ledger histories to local flat-file databases (`ledger.txt`, `bills.txt`, `stocks.txt`).
*   It provides real-time mathematical validation before committing records to prevent account overdrafts.
*   It offers a simulated live market where users can "buy" and "sell" volatile assets using their ledger cash balance, charting their portfolio value dynamically.

---

### 4. What Are the Features?

*   **Integrated Cash-Flow Ledger**: Complete logging of all salaries, savings deposits, and general bills.
*   **Double-Entry Stock Sale Recording**: Unlike basic trackers that only log net returns, Aegis logs the exact cost-basis principal refund (`Principal Refund`) and net capital gain/loss (`P/L from Stock`) separately, preserving accounting integrity.
*   **Staged Transaction Balance Validation Scanner**: Pre-scans all inputs in the queue. If your cumulative staged expenses exceed your current cash + staged income, it disables the commit button and displays an alert card specifying the shortfall.
*   **Bill Tax & Late Penalties**: 
    *   Automatically splits utility bills to allocate a **5% tax component** to the state.
    *   Applies a **3% base penalty** + daily compounding fees on overdue bills.
*   **Smooth Charting**: High-resolution candlestick charts with native scroll-wheel zooming and click-and-drag panning.
*   **Live Order Book & Time & Sales Tick Feed**: Interactive trading dashboard showing active bids/asks and transaction logs.

---

### 5. Why This App is Necessary

In today’s digital age, financial literacy is crucial, yet most personal finance tools are fragmented:
*   Traditional spreadsheets require high manual effort to calculate taxes, penalties, and investment returns.
*   Commercial finance tools connect directly to real bank accounts, making them risky for students to learn trading concepts.
*   Most platforms separate budget tracking from investment tracking. Aegis Finance fills this gap by providing a single desktop workspace where cash assets, expenses, and investments interact dynamically in a safe, offline sandbox environment.

---

### 6. Why Users Should Use It

*   **100% Offline & Private**: All data is stored locally in text files; no cloud synchronization or financial accounts connection is required.
*   **Risk-Free Simulator**: Practice investing in volatile markets using your virtual cash.
*   **Strict Math Controls**: The built-in scanner prevents you from planning unrealistic budgets that would result in debt.
*   **Premium User Interface**: Dark mode glassmorphic UI elements provide a premium visual experience.

---

## 🖼️ Attached Images
*(Screenshots will be uploaded here to demonstrate visual features: dashboard cards, candlestick panning, warning banners, and the ledger history table).*

*   **Figure 1**: Core Dashboard Overview
*   **Figure 2**: Live Trading panel with Smooth Candlestick Zooming
*   **Figure 3**: Insufficient Funds validation scanner banner

---

## ✍️ Author's Note

This semester project represents a integration of theoretical object-oriented C++ designs with modern software engineering workflows. Developing Aegis Finance allowed us to tackle real-world challenges, such as synchronizing asynchronous web states with low-level compiled command streams, managing file serialization under strict formats, and building high-performance interactive interfaces. 

We would like to express our gratitude to **Miss Muneeba Ahmed** and **Miss Almas Ayesha Ansari** for their guidance, design critiques, and support throughout the semester.

---

## 📊 Summary

Aegis Finance successfully demonstrates that desktop software can be both computationally robust and visually premium. By combining the safety of local C++ serialization with a dynamic React frontend, it offers a personal financial organizer and trading sandbox tailored for students, beginners, and security-minded users.
