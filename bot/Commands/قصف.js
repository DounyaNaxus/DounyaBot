const { getSharedNewspaperStore } = require("../newspaper-store");
const timingStore = require("../timing-store");

const SPAM_START = `🌆 𝆺𝅥⃝𝗕𝗢𝗥𝗡 𝗧𝗢 𝗥𝗨𝗟𝗘 ༐ ⦓🟣⦔ 𝑫𝑶𝑼𝑵𝒀𝑨 ┊ 𝐂𝐑⃘𝐔⃪𝐒𝐇͡𝐈͜𝐍𝐆͠ 𝐇̸⃫𝐔𝐌⃝𝐀𝐍𝐈꙰𝐓𝐘̅ 🌆〙 ┊

         ᅠᅠ⏤͟͟ ✠ 𝐍 𝐎 𝐗 𝐔 𝐒 ( ノクサス ) 𓆩𖢘𓆪 ( التشغيل )
         
         ⌯               .  ⦓🟣⦔  .              ⌯
ᅠᅠᅠᅠᅠᅠᅠᅠ 🌌 [ جَـــارِي بَـــدْءُ إِرْسَـــالِ الـجَـــرَائـــدِ ] 🌌
  ᅠᅠᅠᅠᅠᅠᅠᅠᅠ   ─⃝͎̽𝙈𖤌˖𝘼ɵ𝆭͜͡𝙃͎𝆭̽𝙊𝆭⃟ 𝙍𖤌˖𝘼ɵ𝆭͜͡𝙂͎𝆭̽𝘼𝆭⃟✬
 ᅠ   ⁽ ʿ ⧺   ᚜𝑫𝑶𝑼𝑵𝒀𝑨 ⃞⃟ ⟢ᚘ⟢ 𝐋̶ؗ𝐎̲҇͟𝐑͐𝐃 𝐆𝐀̶𝐋̶ؗ𝐀̸𐇽⃜𝐗𝐘̅ ⃞⃟ ᚛ ⧺`;

const SPAM_STOP = `🌆 𝆺𝅥⃝𝗕𝗢𝗥𝗡 𝗧𝗢 𝗥𝗨𝗟𝗘 ༐ ⦓🟣⦔ 𝑫𝑶𝑼𝑵𝒀𝑨 ┊ 𝐂𝐑⃘𝐔⃪𝐒𝐇͡𝐈͜𝐍𝐆͠ 𝐇̸⃫𝐔𝐌⃝𝐀𝐍𝐈꙰𝐓𝐘̅ 🌆〙 ┊

           ᅠᅠ⏤͟͟ ✠ 𝐍 𝐎 𝐗 𝐔 𝐒 ( ノクサス ) 𓆩𖢘𓆪 ( الإيقاف )

ᅠᅠᅠᅠᅠᅠᅠ 🌌 [ تـ٠ــمْ إيـ٠ــقـ٠ــاـ٠ــفْ الـ٠ــجـ٠ــرـ٠ــاـ٠ــئـ٠ــدـ٠ـــ ] 🌌
        ⌯               .  ⦓🟣⦔  .              ⌯
  ᅠᅠᅠᅠᅠᅠᅠᅠᅠ   ─⃝͎̽𝙈𖤌˖𝘼ɵ𝆭͜͡𝙃͎𝆭̽𝙊𝆭⃟ 𝙍𖤌˖𝘼ɵ𝆭͜͡𝙂͎𝆭̽𝘼𝆭⃟✬
 ᅠ  ⁽ ʿ ⧺   ᚜𝑫𝑶𝑼𝑵𝒀𝑨 ⃞⃟ ⟢ᚘ⟢ 𝐋̶ؗ𝐎̲҇͟𝐑͐𝐃 𝐆𝐀̶𝐋̶ؗ𝐀̸𐇽⃜𝐗𝐘̅ ⃞⃟ ᚛ ⧺`;

const NEWSPAPER_1 = `✦ 𝐀⃑͜𝐔⃕𝐓⃧͜𝐎͜ 𝐑⃑𝐄⃕𝐏⃧͜𝐋𝐘 ✦
⋯⌁➷ 𝑫𝑶𝗨𝑵𝑰𝑨 ⃞⃟ 𝑻𝑯𝑬 𝑸𝑼𝑬𝑬𝑵 𝑶𝑭 𝑵𝑶𝑿𝑼𝑺 ❞ ➷⌁⋯❪ 〄 ❫
⋟❪ 𝐍̶ؗ𝐎̲͟𝐗͐ᚘ𝐔𝐒̅ ⃞⃟ ❫ ‹ 𝖐̶𝖎̶𝖓̶𝖌̶𝖘̶ ›
✦꙰ ╠═══━━━───⃟꙰㊙️⃟꙰───━━━═══╣ ✦

⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
╰┈𝐈 𝘄𝗶⃥𝗹𝗹 𝗿𝘂𝗹𝗲 𝘁𝗵𝗲 𝘄𝗼𝗿𝗹𝗱 ♦
✦꙰ ╠═══━━━───⃟꙰🛑⃟꙰───━━━═══╣ ✦꙰
❪ 𝕯̶̴𝕬̶̴ℝ̶̴𝕶 𝕷̶̴𝕺̶̴ℝ̶̴𝔻 ❫  ⸸ 𝐒⃕𝐈᷄𝐍̶᤻𝐈𝐒𝐓𝐄𝐑
✦꙰ ╠═══━━━───⃟꙰👑⃟꙰───━━━═══╣ ✦꙰
﹣𝐃𝐈︪︩𝐕𝐀 𝐃𝐎𝐔𝐍𝐈𝐀 🛑🪽 ⋯ 𝐓̲͟𝐇̲͟𝐄̲ 𝐔̶𝐍̶𝐓̶𝐎̶𝐔̶𝐂̶𝐇̶𝐀̶𝐁̶𝐋̶𝐄 ∶

⏤͟͟ ✠ 𝐐 𝐔 𝐄 𝐄 𝐍 ( 女王 ) 𓆩𖢘 𓆪


👑∶꙰꙰꙰꙰꙰⃟⃟꙰⃟꙰⃟꙰𝐃 𝆺𝅥⃝𝗜𝗩𝗔 𝗗𝗢𝗨𝗡𝗜𝗔 ༐ ୨ৎ⃝ ˖ 🕸∶꙰꙰꙰꙰꙰⃟⃟꙰⃟꙰⃟꙰𝐃 𝆺𝅥⃝𝗕𝗢𝗥𝗡 𝗧𝗢 𝗥𝗨𝗟𝗘 🟥 𝗧𝗛𝗘 𝗨𝗡𝗧𝗢𝗨𝗖𝗛𝗔𝗕𝗟𝗘 𝗤𝗨𝗘𝗘𝗡 ┊ 
⧺ ᚜𝑻𝑯𝑬 𝑵𝑶𝑿𝑰𝑨𝑵 𝑬𝑴𝑷𝑹𝑬𝑺𝑺⟢ᚘ⟢𝑫𝑶𝑼𝑵𝒀𝑨 ⃞⃟  ⃞⃟ ᚛ ⧺
℘ꫀׁׅܻ𝐝𝐨𝐧𝐢𝐚 ⋮≬ 𝐃𝐎𝐍𝐈𝐀 𝄞 𖤐
✦. ⋆ ࣪ 𝕮𝑶𝑺𝑴𝑰𝑪 ❞
⋟ ❪ 𝐓⃕𝐡⃪𝐞 𝐃︭𝐫︭𝐞︭𝐚︭𝐦𝐞︭𝐫︭𝐬 ❫ ‹ 𝖘̶𝖙̶𝐚̶𝐫̶𝐬̶ › 𝆺𝅥⃝🕸
ْ￤⌯.❪ 𝑫𝒐𝒏𝒊𝒂 𝑪𝒐𝒔𝒎𝒊𝒄 𝑸𝒖𝒆𝒆𝒏 ❫.⌯￤

✦❨𝐃⃕͜𝐎᷄𝐍̊𝐈̶᤻ᝲ͜͡𝗔⚝𝐆͜͡𝐀𐇽⃜𝐋͜͡𝗔❩✦`;

const NEWSPAPER_2 = `✦ 𝐀⃑͜𝐔⃕𝐓⃧͜𝐎͜ 𝐑⃑𝐄⃕𝐏⃧͜𝐋𝐘 ✦
⋯⌁➷ 𝑫𝑶𝗨𝑵𝑰𝑨 ⃞⃟ 𝑻𝑯𝑬 𝑸𝑼𝑬𝑬𝑵 𝑶𝑭 𝑵𝑶𝑿𝑼𝑺 ❞ ➷⌁⋯❪ 〄 ❫
⋟❪ 𝐍̶ؗ𝐎̲͟𝐗͐ᚘ𝐔𝐒̅ ⃞⃟ ❫ ‹ 𝖐̶𝖎̶𝖓̶𝖌̶𝖘̶ ›
✦꙰ ╠═══━━━───⃟꙰㊙️⃟꙰───━━━═══╣ ✦

⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
⏤͟͟͞͞𒅃♌︎🛑υׁׅꩇׁׅ֪݊ 👑⏤͟͟͞͞𒅃♌︎
╰┈𝐈 𝘄𝗶⃥𝗹𝗹 𝗿𝘂𝗹𝗲 𝘁𝗵𝗲 𝘄𝗼𝗿𝗹𝗱 ♦
✦꙰ ╠═══━━━───⃟꙰🛑⃟꙰───━━━═══╣ ✦꙰
❪ 𝕯̶̴𝕬̶̴ℝ̶̴𝕶 𝕷̶̴𝕺̶̴ℝ̶̴𝔻 ❫  ⸸ 𝐒⃕𝐈᷄𝐍̶᤻𝐈𝐒𝐓𝐄𝐑
✦꙰ ╠═══━━━───⃟꙰👑⃟꙰───━━━═══╣ ✦꙰
﹣𝐃𝐈︪︩𝐕𝐀 𝐃𝐎𝐔𝐍𝐈𝐀 🛑🪽 ⋯ 𝐓̲͟𝐇̲͟𝐄̲ 𝐔̶𝐍̶𝐓̶𝐎̶𝐔̶𝐂̶𝐇̶𝐀̶𝐁̶𝐋̶𝐄 ∶

⏤͟͟ ✠ 𝐐 𝐔 𝐄 𝐄 𝐍 ( 女王 ) 𓆩𖢘 𓆪


👑∶꙰꙰꙰꙰꙰⃟⃟꙰⃟꙰⃟꙰𝐃 𝆺𝅥⃝𝗜𝗩𝗔 𝗗𝗢𝗨𝗡𝗜𝗔 ༐ ୨ৎ⃝ ˖ 🕸∶꙰꙰꙰꙰꙰⃟⃟꙰⃟꙰⃟꙰𝐃 𝆺𝅥⃝𝗕𝗢𝗥𝗡 𝗧𝗢 𝗥𝗨𝗟𝗘 🟥 𝗧𝗛𝗘 𝗨𝗡𝗧𝗢𝗨𝗖𝗛𝗔𝗕𝗟𝗘 𝗤𝗨𝗘𝗘𝗡 ┊ 
⧺ ᚜𝑻𝑯𝑬 𝑵𝑶𝑿𝑰𝑨𝑵 𝑬𝑴𝑷𝑹𝑬𝑺𝑺⟢ᚘ⟢𝑫𝑶𝑼𝑵𝒀𝑨 ⃞⃟  ⃞⃟ ᚛ ⧺
℘ꫀׁׅܻ𝐝𝐨𝐧𝐢𝐚 ⋮≬ 𝐃𝐎𝐍𝐈𝐀 𝄞 𖤐
✦. ⋆ ࣪ 𝕮𝑶𝑺𝑴𝑰𝑪 ❞
⋟ ❪ 𝐓⃕𝐡⃪𝐞 𝐃︭𝐫︭𝐞︭𝐚︭𝐦𝐞︭𝐫︭𝐬 ❫ ‹ 𝖘̶𝖙̶𝐚̶𝐫̶𝐬̶ › 𝆺𝅥⃝🕸
ْ￤⌯.❪ 𝑫𝒐𝒏𝒊𝒂 𝑪𝒐𝒔𝒎𝒊𝒄 𝑸𝒖𝒆𝒆𝒏 ❫.⌯￤

✦❨𝐃⃕͜𝐎᷄𝐍̊𝐈̶᤻ᝲ͜͡𝗔⚝𝐆͜͡𝐀𐇽⃜𝐋͜͡𝗔❩✦`;

// Cycle: 4 messages (1-3 use NEWSPAPER_1, 4 uses NEWSPAPER_2)
// Msg1: 20-22s, Msg2: 27-28s, Msg3: 31-33s, Msg4: 35s
function getDelayForCycle(index) {
  return timingStore.get("qasf");
}

function getDefaultTextForCycle(index) {
  const cycleIndex = index % 4;
  return cycleIndex === 3 ? NEWSPAPER_2 : NEWSPAPER_1;
}

const newspaperStore = getSharedNewspaperStore();

function createNewspaperTextProvider(store) {
  return {
    get(index) {
      return store.get() ?? getDefaultTextForCycle(index);
    },
    setNewspaperText(text) {
      return store.set(text);
    },
  };
}

const newspaperTextProvider = createNewspaperTextProvider(newspaperStore);

function getTextForCycle(index) {
  return newspaperTextProvider.get(index);
}

const activeLoops = new Map();
let _reqCounter = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// دالة مخصصة للكتابة — تُجبر is_group_thread=1 لأن ws3-fca يكشف الجروب بطول >= 16
// لكن جروباتنا 15 رقم فيُرسلها كـ private خطأً
async function sendTyping(api, threadID, isTyping) {
  try {
    const mqttClient = api.ctx && api.ctx.mqttClient;
    if (!mqttClient) {
      // fallback للدالة الأصلية
      await api.sendTypingIndicator(isTyping, threadID);
      return;
    }
    const wsContent = {
      app_id: 2220391788200892,
      payload: JSON.stringify({
        label: 3,
        payload: JSON.stringify({
          thread_key: String(threadID),
          is_group_thread: 1, // ← دائماً 1 لأننا نشتغل في جروبات
          is_typing: isTyping ? 1 : 0,
          attribution: 0,
        }),
        version: 5849951561777440,
      }),
      request_id: ++_reqCounter,
      type: 4,
    };
    await new Promise((resolve, reject) =>
      mqttClient.publish("/ls_req", JSON.stringify(wsContent), {}, (err) =>
        err ? reject(err) : resolve(),
      ),
    );
  } catch (e) {
    console.error(`[قصف] خطأ typing:`, e.message || e);
  }
}

async function spamLoop(api, threadID) {
  let cycleIndex = 0;
  while (activeLoops.get(threadID)) {
    try {
      const delay = getDelayForCycle(cycleIndex);

      // محاكاة الكتابة البشرية (3-6 ثواني)
      const typingTime = 3000 + Math.floor(Math.random() * 3000);
      await sendTyping(api, threadID, true);
      await sleep(typingTime);
      await sendTyping(api, threadID, false);

      const text = getTextForCycle(cycleIndex);
      await api.sendMessage(text, threadID);
      console.log(
        `[قصف] ✍️ جريدة #${cycleIndex + 1} (كتابة ${(typingTime / 1000).toFixed(1)}ث) | تأخير ${(delay / 1000).toFixed(0)}ث`,
      );
      await sleep(delay);
      cycleIndex++;
    } catch (e) {
      console.error(`[قصف] خطأ في الإرسال:`, e.message || e);
      await sendTyping(api, threadID, false);
      await sleep(5000);
    }
  }
  console.log(`[قصف] توقف الحلقة في ${threadID}`);
}

module.exports = {
  name: "قصف",
  createNewspaperTextProvider,
  sendTyping,

  getDelay() {
    return timingStore.get("qasf");
  },

  setNewspaperText(text) {
    return newspaperTextProvider.setNewspaperText(text);
  },

  async execute(api, event) {
    const threadID = String(event.threadID);
    const body = (event.body || "").trim();

    if (body === "قصف ايقاف" || body === "قصف إيقاف") {
      if (activeLoops.get(threadID)) {
        activeLoops.set(threadID, false);
        try {
          await api.sendMessage(SPAM_STOP, threadID);
        } catch (e) {}
      } else {
        try {
          await api.sendMessage("⚠️ لا يوجد إرسال جاري حالياً.", threadID);
        } catch (e) {}
      }
      return;
    }

    if (body === "قصف") {
      if (activeLoops.get(threadID)) {
        try {
          await api.sendMessage("⚠️ الجرائد تعمل بالفعل!", threadID);
        } catch (e) {}
        return;
      }
      try {
        await api.sendMessage(SPAM_START, threadID);
      } catch (e) {}
      activeLoops.set(threadID, true);
      spamLoop(api, threadID);
    }
  },

  isActive(threadID) {
    return activeLoops.get(String(threadID)) || false;
  },

  getNewspaperText(index) {
    return getTextForCycle(index);
  },

  getStartMessage() {
    return SPAM_START;
  },

  getStopMessage() {
    return SPAM_STOP;
  },

  resumeAll(api) {
    for (const [threadID, active] of activeLoops.entries()) {
      if (active) {
        console.log(`[قصف] استئناف الحلقة في ${threadID} بعد الاتصال`);
        spamLoop(api, threadID);
      }
    }
  },
};
