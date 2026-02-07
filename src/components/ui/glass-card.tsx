import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/70 p-6 shadow-sm backdrop-blur-xl",
        hover && "transition-all duration-200 hover:shadow-md hover:bg-white/80",
        className
      )}
    >
      {children}
    </div>
  );
}
