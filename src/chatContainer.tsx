import { action, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { ChatMessageType } from "../common/enums";
import { ChatMessageItem } from "../common/interfaces";
import { RTCHandler } from "./rtcHandler";

interface ChatContainerProps {
  leaveRoom: (callback: VoidFunction) => void;
  setRoomJoined: (value: boolean) => void;
}

@observer
export class ChatContainer extends React.Component<ChatContainerProps> {
  @observable private chatMessage: string;
  @observable private micMute: boolean;
  @observable private speakerMute: boolean;

  constructor(props: ChatContainerProps) {
    super(props);
    this.chatMessage = "";
    this.micMute = false;
    this.speakerMute = false;
  }

  @action
  private leaveRoom() {
    this.props.leaveRoom(() => {
      this.props.setRoomJoined(false);
    });
  }

  @action
  private sendChat(
    event: React.KeyboardEvent<HTMLInputElement>,
    value: string
  ) {
    if (event.key.toLowerCase() !== "enter") {
      return;
    }

    RTCHandler.sendChatMessage(value);
    this.chatMessage = "";
  }

  @action
  private toggleMuteSelf() {
    this.micMute = !this.micMute;
    RTCHandler.toggleMuteSelf(this.micMute);
  }

  @action
  private toggleMuteRemote() {
    this.speakerMute = !this.speakerMute;
    RTCHandler.toggleMuteRemote(this.speakerMute);
  }

  public render() {
    return (
      <div className="chatContainer">
        <div className="chatMessages">
          {RTCHandler.chatContent.map((value, index) => {
            if (value.type === ChatMessageType.message) {
              return (
                <div key={index} className="chatMessage">
                  <div className="chatFrom">{value.from}</div>
                  <div className="chatContent">{value.content}</div>
                </div>
              );
            } else if (value.type === ChatMessageType.information) {
              return <div className="infoMessage">{value.content}</div>;
            }
          })}
        </div>
        <div className="bottomBar">
          <div className="chatInputContainer">
            <input
              type="text"
              className="chatInput"
              value={this.chatMessage}
              onChange={(event) =>
                (this.chatMessage = event.currentTarget.value)
              }
              onKeyPress={(ev) => this.sendChat(ev, ev.currentTarget.value)}
            />
            <span className="inputFocusBG"></span>
          </div>
          <div className="soundButtons">
            <i
              className="material-icons input-icons"
              onClick={() => this.toggleMuteSelf()}
            >
              {this.micMute ? "mic_off" : "mic"}
            </i>
            <i
              className="material-icons input-icons"
              onClick={() => this.toggleMuteRemote()}
            >
              {this.speakerMute ? "volume_off" : "volume_up"}
            </i>
          </div>
        </div>
      </div>
    );
  }
}
