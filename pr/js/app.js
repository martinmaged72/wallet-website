class User {
    constructor(id, username, email, password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = new Date().toISOString();
    }
}

class Wallet {
    constructor(id, userId) {
        this.id = id;
        this.userId = userId;
        this.balance = 0;
        this.currency = 'USD';
    }
}

class Transaction {
    constructor(id, amount, type, senderWalletId, receiverWalletId) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.senderWalletId = senderWalletId;
        this.receiverWalletId = receiverWalletId;
        this.timestamp = new Date().toISOString();
    }
}

class MockDatabase {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
        if (!localStorage.getItem('wallets')) localStorage.setItem('wallets', JSON.stringify([]));
        if (!localStorage.getItem('transactions')) localStorage.setItem('transactions', JSON.stringify([]));
    }

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

class AuthService {
    register(username, email, password) {
        if (db.findUserByEmail(email)) {
            throw new Error('Email already registered');
        }
        if (db.findUserByUsername(username)) {
            throw new Error('Username already taken');
        }

        const id = 'USER_' + Date.now();
        const passwordHash = btoa(password); 
        
        const newUser = new User(id, username, email, passwordHash);
        db.saveUser(newUser);

        const walletId = 'WALLET_' + Date.now();
        const newWallet = new Wallet(walletId, id);
        db.saveWallet(newWallet);
        
        return { user: newUser, wallet: newWallet };
    }

    login(email, password) {
        const user = db.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        const passwordHash = btoa(password);
        if (user.password !== passwordHash) {
            throw new Error('Invalid email or password');
        }
        
        return user;
    }
}

class WalletService {
    getWallet(userId) {
        return db.findWalletByUserId(userId);
    }

    deposit(userId, amount) {
        if (amount <= 0) throw new Error('Amount must be positive');
        
        const wallet = db.findWalletByUserId(userId);
        if (!wallet) throw new Error('Wallet not found');

        wallet.balance += parseFloat(amount);
        db.updateWallet(wallet);

        const txId = 'TX_DEP_' + Date.now();
        const transaction = new Transaction(txId, amount, 'DEPOSIT', null, wallet.id);
        db.saveTransaction(transaction);

        return wallet;
    }

    transfer(senderUserId, receiverUsername, amount) {
        if (amount <= 0) throw new Error('Amount must be positive');

        const senderWallet = db.findWalletByUserId(senderUserId);
        if (!senderWallet) throw new Error('Sender wallet not found');

        if (senderWallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        const receiverUser = db.findUserByUsername(receiverUsername);
        if (!receiverUser) throw new Error('Receiver not found');

        const receiverWallet = db.findWalletByUserId(receiverUser.id);
        if (!receiverWallet) throw new Error('Receiver wallet not found');
        
        if (senderWallet.id === receiverWallet.id) {
            throw new Error('Cannot transfer to self');
        }

        senderWallet.balance -= parseFloat(amount);
        receiverWallet.balance += parseFloat(amount);

        db.updateWallet(senderWallet);
        db.updateWallet(receiverWallet);

        const txId = 'TX_TRF_' + Date.now();
        const transaction = new Transaction(txId, amount, 'TRANSFER', senderWallet.id, receiverWallet.id);
        db.saveTransaction(transaction);

        return senderWallet;
    }

    getHistory(userId) {
        const wallet = db.findWalletByUserId(userId);
        if (!wallet) return [];
        return db.findTransactionsByWalletId(wallet.id);
    }
}

const authService = new AuthService();
const walletService = new WalletService();

class AuthController {
    static async register(req) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) throw new Error('Missing fields');
            
            const result = authService.register(username, email, password);
            return { status: 201, body: { message: 'User registered successfully', data: result } };
        } catch (error) {
            return { status: 400, body: { error: error.message } };
        }
    }

    static async login(req) {
        try {
            const { email, password } = req.body;
            if (!email || !password) throw new Error('Missing fields');

            const user = authService.login(email, password);
            return { status: 200, body: { message: 'Login successful', user: user } };
        } catch (error) {
            return { status: 401, body: { error: error.message } };
        }
    }
}

class WalletController {
    static async getWallet(req) {
        try {
            const userId = req.userId;
            const wallet = walletService.getWallet(userId);
            return { status: 200, body: wallet };
        } catch (error) {
            return { status: 400, body: { error: error.message } };
        }
    }

    static async deposit(req) {
        try {
            const userId = req.userId;
            const { amount } = req.body;
            const wallet = walletService.deposit(userId, amount);
            return { status: 200, body: { message: 'Deposit successful', wallet } };
        } catch (error) {
            return { status: 400, body: { error: error.message } };
        }
    }

    static async transfer(req) {
        try {
            const userId = req.userId;
            const { receiverUsername, amount } = req.body;
            const wallet = walletService.transfer(userId, receiverUsername, amount);
            return { status: 200, body: { message: 'Transfer successful', wallet } };
        } catch (error) {
            return { status: 400, body: { error: error.message } };
        }
    }

    static async getHistory(req) {
        try {
            const userId = req.userId;
            const history = walletService.getHistory(userId);
            return { status: 200, body: history };
        } catch (error) {
            return { status: 400, body: { error: error.message } };
        }
    }
}

class App {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.checkSession();
    }

    cacheDOM() {
        this.loginView = document.getElementById('login-view');
        this.registerView = document.getElementById('register-view');
        this.dashboardView = document.getElementById('dashboard-view');
        this.navMenu = document.getElementById('nav-menu');

        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.depositForm = document.getElementById('deposit-form');
        this.transferForm = document.getElementById('transfer-form');

        this.displayName = document.getElementById('user-display-name');
        this.balanceDisplay = document.getElementById('wallet-balance');
        this.txTableBody = document.getElementById('tx-history-body');

        this.linkRegister = document.getElementById('link-register');
        this.linkLogin = document.getElementById('link-login');
    }

    bindEvents() {
        this.linkRegister.addEventListener('click', (e) => { e.preventDefault(); this.switchView('register'); });
        this.linkLogin.addEventListener('click', (e) => { e.preventDefault(); this.switchView('login'); });

        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        this.depositForm.addEventListener('submit', (e) => this.handleDeposit(e));
        this.transferForm.addEventListener('submit', (e) => this.handleTransfer(e));
    }

    checkSession() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.showDashboard();
        } else {
            this.switchView('login');
        }
    }

    switchView(viewName) {
        this.loginForm.reset();
        this.registerForm.reset();
        this.depositForm.reset();
        this.transferForm.reset();
        
        document.getElementById('login-msg').textContent = '';
        document.getElementById('register-msg').textContent = '';
        document.getElementById('deposit-msg').textContent = '';
        document.getElementById('transfer-msg').textContent = '';

        this.loginView.classList.remove('active');
        this.registerView.classList.remove('active');
        this.dashboardView.classList.remove('active');

        if (viewName === 'login') this.loginView.classList.add('active');
        else if (viewName === 'register') this.registerView.classList.add('active');
        else if (viewName === 'dashboard') this.dashboardView.classList.add('active');
    }

    updateNav() {
        if (this.currentUser) {
            this.navMenu.innerHTML = `<a href="#" id="logout-btn">Logout</a>`;
            document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        } else {
            this.navMenu.innerHTML = ``;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateNav();
        this.switchView('login');
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const msg = document.getElementById('register-msg');

        const req = { body: { username, email, password } };
        const res = await AuthController.register(req);

        if (res.status === 201) {
            alert('Registration Successful! Please Login.');
            this.switchView('login');
            this.registerForm.reset();
            msg.textContent = '';
        } else {
            msg.textContent = res.body.error;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const msg = document.getElementById('login-msg');

        const req = { body: { email, password } };
        const res = await AuthController.login(req);

        if (res.status === 200) {
            this.currentUser = res.body.user;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.loginForm.reset();
            msg.textContent = '';
            this.showDashboard();
        } else {
            msg.textContent = res.body.error;
        }
    }

    async showDashboard() {
        this.updateNav();
        this.switchView('dashboard');
        this.displayName.textContent = this.currentUser.username;
        await this.refreshWalletData();
    }

    async refreshWalletData() {
        const req = { userId: this.currentUser.id, body: {} };

        const walletRes = await WalletController.getWallet(req);
        if (walletRes.status === 200) {
            const wallet = walletRes.body;
            this.balanceDisplay.textContent = wallet ? wallet.balance.toFixed(2) : 'Error';
        }

        const historyRes = await WalletController.getHistory(req);
        if (historyRes.status === 200) {
            this.renderHistory(historyRes.body);
        }
    }

    renderHistory(transactions) {
        this.txTableBody.innerHTML = '';
        transactions.forEach(tx => {
            const row = document.createElement('tr');
            
            const date = new Date(tx.timestamp).toLocaleString();
            
            let flowInfo = '';
            let amountClass = '';
            
            if (tx.type === 'DEPOSIT') {
                flowInfo = 'From External';
                amountClass = 'success-msg';
            } else if (tx.type === 'TRANSFER') {
                 flowInfo = tx.senderWalletId === tx.receiverWalletId ? 'Self' : 'Transfer';
            }

            row.innerHTML = `
                <td>${date}</td>
                <td>${tx.type}</td>
                <td class="${amountClass}">$${tx.amount}</td>
                <td>${flowInfo}</td>
            `;
            this.txTableBody.appendChild(row);
        });
    }

    async handleDeposit(e) {
        e.preventDefault();
        const amount = document.getElementById('deposit-amount').value;
        const msg = document.getElementById('deposit-msg');
        
        const req = { userId: this.currentUser.id, body: { amount } };
        const res = await WalletController.deposit(req);

        if (res.status === 200) {
            msg.textContent = 'Deposit Successful!';
            msg.className = 'success-msg';
            this.depositForm.reset();
            setTimeout(() => { msg.textContent = ''; }, 3000);
            this.refreshWalletData();
        } else {
            msg.textContent = res.body.error;
            msg.className = 'error-msg';
        }
    }

    async handleTransfer(e) {
        e.preventDefault();
        const receiverUsername = document.getElementById('transfer-receiver').value;
        const amount = document.getElementById('transfer-amount').value;
        const msg = document.getElementById('transfer-msg');

        const req = { userId: this.currentUser.id, body: { receiverUsername, amount } };
        const res = await WalletController.transfer(req);

        if (res.status === 200) {
            msg.textContent = 'Transfer Successful!';
            msg.className = 'success-msg';
            this.transferForm.reset();
            setTimeout(() => { msg.textContent = ''; }, 3000);
            this.refreshWalletData();
        } else {
            msg.textContent = res.body.error;
            msg.className = 'error-msg';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
