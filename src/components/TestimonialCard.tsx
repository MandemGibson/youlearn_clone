interface TestimonialCardProps {
  message: string;
  name: string;
  portfolio: string;
  profilePic: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  message,
  name,
  portfolio,
  profilePic,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 
    rounded-[16px] min-w-[480px] min-h-[254px] mx-auto border border-[#f6f6f6]">
      <p className="text-lg text-gray-700 mb-4">{message}</p>

      <div className="flex items-center gap-4">
        <img
          src={profilePic}
          alt={name}
          className="w-14 h-14 rounded-full object-cover"
        />

        <div className="flex flex-col text-left">
          <span className="font-semibold text-gray-900">{name}</span>
          <span className="text-sm text-gray-500">{portfolio}</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
