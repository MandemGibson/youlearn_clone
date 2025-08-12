import { useContext } from "react";
import { UploadsContext } from "../entity";

export const useUploads = () => useContext(UploadsContext);
