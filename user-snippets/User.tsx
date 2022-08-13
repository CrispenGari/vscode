import React from "react";
import "./User.css;";
import styles from "./User.module.css;";
import "./User.sass;";
import "./User.scss;";
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
