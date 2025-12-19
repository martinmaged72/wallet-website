/**
 * Database Simulation using LocalStorage
 * Acts as the Repository Layer.
 */
// Dependencies: models.js must be loaded before this.

class MockDatabase {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
        if (!localStorage.getItem('wallets')) localStorage.setItem('wallets', JSON.stringify([]));
        if (!localStorage.getItem('transactions')) localStorage.setItem('transactions', JSON.stringify([]));
    }

    // --- User Repository ---
    saveUser(user) {
        const users = JSON.parse(localStorage.getItem('users'));
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    findUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.find(u => u.email === email);
    }
    
    findUserByUsername(username) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.find(u => u.username === username);
    }

    findUserById(id) {
        const users = JSON.parse(localStorage.getItem('users'));
        return users.find(u => u.id === id);
    }

    // --- Wallet Repository ---
    saveWallet(wallet) {
        const wallets = JSON.parse(localStorage.getItem('wallets'));
        wallets.push(wallet);
        localStorage.setItem('wallets', JSON.stringify(wallets));
        return wallet;
    }

    updateWallet(wallet) {
        const wallets = JSON.parse(localStorage.getItem('wallets'));
        const index = wallets.findIndex(w => w.id === wallet.id);
        if (index !== -1) {
            wallets[index] = wallet;
            localStorage.setItem('wallets', JSON.stringify(wallets));
        }
    }

    findWalletByUserId(userId) {
        const wallets = JSON.parse(localStorage.getItem('wallets'));
        return wallets.find(w => w.userId === userId);
    }
    
    findWalletById(id) {
        const wallets = JSON.parse(localStorage.getItem('wallets'));
        return wallets.find(w => w.id === id);
    }

    // --- Transaction Repository ---
    saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        return transaction;
    }

    findTransactionsByWalletId(walletId) {
        const transactions = JSON.parse(localStorage.getItem('transactions'));
        return transactions.filter(t => t.senderWalletId === walletId || t.receiverWalletId === walletId)
                           .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

const db = new MockDatabase();
