#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <fstream>
#include <sstream>
#include <limits>
#include <ctime>
using namespace std;

class Ledger;
class SavingsTransfer;

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

bool isValidDate(const string& date) {
    if (date.length() != 10) return false;
    if (date[4] != '-' || date[7] != '-') return false;
    for (int i = 0; i < 10; ++i) {
        if (i == 4 || i == 7) continue;
        if (!isdigit(date[i])) return false;
    }
    int year = stoi(date.substr(0, 4));
    int month = stoi(date.substr(5, 2));
    int day = stoi(date.substr(8, 2));
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    int daysInMonth[] = { 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) {
        daysInMonth[2] = 29;
    }
    if (day < 1 || day > daysInMonth[month]) return false;
    return true;
}

string getDateInput(const string& prompt) {
    string date;
    while (true) {
        cout << prompt;
        cin >> date;
        if (cin.eof()) {
            cout << "\nInput stream closed. Exiting..." << endl;
            exit(1);
        }
        if (cin.fail() || !isValidDate(date)) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid date. Please enter a valid date in YYYY-MM-DD format (between 1900 and 2100): ";
        } else {
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            return date;
        }
    }
}

char getYesNoInput(const string& prompt) {
    char choice;
    while (true) {
        cout << prompt;
        cin >> choice;
        if (cin.eof()) {
            cout << "\nInput stream closed. Exiting..." << endl;
            exit(1);
        }
        if (cin.fail() || (choice != 'y' && choice != 'Y' && choice != 'n' && choice != 'N')) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid choice. Please enter 'y' or 'n': ";
        } else {
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            return choice;
        }
    }
}

int getIntegerInput(const string& prompt, int minVal, int maxVal) {
    int value;
    while (true) {
        cout << prompt;
        cin >> value;
        if (cin.eof()) {
            cout << "\nInput stream closed. Exiting..." << endl;
            exit(1);
        }
        if (cin.fail() || value < minVal || value > maxVal) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid input. Please enter an integer between " << minVal << " and " << maxVal << ": ";
        } else {
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            return value;
        }
    }
}

double getPositiveInput(const string& prompt) {
    double value;
    while (true) {
        cout << prompt;
        cin >> value;
        if (cin.eof()) {
            cout << "\nInput stream closed. Exiting..." << endl;
            exit(1);
        }
        if (cin.fail() || value < 0) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid input. Please enter a non-negative number: ";
        } else {
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            return value;
        }
    }
}

class Transaction {
protected:
    string date;
    double amount;
    string description;
    string category;
    string monthYear;
public:
    Transaction(string d, double a, string desc, string cat, string my) : date(d), amount(a), description(desc), category(cat), monthYear(my){}
    virtual void apply(Ledger& ledger) = 0;
    virtual ~Transaction() {}
    virtual string serialize() const = 0;
    double getAmount() const{ 
        return amount; 
    }
    string getDesc() const{ 
        return description; 
    }
    string getDate() const{ 
        return date;
    }
    string getCategory() const{ 
        return category;
    }
    string getMonthYear() const{ 
        return monthYear; 
    }
};

class Ledger {
private:
    vector<Transaction*> transactions;
    double balance; 
    double totalSavings; 
    double salaryIncome;
    double investmentPL;
    double totalBillsPaid;
    double totalPenaltyPaid;
    double totalTaxPaid;
    double totalInvested;
public:
    Ledger() : balance(0), totalSavings(0), salaryIncome(0), investmentPL(0), totalBillsPaid(0), totalPenaltyPaid(0), totalTaxPaid(0), totalInvested(0) {}

    void addTransaction(Transaction* t){
        transactions.push_back(t);
        t->apply(*this);
    }
    void updateBalance(double amount){ 
        balance += amount; 
    }
    void addToSalaryIncome(double amount){ 
        salaryIncome += amount; 
    }
    void addToInvestmentPL(double amount){ 
        investmentPL += amount; 
    }
    void addToBillsPaid(double amount){ 
        totalBillsPaid += amount; 
    }
    void addToPenalty(double amount){ 
        totalPenaltyPaid += amount;
    }
    void addToTaxPaid(double amount){ 
        totalTaxPaid += amount;
    }
    void addToInvested(double amount){ 
        totalInvested += amount;
    }
    void addToSavings(double amount){ 
        totalSavings += amount; 
    }
    double getBalance() const{ 
        return balance; 
    }
    double getTotalSavings() const{ 
        return totalSavings;
    }
    void consolidateSavings(const string& monthYear);

    void showMonthlyReport(const string& monthYear) const{
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
        cout<<"\n========== REPORT FOR "<<monthYear<<" =========="<<endl;
        cout<<"Salary Income: "<<fixed<<setprecision(2)<<mSalary<<endl;
        cout<<"Investment Made: "<<mInvested<<endl;
        cout<<"Investment P/L: "<<mInvPL<<endl;
        cout<<"Bills Paid: "<<mBills<<endl;
        cout<<"Tax Paid: "<<mTax<<endl;
        cout<<"Penalties Paid: "<<mPenalty<<endl;
        cout<<"Moved to Savings: "<<mSavings<<endl;
        cout<<"----------------------------------------"<<endl;
        cout<<"Net for Month: "<<mSalary + mInvPL - mBills - mTax - mPenalty - mInvested<<endl;
        cout<<"========================================"<<endl;
    }

    void showOverallReport() const{
        cout<<"\n================== OVERALL FINANCE REPORT =================="<<endl;
        cout<<"\n INCOME BREAKDOWN:"<<endl;
        cout<<" Total Salary Income: "<<fixed<<setprecision(2)<<salaryIncome<<endl;
        cout<<" Total Investment Profit/Loss: "<<investmentPL<<endl;
        cout<<" ----------------------------------"<<endl;
        cout<<" TOTAL INCOME: "<<salaryIncome + investmentPL<<endl;

        cout<<"\n INVESTMENT BREAKDOWN:"<<endl;
        cout<<" Total Amount Invested: "<<totalInvested<<endl;
        cout<<" Current Investment P/L: "<<investmentPL<<endl;
        cout<<" ----------------------------------"<<endl;
        cout<<" NET INVESTMENT RESULT: "<<totalInvested + investmentPL<<endl;

        cout<<"\n EXPENSE BREAKDOWN:"<<endl;
        cout<<" Total Bills Paid: "<<totalBillsPaid<<endl;
        cout<<" Total Tax Paid: "<<totalTaxPaid<<endl;
        cout<<" Total Penalties Paid: "<<totalPenaltyPaid<<endl;
        cout<<" ----------------------------------"<<endl;
        cout<<" TOTAL EXPENSES: "<<totalBillsPaid + totalPenaltyPaid + totalTaxPaid<<endl;

        cout<<"\n SAVINGS & NET WORTH:"<<endl;
        cout<<" Total Accumulated Savings: "<<totalSavings<<endl;
        cout<<" Current Cash In Hand: "<<balance<<endl;
        cout<<" ----------------------------------"<<endl;
        cout<<" NET WORTH (Savings + Cash): "<<totalSavings + balance<<endl;
        cout<<"============================================================="<<endl;
    }

    void saveToFile(const string& filename) const{
        ofstream file(filename);
        for(auto t : transactions){
            file << t->serialize()<<endl;
        }
        file.close();
    }
    void clearTransactions(){
        for(auto t : transactions){
            delete t;
        }
        transactions.clear();
        balance = 0; totalSavings = 0; salaryIncome = 0; investmentPL = 0; totalBillsPaid = 0; totalPenaltyPaid = 0; totalTaxPaid = 0; totalInvested = 0;
    }

    ~Ledger(){ 
        for(auto t : transactions){
            delete t; 
        }
    }
};

class SalaryIncome : public Transaction {
public:
    SalaryIncome(string d, double a, string des, string my) : Transaction(d, a, des, "SALARY", my){}

    void apply(Ledger& ledger) override{
        ledger.updateBalance(amount);
        ledger.addToSalaryIncome(amount);
        cout<<"Salary Credited: +"<<amount<<" | "<<description<<" | "<<monthYear<<endl;
    }
    string serialize() const override{
        return "SALARY," + date + "," + to_string(amount) + "," + description + "," + monthYear;
    }
};

class InvestmentProfit : public Transaction{
public:
    InvestmentProfit(string d, double a, string des, string my) : Transaction(d, a, des, "INVESTMENT_PL", my) {}
    void apply(Ledger& ledger) override{
        ledger.updateBalance(amount);
        ledger.addToInvestmentPL(amount);
        if(amount >= 0){
            cout << "Investment Profit: +" << amount << " | " << description << " | " << monthYear << endl;
        }else{
            cout << "Investment Loss: " << amount << " | " << description << " | " << monthYear << endl;
        }
    }
    string serialize()const override{
        return "INVESTPL," + date + "," + to_string(amount) + "," + description + "," + monthYear;
    }
};

class Expense : public Transaction {
public:
    Expense(string d, double a, string des, string cat, string my) : Transaction(d, a, des, cat, my) {}
    void apply(Ledger& ledger) override {
        if (ledger.getBalance() < amount && category!= "SAVINGS") {
            cout << "Warning: Insufficient balance for " << description << ". Transaction recorded as overdraft." << endl;
        }
        ledger.updateBalance(-amount);
        if(category == "TAX") ledger.addToTaxPaid(amount);
        else if(category == "PENALTY") ledger.addToPenalty(amount);
        else if(category == "BILL") ledger.addToBillsPaid(amount);
        cout << "Deducted: -" << amount << " | " << description << " | " << monthYear << endl;
    }
    string serialize() const override {
        return "EXPENSE," + date + "," + to_string(amount) + "," + description + "," + category + "," + monthYear;
    }
};

class InvestmentExpense : public Transaction{
public:
    InvestmentExpense(string d, double a, string des, string my) : Transaction(d, a, des, "INVESTMENT_EXP", my) {}
    void apply(Ledger& ledger) override{
        ledger.updateBalance(-amount);
        ledger.addToInvested(amount);
        cout<<"Invested: -"<<amount<<" | "<<description<<" | "<< monthYear<<endl;
    }
    string serialize() const override{
        return "INVESTEXP," + date + "," + to_string(amount) + "," + description + "," + monthYear;
    }
};

class SavingsTransfer : public Transaction{
public:
    SavingsTransfer(string d, double a, string des, string my) : Transaction(d, a, des, "SAVINGS", my) {}
    void apply(Ledger& ledger) override{
        ledger.updateBalance(-amount);
        ledger.addToSavings(amount);
        cout<<"Transferred to Savings: "<<amount<<" | "<<description<<" | "<<monthYear<<endl;
    }
    string serialize()const override{
        return "SAVINGS," + date + "," + to_string(amount) + "," + description + "," + monthYear;
    }
};

void Ledger::consolidateSavings(const string& monthYear){
    if(balance > 0){
        addTransaction(new SavingsTransfer(getToday(), balance, "Monthly Savings", monthYear));
    }
}

class Bill{
protected:
    string name;
    double baseAmount;
    string dueDate;
    bool isPaid;
    string billType;
    double taxComponent;
    string monthYear;

    bool isOverdue() const{
        return dueDate < getToday();
    }
    double calculatePenalty() const{ 
        return baseAmount * 0.15; 
    }
public:
    Bill(string n, double a, string d, string my, string type = "NORMAL", double tax = 0){
        name = n;
        baseAmount = a;
        dueDate = d;
        isPaid = false;
        billType = type;
        taxComponent = tax;
        monthYear = my;
    }
    virtual void processBillPayment(Ledger& mainLedger){
        if(isPaid) return;
        double totalAmount = baseAmount + taxComponent;

        cout<<"\n----------------------------------------"<<endl;
        cout<<"BILL TYPE: "<<billType<<" | MONTH: "<<monthYear<<endl;
        cout<<"BILL: "<<name<<" | Base: "<<baseAmount;
        if(taxComponent > 0){
            cout<<" | Tax: "<<taxComponent;
        }
        cout<<" | Due: "<<dueDate<<endl;
        cout<<"----------------------------------------"<<endl;
        char userChoice = getYesNoInput("Did you submit this bill on time? (y/n): ");

        string submissionDate;
        if(userChoice == 'y' || userChoice == 'Y'){
            submissionDate = getDateInput("Enter submission date (YYYY-MM-DD): ");
            if(submissionDate > dueDate){
                double penalty = calculatePenalty();
                cout<<"STATUS: OVERDUE! (Submitted late on "<<submissionDate<<") Penalty: "<<penalty<<endl;
                cout<<"Total Payable: "<<totalAmount + penalty<<endl;
                Expense* billExpense = new Expense(submissionDate, baseAmount, "Bill: " + name, "BILL", monthYear);
                Expense* penaltyExpense = new Expense(submissionDate, penalty, "Late Penalty: " + name, "PENALTY", monthYear);
                mainLedger.addTransaction(billExpense);
                mainLedger.addTransaction(penaltyExpense);
                if(taxComponent > 0){
                    Expense* taxExpense = new Expense(submissionDate, taxComponent, "Tax: " + name, "TAX", monthYear);
                    mainLedger.addTransaction(taxExpense);
                }
            }else{
                cout<<"Total Payable: "<<totalAmount<<endl;
                Expense* billExpense = new Expense(submissionDate, baseAmount, "Bill Paid: " + name, "BILL", monthYear);
                mainLedger.addTransaction(billExpense);
                if(taxComponent > 0){
                    Expense* taxExpense = new Expense(submissionDate, taxComponent, "Tax: " + name, "TAX", monthYear);
                    mainLedger.addTransaction(taxExpense);
                }
            }
            isPaid = true;
        }else{
            double penalty = calculatePenalty();
            cout<<"STATUS: OVERDUE! Penalty: "<<penalty<<endl;
            cout<<"Total Payable: "<<totalAmount + penalty<<endl;
            submissionDate = getDateInput("Enter late submission/payment date (YYYY-MM-DD): ");
            Expense* billExpense = new Expense(submissionDate, baseAmount, "Bill: " + name, "BILL", monthYear);
            Expense* penaltyExpense = new Expense(submissionDate, penalty, "Late Penalty: " + name, "PENALTY", monthYear);
            mainLedger.addTransaction(billExpense);
            mainLedger.addTransaction(penaltyExpense);
            if(taxComponent > 0){
                Expense* taxExpense = new Expense(submissionDate, taxComponent, "Tax: " + name, "TAX", monthYear);
                mainLedger.addTransaction(taxExpense);
            }
            isPaid = true;
        }
    }
    virtual string serialize() const{
        return billType + "," + name + "," + to_string(baseAmount) + "," + to_string(taxComponent) + "," + dueDate + "," + (isPaid? "1" : "0") + "," + monthYear;
    }

    static Bill deserialize(const string& line){
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
    bool getPaidStatus() const{ 
        return isPaid; 
    }
    string getName() const{ 
        return name; 
    }
    string getType() const{ 
        return billType; 
    }
    string getMonthYear() const{ 
        return monthYear; 
    }
};

class BillManager{
private:
    vector<Bill>bills;
public:
    void addBill(const Bill& b){ 
        bills.push_back(b); 
    }
    void addMonthlyTaxBill(Ledger& mainLedger, double amount, string monthYear){
        if(amount <= 0){
            return;
        }
        cout<<"\nAuto-deducting Income Tax (15% of salary): "<<fixed<<setprecision(2)<<amount<<endl;
        Expense* taxExpense = new Expense(getToday(), amount, "Auto Income Tax - " + monthYear, "TAX", monthYear);
        mainLedger.addTransaction(taxExpense);
    }
    void saveToFile(const string& filename) const{
        ofstream file(filename);
        for(const auto& b : bills){
            file<<b.serialize()<<endl;
        }
        file.close();
    }
    void loadFromFile(const string& filename){
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
};

class Investment{
private:
    string stockName;
    double investedAmount;
    double currentValue;
    string investDate;
    double entryTax;
    string monthYear;
public:
    Investment(string n, double amt, string date, string my, double tax = 0){
        stockName = n; 
        investedAmount = amt; 
        currentValue = amt; 
        investDate = date; 
        entryTax = tax; 
        monthYear = my;
    }
    void updateValue(double newVal){ 
        currentValue = newVal; 
    }
    double getProfitLoss() const{ 
        return currentValue - investedAmount - entryTax; 
    }
    double getInvested() const{ 
        return investedAmount; 
    }
    double getCurrent() const{ 
        return currentValue; 
    }
    double getEntryTax() const{ 
        return entryTax; 
    }
    string getName() const{ 
        return stockName; 
    }
    string getMonthYear() const{ 
        return monthYear; 
    }
    void sellAndAddToLedger(Ledger& mainLedger){
        double profit = getProfitLoss();
        InvestmentProfit* plTransaction = new InvestmentProfit(getToday(), profit, "P/L from " + stockName, monthYear);
        mainLedger.addTransaction(plTransaction);
    }
    string serialize() const{
        return stockName + "," + to_string(investedAmount) + "," + to_string(currentValue) + "," + to_string(entryTax) + "," + investDate + "," + monthYear;
    }

    static Investment deserialize(const string& line) {
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
};

class PortfolioManager{
private:
    vector<Investment>investments;
public:
    void investFromLedger(Ledger& mainLedger, string stock, double amount, string date, string my, double tax = 0){
        double totalCost = amount + tax;
        if(mainLedger.getBalance() >= totalCost){
            investments.push_back(Investment(stock, amount, date, my, tax));
            InvestmentExpense* invExpense = new InvestmentExpense(date, amount, "Invested in " + stock, my);
            mainLedger.addTransaction(invExpense);
            if(tax > 0){
                Expense* taxExpense = new Expense(date, tax, "Investment Tax: " + stock, "TAX", my);
                mainLedger.addTransaction(taxExpense);
            }
            cout << "Invested " << amount << " in " << stock << " with tax " << tax << " for " << my << endl;
        }else{
            cout << "Insufficient balance to invest!" << endl;
        }
    }
    void showInvestmentReport() const{
        double totalCurrent = 0;
        double totalInvested = 0;
        double totalTax = 0;
        cout<<"\n================== INVESTMENT REPORT =================="<<endl;
        cout<<"\nIndividual Stock Status:"<<endl;
        for(const auto& i : investments){
            cout<<" - "<<i.getName()<<" | Month: "<<i.getMonthYear()<< " | Invested: " << i.getInvested()<< " | Tax Paid: " << i.getEntryTax()<< " | Current: " << i.getCurrent()<< " | P/L: " << i.getProfitLoss() << endl;
            totalCurrent += i.getCurrent();
            totalInvested += i.getInvested();
            totalTax += i.getEntryTax();
        }
        cout<<"------------------------------------------------------"<<endl;
        cout<<"Total Amount Invested: "<<totalInvested<<endl;
        cout<<"Total Investment Tax Paid: "<<totalTax<<endl;
        cout<<"Current Portfolio Value: "<<totalCurrent<<endl;
        cout<<"Overall Investment Result (after tax): "<<totalCurrent - totalInvested - totalTax<<endl;
        cout<<"======================================================"<<endl;
    }
    void saveToFile(const string& filename) const{
        ofstream file(filename);
        for(const auto& i : investments){
            file<<i.serialize()<<endl;
        }
        file.close();
    }
    void loadFromFile(const string& filename){
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
    vector<Investment>&getInvestments(){ 
        return investments; 
    }
};

class FinanceApp {
private:
    Ledger myBudget;
    BillManager myBills;
    PortfolioManager myStocks;
    const string LEDGER_FILE = "ledger.txt";
    const string BILLS_FILE = "bills.txt";
    const string STOCKS_FILE = "stocks.txt";
    void clearScreen() { 
        cout<<"\n\n"<<endl; 
    }
    void waitForEnter(){
        cout<<"Press Enter to continue..."<<endl;
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        cin.get();
    }
    void handleMonthlyEntry(int year, int month){
        string monthYear = getMonthYear(year, month);
        clearScreen();
        cout<<"==================DATA ENTRY FOR "<<monthYear<<" =================="<<endl;

        double salary = getPositiveInput("Enter salary for " + monthYear + " (0 if none): ");
        if(salary > 0){
            myBudget.addTransaction(new SalaryIncome(getToday(), salary, "Monthly Salary", monthYear));
        }

        double incomeTax = salary * 0.15;
        myBills.addMonthlyTaxBill(myBudget, incomeTax, monthYear);

        int totalBills = getIntegerInput("\nHow many utility bills do you have for " + monthYear + "? (Excluding auto tax) ", 2, 100);

        double elecBill = getPositiveInput("\n--- [1] ELECTRICITY BILL for " + monthYear + " ---\nEnter Electricity Bill amount: ");
        if(elecBill > 0){
            string elecDue = getDateInput("Enter Due Date (YYYY-MM-DD): ");
            Bill electricity("Electricity Bill", elecBill, elecDue, monthYear, "UTILITY", 0);
            electricity.processBillPayment(myBudget);
            myBills.addBill(electricity);
        }

        double waterBill = getPositiveInput("\n--- [2] WATER BILL for " + monthYear + " ---\nEnter Water Bill amount: ");
        if(waterBill > 0){
            string waterDue = getDateInput("Enter Due Date (YYYY-MM-DD): ");
            Bill water("Water Bill", waterBill, waterDue, monthYear, "UTILITY", 0);
            water.processBillPayment(myBudget);
            myBills.addBill(water);
        }

        for(int i = 3; i <= totalBills; i++){
            string name, dueDate;
            double amount, tax = 0;
            char hasTax;
            cout<<"--- ["<<i<<"] OTHER BILL for "<<monthYear<<" ---\n"<<endl;
            cout<<"Bill Name: ";
            getline(cin, name);
            amount = getPositiveInput("Base Amount: ");
            hasTax = getYesNoInput("Is there government tax on this bill? (y/n): ");
            if(hasTax == 'y' || hasTax == 'Y'){
                tax = getPositiveInput("Tax Amount: ");
            }
            dueDate = getDateInput("Due Date (YYYY-MM-DD): ");
            Bill newBill(name, amount, dueDate, monthYear, "UTILITY", tax);
            newBill.processBillPayment(myBudget);
            myBills.addBill(newBill);
        }

        char hasInvest = getYesNoInput("\nDid you make any investment in " + monthYear + "? (y/n): ");
        if(hasInvest == 'y' || hasInvest == 'Y'){
            string stock;
            double amount, tax = 0;
            char hasTax;
            cout<<"Stock/Asset Name: ";
            getline(cin, stock);
            amount = getPositiveInput("Amount to Invest: ");
            hasTax = getYesNoInput("Is there entry tax/stamp duty? (y/n): ");
            if(hasTax == 'y' || hasTax == 'Y') {
                tax = getPositiveInput("Tax Amount: ");
            }
            myStocks.investFromLedger(myBudget, stock, amount, getToday(), monthYear, tax);
        }

        cout<<"Moving remaining cash to savings for \n"<<monthYear<<"..."<<endl;
        myBudget.consolidateSavings(monthYear);

        cout<<"\nData entry for "<<monthYear<<" completed."<<endl;
        myBudget.showMonthlyReport(monthYear);
        waitForEnter();
    }

    void handleUpdateInvestment(){
        clearScreen();
        if(myStocks.getInvestments().empty()){
            cout<<"No investments to update."<<endl;
            waitForEnter();
            return;
        }
        cout<<"--- Update Investment Value ---"<<endl;
        for(size_t i = 0; i < myStocks.getInvestments().size(); i++){
            cout<<i+1<<". "<<myStocks.getInvestments()[i].getName()<<" | Month: "<<myStocks.getInvestments()[i].getMonthYear()<<" | Current: "<<myStocks.getInvestments()[i].getCurrent()<<endl;
        }
        int choice = getIntegerInput("Select stock number to update: ", 1, myStocks.getInvestments().size());
        double newVal = getPositiveInput("Enter new current value: ");
        myStocks.getInvestments()[choice-1].updateValue(newVal);
        cout<<"Value updated."<<endl;
        waitForEnter();
    }

    void handleSellStock(){
        clearScreen();
        if(myStocks.getInvestments().empty()){
            cout<<"No investments to sell."<<endl;
            waitForEnter();
            return;
        }
        cout<<"--- Sell Investment ---"<<endl;
        for(size_t i = 0; i < myStocks.getInvestments().size(); i++){
            cout<<i+1<<". "<< myStocks.getInvestments()[i].getName()<<" | Month: "<<myStocks.getInvestments()[i].getMonthYear()
                <<" | Current: "<<myStocks.getInvestments()[i].getCurrent()
                <<" | P/L: "<<myStocks.getInvestments()[i].getProfitLoss()<<endl;
        }
        int choice = getIntegerInput("Select stock number to sell: ", 1, myStocks.getInvestments().size());
        myStocks.getInvestments()[choice-1].sellAndAddToLedger(myBudget);
        myStocks.getInvestments().erase(myStocks.getInvestments().begin() + choice - 1);
        cout<<"Stock sold and P/L added to budget."<<endl;
        waitForEnter();
    }

    void handleShowReport(){
        clearScreen();
        myStocks.showInvestmentReport();
        myBudget.showOverallReport();
        waitForEnter();
    }

    void loadAllData(){
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
                myBudget.addTransaction(new SalaryIncome(date, stod(amount), desc, my));
            }else if(type == "INVESTPL"){
                getline(ss, my, ',');
                myBudget.addTransaction(new InvestmentProfit(date, stod(amount), desc, my));
            }else if(type == "INVESTEXP"){
                getline(ss, my, ',');
                myBudget.addTransaction(new InvestmentExpense(date, stod(amount), desc, my));
            }else if(type == "EXPENSE"){
                getline(ss, cat, ','); getline(ss, my, ',');
                myBudget.addTransaction(new Expense(date, stod(amount), desc, cat, my));
            }else if(type == "SAVINGS"){
                getline(ss, my, ',');
                myBudget.addTransaction(new SavingsTransfer(date, stod(amount), desc, my));
            }
        }
        ledgerFile.close();
        myBills.loadFromFile(BILLS_FILE);
        myStocks.loadFromFile(STOCKS_FILE);
    }

    void saveAllData(){
        myBudget.saveToFile(LEDGER_FILE);
        myBills.saveToFile(BILLS_FILE);
        myStocks.saveToFile(STOCKS_FILE);
    }

    public:
    void run(){
        loadAllData();
        int choice;
        do{
            clearScreen();
            cout<<"======== PERSONAL FINANCE MANAGER ========"<<endl;
            cout<<"Current Cash: "<<fixed<<setprecision(2)<<myBudget.getBalance() << endl;
            cout<<"Total Savings: "<<myBudget.getTotalSavings()<<endl;
            cout<<"=========================================="<<endl;
            cout<<"1. Enter Data For Multiple Months"<<endl;
            cout<<"2. Update Investment Value"<<endl;
            cout<<"3. Sell Investment"<<endl;
            cout<<"4. Show Overall Finance Report"<<endl;
            cout<<"5. Save & Exit"<<endl;
            cout<<"=========================================="<<endl;
            choice = getIntegerInput("Enter your choice: ", 1, 5);

            switch(choice){
                case 1:{
                    int months = getIntegerInput("How many months of data do you want to record? ", 1, 120);
                    int startYear = getIntegerInput("Enter start year (e.g. 2026): ", 1900, 2100);
                    int startMonth = getIntegerInput("Enter start month (1-12): ", 1, 12);
                    for(int i = 0; i < months; i++){
                        int y = startYear + (startMonth + i - 1) / 12;
                        int m = (startMonth + i - 1) % 12 + 1;
                        handleMonthlyEntry(y, m);
                    }
                    break;
                }
                case 2:{ 
                    handleUpdateInvestment(); break;
                }
                case 3:{ 
                    handleSellStock(); break;
                }
                case 4:{ 
                    handleShowReport(); break;
                }
                case 5:{ 
                    saveAllData(); 
                    cout<<"Data saved. Exiting..."<<endl; break;
                }
                default:{
                    cout << "Invalid choice!" << endl; waitForEnter();
                }
            }
        }while(choice!= 5);
    }
};

int main() {
    FinanceApp app;
    app.run();
    return 0;
}
