import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Local Chrome DevTools checks; no packages, database, accounts or external services.
const base = process.env.UI_BASE_URL || "http://127.0.0.1:3100";
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
let port = Number(process.env.UI_CDP_PORT || 0);
const profile = resolve(".local", "browser-" + process.pid);
const output = resolve("docs/work/2026-11-12/screenshots");
const browserPath =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
await access(browserPath);
await mkdir(output, { recursive: true });
const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",

    "--remote-debugging-port=" + port,
    "--user-data-dir=" + profile,
    "about:blank",
  ],
  { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] },
);
let spawnError;
let browserLog = "";
browser.stderr.on("data", (chunk) => {
  browserLog = (browserLog + chunk.toString()).slice(-2000);
});
browser.on("error", (error) => {
  spawnError = error;
});
let socket;
let id = 0;
const pending = new Map();
const errors = [];
let dialogAnswer = true;
const checks = [];
function report(name) {
  checks.push(name);
  console.log("PASS " + name);
}
function send(method, params = {}) {
  return new Promise((resolveCall, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => {
      pending.delete(requestId);
      reject(new Error("CDP timeout: " + method));
    }, 60000);
    pending.set(requestId, { resolve: resolveCall, reject, timer });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true,
  });
  if (result.exceptionDetails)
    throw new Error(
      result.exceptionDetails.text +
        " " +
        JSON.stringify(result.exceptionDetails.exception),
    );
  return result.result.value;
}
async function until(expression, timeout = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      if (await evaluate(expression)) return;
    } catch {
      /* Page may be changing execution context. */
    }
    await delay(150);
  }
  throw new Error("Timed out: " + expression);
}
async function visit(path, expected) {
  console.log("VISIT " + path);
  await send("Page.navigate", { url: base + path });
  await until(
    "document.readyState === 'complete' && !!document.querySelector('.app-header, .empty-state')",
  );
  if (expected)
    await until(
      "document.body.innerText.includes(" + JSON.stringify(expected) + ")",
    );
  await until(
    "!document.querySelector('.theme-toggle') || !document.querySelector('.theme-toggle').disabled",
  );
  await delay(200);
}
async function click(selector) {
  await until("!!document.querySelector(" + JSON.stringify(selector) + ")");
  await evaluate(
    "document.querySelector(" +
      JSON.stringify(selector) +
      ").focus(); document.querySelector(" +
      JSON.stringify(selector) +
      ").click()",
  );
  await delay(150);
}
async function screenshot(name) {
  await evaluate(
    'document.querySelectorAll("nextjs-portal").forEach(el => el.style.display = "none")',
  );
  const image = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(
    join(output, name + ".png"),
    Buffer.from(image.data, "base64"),
  );
}
async function viewport(width, height = 1000) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await delay(120);
}
try {
  let page;
  for (let attempt = 0; attempt < 300; attempt++) {
    if (spawnError) throw spawnError;
    try {
      if (!port)
        port = Number(
          (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split(
            /\r?\n/,
          )[0],
        );
      const pages = await (
        await fetch("http://127.0.0.1:" + port + "/json/list")
      ).json();
      page = pages.find((candidate) => candidate.type === "page");
      if (page.webSocketDebuggerUrl) break;
    } catch {
      /* Chrome startup. */
    }
    await delay(200);
  }
  assert.ok(
    page?.webSocketDebuggerUrl,
    "Chrome debugging endpoint: " + browserLog,
  );
  socket = new WebSocket(page.webSocketDebuggerUrl);
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const call = pending.get(message.id);
      if (call) {
        clearTimeout(call.timer);
        pending.delete(message.id);
        if (message.error)
          call.reject(new Error(JSON.stringify(message.error)));
        else call.resolve(message.result);
      }
    } else if (message.method === "Runtime.exceptionThrown")
      errors.push(
        message.params.exceptionDetails.text +
          " " +
          (message.params.exceptionDetails.exception?.description || ""),
      );
    else if (
      message.method === "Runtime.consoleAPICalled" &&
      message.params.type === "error"
    )
      errors.push(
        message.params.args
          .map((arg) => arg.value || arg.description)
          .join(" "),
      );
    else if (message.method === "Page.javascriptDialogOpening")
      send("Page.handleJavaScriptDialog", { accept: dialogAnswer }).catch(
        () => {},
      );
  });
  await new Promise((resolveOpen, reject) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await viewport(1440);
  await visit("/", "프로젝트 문서를 하나의 흐름으로 관리합니다.");
  assert.deepEqual(
    await evaluate(
      "Array.from(document.querySelectorAll('.stat-number')).map(el => parseInt(el.textContent))",
    ),
    [3, 18, 6, 3],
  );
  assert.equal(
    await evaluate(
      "document.querySelectorAll('.desktop-sidebar .nav-item').length",
    ),
    5,
  );
  assert.equal(
    await evaluate(
      "getComputedStyle(document.querySelector('.sidebar-logo')).height",
    ),
    "64px",
  );
  assert.equal(
    await evaluate(
      "getComputedStyle(document.querySelector('.app-header')).height",
    ),
    "64px",
  );
  report("dashboard fixtures, navigation and equal header/logo height");
  for (const width of [1440, 1024, 768, 390]) {
    await viewport(width);
    const layout = await evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,offenders:Array.from(document.querySelectorAll('body *')).filter(el=>el.getBoundingClientRect().right>innerWidth+1 && getComputedStyle(el).position!=='fixed').slice(0,16).map(el=>({tag:el.tagName,className:String(el.className),width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right}))})");
    if(layout.scrollWidth > layout.width) { console.log(JSON.stringify(layout)); await screenshot("overflow-"+width); }
    assert.ok(
      await evaluate("document.documentElement.scrollWidth <= innerWidth"),
      "page overflow at " + width,
    );
    assert.ok(
      await evaluate(
        "document.querySelector('main').getBoundingClientRect().bottom <= document.querySelector('footer').getBoundingClientRect().top + 1",
      ),
      "footer overlap at " + width,
    );
    if (width === 390) await screenshot("dashboard-mobile");
  }
  report("responsive layout and footer: 1440 / 1024 / 768 / 390");
  await viewport(1440);
  await screenshot("dashboard-light");
  await click(".theme-toggle");
  assert.equal(
    await evaluate("document.documentElement.dataset.theme"),
    "dark",
  );
  await screenshot("dashboard-dark");
  await send("Page.reload");
  await until(
    "document.readyState === 'complete' && !document.querySelector('.theme-toggle')?.disabled",
  );
  assert.equal(
    await evaluate("document.documentElement.dataset.theme"),
    "dark",
  );
  // Measure all foreground/background pairs that are used for text.
  const contrast = await evaluate(`(() => {
    const s = getComputedStyle(document.documentElement);
    const luminance = hex => { const raw=hex.trim().slice(1); const c = (raw.length === 3 ? raw.split('').map(x=>x+x).join('') : raw).match(/../g).map(x => parseInt(x,16)/255).map(x => x <= .04045 ? x/12.92 : ((x+.055)/1.055)**2.4); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
    const ratio = (a,b) => { const x=luminance(s.getPropertyValue(a)), y=luminance(s.getPropertyValue(b)); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); };
    return [['--foreground','--surface'],['--muted','--surface'],['--muted','--background'],['--brand','--brand-soft'],['--brand-foreground','--brand'],['--success','--success-soft'],['--warning','--warning-soft'],['--blue','--blue-soft']].map(([a,b]) => ({pair:a+'/'+b, ratio:ratio(a,b)}));
  })()`);
  for (const pair of contrast)
    assert.ok(pair.ratio >= 4.5, "dark contrast " + JSON.stringify(pair));
  await click(".theme-toggle");
  const lightContrast = await evaluate(`(() => {
    const s = getComputedStyle(document.documentElement); const l = h => { const raw=h.trim().slice(1); const c=(raw.length===3?raw.split('').map(x=>x+x).join(''):raw).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
    return [['--foreground','--surface'],['--muted','--surface'],['--muted','--background'],['--brand','--brand-soft'],['--brand-foreground','--brand'],['--success','--success-soft'],['--warning','--warning-soft'],['--blue','--blue-soft']].map(([a,b])=>{const x=l(s.getPropertyValue(a)),y=l(s.getPropertyValue(b));return {pair:a+'/'+b,ratio:(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};});
  })()`);
  for (const pair of lightContrast)
    assert.ok(pair.ratio >= 4.5, "light contrast " + JSON.stringify(pair));
  report("theme persistence and light/dark text contrast >= 4.5");
  await viewport(390, 844);
  await click('button[aria-label="메뉴 열기"]');
  assert.equal(
    await evaluate("document.querySelector('.mobile-drawer').open"),
    true,
  );
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 27,
    code: "Escape",
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Escape",
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 27,
    code: "Escape",
  });
  await until("!document.querySelector('.mobile-drawer').open");
  assert.equal(
    await evaluate("document.activeElement.getAttribute('aria-label')"),
    "메뉴 열기",
  );
  report("mobile drawer Escape and focus restoration");
  await viewport(1440);
  await visit("/projects/commerce?tab=requirements", "요구사항 목록");
  await screenshot("project-requirements");
  await click('a[href*="req=commerce-req-1"]');
  await until("!!document.querySelector('dialog[open]')");
  assert.ok(
    await evaluate(
      "document.querySelector('dialog[open]').innerText.includes('원문 근거')",
    ),
  );
  await click('dialog[open] button[aria-label="닫기"]');
  await until("!document.querySelector('dialog[open]')");
  await click('nav[aria-label="프로젝트 작업 메뉴"] a[href*="tab=changes"]');
  await until("location.search.includes('tab=changes')");
  await evaluate("history.back()");
  await until("location.search.includes('tab=requirements')");
  report("deep-linked requirement evidence, modal and browser back");
  await visit(
    "/projects/commerce?tab=artifacts&doc=commerce-doc-2",
    "기능 정의",
  );
  assert.ok(
    await evaluate(
      "document.querySelector('dialog[open]').innerText.includes('FUNC-001')",
    ),
  );
  await screenshot("document-preview");
  await click('dialog[open] button[aria-label="닫기"]');
  await visit("/projects/commerce?tab=invalid", "프로젝트 문서");
  await until("location.search.includes('tab=overview')");
  await visit(
    "/projects/commerce?tab=requirements&req=workspace-req-1",
    "이 프로젝트에서 요청한",
  );
  assert.equal(
    await evaluate("!!document.querySelector('dialog[open]')"),
    false,
  );
  report("document preview, invalid tab normalization and project isolation");
  await visit("/settings/project", "프로젝트를 먼저 선택해 주세요");
  assert.equal(
    await evaluate("document.querySelectorAll('textarea').length"),
    0,
  );
  await visit("/settings/project?projectId=commerce", "프로젝트 기본 정보");
  await screenshot("project-settings");
  await visit("/settings/profile", "표시 이름");
  await evaluate(
    `(() => { const input=Array.from(document.querySelectorAll('label')).find(el => el.textContent.includes('표시 이름')).querySelector('input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'임시 변경'); input.dispatchEvent(new Event('input',{bubbles:true})); })()`,
  );
  await until(
    "document.body.innerText.includes('저장되지 않은 임시 변경사항')",
  );
  dialogAnswer = false;
  await click('.desktop-sidebar a[href="/team"]');
  assert.equal(await evaluate("location.pathname"), "/settings/profile");
  dialogAnswer = true;
  await click('.desktop-sidebar a[href="/team"]');
  await until("location.pathname === '/team'");
  await visit("/settings/profile", "표시 이름");
  assert.equal(
    await evaluate(
      "Array.from(document.querySelectorAll('label')).find(el => el.textContent.includes('표시 이름')).querySelector('input').value",
    ),
    "김서연",
  );
  report("project selection, unsaved-navigation confirmation and draft reset");
  await visit("/team?q=no-matching-document", "검색 결과가 없습니다");
  await evaluate(
    "Array.from(document.querySelectorAll('button')).find(el => el.textContent === '필터 초기화').click()",
  );
  await until("document.querySelectorAll('tbody tr').length === 18");
  await visit("/team?projectId=commerce", "공유된 문서");
  assert.equal(
    await evaluate("document.querySelectorAll('tbody tr').length"),
    6,
  );
  await screenshot("team-sharing");
  await visit("/settings/admin", "AI Agent 핵심 구성요소");
  assert.equal(
    await evaluate("document.querySelectorAll('tbody tr').length"),
    7,
  );
  await click('button[aria-label="Prompt 상세 보기"]');
  await until("!!document.querySelector('dialog[open]')");
  await click('dialog[open] button[aria-label="닫기"]');
  await evaluate(
    "Array.from(document.querySelectorAll('button')).find(el => el.textContent === '정책·검증').click()",
  );
  await until("document.body.innerText.includes('허용 Tool과 인자 검증')");
  report("team filters/reset and seven Agent component details");
  await visit("/projects/commerce?tab=generate", "실행 흐름 미리보기");
  assert.equal(
    await evaluate(
      "document.querySelectorAll('input[type=checkbox]:checked').length",
    ),
    4,
  );
  await visit("/projects/no-such-project", "페이지를 찾을 수 없습니다");
  await visit("/?previewState=loading", "화면을 불러오는 중입니다.");
  await visit("/?previewState=empty", "등록된 프로젝트가 없습니다");
  await visit("/?previewState=error", "화면을 불러오지 못했습니다");
  await visit("/?previewState=denied", "접근 권한이 없습니다");
  report("generation samples, not-found and development-only state previews");
  // Storage denial must not prevent theme use.
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source:
      "Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError')}})",
  });
  await visit("/", "대시보드");
  assert.equal(
    await evaluate("document.documentElement.dataset.theme"),
    "light",
  );
  await click(".theme-toggle");
  assert.equal(
    await evaluate("document.documentElement.dataset.theme"),
    "dark",
  );
  report("theme works when browser storage is denied");
  assert.deepEqual(errors, [], "browser errors / hydration warnings");
  report("no browser exceptions or console errors");
  await writeFile(
    resolve(".local", "ui-check-results.json"),
    JSON.stringify(
      {
        base,
        checks,
        screenshots: output,
        contrast: { light: lightContrast, dark: contrast },
        errors,
      },
      null,
      2,
    ),
  );
  console.log("Verified " + checks.length + " groups; screenshots: " + output);
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      await send("Browser.close");
    } catch {
      /* Browser exits before response. */
    }
    socket.close();
  }
  browser.kill();
  for (const call of pending.values()) {
    clearTimeout(call.timer);
    call.reject(new Error("Browser closed"));
  }
}
