import { useContext } from "react";
import { AuthContext } from "../context api/AuthContext";

export const useAuth = () => useContext(AuthContext)