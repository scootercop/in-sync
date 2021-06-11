import { action, computed, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { UserInfo } from "../common/interfaces";

interface RoomOptionsProps {
  joinRoom: (roomOptions: UserInfo, callback: Function) => void;
  setRoomJoined: (value: boolean) => void;
}

@observer
export class RoomOptions extends React.Component<RoomOptionsProps> {
  @observable private userInfo: UserInfo;

  constructor(props: RoomOptionsProps) {
    super(props);
    this.userInfo = {
      roomName: "",
      userName: "",
    };
  }

  @computed
  private get isJoiningDisabled() {
    return !!!this.userInfo.roomName || !!!this.userInfo.userName;
  }

  @action
  private joinRoom() {
    this.props.joinRoom(this.userInfo, () => {
      this.props.setRoomJoined(true);
    });
  }

  public render() {
    return (
      <div className="roomOptions">
        <div className="userName">
          <input
            type="text"
            className="userNameInput"
            placeholder="Enter your name"
            value={this.userInfo.userName}
            onChange={(event) =>
              (this.userInfo.userName = event.currentTarget.value)
            }
          />
          <span className="inputFocusBG"></span>
        </div>
        <div className="roomName">
          <input
            type="text"
            className="roomNameInput"
            placeholder="Enter room name"
            value={this.userInfo.roomName}
            onChange={(event) =>
              (this.userInfo.roomName = event.currentTarget.value)
            }
          />
          <span className="inputFocusBG"></span>
        </div>
        <input
          type="button"
          className="joinRoomButton"
          onClick={() => this.joinRoom()}
          disabled={this.isJoiningDisabled}
          value="Join"
        />
      </div>
    );
  }
}
