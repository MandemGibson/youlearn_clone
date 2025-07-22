import { BsDiscord } from "react-icons/bs";

const footerLinks = [
  { id: 1, name: "Blogs", link: "blogs" },
  { id: 2, name: "Invite & Earn", link: "affiliate" },
  { id: 3, name: "Careers", link: "careers" },
  { id: 4, name: "Terms & Conditions", link: "terms-and-condition" },
  { id: 5, name: "Privacy Policy", link: "privacy-policy" },
  { id: 6, name: "Contact Us", link: "contact" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <section className="px-[20px]">
      <div
        className="flex flex-col md:flex-row md:justify-between items-center
       py-[20px] gap-[20px] text-[16px] text-[#6d6d6d]"
      >
        <h2>&copy; Copyright {year} uLearn Inc.</h2>
        <ul className="flex flex-wrap gap-[20px] items-center justify-center">
          {footerLinks.map(({ id, name, link }) => (
            <li
              key={id}
              className=" transition ease-in delay-75 hover:text-[#121212]"
            >
              <a href={link}>{name}</a>
            </li>
          ))}
          <li>
            <a href="https://discord.gg/@gibby_phil" target="_blank">
              <BsDiscord size={24} color="#121212" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Footer;
