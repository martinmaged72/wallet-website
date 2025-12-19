/**
 * Service Layer
 * Contains business logic and orchestrates data operations.
 */
// Dependencies: database.js, models.js

class AuthService {
    register(username, email, password) {
        if (db.findUserByEmail(email)) {
            throw new Error('Email already registered');
        }
        if (db.findUserByUsername(username)) {
            throw new Error('Username already taken');
        }

        const id = 'USER_' + Date.now();
        // MOCK HASH
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
        
        // Check password
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

        // Validate sufficient balance
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

        // Perform atomic transfer (simulation)
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
