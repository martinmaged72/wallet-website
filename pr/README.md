# How to Run MyWallet App

Because this project uses **ES Modules** (imported via `type="module"` in `index.html`), modern browsers require it to be served via a **local web server** rather than opening the file directly (which causes CORS errors).

## Option 1: VS Code Live Server (Recommended)
If you are using Visual Studio Code:
1. Open the Extensions view (`Ctrl+Shift+X`).
2. Search for **Live Server** (by Ritwick Dey) and install it.
3. Open `index.html`.
4. Right-click anywhere in the editor and select **"Open with Live Server"**.
5. The browser will open automatically (usually at `http://127.0.0.1:5500`).

## Option 2: Python Simple Server
If you have Python installed:
1. Open a terminal in this directory.
2. Run:
   ```bash
   python -m http.server
   ```
3. Open your browser to `http://localhost:8000`.

## Option 3: Node.js http-server
If you have Node.js installed:
1. Open a terminal in this directory.
2. Run:
   ```bash
   npx http-server
   ```
3. Open the link shown in the terminal.
