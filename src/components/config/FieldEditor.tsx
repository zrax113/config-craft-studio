import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  path: string[];
  value: any;
  onChange: (path: string[], value: any) => void;
  depth?: number;
}

function humanize(key: string) {
  return key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function FieldEditor({ path, value, onChange, depth = 0 }: Props) {
  const key = path[path.length - 1] ?? "root";
  const label = humanize(key);
  // Long labels (e.g. DiscordChatChannelMinecraftToDiscordMessage) need their own row
  const isLongKey = label.length > 28;

  // Boolean → toggle
  if (typeof value === "boolean") {
    if (isLongKey) {
      // Stack: full-width label above, switch right-aligned beneath
      return (
        <div className="py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors space-y-1.5">
          <Label
            className="text-sm font-medium cursor-pointer block leading-snug break-words"
            title={key}
          >
            {label}
          </Label>
          <div className="flex justify-end">
            <Switch checked={value} onCheckedChange={(v) => onChange(path, v)} />
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors">
        <Label
          className="text-sm font-medium cursor-pointer flex-1 min-w-0 truncate"
          title={key}
        >
          {label}
        </Label>
        <Switch checked={value} onCheckedChange={(v) => onChange(path, v)} className="shrink-0" />
      </div>
    );
  }

  // Number
  if (typeof value === "number") {
    return (
      <div className="space-y-1.5 py-2 px-3 min-w-0">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider break-words" title={key}>
          {label}
        </Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(path, Number(e.target.value))}
          className="bg-input/60 border-border/60 w-full"
        />
      </div>
    );
  }

  // String
  if (typeof value === "string") {
    const isLong = value.length > 60 || value.includes("\n");
    return (
      <div className="space-y-1.5 py-2 px-3 min-w-0">
        <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider break-words" title={key}>
          {label}
        </Label>
        {isLong ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            rows={3}
            className="bg-input/60 border-border/60 font-mono text-sm w-full"
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => onChange(path, e.target.value)}
            className="bg-input/60 border-border/60 font-mono text-sm w-full"
          />
        )}
      </div>
    );
  }

  // Array of primitives → multi-line text
  if (Array.isArray(value)) {
    const allPrim = value.every((v) => typeof v !== "object");
    if (allPrim) {
      return (
        <div className="space-y-1.5 py-2 px-3 min-w-0">
          <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider break-words" title={key}>
            {label} <span className="text-muted-foreground/60 normal-case">· one per line</span>
          </Label>
          <Textarea
            value={value.join("\n")}
            onChange={(e) =>
              onChange(
                path,
                e.target.value.split("\n").map((s) => (isNaN(Number(s)) || s === "" ? s : Number(s))),
              )
            }
            rows={Math.min(8, Math.max(3, value.length))}
            className="bg-input/60 border-border/60 font-mono text-sm w-full"
          />
        </div>
      );
    }
    return (
      <Section label={label} rawKey={key} depth={depth}>
        {value.map((v, i) => (
          <FieldEditor key={i} path={[...path, String(i)]} value={v} onChange={onChange} depth={depth + 1} />
        ))}
      </Section>
    );
  }

  // Object
  if (value && typeof value === "object") {
    return (
      <Section label={label} rawKey={key} depth={depth}>
        {Object.entries(value).map(([k, v]) => (
          <FieldEditor key={k} path={[...path, k]} value={v} onChange={onChange} depth={depth + 1} />
        ))}
      </Section>
    );
  }

  // null/undefined
  return (
    <div className="space-y-1.5 py-2 px-3 min-w-0">
      <Label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider break-words" title={key}>
        {label}
      </Label>
      <Input
        value=""
        placeholder="(empty)"
        onChange={(e) => onChange(path, e.target.value)}
        className="bg-input/60 border-border/60 w-full"
      />
    </div>
  );
}

function Section({
  label,
  rawKey,
  depth,
  children,
}: {
  label: string;
  rawKey: string;
  depth: number;
  children: React.ReactNode;
}) {
  if (depth === 0) {
    return <div className="space-y-1 min-w-0">{children}</div>;
  }
  return (
    <details open={depth < 2} className="group rounded-xl border border-border/50 bg-muted/20 overflow-hidden min-w-0">
      <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-muted/40 transition-colors">
        <span className="font-display text-sm font-medium min-w-0 break-words" title={rawKey}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground transition-transform group-open:rotate-90 shrink-0">›</span>
      </summary>
      <div className="px-2 pb-2 pt-1 space-y-0.5 border-t border-border/50 min-w-0">{children}</div>
    </details>
  );
}
