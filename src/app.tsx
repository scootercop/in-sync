import * as React from "react";
import { AppStore } from "./appStore";
import { ChatPane } from "./chatPane";
import { URLHeader } from "./urlHeader";
import { VideoPane } from "./videoPane";
import { SocketHandler } from "./socketHandler";
import { UserInfo } from "../common/interfaces";

export class App extends React.Component {
  componentDidMount() {
    AppStore.remoteAudioElement = document.getElementById(
      "remoteAudio"
    ) as HTMLAudioElement;
  }

  public render() {
    return (
      <>
        <URLHeader />
        <div className="contentContainer">
          <VideoPane />
          <ChatPane
            joinRoom={(roomOptions: UserInfo, callback: Function) =>
              this.joinRoom(roomOptions, callback)
            }
            leaveRoom={(callback: VoidFunction) => this.leaveRoom(callback)}
          />
        </div>
        <audio
          id="remoteAudio"
          controls={true}
          autoPlay={true}
          hidden={true}
        ></audio>
      </>
    );
  }

  private joinRoom(roomOptions: UserInfo, callback: Function) {
    SocketHandler.joinRoom(roomOptions);
    AppStore.roomOptions = roomOptions;
    callback();
  }

  private leaveRoom(callback: VoidFunction) {
    const { roomOptions } = AppStore;
    if (roomOptions && roomOptions.roomName) {
      SocketHandler.leaveRoom(roomOptions);
      callback();
    }
  }
}
