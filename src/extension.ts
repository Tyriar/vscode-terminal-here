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

        let terminal = vscode.window.createTerminal({
            cwd: path.dirname(uri.fsPath)
        });
        terminal.show(false);
    });

    context.subscriptions.push(disposable);
    
    const items: string[] = [ 'More info' ];
    vscode.window.showInformationMessage('The Terminal Here extension has been deprecated, you can now do this using a VS Code setting', ...items).then(value => {
        if (!value) {
            return;
        }
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/Tyriar/vscode-terminal-here/issues/20'));
    });
}

export function deactivate() {
}
