import * as socketIO from "socket.io-client";
import { SocketEvents } from "../common/enums";
import {
  ICECandidateWithUserId,
  SessionDescriptionWithUserId,
  UserInfo,
} from "../common/interfaces";
import { AppStore } from "./appStore";
import { RTCHandler } from "./rtcHandler";

class SocketHandler {
  private _socket: socketIO.Socket;

  constructor() {
    this._socket = socketIO.io(process.env.apiURI);

    this._socket.on(
      SocketEvents[SocketEvents.userJoined],
      async (userId: string) => {
        const pc = RTCHandler.start(userId);
        const localSessionDescription =
          await RTCHandler.createOfferAndSetLocalDescription(pc, userId);
        this._socket.emit(
          SocketEvents[SocketEvents.offerCreated],
          localSessionDescription
        );
      }
    );

    this._socket.on(SocketEvents[SocketEvents.userLeft], (userId: string) => {
      RTCHandler.removePeerConnection(userId);
    });

    this._socket.on(
      SocketEvents[SocketEvents.offerCreated],
      async (offer: SessionDescriptionWithUserId) => {
        const pc = RTCHandler.start(offer.userId);

        await RTCHandler.setRemoteDesctption(offer.userId, offer);
        const localSessionDescription =
          await RTCHandler.createAnswerAndSetLocalDescription(pc, offer.userId);
        this._socket.emit(
          SocketEvents[SocketEvents.answerCreated],
          localSessionDescription
        );
      }
    );

    this._socket.on(
      SocketEvents[SocketEvents.answerCreated],
      async (answer: SessionDescriptionWithUserId) => {
        await RTCHandler.setRemoteDesctption(answer.userId, answer);
      }
    );

    this._socket.on(
      SocketEvents[SocketEvents.gotRTCIceCandidate],
      function (candidate: ICECandidateWithUserId) {
        RTCHandler.addIceCandidate(candidate);
      }
    );
  }

  public sendRTCIceCandidate(candidate: RTCIceCandidate) {
    this._socket.emit(
      SocketEvents[SocketEvents.sendRTCIceCandidate],
      candidate
    );
  }

  public joinRoom(roomOptions: UserInfo) {
    this._socket.emit(SocketEvents[SocketEvents.joinRoom], roomOptions);
  }

  public leaveRoom(roomOptions: UserInfo) {
    this._socket.emit(SocketEvents[SocketEvents.leaveRoom], roomOptions);
  }
}

const instance = new SocketHandler();
export { instance as SocketHandler };
