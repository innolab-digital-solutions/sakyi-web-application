type SocialButtonProps = {
  icon: React.ReactNode;
  href: string;
  /** Accessible name for the icon-only link. */
  label: string;
};

const SocialButton = ({ icon, href, label }: SocialButtonProps) => {
  return (
    <a
      target='_blank'
      rel='noopener noreferrer'
      href={href}
      aria-label={label}
      className='group hover:border-brand-light hover:bg-brand-light rounded-full border border-slate-300 bg-white p-3 shadow-sm transition-all duration-300 hover:text-white hover:shadow-md'
    >
      {icon}
    </a>
  );
};

export default SocialButton;
