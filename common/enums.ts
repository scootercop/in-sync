export enum SocketEvents {
  connection,
  disconnecting,
  joinRoom,
  leaveRoom,
  userJoined,
  userLeft,
  offerCreated,
  answerCreated,
  sendRTCIceCandidate,
  gotRTCIceCandidate,
  currentState,
}

export enum ChatMessageType {
  message,
  information,
}

export enum VideoEvent {
  canPlay,
  play,
  pause,
  seekTo,
  videoLinkChanged,
}
