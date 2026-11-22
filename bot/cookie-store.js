"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { validateAppState } = require("./session-store");

function makeKey(value) {
  if (!value) throw new Error("COOKIE_ENCRYPTION_KEY is required");
  // Accept a 64-character hex key, a base64 32-byte key, or a passphrase.
  if (/^[a-f0-9]{64}$/i.test(value)) return Buffer.from(value, "hex");
  const decoded = Buffer.from(value, "base64");
  if (decoded.length === 32 && decoded.toString("base64").replace(/=+$/, "") === value.replace(/=+$/, "")) return decoded;
  if (Buffer.byteLength(value, "utf8") < 32) throw new Error("COOKIE_ENCRYPTION_KEY must be at least 32 bytes");
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

function createCookieStore({ log, env = process.env, filePath = path.join(__dirname, "data", "cookie-accounts.json") } = {}) {
  const key = env.COOKIE_ENCRYPTION_KEY ? makeKey(env.COOKIE_ENCRYPTION_KEY) : null;
  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/+$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || "";
  const useSupabase = Boolean(key && supabaseUrl && serviceKey);
  let localQueue = Promise.resolve();

  function encrypt(value) {
    if (!key) throw new Error("cookie_encryption_not_configured");
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
    return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), encrypted.toString("base64")].join(".");
  }

  function decrypt(value) {
    if (!key) throw new Error("cookie_encryption_not_configured");
    const [version, ivText, tagText, dataText] = String(value).split(".");
    if (version !== "v1" || !ivText || !tagText || !dataText) throw new Error("invalid_ciphertext");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64"));
    decipher.setAuthTag(Buffer.from(tagText, "base64"));
    const plain = Buffer.concat([decipher.update(Buffer.from(dataText, "base64")), decipher.final()]).toString("utf8");
    return JSON.parse(plain);
  }

  function publicAccount(row) {
    return {
      id: row.id,
      name: row.name,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async function request(pathname, options = {}) {
    const response = await fetch(`${supabaseUrl}/rest/v1/${pathname}`, {
      ...options,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: options.prefer || "return=representation",
        ...(options.headers || {}),
      },
    });
    const body = await response.text();
    if (!response.ok) {
      const error = new Error(`supabase_${response.status}: ${body.slice(0, 300)}`);
      error.status = response.status;
      throw error;
    }
    return body ? JSON.parse(body) : [];
  }

  async function readLocal() {
    try {
      const raw = await fs.promises.readFile(filePath, "utf8");
      const rows = JSON.parse(raw);
      if (!Array.isArray(rows)) throw new Error("invalid_local_store");
      return rows;
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  async function writeLocal(rows) {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
    const temp = `${filePath}.${process.pid}.tmp`;
    await fs.promises.writeFile(temp, JSON.stringify(rows, null, 2), { mode: 0o600 });
    await fs.promises.rename(temp, filePath);
    await fs.promises.chmod(filePath, 0o600).catch(() => {});
  }

  function localUpdate(mutator) {
    const operation = localQueue.then(async () => {
      const rows = await readLocal();
      const result = await mutator(rows);
      await writeLocal(rows);
      return result;
    });
    localQueue = operation.catch(() => {});
    return operation;
  }

  async function allRows() {
    if (useSupabase) return request("cookie_accounts?select=id,name,cookies_encrypted,cookies_hash,status,created_at,updated_at&order=created_at.desc");
    return readLocal();
  }

  async function listAccounts() {
    return (await allRows()).map(publicAccount);
  }

  async function getActiveCookies() {
    if (!key) return null;
    const rows = await allRows();
    const active = rows.find((row) => row.status === "active");
    return active ? decrypt(active.cookies_encrypted) : null;
  }

  function validate(name, cookies) {
    if (!key) throw new Error("cookie_encryption_not_configured");
    const cleanName = String(name || "").trim().slice(0, 80);
    if (!cleanName) throw new Error("name_required");
    const check = validateAppState(cookies);
    if (!check.ok) throw new Error(check.reason);
    return { cleanName, hash: crypto.createHash("sha256").update(JSON.stringify(cookies)).digest("hex") };
  }

  async function createAccount(name, cookies) {
    const { cleanName, hash } = validate(name, cookies);
    const row = {
      id: crypto.randomUUID(), name: cleanName, cookies_encrypted: encrypt(cookies), cookies_hash: hash,
      status: "stopped", created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    if (useSupabase) {
      const rows = await request("cookie_accounts", { method: "POST", body: JSON.stringify({ name: row.name, cookies_encrypted: row.cookies_encrypted, cookies_hash: row.cookies_hash, status: row.status }) });
      return publicAccount(rows[0]);
    }
    await localUpdate((rows) => rows.push(row));
    return publicAccount(row);
  }

  async function updateAccount(id, changes) {
    const rows = await allRows();
    const current = rows.find((row) => row.id === id);
    if (!current) throw new Error("account_not_found");
    const name = changes.name === undefined ? current.name : String(changes.name).trim().slice(0, 80);
    if (!name) throw new Error("name_required");
    let encrypted = current.cookies_encrypted;
    let hash = current.cookies_hash;
    if (changes.cookies !== undefined) {
      const checked = validate(name, changes.cookies);
      encrypted = encrypt(changes.cookies);
      hash = checked.hash;
    }
    const patch = { name, cookies_encrypted: encrypted, cookies_hash: hash, updated_at: new Date().toISOString() };
    if (useSupabase) {
      const updated = await request(`cookie_accounts?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
      if (!updated.length) throw new Error("account_not_found");
      return publicAccount(updated[0]);
    }
    await localUpdate((items) => {
      const row = items.find((item) => item.id === id);
      if (!row) throw new Error("account_not_found");
      Object.assign(row, patch);
    });
    return publicAccount({ ...current, ...patch });
  }

  async function setStatus(id, status) {
    if (!["active", "stopped", "needs_update"].includes(status)) throw new Error("invalid_status");
    if (useSupabase) {
      if (status === "active") await request("cookie_accounts?status=eq.active", { method: "PATCH", body: JSON.stringify({ status: "stopped", updated_at: new Date().toISOString() }) });
      const updated = await request(`cookie_accounts?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status, updated_at: new Date().toISOString() }) });
      if (!updated.length) throw new Error("account_not_found");
      return publicAccount(updated[0]);
    }
    return localUpdate((rows) => {
      const row = rows.find((item) => item.id === id);
      if (!row) throw new Error("account_not_found");
      if (status === "active") rows.forEach((item) => { if (item.status === "active") item.status = "stopped"; });
      row.status = status;
      row.updated_at = new Date().toISOString();
      return publicAccount(row);
    });
  }

  async function deleteAccount(id) {
    if (useSupabase) {
      await request(`cookie_accounts?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", prefer: "return=minimal" });
      return true;
    }
    return localUpdate((rows) => {
      const index = rows.findIndex((row) => row.id === id);
      if (index < 0) throw new Error("account_not_found");
      rows.splice(index, 1);
      return true;
    });
  }

  if (!key && log) log.warn("cookie-store", "COOKIE_ENCRYPTION_KEY is missing; cookie manager storage is disabled until configured");
  else if (!useSupabase && log) log.warn("cookie-store", "Supabase credentials missing; encrypted local fallback is active and may not survive Railway redeploys");

  return { listAccounts, getActiveCookies, createAccount, updateAccount, setStatus, deleteAccount, storage: !key ? "unconfigured" : useSupabase ? "supabase" : "local" };
}

module.exports = { createCookieStore };
