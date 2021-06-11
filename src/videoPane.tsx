import { observer } from "mobx-react";
import * as React from "react";
import Iframe from "react-iframe";
import { VideoEvent } from "../common/enums";
import { sleep } from "../common/helper";
import {
  SeekPayload,
  VideoEventDetails,
  VideoLink,
} from "../common/interfaces";
import { AppStore } from "./appStore";
import { RTCHandler } from "./rtcHandler";

@observer
export class VideoPane extends React.Component {
  private playbackEventInstance: Map<VideoEvent, number>;

  public async componentDidMount() {
    await this.init();
  }

  public async componentDidUpdate() {
    await this.init();
  }

  private async init() {
    this.playbackEventInstance = new Map();
    this.playbackEventInstance.set(VideoEvent.play, new Date().getTime());
    this.playbackEventInstance.set(VideoEvent.pause, new Date().getTime());
    this.playbackEventInstance.set(VideoEvent.seekTo, new Date().getTime());
    await this.registerVideoEventHandler();
  }

  async registerVideoEventHandler() {
    let videoFrameElement: HTMLMediaElement;
    if (AppStore.videoLink)
      videoFrameElement = document.getElementsByTagName(
        "video"
      )[0] as HTMLMediaElement;
    else if (AppStore.videoId) {
      await sleep(1000);
      videoFrameElement = document
        .getElementsByTagName("iframe")[0]
        .contentDocument.getElementsByTagName("video")[0] as HTMLMediaElement;
    }
    const videoPane = document.getElementsByClassName(
      "videoPane"
    )[0] as HTMLElement;

    if (videoFrameElement) {
      videoFrameElement.addEventListener("canplay", (ev) => {
        RTCHandler.sendVideoEventMessage({
          instruction: VideoEvent.canPlay,
          timeStamp: new Date().getTime(),
          payload: {
            currentTime: videoFrameElement.currentTime,
          },
        });
      });
      videoFrameElement.addEventListener("play", (ev) => {
        RTCHandler.sendVideoEventMessage({
          instruction: VideoEvent.play,
          timeStamp: new Date().getTime(),
          payload: {
            currentTime: videoFrameElement.currentTime,
          },
        });
      });
      videoFrameElement.addEventListener("playing", (ev) => {
        RTCHandler.sendVideoEventMessage({
          instruction: VideoEvent.play,
          timeStamp: new Date().getTime(),
          payload: {
            currentTime: videoFrameElement.currentTime,
          },
        });
      });
      videoFrameElement.addEventListener("pause", (ev) => {
        RTCHandler.sendVideoEventMessage({
          instruction: VideoEvent.pause,
          timeStamp: new Date().getTime(),
          payload: {
            currentTime: videoFrameElement.currentTime,
          },
        });
      });
      videoFrameElement.addEventListener("waiting", (ev) => {
        RTCHandler.sendVideoEventMessage({
          instruction: VideoEvent.pause,
          timeStamp: new Date().getTime(),
          payload: {
            currentTime: videoFrameElement.currentTime,
          },
        });
      });
      videoFrameElement.addEventListener("seeked", (ev) => {
        RTCHandler.sendVideoEventMessage({
          instruction: VideoEvent.seekTo,
          timeStamp: new Date().getTime(),
          payload: {
            currentTime: videoFrameElement.currentTime,
          },
        });
      });
    }
    videoPane.addEventListener("remoteEvent", async (ev: CustomEvent) => {
      const eventData = ev.detail as VideoEventDetails;
      if (eventData.instruction === VideoEvent.videoLinkChanged) {
        if (AppStore.currentURL !== (eventData.payload as VideoLink).link) {
          AppStore.currentURL = (eventData.payload as VideoLink).link;
        }
        return;
      }

      if (videoFrameElement) {
        if (
          Math.abs(
            videoFrameElement.currentTime -
              (eventData.payload as SeekPayload).currentTime
          ) > 5
        ) {
          videoFrameElement.currentTime = (
            eventData.payload as SeekPayload
          ).currentTime;
          return;
        }

        while (videoFrameElement.readyState !== 4) {
          await sleep(500);
        }
        if (eventData.instruction === VideoEvent.canPlay) {
          if (videoFrameElement.paused) {
            if (
              this.playbackEventInstance.get(VideoEvent.play) >
              this.playbackEventInstance.get(VideoEvent.pause)
            ) {
              if (
                eventData.timeStamp >
                this.playbackEventInstance.get(VideoEvent.play)
              ) {
                videoFrameElement.play();
                this.playbackEventInstance.set(
                  VideoEvent.pause,
                  new Date().getTime()
                );
              }
            }
          }
          return;
        }

        if (eventData.instruction === VideoEvent.play) {
          if (videoFrameElement.paused) {
            if (
              eventData.timeStamp >
              this.playbackEventInstance.get(VideoEvent.pause)
            ) {
              videoFrameElement.play();
              this.playbackEventInstance.set(
                VideoEvent.pause,
                new Date().getTime()
              );
            }
          }
          return;
        }

        if (eventData.instruction === VideoEvent.pause) {
          if (!videoFrameElement.paused) {
            if (
              eventData.timeStamp >
              this.playbackEventInstance.get(VideoEvent.play)
            ) {
              videoFrameElement.pause();
              this.playbackEventInstance.set(
                VideoEvent.pause,
                new Date().getTime()
              );
            }
          }
          return;
        }

        if (eventData.instruction === VideoEvent.seekTo) {
          if (
            eventData.timeStamp >
            this.playbackEventInstance.get(VideoEvent.seekTo)
          ) {
            if (
              videoFrameElement.currentTime !==
              (eventData.payload as SeekPayload).currentTime
            )
              videoFrameElement.currentTime = (
                eventData.payload as SeekPayload
              ).currentTime;
          }

          return;
        }
      }
    });
  }

  public render() {
    const { videoLink, videoId } = AppStore;
    return (
      <div className="videoPane">
        {videoLink ? (
          <video
            src={videoLink}
            controls
            className="videoFrame"
            id="videoFrame"
          />
        ) : null}
        {videoId ? (
          <Iframe
            id="youtubeFrame"
            url={`https://www.youtube.com/embed/${videoId}?origin=${AppStore.appURI}`}
            frameBorder={0}
            className="ivideoFrame"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          />
        ) : null}
        {videoLink || videoId ? null : (
          <div className="noVideo">
            <label>No Video Added</label>
          </div>
        )}
      </div>
    );
  }
}
