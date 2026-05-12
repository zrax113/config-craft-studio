import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const FileSchema = z.object({
  path: z.string().min(1).max(512),
  contents: z.string().max(2_000_000),
});

const InputSchema = z.object({
  host: z.string().min(1).max(253),
  port: z.number().int().min(1).max(65535).default(22),
  username: z.string().min(1).max(128),
  password: z.string().max(4096).optional(),
  privateKey: z.string().max(20_000).optional(),
  passphrase: z.string().max(1024).optional(),
  remoteDir: z.string().min(1).max(1024),
  files: z.array(FileSchema).min(1).max(100),
});

export const sftpUpload = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    let SftpClient: any;
    try {
      // Dynamic import — ssh2 native deps may be missing in some runtimes
      SftpClient = (await import("ssh2-sftp-client")).default;
    } catch (e: any) {
      return {
        ok: false as const,
        error:
          "SFTP module unavailable on this server runtime. Deploy to a Node.js host (Netlify Functions / Node, Render, Railway) instead of edge Workers.",
      };
    }

    const sftp = new SftpClient();
    const uploaded: string[] = [];
    try {
      await sftp.connect({
        host: data.host,
        port: data.port,
        username: data.username,
        ...(data.password ? { password: data.password } : {}),
        ...(data.privateKey ? { privateKey: data.privateKey } : {}),
        ...(data.passphrase ? { passphrase: data.passphrase } : {}),
        readyTimeout: 15000,
      });

      // Ensure remote dir exists
      const dir = data.remoteDir.replace(/\/+$/, "") || "/";
      try {
        const exists = await sftp.exists(dir);
        if (!exists) await sftp.mkdir(dir, true);
      } catch {
        await sftp.mkdir(dir, true).catch(() => {});
      }

      for (const f of data.files) {
        const safeName = f.path.replace(/\.\.+/g, ".").replace(/^\/+/, "");
        const remote = `${dir}/${safeName}`;
        const subdir = remote.substring(0, remote.lastIndexOf("/"));
        if (subdir && subdir !== dir) {
          await sftp.mkdir(subdir, true).catch(() => {});
        }
        await sftp.put(Buffer.from(f.contents, "utf8"), remote);
        uploaded.push(remote);
      }

      return { ok: true as const, uploaded };
    } catch (e: any) {
      return {
        ok: false as const,
        error: e?.message ? String(e.message) : "SFTP upload failed",
      };
    } finally {
      try {
        await sftp.end();
      } catch {}
    }
  });
