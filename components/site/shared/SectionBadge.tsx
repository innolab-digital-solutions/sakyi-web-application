type SectionBadgeProps = {
  icon: React.ReactNode;
  text: string;
};

const SectionBadge = ({ icon, text }: SectionBadgeProps) => {
  return (
    <div className='inline-flex max-w-full min-w-0 items-center gap-2 rounded-full bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10 px-4 py-2 text-xs font-medium leading-relaxed text-[#35bec5] sm:text-sm'>
      {icon}
      <span className='min-w-0 wrap-break-word font-sans'>{text}</span>
    </div>
  );
};

export default SectionBadge;
