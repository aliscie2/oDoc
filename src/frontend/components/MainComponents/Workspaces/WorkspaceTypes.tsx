import { Principal } from "@dfinity/principal";

export interface Workspace {
  id: string;
  name: string;
  files: any[];
  creator: Principal;
  members: Principal[];
  chats: any[];
  admins: Principal[];
}


interface Profile {
  id: string;
}

export interface FilesState {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  profile: Profile;
}
