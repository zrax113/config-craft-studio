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

const SftpTestInputSchema = z.object({
  host: z.string().min(1).max(253),
  port: z.number().int().min(1).max(65535).default(22),
  username: z.string().min(1).max(128),
  password: z.string().max(4096).optional(),
  privateKey: z.string().max(20_000).optional(),
  passphrase: z.string().max(1024).optional(),
});

const SftpReadFileInputSchema = z.object({
  host: z.string().min(1).max(253),
  port: z.number().int().min(1).max(65535).default(22),
  username: z.string().min(1).max(128),
  password: z.string().max(4096).optional(),
  privateKey: z.string().max(20_000).optional(),
  passphrase: z.string().max(1024).optional(),
  remotePath: z.string().min(1).max(1024),
});

const SftpListInputSchema = z.object({
  host: z.string().min(1).max(253),
  port: z.number().int().min(1).max(65535).default(22),
  username: z.string().min(1).max(128),
  password: z.string().max(4096).optional(),
  privateKey: z.string().max(20_000).optional(),
  passphrase: z.string().max(1024).optional(),
  remotePath: z.string().max(1024).default("/"),
});

export type RemoteItem = {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifyTime: number;
};

function getSftpClientModule() {
  // Obscure the require to prevent static analysis bundling
  const mod = "ssh2-sftp-client";
  return import(mod);
}

export const sftpTestConnection = createServerFn({ method: "POST" })
  .inputValidator((data) => SftpTestInputSchema.parse(data))
  .handler(async ({ data }) => {
    let SftpClient: any;
    try {
      const mod = await getSftpClientModule();
      SftpClient = mod.default;
    } catch (e: any) {
      return {
        ok: false as const,
        error:
          "SFTP module unavailable on this server runtime. Deploy to a Node.js host (Netlify Functions / Node, Render, Railway) instead of edge Workers.",
      };
    }

    const sftp = new SftpClient();
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
      return { ok: true as const };
    } catch (e: any) {
      return {
        ok: false as const,
        error: e?.message ? String(e.message) : "SFTP connection failed",
      };
    } finally {
      try {
        await sftp.end();
      } catch (err) {
        // ignore cleanup errors
      }
    }
  });

export const sftpListDirectory = createServerFn({ method: "POST" })
  .inputValidator((data) => SftpListInputSchema.parse(data))
  .handler(async ({ data }) => {
    let SftpClient: any;
    try {
      const mod = await getSftpClientModule();
      SftpClient = mod.default;
    } catch (e: any) {
      return {
        ok: false as const,
        error:
          "SFTP module unavailable on this server runtime. Deploy to a Node.js host (Netlify Functions / Node, Render, Railway) instead of edge Workers.",
      };
    }

    const sftp = new SftpClient();
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

      const remotePath = data.remotePath.replace(/\/+$/, "") || "/";
      const list = await sftp.list(remotePath);

      const items: RemoteItem[] = list
        .filter((item: any) => item.name !== "." && item.name !== "..")
        .map((item: any) => ({
          name: item.name,
          path: `${remotePath === "/" ? "/" : remotePath + "/"}${item.name}`,
          isDirectory: item.type === "d",
          size: item.size || 0,
          modifyTime: item.modifyTime || 0,
        }))
        .sort((a: RemoteItem, b: RemoteItem) => {
          // Directories first
          if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
          }
          // Alphabetical
          return a.name.localeCompare(b.name);
        });

      return { ok: true as const, items, path: remotePath };
    } catch (e: any) {
      return {
        ok: false as const,
        error: e?.message ? String(e.message) : "Failed to list directory",
      };
    } finally {
      try {
        await sftp.end();
      } catch (err) {
        // ignore cleanup errors
      }
    }
  });

export const sftpReadFile = createServerFn({ method: "POST" })
  .inputValidator((data) => SftpReadFileInputSchema.parse(data))
  .handler(async ({ data }) => {
    let SftpClient: any;
    try {
      const mod = await getSftpClientModule();
      SftpClient = mod.default;
    } catch (e: any) {
      return {
        ok: false as const,
        error:
          "SFTP module unavailable on this server runtime. Deploy to a Node.js host (Netlify Functions / Node, Render, Railway) instead of edge Workers.",
      };
    }

    const sftp = new SftpClient();
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

      const remotePath = data.remotePath.trim();
      const buffer = await sftp.get(remotePath);
      const contents = Buffer.isBuffer(buffer) ? buffer.toString("utf8") : String(buffer);

      return { ok: true as const, contents };
    } catch (e: any) {
      return {
        ok: false as const,
        error: e?.message ? String(e.message) : "Failed to read remote file",
      };
    } finally {
      try {
        await sftp.end();
      } catch (err) {
        // ignore cleanup errors
      }
    }
  });

export const sftpUpload = createServerFn({ method: "POST" })
  .inputValidator((data) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    let SftpClient: any;
    try {
      const mod = await getSftpClientModule();
      SftpClient = mod.default;
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
      } catch (err) {
        await sftp.mkdir(dir, true).catch(() => {
          // ignore directory creation errors
        });
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
      } catch (err) {
        // ignore cleanup errors
      }
    }
  });
