import { useContext } from "react";
import { ContentContext } from "../entity";

export const useContent = () => useContext(ContentContext)