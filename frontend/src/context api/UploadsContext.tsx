import { ReactNode, useEffect, useState } from "react";
import { Upload, UploadsContext } from "../entity";
import supabase from "../utils/supabase";

export const UploadsProvider = ({ children }: { children: ReactNode }) => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUploads = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("upload").select("*");

        if (error) {
          console.log("Error fetching uploads: ", error);
          return;
        }

        setUploads(data);
        console.log(data);
      } catch (error) {
        console.error("Error: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUploads();
  }, []);

  return (
    <UploadsContext.Provider
      value={{ uploads, setUploads, isLoading, setIsLoading }}
    >
      {children}
    </UploadsContext.Provider>
  );
};
