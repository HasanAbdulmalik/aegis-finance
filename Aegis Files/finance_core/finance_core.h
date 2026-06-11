#ifndef FINANCE_CORE_H
#define FINANCE_CORE_H

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

string getToday();
string getMonthYear(int year, int month);

class Transaction {
protected:
    string date;
    double amount;
    string description;
    string category;
    string monthYear;
public:
    Transaction(string d, double a, string desc, string cat, string my);
    virtual void apply(Ledger& ledger, ostream& out = cout) = 0;
    virtual ~Transaction() {}
    virtual string serialize() const = 0;
    double getAmount() const;
    string getDesc() const;
    string getDate() const;
    string getCategory() const;
    string getMonthYear() const;
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
    Ledger();
    void addTransaction(Transaction* t, ostream& out = cout);
    void updateBalance(double amount);
    void addToSalaryIncome(double amount);
    void addToInvestmentPL(double amount);
    void addToBillsPaid(double amount);
    void addToPenalty(double amount);
    void addToTaxPaid(double amount);
    void addToInvested(double amount);
    void addToSavings(double amount);
    double getBalance() const;
    double getTotalSavings() const;
    void consolidateSavings(const string& monthYear, ostream& out = cout);
    void showMonthlyReport(const string& monthYear, ostream& out = cout) const;
    void showOverallReport(ostream& out = cout) const;
    void saveToFile(const string& filename) const;
    void clearTransactions();
    const vector<Transaction*>& getTransactions() const { return transactions; }
    ~Ledger();
};

class SalaryIncome : public Transaction {
public:
    SalaryIncome(string d, double a, string des, string my);
    void apply(Ledger& ledger, ostream& out = cout) override;
    string serialize() const override;
};

class InvestmentProfit : public Transaction{
public:
    InvestmentProfit(string d, double a, string des, string my);
    void apply(Ledger& ledger, ostream& out = cout) override;
    string serialize() const override;
};

class Expense : public Transaction {
public:
    Expense(string d, double a, string des, string cat, string my);
    void apply(Ledger& ledger, ostream& out = cout) override;
    string serialize() const override;
};

class InvestmentExpense : public Transaction{
public:
    InvestmentExpense(string d, double a, string des, string my);
    void apply(Ledger& ledger, ostream& out = cout) override;
    string serialize() const override;
};

class SavingsTransfer : public Transaction{
public:
    SavingsTransfer(string d, double a, string des, string my);
    void apply(Ledger& ledger, ostream& out = cout) override;
    string serialize() const override;
};

class InvestmentRefund : public Transaction{
public:
    InvestmentRefund(string d, double a, string des, string my);
    void apply(Ledger& ledger, ostream& out = cout) override;
    string serialize() const override;
};

class Bill{
protected:
    string name;
    double baseAmount;
    string dueDate;
    bool isPaid;
    string billType;
    double taxComponent;
    string monthYear;

    bool isOverdue() const;
    double calculatePenalty() const;
public:
    Bill(string n, double a, string d, string my, string type = "NORMAL", double tax = 0);
    virtual void processBillPayment(Ledger& mainLedger, bool submittedOnTime, const string& submissionDate, ostream& out = cout);
    virtual string serialize() const;
    static Bill deserialize(const string& line);
    bool getPaidStatus() const;
    string getName() const;
    string getType() const;
    string getMonthYear() const;
    double getBaseAmount() const { return baseAmount; }
    double getTaxComponent() const { return taxComponent; }
    string getDueDate() const { return dueDate; }
};

class BillManager{
private:
    vector<Bill> bills;
public:
    void addBill(const Bill& b);
    void addMonthlyTaxBill(Ledger& mainLedger, double amount, string monthYear, const string& date, ostream& out = cout);
    void saveToFile(const string& filename) const;
    void loadFromFile(const string& filename);
    const vector<Bill>& getBills() const { return bills; }
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
    Investment(string n, double amt, string date, string my, double tax = 0);
    void updateValue(double newVal);
    double getProfitLoss() const;
    double getInvested() const;
    double getCurrent() const;
    double getEntryTax() const;
    string getName() const;
    string getMonthYear() const;
    void sellAndAddToLedger(Ledger& mainLedger, const string& date, ostream& out = cout);
    string serialize() const;
    static Investment deserialize(const string& line);
};

class PortfolioManager{
private:
    vector<Investment> investments;
public:
    void investFromLedger(Ledger& mainLedger, string stock, double amount, string date, string my, double tax = 0, ostream& out = cout);
    void showInvestmentReport(ostream& out = cout) const;
    void saveToFile(const string& filename) const;
    void loadFromFile(const string& filename);
    vector<Investment>& getInvestments();
};

#endif
