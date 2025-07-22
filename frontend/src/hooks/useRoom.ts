import { useContext } from "react";
import { RoomsContext } from "../entity";

export const useRoom = () => useContext(RoomsContext)