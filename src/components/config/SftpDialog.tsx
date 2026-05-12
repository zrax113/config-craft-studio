import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sftpUpload, sftpTestConnection, sftpListDirectory, type RemoteItem } from "@/lib/sftp.functions";
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
import { CheckCircle2, FileText, Folder, FolderOpen, Loader2, Server, Save, Trash2, Download, Terminal, ChevronRight, ChevronLeft } from "lucide-react";
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
  const testConnection = useServerFn(sftpTestConnection);
  const listDirectory = useServerFn(sftpListDirectory);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [browsing, setBrowsing] = useState(false);
  const [browsingPath, setBrowsingPath] = useState("/");
  const [remoteItems, setRemoteItems] = useState<RemoteItem[]>([]);
  const [browsingError, setBrowsingError] = useState<string | null>(null);
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

const normalizedRemoteDir = useMemo(() => {
  const trimmed = remoteDir.trim().replace(/\/+$/, "");
  return trimmed.length === 0 ? "/" : trimmed;
}, [remoteDir]);

  const previewFiles = useMemo(() => {
    const prefix = normalizedRemoteDir === "/" ? "/" : `${normalizedRemoteDir}/`;
    return files.map((file) => {
      const safePath = file.path.replace(/^\/+/, "");
      const size = new Blob([file.contents]).size;
      return {
        path: file.path,
        remote: `${prefix}${safePath}`,
        size,
      };
    });
  }, [files, normalizedRemoteDir]);

  const totalBytes = useMemo(
    () => previewFiles.reduce((sum, f) => sum + f.size, 0),
    [previewFiles],
  );

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

  useEffect(() => {
    setTestStatus(null);
    setTestError(null);
  }, [host, port, username, password, privateKey, passphrase, authType]);

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

  const handleTestConnection = async () => {
    if (!host || !username) {
      toast.error("Host and username are required");
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

    setTesting(true);
    setTestStatus(null);
    setTestError(null);

    try {
      const res = await testConnection({
        data: {
          host,
          port,
          username,
          ...(authType === "password"
            ? { password }
            : { privateKey, ...(passphrase ? { passphrase } : {}) }),
        },
      });

      if (res.ok) {
        setTestStatus(`Connection successful to ${host}:${port}`);
        toast.success("SFTP connection verified");
      } else {
        setTestError(res.error);
        toast.error("Connection failed", { description: res.error });
      }
    } catch (e: any) {
      setTestError(e?.message ?? String(e));
      toast.error("Connection failed", { description: e?.message ?? String(e) });
    } finally {
      setTesting(false);
    }
  };

  const browseFolders = async (path: string = "/") => {
    if (!host || !username) {
      toast.error("Host and username are required");
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

    setBrowsing(true);
    setBrowsingError(null);

    try {
      const res = await listDirectory({
        data: {
          host,
          port,
          username,
          ...(authType === "password"
            ? { password }
            : { privateKey, ...(passphrase ? { passphrase } : {}) }),
          remotePath: path,
        },
      });

      if (res.ok) {
        setBrowsingPath(res.path);
        setRemoteItems(res.items);
        toast.success(`Browsing: ${res.path}`);
      } else {
        setBrowsingError(res.error);
        toast.error("Failed to browse folder", { description: res.error });
      }
    } catch (e: any) {
      setBrowsingError(e?.message ?? String(e));
      toast.error("Browse failed", { description: e?.message ?? String(e) });
    } finally {
      setBrowsing(false);
    }
  };

  const selectFolder = (path: string) => {
    setRemoteDir(path);
    setRemoteItems([]);
    setBrowsingPath("/");
    toast.success(`Selected: ${path}`);
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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

        <div className="rounded-lg border border-border/70 bg-card p-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Server className="size-4 text-primary" />
              <span>Upload Destination</span>
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
              {files.length} file{files.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Folder Browser */}
          {remoteItems.length > 0 && (
            <div className="rounded-lg border border-border/70 bg-card p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FolderOpen className="size-4 text-primary" />
                  <span>Browse Remote Folders</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  {browsingPath}
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto rounded-md border border-border/60 bg-background divide-y divide-border/40">
                {/* Navigate up */}
                {browsingPath !== "/" && (
                  <button
                    onClick={() => {
                      const parent = browsingPath.split("/").slice(0, -1).join("/") || "/";
                      browseFolders(parent);
                    }}
                    className="w-full flex items-center gap-2 p-2 text-sm hover:bg-muted/40 transition-colors text-muted-foreground"
                  >
                    <ChevronLeft className="size-4" />
                    <span>.. (parent folder)</span>
                  </button>
                )}

                {/* List folders */}
                {remoteItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => item.isDirectory ? browseFolders(item.path) : null}
                    className={`w-full flex items-center justify-between gap-2 p-2 text-sm transition-colors ${
                      item.isDirectory
                        ? "hover:bg-muted/40 cursor-pointer text-foreground"
                        : "text-muted-foreground/60 cursor-default"
                    }`}
                    disabled={!item.isDirectory}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.isDirectory ? (
                        <Folder className="size-4 text-primary shrink-0" />
                      ) : (
                        <FileText className="size-4 text-muted-foreground/60 shrink-0" />
                      )}
                      <span className="truncate font-medium">{item.name}</span>
                    </div>
                    {item.isDirectory && (
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Select current folder */}
              <Button
                onClick={() => selectFolder(browsingPath)}
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
              >
                <FolderOpen className="size-3.5" /> Select {browsingPath}
              </Button>
            </div>
          )}

          {/* Server path hierarchy */}
          <div className="rounded-md bg-muted/40 p-3 space-y-2 border border-border/60">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Target Path</div>
            <div className="text-sm font-mono bg-background rounded px-2 py-1 text-foreground break-all">
              {normalizedRemoteDir}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {normalizedRemoteDir.split("/").filter(Boolean).map((segment, i, arr) => {
                const path = "/" + arr.slice(0, i + 1).join("/");
                return (
                  <div key={path} className="flex items-center gap-1 text-xs">
                    <Folder className="size-3.5 text-primary" />
                    <span className="font-medium text-muted-foreground">{segment}</span>
                    {i < arr.length - 1 && <span className="text-muted/60">/</span>}
                  </div>
                );
              })}
              {normalizedRemoteDir === "/" && (
                <span className="text-xs text-muted-foreground italic">root directory</span>
              )}
            </div>
          </div>

          {/* Files to upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Files to Upload</div>
              {totalBytes > 0 && (
                <div className="text-[10px] text-muted-foreground font-mono">
                  {totalBytes > 1024 ? (totalBytes / 1024).toFixed(1) + " KB" : totalBytes + " B"}
                </div>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto rounded-md border border-border/60 bg-background divide-y divide-border/40">
              {previewFiles.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground text-center">
                  No files selected
                </div>
              ) : (
                previewFiles.map((file, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 hover:bg-muted/40 transition-colors">
                    <FileText className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-xs font-medium truncate">{file.path}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate bg-muted/50 rounded px-1.5 py-0.5">
                        {file.remote}
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono shrink-0 pt-0.5">
                      {file.size > 1024 ? (file.size / 1024).toFixed(1) + " K" : file.size + " B"}
                    </div>
                  </div>
                ))
              )}
            </div>
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing || busy || browsing}
              className="h-8 gap-1.5"
            >
              {testing ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => browseFolders("/")}
              disabled={browsing || busy || testing}
              className="h-8 gap-1.5"
            >
              {browsing ? <Loader2 className="size-4 animate-spin" /> : <FolderOpen className="size-4" />}
              Browse
            </Button>
          </div>
        </div>

        {(testStatus || testError) && (
          <div className={`rounded-md border p-3 text-sm space-y-1 ${testError ? "border-destructive/50 bg-destructive/10" : "border-primary/50 bg-primary/10"}`}>
            <div className="flex items-center gap-2">
              {testError ? (
                <>
                  <div className="size-2 rounded-full bg-destructive shrink-0" />
                  <span className="font-semibold text-destructive">Connection Failed</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 text-primary shrink-0" />
                  <span className="font-semibold text-primary">Connection Verified</span>
                </>
              )}
            </div>
            <p className={`text-xs ${testError ? "text-destructive/80" : "text-primary/80"}`}>
              {testError || testStatus}
            </p>
          </div>
        )}

        <div className="rounded-md border border-border/50 bg-muted/30 p-2 text-[11px] text-muted-foreground leading-relaxed">
          <Terminal className="size-3 inline mr-1 -mt-0.5" />
          No backend? Use <strong>Download script</strong> — runs <code className="font-mono">sftp</code> locally
          and works on any static host (Vercel, GitHub Pages…).
        </div>

        <DialogFooter className="gap-2 sm:gap-2 flex-wrap">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy} className="order-2 sm:order-1">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (!host || !username || !remoteDir) {
                toast.error("Host, username, remote dir required");
                return;
              }
              const script = buildSftpScript({ host, port, username, remoteDir, files });
              const blob = new Blob([script], { type: "text/x-shellscript" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "upload.sh";
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Script downloaded", {
                description: "Run: chmod +x upload.sh && ./upload.sh",
              });
            }}
            className="gap-1.5 order-3 sm:order-2"
            disabled={busy}
          >
            <Download className="size-4" /> Script
          </Button>
          <Button onClick={handleUpload} disabled={busy} className="gap-1.5 order-1 sm:order-3 sm:ml-auto">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Server className="size-4" />}
            {busy ? "Uploading…" : `Upload ${files.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
