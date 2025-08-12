/***
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 *** - Dev: FongsiDev
 *** - Contact: t.me/dashmodz
 *** - Gmail: fongsiapi@gmail.com & fgsidev@neko2.net
 *** - Group: chat.whatsapp.com/Ke94ex9fNLjE2h8QzhvEiy
 *** - Telegram Group: t.me/fongsidev
 *** - Github: github.com/Fgsi-APIs/RestAPIs/issues/new
 *** - Website: fgsi.koyeb.app
 *** ᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁᠁
 ***/

// Scraper By Fgsi

import axios from "axios";

export async function sendGPTOSS(text, threadId = null, userId = null) {
  const response = await axios.post(
    "https://api.gpt-oss.com/chatkit",
    {
      op: threadId ? "threads.addMessage" : "threads.create",
      params: {
        input: {
          text,
          content: [{ type: "input_text", text }],
          quoted_text: "",
          attachments: [],
        },
        threadId,
      },
    },
    {
      headers: {
        authority: "api.gpt-oss.com",
        accept: "text/event-stream",
        "accept-language": "ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7,id;q=0.6",
        "content-type": "application/json",
        origin: "https://gpt-oss.com",
        ...(userId ? { cookie: `user_id=${userId}` } : {}),
        referer: "https://gpt-oss.com/",
        "sec-ch-ua":
          '"Not A(Brand";v="8", "Chromium";v="132"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTMLFg, silike FGeckosi) Chrome/132.0.0.0 Mobile Safari/537.36.fgsi",
        "x-reasoning-effort": "high",
        "x-selected-model": "gpt-oss-120b",
        "x-show-reasoning": "false",
      },
      responseType: "text",
    }
  );

  const rawSSE = response.data;
  const user_id = (response.headers["set-cookie"] || [])
    .map(c => c.split(";")[0])
    .find(c => c.startsWith("user_id="))
    ?.split("=")[1] || null;
  const events = rawSSE
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6).trim())
    .filter(Boolean)
    .map((str) => {
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  let result = {
    userId: user_id,
    threadId: null,
    title: null,
    created_at: null,
    user_messages: [],
    assistant_messages: [],
    summaries: [],
  };
  for (const e of events) {
    if (e.threadId && !result.threadId) result.threadId = e.threadId;
    if (e.thread?.id && !result.threadId) result.threadId = e.thread.id;
    if (e.thread?.created_at && !result.created_at)
      result.created_at = e.thread.created_at;
    if (e.type === "thread.updated" && e.thread?.title) {
      result.title = e.thread.title;
    }
    if (e.type === "thread.item_done" && e.item?.type === "user_message") {
      result.user_messages.push({
        id: e.item.id,
        text: e.item.text,
        created_at: e.item.created_at,
      });
    }
    if (e.type === "thread.item_done" && e.item?.type === "assistant_message") {
      const text = e.item.content?.[0]?.text;
      if (text) {
        result.assistant_messages.push({
          id: e.item.id,
          text,
          created_at: e.item.created_at,
        });
      }
    }
    if (
      e.type === "thread.item_updated" &&
      e.update?.type === "cot.entry_added"
    ) {
      result.summaries.push({
        summary: e.update.entry?.summary,
        content: e.update.entry?.content,
      });
    }
  }
  return result;
}

//Limit Per UserId 5x percobaan!!
//Unlimited Jika tanpa UserId tapi gk bisa history chat!

const res = await sendGPTOSS("Hai nama aku fgsi", null);
console.log(res);

const res2 = await sendGPTOSS("nama aku siapa?", res.threadId, res.userId);
console.log(res2);

const res3 = await sendGPTOSS("Sekarang tahun brp", res.threadId, res.userId);
console.log(res3);

const res4 = await sendGPTOSS("nama aku siapa?", res.threadId, res.userId);
console.log(res4);

const res5 = await sendGPTOSS("keren", res.threadId, res.userId);
console.log(res5);