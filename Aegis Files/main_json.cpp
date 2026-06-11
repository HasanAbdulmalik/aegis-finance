#include "finance_core/finance_core.h"

string getStringValue(const string& json, const string& key) {
    size_t pos = json.find("\"" + key + "\"");
    if (pos == string::npos) return "";
    size_t colon = json.find(":", pos);
    if (colon == string::npos) return "";
    size_t startQuote = json.find("\"", colon);
    if (startQuote == string::npos) return "";
    size_t endQuote = json.find("\"", startQuote + 1);
    if (endQuote == string::npos) return "";
    return json.substr(startQuote + 1, endQuote - startQuote - 1);
}

double getDoubleValue(const string& json, const string& key) {
    size_t pos = json.find("\"" + key + "\"");
    if (pos == string::npos) return 0.0;
    size_t colon = json.find(":", pos);
    if (colon == string::npos) return 0.0;
    size_t start = colon + 1;
    while (start < json.length() && (isspace(json[start]) || json[start] == '"')) start++;
    size_t end = start;
    while (end < json.length() && (isdigit(json[end]) || json[end] == '.' || json[end] == '-' || json[end] == 'e' || json[end] == 'E')) end++;
    if (start == end) return 0.0;
    try {
        return stod(json.substr(start, end - start));
    } catch (...) {
        return 0.0;
    }
}

int getIntValue(const string& json, const string& key) {
    return (int)getDoubleValue(json, key);
}

bool getBoolValue(const string& json, const string& key) {
    size_t pos = json.find("\"" + key + "\"");
    if (pos == string::npos) return false;
    size_t colon = json.find(":", pos);
    if (colon == string::npos) return false;
    size_t start = colon + 1;
    while (start < json.length() && isspace(json[start])) start++;
    if (json.substr(start, 4) == "true") return true;
    return false;
}

string escapeJSONString(const string& str) {
    string res = "";
    for (char c : str) {
        if (c == '"') res += "\\\"";
        else if (c == '\\') res += "\\\\";
        else if (c == '\n') res += "\\n";
        else if (c == '\r') res += "\\r";
        else if (c == '\t') res += "\\t";
        else res += c;
    }
    return res;
}

string getFullStatusJSON(Ledger& budget, BillManager& billsManager, PortfolioManager& stocksManager) {
    stringstream ss;
    ss << "{";
    ss << "\"balance\":" << budget.getBalance() << ",";
    ss << "\"savings\":" << budget.getTotalSavings() << ",";

    double totalDeficits = 0;
    double totalTax = 0;
    double totalBillsPaid = 0;
    double totalInvested = 0;
    double salaryIncome = 0;
    double investmentPL = 0;

    ss << "\"transactions\":[";
    const auto& txs = budget.getTransactions();
    for(size_t i = 0; i < txs.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "{";
        ss << "\"date\":\"" << escapeJSONString(txs[i]->getDate()) << "\",";
        ss << "\"amount\":" << txs[i]->getAmount() << ",";
        ss << "\"description\":\"" << escapeJSONString(txs[i]->getDesc()) << "\",";
        ss << "\"category\":\"" << escapeJSONString(txs[i]->getCategory()) << "\",";
        ss << "\"monthYear\":\"" << escapeJSONString(txs[i]->getMonthYear()) << "\"";
        ss << "}";

        string cat = txs[i]->getCategory();
        if (cat == "TAX") totalTax += txs[i]->getAmount();
        else if (cat == "PENALTY") totalDeficits += txs[i]->getAmount();
        else if (cat == "BILL") totalBillsPaid += txs[i]->getAmount();
        else if (cat == "INVESTMENT_EXP") totalInvested += txs[i]->getAmount();
        else if (cat == "SALARY") salaryIncome += txs[i]->getAmount();
        else if (cat == "INVESTMENT_PL") {
            investmentPL += txs[i]->getAmount();
            if (txs[i]->getAmount() < 0) {
                totalDeficits += (-txs[i]->getAmount());
            }
        }
    }
    ss << "],";

    ss << "\"deficits\":" << totalDeficits << ",";

    ss << "\"bills\":[";
    const auto& billsList = billsManager.getBills();
    for(size_t i = 0; i < billsList.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "{";
        ss << "\"name\":\"" << escapeJSONString(billsList[i].getName()) << "\",";
        ss << "\"baseAmount\":" << billsList[i].getBaseAmount() << ",";
        ss << "\"taxComponent\":" << billsList[i].getTaxComponent() << ",";
        ss << "\"dueDate\":\"" << escapeJSONString(billsList[i].getDueDate()) << "\",";
        ss << "\"isPaid\":" << (billsList[i].getPaidStatus() ? "true" : "false") << ",";
        ss << "\"billType\":\"" << escapeJSONString(billsList[i].getType()) << "\",";
        ss << "\"monthYear\":\"" << escapeJSONString(billsList[i].getMonthYear()) << "\"";
        ss << "}";
    }
    ss << "],";

    ss << "\"investments\":[";
    auto& stockList = stocksManager.getInvestments();
    for(size_t i = 0; i < stockList.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "{";
        ss << "\"stockName\":\"" << escapeJSONString(stockList[i].getName()) << "\",";
        ss << "\"investedAmount\":" << stockList[i].getInvested() << ",";
        ss << "\"currentValue\":" << stockList[i].getCurrent() << ",";
        ss << "\"entryTax\":" << stockList[i].getEntryTax() << ",";
        ss << "\"profitLoss\":" << stockList[i].getProfitLoss() << ",";
        ss << "\"monthYear\":\"" << escapeJSONString(stockList[i].getMonthYear()) << "\"";
        ss << "}";
    }
    ss << "]";

    ss << "}";
    return ss.str();
}

int main() {
    Ledger myBudget;
    BillManager myBills;
    PortfolioManager myStocks;

    const string LEDGER_FILE = "ledger.txt";
    const string BILLS_FILE = "bills.txt";
    const string STOCKS_FILE = "stocks.txt";

    stringstream silent_stream;

    ifstream ledgerFile(LEDGER_FILE);
    string line;
    while(getline(ledgerFile, line)) {
        if(line.empty()) continue;
        stringstream ss(line);
        string type, date, amount, desc, cat, my;
        getline(ss, type, ','); 
        getline(ss, date, ','); 
        getline(ss, amount, ','); 
        getline(ss, desc, ',');

        if(type == "SALARY"){
            getline(ss, my, ',');
            myBudget.addTransaction(new SalaryIncome(date, stod(amount), desc, my), silent_stream);
        }else if(type == "INVESTPL"){
            getline(ss, my, ',');
            myBudget.addTransaction(new InvestmentProfit(date, stod(amount), desc, my), silent_stream);
        }else if(type == "INVESTEXP"){
            getline(ss, my, ',');
            myBudget.addTransaction(new InvestmentExpense(date, stod(amount), desc, my), silent_stream);
        }else if(type == "EXPENSE"){
            getline(ss, cat, ','); getline(ss, my, ',');
            myBudget.addTransaction(new Expense(date, stod(amount), desc, cat, my), silent_stream);
        }else if(type == "SAVINGS"){
            getline(ss, my, ',');
            myBudget.addTransaction(new SavingsTransfer(date, stod(amount), desc, my), silent_stream);
        }else if(type == "INVESTREF"){
            getline(ss, my, ',');
            myBudget.addTransaction(new InvestmentRefund(date, stod(amount), desc, my), silent_stream);
        }
    }
    ledgerFile.close();
    myBills.loadFromFile(BILLS_FILE);
    myStocks.loadFromFile(STOCKS_FILE);

    string cmd_line;
    while(getline(cin, cmd_line)) {
        if (cmd_line.empty()) continue;
        string cmd = getStringValue(cmd_line, "cmd");

        if (cmd == "load_data") {
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        } 
        else if (cmd == "add_salary") {
            double amount = getDoubleValue(cmd_line, "amount");
            string desc = getStringValue(cmd_line, "desc");
            string date = getStringValue(cmd_line, "date");
            string my = getStringValue(cmd_line, "my");
            
            myBudget.addTransaction(new SalaryIncome(date, amount, desc, my), silent_stream);
            double incomeTax = amount * 0.05;
            myBills.addMonthlyTaxBill(myBudget, incomeTax, my, date, silent_stream);
            
            myBudget.saveToFile(LEDGER_FILE);
            myBills.saveToFile(BILLS_FILE);
            
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        } 
        else if (cmd == "add_bill") {
            string name = getStringValue(cmd_line, "name");
            double amount = getDoubleValue(cmd_line, "amount");
            double tax = getDoubleValue(cmd_line, "tax");
            string due = getStringValue(cmd_line, "due");
            string my = getStringValue(cmd_line, "my");
            bool on_time = getBoolValue(cmd_line, "on_time");
            string sub_date = getStringValue(cmd_line, "sub_date");

            bool pay_now = true;
            if (cmd_line.find("\"pay_now\"") != string::npos) {
                pay_now = getBoolValue(cmd_line, "pay_now");
            }

            Bill newBill(name, amount, due, my, "UTILITY", tax);
            if (pay_now) {
                newBill.processBillPayment(myBudget, on_time, sub_date, silent_stream);
            }
            myBills.addBill(newBill);
            
            myBudget.saveToFile(LEDGER_FILE);
            myBills.saveToFile(BILLS_FILE);
            
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        } 
        else if (cmd == "invest") {
            string stock = getStringValue(cmd_line, "stock");
            double amount = getDoubleValue(cmd_line, "amount");
            double tax = getDoubleValue(cmd_line, "tax");
            string date = getStringValue(cmd_line, "date");
            string my = getStringValue(cmd_line, "my");

            myStocks.investFromLedger(myBudget, stock, amount, date, my, tax, silent_stream);
            
            myBudget.saveToFile(LEDGER_FILE);
            myStocks.saveToFile(STOCKS_FILE);
            
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        } 
        else if (cmd == "update_investment") {
            int index = getIntValue(cmd_line, "invest_index");
            double new_val = getDoubleValue(cmd_line, "new_value");
            
            auto& list = myStocks.getInvestments();
            if (index >= 0 && index < (int)list.size()) {
                list[index].updateValue(new_val);
                myStocks.saveToFile(STOCKS_FILE);
            }
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        } 
        else if (cmd == "sell_investment") {
            int index = getIntValue(cmd_line, "invest_index");
            double sell_price = getDoubleValue(cmd_line, "sell_price");
            string date = getStringValue(cmd_line, "date");
            if (date.empty()) date = getToday();
            
            auto& list = myStocks.getInvestments();
            if (index >= 0 && index < (int)list.size()) {
                list[index].updateValue(sell_price);
                list[index].sellAndAddToLedger(myBudget, date, silent_stream);
                list.erase(list.begin() + index);
                
                myBudget.saveToFile(LEDGER_FILE);
                myStocks.saveToFile(STOCKS_FILE);
            }
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        }
        else if (cmd == "consolidate_savings") {
            string my = getStringValue(cmd_line, "my");
            myBudget.consolidateSavings(my, silent_stream);
            
            myBudget.saveToFile(LEDGER_FILE);
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        }
        else if (cmd == "add_savings") {
            double amount = getDoubleValue(cmd_line, "amount");
            string desc = getStringValue(cmd_line, "desc");
            string date = getStringValue(cmd_line, "date");
            string my = getStringValue(cmd_line, "my");
            
            myBudget.addTransaction(new SavingsTransfer(date, amount, desc, my), silent_stream);
            myBudget.saveToFile(LEDGER_FILE);
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        }
        else if (cmd == "clear_data") {
            myBudget.clearTransactions();
            myBills = BillManager();
            myStocks = PortfolioManager();
            
            myBudget.saveToFile(LEDGER_FILE);
            myBills.saveToFile(BILLS_FILE);
            myStocks.saveToFile(STOCKS_FILE);
            
            cout << getFullStatusJSON(myBudget, myBills, myStocks) << endl;
        }
    }
    return 0;
}
