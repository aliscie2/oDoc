// types.ts
import {
  ContractUpdates,
  CustomContract,
  FileIndexing,
  FileNode,
  Friend,
  StoredContract,
  User,
  UserProfile,
  Wallet,
  WorkSpace,
} from "$/declarations/backend/backend.did";

export interface InitialState {
  inited: boolean;
  current_file: FileNode | null;
  is_files_saved: boolean;
  files: FileNode[];
  files_content: Record<string, any>;
  friends: Friend[];
  posts: any[];
  changes: {
    files: FileNode[];
    contents: Record<string, any>;
    // contracts: Record<string, StoredContract>;
    contracts: Array<ContractUpdates>;
    delete_contracts: string[];
    files_indexing: FileIndexing[];
  };
  profile: User | null;
  profile_history: UserProfile | null;
  top_dialog: { open: boolean; content: any; title: string | null };
  workspaces: WorkSpace[];
  currentWorkspace: WorkSpace | null;
  contracts: Record<string, CustomContract>;
  all_friends: User[];
  all_users: any[];

  [key: string]: any;

  anonymous: boolean;
}

export type FilesActions =
  | { type: "SET_WALLET"; wallet: Wallet }
  | { type: "ADD_FILE"; new_file: FileNode }
  | { type: "REMOVE_FILE"; id: string }
  | { type: "UPDATE"; id: string; file: Partial<FileNode> }
  | { type: "GET" }
  | { type: "GET_ALL" }
  | { type: "CURRENT_FILE"; file: FileNode }
  | { type: "UPDATE_CONTENT"; id: string; content: any }
  | { type: "ADD_CONTENT"; id: string; content: any }
  | { type: "UPDATE_FILE_TITLE"; id: string; title: string }
  | { type: "UPDATE_FILE_WORKSPACES"; id: string; workspaces: string[] }
  | { type: "ADD_CONTRACT"; contract: CustomContract }
  | { type: "SET_CONTRACT"; contract: CustomContract | StoredContract }
  | { type: "UPDATE_CONTRACT"; contract: CustomContract }
  | { type: "CONTENT_CHANGES"; id: string; changes: any }
  | { type: "CONTRACT_CHANGES"; changes: StoredContract }
  | { type: "RESOLVE_CHANGES" }
  | { type: "CURRENT_USER_HISTORY"; profile_history: UserProfile }
  | { type: "REMOVE_CONTRACT"; id: string }
  | { type: "UPDATE_BALANCE"; balance: number }
  | { type: "UPDATE_PROFILE"; profile: Partial<UserProfile> }
  | {
      type: "CHANGE_FILE_PARENT";
      position: number;
      id: string;
      parent: string[];
      index: number;
    }
  | { type: "UPDATE_FRIEND"; id: string }
  | { type: "UPDATE_NOTE"; id: string }
  | { type: "CONFIRM_FRIEND"; friend: Friend }
  | { type: "TOP_DIALOG"; open: boolean; content: any; title: string }
  | { type: "ADD_WORKSPACE"; workspace: WorkSpace }
  | { type: "UPDATE_WORKSPACE"; workspace: WorkSpace }
  | { type: "DELETE_WORKSPACE"; workspace: WorkSpace }
  | { type: "CHANGE_CURRENT_WORKSPACE"; currentWorkspace: WorkSpace }
  | { type: "UPDATE_ANONYMOUS"; anonymous: boolean }
  | { type: "ADD_FRIEND"; user?: User; friend: Friend }
  | { type: "REMOVE_FRIEND" }
  | { type: "ADD_FILES_LIST"; friends: FileNode[] }
  | { type: "ADD_CONTENTS_LIST"; friends: FileNode[] }
  | { type: "SET_POSTS"; posts: any[] }
  | { type: "ADD_POST"; post: any }
  | { type: "ADD_POSTS"; post: any[] }
  | { type: "UPDATE_POST"; id: string; post: unknown }
  | { type: "DELETE_POST"; id: string };

export const initialState: InitialState = {
  inited: false,
  wallet: { balance: 0, address: "", mnemonic: "", exchanges: [] },
  isLoggedIn: null,
  current_file: null,
  is_files_saved: true,
  files: [],
  files_content: {},
  friends: [],
  changes: {
    files: [],
    contents: {},
    contracts: [],
    delete_contracts: [],
    files_indexing: [],
  },
  profile: null,
  profile_history: null,
  top_dialog: { open: false, content: null, title: null },
  workspaces: [],
  currentWorkspace: null,
  contracts: {},
  all_friends: [],
  all_users: [],
  anonymous: false,
  posts: [],
};
