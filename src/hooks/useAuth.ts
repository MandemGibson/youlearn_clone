import { useContext } from "react";
import { AuthContext } from "../entity";

export const useAuth = () => useContext(AuthContext)