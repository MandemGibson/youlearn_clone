import { ReactNode, useState } from "react";
import { ContentContext } from "../entity";

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <ContentContext.Provider
      value={{
        filename,
        setFilename,
        content,
        setContent,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
