/**
 * Generator Song AI - Sunora Ai
 * Author : gienetic
 * Base   : https://play.google.com/store/apps/details?id=com.mavtao.ai.song.generator.maker.sunora
 * Note   : -
 */

 
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

function randomHex(length) {
  const chars = "abcdef0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function gieneticTrace() {
  return `${randomHex(32)}-${randomHex(16)}`;
}

// Auto regist
async function login(deviceId) {
  const res = await axios.post(
    "https://api.sunora.mavtao.com/api/auth/login",
    { device_id: deviceId },
    {
      headers: {
        "user-agent": "Dart/3.4 (gienetic_build)",
        "version": "2.2.2",
        "accept-encoding": "gzip",
        "content-type": "application/json",
        "buildnumber": "105",
        "platform": "android",
        "sentry-trace": gieneticTrace()
      }
    }
  );
  return res.data?.data?.token || null;
}

// Polling hasil 
async function polllll(xAuth, maxAttempts = 30, delayMs = 30000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.get(
        "https://api.sunora.mavtao.com/api/music/music_page?page=1&pagesize=50",
        {
          headers: {
            "user-agent": "Dart/3.4 (gienetic_build)",
            "version": "2.2.2",
            "accept-encoding": "gzip",
            "x-auth": xAuth,
            "buildnumber": "105",
            "platform": "android",
            "sentry-trace": gieneticTrace()
          }
        }
      );

      const records = res.data?.data?.records || [];
      const doneSongs = records.filter(r => r.status === "complete");

      if (doneSongs.length > 0) {
        return doneSongs.map(r => ({
          id: r.song_id,
          title: r.title || "Sniff By: Gienetic",
          tags: r.meta_tags,
          prompt: r.meta_prompt,
          audioUrl: r.audio_url,
          videoUrl: r.video_url,
          imageUrl: r.image_url,
          model: r.model_name
        }));
      }
    } catch (err) {
      console.error("⚠️ Polling error:", err.response?.data || err.message);
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  return [];
}

// Mode Prompt (bebas)
async function generateNormal(description) {
  const deviceId = uuidv4();
  const token = await login(deviceId);
  if (!token) throw new Error("⚠️ Error: gagal login (makanya tag author ny kalau recode :v)");

  await axios.post(
    "https://api.sunora.mavtao.com/api/music/advanced_custom_generate",
    {
      continue_at: null,
      continue_clip_id: null,
      mv: null,
      description,
      title: "",
      mood: "",
      music_style: "",
      instrumental_only: false
      
    },
    {
      headers: {
        "user-agent": "Dart/3.4 (gienetic_build)",
        "version": "2.2.2",
        "accept-encoding": "gzip",
        "x-auth": token,
        "content-type": "application/json",
        "buildnumber": "105",
        "platform": "android",
        "sentry-trace": gieneticTrace()
      }
    }
  );

  return await polllll(token);
}

// Mode Lirik Custom
async function generateCustom({ title, style, lyrics }) {
  const deviceId = uuidv4();
  const token = await login(deviceId);
  if (!token) throw new Error("⚠️ Error: gagal login (makanya tag author ny kalau recode :v)");

  await axios.post(
    "https://api.sunora.mavtao.com/api/music/custom_generate",
    {
      continue_at: null,
      continue_clip_id: null,
      mv: null,
      prompt: lyrics,
      title,
      tags: style
    },
    {
      headers: {
        "user-agent": "Dart/3.4 (gienetic_build)",
        "version": "2.2.2",
        "accept-encoding": "gzip",
        "x-auth": token,
        "content-type": "application/json",
        "buildnumber": "105",
        "platform": "android",
        "sentry-trace": gieneticTrace()
      }
    }
  );

  return await polllll(token);
}

// Mode Instrumental
async function generateInstrumental(description) {
  const deviceId = uuidv4();
  const token = await login(deviceId);
  if (!token) throw new Error("⚠️ Error: gagal login (makanya tag author ny kalau recode :v)");

  await axios.post(
    "https://api.sunora.mavtao.com/api/music/advanced_custom_generate",
    {
      continue_at: null,
      continue_clip_id: null,
      mv: null,
      description,
      title: "",
      mood: "",
      music_style: "",
      instrumental_only: true
    },
    {
      headers: {
        "user-agent": "Dart/3.4 (gienetic_build)",
        "version": "2.2.2",
        "accept-encoding": "gzip",
        "x-auth": token,
        "content-type": "application/json",
        "buildnumber": "105",
        "platform": "android",
        "sentry-trace": gieneticTrace()
      }
    }
  );

  return await polllll(token);
}

module.exports = {
  generateNormal,
  generateCustom,
  generateInstrumental
};
