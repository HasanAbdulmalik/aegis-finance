#include "finance_core.h"

string getToday(){
    time_t now = time(0);
    tm *ltm = localtime(&now);     
    int year = 1900 + ltm->tm_year;
    int month = 1 + ltm->tm_mon;
    int day = ltm->tm_mday;
    string date = to_string(year) + "-";
    if (month < 10) date += "0";
    date += to_string(month) + "-";
    if (day < 10) date += "0";
    date += to_string(day);
    return date;
}

string getMonthYear(int year, int month){
    return to_string(year) + "-" + (month < 10? "0" : "") + to_string(month);
}

Transaction::Transaction(string d, double a, string desc, string cat, string my) 
    : date(d), amount(a), description(desc), category(cat), monthYear(my) {}

double Transaction::getAmount() const { return amount; }
string Transaction::getDesc() const { return description; }
string Transaction::getDate() const { return date; }
string Transaction::getCategory() const { return category; }
string Transaction::getMonthYear() const { return monthYear; }

Ledger::Ledger() : balance(0), totalSavings(0), salaryIncome(0), investmentPL(0), 
                   totalBillsPaid(0), totalPenaltyPaid(0), totalTaxPaid(0), totalInvested(0) {}

void Ledger::addTransaction(Transaction* t, ostream& out){
    transactions.push_back(t);
    t->apply(*this, out);
}
void Ledger::updateBalance(double amount){ balance += amount; }
void Ledger::addToSalaryIncome(double amount){ salaryIncome += amount; }
void Ledger::addToInvestmentPL(double amount){ investmentPL += amount; }
void Ledger::addToBillsPaid(double amount){ totalBillsPaid += amount; }
void Ledger::addToPenalty(double amount){ totalPenaltyPaid += amount; }
void Ledger::addToTaxPaid(double amount){ totalTaxPaid += amount; }
void Ledger::addToInvested(double amount){ totalInvested += amount; }
void Ledger::addToSavings(double amount){ totalSavings += amount; }
double Ledger::getBalance() const{ return balance; }
double Ledger::getTotalSavings() const{ return totalSavings; }

void Ledger::consolidateSavings(const string& monthYear, ostream& out){
    if(balance > 0){
        addTransaction(new SavingsTransfer(getToday(), balance, "Monthly Savings", monthYear), out);
    }
}

void Ledger::showMonthlyReport(const string& monthYear, ostream& out) const{
    double mSalary = 0, mInvPL = 0, mBills = 0, mTax = 0, mPenalty = 0, mInvested = 0, mSavings = 0;
    for(auto t : transactions){
        if(t->getMonthYear() == monthYear){
            if(t->getCategory() == "SALARY"){
                mSalary += t->getAmount();
            }else if(t->getCategory() == "INVESTMENT_PL"){
                mInvPL += t->getAmount();
            }else if(t->getCategory() == "BILL"){ 
                mBills += t->getAmount();
            }else if(t->getCategory() == "TAX"){
                mTax += t->getAmount();
            }else if(t->getCategory() == "PENALTY"){
                mPenalty += t->getAmount();
            }else if(t->getCategory() == "INVESTMENT_EXP"){
                mInvested += t->getAmount();
            }else if(t->getCategory() == "SAVINGS"){
                mSavings += t->getAmount();
            }
        }
    }
    out<<"\n========== REPORT FOR "<<monthYear<<" =========="<<endl;
    out<<"Salary Income: "<<fixed<<setprecision(2)<<mSalary<<endl;
    out<<"Investment Made: "<<mInvested<<endl;
    out<<"Investment P/L: "<<mInvPL<<endl;
    out<<"Bills Paid: "<<mBills<<endl;
    out<<"Tax Paid: "<<mTax<<endl;
    out<<"Penalties Paid: "<<mPenalty<<endl;
    out<<"Moved to Savings: "<<mSavings<<endl;
    out<<"----------------------------------------"<<endl;
    out<<"Net for Month: "<<mSalary + mInvPL - mBills - mTax - mPenalty - mInvested<<endl;
    out<<"========================================"<<endl;
}

void Ledger::showOverallReport(ostream& out) const{
    out<<"\n================== OVERALL FINANCE REPORT =================="<<endl;
    out<<"\n INCOME BREAKDOWN:"<<endl;
    out<<" Total Salary Income: "<<fixed<<setprecision(2)<<salaryIncome<<endl;
    out<<" Total Investment Profit/Loss: "<<investmentPL<<endl;
    out<<" ----------------------------------"<<endl;
    out<<" TOTAL INCOME: "<<salaryIncome + investmentPL<<endl;

    out<<"\n INVESTMENT BREAKDOWN:"<<endl;
    out<<" Total Amount Invested: "<<totalInvested<<endl;
    out<<" Current Investment P/L: "<<investmentPL<<endl;
    out<<" ----------------------------------"<<endl;
    out<<" NET INVESTMENT RESULT: "<<totalInvested + investmentPL<<endl;

    out<<"\n EXPENSE BREAKDOWN:"<<endl;
    out<<" Total Bills Paid: "<<totalBillsPaid<<endl;
    out<<" Total Tax Paid: "<<totalTaxPaid<<endl;
    out<<" Total Penalties Paid: "<<totalPenaltyPaid<<endl;
    out<<" ----------------------------------"<<endl;
    out<<" TOTAL EXPENSES: "<<totalBillsPaid + totalPenaltyPaid + totalTaxPaid<<endl;

    out<<"\n SAVINGS & NET WORTH:"<<endl;
    out<<" Total Accumulated Savings: "<<totalSavings<<endl;
    out<<" Current Cash In Hand: "<<balance<<endl;
    out<<" ----------------------------------"<<endl;
    out<<" NET WORTH (Savings + Cash): "<<totalSavings + balance<<endl;
    out<<"============================================================="<<endl;
}

void Ledger::saveToFile(const string& filename) const{
    ofstream file(filename);
    for(auto t : transactions){
        file << t->serialize()<<endl;
    }
    file.close();
}

void Ledger::clearTransactions(){
    for(auto t : transactions){
        delete t;
    }
    transactions.clear();
    balance = 0; totalSavings = 0; salaryIncome = 0; investmentPL = 0; 
    totalBillsPaid = 0; totalPenaltyPaid = 0; totalTaxPaid = 0; totalInvested = 0;
}

Ledger::~Ledger(){
    for(auto t : transactions){
        delete t;
    }
}

SalaryIncome::SalaryIncome(string d, double a, string des, string my) 
    : Transaction(d, a, des, "SALARY", my){}

void SalaryIncome::apply(Ledger& ledger, ostream& out){
    ledger.updateBalance(amount);
    ledger.addToSalaryIncome(amount);
    out<<"Salary Credited: +"<<amount<<" | "<<description<<" | "<<monthYear<<endl;
}
string SalaryIncome::serialize() const{
    return "SALARY," + date + "," + to_string(amount) + "," + description + "," + monthYear;
}

InvestmentProfit::InvestmentProfit(string d, double a, string des, string my) 
    : Transaction(d, a, des, "INVESTMENT_PL", my) {}

void InvestmentProfit::apply(Ledger& ledger, ostream& out){
    ledger.updateBalance(amount);
    ledger.addToInvestmentPL(amount);
    if(amount >= 0){
        out << "Investment Profit: +" << amount << " | " << description << " | " << monthYear << endl;
    }else{
        out << "Investment Loss: " << amount << " | " << description << " | " << monthYear << endl;
    }
}
string InvestmentProfit::serialize()const{
    return "INVESTPL," + date + "," + to_string(amount) + "," + description + "," + monthYear;
}

Expense::Expense(string d, double a, string des, string cat, string my) 
    : Transaction(d, a, des, cat, my) {}

void Expense::apply(Ledger& ledger, ostream& out) {
    if (ledger.getBalance() < amount && category!= "SAVINGS") {
        out << "Warning: Insufficient balance for " << description << ". Transaction recorded as overdraft." << endl;
    }
    ledger.updateBalance(-amount);
    if(category == "TAX") ledger.addToTaxPaid(amount);
    else if(category == "PENALTY") ledger.addToPenalty(amount);
    else if(category == "BILL") ledger.addToBillsPaid(amount);
    out << "Deducted: -" << amount << " | " << description << " | " << monthYear << endl;
}
string Expense::serialize() const {
    return "EXPENSE," + date + "," + to_string(amount) + "," + description + "," + category + "," + monthYear;
}

InvestmentExpense::InvestmentExpense(string d, double a, string des, string my) 
    : Transaction(d, a, des, "INVESTMENT_EXP", my) {}

void InvestmentExpense::apply(Ledger& ledger, ostream& out){
    ledger.updateBalance(-amount);
    ledger.addToInvested(amount);
    out<<"Invested: -"<<amount<<" | "<<description<<" | "<< monthYear<<endl;
}
string InvestmentExpense::serialize() const{
    return "INVESTEXP," + date + "," + to_string(amount) + "," + description + "," + monthYear;
}

SavingsTransfer::SavingsTransfer(string d, double a, string des, string my) 
    : Transaction(d, a, des, "SAVINGS", my) {}

void SavingsTransfer::apply(Ledger& ledger, ostream& out){
    ledger.updateBalance(-amount);
    ledger.addToSavings(amount);
    out<<"Transferred to Savings: "<<amount<<" | "<<description<<" | "<<monthYear<<endl;
}
string SavingsTransfer::serialize()const{
    return "SAVINGS," + date + "," + to_string(amount) + "," + description + "," + monthYear;
}

InvestmentRefund::InvestmentRefund(string d, double a, string des, string my) 
    : Transaction(d, a, des, "INVESTMENT_REF", my) {}

void InvestmentRefund::apply(Ledger& ledger, ostream& out){
    ledger.updateBalance(amount);
    ledger.addToInvested(-amount);
    out<<"Investment Refunded: +"<<amount<<" | "<<description<<" | "<<monthYear<<endl;
}
string InvestmentRefund::serialize() const{
    return "INVESTREF," + date + "," + to_string(amount) + "," + description + "," + monthYear;
}

bool Bill::isOverdue() const{
    return dueDate < getToday();
}
double Bill::calculatePenalty() const{ 
    return baseAmount * 0.03; 
}

Bill::Bill(string n, double a, string d, string my, string type, double tax){
    name = n;
    baseAmount = a;
    dueDate = d;
    isPaid = false;
    billType = type;
    taxComponent = tax;
    monthYear = my;
}

void Bill::processBillPayment(Ledger& mainLedger, bool submittedOnTime, const string& submissionDate, ostream& out){
    if(isPaid) return;
    double totalAmount = baseAmount + taxComponent;

    out<<"\n----------------------------------------"<<endl;
    out<<"BILL TYPE: "<<billType<<" | MONTH: "<<monthYear<<endl;
    out<<"BILL: "<<name<<" | Base: "<<baseAmount;
    if(taxComponent > 0){
        out<<" | Tax: "<<taxComponent;
    }
    out<<" | Due: "<<dueDate<<endl;
    out<<"----------------------------------------"<<endl;

    if(submittedOnTime){
        out<<"Total Payable: "<<totalAmount<<endl;
        Expense* billExpense = new Expense(submissionDate, baseAmount, "Bill Paid: " + name, "BILL", monthYear);
        mainLedger.addTransaction(billExpense, out);
        if(taxComponent > 0){
            Expense* taxExpense = new Expense(submissionDate, taxComponent, "Tax: " + name, "TAX", monthYear);
            mainLedger.addTransaction(taxExpense, out);
        }
        isPaid = true;
    }else{
        double penalty = calculatePenalty();
        out<<"STATUS: OVERDUE! Penalty: "<<penalty<<endl;
        out<<"Total Payable: "<<totalAmount + penalty<<endl;
        Expense* billExpense = new Expense(submissionDate, baseAmount, "Bill: " + name, "BILL", monthYear);
        Expense* penaltyExpense = new Expense(submissionDate, penalty, "Late Penalty: " + name, "PENALTY", monthYear);
        mainLedger.addTransaction(billExpense, out);
        mainLedger.addTransaction(penaltyExpense, out);
        if(taxComponent > 0){
            Expense* taxExpense = new Expense(submissionDate, taxComponent, "Tax: " + name, "TAX", monthYear);
            mainLedger.addTransaction(taxExpense, out);
        }
        isPaid = true;
    }
}

string Bill::serialize() const{
    return billType + "," + name + "," + to_string(baseAmount) + "," + to_string(taxComponent) + "," + dueDate + "," + (isPaid? "1" : "0") + "," + monthYear;
}

Bill Bill::deserialize(const string& line){
    stringstream ss(line);
    string type, name, amt, tax, date, paid, my;
    getline(ss, type, ',');
    getline(ss, name, ','); 
    getline(ss, amt, ','); 
    getline(ss, tax, ','); 
    getline(ss, date, ','); 
    getline(ss, paid, ','); 
    getline(ss, my, ',');
    Bill b(name, stod(amt), date, my, type, stod(tax));
    if(paid == "1"){
        b.isPaid = true;
    }
    return b;
}

bool Bill::getPaidStatus() const{ return isPaid; }
string Bill::getName() const{ return name; }
string Bill::getType() const{ return billType; }
string Bill::getMonthYear() const{ return monthYear; }

void BillManager::addBill(const Bill& b){ 
    bills.push_back(b); 
}
void BillManager::addMonthlyTaxBill(Ledger& mainLedger, double amount, string monthYear, const string& date, ostream& out){
    if(amount <= 0){
        return;
    }
    out<<"\nAuto-deducting Income Tax (5% of salary): "<<fixed<<setprecision(2)<<amount<<endl;
    Expense* taxExpense = new Expense(date, amount, "Auto Income Tax - " + monthYear, "TAX", monthYear);
    mainLedger.addTransaction(taxExpense, out);
}
void BillManager::saveToFile(const string& filename) const{
    ofstream file(filename);
    for(const auto& b : bills){
        file<<b.serialize()<<endl;
    }
    file.close();
}
void BillManager::loadFromFile(const string& filename){
    bills.clear();
    ifstream file(filename);
    string line;
    while(getline(file, line)){
        if(!line.empty()){
            bills.push_back(Bill::deserialize(line));
        }
    }
    file.close();
}

Investment::Investment(string n, double amt, string date, string my, double tax){
    stockName = n; 
    investedAmount = amt; 
    currentValue = amt; 
    investDate = date; 
    entryTax = tax; 
    monthYear = my;
}
void Investment::updateValue(double newVal){ 
    currentValue = newVal; 
}
double Investment::getProfitLoss() const{ 
    return currentValue - investedAmount - entryTax; 
}
double Investment::getInvested() const{ return investedAmount; }
double Investment::getCurrent() const{ return currentValue; }
double Investment::getEntryTax() const{ return entryTax; }
string Investment::getName() const{ return stockName; }
string Investment::getMonthYear() const{ return monthYear; }

void Investment::sellAndAddToLedger(Ledger& mainLedger, const string& date, ostream& out){
    double profit = getProfitLoss();
    double refundVal = investedAmount + entryTax;
    InvestmentRefund* refTransaction = new InvestmentRefund(date, refundVal, "Principal Refund: " + stockName, monthYear);
    mainLedger.addTransaction(refTransaction, out);
    InvestmentProfit* plTransaction = new InvestmentProfit(date, profit, "P/L from " + stockName, monthYear);
    mainLedger.addTransaction(plTransaction, out);
}
string Investment::serialize() const{
    return stockName + "," + to_string(investedAmount) + "," + to_string(currentValue) + "," + to_string(entryTax) + "," + investDate + "," + monthYear;
}

Investment Investment::deserialize(const string& line) {
    stringstream ss(line);
    string name, inv, curr, tax, date, my;
    getline(ss, name, ',');
    getline(ss, inv, ','); 
    getline(ss, curr, ','); 
    getline(ss, tax, ','); 
    getline(ss, date, ','); 
    getline(ss, my, ',');
    Investment inv_Obj(name, stod(inv), date, my, stod(tax));
    inv_Obj.updateValue(stod(curr));
    return inv_Obj;
}

void PortfolioManager::investFromLedger(Ledger& mainLedger, string stock, double amount, string date, string my, double tax, ostream& out){
    double totalCost = amount + tax;
    if(mainLedger.getBalance() >= totalCost){
        investments.push_back(Investment(stock, amount, date, my, tax));
        InvestmentExpense* invExpense = new InvestmentExpense(date, amount, "Invested in " + stock, my);
        mainLedger.addTransaction(invExpense, out);
        if(tax > 0){
            Expense* taxExpense = new Expense(date, tax, "Investment Tax: " + stock, "TAX", my);
            mainLedger.addTransaction(taxExpense, out);
        }
        out << "Invested " << amount << " in " << stock << " with tax " << tax << " for " << my << endl;
    }else{
        out << "Insufficient balance to invest!" << endl;
    }
}
void PortfolioManager::showInvestmentReport(ostream& out) const{
    double totalCurrent = 0;
    double totalInvested = 0;
    double totalTax = 0;
    out<<"\n================== INVESTMENT REPORT =================="<<endl;
    out<<"\nIndividual Stock Status:"<<endl;
    for(const auto& i : investments){
        out<<" - "<<i.getName()<<" | Month: "<<i.getMonthYear()<< " | Invested: " << i.getInvested()<< " | Tax Paid: " << i.getEntryTax()<< " | Current: " << i.getCurrent()<< " | P/L: " << i.getProfitLoss() << endl;
        totalCurrent += i.getCurrent();
        totalInvested += i.getInvested();
        totalTax += i.getEntryTax();
    }
    out<<"------------------------------------------------------"<<endl;
    out<<"Total Amount Invested: "<<totalInvested<<endl;
    out<<"Total Investment Tax Paid: "<<totalTax<<endl;
    out<<"Current Portfolio Value: "<<totalCurrent<<endl;
    out<<"Overall Investment Result (after tax): "<<totalCurrent - totalInvested - totalTax<<endl;
    out<<"======================================================"<<endl;
}
void PortfolioManager::saveToFile(const string& filename) const{
    ofstream file(filename);
    for(const auto& i : investments){
        file<<i.serialize()<<endl;
    }
    file.close();
}
void PortfolioManager::loadFromFile(const string& filename){
    investments.clear();
    ifstream file(filename);
    string line;
    while(getline(file, line)){
        if(!line.empty()){
            investments.push_back(Investment::deserialize(line));
        }
    }
    file.close();
}
vector<Investment>& PortfolioManager::getInvestments(){ 
    return investments; 
}
