"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createCookieStore } = require("./cookie-store");

const MAX_BODY = 2 * 1024 * 1024;

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(new Error("body_too_large")); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); }
      catch { reject(new Error("invalid_json")); }
    });
    req.on("error", reject);
  });
}

function safeEqual(a, b) {
  const left = crypto.createHash("sha256").update(String(a)).digest();
  const right = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(left, right);
}

function createCookiePanel({ log, onAccountChange, env = process.env } = {}) {
  const password = String(env.COOKIE_PANEL_PASSWORD || "");
  const cookieStore = createCookieStore({ log, env });
  const sessions = new Map();
  const attempts = new Map();
  const htmlPath = path.join(__dirname, "cookie-panel.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const sessionTtl = 30 * 60 * 1000;

  function getIp(req) { return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim(); }
  function sessionFrom(req) {
    const cookies = String(req.headers.cookie || "").split(";").map((part) => part.trim());
    const item = cookies.find((part) => part.startsWith("dounya_cookie_session="));
    if (!item) return null;
    const token = decodeURIComponent(item.slice(item.indexOf("=") + 1));
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) { sessions.delete(token); return null; }
    session.expiresAt = Date.now() + sessionTtl;
    return token;
  }
  function setSessionCookie(req, res, token) {
    const secure = req.headers["x-forwarded-proto"] === "https" || req.socket.encrypted;
    res.setHeader("Set-Cookie", `dounya_cookie_session=${encodeURIComponent(token)}; Path=/admin/cookies; HttpOnly; SameSite=Strict; Max-Age=1800${secure ? "; Secure" : ""}`);
  }
  function clearSessionCookie(req, res) {
    const secure = req.headers["x-forwarded-proto"] === "https" || req.socket.encrypted;
    res.setHeader("Set-Cookie", `dounya_cookie_session=; Path=/admin/cookies; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`);
  }
  function authorized(req) { return Boolean(sessionFrom(req)); }
  function requirePassword() {
    if (password.length < 12) throw new Error("COOKIE_PANEL_PASSWORD must be set to at least 12 characters");
  }
  function validOrigin(req) {
    const origin = req.headers.origin;
    if (!origin) return true;
    try { return new URL(origin).host === String(req.headers.host || "").toLowerCase(); }
    catch { return false; }
  }

  async function route(req, res) {
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;
    if (pathname === "/admin/cookies" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin" });
      res.end(html);
      return true;
    }
    if (!pathname.startsWith("/admin/cookies/api/")) return null;

    if (req.method === "POST" && pathname === "/admin/cookies/api/login") {
      requirePassword();
      const ip = getIp(req);
      const record = attempts.get(ip) || { count: 0, blockedUntil: 0 };
      if (record.blockedUntil > Date.now()) return send(res, 429, { error: "too_many_attempts" });
      let body;
      try { body = await readJson(req); } catch (error) { return send(res, 400, { error: error.message }); }
      if (!safeEqual(body.password || "", password)) {
        record.count += 1;
        if (record.count >= 5) { record.blockedUntil = Date.now() + 15 * 60 * 1000; record.count = 0; }
        attempts.set(ip, record);
        return send(res, 401, { error: "invalid_password" });
      }
      attempts.delete(ip);
      const token = crypto.randomBytes(32).toString("hex");
      sessions.set(token, { expiresAt: Date.now() + sessionTtl });
      setSessionCookie(req, res, token);
      return send(res, 200, { ok: true, storage: cookieStore.storage });
    }

    if (req.method === "POST" && pathname === "/admin/cookies/api/logout") {
      const token = sessionFrom(req);
      if (token) sessions.delete(token);
      clearSessionCookie(req, res);
      return send(res, 200, { ok: true });
    }

    if (!authorized(req)) return send(res, 401, { error: "unauthorized" });
    if (!validOrigin(req)) return send(res, 403, { error: "bad_origin" });

    try {
      if (req.method === "GET" && pathname === "/admin/cookies/api/accounts") {
        return send(res, 200, { accounts: await cookieStore.listAccounts(), storage: cookieStore.storage });
      }
      if (req.method === "POST" && pathname === "/admin/cookies/api/accounts") {
        const body = await readJson(req);
        const account = await cookieStore.createAccount(body.name, body.cookies);
        return send(res, 201, { account });
      }
      const match = /^\/admin\/cookies\/api\/accounts\/([a-f0-9-]+)(?:\/(activate|stop))?$/.exec(pathname);
      if (match) {
        const id = match[1];
        const action = match[2];
        if (req.method === "PUT" && !action) {
          const body = await readJson(req);
          const before = (await cookieStore.listAccounts()).find((item) => item.id === id);
          const account = await cookieStore.updateAccount(id, body);
          if (before && before.status === "active" && body.cookies !== undefined && onAccountChange) await onAccountChange({ status: "active", account });
          return send(res, 200, { account });
        }
        if (req.method === "POST" && action) {
          const account = await cookieStore.setStatus(id, action === "activate" ? "active" : "stopped");
          if (action === "activate" && onAccountChange) await onAccountChange({ status: "active", account });
          if (action === "stop" && onAccountChange) await onAccountChange({ status: "stopped", account });
          return send(res, 200, { account });
        }
        if (req.method === "DELETE" && !action) {
          const before = (await cookieStore.listAccounts()).find((item) => item.id === id);
          await cookieStore.deleteAccount(id);
          if (before && before.status === "active" && onAccountChange) await onAccountChange({ status: "deleted", account: before });
          return send(res, 200, { ok: true });
        }
      }
      return send(res, 404, { error: "not_found" });
    } catch (error) {
      if (log) log.warn("cookie-panel", "فشل طلب إدارة الكوكيز", { message: error.message });
      const known = ["name_required", "account_not_found", "invalid_status", "body_too_large", "invalid_json", "cookie_encryption_not_configured"];
      return send(res, known.includes(error.message) ? 400 : 500, { error: error.message });
    }
  }

  return { route, cookieStore };
}

module.exports = { createCookiePanel };
