import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

/** Banner discreto que mostra estado offline / reconexão. */
export function ConnectionIndicator() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 2500);
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online && !showReconnected) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] rounded-full px-4 py-2 text-xs font-medium shadow-lg flex items-center gap-2 border",
        online
          ? "bg-success/10 border-success/30 text-success"
          : "bg-destructive/10 border-destructive/30 text-destructive",
      )}
      role="status"
    >
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {online ? "Conexão restabelecida" : "Sem conexão — alterações podem falhar"}
    </div>
  );
}
