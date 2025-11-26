import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('proxyToggle.chooseProxy', async () => {
    const choice = await vscode.window.showQuickPick(
      [
        { label: 'Connect to http proxy through Nekoray in windows (127.0.0.1:2080)', value: 'windows' },
        { label: 'Connect to http proxy through Nekoray in WSL (172.17.144.1:2080)', value: 'wsl' },
        { label: 'Connect to http proxy directly to ADB-Connector port for Windows (127.0.0.1:63254)', value: 'direct' },
        { label: 'Disable Proxy', value: 'disable' },
      ],
      { placeHolder: 'Select proxy configuration' }
    );

    if (choice) {
      const config = vscode.workspace.getConfiguration();

      if (choice.value === 'windows') {
        await config.update('http.proxy', 'http://127.0.0.1:2080', vscode.ConfigurationTarget.Global);
        await config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global);
        await config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global);
        await config.update('http.noProxy', ['localhost','127.0.0.1','172.17.144.1'], vscode.ConfigurationTarget.Global);
      }

      if (choice.value === 'wsl') {
        await config.update('http.proxy', 'http://172.17.144.1:2080', vscode.ConfigurationTarget.Global);
        await config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global);
        await config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global);
        await config.update('http.noProxy', ['localhost','127.0.0.1','172.17.144.1'], vscode.ConfigurationTarget.Global);
      }

      if (choice.value === 'direct') {
        await config.update('http.proxy', 'http://127.0.0.1:63254', vscode.ConfigurationTarget.Global);
        await config.update('http.proxyStrictSSL', false, vscode.ConfigurationTarget.Global);
        await config.update('http.proxySupport', 'override', vscode.ConfigurationTarget.Global);
        await config.update('http.noProxy', ['localhost','127.0.0.1','172.17.144.1'], vscode.ConfigurationTarget.Global);
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

export function deactivate() {}
