interface SocialButtonProps {
  icon: React.ReactNode;
  href: string;
}

const SocialButton = ({ icon, href }: SocialButtonProps) => {
  return (
    <a
      target="_blank"
      href={href}
      className="group rounded-full border border-slate-300 bg-white p-3 shadow-sm transition-all duration-300 hover:border-[#4bc4db] hover:bg-[#4bc4db] hover:text-white hover:shadow-md"
    >
      {icon}
    </a>
  );
};

export default SocialButton;
