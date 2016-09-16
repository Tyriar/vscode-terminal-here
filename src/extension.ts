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
        let terminal = vscode.window.createTerminal();
        terminal.show(false);
        terminal.sendText(`cd "${dir}"`);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}