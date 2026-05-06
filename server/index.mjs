import { createServer } from "node:http";

const PORT = Number(process.env.NAMEFORGE_API_PORT ?? 8787);
const OPENAI_DEFAULT_ENDPOINT = "https://api.openai.com/v1";
const providerEnvKeys = {
  Anthropic: "ANTHROPIC_API_KEY",
  "Google Gemini": "GEMINI_API_KEY",
  Mistral: "MISTRAL_API_KEY",
  "Yerel model": "LOCAL_AI_API_KEY",
  "OpenAI uyumlu": "OPENAI_API_KEY"
};

const trademarkSources = [
  {
    region: "Türkiye",
    label: "TÜRKPATENT Marka Araştırma",
    url: "https://www.turkpatent.gov.tr/arastirma-yap?form=trademark&params="
  },
  {
    region: "ABD",
    label: "USPTO Trademark Search",
    url: "https://www.uspto.gov/trademarks/search"
  },
  {
    region: "Avrupa",
    label: "EUIPO Search IP / TMview",
    url: "https://www.euipo.europa.eu/en/search-ip"
  }
];

function writeJson(res, status, payload) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "http://127.0.0.1:5174",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sanitizeName(value) {
  return String(value ?? "")
    .replace(/[^a-z0-9-]/gi, "")
    .slice(0, 48)
    .toLowerCase();
}

function normalizeEndpoint(endpoint) {
  const cleaned = String(endpoint || OPENAI_DEFAULT_ENDPOINT).replace(/\/+$/, "");
  return cleaned.endsWith("/v1") ? cleaned : `${cleaned}/v1`;
}

function providerEnvKey(provider) {
  return providerEnvKeys[provider] ?? "OPENAI_API_KEY";
}

function resolveApiKey(payload) {
  const browserKey = String(payload.apiKey ?? "").trim();
  if (browserKey) return { apiKey: browserKey, source: "browser" };
  const envName = providerEnvKey(payload.aiProvider);
  const apiKey = String(process.env[envName] ?? "").trim();
  if (apiKey) return { apiKey, source: envName };
  return { apiKey: "", source: envName };
}

function extractJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildNamingPrompt(payload) {
  const rootLines = (payload.roots ?? [])
    .slice(0, 90)
    .map((root) => `- ${root.sound} | ${root.source} | ${root.meaning}`)
    .join("\n");

  return `Türkçe cevap veren kıdemli marka isimlendirme stratejistisin.
Yeni, tescile aday, kısa, global okunabilir marka isimleri üret.

Sektör: ${payload.sector}
Çağrışımlar: ${payload.keywords}
Birleştirilecek isimler/kelimeler: ${payload.blendInput || "Yok"}
Birleştirme modu: ${payload.blendMode || "auto"}
Uzak durulacak kelimeler: ${payload.avoid}
Ton: ${payload.tone}
Duygu: ${payload.pulse}
Uzunluk: ${payload.lengthMode}
Seçili kök havuzu:
${rootLines}

Sadece geçerli JSON dön. Format:
{
  "candidates": [
    {
      "name": "4-12 harfli ASCII marka adı",
      "roots": "hangi köklerden geldiği",
      "note": "tek cümle marka hissi",
      "context": "anlam ve bağlam açıklaması",
      "tags": ["etiket", "etiket"]
    }
  ]
}

Kurallar:
- Tamamen jenerik kelimeler üretme.
- Mevcut büyük markaları taklit etme.
- Uzak durulacak kelimeleri kullanma.
- Birleştirilecek isimler varsa 2'li veya 3'lü hece harmanlarını özellikle dene.
- En az 12 aday üret.`;
}

async function callOpenAiCompatible(payload) {
  const endpoint = normalizeEndpoint(payload.aiEndpoint);
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payload.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: payload.aiModel || "gpt-4.1-mini",
      temperature: 0.92,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate brand names and return strict JSON only. Avoid legal certainty claims."
        },
        {
          role: "user",
          content: buildNamingPrompt(payload)
        }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `AI provider returned ${response.status}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  const parsed = extractJson(content);
  if (!parsed?.candidates?.length) {
    throw new Error("AI response did not include candidates");
  }
  return parsed.candidates;
}

async function callAnthropic(payload) {
  const endpoint = String(payload.aiEndpoint || "https://api.anthropic.com").replace(/\/+$/, "");
  const response = await fetch(`${endpoint}/v1/messages`, {
    method: "POST",
    headers: {
      "x-api-key": payload.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: payload.aiModel || "claude-3-5-sonnet-latest",
      max_tokens: 2000,
      temperature: 0.9,
      system: "Return strict JSON only. Avoid legal certainty claims.",
      messages: [{ role: "user", content: buildNamingPrompt(payload) }]
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic returned ${response.status}`);
  }
  const text = data?.content?.map((part) => part.text).join("\n");
  const parsed = extractJson(text);
  if (!parsed?.candidates?.length) {
    throw new Error("AI response did not include candidates");
  }
  return parsed.candidates;
}

async function callGemini(payload) {
  const model = payload.aiModel || "gemini-1.5-flash";
  const endpoint = String(
    payload.aiEndpoint || "https://generativelanguage.googleapis.com/v1beta"
  ).replace(/\/+$/, "");
  const response = await fetch(
    `${endpoint}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(payload.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.9,
          responseMimeType: "application/json"
        },
        contents: [{ role: "user", parts: [{ text: buildNamingPrompt(payload) }] }]
      })
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini returned ${response.status}`);
  }
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n");
  const parsed = extractJson(text);
  if (!parsed?.candidates?.length) {
    throw new Error("AI response did not include candidates");
  }
  return parsed.candidates;
}

async function handleAiNames(payload) {
  const resolved = resolveApiKey(payload);
  if (!resolved.apiKey) {
    return {
      mode: "fallback",
      message: `${resolved.source} bulunamadı; frontend lokal isim motorunu kullanmalı.`,
      candidates: []
    };
  }

  const effectivePayload = { ...payload, apiKey: resolved.apiKey };
  let candidates;
  if (effectivePayload.aiProvider === "Anthropic") {
    candidates = await callAnthropic(effectivePayload);
  } else if (effectivePayload.aiProvider === "Google Gemini") {
    candidates = await callGemini(effectivePayload);
  } else {
    candidates = await callOpenAiCompatible(effectivePayload);
  }

  return {
    mode: "live",
    message:
      resolved.source === "browser"
        ? "AI sağlayıcısından canlı isim seti alındı."
        : `AI canlı isim seti ${resolved.source} ile alındı.`,
    candidates: candidates
      .map((candidate) => ({
        name: String(candidate.name ?? "").replace(/[^a-z]/gi, "").slice(0, 14),
        roots: String(candidate.roots ?? ""),
        note: String(candidate.note ?? ""),
        context: String(candidate.context ?? ""),
        tags: Array.isArray(candidate.tags) ? candidate.tags.map(String).slice(0, 5) : []
      }))
      .filter((candidate) => candidate.name.length >= 4)
      .slice(0, 16)
  };
}

async function rdapStatus(domain) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(`https://rdap.org/domain/${domain}`, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Accept: "application/rdap+json, application/json;q=0.9"
      }
    });
    if (response.status === 404) return "available";
    if (response.ok) return "taken";
    return "review";
  } catch {
    return "review";
  } finally {
    clearTimeout(timeout);
  }
}

async function handleDomainCheck(payload) {
  const names = Array.isArray(payload.names) ? payload.names.slice(0, 24) : [];
  const extensions = Array.isArray(payload.extensions) ? payload.extensions.slice(0, 8) : [];
  const results = {};

  for (const rawName of names) {
    const name = sanitizeName(rawName);
    if (!name) continue;
    results[rawName] = {};
    for (const extension of extensions) {
      const ext = String(extension).replace(/^\./, "").toLowerCase();
      if (!/^[a-z0-9.-]{2,16}$/.test(ext) || ext.includes("..")) {
        results[rawName][extension] = "review";
        continue;
      }
      results[rawName][extension] = await rdapStatus(`${name}.${ext}`);
    }
  }

  return {
    mode: "live",
    message: "RDAP üstünden canlı domain ön kontrolü yapıldı.",
    results
  };
}

async function route(req, res) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  if (req.method === "OPTIONS") {
    writeJson(res, 204, {});
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/health") {
    writeJson(res, 200, {
      ok: true,
      service: "nameforge-api",
      aiKeys: Object.fromEntries(
        Object.entries(providerEnvKeys).map(([provider, envName]) => [
          provider,
          Boolean(process.env[envName])
        ])
      ),
      trademarkSources
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/ai/names") {
    const payload = await readJson(req);
    const result = await handleAiNames(payload);
    writeJson(res, 200, result);
    return;
  }
  if (req.method === "POST" && url.pathname === "/api/domain-check") {
    const payload = await readJson(req);
    const result = await handleDomainCheck(payload);
    writeJson(res, 200, result);
    return;
  }
  if (req.method === "GET" && url.pathname === "/api/trademark-sources") {
    writeJson(res, 200, {
      mode: "source-links",
      message:
        "Bu kaynaklar resmi arama ekranlarıdır; kesin hukuki karar için marka vekili incelemesi gerekir.",
      sources: trademarkSources
    });
    return;
  }
  writeJson(res, 404, { error: "Not found" });
}

createServer((req, res) => {
  route(req, res).catch((error) => {
    writeJson(res, 500, {
      error: error.message || "Unexpected server error"
    });
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`NameForge API ready on http://127.0.0.1:${PORT}`);
});
