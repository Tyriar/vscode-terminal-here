'use strict';

import * as vscode from 'vscode';
import path = require('path');

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('terminalHere.create', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let document = editor.document;
        if (!document) {
            return;
        }

        let uri = document.uri;
        if (!uri) {
            return;
        }

        let dir = path.dirname(uri.fsPath);

        if(isWslBash(vscode.workspace.getConfiguration('terminal'))) {
            // c:\workspace\foo to /mnt/c/workspace/foo
            dir = dir.replace(/(\w):/, '/mnt/$1').replace(/\\/g, '/')
        }

        let terminal = vscode.window.createTerminal();
        terminal.show(false);
        terminal.sendText(`cd "${dir}"`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function isWslBash(terminalSettings) {
    const windowsShellPath = terminalSettings.integrated.shell.windows;

    if(!windowsShellPath) {
        return false;
    }

    // Detect WSL bash according to the implementation of VS Code terminal.
    // For more details, refer to https://goo.gl/AuwULb
    const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
    const system32 = is32ProcessOn64Windows ? 'Sysnative' : 'System32';
    const expectedWslBashPath = path.join(process.env.windir, system32, 'bash.exe');

    // %windir% can give WINDOWS instead of Windows
    return windowsShellPath.toLowerCase() === expectedWslBashPath.toLowerCase();
}