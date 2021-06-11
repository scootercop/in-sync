import { observable } from "mobx";
import { ChatMessageType, VideoEvent } from "../common/enums";
import {
  ChatMessageItem,
  ICECandidateWithUserId,
  SessionDescriptionWithUserId,
  VideoEventDetails,
} from "../common/interfaces";
import { AppStore } from "./appStore";
import { SocketHandler } from "./socketHandler";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

class RTCHandler {
  private _peerConnections: Map<string, RTCPeerConnection>;
  private _chatDataChannels: Map<string, RTCDataChannel>;
  private _videoDataChannels: Map<string, RTCDataChannel>;
  private _remoteAudioStream: MediaStream;
  @observable public chatContent: ChatMessageItem[];

  constructor() {
    this._peerConnections = new Map();
    this._chatDataChannels = new Map();
    this._videoDataChannels = new Map();
    this.chatContent = [];
  }
  public addPeerConnection(id: string, pc: RTCPeerConnection) {
    this._peerConnections.set(id, pc);
  }

  private createPeerConnection(userId: string) {
    try {
      let newPeerConnection = new RTCPeerConnection(configuration);
      newPeerConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) =>
        this.handleIceCandidate(ev);
      newPeerConnection.ontrack = (ev: RTCTrackEvent) =>
        this.handleRemoteTrackAdded(ev);
      newPeerConnection.ondatachannel = (ev: RTCDataChannelEvent) => {
        const dataChannel = ev.channel;
        dataChannel.onmessage = (ev: MessageEvent) => {
          if (dataChannel.label === "chatChannel") {
            this.chatContent.unshift(JSON.parse(ev.data));
          }
          if (dataChannel.label === "videoChannel") {
            const videoPane = document.getElementsByClassName(
              "videoPane"
            )[0] as HTMLElement;
            videoPane.dispatchEvent(
              new CustomEvent("remoteEvent", {
                detail: JSON.parse(ev.data),
              })
            );
          }
        };
      };
      const chatChannel = newPeerConnection.createDataChannel("chatChannel");
      const videoChannel = newPeerConnection.createDataChannel("videoChannel");
      this._chatDataChannels.set(userId, chatChannel);
      this._videoDataChannels.set(userId, videoChannel);
      this._peerConnections.set(userId, newPeerConnection);
      return newPeerConnection;
    } catch (e) {
      console.log("Cannot create RTCPeerConnection object.");
      return;
    }
  }

  private handleIceCandidate(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      this.sendRTCIceCandidate(event.candidate);
    }
  }

  private handleRemoteTrackAdded(event: RTCTrackEvent) {
    if (event.track.kind == "audio") {
      if (this._remoteAudioStream) {
        this._remoteAudioStream.addTrack(event.track);
      } else {
        this._remoteAudioStream = new MediaStream([event.track]);
      }
      AppStore.remoteAudioElement.srcObject = this._remoteAudioStream;
    }
  }

  public start(userId: string) {
    let peerConnection = this.createPeerConnection(userId);
    peerConnection.addTrack(AppStore.localAudioStream.getAudioTracks()[0]);
    return peerConnection;
  }

  public async createOfferAndSetLocalDescription(
    peerConnection: RTCPeerConnection,
    userId: string
  ) {
    const sdp = await peerConnection.createOffer();
    return await this.setLocalDescription(sdp, peerConnection, userId);
  }

  public async createAnswerAndSetLocalDescription(
    peerConnection: RTCPeerConnection,
    userId: string
  ) {
    const sdp = await peerConnection.createAnswer();
    return await this.setLocalDescription(sdp, peerConnection, userId);
  }

  private async setLocalDescription(
    sessionDescription: RTCSessionDescriptionInit,
    peerConnection: RTCPeerConnection,
    userId: string
  ) {
    await peerConnection.setLocalDescription(sessionDescription);
    this._peerConnections.set(userId, peerConnection);
    return {
      sdp: sessionDescription.sdp,
      type: sessionDescription.type,
      userId: userId,
    } as SessionDescriptionWithUserId;
  }

  public async setRemoteDesctption(
    userId: string,
    sessionDescription: SessionDescriptionWithUserId
  ) {
    const peerConnection = this._peerConnections.get(userId);
    await peerConnection.setRemoteDescription(sessionDescription);
    this._peerConnections.set(sessionDescription.userId, peerConnection);
  }

  public removePeerConnection(userId: string) {
    this._peerConnections.delete(userId);
    this._chatDataChannels.delete(userId);
    this._videoDataChannels.delete(userId);
  }

  public addIceCandidate(candidate: ICECandidateWithUserId) {
    let pc = this._peerConnections.get(candidate.userId);
    if (pc) {
      pc.addIceCandidate(candidate);
    }
  }

  private sendRTCIceCandidate(candidate: RTCIceCandidate) {
    SocketHandler.sendRTCIceCandidate(candidate);
  }

  public sendChatMessage(msg: string) {
    const { userName } = AppStore.roomOptions;
    for (const [id, dc] of this._chatDataChannels) {
      dc.send(
        JSON.stringify({
          content: msg,
          from: userName,
          type: ChatMessageType.message,
        } as ChatMessageItem)
      );
    }
    this.chatContent.unshift({
      content: msg,
      from: userName,
      type: ChatMessageType.message,
    });
  }

  public sendVideoEventMessage(data: VideoEventDetails) {
    for (const [id, dc] of this._videoDataChannels) {
      dc.send(JSON.stringify(data));
    }
  }

  public updateVideoLink(data: string) {
    const details = {
      instruction: VideoEvent.videoLinkChanged,
      timeStamp: new Date().getTime(),
      payload: { link: data },
    } as VideoEventDetails;
    for (const [id, dc] of this._videoDataChannels) {
      dc.send(JSON.stringify(details));
    }
  }

  public toggleMuteSelf(value: boolean) {
    if (AppStore.localAudioStream)
      AppStore.localAudioStream.getAudioTracks()[0].enabled = !value;
  }

  public toggleMuteRemote(value: boolean) {
    if (this._remoteAudioStream)
      this._remoteAudioStream.getAudioTracks()[0].enabled = !value;
  }
}

const instance = new RTCHandler();
export { instance as RTCHandler };
