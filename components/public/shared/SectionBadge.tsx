type SectionBadgeProps = {
  icon: React.ReactNode;
  text: string;
}

const SectionBadge = ({ icon, text }: SectionBadgeProps) => {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#35bec5]/10 to-[#0c96c4]/10 px-4 py-2 text-sm font-medium text-[#35bec5]"
      data-aos="slide-down"
      data-aos-delay="200"
      data-aos-duration="800"
      data-aos-easing="ease-out-back"
    >
      {icon}
      <span style={{ fontFamily: 'Inter, sans-serif' }}>{text}</span>
    </div>
  );
};

export default SectionBadge;
