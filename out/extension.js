"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
function getWslHostIp() {
    try {
        // Detect if we're inside WSL
        const isWsl = process.platform === 'linux' && !!process.env.WSL_DISTRO_NAME;
        if (isWsl) {
            // Inside WSL: read /etc/resolv.conf for Windows host IP
            const resolvConf = fs.readFileSync('/etc/resolv.conf', 'utf8');
            const match = resolvConf.match(/^nameserver\s+([0-9.]+)/m);
            if (match) {
                return match[1]; // e.g. 172.17.144.1
            }
        }
        // Not WSL or no nameserver found → fallback
        return '127.0.0.1';
    }
    catch {
        return '127.0.0.1';
    }
}
function activate(context) {
    const disposable = vscode.commands.registerCommand('proxyToggle.chooseProxy', async () => {
        const wslHostIp = getWslHostIp();
        const choice = await vscode.window.showQuickPick([
            { label: 'Connect to http proxy through Nekoray in Windows (127.0.0.1:2080)', value: 'windows' },
            { label: `Connect to http proxy through Nekoray in WSL (${wslHostIp}:2080)`, value: 'wsl' },
            { label: 'Connect to http proxy directly to ADB-Connector port for Windows (127.0.0.1:63254)', value: 'direct' },
            { label: 'Disable Proxy', value: 'disable' },
        ], { placeHolder: 'Select proxy configuration' });
        if (choice) {
            const config = vscode.workspace.getConfiguration();
            if (choice.value === 'windows') {
                await config.update('http.proxy', 'http://127.0.0.1:2080', vscode.ConfigurationTarget.Global);
                await config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global);
                await config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global);
                await config.update('http.noProxy', ['localhost', '127.0.0.1'], vscode.ConfigurationTarget.Global);
            }
            if (choice.value === 'wsl') {
                await config.update('http.proxy', `http://${wslHostIp}:2080`, vscode.ConfigurationTarget.Global);
                await config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global);
                await config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global);
                await config.update('http.noProxy', ['localhost', '127.0.0.1', wslHostIp], vscode.ConfigurationTarget.Global);
            }
            if (choice.value === 'direct') {
                await config.update('http.proxy', 'http://127.0.0.1:63254', vscode.ConfigurationTarget.Global);
                await config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global);
                await config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global);
                await config.update('http.noProxy', ['localhost', '127.0.0.1'], vscode.ConfigurationTarget.Global);
            }
            if (choice.value === 'disable') {
                await config.update('http.proxy', '', vscode.ConfigurationTarget.Global);
                await config.update('http.proxyStrictSSL', undefined, vscode.ConfigurationTarget.Global);
                await config.update('http.proxySupport', undefined, vscode.ConfigurationTarget.Global);
                await config.update('http.noProxy', undefined, vscode.ConfigurationTarget.Global);
            }
            statusBar.text = `Proxy: ${choice.label}`;
            vscode.window.showInformationMessage(`Proxy set to: ${choice.label}`);
        }
    });
    context.subscriptions.push(disposable);
    // Status bar button
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = "Proxy: Toggle";
    statusBar.command = "proxyToggle.chooseProxy";
    statusBar.show();
    context.subscriptions.push(statusBar);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map