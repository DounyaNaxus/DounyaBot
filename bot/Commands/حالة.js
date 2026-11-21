const os = require("os");

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${days}d , ${hours}h , ${minutes}m , ${remainingSeconds}s`;
}

module.exports = {
  name: "حالة",

  async execute(api, event) {
    const threadID = String(event.threadID);
    const requestedAt = new Intl.DateTimeFormat("ar-EG", {
      timeZone: "Africa/Cairo",
      dateStyle: "full",
    }).format(new Date());
    const uptime = formatDuration(process.uptime());

    const accountID =
      typeof api.getCurrentUserID === "function"
        ? String(api.getCurrentUserID() || "غير متاح")
        : "غير متاح";

    const mem = process.memoryUsage();
    const MB = 1024 * 1024;
    const ramUsed = Math.round(mem.rss / MB);
    const totalRam = Math.round(os.totalmem() / MB);
    const ramTotal = Math.round(totalRam / 1024);
    const ramUsedGb = (ramUsed / 1024).toFixed(2);
    const ramTotalGb = (totalRam / 1024).toFixed(2);

    const message = [
      "▂▃▄▅▆▇█▓▒░ 𝐃𝐎𝐔𝐍𝐈𝐀 𝗤𝗨𝗘𝗘𝗡 ༐ 𝆺𝅥 𝐃𝐈𝐕𝐀 ░▒▓█▇▆▅▄▃▂",
      "╏ [👑] 𝑩𝒐𝒕 𝑺𝒕𝒂𝒕𝒖𝒔 : 🟢 𝑨𝑪𝑻𝑰𝑽𝑬 ╏",
      "╏ [🔌] 𝑪𝒐𝒏𝒏𝒆𝒄𝒕𝒊𝒐𝒏 : 🟢 𝑶𝑵𝑳𝑰𝑵𝑬 ╏",
      `╏ [⏱️] 𝑼𝒑𝒕𝒊𝒎𝒆 : ${uptime} ╏`,
      "╏ [📡] 𝑺𝒆𝒓𝒗𝒊𝒄𝒆 : 𝑭𝒂𝒄𝒆𝒃𝒐𝒐𝒌 𝑴𝒆𝒔𝒔𝒆𝒏𝒈𝒆𝒓 ╏",
      `╏ [🕒] 𝑹𝒆𝒒𝒖𝒆𝒔𝒕 𝑻𝒊𝒎𝒆 : ${requestedAt} ╏`,
      "╏ [🛑] 𝑺𝒚𝒔𝒕𝒆𝒎 : 𝑵𝑶𝑿𝑰𝑨𝑵 𝑬𝑴𝑷𝑰𝑹𝑬 ╏",
      "╏ [🦋] 𝑶𝒘𝒏𝒆𝒓 : 𝐃𝐎𝐔𝐍𝐈𝐀 𝗤𝗨𝗘𝗘𝗡 ╏",
      `╏ [🆔] 𝑨𝒄𝒄𝒐𝒖𝒏𝒕 𝑰𝑫 : ${accountID} ╏`,
      "╏ [📶] 𝑷𝒊𝒏𝒈 : 11ms ╏",
      `╏ [🧠] 𝑹𝑨𝑴 𝑼𝒔𝒆𝒅 : ${ramUsedGb} GB ╏`,
      `╏ [💾] 𝑺𝒚𝒔𝒕𝒆𝒎 𝑹𝑨𝑴 : ${ramTotalGb} GB ╏`,
      "▰▱▰▱▰▱▰▱▰▱▰▱▰▱",
      "༺♌︎ 𝐃𝐎𝐔𝐍𝐈𝐀 𝗤𝗨𝗘𝗘𝗡 ༐ 𝆺𝅥 𝐃𝐈𝐕𝐀 ♌︎༻",
      "𓆩 👑 𝑻𝑯𝑬 𝑵𝑶𝑿𝑰𝑨𝑵 𝑬𝑴𝑷𝑹𝑬𝑺𝑺 👑 𓆪",
      "ᨏᨐᨓ 𝑪𝑶𝑺𝑴𝑰𝑪 𝑸𝑼𝑬𝑬𝑵 ᨓᨐᨏ",
    ].join("\n");

    await api.sendMessage(message, threadID);
  },
};
