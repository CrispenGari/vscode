import * as vscode from "vscode";
import { HelloWorldPanel } from "./HelloWorld";
import { SidebarProvider } from "./SidebarProvider";
import { TokenManager } from "./TokenManager";

export function activate(context: vscode.ExtensionContext) {
  TokenManager.globalState = context.globalState;
  let disposables: Array<vscode.Disposable> = [];

  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  item.text = "$(beaker) Add Todo";
  item.command = "vstodo.addTodo";
  item.show();

  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.addTodo", () => {
      const { activeTextEditor } = vscode.window;

      if (!activeTextEditor) {
        vscode.window.showInformationMessage("No active text editor");
        return;
      }

      const text = activeTextEditor.document.getText(
        activeTextEditor.selection
      );

      sidebarProvider._view?.webview.postMessage({
        type: "new-todo",
        value: text,
      });
    })
  );

  const sidebarProvider = new SidebarProvider(context.extensionUri);
  disposables.push(
    vscode.window.registerWebviewViewProvider("vstodo-sidebar", sidebarProvider)
  );

  disposables.push(
    vscode.commands.registerCommand("vstodo.openHelloWorldPanel", () => {
      HelloWorldPanel.createOrShow(context.extensionUri);
    })
  );
  disposables.push(
    vscode.commands.registerCommand("vstodo.refreshWebView", () => {
      HelloWorldPanel.kill();
      HelloWorldPanel.createOrShow(context.extensionUri);
      setTimeout(
        () => () => {
          vscode.commands.executeCommand(
            "workbench.action.webview.openDeveloperTools"
          );
        },
        1000
      );
    })
  );

  disposables.push(
    vscode.commands.registerCommand("vstodo.helloWorld", () => {
      vscode.window.showInformationMessage("Hello World from vstodo!");
    })
  );
  disposables.push(
    vscode.commands.registerCommand("vstodo.askMessage", async () => {
      const res = await vscode.window.showInformationMessage(
        "How was your day",
        "bad",
        "good"
      );
      if (res === "bad") {
        vscode.window.showWarningMessage("Don't stress you will die.");
      } else {
        vscode.window.showInformationMessage("Good enjoy your day");
      }
    })
  );
  context.subscriptions.push(...disposables);
}
export function deactivate() {}
