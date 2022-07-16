import * as vscode from "vscode";
import { HelloWorldPanel } from "./HelloWorld";

export function activate(context: vscode.ExtensionContext) {
  let disposables: Array<vscode.Disposable> = [];

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
