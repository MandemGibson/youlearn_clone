import { createContext, Dispatch, SetStateAction } from "react";

//props
export type DropdownOption = {
  code: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  password?: string;
  username?: string;
  education_level?: string;
  language?: string;
  avatar_url?: string;
};

export type Room = {
  roomId: string;
  name: string;
  userId: string;
};

export type Upload = {
  uploadId?: string;
  type: string;
  filename: string;
  file_size: string;
  file_url: string;
  source_url: string;
  namespace: string;
  userId: string;
};

//context props
type AuthContextProps = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

type ContentContextProps = {
  filename: string;
  setFilename: Dispatch<SetStateAction<string>>;
  content: string | null;
  setContent: Dispatch<SetStateAction<string | null>>;
  youtubeVideoId: string | null;
  setYoutubeVideoId: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

type RoomsContextProps = {
  rooms: Room[];
  setRooms: Dispatch<SetStateAction<Room[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

type UploadsContextProps = {
  uploads: Upload[];
  setUploads: Dispatch<SetStateAction<Upload[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

//others
export const languages: DropdownOption[] = [
  { code: "US GB", name: "English" },
  { code: "IN", name: "Hindi" },
  { code: "ZA", name: "Afrikaans" },
  { code: "AE", name: "Arabic" },
  { code: "BG", name: "Bulgarian" },
  { code: "CN", name: "Chinese" },
  { code: "DK", name: "Danish" },
  { code: "NL", name: "Dutch" },
  { code: "FI", name: "Finnish" },
];

export const educationLevels: DropdownOption[] = [
  { code: "", name: "Secondary or high school" },
  { code: "", name: "Undergraduate university" },
  { code: "", name: "Graduate university" },
  { code: "", name: "Post doctorate" },
];

export const apiUrl = import.meta.env.VITE_API_URL;

//contexts
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

export const ContentContext = createContext<ContentContextProps>({
  filename: "",
  setFilename: () => {},
  content: null,
  setContent: () => {},
  youtubeVideoId: null,
  setYoutubeVideoId: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

export const RoomsContext = createContext<RoomsContextProps>({
  rooms: [],
  setRooms: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

export const UploadsContext = createContext<UploadsContextProps>({
  uploads: [],
  setUploads: () => {},
  isLoading: false,
  setIsLoading: () => {},
});
