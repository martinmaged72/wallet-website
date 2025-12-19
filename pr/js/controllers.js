/**
 * Controller Layer
 * Simulates REST API Endpoints.
 * Takes "Requests" (objects) and returns "Responses" (Promises resolving to objects).
 */
// Dependencies: services.js

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
            // Simulate 'Token' - for now just returning user details
            return { status: 200, body: { message: 'Login successful', user: user } }; // In real app, return JWT
        } catch (error) {
            return { status: 401, body: { error: error.message } };
        }
    }
}

class WalletController {
    static async getWallet(req) {
        try {
            const userId = req.userId; // Extracted from "Session"
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
