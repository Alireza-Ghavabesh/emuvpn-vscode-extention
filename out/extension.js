"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const fs = require("fs");
function getWslHostIp() {
    try {
        // Check if VS Code is connected to a WSL remote
        const isVsCodeInWsl = vscode.env.remoteName === 'wsl';
        if (isVsCodeInWsl) {
            const resolvConf = fs.readFileSync('/etc/resolv.conf', 'utf8');
            const match = resolvConf.match(/^nameserver\s+([0-9.:]+)/m);
            if (match)
                return match[1];
        }
        return '127.0.0.1';
    }
    catch {
        return '127.0.0.1';
    }
}
let statusBar;
function activate(context) {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = "Proxy: Toggle";
    statusBar.command = "proxyToggle.chooseProxy";
    statusBar.show();
    context.subscriptions.push(statusBar);
    const disposable = vscode.commands.registerCommand('proxyToggle.chooseProxy', async () => {
        const wslHostIp = getWslHostIp();
        const choice = await vscode.window.showQuickPick([
            { label: 'Connect to http proxy through Nekoray in Windows (127.0.0.1:2080)', value: 'windows' },
            { label: `Connect to http proxy through Nekoray in WSL (${wslHostIp}:2080)`, value: 'wsl' },
            { label: 'Connect to http proxy directly to emuVPN port for Windows (127.0.0.1:63254)', value: 'emuvpn' },
            { label: 'Disable Proxy', value: 'disable' },
        ], { placeHolder: 'Select proxy configuration' });
        if (!choice)
            return;
        const config = vscode.workspace.getConfiguration();
        switch (choice.value) {
            case 'windows':
                await Promise.all([
                    config.update('http.proxy', 'http://127.0.0.1:2080', vscode.ConfigurationTarget.Global),
                    config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global),
                    config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global),
                    config.update('http.noProxy', ['localhost', '127.0.0.1'], vscode.ConfigurationTarget.Global),
                ]);
                break;
            case 'wsl':
                await Promise.all([
                    config.update('http.proxy', `http://${wslHostIp}:2080`, vscode.ConfigurationTarget.Global),
                    config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global),
                    config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global),
                    config.update('http.noProxy', ['localhost', '127.0.0.1', wslHostIp], vscode.ConfigurationTarget.Global),
                ]);
                break;
            case 'emuvpn':
                await Promise.all([
                    config.update('http.proxy', 'http://127.0.0.1:63254', vscode.ConfigurationTarget.Global),
                    config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global),
                    config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global),
                    config.update('http.noProxy', ['localhost', '127.0.0.1'], vscode.ConfigurationTarget.Global),
                ]);
                break;
            case 'disable':
                await Promise.all([
                    config.update('http.proxy', '', vscode.ConfigurationTarget.Global),
                    config.update('http.proxyStrictSSL', undefined, vscode.ConfigurationTarget.Global),
                    config.update('http.proxySupport', undefined, vscode.ConfigurationTarget.Global),
                    config.update('http.noProxy', undefined, vscode.ConfigurationTarget.Global),
                ]);
                break;
        }
        statusBar.text = `Proxy: ${choice.label}`;
        statusBar.tooltip = `Current proxy: ${choice.label}`;
        vscode.window.showInformationMessage(`Proxy set to: ${choice.label}`);
    });
    context.subscriptions.push(disposable);
}
function deactivate() {
    statusBar.dispose();
}
//# sourceMappingURL=extension.js.map