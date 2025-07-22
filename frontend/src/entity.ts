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
};

export type Room = {
  roomId: string
  name: string
  userId: string
}


//context props
type AuthContextProps = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

type ContentContextProps = {
  filename: string
  setFilename: Dispatch<SetStateAction<string>>
  content: string | null;
  setContent: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

type RoomsContextProps = {
  rooms: Room[]
  setRooms: Dispatch<SetStateAction<Room[]>>
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}


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
  setUser: () => { },
  isLoading: false,
  setIsLoading: () => { },
});

export const ContentContext = createContext<ContentContextProps>({
  filename: "",
  setFilename: () => { },
  content: null,
  setContent: () => { },
  isLoading: false,
  setIsLoading: () => { }
})

export const RoomsContext = createContext<RoomsContextProps>({
  rooms: [],
  setRooms: () => { },
  isLoading: false,
  setIsLoading: () => { },
})