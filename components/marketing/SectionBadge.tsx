type SectionBadgeProps = {
  icon: React.ReactNode;
  text: string;
};

const SectionBadge = ({ icon, text }: SectionBadgeProps) => {
  return (
    <div className='from-brand/10 to-brand-deep/10 text-brand inline-flex max-w-full min-w-0 items-center gap-2 rounded-full bg-linear-to-r px-4 py-2 text-xs leading-relaxed font-medium sm:text-sm'>
      {icon}
      <span className='min-w-0 font-sans wrap-break-word'>{text}</span>
    </div>
  );
};

export default SectionBadge;
