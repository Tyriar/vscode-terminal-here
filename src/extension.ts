'use strict';

import * as vscode from 'vscode';
import * as os from 'os';
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

        let dir = path.dirname(uri.fsPath),
            args = '',
            opts: vscode.TerminalOptions = {},
            clsCommand = '';
        
        if (os.platform() === 'win32') {
            let kind = kindOfShell(vscode.workspace.getConfiguration('terminal'));
            
            switch(kind) {
                case "wslbash":
                    // c:\workspace\foo to /mnt/c/workspace/foo
                    dir = dir.replace(/^(\w):/, '/mnt/$1').replace(/\\/g, '/');
                    clsCommand = 'clear'
                    break;
                case "cygwin":
                case "gitbash":
                    // cygwin and mingw can handle win32 paths just fine
                    dir = dir.replace(/\\/g, '/');
                    clsCommand = 'clear'
                    break;
                case "powershell":
                case "cmd":
                    dir = dir.replace(/^(\w):/, (s) => s.toUpperCase());
                    opts.cwd = dir;
                    args += ' /d' // using the `/d` switch so that drive letter is updated
                    clsCommand = 'cls'
                    break;
                default:
                    //vscode.window.showMessage(`The terminal type ${kind} is not recognised`)
                    console.log(`%cThe terminal type ${kind} is not recognised`, 'font-weight:bold')
            }
            
        }
        
        let terminal = vscode.window.createTerminal(opts);
        terminal.show(false);

        // Send the cd command only if `cwd` is not set
        if ( !opts.cwd ) {
            terminal.sendText(`cd${args} "${dir}"`);
            
            if (clsCommand)
                terminal.sendText(clsCommand);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function kindOfShell(terminalSettings) {
    const windowsShellPath = terminalSettings.integrated.shell.windows;

    if (!windowsShellPath) {
        // if the integrated shell is not defined, default to `cmd`
        return 'cmd';
    }

    // Detect WSL bash according to the implementation of VS Code terminal.
    // For more details, refer to https://goo.gl/AuwULb
    const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
    const system32Path = path.join(process.env.windir, is32ProcessOn64Windows ? 'Sysnative' : 'System32');
    
    let execName = path.basename(windowsShellPath, path.extname(windowsShellPath)),
        execDir = path.dirname(windowsShellPath);
    
    // Detect kind of shell based on the executable name and path
    switch(execName.toLowerCase()) {
        case 'wsl':
        case 'ubuntu':
            return 'wslbash';
        case 'bash':
            if (compareDir(execDir, system32Path) || execDir === '.')
                return 'wslbash';
            if (matchPath(execDir, `\\Git\\bin`) || matchPath(execDir, `\\Git\\user\\bin`))
                return 'gitbash';
            if (matchPath(execDir, `\\cygwin\\`))
                return 'cygwin';
        case 'powershell':
            if (compareDir(execDir, `${system32Path}\\WindowsPowerShell\\v1.0`) || execDir === '.')
                return 'powershell';
        case 'cmd':
            if (compareDir(execDir, system32Path) || execDir === '.')
                return 'cmd';
    }

    // In case none of the expected shell paths were recognised
    return windowsShellPath
}

function compareDir(dir1, dir2) {
    return dir1.replace(/[\\\/]+/g, '/').replace(/\/+$/, '').toLowerCase()
        === dir2.replace(/[\\\/]+/g, '/').replace(/\/+$/, '').toLowerCase()
}

function matchPath(haystack, needle) {
    return ('/' + haystack.replace(/[\\\/]+/g, '/').replace(/\/+$/, '').toLowerCase() + '/')
        .indexOf('/' + needle.replace(/[\\\/]+/g, '/').replace(/(^\/+|\/+$)/g, '').toLowerCase() + '/') > -1
}
