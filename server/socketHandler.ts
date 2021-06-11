import { Server, Socket } from "socket.io";
import { SocketEvents } from "../common/enums";
import {
  ICECandidateWithUserId,
  SessionDescriptionWithUserId,
  SocketData,
} from "../common/interfaces";

export function handleSocket(socketServer: Server) {
  socketServer.on(
    SocketEvents[SocketEvents.connection],
    (userSocket: Socket) => {
      userSocket.on(SocketEvents[SocketEvents.joinRoom], (data: SocketData) => {
        socketServer
          .to(data.roomName)
          .emit(SocketEvents[SocketEvents.userJoined], userSocket.id);
        userSocket.join(data.roomName);
      });

      userSocket.on(
        SocketEvents[SocketEvents.leaveRoom],
        (data: SocketData) => {
          socketServer
            .to(data.roomName)
            .emit(SocketEvents[SocketEvents.userLeft], userSocket.id);
          userSocket.leave(data.roomName);
        }
      );

      userSocket.on(
        SocketEvents[SocketEvents.disconnecting],
        (data: SocketData) => {
          socketServer
            .to(Array.from(userSocket.rooms.values()))
            .emit(SocketEvents[SocketEvents.userLeft], userSocket.id);
          userSocket.leave(userSocket.rooms[0]);
        }
      );

      userSocket.on(
        SocketEvents[SocketEvents.offerCreated],
        (data: SessionDescriptionWithUserId) => {
          (socketServer.sockets.sockets.get(data.userId) as Socket).emit(
            SocketEvents[SocketEvents.offerCreated],
            {
              sdp: data.sdp,
              type: data.type,
              userId: userSocket.id,
            } as SessionDescriptionWithUserId
          );
        }
      );

      userSocket.on(
        SocketEvents[SocketEvents.answerCreated],
        (data: SessionDescriptionWithUserId) => {
          (socketServer.sockets.sockets.get(data.userId) as Socket).emit(
            SocketEvents[SocketEvents.answerCreated],
            {
              sdp: data.sdp,
              type: data.type,
              userId: userSocket.id,
            } as SessionDescriptionWithUserId
          );
        }
      );

      userSocket.on(
        SocketEvents[SocketEvents.sendRTCIceCandidate],
        (data: RTCIceCandidateInit) => {
          userSocket.broadcast
            .to(Array.from(userSocket.rooms.values()))
            .emit(SocketEvents[SocketEvents.gotRTCIceCandidate], {
              candidate: data.candidate,
              sdpMLineIndex: data.sdpMLineIndex,
              userId: userSocket.id,
            } as ICECandidateWithUserId);
        }
      );
    }
  );
}
