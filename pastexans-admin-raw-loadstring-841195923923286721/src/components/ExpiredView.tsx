import { Icon } from "./Icon";

interface ExpiredViewProps {
  message?: string;
  subMessage?: string;
  code?: string;
}

export const ExpiredView = ({
  message = "SCRIPT EXPIRED",
  subMessage = "This payload has reached its expiration time and has been permanently deactivated by the protocol.",
  code = "TIMEOUT_REACHED"
}: ExpiredViewProps) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center animate-fade-in">
    <div className="w-24 h-24 bg-destructive/20 rounded-full flex items-center justify-center border border-destructive/30 mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
      <Icon name="clock-8" size={48} className="text-destructive" />
    </div>
    <h2 className="text-3xl font-bold text-foreground mb-3 font-display">{message}</h2>
    <p className="text-muted-foreground max-w-md mb-8">{subMessage}</p>
    <div className="px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive font-mono text-xs">
      ERROR_CODE: {code}
    </div>
  </div>
);
