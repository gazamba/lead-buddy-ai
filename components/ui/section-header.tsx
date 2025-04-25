interface SectionHeaderProps {
  label: string;
  title: string;
  description: string;
}

export function SectionHeader({
  label,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="inline-block rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm dark:text-slate-100">
        {label}
      </div>
      <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
        {title}
      </h2>
      <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
        {description}
      </p>
    </div>
  );
}
