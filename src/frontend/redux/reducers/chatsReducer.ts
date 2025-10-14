import {
  ADD_CHAT,
  ADD_NOTIFICATION,
  ChatActions,
  ChatState,
  DELETE_CHAT,
  DELETE_CHATS_NOTIFICATIONS,
  EXTEND_CHATS,
  initialChatsState,
  SET_CHATS,
  SET_CHATS_NOTIFICATIONS,
  UPDATE_CHAT,
  UPDATE_MESSAGE,
  UPDATE_NOTIFICATION,
} from "../types/chatsTypes";
import { FEChat, Message } from "../../../declarations/backend/backend.did";

export function chatsReducer(
  state: ChatState = initialChatsState,
  action: ChatActions,
): ChatState {
  switch (action.type) {
   case "OPEN_CHAT": {
  const { chatId, current_user } = action;
  return {
    ...state,
    current_chat_id: chatId,
    current_user,
    openChatWindows: {
      ...state.openChatWindows,
      [chatId]: { x: 100 + (Object.keys(state.openChatWindows).length * 30), y: 100 + (Object.keys(state.openChatWindows).length * 30) }
    }
  };
}

case "CLOSE_CHAT_WINDOW": {
  const { chatId } = action;
  const { [chatId]: removed, ...remaining } = state.openChatWindows;
  return {
    ...state,
    openChatWindows: remaining,
    current_chat_id: state.current_chat_id === chatId ? "none" : state.current_chat_id
  };
}
    case ADD_CHAT: {
      return {
        ...state,
        chats: [...state.chats, action.chat],
      };
    }

    case SET_CHATS: {
      return {
        ...state,
        chats: action.chats,
      };
    }

    case EXTEND_CHATS: {
      return {
        ...state,
        chats: [...state.chats, ...action.chats],
      };
    }
    case UPDATE_CHAT: {
      const { chat } = action;

      return {
        ...state,
        chats: state.chats.map((c) => {
          if (c.id === chat.id) {
            return chat;
          }
          return c;
        }),
      };
    }
    case DELETE_CHAT: {
      const { chat_id } = action;
      let current_chat_id = state.current_chat_id;
      if (state.current_chat_id === chat_id) {
        current_chat_id = "none";
      }
      return {
        ...state,
        chats: state.chats.filter((chat: FEChat) => chat.id !== chat_id),
        current_chat_id,
      };
    }

    // case SEND_MESSAGE: {
    //   let chats_notifications = state.chats_notifications.map((note) => {
    //     if (note.chat_id === action.message.chat_id) {
    //       return action.message;
    //     }
    //     return note;
    //   });
    //   let chat = state.chats.find(
    //     (chat: FEChat) => chat.id === action.message.chat_id,
    //   );

    //   if (!chat) {
    //     let admin: UserFE = {
    //       id: state.current_user.toString(),
    //       name: "other",
    //     };
    //     chat = {
    //       creator: {
    //         id: "profile.id",
    //         name: "profile.name",
    //       },
    //       members: [],
    //       name: "",
    //       admins: [admin],
    //       id: action.message.chat_id,
    //       messages: [action.message],
    //     };

    //     return {
    //       ...state,
    //       chats: [...state.chats, chat],
    //       current_chat_id: action.message.chat_id,
    //       chats_notifications,
    //     };
    //   }

    //   return {
    //     ...state,
    //     chats_notifications,
    //     chats: state.chats.map((_chat: FEChat) =>
    //       _chat.id === chat.id
    //         ? { ...chat, messages: [...chat.messages, action.message] }
    //         : _chat,
    //     ),
    //   };
    // }

    case UPDATE_MESSAGE: {
      return {
        ...state,
        chats: state.chats.map((chat: FEChat) =>
          chat.id === action.message.chat_id
            ? {
                ...chat,
                messages: chat.messages.map((message: Message) =>
                  message.id === action.message.id ? action.message : message,
                ),
              }
            : chat,
        ),
      };
    }

    
    case ADD_NOTIFICATION: {
  const chatIndex = state.chats.findIndex((chat: FEChat) => chat.id === action.message.chat_id);
  
  if (chatIndex === -1) {
    // Chat doesn't exist locally, need to fetch it
    return {
      ...state,
      chats_notifications: [
        ...state.chats_notifications.filter(
          (m: Message) => m.chat_id !== action.message.chat_id,
        ),
        action.message,
      ],
    };
  }

  // ⚠️ CRITICAL: MESSAGE ORDERING
  // Messages are stored in REVERSE CHRONOLOGICAL order (newest first)
  // Index 0 = newest message, Index N = oldest message
  // When adding a new message, it MUST go at the BEGINNING of the array
  // Example: [newMsg, msg2, msg1, oldestMsg]
  const updatedChat = {
    ...state.chats[chatIndex],
    messages: [action.message, ...state.chats[chatIndex].messages],
  };

  const newChats = [...state.chats];
  newChats[chatIndex] = updatedChat;

  return {
    ...state,
    chats: newChats,
    chats_notifications: [
      ...state.chats_notifications.filter(
        (m: Message) => m.chat_id !== action.message.chat_id,
      ),
      action.message,
    ],
  };
}



    case UPDATE_NOTIFICATION: {
      return {
        ...state,
        chats_notifications: state.chats_notifications.map((m: Message) => {
          if (m.chat_id === action.message.chat_id) {
            return action.message;
          }
          return m;
        }),
      };
    }

    case SET_CHATS_NOTIFICATIONS: {
      return {
        ...state,
        chats_notifications: action.messages,
      };
    }

    case DELETE_CHATS_NOTIFICATIONS: {
      return {
        ...state,
        chats_notifications: state.chats_notifications.filter(
          (message) => message.chat_id !== action.chat_id,
        ),
      };
    }

    // case ADD_CHATS_NOTIFICATIONS: {
    //   return {
    //     ...state,
    //     chats_notifications: [...state.chats_notifications, action.message],
    //   };
    // }

    default:
      return state;
  }
}
