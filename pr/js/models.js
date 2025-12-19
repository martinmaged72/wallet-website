/**
 * Models for the Wallet Application
 * Represents the entities in the system.
 */

class User {
    constructor(id, username, email, password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password; // In a real app, this would be hashed.
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
        this.type = type; // 'DEPOSIT', 'TRANSFER'
        this.senderWalletId = senderWalletId;
        this.receiverWalletId = receiverWalletId;
        this.timestamp = new Date().toISOString();
    }
}
