### User Code Snippets

In this readme we are going to go through the `vscode` documentation and learn how to create our custom code snippets. By the end of this readme we will be able to have our code snippets working.

### Why code snippets?

Code snippets are templates that allows us to speed up our development process.

### Creating our custom snippets.

To create our custom snippets click on **`File`** > **`Preferences`**> **`Configure User Snippets`** and select a language that you want this snippet to work, or you can just select **`New Global Snippet File`** if you want them to appear for all languages. We are going to create snippets for:

1. typescript react

> Snippet are written in `JSON` format we are going to have a look at them in a second.

> Multi-language and global user-defined snippets are all defined in "global" snippet files (JSON with the file suffix `.code-snippets`), which is also accessible through `Preferences`: `Configure User Snippets`. In a global snippets file, a snippet definition may have an additional `scope` property that takes one or more language identifiers, which makes the snippet available only for those specified languages. If no `scope` property is given, then the global snippet is available in all languages.

I want to create a snippets that generates the following code in the `User.tsx` file when the user types the following in a react typescript file `.tsx`:

1. `cbc`

```tsx
import React from "react";

interface PropsType {}
interface StateType {}

export class User extends React.Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.state = {};
  }
  render() {
    const {} = this;
    return (
      <div className="user">
        <h1>User</h1>
      </div>
    );
  }
}
```

2. `fbc`

```tsx
import React from "react";

interface Props {}
const User: React.FC<Props> = ({}) => {
  return () => {
    <div className=" User.tsx">
      <h1>Hello from User</h1>
    </div>;
  };
};

export default User;
```

3. `cbce`

```tsx
import React from "react";

interface PropsType {}
interface StateType {}
export class User extends React.Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.state = {};
  }
  render() {
    const {} = this;
    return (
      <div className="User">
        <h1>Hello from User.tsx</h1>
      </div>
    );
  }
}
```

4. `fbce`

```tsx
import React from "react";

interface Props {}
export const User: React.FC<Props> = ({}) => {
  return () => {
    <div className=" User.tsx">
      <h1>Hello from User</h1>
    </div>;
  };
};
```

So our `typescriptreact.json` file will look as follows:

```json
{
  "Class Based Component": {
    "prefix": ["cbce"],
    "body": [
      "import React from 'react';\n\ninterface PropsType {} \ninterface StateType {}\nexport class ${1:$TM_FILENAME_BASE} extends React.Component<PropsType, StateType> {\n\tconstructor(props: PropsType) {\n\t\tsuper(props);\n\t\tthis.state = {};\n\t}\n\trender() {\n\t\tconst {} = this;\n\t\treturn (\n\t\t\t<div className='${3:$TM_FILENAME_BASE}'>\n\t\t\t\t<h1>Hello from ${2:$TM_FILENAME}</h1>\n\t\t\t</div>\n\t\t);\n\t}\n}"
    ],
    "description": "Generates a class based component for typescript react without default export."
  },
  "Functional Based Component Default Export": {
    "prefix": ["fbc"],
    "body": [
      "import React from 'react';\n\ninterface Props {}\nconst ${1: $TM_FILENAME_BASE}: React.FC<Props> = ({}) => {\n\treturn () => {\n\t\t<div className='${2: $TM_FILENAME}'>\n\t\t\t<h1>Hello from ${3: $TM_FILENAME_BASE}</h1>\n\t\t</div>;\n\t};\n};\n\nexport default ${4: $TM_FILENAME_BASE};"
    ],
    "description": "Generates a functional based component for typescript react with default export."
  },
  "Functional Based Component": {
    "prefix": ["fbce"],
    "body": [
      "import React from 'react';\n\ninterface Props {}\nexport const ${1: $TM_FILENAME_BASE}: React.FC<Props> = ({}) => {\n\treturn () => {\n\t\t<div className='${2: $TM_FILENAME}'>\n\t\t\t<h1>Hello from ${3: $TM_FILENAME_BASE}</h1>\n\t\t</div>;\n\t};\n};"
    ],
    "description": "Generates a functional based component for typescript react with default export."
  },
  "Class Based Component Default Export": {
    "prefix": ["cbc"],
    "body": [
      "import React from 'react';\n\ninterface PropsType {} \ninterface StateType {}\nclass ${1:$TM_FILENAME_BASE} extends React.Component<PropsType, StateType> {\n\tconstructor(props: PropsType) {\n\t\tsuper(props);\n\t\tthis.state = {};\n\t}\n\trender() {\n\t\tconst {} = this;\n\t\treturn (\n\t\t\t<div className='${3:$TM_FILENAME_BASE}'>\n\t\t\t\t<h1>Hello from ${2:$TM_FILENAME}</h1>\n\t\t\t</div>\n\t\t);\n\t}\n}\n\n export default ${3: $TM_FILENAME_BASE}"
    ],
    "description": "Generates a class based component for typescript react with default export."
  }
}
```

### Ref

1. [code.visualstudio.com](https://code.visualstudio.com/docs/editor/userdefinedsnippets)
