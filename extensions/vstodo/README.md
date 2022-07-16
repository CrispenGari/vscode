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

```

```

```

```

```

```

```

```

### Refs

1. [code.visualstudio.com](https://code.visualstudio.com/api/get-started/your-first-extension)
2. [https://github.com/microsoft](https://github.com/microsoft/vscode-extension-samples/tree/main/webview-sample)
3. [https://github.com/benawad](https://github.com/benawad/vstodo/blob/master/extension/rollup.config.js)
