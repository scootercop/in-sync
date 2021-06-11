import { computed, observable, reaction } from "mobx";
import { UserInfo } from "../common/interfaces";
import { Constants } from "./constants";
import { RTCHandler } from "./rtcHandler";

class AppStore {
  @observable private _currentURL: string;
  @observable private _parsedVideoId: string;
  @observable private _videoLink: string;
  @observable private _roomOptions: UserInfo;
  private _remoteAudio: HTMLAudioElement;
  private _localAudioStream: MediaStream;
  public appURI = process.env.appURI;

  constructor() {
    this._roomOptions = {
      roomName: "",
      userName: "",
    };

    reaction(
      () => this._videoLink,
      () => {
        if (this._videoLink) {
          RTCHandler.updateVideoLink(this._currentURL);
        }
      }
    );

    reaction(
      () => this._parsedVideoId,
      () => {
        if (this._parsedVideoId) {
          RTCHandler.updateVideoLink(this._currentURL);
        }
      }
    );
  }

  @computed
  public get currentURL(): string {
    return this._currentURL;
  }

  public set currentURL(value: string) {
    this._currentURL = value;
    const parsedURL = new RegExp(Constants.ytRegEx).exec(value);
    if (parsedURL) {
      this._parsedVideoId = parsedURL.pop();
      this._videoLink = undefined;
      return;
    }

    if (value.split(".").pop() === "mp4") {
      this._videoLink = value;
      this._parsedVideoId = undefined;
    }
  }

  @computed
  public get videoId(): string {
    return this._parsedVideoId;
  }

  public get videoLink(): string {
    return this._videoLink;
  }

  public set localAudioStream(stream: MediaStream) {
    this._localAudioStream = stream;
  }

  @computed
  public get localAudioStream() {
    return this._localAudioStream;
  }

  public set roomOptions(value: UserInfo) {
    this._roomOptions = value;
  }

  @computed
  public get roomOptions() {
    return this._roomOptions;
  }

  @computed
  public get remoteAudioElement() {
    return this._remoteAudio;
  }

  public set remoteAudioElement(value: HTMLAudioElement) {
    this._remoteAudio = value;
  }
}

const instance = new AppStore();
export { instance as AppStore };
