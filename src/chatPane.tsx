import { action, computed, observable } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { UserInfo } from "../common/interfaces";
import { AppStore } from "./appStore";
import { ChatContainer } from "./chatContainer";
import { RoomOptions } from "./roomOptions";

interface ChatPaneProps {
  joinRoom: (roomOptions: UserInfo, callback: Function) => void;
  leaveRoom: (callback: VoidFunction) => void;
}

@observer
export class ChatPane extends React.Component<ChatPaneProps> {
  @observable private roomJoined: boolean;

  constructor(props: ChatPaneProps) {
    super(props);
    this.roomJoined = false;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((value) => (AppStore.localAudioStream = value));
  }

  public render() {
    return (
      <div className="chatPane">
        {this.roomJoined ? (
          <ChatContainer
            leaveRoom={(callback: VoidFunction) =>
              this.props.leaveRoom(callback)
            }
            setRoomJoined={(value: boolean) => (this.roomJoined = value)}
          />
        ) : (
          <RoomOptions
            joinRoom={(roomOptions: UserInfo, callback: Function) =>
              this.props.joinRoom(roomOptions, callback)
            }
            setRoomJoined={(value: boolean) => (this.roomJoined = value)}
          />
        )}
      </div>
    );
  }
}
