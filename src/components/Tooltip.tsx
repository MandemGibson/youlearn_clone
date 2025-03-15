type TooltipProps = {
    text: string;
    children: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
  };
  
  const Tooltip = ({
    text,
    children,
    position = "top",
    className = "",
  }: TooltipProps) => {
    const positionClasses = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };
  
    return (
      <div className={`relative group`}>
        {children}
        <div
          className={`absolute whitespace-nowrap px-3 py-1 text-xs bg-[#1e1e1e]/80
             text-white rounded opacity-0 group-hover:opacity-100 transition-opacity
             z-50 duration-300 ${positionClasses[position]} ${className}`}
        >
          {text}
        </div>
      </div>
    );
  };
  
  export default Tooltip;
  