type FeatureListProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FeatureList = ({ icon, title, description }: FeatureListProps) => {
  return (
    <div className="group flex items-start space-x-3 rounded-lg p-3 transition-all duration-300">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-[#35bec5] to-[#0c96c4] text-white shadow-lg">
        {icon}
      </div>
      <div className="flex-1">
        <h3
          className="text-foreground mb-1 text-base font-semibold"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {title}
        </h3>
        <p
          className="text-foreground/80 text-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureList;
