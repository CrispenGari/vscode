### VS Code Extensions

In this repository we are going to learn how to create vs-code extensions with:

```shell
- javascript
- typescript
```

And publish them to the market place.

### Getting started

With `vs-code` and `nodejs` installed on your computer you can create your extensions and publish them to the market place. Run the following command:

```shell
npm install -g yo generator-code vsce
```

The first extension that we are going to create is called `vstodo` navigate to the `vstodo` folder and run the following command:

```shell
yo code
```

You will need to answer some questions and then a boiler plate code for your extension will be generated. After that we can compile our "hello world" extension and test it. Run

```shell
cd vstodo
#  then run
yarn watch
```

One thing i will do is to open the `.vscode/task.json` and remove all the `tasks` and it will look as follows:

```json
{
  "version": "2.0.0",
  "tasks": []
}
```

After that press **`F5`** to run the extension on a new vscode window. Make sure that your `vstodo` folder is the one that is in the workspace of vscode. When a new `Extension Development Host` has been opened in another window, press **`Ctrl + P`** and type `> Hello Word` in the command pallet. Then select `Hello World` and then you will see a `"Hello World from vstodo!"` from the dialog.

### extension.ts

This is the file that contains all the code for our `extension`. By default the file will look as follows:

```ts
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "vstodo" is now active!');
  let disposable = vscode.commands.registerCommand("vstodo.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from vstodo!");
  });

  context.subscriptions.push(disposable);
}
export function deactivate() {}
```

So we have a function called `activate` which is the function that we will be working with throughout. This function takes in a object called `context` which contains a lot of things in it. So we are registering a command called `helloWorld`. Note that this command is always prefixed by our `extension` and a `.`. So what we are basically doing her is that when this command is ran, we will display a message. Every time when we register a command we need to push it in the `subscriptions` array and then in the `package.json` we will have two important sections which are:

```json
{
  ...
  "activationEvents": ["onCommand:vstodo.helloWorld"],
  "contributes": {
    "commands": [
      {
        "command": "vstodo.helloWorld",
        "title": "Hello World"
      }
    ]
  }
}
```

Every time when we register a command we need to pass the `command` that will be executed prefixed by `onCommand:` in the `activationEvents`. Also we will need to add a command in a commands array as an `object` with different properties.
You maybe asking yourself where is the following message displayed in from the `activate` function:

```ts
console.log('Congratulations, your extension "vstodo" is now active!');
```

This message will be in your editor, just press **`Ctrl + J`** to toggle the terminal and select on the **`DEBUG CONSOLE`** tab, you will see the message.

### Creating our First Command

We want to create a similar command that from the hello world one that ask the developer "how was his/her day". We are going to call this command `vstodo.askMessage` as follows

```ts
export function activate(context: vscode.ExtensionContext) {
  let disposables: Array<vscode.Disposable> = [];

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
```

Now that we have created a command, now we need to go to our `package.json` file and edit it to look as follows:

```json
{
  "activationEvents": [
    "onCommand:vstodo.helloWorld",
    "onCommand:vstodo.askMessage"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "vstodo.helloWorld",
        "title": "Hello World"
      },
      {
        "command": "vstodo.askMessage",
        "title": "Day check",
        "category": "Developer"
      }
    ]
  }
}
```

> Note that every time you make changes to the extension you need to reload the `Extension Development Host` by running **`Ctrl + R`** before testing it. We will later on configure how to customize commands that helps us with god developer experience when debugging extension.

### Webview API

Next we are going to have a look on how we can add a `webview` in vscode extension. First we need to create a file called `HelloWorld.ts` the code in this file was taken and modified from [this](https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/) repository about webviews.

After creating a webview we will need to show or it in the activate function when the `vstodo.openHelloWorldPanel` is called.

```ts
context.subscriptions.push(
  vscode.commands.registerCommand("vstodo.openHelloWorldPanel", () => {
    HelloWorldPanel.createOrShow(context.extensionUri);
  })
);
```

We need to change the package.json file as we are registering a new command `vstodo.openHelloWorldPanel`

### Opening Web View Developer Tools in an `Extension Development Host`

You first click **`Ctrl + P`** and then type `>Developer:Open Webview Developer Tools` then you will see the developer web tools.

> _Note that we can continue to write our extension with vanilla javascript, but to me it sound complicated. We are going to make use of a web framework called `svelte`._

### Creating webviews using Svelte

First we need to install the package that `svelte` depends on by running the following command:

```shell
yarn add -D rollup-plugin-svelte svelte @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-terser svelte-preprocess @rollup/plugin-typescript rollup concurrently @tsconfig/svelte
```

First we will need to create a file called `rollup.config.js` and add the following code in it.

```ts
// this code was taken from https://github.com/benawad/vstodo/blob/master/extension/rollup.config.js
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import fs from "fs";

const production = !process.env.ROLLUP_WATCH;

export default fs
  .readdirSync(path.join(__dirname, "webviews", "pages"))
  .map((input) => {
    const name = input.split(".")[0];
    return {
      input: "webviews/pages/" + input,
      output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "out/compiled/" + name + ".js",
      },
      plugins: [
        svelte({
          // enable run-time checks when not in production
          dev: !production,
          // we'll extract any component CSS out into
          // a separate file - better for performance
          css: (css) => {
            css.write(name + ".css");
          },
          preprocess: sveltePreprocess(),
        }),

        // If you have external dependencies installed from
        // npm, you'll most likely need these plugins. In
        // some cases you'll need additional configuration -
        // consult the documentation for details:
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        resolve({
          browser: true,
          dedupe: ["svelte"],
        }),
        commonjs(),
        typescript({
          tsconfig: "webviews/tsconfig.json",
          sourceMap: !production,
          inlineSources: !production,
        }),

        // In dev mode, call `npm run start` once
        // the bundle has been generated
        // !production && serve(),

        // Watch the `public` directory and refresh the
        // browser on changes when not in production
        // !production && livereload("public"),

        // If we're building for production (npm run build
        // instead of npm run dev), minify
        production && terser(),
      ],
      watch: {
        clearScreen: false,
      },
    };
  });
```

Then we are going to create a folder called `webviews/pages`. In the `webviews` folder we are going to have a `tsconfig.json` file that looks as follows:

```json
{
  "extends": "@tsconfig/svelte/tsconfig.json",
  "include": ["./**/*"],
  "exclude": ["../node_modules/*"],
  "compilerOptions": { "strict": true }
}
```

Now that we have `2` `tsconfig.json` files for our project the one for `svelte` and the other one for our extension we are going to open the one for our extension and tell it to ignore the `webviews` folder as follows:

```json
{
    ...
    "exclude": ["webviews/"]
}
```

In the `webviews/pages` folder we are going to create a file called `HelloWorld.ts`

```ts
import App from "../components/HelloWorld.svelte";

const app = new App({
  target: document.body,
});

export default app;
```

We will need to create a `components` file in the `webviews`. This is where i will write `svelte` components. In that folder we are going to create a file called `HelloWorld.svelte` and add the following code in it:

```svelte
<div class="app">
    <h1> Hello world</h1>
</div>
```

In the `package.json` we are going to go to our `scripts` and change the `watch` script so that it will run `2` commands at the same time, that's the reason why we installed the package called `concurrently`.

```json
{
    ...
"scripts": {
   ...
    "watch": "concurrently \"rollup -c -w\" \"tsc -watch -p ./\"",
    ..
  },
}
```

Now in the file called `/src/HelloWorld.ts` we are going to change the `scriptUri` to:

```ts
const scriptUri = webview.asWebviewUri(
  vscode.Uri.joinPath(this._extensionUri, "out/compiled", "HelloWorld.js")
);
```

Now with only that we will ba able to render a svelte component as a webview in `vscode`.

### Creating a custom command

We want to create a command called `vstodo.refreshWebView` that does the following:

1. refresh the webview
2. open developer tools

We are going to open a package.json file and create a new command called `vstodo.refreshWebView`

> In our `extension.ts` file we are going to add the following disposable:

```ts
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
```

Note that we are are killing the `panel` and open it again, then we will open the developer tools for webviews by executing the command `"workbench.action.webview.openDeveloperTools"`.

> _Note that the command `workbench.action.webview.openDeveloperTools` was found by clicking on the setting icon in the developer window of the command `"Developer: Open Webview Developer Tools"` and then when it open you right click it and click `Copy Command ID`._

We can make a step further by making key-binding shortcut so that instead of pressing `Ctrl + P` and type stuff we can just use a `keyboard` shortcut.

> _To do that click on the setting icon in the developer window of the command `"Developer: Refreshing Webview"` and then when it open under `Key Binding` click and add your custom key-binding, in my case i'm going to use **`Alt + R`**._

> _**Now you can just `Alt + R` when you make changes to your webview**_

### Working on the `Sidebar`

Our todo's will be added and managed on the side bar. We are going to make use of the `vscode` api to use the Sidebar and create a `webview` for our sidebar. So first of all we are going to go to the `package.json` file and add an activationEvent called `onView:vstodo-sidebar`. After that we are going to add `viewContainers` and `views` as follows:

```json
{
  "activationEvents": [
    "onCommand:vstodo.helloWorld",
    "onCommand:vstodo.askMessage",
    "onCommand:vstodo.openHelloWorldPanel",
    "onCommand:vstodo.refreshWebView",
    "onView:vstodo-sidebar"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        {
          "id": "vstodo-sidebar-view",
          "icon": "media/ico.svg",
          "title": "VSTodo"
        }
      ]
    },
    "views": {
      "vstodo-sidebar-view": [
        {
          "type": "webview",
          "id": "vstodo-sidebar",
          "name": "VSTodo",
          "icon": "media/ico.svg",
          "contextualTitle": "My Vs Todo",
          "visibility": "visible"
        }
      ]
    },
    "commands": [
      {
        "command": "vstodo.helloWorld",
        "title": "Hello World"
      },
      {
        "command": "vstodo.askMessage",
        "title": "Day check",
        "category": "Developer"
      },
      {
        "command": "vstodo.openHelloWorldPanel",
        "title": "Hello World Web View",
        "category": "Developer"
      },
      {
        "command": "vstodo.refreshWebView",
        "title": "Refreshing Web View",
        "category": "Developer"
      }
    ]
  }
}
```

For the `icon` we need to get the icon that we want at [vscode-codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html) then after that we will search for that icon on [github](https://github.com/microsoft/vscode-codicons/tree/main/src/icons) and save it as an svg icon.

Next we are going to create a `SidebarProvider.ts` file in the `src` folder of our extension and then we will add the following code in it. The code that we are adding will be a modified version of [this](https://github.com/benawad/vstodo/blob/master/extension/src/SidebarProvider.ts) file.

```ts
import * as vscode from "vscode";
import { getNonce } from "./getNonce";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Sidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Sidebar.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
          const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
```

Now in the `extension.ts` file and add the following lined of code in the `activate` function.

```ts
const sidebarProvider = new SidebarProvider(context.extensionUri);
disposables.push(
  vscode.window.registerWebviewViewProvider("vstodo-sidebar", sidebarProvider)
);
```

Now if we debug our extension we will be able to see the icon that we used appearing on the `Sidebar`. If we click it we will see nothing in the webviewView because we haven't added some `svelte` stuff. We will open the webviews/pages folder and create a file called `Sidebar.ts` as we did in the HelloWorld example and add the following code to it:

```ts
import App from "../components/Sidebar.svelte";

const app = new App({
  target: document.body,
});

export default app;
```

Then in the components we are going to create a file called `Sidebar.svelte` and add the following code in it to test if we can see content on the screen.

### Sending messages from the extension to the webview

We are going to explain how messages are sent and received from the webview to the extension. We are going to use our sidebar webview to do that. VSCode expose to us with a method called `acquireVsCodeApi()` which we can stick in the `script` tag of our `SidebarProvider.ts` file as follows:

```html
<script nonce="${nonce}">
  const tsvscode = acquireVsCodeApi();
</script>
```

Now we have a global variable called `tsvscode` which we can access in our `webviews`. But first we need to create a file called `globals.d.ts` which is a declarative file which we will tell typescript that `tsvscode` is a global variable, and with that we will be able to get auto completion when we access our `tsvscode` object in the `webviews`. The `webviews/global.d.ts` file will look as follows:

```ts
import * as _vscode from "vscode";

declare global {
  const tsvscode: {
    postMessage: ({ type: string, value: any }) => void;
  };
}
```

Now we can be able to send the messages from the `webview` to the `extension`. We are going to create 2 buttons the one that is called error and the other one that is called message. And we will use the `postMessage` to display an error or message in the extension. So in our `Sidebar.svelte` we are going to have the following code:

```svelte
<div class="app">
  <button
    on:click={() => {
      tsvscode.postMessage({
        type: "onError",
        value: "Error message from the Sidebar.svelte",
      });
    }}>Error</button
  >
  <button
    on:click={() => {
      tsvscode.postMessage({
        type: "onInfo",
        value: "Info message from the Sidebar.svelte",
      });
    }}>Message</button
  >
</div>
```

Now we can be able to listen to these messages in the `SidebarProvider.ts` in the `webviewView.webview.onDidReceiveMessage` function as follows:

```ts
webviewView.webview.onDidReceiveMessage(async (data) => {
  switch (data.type) {
    case "onInfo": {
      if (!data.value) {
        return;
      }
      vscode.window.showInformationMessage(data.value);
      break;
    }
    case "onError": {
      if (!data.value) {
        return;
      }
      vscode.window.showErrorMessage(data.value);
      break;
    }
  }
});
```

Now if we reload the extension and click the buttons we will be able to get the messages according to the button clicked.

### Sending messages from the webview to the extension

We may also want to send messages from the `extension` to the webview. In this example we are going to allow the user to select the text in a file that is opened in `vscode` and then based on the `userselection` we want to click a `status-bar-item` we get the value and display it in the `webview`

In our `package.json` file under the commands section we are going to create a new command called `vstodo.addTodo` and also add it in the `activationEvents` as follows:

```json
{
  "activationEvents": [
     ....
    "onCommand:vstodo.addTodo"
  ],
  "commands": [
    {
      "command": "vstodo.addTodo",
      "title": "Adding Todo From Selection",
      "category": "Developer"
    }
    ....
  ]
}
```

So in the `extension.ts` we are going to add the following piece of code in the `activate` function:

```ts
const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
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

    const text = activeTextEditor.document.getText(activeTextEditor.selection);

    sidebarProvider._view?.webview.postMessage({
      type: "new-todo",
      value: text,
    });
  })
);
```

> Note that we are creating a `StatusBarItem` and add a `text` of "Add Todo" with a variable "beaker" which is the name of the icon that we need to appear together with the text. Note that the icon code was found on [vscode-codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html).

Now in our `Sidebar.svelte` we will receive a message and display it in the `webview`

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  let data: any = {};
  onMount(async () => {
    window.addEventListener("message", async (event) => {
      const message = event.data;
      switch (message.type) {
        case "new-todo":
          data = message;
          break;
      }
    });
  });
</script>

<div class="app">
  <pre>
     {JSON.stringify({ data }, null, 2)}
  </pre>
</div>
```

Now if we reload the extension and select text from a file and click on the `Add Todo` StatusBarItem at the bottom we will be able to see something like:

```json
{
  "data": {
    "type": "new-todo",
    "value": "working"
  }
}
```

Now that we have our sidebar active we are going to create an `API` so that we can authenticate with `GitHub` in `vscode`. So the code for the `API` will be found in the `api` folder. Our api will have the following baseUrl: `http://localhost:3001`

### Polka.js

We are going to setup the [`polka`](https://github.com/lukeed/polka) server to listen on port `54321` which is the port where we are redirected after being authenticated. This logic is happening in the `src/authenticate.ts` file

```shell

yarn add polka
# then
yarn add -D @types/polka

```

Our `authenticate` function looks as follows:

```ts
import * as vscode from "vscode";
import { apiBaseUrl } from "./constants";
import * as polka from "polka";
import { TokenManager } from "./TokenManager";

export const authenticate = (fn: () => void) => {
  const app = polka();
  app.get(`/auth/:token`, async (req, res) => {
    const { token } = req.params;
    if (!token) {
      res.end(`<h1>something went wrong</h1>`);
      return;
    }
    await TokenManager.setToken(token);
    fn();
    res.end(`<h1>auth was successful, you can close this now</h1>`);
    (app as any).server.close();
  });
  app.listen(54321, (err: Error) => {
    if (err) {
      vscode.window.showErrorMessage(err.message);
    } else {
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(`${apiBaseUrl}/auth/github`)
      );
    }
  });
};
```

We are getting a token from the redirected url after opening a `/auth/github` path using the `vscode` command called `open`. After that we are going to store the token in the state by use of the `TokenManager` class which looks as follows:

```ts
import * as vscode from "vscode";

const KEY = "vstodotoken";

export class TokenManager {
  static globalState: vscode.Memento;

  static setToken(token: string) {
    return this.globalState.update(KEY, token);
  }

  static getToken(): string | undefined {
    return this.globalState.get(KEY);
  }
}
```

Note that in the activate function of the `extension.ts` we need to set the `globalState` of the token manager from the `content` as follows

```ts

export function activate(context: vscode.ExtensionContext) {
  TokenManager.globalState = context.globalState;
  ....
}
```

In the `onDidReceiveMessage` in the SidebarProvider.ts file we are going to listen on the `authenticate` message and authenticate the user.

```ts
webviewView.webview.onDidReceiveMessage(async (data) => {
  switch (data.type) {
    case "authenticate": {
      authenticate(() => {
        webviewView.webview.postMessage({
          type: "token",
          value: TokenManager.getToken(),
        });
      });
      break;
    }
  }
});
```

### Checking if the user is Authenticated

In the Sidebar.svelte we are going to check if the user is authenticated or not in the `onMount` function as follows:

```ts
onMount(async () => {
  window.addEventListener("message", async (event) => {
    const message = event.data;
    console.log("Message", message);
    switch (message.type) {
      case "token":
        accessToken = message.value;
        const response = await fetch(`${apiBaseUrl}/user`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        user = data.user;
        loading = false;
    }
  });
  tsvscode.postMessage({ type: "get-token", value: undefined });
});
```

If we get the token, then the user is authenticated.

### Logout the user.

To logout the user we are going to clear the token that we have stored using the `TokenManager`. So we will send the `logout` message to the `extension` then the extension will log us out using the following logic.

```ts
webviewView.webview.onDidReceiveMessage(async (data) => {
  switch (data.type) {
    case "logout": {
      TokenManager.setToken("");
      break;
    }
  }
});
```

### Logic of adding, updating and getting todos.

> The code for the logic on the `CRUD` operations on todos is simple and will be found in the files.

### Refs

1. [code.visualstudio.com](https://code.visualstudio.com/api/get-started/your-first-extension)
2. [https://github.com/microsoft](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-sample)
3. [https://github.com/benawad](https://github.com/benawad/vstodo/blob/master/extension/rollup.config.js)
4. [polka](https://github.com/lukeed/polka)
