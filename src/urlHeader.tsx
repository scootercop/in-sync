import { action } from "mobx";
import * as React from "react";
import { AppStore } from "./appStore";

export class URLHeader extends React.Component {
  public render() {
    return (
      <div className="urlHeaderContainer">
        <div className="urlHeaderSubContainer">
          <input
            type="text"
            className="urlInput"
            placeholder="Enter video link"
            onKeyPress={(ev) => this.setCurrentURL(ev, ev.currentTarget.value)}
          />
          <span className="inputFocusBG"></span>
        </div>
      </div>
    );
  }

  @action
  private setCurrentURL = (
    event: React.KeyboardEvent<HTMLInputElement>,
    value: string
  ) => {
    if (event.key.toLowerCase() !== "enter") {
      return;
    }

    AppStore.currentURL = value;
  };
}
