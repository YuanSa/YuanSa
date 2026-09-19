const source = document.querySelector("#source-lyrics");
const result = document.querySelector("#result-lyrics");
const sourceCount = document.querySelector("#source-count");
const convertButton = document.querySelector("#convert-button");
const copyButton = document.querySelector("#copy-result");
const aiState = document.querySelector("#ai-state");
const message = document.querySelector("#message");
const summary = document.querySelector("#result-summary");
const changeLog = document.querySelector("#change-log");
const changeList = document.querySelector("#change-list");
const polyphoneToggle = document.querySelector("#replace-polyphones");
const traditionalToggle = document.querySelector("#convert-traditional");

const copy = {
  zh: {
    checking: "正在检测 Chrome AI",
    ready: "Chrome AI 已就绪",
    downloadable: "Chrome AI 模型待下载",
    fallback: "使用本地规则",
    empty: "请先输入一段中文歌词。",
    converting: "正在转换",
    downloading: (progress) => `下载模型 ${progress}%`,
    convert: "转换歌词",
    copied: "已复制",
    copy: "复制结果",
    waiting: "等待输入歌词",
    finished: (polyphones, traditional) => `读音替换 ${polyphones} 处${traditional === "ai" ? "，已转为繁体" : traditional === "basic" ? "，已进行基础繁体转换" : ""}`,
    localNotice: "当前浏览器无法使用 Chrome Prompt API，已改用保守的本地规则和基础繁体字典。少数字可能仍需手动调整。",
    failed: "转换没有完成，请稍后重试。歌词仍保留在输入框中。",
    example: "长夜里我独自行走\n快乐藏在重逢以后\n还有一首熟悉的音乐\n等风吹过便回到心中",
  },
  en: {
    checking: "Checking Chrome AI",
    ready: "Chrome AI ready",
    downloadable: "Chrome AI model needs download",
    fallback: "Using local rules",
    empty: "Paste some Chinese lyrics first.",
    converting: "Converting",
    downloading: (progress) => `Downloading ${progress}%`,
    convert: "Convert lyrics",
    copied: "Copied",
    copy: "Copy result",
    waiting: "Waiting for lyrics",
    finished: (polyphones, traditional) => `${polyphones} pronunciation changes${traditional === "ai" ? ", converted to Traditional Chinese" : traditional === "basic" ? ", basic Traditional Chinese conversion applied" : ""}`,
    localNotice: "Chrome Prompt API is unavailable. Conservative local pronunciation rules and a basic Traditional Chinese dictionary were used instead.",
    failed: "Conversion did not finish. Your lyrics are still in the input field.",
    example: "长夜里我独自行走\n快乐藏在重逢以后\n还有一首熟悉的音乐\n等风吹过便回到心中",
  },
};

let promptAvailability = "unavailable";
let busy = false;

const phraseRules = [
  ["银行行长", "银杭杭掌"], ["银行", "银杭"], ["行业", "杭业"], ["行长", "杭掌"],
  ["行走", "型走"], ["独行", "独型"], ["旅行", "旅型"], ["不行", "不型"], ["行人", "型人"],
  ["音乐", "音月"], ["乐队", "月队"], ["乐器", "月器"], ["乐章", "月章"], ["快乐", "快勒"], ["欢乐", "欢勒"],
  ["长大", "掌大"], ["长高", "掌高"], ["成长", "成掌"], ["生长", "生掌"], ["长辈", "掌辈"], ["长者", "掌者"], ["队长", "队掌"], ["校长", "校掌"], ["部长", "部掌"], ["漫长", "漫常"], ["长夜", "常夜"],
  ["重复", "崇复"], ["重新", "崇新"], ["重来", "崇来"], ["重逢", "崇逢"], ["重生", "崇生"], ["重要", "众要"], ["沉重", "沉众"], ["严重", "严众"], ["重量", "众量"],
  ["还有", "海有"], ["还是", "海是"], ["还在", "海在"], ["还会", "海会"], ["还好", "海好"], ["归还", "归环"], ["偿还", "偿环"], ["还给", "环给"],
  ["收藏", "收仓"], ["藏在", "仓在"], ["隐藏", "隐仓"], ["宝藏", "宝葬"], ["西藏", "西葬"],
  ["传说", "穿说"], ["传来", "穿来"], ["流传", "流穿"], ["传记", "撰记"],
  ["朝阳", "招阳"], ["今朝", "今招"], ["朝着", "巢着"], ["朝代", "巢代"],
  ["便宜", "篇宜"], ["方便", "方变"], ["随便", "随变"], ["便回", "变回"],
  ["感觉", "感绝"], ["觉得", "绝得"], ["睡觉", "睡教"], ["一觉", "一教"],
  ["没有", "梅有"], ["没了", "梅了"], ["淹没", "淹莫"], ["出没", "出莫"],
  ["看守", "刊守"], ["看门", "刊门"], ["看见", "瞰见"], ["看着", "瞰着"],
  ["了解", "瞭解"], ["了不起", "瞭不起"],
];

const basicTraditionalMap = new Map(Object.entries({
  "长":"長", "里":"裡", "独":"獨", "乐":"樂", "后":"後", "还":"還", "风":"風", "过":"過", "这":"這", "个":"個", "为":"為", "从":"從", "来":"來", "时":"時", "会":"會", "说":"說", "话":"話", "听":"聽", "见":"見", "爱":"愛", "梦":"夢", "门":"門", "间":"間", "无":"無", "与":"與", "发":"發", "开":"開", "关":"關", "别":"別", "让":"讓", "对":"對", "错":"錯", "头":"頭", "万":"萬", "边":"邊", "远":"遠", "归":"歸", "满":"滿", "声":"聲", "华":"華", "国":"國", "东":"東", "叶":"葉", "书":"書", "车":"車", "马":"馬", "鱼":"魚", "鸟":"鳥", "云":"雲", "阳":"陽", "阴":"陰", "泪":"淚", "欢":"歡", "乡":"鄉", "桥":"橋", "灯":"燈", "尘":"塵", "旧":"舊", "岁":"歲", "应":"應", "带":"帶", "给":"給", "愿":"願", "静":"靜", "尽":"盡", "数":"數", "钟":"鐘", "寻":"尋", "张":"張", "写":"寫", "读":"讀", "现":"現", "实":"實", "点":"點", "线":"線", "换":"換", "转":"轉", "变":"變", "众":"眾", "层":"層", "紧":"緊", "树":"樹", "硕":"碩", "围":"圍", "绝":"絕", "觉":"覺", "银":"銀", "环":"環", "仓":"倉"
}));

function lang() {
  return document.documentElement.lang === "en" ? "en" : "zh";
}

function t(key, ...args) {
  const value = copy[lang()][key];
  return typeof value === "function" ? value(...args) : value;
}

function setMessage(text = "") {
  message.textContent = text;
  message.hidden = !text;
}

function setBusy(next) {
  busy = next;
  convertButton.disabled = next;
  const label = convertButton.querySelector("[data-label]");
  label.textContent = next ? t("converting") : t("convert");
}

async function detectCapabilities() {
  aiState.textContent = t("checking");
  aiState.dataset.state = "";
  promptAvailability = "unavailable";

  try {
    if ("LanguageModel" in self) {
      const availability = await self.LanguageModel.availability({
        expectedInputs: [{ type: "text", languages: ["zh"] }],
        expectedOutputs: [{ type: "text", languages: ["zh"] }],
      });
      promptAvailability = availability;
    }
  } catch {
    promptAvailability = "unavailable";
  }

  if (promptAvailability === "available") {
    aiState.textContent = t("ready");
    aiState.dataset.state = "ready";
  } else if (promptAvailability === "downloadable" || promptAvailability === "downloading") {
    aiState.textContent = t("downloadable");
    aiState.dataset.state = "ready";
  } else {
    aiState.textContent = t("fallback");
    aiState.dataset.state = "fallback";
  }
}

function applyLocalPolyphoneRules(text) {
  let output = text;
  const changes = [];

  for (const [from, to] of phraseRules) {
    if (!output.includes(from)) continue;
    const occurrences = output.split(from).length - 1;
    output = output.split(from).join(to);
    for (let index = 0; index < occurrences; index += 1) changes.push({ from, to });
  }

  return { text: output, changes };
}

function cleanModelOutput(text) {
  return text.trim().replace(/^```(?:text|plaintext)?\s*/i, "").replace(/\s*```$/, "");
}

function modelOutputLooksSafe(original, candidate) {
  if (!candidate) return false;
  const originalLines = original.split("\n").length;
  const candidateLines = candidate.split("\n").length;
  const ratio = candidate.length / Math.max(original.length, 1);
  return originalLines === candidateLines && ratio >= 0.8 && ratio <= 1.2;
}

function diffCharacters(before, after) {
  const changes = [];
  const length = Math.min(before.length, after.length);
  for (let index = 0; index < length; index += 1) {
    if (before[index] !== after[index] && before[index] !== "\n" && after[index] !== "\n") {
      changes.push({ from: before[index], to: after[index] });
    }
  }
  return changes;
}

async function transformWithChromeAI(text, fixPolyphones, convertTraditional) {
  const options = {
    expectedInputs: [{ type: "text", languages: ["zh"] }],
    expectedOutputs: [{ type: "text", languages: ["zh"] }],
    initialPrompts: [{
      role: "system",
      content: "你是严格的中文歌词字符转换工具。不得翻译、润色、增删内容、改变词序、标点、空格或换行。每次只输出处理后的完整歌词，不得解释，不得使用代码块。",
    }],
    monitor(monitor) {
      monitor.addEventListener("downloadprogress", (event) => {
        const progress = Math.round(event.loaded * 100);
        convertButton.querySelector("[data-label]").textContent = t("downloading", progress);
      });
    },
  };
  const session = await withTimeout(self.LanguageModel.create(options), 15000);
  try {
    let output = text;
    let changes = [];

    if (fixPolyphones) {
      const prompt = `只处理下面歌词中的多音字。根据上下文判断实际读音，把容易被语音模型读错的多音字替换成读音相同、读音唯一或更稳定的汉字。其他所有字符必须保持不变。保留原有换行，只输出歌词：\n\n${output}`;
      const candidate = cleanModelOutput(await withTimeout(session.prompt(prompt), 30000));
      if (!modelOutputLooksSafe(output, candidate)) throw new Error("Unsafe pronunciation output");
      changes = diffCharacters(output, candidate);
      output = candidate;
    }

    if (convertTraditional) {
      const prompt = `只把下面歌词中的简体汉字逐字转换为对应的繁体汉字。不得翻译、改词或改变任何非汉字字符。保留原有换行，只输出歌词：\n\n${output}`;
      const candidate = cleanModelOutput(await withTimeout(session.prompt(prompt), 30000));
      if (!modelOutputLooksSafe(output, candidate)) throw new Error("Unsafe Traditional Chinese output");
      output = candidate;
    }

    return { text: output, changes };
  } finally {
    session.destroy?.();
  }
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => window.setTimeout(() => reject(new Error("Timed out")), timeoutMs)),
  ]);
}

function convertWithBasicMap(text) {
  return Array.from(text, (character) => basicTraditionalMap.get(character) || character).join("");
}

function renderChanges(changes) {
  changeList.replaceChildren();
  const grouped = new Map();
  changes.forEach(({ from, to }) => {
    const key = `${from}\u0000${to}`;
    grouped.set(key, { from, to, count: (grouped.get(key)?.count || 0) + 1 });
  });

  [...grouped.values()].slice(0, 16).forEach(({ from, to, count }) => {
    const item = document.createElement("span");
    item.className = "tongjia-change";
    const original = document.createTextNode(`${from} → `);
    const replacement = document.createElement("strong");
    replacement.textContent = to;
    item.append(original, replacement);
    if (count > 1) item.append(document.createTextNode(` × ${count}`));
    changeList.append(item);
  });
  changeLog.hidden = changes.length === 0;
}

async function convertLyrics() {
  if (busy) return;
  const original = source.value.trim();
  if (!original) {
    setMessage(t("empty"));
    source.focus();
    return;
  }

  setBusy(true);
  setMessage();
  changeLog.hidden = true;
  let output = original;
  let pronunciationChanges = [];
  let usedLocalFallback = false;
  let translated = "none";

  try {
    if (promptAvailability !== "unavailable") {
      try {
        const converted = await transformWithChromeAI(output, polyphoneToggle.checked, traditionalToggle.checked);
        output = converted.text;
        pronunciationChanges = converted.changes;
        translated = traditionalToggle.checked ? "ai" : "none";
      } catch {
        usedLocalFallback = true;
      }
    } else {
      usedLocalFallback = true;
    }

    if (usedLocalFallback) {
      if (polyphoneToggle.checked) {
        const converted = applyLocalPolyphoneRules(output);
        output = converted.text;
        pronunciationChanges = converted.changes;
      }
      if (traditionalToggle.checked) {
        output = convertWithBasicMap(output);
        translated = "basic";
      }
      setMessage(t("localNotice"));
    }

    result.value = output;
    copyButton.disabled = false;
    summary.textContent = t("finished", pronunciationChanges.length, translated);
    renderChanges(pronunciationChanges);
  } catch {
    setMessage(t("failed"));
  } finally {
    setBusy(false);
  }
}

source.addEventListener("input", () => {
  sourceCount.textContent = `${source.value.length} / 6000`;
  if (message.textContent === t("empty")) setMessage();
});

document.querySelector("#load-example").addEventListener("click", () => {
  source.value = t("example");
  source.dispatchEvent(new Event("input"));
  source.focus();
});

document.querySelector("#clear-source").addEventListener("click", () => {
  source.value = "";
  result.value = "";
  source.dispatchEvent(new Event("input"));
  copyButton.disabled = true;
  summary.textContent = t("waiting");
  changeLog.hidden = true;
  setMessage();
  source.focus();
});

copyButton.addEventListener("click", async () => {
  if (!result.value) return;
  await navigator.clipboard.writeText(result.value);
  copyButton.textContent = t("copied");
  window.setTimeout(() => { copyButton.textContent = t("copy"); }, 1400);
});

convertButton.addEventListener("click", convertLyrics);

function applyDynamicLanguage() {
  source.placeholder = lang() === "en" ? source.dataset.enPlaceholder : "粘贴一段中文歌词……";
  result.placeholder = lang() === "en" ? result.dataset.enPlaceholder : "转换后的歌词会出现在这里";
  summary.textContent = result.value ? summary.textContent : t("waiting");
  copyButton.textContent = t("copy");
  if (!busy) convertButton.querySelector("[data-label]").textContent = t("convert");
}

window.addEventListener("site-language-change", () => {
  applyDynamicLanguage();
  detectCapabilities();
});

applyDynamicLanguage();
detectCapabilities();
