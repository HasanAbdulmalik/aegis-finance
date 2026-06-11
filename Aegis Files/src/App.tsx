import { useState, useEffect, useMemo, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { 
  Coins, 
  TrendingUp, 
  History, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Menu, 
  X, 
  Plus, 
  Percent, 
  Layers,
  HelpCircle,
  LogOut,
  User
} from "lucide-react";
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";
import "./App.css";

interface AssetConfig {
  name: string;
  fullName: string;
  basePrice: number;
  volatility: number;
}

const ASSETS: AssetConfig[] = [
  { name: "BTC", fullName: "Bitcoin", basePrice: 60000, volatility: 0.015 },
  { name: "ETH", fullName: "Ethereum", basePrice: 3200, volatility: 0.02 },
  { name: "SOL", fullName: "Solana", basePrice: 150, volatility: 0.035 },
  { name: "AVAX", fullName: "Avalanche", basePrice: 35, volatility: 0.04 },
  { name: "DOT", fullName: "Polkadot", basePrice: 6, volatility: 0.03 },
  { name: "DOGE", fullName: "Dogecoin", basePrice: 0.12, volatility: 0.05 },
  { name: "ADA", fullName: "Cardano", basePrice: 0.45, volatility: 0.03 },
  { name: "AAPL", fullName: "Apple Inc.", basePrice: 180, volatility: 0.005 },
  { name: "TSLA", fullName: "Tesla Inc.", basePrice: 220, volatility: 0.025 },
  { name: "NVDA", fullName: "NVIDIA Corp.", basePrice: 120, volatility: 0.03 },
  { name: "MSFT", fullName: "Microsoft Corp.", basePrice: 420, volatility: 0.006 },
  { name: "AMZN", fullName: "Amazon.com Inc.", basePrice: 180, volatility: 0.008 },
  { name: "GOOGL", fullName: "Alphabet Inc.", basePrice: 170, volatility: 0.007 },
  { name: "META", fullName: "Meta Platforms", basePrice: 480, volatility: 0.012 },
  { name: "NFLX", fullName: "Netflix Inc.", basePrice: 650, volatility: 0.015 },
];

interface Candle {
  x: Date;
  y: [number, number, number, number];
}

interface SimulatedMarket {
  [key: string]: {
    currentPrice: number;
    candles: Candle[];
  };
}

interface Transaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  monthYear: string;
}

interface Bill {
  name: string;
  baseAmount: number;
  taxComponent: number;
  dueDate: string;
  isPaid: boolean;
  billType: string;
  monthYear: string;
}

interface CppInvestment {
  stockName: string;
  investedAmount: number;
  currentValue: number;
  entryTax: number;
  profitLoss: number;
  monthYear: string;
}

interface FinanceData {
  balance: number;
  savings: number;
  deficits: number;
  transactions: Transaction[];
  bills: Bill[];
  investments: CppInvestment[];
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

interface TimeSalesTick {
  time: string;
  price: number;
  size: number;
  type: "buy" | "sell";
}

function getDaysInMonth(monthStr: string, yearNum: number): number {
  const m = monthStr.toLowerCase();
  if (m === "february") {
    const isLeap = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
    return isLeap ? 29 : 28;
  }
  if (["april", "june", "september", "november"].includes(m)) {
    return 30;
  }
  return 31;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Dynamically generate years list starting from 1920 going up to the current year (ascending order)
const currentYearValue = new Date().getFullYear();
const YEARS = Array.from({ length: currentYearValue - 1920 + 1 }, (_, i) => 1920 + i);

const PROFESSIONS = [
  "Freelancer",
  "Student",
  "Corporate employee",
  "Government official",
  "Business owner",
  "Consultant",
  "Retired"
];

// Custom Premium Glassmorphic Dropdown Component
interface CustomSelectProps {
  value: string | number | null;
  onChange: (value: any) => void;
  options: { value: any; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  defaultScrollToBottom?: boolean;
}

function CustomSelect({ value, onChange, options, placeholder = "Select option", disabled = false, defaultScrollToBottom = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && optionsRef.current) {
      const t = setTimeout(() => {
        if (optionsRef.current) {
          const activeEl = optionsRef.current.querySelector(".custom-select-option.active");
          if (activeEl) {
            activeEl.scrollIntoView({ block: "nearest" });
          } else if (defaultScrollToBottom) {
            optionsRef.current.scrollTop = optionsRef.current.scrollHeight;
          }
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, defaultScrollToBottom]);

  return (
    <div className="custom-select-container">
      <div 
        className="custom-select-trigger glass-input" 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1
        }}
      >
        <span style={{ color: selectedOption ? "var(--text-main)" : "var(--text-muted)", opacity: selectedOption ? 1 : 0.6 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ fontSize: "0.7rem", transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </div>
      {isOpen && !disabled && (
        <>
          <div className="custom-select-overlay" onClick={() => setIsOpen(false)} />
          <div className="custom-select-options glass-card fade-in" ref={optionsRef}>
            {options.map((opt) => (
              <div 
                key={opt.value} 
                className={`custom-select-option ${value === opt.value ? "active" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


function AegisLogo() {
  return (
    <img 
      src="/aegis_logo.png" 
      alt="Aegis Finance Logo" 
      style={{ 
        width: "32px", 
        height: "32px", 
        objectFit: "contain",
        filter: "drop-shadow(0 0 8px rgba(0, 245, 160, 0.45))"
      }} 
    />
  );
}

interface StagedEntry {
  id: string;
  type: "salary" | "bill" | "invest" | "savings_transfer";
  displayCategory: string;
  displayStr: string;
  amount: number;
  data: any;
}

export default function App() {
  // Login Session state
  const [userSession, setUserSession] = useState<{ name: string; profession: string } | null>(null);
  const [loginName, setLoginName] = useState<string>("");
  const [loginProfession, setLoginProfession] = useState<string>("");

  const [activeTab, setActiveTab] = useState<string>("input");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const zoomRangeRef = useRef<{ min: number; max: number } | null>(null);
  const [chartMinMax, setChartMinMax] = useState<{ min: number; max: number } | null>(null);
  const chartMinMaxValRef = useRef<{ min: number; max: number } | null>(null);
  const chartMinMaxDebounceRef = useRef<any>(null);

  const updateChartMinMaxDebounced = (val: { min: number; max: number } | null) => {
    chartMinMaxValRef.current = val;
    if (chartMinMaxDebounceRef.current) {
      clearTimeout(chartMinMaxDebounceRef.current);
    }
    chartMinMaxDebounceRef.current = setTimeout(() => {
      setChartMinMax(val);
    }, 150);
  };

  const [financeData, setFinanceData] = useState<FinanceData>({
    balance: 0,
    savings: 0,
    deficits: 0,
    transactions: [],
    bills: [],
    investments: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Market simulation states
  const [market, setMarket] = useState<SimulatedMarket>({});
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");

  // Reset zoom range when selectedAsset changes
  useEffect(() => {
    zoomRangeRef.current = null;
    chartMinMaxValRef.current = null;
    if (chartMinMaxDebounceRef.current) {
      clearTimeout(chartMinMaxDebounceRef.current);
    }
    setChartMinMax(null);
  }, [selectedAsset]);

  // Pro Trading Sidebar states
  const [isProTrading, setIsProTrading] = useState<boolean>(true);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [timeSales, setTimeSales] = useState<TimeSalesTick[]>([]);

  // Theme & Settings dropdown state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"name" | "profession" | "clear" | "consolidate" | "finish_batch" | null>(null);
  const [tempName, setTempName] = useState<string>("");
  const [tempProfession, setTempProfession] = useState<string>("Freelancer");

  const [stagedEntries, setStagedEntries] = useState<StagedEntry[]>([]);
  
  // Dynamic validation scanner for staged transactions
  const projectedBalance = useMemo(() => {
    let current = financeData.balance;
    for (const entry of stagedEntries) {
      if (entry.type === "salary") {
        current += entry.amount;
      } else {
        current -= entry.amount;
      }
    }
    return current;
  }, [financeData.balance, stagedEntries]);

  const [customAlert, setCustomAlert] = useState<{ title: string; message: string; type: "info" | "warning" | "error" } | null>(null);
  const [sellConfirmInv, setSellConfirmInv] = useState<{ index: number; stockName: string; investedAmount: number; entryTax: number; currentValue: number; profitLoss: number; monthYear: string } | null>(null);

  const showCustomAlert = (title: string, message: string, type: "info" | "warning" | "error" = "warning") => {
    setCustomAlert({ title, message, type });
  };

  // Form states (Blank by default)
  const [formType, setFormType] = useState<string>("salary");
  const [formMonth, setFormMonth] = useState<string>("");
  const [formYear, setFormYear] = useState<number | null>(null);
  const [formDay, setFormDay] = useState<number | null>(null);
  const [formAmount, setFormAmount] = useState<string>("");
  const [formDesc, setFormDesc] = useState<string>("");

  // Form states specific to Bills
  const [billName, setBillName] = useState<string>("");
  const [billDueDay, setBillDueDay] = useState<number | null>(null);
  const [billStatus, setBillStatus] = useState<"paid" | "unpaid" | "overdue">("paid");

  // Form states specific to Savings Custom Transfers
  const [savingsPercent, setSavingsPercent] = useState<number>(30);

  // Form states specific to Investments
  const [investAsset, setInvestAsset] = useState<string>("BTC");

  // History states
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>("");

  // Effect to apply body theme class
  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-theme" : "light-theme";
  }, [theme]);

  // Initialize market simulation
  useEffect(() => {
    const initialMarket: SimulatedMarket = {};
    ASSETS.forEach((asset) => {
      let currentPrice = asset.basePrice;
      let candles: Candle[] = [];
      let time = Date.now() - 300 * 60000;

      for (let i = 0; i < 300; i++) {
        const change = (Math.random() - 0.5) * asset.volatility * 4;
        const open = currentPrice;
        const close = currentPrice * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * asset.volatility);
        const low = Math.min(open, close) * (1 - Math.random() * asset.volatility);
        candles.push({
          x: new Date(time),
          y: [
            parseFloat(open.toFixed(2)),
            parseFloat(high.toFixed(2)),
            parseFloat(low.toFixed(2)),
            parseFloat(close.toFixed(2))
          ]
        });
        currentPrice = close;
        time += 60000;
      }
      initialMarket[asset.name] = { currentPrice, candles };
    });
    setMarket(initialMarket);
  }, []);

  // Market simulation tick (every 3 seconds)
  useEffect(() => {
    if (Object.keys(market).length === 0) return;

    const interval = setInterval(() => {
      setMarket((prev) => {
        const next = { ...prev };
        ASSETS.forEach((asset) => {
          const state = prev[asset.name];
          if (!state) return;

          const change = (Math.random() - 0.5) * asset.volatility * 1.5;
          const open = state.currentPrice;
          const close = open * (1 + change);
          const high = Math.max(open, close) * (1 + Math.random() * asset.volatility * 0.5);
          const low = Math.min(open, close) * (1 - Math.random() * asset.volatility * 0.5);

          const nextCandles = [...state.candles];
          const latestCandle = nextCandles[nextCandles.length - 1];

          const diffMs = Date.now() - latestCandle.x.getTime();
          if (diffMs > 15000) {
            if (nextCandles.length > 1000) {
              nextCandles.shift();
            }
            nextCandles.push({
              x: new Date(),
              y: [
                parseFloat(open.toFixed(2)),
                parseFloat(high.toFixed(2)),
                parseFloat(low.toFixed(2)),
                parseFloat(close.toFixed(2))
              ]
            });
          } else {
            latestCandle.y[1] = parseFloat(Math.max(latestCandle.y[1], high).toFixed(2));
            latestCandle.y[2] = parseFloat(Math.min(latestCandle.y[2], low).toFixed(2));
            latestCandle.y[3] = parseFloat(close.toFixed(2));
          }

          next[asset.name] = {
            currentPrice: close,
            candles: nextCandles
          };
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [market]);

  // Smooth scroll-zoom handler for the candlestick chart
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const activeAssetData = market[selectedAsset];
      if (!activeAssetData || activeAssetData.candles.length === 0) return;

      // Prevent default page scroll when scrolling over the chart container
      e.preventDefault();

      const times = activeAssetData.candles.map(c => new Date(c.x).getTime());
      const totalMin = Math.min(...times);
      const totalMax = Math.max(...times);

      // Default view is the last 30 candles if no manual zoom range has been established
      const currentMin = chartMinMaxValRef.current?.min ?? chartMinMax?.min ?? (totalMax - 30 * 60000);
      const currentMax = chartMinMaxValRef.current?.max ?? chartMinMax?.max ?? totalMax;
      const diff = currentMax - currentMin;
      
      // Zoom factor: negative deltaY means scrolling up (zoom in), positive means scrolling down (zoom out)
      const zoomFactor = e.deltaY < 0 ? 0.05 : -0.05;
      
      let newMin = currentMin + diff * zoomFactor;
      let newMax = currentMax - diff * zoomFactor;

      // Limit zooming in too far (minimum of 3 candles / 3 minutes)
      const minDuration = 3 * 60000;
      if (newMax - newMin < minDuration) {
        newMin = currentMin;
        newMax = currentMax;
      }

      // Clamp zoom out to total range with a bit of padding
      if (newMin < totalMin - 60000) newMin = totalMin - 60000;
      if (newMax > totalMax + 60000) newMax = totalMax + 60000;

      if (newMin >= newMax) return;

      chartMinMaxValRef.current = { min: newMin, max: newMax };
      ApexCharts.exec('apex-candlestick-chart', 'zoomX', newMin, newMax);
      updateChartMinMaxDebounced({ min: newMin, max: newMax });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, [market, selectedAsset]);

  // Pro Trading Ticker Simulation (every 1 second)
  useEffect(() => {
    const activeAssetData = market[selectedAsset];
    if (!activeAssetData) return;

    const currentPrice = activeAssetData.currentPrice;

    // Initialize Order Book
    const initOrderBook = () => {
      const bids: OrderBookEntry[] = [];
      const asks: OrderBookEntry[] = [];
      let bidTotal = 0;
      let askTotal = 0;
      const spread = currentPrice * 0.0008;

      for (let i = 0; i < 6; i++) {
        const bidPrice = currentPrice - (i * spread + Math.random() * spread * 0.4);
        const askPrice = currentPrice + (i * spread + Math.random() * spread * 0.4) + spread;
        const bidSize = selectedAsset.match(/BTC|ETH|SOL|AVAX|DOT|DOGE|ADA/) 
          ? Math.random() * 1.8 + 0.02 
          : Math.random() * 80 + 3;
        const askSize = selectedAsset.match(/BTC|ETH|SOL|AVAX|DOT|DOGE|ADA/) 
          ? Math.random() * 1.8 + 0.02 
          : Math.random() * 80 + 3;

        bidTotal += bidSize;
        askTotal += askSize;

        bids.push({ price: parseFloat(bidPrice.toFixed(2)), size: parseFloat(bidSize.toFixed(4)), total: parseFloat(bidTotal.toFixed(4)) });
        asks.push({ price: parseFloat(askPrice.toFixed(2)), size: parseFloat(askSize.toFixed(4)), total: parseFloat(askTotal.toFixed(4)) });
      }
      setOrderBook({ bids, asks });
    };

    // Initialize Time & Sales
    const initTimeSales = () => {
      const list: TimeSalesTick[] = [];
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const timeStr = new Date(now.getTime() - i * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const priceOffset = (Math.random() - 0.5) * currentPrice * 0.0015;
        const size = selectedAsset.match(/BTC|ETH|SOL|AVAX|DOT|DOGE|ADA/) 
          ? Math.random() * 1.2 + 0.01 
          : Math.random() * 60 + 1;
        list.push({
          time: timeStr,
          price: parseFloat((currentPrice + priceOffset).toFixed(2)),
          size: parseFloat(size.toFixed(4)),
          type: Math.random() > 0.5 ? "buy" : "sell"
        });
      }
      setTimeSales(list);
    };

    initOrderBook();
    initTimeSales();

    const interval = setInterval(() => {
      setOrderBook(prev => {
        const nextBids = prev.bids.map(b => {
          if (Math.random() > 0.5) {
            const delta = (Math.random() - 0.5) * b.size * 0.15;
            return { ...b, size: parseFloat(Math.max(0.001, b.size + delta).toFixed(4)) };
          }
          return b;
        });
        const nextAsks = prev.asks.map(a => {
          if (Math.random() > 0.5) {
            const delta = (Math.random() - 0.5) * a.size * 0.15;
            return { ...a, size: parseFloat(Math.max(0.001, a.size + delta).toFixed(4)) };
          }
          return a;
        });

        let bidTotal = 0;
        const bidsWithTotals = nextBids.map(b => {
          bidTotal += b.size;
          return { ...b, total: parseFloat(bidTotal.toFixed(4)) };
        });

        let askTotal = 0;
        const asksWithTotals = nextAsks.map(a => {
          askTotal += a.size;
          return { ...a, total: parseFloat(askTotal.toFixed(4)) };
        });

        return { bids: bidsWithTotals, asks: asksWithTotals };
      });

      if (Math.random() > 0.3) {
        setTimeSales(prev => {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const priceOffset = (Math.random() - 0.5) * currentPrice * 0.0008;
          const size = selectedAsset.match(/BTC|ETH|SOL|AVAX|DOT|DOGE|ADA/) 
            ? Math.random() * 1.5 + 0.01 
            : Math.random() * 80 + 1;
          const nextTick: TimeSalesTick = {
            time: nowStr,
            price: parseFloat((currentPrice + priceOffset).toFixed(2)),
            size: parseFloat(size.toFixed(4)),
            type: Math.random() > 0.58 ? "buy" : "sell"
          };
          return [nextTick, ...prev.slice(0, 14)];
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAsset, market]);

  // IPC execution wrapper
  const executeCommand = async (cmdObj: any) => {
    try {
      const cmdJson = JSON.stringify(cmdObj);
      const rawRes = await invoke<string>("run_finance_command", { cmdJson });
      const parsed = JSON.parse(rawRes);
      setFinanceData(parsed);
      setLoading(false);
      return parsed;
    } catch (err) {
      console.error("Failed to execute C++ command:", err);
      showCustomAlert("Engine Error", String(err), "error");
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    executeCommand({ cmd: "load_data" });
  }, []);

  // Update default day count when Month/Year changes
  useEffect(() => {
    if (formMonth && formYear && formDay) {
      const days = getDaysInMonth(formMonth, formYear);
      if (formDay > days) {
        setFormDay(days);
      }
    }
  }, [formMonth, formYear, formDay]);

  // Selected Month formatted for C++ ("YYYY-MM")
  const selectedMonthYearStr = useMemo(() => {
    if (!formMonth || !formYear) return "";
    const monthIdx = MONTHS.indexOf(formMonth) + 1;
    const monthPad = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
    return `${formYear}-${monthPad}`;
  }, [formMonth, formYear]);

  // Reset form inputs (without defaults) on Type/Asset changes
  useEffect(() => {
    setFormAmount("");
    if (formType === "salary") {
      setFormDesc("Monthly Salary");
    } else if (formType === "bill") {
      setBillName("Electricity");
      setFormDesc("Monthly Power Utility");
    } else if (formType === "invest") {
      setFormDesc(`Purchase ${investAsset}`);
    } else if (formType === "savings") {
      setFormDesc("Accumulation savings transfer");
    }
  }, [formType, investAsset]);

  // Calculate bill properties dynamically for UI feedback
  const dynamicBillCalculation = useMemo(() => {
    const amountVal = parseFloat(formAmount) || 0;
    const taxVal = amountVal * 0.05; // 5% automatic allocation
    const base = Math.max(0, amountVal - taxVal);

    let lateDays = 0;
    if (formDay && billDueDay) {
      lateDays = Math.max(0, formDay - billDueDay);
    }
    let penalty = 0;

    if (billStatus === "unpaid") {
      penalty = lateDays > 0 ? (base * 0.03 + lateDays * 0.5) : 0;
    } else if (billStatus === "overdue") {
      penalty = lateDays > 0 ? (base * 0.03) : 0;
    }

    return {
      base,
      tax: taxVal,
      lateDays,
      penalty,
      total: base + taxVal + penalty
    };
  }, [formAmount, formDay, billDueDay, billStatus]);

  // Dynamically calculate preview ratios (Gross-Inclusive Math)
  const pieChartData = useMemo(() => {
    const amountVal = parseFloat(formAmount) || 0;

    if (formType === "savings_transfer") {
      const transferAmount = parseFloat((financeData.balance * (savingsPercent / 100)).toFixed(2));
      const remaining = Math.max(0, financeData.balance - transferAmount);
      if (financeData.balance <= 0) {
        return {
          labels: ["Remaining Cash", "Savings Transfer"],
          series: [100, 0]
        };
      }
      return {
        labels: ["Remaining Cash", "Savings Transfer"],
        series: [remaining, transferAmount]
      };
    }

    if (amountVal <= 0) {
      return { labels: [], series: [] };
    }

    if (formType === "salary") {
      // 5% tax deduction gross inclusive: 95% net, 5% tax
      const taxComponent = amountVal * 0.05;
      const netComponent = amountVal - taxComponent;
      return {
        labels: ["Net Salary", "Income Tax"],
        series: [netComponent, taxComponent]
      };
    } else if (formType === "bill") {
      const { base, tax, penalty } = dynamicBillCalculation;
      if (billStatus === "paid") {
        return {
          labels: ["Base Amount", "Tax Component"],
          series: [base, tax]
        };
      } else {
        return {
          labels: ["Base Amount", "Tax Component", "Late Penalty"],
          series: [base, tax, penalty]
        };
      }
    } else if (formType === "invest") {
      // Amount represents gross limit, 1% brokerage tax
      const taxComponent = amountVal * 0.01;
      const baseComponent = Math.max(0, amountVal - taxComponent);
      return {
        labels: ["Invested Principal", "Brokerage / Tax"],
        series: [baseComponent, taxComponent]
      };
    }

    return { labels: [], series: [] };
  }, [formType, formAmount, savingsPercent, financeData.balance, billStatus, dynamicBillCalculation]);

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim()) {
      showCustomAlert("Required Field", "Please enter your name to proceed.", "warning");
      return;
    }
    if (!loginProfession) {
      showCustomAlert("Required Field", "Please select your profession to proceed.", "warning");
      return;
    }
    setUserSession({
      name: loginName.trim(),
      profession: loginProfession
    });
    setTempName(loginName.trim());
    setTempProfession(loginProfession);
  };

  // Profile update handlers
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) {
      showCustomAlert("Validation Error", "Name cannot be empty.", "warning");
      return;
    }
    setUserSession(prev => prev ? { ...prev, name: tempName.trim() } : null);
    setModalType(null);
  };

  const handleSaveProfession = (e: React.FormEvent) => {
    e.preventDefault();
    setUserSession(prev => prev ? { ...prev, profession: tempProfession } : null);
    setModalType(null);
  };

  // Form submission handler: stages entries locally
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formType !== "savings_transfer") {
      if (!formYear || !formMonth || !formDay) {
        showCustomAlert("Validation Error", "Please select a valid Year, Month, and Day to stage the transaction.", "warning");
        return;
      }
    } else {
      if (!formYear || !formMonth) {
        showCustomAlert("Validation Error", "Please select a valid Year and Month first.", "warning");
        return;
      }
    }

    const monthIdx = MONTHS.indexOf(formMonth) + 1;
    const monthPad = monthIdx < 10 ? `0${monthIdx}` : `${monthIdx}`;
    const dayPad = formDay && formDay < 10 ? `0${formDay}` : `${formDay}`;
    const dateStr = `${formYear}-${monthPad}-${dayPad || "01"}`;
    const myStr = `${formYear}-${monthPad}`;

    if (formType === "savings_transfer") {
      const transferAmount = parseFloat((financeData.balance * (savingsPercent / 100)).toFixed(2));
      if (transferAmount <= 0) {
        showCustomAlert("Validation Error", "Transfer amount must be greater than 0.", "warning");
        return;
      }
      if (transferAmount > financeData.balance) {
        showCustomAlert("Validation Error", "Insufficient balance to transfer.", "warning");
        return;
      }

      const newEntry: StagedEntry = {
        id: Math.random().toString(36).substr(2, 9),
        type: "savings_transfer",
        displayCategory: "Savings Transfer",
        displayStr: `Transferred ${savingsPercent}% to Savings ($${transferAmount.toFixed(2)})`,
        amount: transferAmount,
        data: {
          cmd: "add_savings",
          amount: transferAmount,
          desc: `Transferred ${savingsPercent}% to Savings`,
          date: dateStr,
          my: myStr
        }
      };

      setStagedEntries(prev => [...prev, newEntry]);
      setFormAmount("");
      setFormDesc("");
      setFormDay(null);
      return;
    }

    const enteredAmount = parseFloat(formAmount);
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      showCustomAlert("Validation Error", "Please enter a valid positive amount.", "warning");
      return;
    }

    if (formType === "salary") {
      const newEntry: StagedEntry = {
        id: Math.random().toString(36).substr(2, 9),
        type: "salary",
        displayCategory: "Salary",
        displayStr: `${formDesc || "Salary Income"} ($${enteredAmount.toFixed(2)})`,
        amount: enteredAmount,
        data: {
          cmd: "add_salary",
          amount: enteredAmount,
          desc: formDesc || "Salary Income",
          date: dateStr,
          my: myStr
        }
      };
      setStagedEntries(prev => [...prev, newEntry]);

    } else if (formType === "bill") {
      if (billStatus !== "paid" && !billDueDay) {
        showCustomAlert("Validation Error", "Please select a Due Day for the unpaid/overdue bill.", "warning");
        return;
      }
      const { base, tax, penalty } = dynamicBillCalculation;
      const dueDayPad = billDueDay && billDueDay < 10 ? `0${billDueDay}` : `${billDueDay}`;
      const dueDateStr = `${formYear}-${monthPad}-${dueDayPad}`;
      const totalBillAmount = base + tax + penalty;

      const newEntry: StagedEntry = {
        id: Math.random().toString(36).substr(2, 9),
        type: "bill",
        displayCategory: `Bill (${billStatus.toUpperCase()})`,
        displayStr: `${billName || "Utility"} ($${totalBillAmount.toFixed(2)})`,
        amount: totalBillAmount,
        data: {
          cmd: "add_bill",
          name: billName || "Utility",
          amount: base,
          tax: tax,
          due: dueDateStr,
          my: myStr,
          on_time: billStatus !== "overdue",
          sub_date: dateStr,
          pay_now: billStatus !== "unpaid"
        }
      };
      setStagedEntries(prev => [...prev, newEntry]);

    } else if (formType === "invest") {
      const enteredTax = enteredAmount * 0.01; // 1% automatic entry tax
      const baseAmount = Math.max(0, enteredAmount - enteredTax);

      const newEntry: StagedEntry = {
        id: Math.random().toString(36).substr(2, 9),
        type: "invest",
        displayCategory: "Investment",
        displayStr: `Buy ${investAsset} ($${enteredAmount.toFixed(2)})`,
        amount: enteredAmount,
        data: {
          cmd: "invest",
          stock: investAsset,
          amount: baseAmount,
          tax: enteredTax,
          date: dateStr,
          my: myStr
        }
      };
      setStagedEntries(prev => [...prev, newEntry]);
    }

    // Reset Form Inputs except year/month
    setFormAmount("");
    setFormDesc("");
    setBillName("");
    setFormDay(null);
    setBillDueDay(null);
  };

  // Process and save all staged entries sequentially
  const handleFinishSaveBatch = async () => {
    if (projectedBalance < 0) {
      showCustomAlert(
        "Validation Failed",
        `Cannot commit batch because the projected balance would drop below zero to $${projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Please adjust your staged transactions.`,
        "error"
      );
      return;
    }
    setModalType(null);
    setLoading(true);
    try {
      for (const entry of stagedEntries) {
        await executeCommand(entry.data);
      }
      setStagedEntries([]);
      setFormYear(null);
      setFormMonth("");
      showCustomAlert("Success", "All staged monthly records have been saved successfully to history.", "info");
    } catch (err) {
      console.error("Failed to save batch:", err);
      showCustomAlert("Error", "An error occurred while saving the monthly record batch.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Sell active investment (called after custom modal confirmation)
  const handleSellInvestment = async (index: number, stockName: string) => {
    const currentPrice = market[stockName]?.currentPrice;
    if (!currentPrice) {
      showCustomAlert("Market Status", "Live price feed not ready yet.", "info");
      return;
    }

    const asset = ASSETS.find(a => a.name === stockName);
    const baselinePrice = asset ? asset.basePrice : currentPrice;

    const originalInv = financeData.investments[index];
    const shares = originalInv.investedAmount / baselinePrice;
    const sellPrice = shares * currentPrice;

    const todayStr = new Date().toISOString().split("T")[0];

    setLoading(true);
    await executeCommand({
      cmd: "sell_investment",
      invest_index: index,
      sell_price: sellPrice,
      date: todayStr
    });
  };

  // Consolidate current cash into savings click trigger
  const handleConsolidateSavingsClick = () => {
    if (!selectedMonthYearStr) {
      showCustomAlert("Validation Error", "Please select a Year and Month from the form first to consolidate savings.", "warning");
      return;
    }
    setModalType("consolidate");
  };

  // Reset all databases
  const handleClearAllData = () => {
    setModalType("clear");
  };

  // Compute stats card values
  const billStats = useMemo(() => {
    let overdue = 0;
    let paid = 0;
    let unpaid = 0;
    const today = new Date().toISOString().split("T")[0]; 

    financeData.bills.forEach((b) => {
      if (b.isPaid) {
        paid++;
      } else {
        if (b.dueDate < today) {
          overdue++;
        } else {
          unpaid++;
        }
      }
    });

    return { overdue, paid, unpaid };
  }, [financeData]);

  // Compute historical month list
  const historyMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    financeData.transactions.forEach((tx) => monthsSet.add(tx.monthYear));
    financeData.bills.forEach((b) => monthsSet.add(b.monthYear));
    financeData.investments.forEach((i) => monthsSet.add(i.monthYear));
    return Array.from(monthsSet).sort().reverse();
  }, [financeData]);

  // Set default selected history month when list changes (Safe state setters outside useMemo)
  useEffect(() => {
    if (historyMonths.length > 0) {
      if (!selectedHistoryMonth || !historyMonths.includes(selectedHistoryMonth)) {
        setSelectedHistoryMonth(historyMonths[0]);
      }
    } else {
      setSelectedHistoryMonth("");
    }
  }, [historyMonths, selectedHistoryMonth]);

  // History Month Report (Excluding Salary from history outflow pie chart)
  const historyMonthReport = useMemo(() => {
    if (!selectedHistoryMonth) return null;

    const txs = financeData.transactions.filter(t => t.monthYear === selectedHistoryMonth);
    const bills = financeData.bills.filter(b => b.monthYear === selectedHistoryMonth);

    let salary = 0;
    let billsPaid = 0;
    let tax = 0;
    let penalty = 0;
    let invested = 0;
    let savings = 0;
    let investmentPL = 0;
    let investmentRefund = 0;
    let net = 0;

    txs.forEach((t) => {
      if (t.category === "SALARY") salary += t.amount;
      else if (t.category === "BILL") billsPaid += t.amount;
      else if (t.category === "TAX") tax += t.amount;
      else if (t.category === "PENALTY") penalty += t.amount;
      else if (t.category === "INVESTMENT_EXP") invested += t.amount;
      else if (t.category === "SAVINGS") savings += t.amount;
      else if (t.category === "INVESTMENT_PL") investmentPL += t.amount;
      else if (t.category === "INVESTMENT_REF") investmentRefund += t.amount;
    });

    net = salary + investmentPL + investmentRefund - billsPaid - tax - penalty - invested;

    // Outflows only - EXCLUDE SALARY
    const chartCats = {
      Bills: billsPaid,
      Tax: tax,
      Penalties: penalty,
      Investments: invested,
      Savings: savings,
    };

    return {
      txs,
      bills,
      salary,
      billsPaid,
      tax,
      penalty,
      invested,
      savings,
      investmentPL,
      investmentRefund,
      net,
      chartLabels: Object.keys(chartCats),
      chartSeries: Object.values(chartCats)
    };
  }, [selectedHistoryMonth, financeData]);

  // Live valuation adjustments for investments
  const liveInvestments = useMemo(() => {
    return financeData.investments.map((inv) => {
      const currentMarket = market[inv.stockName];
      if (!currentMarket) return inv;

      const asset = ASSETS.find(a => a.name === inv.stockName);
      const baselinePrice = asset ? asset.basePrice : currentMarket.currentPrice;

      const shares = inv.investedAmount / baselinePrice;
      const liveCurrentValue = shares * currentMarket.currentPrice;
      const livePL = liveCurrentValue - inv.investedAmount - inv.entryTax;

      return {
        ...inv,
        currentValue: liveCurrentValue,
        profitLoss: livePL
      };
    });
  }, [financeData.investments, market]);

  // Compute live portfolio aggregates
  const portfolioSummary = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;
    let totalPL = 0;

    liveInvestments.forEach((inv) => {
      totalInvested += inv.investedAmount;
      totalCurrent += inv.currentValue;
      totalPL += inv.profitLoss;
    });

    const plPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrent, totalPL, plPercent };
  }, [liveInvestments]);

  // Active candlestick chart series data
  const candleSeries = useMemo(() => {
    const activeData = market[selectedAsset];
    if (!activeData) return [{ data: [] }];
    return [{ data: activeData.candles.map(c => ({ x: c.x, y: c.y })) }];
  }, [market, selectedAsset]);

  // Viewport range for the candlestick chart
  const xaxisRange = useMemo(() => {
    const activeData = market[selectedAsset];
    if (!activeData || activeData.candles.length === 0) return { min: undefined, max: undefined };

    const times = activeData.candles.map(c => new Date(c.x).getTime());
    const totalMax = Math.max(...times);
    
    // Prioritize the ref value over the state to prevent viewport jumping during live price ticks
    const min = chartMinMaxValRef.current?.min ?? chartMinMax?.min ?? (totalMax - 30 * 60000);
    const max = chartMinMaxValRef.current?.max ?? chartMinMax?.max ?? totalMax;

    return { min, max };
  }, [market, selectedAsset, chartMinMax]);

  // Config options for live candlestick chart
  const candlestickOptions = {
    chart: {
      id: 'apex-candlestick-chart',
      type: 'candlestick' as const,
      height: 350,
      background: 'transparent',
      toolbar: { 
        show: true,
        autoSelected: 'pan' as const,
        tools: {
          download: false,
          selection: false,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      zoom: {
        enabled: true,
        type: 'x' as const,
        autoScaleYaxis: true
      },
      events: {
        zoomed: (_chartContext: any, { xaxis }: any) => {
          if (xaxis && xaxis.min && xaxis.max) {
            chartMinMaxValRef.current = { min: xaxis.min, max: xaxis.max };
            updateChartMinMaxDebounced({ min: xaxis.min, max: xaxis.max });
          } else {
            chartMinMaxValRef.current = null;
            updateChartMinMaxDebounced(null);
          }
        },
        scrolled: (_chartContext: any, { xaxis }: any) => {
          if (xaxis && xaxis.min && xaxis.max) {
            chartMinMaxValRef.current = { min: xaxis.min, max: xaxis.max };
            updateChartMinMaxDebounced({ min: xaxis.min, max: xaxis.max });
          } else {
            chartMinMaxValRef.current = null;
            updateChartMinMaxDebounced(null);
          }
        }
      },
      animations: { enabled: false }
    },
    theme: { mode: theme },
    xaxis: {
      type: 'datetime' as const,
      min: xaxisRange.min,
      max: xaxisRange.max,
      labels: { style: { colors: theme === "dark" ? '#9ca3af' : '#4b5563', fontFamily: 'Plus Jakarta Sans' } }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: { colors: theme === "dark" ? '#9ca3af' : '#4b5563', fontFamily: 'Space Grotesk' },
        formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    },
    grid: { borderColor: theme === "dark" ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00f5a0',
          downward: '#f43f5e'
        }
      }
    }
  };

  // Config options for split-view live pie chart
  const pieChartOptions = {
    chart: {
      type: 'donut' as const,
      background: 'transparent'
    },
    theme: { mode: theme },
    labels: pieChartData.labels,
    colors: ['#7c3aed', '#00f5a0', '#f43f5e', '#3b82f6'],
    legend: {
      position: 'bottom' as const,
      labels: { colors: theme === "dark" ? '#9ca3af' : '#4b5563', fontFamily: 'Plus Jakarta Sans' }
    },
    stroke: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: true, color: theme === "dark" ? '#9ca3af' : '#4b5563', fontFamily: 'Plus Jakarta Sans' },
            value: { 
              show: true, 
              color: theme === "dark" ? '#ffffff' : '#0f172a',
              fontFamily: 'Space Grotesk',
              formatter: (val: any) => `$${parseFloat(val).toFixed(2)}`
            },
            total: {
              show: true,
              label: formType === "savings_transfer" ? "Cash Split" : "Total Gross",
              color: theme === "dark" ? '#9ca3af' : '#4b5563',
              fontFamily: 'Plus Jakarta Sans',
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `$${total.toFixed(2)}`;
              }
            }
          }
        }
      }
    }
  };

  const historyPieOptions = {
    ...pieChartOptions,
    labels: historyMonthReport?.chartLabels || [],
    colors: ['#3b82f6', '#7c3aed', '#f43f5e', '#00f5a0', '#10b981'],
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            value: {
              show: true,
              color: theme === "dark" ? '#ffffff' : '#0f172a',
              formatter: (val: any) => `$${parseFloat(val).toFixed(2)}`
            },
            total: {
              show: true,
              label: 'Outflows',
              color: theme === "dark" ? '#9ca3af' : '#4b5563',
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `$${total.toFixed(2)}`;
              }
            }
          }
        }
      }
    }
  };

  // Generate days options dynamically based on selected Month/Year
  const formDaysOptions = useMemo(() => {
    if (!formMonth || !formYear) return [];
    const daysCount = getDaysInMonth(formMonth, formYear);
    return Array.from({ length: daysCount }, (_, i) => ({ value: i + 1, label: (i + 1).toString() }));
  }, [formMonth, formYear]);

  // 1. RENDER LOGIN SCREEN (Swapped columns: Auth card on Left, Branding on Right)
  if (!userSession) {
    return (
      <div className="login-container fade-in no-print">
        {/* Left: Branding Text */}
        <div className="login-left">
          <div className="login-left-brand fade-in-left">AEGIS FINANCE</div>
          <div className="login-left-sub fade-in-left-delayed">
            INTEGRATED FINANCE TRACKING & MANAGEMENT SYSTEM
          </div>
          <div className="login-left-signature fade-in-signature">Aegis Ledger</div>
        </div>

        {/* Right: Auth Box */}
        <div className="login-right">
          <div className="glass-card login-box fade-in-delayed">
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
              <AegisLogo />
              <h3 style={{ margin: 0 }}>Onboard Portal</h3>
            </div>
            <p>Access your offline ledger tracking database.</p>

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <User size={14} /> User Name
                </label>
                <input 
                  type="text" 
                  className="glass-input login-input-placeholder" 
                  placeholder="Enter your name"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Job Profession</label>
                <CustomSelect
                  value={loginProfession}
                  onChange={(val) => setLoginProfession(val)}
                  options={PROFESSIONS.map(p => ({ value: p, label: p }))}
                  placeholder="Select profession"
                />
              </div>

              <button type="submit" className="glass-btn" style={{ marginTop: "16px", padding: "16px" }}>
                Access Ledger System
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. RENDER MAIN DASHBOARD
  return (
    <div className="app-container">
      {/* Header & Navigation */}
      <header className="nav-header">
        <div className="logo-section" onClick={() => setActiveTab("input")}>
          <AegisLogo />
          <span className="logo-text">AEGIS FINANCE</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <button 
            className={`nav-item ${activeTab === "input" ? "active" : ""}`}
            onClick={() => setActiveTab("input")}
          >
            Input Data
          </button>
          <button 
            className={`nav-item ${activeTab === "track" ? "active" : ""}`}
            onClick={() => setActiveTab("track")}
          >
            Asset Tracker
          </button>
          <button 
            className={`nav-item ${activeTab === "sell" ? "active" : ""}`}
            onClick={() => setActiveTab("sell")}
          >
            Sell Portfolio
          </button>
          <button 
            className={`nav-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Ledger History
          </button>
          
          {/* Profile Dropdown Badge (Hover Activated) */}
          <div 
            className="user-badge-container"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div className="user-badge">
              <div className="user-avatar">{userSession.name[0].toUpperCase()}</div>
              <span>{userSession.profession} Account ▾</span>
            </div>
            {isDropdownOpen && (
              <div className="account-dropdown glass-card">
                <button className="dropdown-item" onClick={() => { setModalType("name"); setIsDropdownOpen(false); }}>
                  Change Name
                </button>
                <button className="dropdown-item" onClick={() => { setModalType("profession"); setIsDropdownOpen(false); }}>
                  Change Profession
                </button>
                <div className="theme-switch-container">
                  <span>Light Theme</span>
                  <label className="theme-switch">
                    <input 
                      type="checkbox" 
                      checked={theme === "light"} 
                      onChange={() => setTheme(theme === "dark" ? "light" : "dark")} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <button 
                  className="dropdown-item" 
                  style={{ borderTop: "1px solid var(--panel-border)", marginTop: "6px", display: "flex", alignItems: "center", gap: "8px", color: "var(--error)" }}
                  onClick={() => { setUserSession(null); setIsDropdownOpen(false); }}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger toggle */}
        <button 
          className="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile slide-out drawer */}
        <div className={`nav-backdrop ${isMobileMenuOpen ? "open" : ""}`} onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`mobile-nav-drawer ${isMobileMenuOpen ? "open" : ""}`}>
          <button 
            className="nav-item"
            onClick={() => { setActiveTab("input"); setIsMobileMenuOpen(false); }}
          >
            Input Data
          </button>
          <button 
            className="nav-item"
            onClick={() => { setActiveTab("track"); setIsMobileMenuOpen(false); }}
          >
            Asset Tracker
          </button>
          <button 
            className="nav-item"
            onClick={() => { setActiveTab("sell"); setIsMobileMenuOpen(false); }}
          >
            Sell Portfolio
          </button>
          <button 
            className="nav-item"
            onClick={() => { setActiveTab("history"); setIsMobileMenuOpen(false); }}
          >
            Ledger History
          </button>
          <div style={{ marginTop: "auto", borderTop: "1px solid var(--panel-border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="user-badge" style={{ justifyContent: "center" }} onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsMobileMenuOpen(false); }}>
              <div className="user-avatar">{userSession.name[0].toUpperCase()}</div>
              <span>{userSession.profession} Account ▾</span>
            </div>
            <button 
              className="glass-btn btn-danger" 
              style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
              onClick={() => { setUserSession(null); setIsMobileMenuOpen(false); }}
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Top Summary Card */}
      <section className="dashboard-overview glass-card">
        <div className="dashboard-title-row">
          <div>
            <h2>Welcome Back, {userSession.name}</h2>
            <p>Financial ledger summary and bill schedules</p>
          </div>
          <div className="handwritten-stamp">Aegis Ledger</div>
        </div>
        
        <div className="overview-grid">
          <div className="metric-card glass-card cash-glow">
            <div className="metric-label">Cash In Hand</div>
            <div className="metric-value" style={{ color: "var(--success)" }}>
              ${financeData.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-card glass-card savings-glow">
            <div className="metric-label">Total Savings</div>
            <div className="metric-value" style={{ color: "#7c3aed" }}>
              ${financeData.savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="metric-card glass-card deficit-glow">
            <div className="metric-label">Active Deficits</div>
            <div className="metric-value" style={{ color: "var(--error)" }}>
              ${financeData.deficits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bill-pills-row">
          <span className="bill-pills-label">Bill Schedule Status:</span>
          <span className="bill-pill overdue">
            <AlertCircle size={14} /> Overdue: {billStats.overdue}
          </span>
          <span className="bill-pill paid">
            <CheckCircle size={14} /> Paid: {billStats.paid}
          </span>
          <span className="bill-pill unpaid">
            <Clock size={14} /> Unpaid: {billStats.unpaid}
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <button className="glass-btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }} onClick={handleConsolidateSavingsClick}>
              Consolidate Savings
            </button>
            <button className="glass-btn btn-danger" style={{ padding: "8px 16px", fontSize: "0.8rem" }} onClick={handleClearAllData}>
              Clear Ledger
            </button>
          </div>
        </div>
      </section>

      {/* Tab Contents */}
      <main style={{ position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(4,7,13,0.5)", zIndex: 10, display: "flex",
            alignItems: "center", justifyContent: "center", borderRadius: "20px",
            backdropFilter: "blur(4px)"
          }}>
            <div style={{ border: "3px solid #7c3aed", borderTopColor: "transparent", width: "32px", height: "32px", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* TAB 1: INPUT DATA */}
        {activeTab === "input" && (
          <div className="split-view-container fade-in">
            {/* Left: Input Form */}
            <div className="split-left">
              <div className="glass-card" style={{ overflow: "hidden" }}>
                <form onSubmit={handleFormSubmit} className="form-grid">
                  <div className="input-section-header">
                    <Layers size={18} />
                    <span>Record Finance Action</span>
                  </div>

                  <div className="form-group">
                    <label>Action Category</label>
                    <CustomSelect
                      value={formType}
                      onChange={(val) => setFormType(val)}
                      options={[
                        { value: "salary", label: "Salary Income Crediting" },
                        { value: "bill", label: "Utility Bill Payment" },
                        { value: "invest", label: "Asset Stock Investment" },
                        { value: "savings_transfer", label: "Add Savings Transfer" }
                      ]}
                      placeholder="Select category"
                    />
                  </div>

                  {/* Year & Month (Blank by default) */}
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Year</label>
                      <CustomSelect
                        value={formYear}
                        onChange={(val) => setFormYear(val)}
                        options={YEARS.map(y => ({ value: y, label: y.toString() }))}
                        placeholder="Select Year"
                        disabled={stagedEntries.length > 0}
                        defaultScrollToBottom={true}
                      />
                    </div>
                    <div className="form-group">
                      <label>Month</label>
                      <CustomSelect
                        value={formMonth}
                        onChange={(val) => setFormMonth(val)}
                        options={MONTHS.map(m => ({ value: m, label: m }))}
                        placeholder="Select Month"
                        disabled={stagedEntries.length > 0}
                      />
                    </div>
                  </div>

                  {/* Salary Form Fields */}
                  {formType === "salary" && (
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Crediting Day</label>
                        <CustomSelect
                          value={formDay}
                          onChange={(val) => setFormDay(val)}
                          options={formDaysOptions}
                          placeholder="Select Day"
                          disabled={!formMonth || !formYear}
                        />
                      </div>
                      <div className="form-group">
                        <label>Crediting Gross Amount ($)</label>
                        <input 
                          type="number" 
                          className="glass-input"
                          placeholder="e.g. 5000"
                          value={formAmount}
                          onChange={(e) => setFormAmount(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Bill Form Fields (Statuses support) */}
                  {formType === "bill" && (
                    <>
                      {/* Sub-status buttons */}
                      <div className="form-group">
                        <label>Bill Status</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                          {(["paid", "unpaid", "overdue"] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              className={`glass-btn btn-secondary ${billStatus === status ? "active" : ""}`}
                              style={{
                                flex: 1,
                                padding: "10px",
                                fontSize: "0.8rem",
                                background: billStatus === status ? "var(--primary)" : "rgba(255, 255, 255, 0.03)",
                                borderColor: billStatus === status ? "var(--primary)" : "var(--panel-border)",
                                color: billStatus === status ? "white" : "var(--text-muted)"
                              }}
                              onClick={() => setBillStatus(status)}
                            >
                              {status.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Bill Name</label>
                          <input 
                            type="text"
                            className="glass-input"
                            placeholder="e.g. Water Utility"
                            value={billName}
                            onChange={(e) => setBillName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            {billStatus === "paid" ? "Gross Invoiced Amount ($)" : "Invoiced Base Amount ($)"}
                          </label>
                          <input 
                            type="number"
                            className="glass-input"
                            placeholder="e.g. 120"
                            value={formAmount}
                            onChange={(e) => setFormAmount(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Due Day</label>
                          <CustomSelect
                            value={billDueDay}
                            onChange={(val) => setBillDueDay(val)}
                            options={formDaysOptions}
                            placeholder="Select Due"
                            disabled={!formMonth || !formYear}
                          />
                        </div>
                        <div className="form-group">
                          <label>
                            {billStatus === "unpaid" ? "Current Day" : "Payment Day"}
                          </label>
                          <CustomSelect
                            value={formDay}
                            onChange={(val) => setFormDay(val)}
                            options={formDaysOptions}
                            placeholder="Select Day"
                            disabled={!formMonth || !formYear}
                          />
                        </div>
                      </div>

                      {/* Display live penalty calculation feedback in UI */}
                      {billStatus !== "paid" && (
                        <div className="glass-card" style={{ padding: "14px", marginTop: "4px", border: "1px solid rgba(244, 63, 94, 0.2)", background: "rgba(244, 63, 94, 0.03)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                            <span style={{ color: "var(--text-muted)" }}>Days Overdue:</span>
                            <span style={{ fontWeight: 700, color: dynamicBillCalculation.lateDays > 0 ? "var(--error)" : "var(--success)" }}>
                              {dynamicBillCalculation.lateDays} Days
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                            <span style={{ color: "var(--text-muted)" }}>Calculated Penalty:</span>
                            <span style={{ fontWeight: 700, color: "var(--error)" }}>
                              ${dynamicBillCalculation.penalty.toFixed(2)}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginTop: "6px" }}>
                            <span style={{ fontWeight: 600 }}>Total Invoiced + Penalty:</span>
                            <strong style={{ color: "#7c3aed" }}>
                              ${dynamicBillCalculation.total.toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Investment Form Fields */}
                  {formType === "invest" && (
                    <>
                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Asset Symbol</label>
                          <CustomSelect
                            value={investAsset}
                            onChange={(val) => setInvestAsset(val)}
                            options={ASSETS.map(a => ({ value: a.name, label: `${a.fullName} (${a.name})` }))}
                            placeholder="Select asset"
                          />
                        </div>
                        <div className="form-group">
                          <label>Buy Day</label>
                          <CustomSelect
                            value={formDay}
                            onChange={(val) => setFormDay(val)}
                            options={formDaysOptions}
                            placeholder="Select Day"
                            disabled={!formMonth || !formYear}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Invested Gross Limit ($)</label>
                        <input 
                          type="number"
                          className="glass-input"
                          placeholder="e.g. 1000"
                          value={formAmount}
                          onChange={(e) => setFormAmount(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Savings Custom Transfer Fields */}
                  {formType === "savings_transfer" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div className="glass-card" style={{ padding: "16px", background: "rgba(124, 58, 237, 0.03)", border: "1px solid rgba(124, 58, 237, 0.15)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "6px" }}>
                          <span style={{ color: "var(--text-muted)" }}>Current Cash In Hand:</span>
                          <strong style={{ color: "var(--success)" }}>
                            ${financeData.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                          <span style={{ color: "var(--text-muted)" }}>Optimal 30% Savings:</span>
                          <span>${(financeData.balance * 0.3).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                          <span style={{ color: "var(--text-muted)" }}>Optimal 40% Savings:</span>
                          <span>${(financeData.balance * 0.4).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Optimal Advice Select</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button
                            type="button"
                            className={`glass-btn btn-secondary ${savingsPercent === 30 ? "active" : ""}`}
                            style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}
                            onClick={() => setSavingsPercent(30)}
                          >
                            30% (Recommended)
                          </button>
                          <button
                            type="button"
                            className={`glass-btn btn-secondary ${savingsPercent === 40 ? "active" : ""}`}
                            style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}
                            onClick={() => setSavingsPercent(40)}
                          >
                            40%
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Custom Transfer Percentage (%)</label>
                        <input
                          type="number"
                          className="glass-input"
                          min="1"
                          max="100"
                          placeholder="e.g. 35"
                          value={savingsPercent === 0 ? "" : savingsPercent}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            setSavingsPercent(val);
                          }}
                        />
                      </div>

                      <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem" }}>
                          <span>Calculated Savings Deposit:</span>
                          <strong style={{ color: "var(--primary)", fontFamily: "Space Grotesk" }}>
                            ${(financeData.balance * (savingsPercent / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {formType !== "savings_transfer" && (
                    <div className="form-group">
                      <label>Description Note</label>
                      <input 
                        type="text" 
                        className="glass-input"
                        placeholder="Reference note description"
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                      />
                    </div>
                  )}

                  <button type="submit" className="glass-btn" style={{ marginTop: "12px" }}>
                    <Plus size={16} /> 
                    {formType === "savings_transfer" ? `Stage Savings Deposit` : `Stage Transaction`}
                  </button>
                </form>
              </div>

              {stagedEntries.length > 0 && (
                <div className="glass-card" style={{ marginTop: "20px", padding: "20px" }}>
                  <div className="input-section-header" style={{ marginBottom: "16px" }}>
                    <Layers size={18} />
                    <span>Staged Monthly Transactions ({formMonth} {formYear})</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "220px", overflowY: "auto", paddingRight: "4px" }}>
                    {stagedEntries.map((entry, idx) => (
                      <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--panel-border)", borderRadius: "12px" }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>
                            {entry.displayCategory}
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "var(--text-main)", marginTop: "2px" }}>
                            {entry.displayStr}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          className="glass-btn btn-danger" 
                          style={{ padding: "6px 10px", fontSize: "0.75rem", minWidth: "auto", height: "auto" }}
                          onClick={() => {
                            setStagedEntries(prev => prev.filter((_, i) => i !== idx));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ 
                    borderTop: "1px solid var(--panel-border)", 
                    paddingTop: "14px", 
                    marginTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.88rem"
                  }}>
                    <span style={{ color: "var(--text-muted)" }}>Projected Balance:</span>
                    <strong style={{ 
                      fontFamily: "Space Grotesk", 
                      color: projectedBalance < 0 ? "#f87171" : "var(--success)",
                      fontSize: "0.95rem"
                    }}>
                      ${projectedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </div>

                  {projectedBalance < 0 && (
                    <div style={{
                      marginTop: "14px",
                      padding: "12px 14px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "12px",
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      fontSize: "0.82rem",
                      color: "rgba(248, 113, 113, 0.95)",
                      lineHeight: "1.4"
                    }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px", color: "rgb(248, 113, 113)" }} />
                      <div>
                        <strong style={{ display: "block", color: "rgb(252, 165, 165)", marginBottom: "2px" }}>
                          Insufficient Funds
                        </strong>
                        <span>
                          Cannot carry out features: not enough money inputted. Staged expenses exceed your funds by <strong>${Math.abs(projectedBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: "16px", marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Items:</span>
                      <strong style={{ marginLeft: "6px", color: "var(--text-main)" }}>{stagedEntries.length}</strong>
                    </div>
                    <button 
                      type="button" 
                      className="glass-btn" 
                      style={{ 
                        background: projectedBalance < 0 ? "rgba(255, 255, 255, 0.02)" : "var(--primary)",
                        color: projectedBalance < 0 ? "var(--text-muted)" : "#ffffff",
                        cursor: projectedBalance < 0 ? "not-allowed" : "pointer",
                        border: projectedBalance < 0 ? "1px solid var(--panel-border)" : "none",
                        opacity: projectedBalance < 0 ? 0.6 : 1
                      }}
                      disabled={projectedBalance < 0}
                      onClick={() => setModalType("finish_batch")}
                    >
                      Finish & Save Monthly Record
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Live Preview Chart */}
            <div className="split-right">
              <div className="glass-card" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
                <div className="input-section-header">
                  <Percent size={18} />
                  <span>Real-time Spending preview ({formMonth || "Month"} {formYear || "Year"})</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                  {pieChartData.series.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                      <HelpCircle size={48} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
                      <p>Form inputs are currently empty.</p>
                      <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Enter values to preview the gross breakdown here!</p>
                    </div>
                  ) : (
                    <Chart 
                      options={pieChartOptions} 
                      series={pieChartData.series} 
                      type="donut" 
                      width="100%" 
                      height={350} 
                    />
                  )}
                </div>
                <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: "16px", marginTop: "16px" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
                    * Displays a live breakdown of base cost and taxes of the unsaved entry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRACK INVESTMENT (15 Assets + Pro Sidebar Layout) */}
        {activeTab === "track" && (
          <div className="track-main-container">
            <div className={`track-grid ${isProTrading ? "pro-layout" : ""} fade-in`}>
              
              {/* Chart Panel Container (Left Side) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Candlestick Chart */}
                <div className="glass-card track-chart-panel">
                  <div className="chart-header">
                    <div className="chart-title">
                      <span className="asset-badge">{selectedAsset} / USD</span>
                      <h3>{ASSETS.find(a => a.name === selectedAsset)?.fullName}</h3>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <button 
                        className={`glass-btn btn-secondary ${isProTrading ? "active" : ""}`}
                        style={{ padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700 }}
                        onClick={() => setIsProTrading(!isProTrading)}
                      >
                        PRO PANEL: {isProTrading ? "ON" : "OFF"}
                      </button>
                      <div className="live-indicator">
                        <div className="live-dot"></div>
                        <span>LIVE FEED</span>
                      </div>
                    </div>
                  </div>

                  <div ref={chartContainerRef} style={{ minHeight: "350px", background: "rgba(255,255,255,0.01)", borderRadius: "12px", padding: "10px" }}>
                    {market[selectedAsset] ? (
                      <Chart 
                        options={candlestickOptions} 
                        series={candleSeries} 
                        type="candlestick" 
                        height={350} 
                      />
                    ) : (
                      <div style={{ display: "flex", height: "350px", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                        Initializing chart feed...
                      </div>
                    )}
                  </div>
                </div>

                {/* Selectors and Hold Info (Under Chart in Pro Mode) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {/* Selectors */}
                  <div className="glass-card" style={{ padding: "20px" }}>
                    <div className="input-section-header" style={{ marginBottom: "12px" }}>
                      <TrendingUp size={18} />
                      <span>Choose Live Asset (15 Assets)</span>
                    </div>
                    <div className="asset-picker-list" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                      {ASSETS.map((asset) => {
                        const price = market[asset.name]?.currentPrice || asset.basePrice;
                        const candles = market[asset.name]?.candles || [];
                        let diffPercent = 0;
                        if (candles.length > 1) {
                          const firstVal = candles[0].y[0]; 
                          diffPercent = ((price - firstVal) / firstVal) * 100;
                        }

                        return (
                          <div 
                            key={asset.name}
                            className={`asset-picker-item ${selectedAsset === asset.name ? "active" : ""}`}
                            onClick={() => setSelectedAsset(asset.name)}
                            style={{ padding: "12px 14px" }}
                          >
                            <div>
                              <strong style={{ fontSize: "0.95rem" }}>{asset.name}</strong>
                              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{asset.fullName}</div>
                            </div>
                            <div style={{ textAlign: "right", fontFamily: "Space Grotesk", fontSize: "0.9rem" }}>
                              <div>${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                              <span style={{ fontSize: "0.7rem", fontWeight: 700 }} className={diffPercent >= 0 ? "trend-up" : "trend-down"}>
                                {diffPercent >= 0 ? "+" : ""}{diffPercent.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Portfolio Holdings */}
                  <div className="glass-card" style={{ padding: "20px" }}>
                    <div className="input-section-header" style={{ marginBottom: "12px" }}>
                      <Coins size={18} />
                      <span>Asset Portfolio Holdings</span>
                    </div>
                    <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                      {liveInvestments.filter(i => i.stockName === selectedAsset).length === 0 ? (
                        <div style={{ padding: "30px 0", color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center" }}>
                          No investments in {selectedAsset} registered.
                          <div style={{ marginTop: "12px" }}>
                            <button className="glass-btn btn-secondary" style={{ fontSize: "0.8rem", padding: "8px 14px" }} onClick={() => { setFormType("invest"); setInvestAsset(selectedAsset); setActiveTab("input"); }}>
                              Buy {selectedAsset} Now
                            </button>
                          </div>
                        </div>
                      ) : (
                        liveInvestments.filter(i => i.stockName === selectedAsset).map((inv, idx) => {
                          return (
                            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px 0", borderBottom: idx < liveInvestments.filter(i => i.stockName === selectedAsset).length - 1 ? "1px solid var(--panel-border)" : "none" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Invested Principal:</span>
                                <span style={{ fontWeight: 600, fontFamily: "Space Grotesk" }}>${inv.investedAmount.toLocaleString()}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Entry Tax Component:</span>
                                <span style={{ fontWeight: 600, fontFamily: "Space Grotesk" }}>${inv.entryTax.toLocaleString()}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Live Simulated Value:</span>
                                <span style={{ fontWeight: 600, color: "#7c3aed", fontFamily: "Space Grotesk" }}>${inv.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderTop: "1px solid var(--panel-border)", paddingTop: "6px", marginTop: "4px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Live P/L:</span>
                                <span style={{ fontWeight: 700, fontFamily: "Space Grotesk" }} className={inv.profitLoss >= 0 ? "trend-up" : "trend-down"}>
                                  ${inv.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({inv.profitLoss >= 0 ? "+" : ""}{((inv.profitLoss / (inv.investedAmount + inv.entryTax)) * 100).toFixed(2)}%)
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Trading Sidebar (Right Side) */}
              {isProTrading && (
                <div className="pro-panel-sidebar">
                  {/* Order Book */}
                  <div className="glass-card order-book-container">
                    <div className="input-section-header" style={{ marginBottom: "10px", fontSize: "0.95rem", borderBottom: "none" }}>
                      <span>Order Book</span>
                    </div>
                    <div className="order-book-grid">
                      <div className="order-book-row order-book-header">
                        <div className="order-book-cell">Price (USD)</div>
                        <div className="order-book-cell" style={{ textAlign: "right" }}>Size</div>
                        <div className="order-book-cell" style={{ textAlign: "right" }}>Total</div>
                      </div>
                      
                      {/* Asks (Sells) */}
                      {orderBook.asks.slice().reverse().map((ask, idx) => (
                        <div className="order-book-row" key={`ask-${idx}`} style={{ color: "var(--error)" }}>
                          <div className="order-book-cell">${ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className="order-book-cell" style={{ textAlign: "right" }}>{ask.size}</div>
                          <div className="order-book-cell" style={{ textAlign: "right" }}>{ask.total}</div>
                        </div>
                      ))}

                      {/* Spread */}
                      <div className="order-book-row" style={{ fontWeight: 700, borderTop: "1px solid var(--panel-border)", borderBottom: "1px solid var(--panel-border)", margin: "4px 0" }}>
                        <div className="order-book-cell" style={{ color: "var(--text-main)", padding: "4px 0" }}>
                          Spread
                        </div>
                        <div className="order-book-cell" style={{ textAlign: "right", color: "var(--text-muted)", padding: "4px 0" }}>
                          {(orderBook.asks[0] && orderBook.bids[0]) ? `$${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}` : "-"}
                        </div>
                        <div className="order-book-cell" style={{ padding: "4px 0" }}></div>
                      </div>

                      {/* Bids (Buys) */}
                      {orderBook.bids.map((bid, idx) => (
                        <div className="order-book-row" key={`bid-${idx}`} style={{ color: "var(--success)" }}>
                          <div className="order-book-cell">${bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className="order-book-cell" style={{ textAlign: "right" }}>{bid.size}</div>
                          <div className="order-book-cell" style={{ textAlign: "right" }}>{bid.total}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time & Sales */}
                  <div className="glass-card time-sales-container" style={{ flex: 1, minHeight: "250px" }}>
                    <div className="input-section-header" style={{ marginBottom: "10px", fontSize: "0.95rem", borderBottom: "none" }}>
                      <span>Time & Sales</span>
                    </div>
                    <div className="time-sales-list">
                      {timeSales.map((tick, idx) => (
                        <div className="time-sales-row" key={idx}>
                          <span style={{ color: "var(--text-muted)" }}>{tick.time}</span>
                          <span style={{ color: tick.type === "buy" ? "var(--success)" : "var(--error)", fontWeight: 700 }}>
                            ${tick.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span>{tick.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 3: SELL INVESTMENT */}
        {activeTab === "sell" && (
          <div className="fade-in">
            {/* Global Portfolio Dashboard */}
            <div className="glass-card" style={{ padding: "24px 28px", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-brand)", fontSize: "1.3rem", letterSpacing: "0.5px" }}>Overall Net Portfolio Asset Value</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Aggregated live stock values and entry commissions</p>
              </div>

              <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", fontFamily: "Space Grotesk" }}>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans" }}>Invested Principal</div>
                  <strong style={{ fontSize: "1.5rem" }}>${portfolioSummary.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans" }}>Live Value</div>
                  <strong style={{ fontSize: "1.5rem", color: "#7c3aed" }}>${portfolioSummary.totalCurrent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", fontFamily: "Plus Jakarta Sans" }}>Net Profit / Loss</div>
                  <strong style={{ fontSize: "1.5rem" }} className={portfolioSummary.totalPL >= 0 ? "trend-up" : "trend-down"}>
                    {portfolioSummary.totalPL >= 0 ? "+" : ""}${portfolioSummary.totalPL.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({portfolioSummary.plPercent.toFixed(2)}%)
                  </strong>
                </div>
              </div>
            </div>

            {/* Portfolio Grid list */}
            {liveInvestments.length === 0 ? (
              <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <Coins size={48} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>No active stock investments bought.</p>
                <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Go to the Input Data tab to buy and list stock assets here!</p>
              </div>
            ) : (
              <div className="portfolio-grid">
                {liveInvestments.map((inv, idx) => {
                  const asset = ASSETS.find(a => a.name === inv.stockName);
                  const curPrice = market[inv.stockName]?.currentPrice || asset?.basePrice || 0;
                  const plPercent = ((inv.profitLoss / (inv.investedAmount + inv.entryTax)) * 100);

                  return (
                    <div key={idx} className="glass-card portfolio-card">
                      <div className="portfolio-header">
                        <div>
                          <span className="portfolio-stock-name">{inv.stockName}</span>
                          <div><span className="portfolio-stock-month">Acquired: {inv.monthYear}</span></div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Live Price</span>
                          <div style={{ fontWeight: 600, fontFamily: "Space Grotesk" }}>${curPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>

                      <div className="portfolio-body">
                        <div className="portfolio-label">Principal Amount:</div>
                        <div className="portfolio-val">${inv.investedAmount.toLocaleString()}</div>
                        
                        <div className="portfolio-label">Commission Tax Paid:</div>
                        <div className="portfolio-val">${inv.entryTax.toLocaleString()}</div>

                        <div className="portfolio-label">Current Value:</div>
                        <div className="portfolio-val" style={{ color: "#7c3aed", fontWeight: 700 }}>
                          ${inv.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        <div className="portfolio-label">P/L (Net):</div>
                        <div className={`portfolio-val ${inv.profitLoss >= 0 ? "trend-up" : "trend-down"}`} style={{ fontWeight: 700 }}>
                          {inv.profitLoss >= 0 ? "+" : ""}${inv.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid var(--panel-border)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, fontFamily: "Space Grotesk" }} className={inv.profitLoss >= 0 ? "trend-up" : "trend-down"}>
                          {plPercent >= 0 ? "+" : ""}{plPercent.toFixed(2)}% ROI
                        </span>
                        <button 
                          className="glass-btn" 
                          style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                          onClick={() => {
                            const currentPrice = market[inv.stockName]?.currentPrice;
                            if (!currentPrice) {
                              showCustomAlert("Market Status", "Live price feed not ready yet.", "info");
                              return;
                            }
                            setSellConfirmInv({
                              index: idx,
                              stockName: inv.stockName,
                              investedAmount: inv.investedAmount,
                              entryTax: inv.entryTax,
                              currentValue: inv.currentValue,
                              profitLoss: inv.profitLoss,
                              monthYear: inv.monthYear
                            });
                          }}
                        >
                          Sell Asset
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HISTORY */}
        {activeTab === "history" && (
          <div className="history-layout fade-in">
            {/* Left: Months sidebar timeline */}
            <div className="glass-card history-sidebar">
              <div className="input-section-header">
                <History size={18} />
                <span>Saved Periods</span>
              </div>
              {historyMonths.length === 0 ? (
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center", padding: "10px" }}>
                  No historical reports available.
                </span>
              ) : (
                historyMonths.map((my) => (
                  <button 
                    key={my}
                    className={`history-month-btn ${selectedHistoryMonth === my ? "active" : ""}`}
                    onClick={() => setSelectedHistoryMonth(my)}
                  >
                    {my}
                  </button>
                ))
              )}
            </div>

            {/* Right: Selected Month Details */}
            {selectedHistoryMonth && historyMonthReport ? (
              <div className="glass-card history-main-panel">
                <div className="history-title-section">
                  <div>
                    <h2 style={{ fontFamily: "var(--font-brand)", fontSize: "1.4rem", letterSpacing: "0.5px" }}>Financial Statement - {selectedHistoryMonth}</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Ledger itemized log for the period</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Net Cash Income</div>
                    <strong style={{ fontSize: "1.5rem", fontFamily: "Space Grotesk" }} className={historyMonthReport.net >= 0 ? "trend-up" : "trend-down"}>
                      {historyMonthReport.net >= 0 ? "+" : ""}${historyMonthReport.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                <div className="history-content-grid">
                  {/* Detailed Transaction Listing */}
                  <div className="history-list-section">
                    <h4 style={{ color: "var(--text-main)", fontFamily: "var(--font-brand)", fontSize: "1.1rem", borderBottom: "1.5px solid var(--panel-border)", paddingBottom: "8px", letterSpacing: "0.5px" }}>
                      Ledger Entries
                    </h4>
                    {historyMonthReport.txs.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No transactions logged this month.</p>
                    ) : (
                      historyMonthReport.txs.map((tx, idx) => (
                        <div key={idx} className="history-item-card">
                          <div className="history-item-info">
                            <span className="history-item-title">{tx.description}</span>
                            <span className="history-item-sub">{tx.date} | Category: {tx.category}</span>
                          </div>
                          <strong className={`history-item-amount ${["SALARY", "INVESTMENT_PL", "INVESTMENT_REF"].includes(tx.category) && tx.amount >= 0 ? "positive" : "negative"}`} style={{ fontFamily: "Space Grotesk" }}>
                            {["SALARY", "INVESTMENT_PL", "INVESTMENT_REF"].includes(tx.category) && tx.amount >= 0 ? "+" : "-"}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                      ))
                    )}

                    {/* Associated Bills Status */}
                    <h4 style={{ color: "var(--text-main)", fontFamily: "var(--font-brand)", fontSize: "1.1rem", borderBottom: "1.5px solid var(--panel-border)", paddingBottom: "8px", marginTop: "24px", letterSpacing: "0.5px" }}>
                      Month Invoiced Bills
                    </h4>
                    {historyMonthReport.bills.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No utility bills scheduled this month.</p>
                    ) : (
                      historyMonthReport.bills.map((bill, idx) => (
                        <div key={idx} className="history-item-card">
                          <div className="history-item-info">
                            <span className="history-item-title">{bill.name}</span>
                            <span className="history-item-sub">Due: {bill.dueDate} | Type: {bill.billType}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <strong style={{ fontSize: "0.95rem", fontFamily: "Space Grotesk" }}>
                              ${(bill.baseAmount + bill.taxComponent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </strong>
                            <div style={{ fontSize: "0.75rem", marginTop: "2px", fontWeight: 700 }} className={bill.isPaid ? "trend-up" : "trend-down"}>
                              {bill.isPaid ? "PAID" : "UNPAID"}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Summary Pie Chart / Aggregates */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <h4 style={{ color: "var(--text-main)", fontFamily: "var(--font-brand)", fontSize: "1rem", alignSelf: "flex-start", marginBottom: "16px", letterSpacing: "0.5px" }}>
                        Expense Share (Outflows Only)
                      </h4>
                      {historyMonthReport.chartSeries.every(v => v === 0) ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "20px 0" }}>No expense data to display.</p>
                      ) : (
                        <Chart 
                          options={historyPieOptions} 
                          series={historyMonthReport.chartSeries} 
                          type="donut" 
                          width="100%" 
                          height={280} 
                        />
                      )}
                    </div>

                    <div className="glass-card" style={{ padding: "24px" }}>
                      <h4 style={{ color: "var(--text-main)", fontFamily: "var(--font-brand)", fontSize: "1rem", marginBottom: "16px", letterSpacing: "0.5px" }}>
                        Totals Analysis
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Salary Earned:</span>
                          <strong style={{ color: "var(--success)", fontFamily: "Space Grotesk" }}>${historyMonthReport.salary.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Bills Settled:</span>
                          <strong style={{ fontFamily: "Space Grotesk" }}>${historyMonthReport.billsPaid.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Taxes Paid:</span>
                          <strong style={{ fontFamily: "Space Grotesk" }}>${historyMonthReport.tax.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Penalties Accrued:</span>
                          <strong style={{ fontFamily: "Space Grotesk" }}>${historyMonthReport.penalty.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Assets Invested:</span>
                          <strong style={{ fontFamily: "Space Grotesk" }}>${historyMonthReport.invested.toLocaleString()}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Investment P/L:</span>
                          <strong style={{ 
                            color: historyMonthReport.investmentPL >= 0 ? "var(--success)" : "var(--danger)", 
                            fontFamily: "Space Grotesk" 
                          }}>
                            {historyMonthReport.investmentPL >= 0 ? "+" : ""}${historyMonthReport.investmentPL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Principal Refund:</span>
                          <strong style={{ fontFamily: "Space Grotesk" }}>${historyMonthReport.investmentRefund.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-muted)" }}>Consolidated Savings:</span>
                          <strong style={{ fontFamily: "Space Grotesk" }}>${historyMonthReport.savings.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: "40px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                Select a period from the sidebar to inspect ledger details.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal (Change Name) */}
      {modalType === "name" && (
        <div className="glass-modal-overlay">
          <div className="glass-card glass-modal">
            <div className="glass-modal-header">
              <h3>Change Name</h3>
              <button className="glass-modal-close" onClick={() => setModalType(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveName}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>New User Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="glass-btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="glass-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal (Change Profession) */}
      {modalType === "profession" && (
        <div className="glass-modal-overlay">
          <div className="glass-card glass-modal">
            <div className="glass-modal-header">
              <h3>Change Profession</h3>
              <button className="glass-modal-close" onClick={() => setModalType(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProfession}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Job Profession</label>
                <CustomSelect 
                  value={tempProfession} 
                  onChange={(val) => setTempProfession(val)}
                  options={PROFESSIONS.map(p => ({ value: p, label: p }))}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="glass-btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="glass-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal (Clear Ledger Confirmation) */}
      {modalType === "clear" && (
        <div className="glass-modal-overlay">
          <div className="glass-card glass-modal fade-in">
            <div className="glass-modal-header">
              <h3 style={{ fontFamily: "var(--font-brand)", letterSpacing: "1px" }}>Clear Ledger History</h3>
              <button className="glass-modal-close" onClick={() => setModalType(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: "24px", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Are you sure you want to clear all data? This will permanently delete your entire local ledger history, stocks, and bills. This action cannot be undone.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" className="glass-btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
              <button 
                type="button" 
                className="glass-btn btn-danger" 
                onClick={async () => {
                  setModalType(null);
                  setLoading(true);
                  await executeCommand({ cmd: "clear_data" });
                }}
              >
                Clear Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom General Alert Modal */}
      {customAlert && (
        <div className="glass-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="glass-card glass-modal fade-in" style={{ maxWidth: "420px" }}>
            <div className="glass-modal-header">
              <h3 style={{ fontFamily: "var(--font-brand)", display: "flex", alignItems: "center", gap: "10px" }}>
                {customAlert.type === "error" ? "❌" : customAlert.type === "warning" ? "⚠️" : "ℹ️"} {customAlert.title}
              </h3>
            </div>
            <div style={{ margin: "16px 0 24px", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              {customAlert.message}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                className="glass-btn" 
                style={{ background: "var(--primary)" }}
                onClick={() => setCustomAlert(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Asset Confirmation Modal */}
      {sellConfirmInv && (
        <div className="glass-modal-overlay" style={{ zIndex: 9990 }}>
          <div className="glass-card glass-modal fade-in" style={{ maxWidth: "460px" }}>
            <div className="glass-modal-header">
              <h3 style={{ fontFamily: "var(--font-brand)" }}>Liquidate Investment Asset</h3>
              <button className="glass-modal-close" onClick={() => setSellConfirmInv(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: "20px", fontSize: "0.95rem", lineHeight: "1.5" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                Please review the asset sale details below before confirming liquidation:
              </p>
              <div className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--panel-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Asset Symbol:</span>
                  <strong style={{ color: "var(--accent)" }}>{sellConfirmInv.stockName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Principal Invested:</span>
                  <strong>${sellConfirmInv.investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Entry Brokerage Tax:</span>
                  <strong>${sellConfirmInv.entryTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Current Live Value:</span>
                  <strong style={{ color: "#7c3aed" }}>${sellConfirmInv.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--panel-border)", paddingTop: "8px", marginTop: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Estimated Profit / Loss:</span>
                  <strong className={sellConfirmInv.profitLoss >= 0 ? "trend-up" : "trend-down"}>
                    {sellConfirmInv.profitLoss >= 0 ? "+" : ""}${sellConfirmInv.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Estimated ROI %:</span>
                  <strong className={sellConfirmInv.profitLoss >= 0 ? "trend-up" : "trend-down"}>
                    {sellConfirmInv.investedAmount > 0 ? ((sellConfirmInv.profitLoss / sellConfirmInv.investedAmount) * 100).toFixed(2) : "0.00"}%
                  </strong>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" className="glass-btn btn-secondary" onClick={() => setSellConfirmInv(null)}>Cancel</button>
              <button 
                type="button" 
                className="glass-btn btn-danger" 
                onClick={async () => {
                  const idx = sellConfirmInv.index;
                  const name = sellConfirmInv.stockName;
                  setSellConfirmInv(null);
                  await handleSellInvestment(idx, name);
                }}
              >
                Confirm & Sell Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consolidate Savings Confirmation Modal */}
      {modalType === "consolidate" && (
        <div className="glass-modal-overlay">
          <div className="glass-card glass-modal fade-in" style={{ maxWidth: "450px" }}>
            <div className="glass-modal-header">
              <h3 style={{ fontFamily: "var(--font-brand)" }}>Consolidate Month Savings</h3>
              <button className="glass-modal-close" onClick={() => setModalType(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: "20px", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Are you sure you want to consolidate savings for the selected period? This will transfer the remaining cash in hand for this month into your total long-term savings pool.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" className="glass-btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
              <button 
                type="button" 
                className="glass-btn" 
                style={{ background: "var(--success)" }}
                onClick={async () => {
                  setModalType(null);
                  setLoading(true);
                  await executeCommand({
                    cmd: "consolidate_savings",
                    my: selectedMonthYearStr
                  });
                }}
              >
                Confirm Consolidation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Staging & Save Batch Modal */}
      {modalType === "finish_batch" && (
        <div className="glass-modal-overlay">
          <div className="glass-card glass-modal fade-in" style={{ maxWidth: "500px" }}>
            <div className="glass-modal-header">
              <h3 style={{ fontFamily: "var(--font-brand)" }}>Save Staged Monthly Record</h3>
              <button className="glass-modal-close" onClick={() => setModalType(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ marginBottom: "20px", fontSize: "0.95rem", lineHeight: "1.5" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>
                Ready to commit these staged transactions to your permanent history? This will write the following {stagedEntries.length} items for <strong>{formMonth} {formYear}</strong>:
              </p>
              <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", paddingRight: "4px" }}>
                {stagedEntries.map((entry) => (
                  <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--panel-border)", borderRadius: "8px", fontSize: "0.88rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{entry.displayCategory}:</span>
                    <span style={{ fontWeight: 600 }}>{entry.displayStr}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" className="glass-btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
              <button 
                type="button" 
                className="glass-btn" 
                style={{ background: "var(--primary)" }}
                onClick={handleFinishSaveBatch}
              >
                Save Staged Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
