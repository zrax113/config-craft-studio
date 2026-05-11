import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings, setSetting, playSound } from "@/lib/settings";
import { Sparkles, Volume2, Save, WrapText, Palette, ShieldCheck } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const ROWS: {
  key: keyof ReturnType<typeof useSettings>;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "animations", label: "Motion & animations", hint: "Disable for a calmer UI or low-end devices.", icon: Sparkles },
  { key: "sounds", label: "Sound effects", hint: "Tiny clicks for copy / save / errors.", icon: Volume2 },
  { key: "autosave", label: "Auto-save to browser", hint: "Restore your last config on reload.", icon: Save },
  { key: "liveValidation", label: "Live validation", hint: "Highlight schema issues as you type.", icon: ShieldCheck },
  { key: "compactToolbar", label: "Compact color toolbar", hint: "Show the MiniMessage picker on demand.", icon: Palette },
  { key: "lineWrap", label: "Wrap long lines in editor", hint: "Soft-wrap instead of horizontal scroll.", icon: WrapText },
];

export function SettingsDialog({ open, onOpenChange }: Props) {
  const settings = useSettings();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Tune the studio to taste. Everything is saved locally.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-1">
          {ROWS.map(({ key, label, hint, icon: Icon }) => (
            <label
              key={key}
              className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <Icon className="size-4 mt-0.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <Label className="text-sm font-medium cursor-pointer">{label}</Label>
                <p className="text-[11px] text-muted-foreground">{hint}</p>
              </div>
              <Switch
                checked={Boolean(settings[key])}
                onCheckedChange={(v) => {
                  setSetting(key as any, v as any);
                  playSound(v ? "ok" : "click");
                }}
              />
            </label>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground/70 px-3 pt-2 border-t border-border/40">
          Tip: press <kbd className="font-mono bg-muted px-1 rounded">?</kbd> anywhere to open the tutorial.
        </div>
      </DialogContent>
    </Dialog>
  );
}
