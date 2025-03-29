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


//context props
type AuthContextProps = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

type ContentContextProps = {
  content: string | null;
  setContent: Dispatch<SetStateAction<string | null>>;
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

//contexts
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => { },
  isLoading: false,
  setIsLoading: () => { },
});

export const ContentContext = createContext<ContentContextProps>({
  content: null,
  setContent: () => { },
  isLoading: false,
  setIsLoading: () => { }
})