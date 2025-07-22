import { ReactNode, useEffect, useState } from "react";
import { Room, RoomsContext } from "../entity";
import supabase from "../utils/supabase";

export const RoomsProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from("room").select("*");

        if (error) {
          console.log("Error fetching rooms: ", error);
          return;
        }

        setRooms(data);
      } catch (error) {
        console.error("Error: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <RoomsContext.Provider value={{ rooms, setRooms, isLoading, setIsLoading }}>
      {children}
    </RoomsContext.Provider>
  );
};
