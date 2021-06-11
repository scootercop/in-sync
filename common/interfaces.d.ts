import { ChatMessageType, VideoEvent } from "./enums";

interface UserId {
  userId: string;
}

export interface SocketData {
  roomName: string;
}

export interface UserInfo {
  userName: string;
  roomName: string;
}

export interface ChatMessageItem {
  type: ChatMessageType;
  content: string;
  from: string;
}

export interface SessionDescriptionWithUserId
  extends RTCSessionDescriptionInit,
    UserId {}

export interface ICECandidateWithUserId extends RTCIceCandidateInit, UserId {}

export interface VideoEventDetails {
  instruction: VideoEvent;
  timeStamp: number;
  payload?: Object;
}

export interface SeekPayload {
  currentTime: number;
}

export interface VideoLink {
  link: string;
}
