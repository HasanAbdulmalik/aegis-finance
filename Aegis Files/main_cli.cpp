#include "finance_core/finance_core.h"

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
        myBills.addMonthlyTaxBill(myBudget, incomeTax, monthYear, getToday());

        int totalBills = getIntegerInput("\nHow many utility bills do you have for " + monthYear + "? (Excluding auto tax) ", 2, 100);

        double elecBill = getPositiveInput("\n--- [1] ELECTRICITY BILL for " + monthYear + " ---\nEnter Electricity Bill amount: ");
        if(elecBill > 0){
            string elecDue = getDateInput("Enter Due Date (YYYY-MM-DD): ");
            Bill electricity("Electricity Bill", elecBill, elecDue, monthYear, "UTILITY", 0);
            
            char userChoice = getYesNoInput("Did you submit this bill on time? (y/n): ");
            string submissionDate;
            bool onTime = (userChoice == 'y' || userChoice == 'Y');
            if(onTime){
                submissionDate = getDateInput("Enter submission date (YYYY-MM-DD): ");
            }else{
                submissionDate = getDateInput("Enter late submission/payment date (YYYY-MM-DD): ");
            }
            electricity.processBillPayment(myBudget, onTime, submissionDate);
            myBills.addBill(electricity);
        }

        double waterBill = getPositiveInput("\n--- [2] WATER BILL for " + monthYear + " ---\nEnter Water Bill amount: ");
        if(waterBill > 0){
            string waterDue = getDateInput("Enter Due Date (YYYY-MM-DD): ");
            Bill water("Water Bill", waterBill, waterDue, monthYear, "UTILITY", 0);
            
            char userChoice = getYesNoInput("Did you submit this bill on time? (y/n): ");
            string submissionDate;
            bool onTime = (userChoice == 'y' || userChoice == 'Y');
            if(onTime){
                submissionDate = getDateInput("Enter submission date (YYYY-MM-DD): ");
            }else{
                submissionDate = getDateInput("Enter late submission/payment date (YYYY-MM-DD): ");
            }
            water.processBillPayment(myBudget, onTime, submissionDate);
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
            
            char userChoice = getYesNoInput("Did you submit this bill on time? (y/n): ");
            string submissionDate;
            bool onTime = (userChoice == 'y' || userChoice == 'Y');
            if(onTime){
                submissionDate = getDateInput("Enter submission date (YYYY-MM-DD): ");
            }else{
                submissionDate = getDateInput("Enter late submission/payment date (YYYY-MM-DD): ");
            }
            newBill.processBillPayment(myBudget, onTime, submissionDate);
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
        myStocks.getInvestments()[choice-1].sellAndAddToLedger(myBudget, getToday());
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
            }else if(type == "INVESTREF"){
                getline(ss, my, ',');
                myBudget.addTransaction(new InvestmentRefund(date, stod(amount), desc, my));
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
