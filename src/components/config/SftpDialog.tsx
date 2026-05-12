import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sftpUpload } from "@/lib/sftp.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Server, Save, Trash2, Download, Terminal } from "lucide-react";
import { buildSftpScript } from "@/lib/auto-fix";

export type SftpFile = { path: string; contents: string };

type Profile = {
  name: string;
  host: string;
  port: number;
  username: string;
  remoteDir: string;
  authType: "password" | "key";
  // We don't persist password/key by default — only host metadata.
};

const PROFILES_KEY = "forgeyaml.sftp.profiles";
const LAST_KEY = "forgeyaml.sftp.last";

function loadProfiles(): Profile[] {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function SftpDialog({
  open,
  onOpenChange,
  files,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  files: SftpFile[];
}) {
  const upload = useServerFn(sftpUpload);
  const [busy, setBusy] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [host, setHost] = useState("");
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState("");
  const [remoteDir, setRemoteDir] = useState("/plugins");
  const [authType, setAuthType] = useState<"password" | "key">("password");
  const [password, setPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (!open) return;
    setProfiles(loadProfiles());
    try {
      const last = JSON.parse(localStorage.getItem(LAST_KEY) ?? "{}");
      if (last.host) {
        setHost(last.host);
        setPort(last.port ?? 22);
        setUsername(last.username ?? "");
        setRemoteDir(last.remoteDir ?? "/plugins");
        setAuthType(last.authType ?? "password");
      }
    } catch {}
  }, [open]);

  const applyProfile = (p: Profile) => {
    setHost(p.host);
    setPort(p.port);
    setUsername(p.username);
    setRemoteDir(p.remoteDir);
    setAuthType(p.authType);
    setProfileName(p.name);
  };

  const saveProfile = () => {
    const name = profileName.trim() || `${username}@${host}`;
    const next = [
      ...profiles.filter((p) => p.name !== name),
      { name, host, port, username, remoteDir, authType },
    ];
    setProfiles(next);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
    toast.success(`Saved profile "${name}"`);
  };

  const deleteProfile = (name: string) => {
    const next = profiles.filter((p) => p.name !== name);
    setProfiles(next);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(next));
  };

  const handleUpload = async () => {
    if (!host || !username || !remoteDir) {
      toast.error("Host, username and remote dir are required");
      return;
    }
    if (authType === "password" && !password) {
      toast.error("Password is required");
      return;
    }
    if (authType === "key" && !privateKey) {
      toast.error("Private key is required");
      return;
    }
    setBusy(true);
    try {
      localStorage.setItem(
        LAST_KEY,
        JSON.stringify({ host, port, username, remoteDir, authType }),
      );
      const res = await upload({
        data: {
          host,
          port,
          username,
          remoteDir,
          ...(authType === "password"
            ? { password }
            : { privateKey, ...(passphrase ? { passphrase } : {}) }),
          files,
        },
      });
      if (res.ok) {
        toast.success(`Uploaded ${res.uploaded.length} file(s) via SFTP`, {
          description: res.uploaded.slice(0, 3).join("\n"),
        });
        onOpenChange(false);
      } else {
        toast.error("SFTP upload failed", { description: res.error });
      }
    } catch (e: any) {
      toast.error("SFTP error", { description: e?.message ?? String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="size-4 text-primary" /> Export via SFTP
          </DialogTitle>
          <DialogDescription>
            Upload {files.length} file{files.length === 1 ? "" : "s"} directly to your server.
            Credentials are sent only to your project's server, never persisted.
          </DialogDescription>
        </DialogHeader>

        {profiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 -mt-2">
            {profiles.map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center gap-1 text-[11px] bg-muted/50 border border-border/60 rounded-md pl-2 pr-1 py-0.5"
              >
                <button onClick={() => applyProfile(p)} className="hover:text-primary">
                  {p.name}
                </button>
                <button
                  onClick={() => deleteProfile(p.name)}
                  className="opacity-50 hover:opacity-100 hover:text-destructive"
                  aria-label="Delete profile"
                >
                  <Trash2 className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-1">
            <Label htmlFor="sftp-host" className="text-xs">Host</Label>
            <Input id="sftp-host" value={host} onChange={(e) => setHost(e.target.value)} placeholder="sftp.example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sftp-port" className="text-xs">Port</Label>
            <Input id="sftp-port" type="number" value={port} onChange={(e) => setPort(Number(e.target.value) || 22)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor="sftp-user" className="text-xs">Username</Label>
            <Input id="sftp-user" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
          </div>
          <div className="col-span-3 space-y-1">
            <Label htmlFor="sftp-dir" className="text-xs">Remote directory</Label>
            <Input id="sftp-dir" value={remoteDir} onChange={(e) => setRemoteDir(e.target.value)} placeholder="/home/minecraft/plugins/EssentialsX" />
          </div>
        </div>

        <Tabs value={authType} onValueChange={(v) => setAuthType(v as any)}>
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="password" className="text-xs">Password</TabsTrigger>
            <TabsTrigger value="key" className="text-xs">Private key</TabsTrigger>
          </TabsList>
          <TabsContent value="password" className="mt-2">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
            />
          </TabsContent>
          <TabsContent value="key" className="mt-2 space-y-2">
            <Textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;…"
              className="font-mono text-[11px] h-24"
            />
            <Input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Key passphrase (optional)"
              autoComplete="new-password"
            />
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-2">
          <Input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Profile name (optional)"
            className="h-8 text-xs"
          />
          <Button variant="outline" size="sm" onClick={saveProfile} className="h-8 gap-1.5">
            <Save className="size-3.5" /> Save
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Server className="size-4" />}
            {busy ? "Uploading…" : `Upload ${files.length} file${files.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
