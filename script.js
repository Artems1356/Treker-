// =====================================================
// NEXUS // OS — Логика полноценного приложения привычек
// =====================================================

const STORAGE_KEY = "nexus-os-v4";

const MONTH_NAMES = [
  "ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ", "МАЙ", "ИЮНЬ",
  "ИЮЛЬ", "АВГУСТ", "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"
];
const DOW_SHORT = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

const STATE_METRICS = [
  { key: "mood",   label: "Настроение", short: "Настр.", color: "#06b6d4" },
  { key: "energy", label: "Энергия",    short: "Энерг.", color: "#10b981" },
  { key: "focus",  label: "Фокус",      short: "Фокус",  color: "#f59e0b" },
];

const RANKS = [
  { lvl: 1,  name: "TRAINEE" },
  { lvl: 3,  name: "JUNIOR" },
  { lvl: 6,  name: "MIDDLE" },
  { lvl: 10, name: "SENIOR" },
  { lvl: 15, name: "STAFF" },
  { lvl: 22, name: "PRINCIPAL" },
];

// Банк готовых предложений для плана на завтра (плюс динамические из отстающих привычек)
const PLAN_SUGGESTIONS_POOL = [
  { text: "Глубокая фокус-сессия: 45 минут кода без телефона", tag: "КОД", cls: "code" },
  { text: "Разобрать 1 сложную тему / алгоритм и написать конспект", tag: "УЧЁБА", cls: "code" },
  { text: "Сделать коммит на GitHub (даже небольшое улучшение проекта)", tag: "КОД", cls: "code" },
  { text: "Утренняя разминка 15 мин + стакан воды сразу после сна", tag: "ЭНЕРГИЯ", cls: "calm" },
  { text: "Убрать телефон за 40 минут до сна + проветрить комнату", tag: "АНТИ-СТРЕСС", cls: "calm" },
  { text: "Прогулка 30 минут на свежем воздухе без наушников", tag: "АНТИ-СТРЕСС", cls: "calm" },
  { text: "Прочитать 15–20 страниц профильной книги", tag: "УЧЁБА", cls: "code" },
  { text: "Закрыть самую неприятную задачу первой до 12:00", tag: "ФОКУС", cls: "focus" },
];

// Строгие векторные SVG-эмблемы для профиля
const EMBLEMS = [
  {
    id: "terminal",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  },
  {
    id: "layers",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  },
  {
    id: "shield",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    id: "cpu",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  },
  {
    id: "activity",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  },
  {
    id: "compass",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>`,
  },
];

const ACHIEVEMENTS = [
  { id: "a1", code: "M-01", title: "Старт системы",      desc: "Отметить первую привычку",          check: (st) => st.totalDone >= 1 },
  { id: "a2", code: "M-02", title: "100% День",          desc: "Выполнить все привычки за 1 день",  check: (st) => st.hasPerfectDay },
  { id: "a3", code: "M-03", title: "Серия 3 дня",        desc: "3 дня подряд с выполнением >= 50%", check: (st) => st.streak >= 3 },
  { id: "a4", code: "M-04", title: "Серия 7 дней",       desc: "7 дней подряд с выполнением >= 50%",check: (st) => st.streak >= 7 },
  { id: "a5", code: "M-05", title: "50 выполнений",      desc: "Закрыть 50 чекбоксов за месяц",     check: (st) => st.monthDone >= 50 },
  { id: "a6", code: "M-06", title: "100 выполнений",     desc: "Закрыть 100 чекбоксов за месяц",    check: (st) => st.monthDone >= 100 },
  { id: "a7", code: "M-07", title: "Дисциплина 70%+",    desc: "Общий прогресс месяца от 70%",      check: (st) => st.monthPct >= 70 },
  { id: "a8", code: "M-08", title: "Контроль состояния", desc: "Заполнить трекер состояния 7 дней", check: (st) => st.stateDaysCount >= 7 },
];

const $ = (id) => document.getElementById(id);

const now = new Date();
let currentYear = now.getFullYear();
let currentMonth = now.getMonth();
let activeTab = "all";
let selectedEmblemInModal = "terminal";
let suggestionOffset = 0;

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function showToast(text) {
  const div = document.createElement("div");
  div.className = "toast";
  div.textContent = text;
  $("toasts").appendChild(div);
  setTimeout(() => div.remove(), 2600);
}

// ---------- БАЗОВЫЕ ДАННЫЕ И ХРАНИЛИЩЕ ----------
function defaultHabits() {
  return [
    { id: "h1", name: "Программирование / Код (60 мин)",            goal: 30 },
    { id: "h2", name: "Чтение тех. литературы (20 стр)",            goal: 30 },
    { id: "h3", name: "Тренировка / Физическая форма",              goal: 25 },
    { id: "h4", name: "Английский язык (практика)",                 goal: 30 },
    { id: "h5", name: "Режим сна (подъём до 08:00)",                goal: 30 },
    { id: "h6", name: "Глубокий фокус без соцсетей",                goal: 30 },
    { id: "h_evening", name: "Вечерний итог дня и план на завтра (5 мин)", goal: 30 },
  ];
}

function seedMonthData(year, month, habits) {
  const days = daysInMonth(year, month);
  const activeUpTo = (year === now.getFullYear() && month === now.getMonth())
    ? Math.max(18, now.getDate())
    : days;

  const checks = {};
  const rates = [0.78, 0.68, 0.45, 0.60, 0.42, 0.38, 0.74];

  habits.forEach((h, idx) => {
    checks[h.id] = {};
    const rate = rates[idx % rates.length];
    for (let d = 1; d <= activeUpTo; d++) {
      const hash = ((d * 17 + (idx + 1) * 31) % 100) / 100;
      checks[h.id][d] = hash < rate;
    }
  });

  const states = {};
  for (let d = 1; d <= activeUpTo; d++) {
    states[d] = {
      mood:   ((d * 3 + 2) % 3) + 3,
      energy: ((d * 5 + 1) % 4) + 2,
      focus:  ((d * 7 + 3) % 3) + 3,
    };
  }

  return {
    checks,
    states,
    eveningWins: {},
    eveningRelease: {},
    tomorrowPlans: [
      { id: "tp1", text: "Фокус-сессия: 60 минут практики кода", done: false },
      { id: "tp2", text: "Прочитать 20 страниц документации / книги", done: false },
      { id: "tp3", text: "Вечерний 5-минутный разбор дня перед сном", done: false },
    ],
  };
}

function createInitialStore() {
  const habits = defaultHabits();
  const mk = monthKey(currentYear, currentMonth);
  return {
    profile: {
      name: "OPERATOR",
      role: "Software Engineer",
      emblem: "terminal",
      focusSessions: 0,
      bonusXp: 0,
    },
    habits,
    months: {
      [mk]: seedMonthData(currentYear, currentMonth, habits),
    },
  };
}

function loadStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const init = createInitialStore();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
    return init;
  }
  try {
    const parsed = JSON.parse(raw);
    const base = createInitialStore();
    const merged = {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile || {}) },
    };
    // Убедимся, что привычка «Вечерний итог дня и план на завтра (5 мин)» добавлена
    if (!merged.habits.some((h) => h.id === "h_evening" || h.name.toLowerCase().includes("вечерний"))) {
      merged.habits.push({
        id: "h_evening",
        name: "Вечерний итог дня и план на завтра (5 мин)",
        goal: 30,
      });
    }
    return merged;
  } catch {
    return createInitialStore();
  }
}

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let store = loadStore();

function ensureMonthRecord(year, month) {
  const mk = monthKey(year, month);
  if (!store.months[mk]) {
    store.months[mk] = {
      checks: {},
      states: {},
      eveningWins: {},
      eveningRelease: {},
      tomorrowPlans: [],
    };
  }
  const rec = store.months[mk];
  if (!rec.checks) rec.checks = {};
  if (!rec.states) rec.states = {};
  if (!rec.eveningWins) rec.eveningWins = {};
  if (!rec.eveningRelease) rec.eveningRelease = {};
  if (!Array.isArray(rec.tomorrowPlans)) rec.tomorrowPlans = [];
  store.habits.forEach((h) => {
    if (!rec.checks[h.id]) rec.checks[h.id] = {};
  });
  return rec;
}

// ---------- РАСЧЁТ АНАЛИТИКИ ----------
function computeAnalytics() {
  const days = daysInMonth(currentYear, currentMonth);
  const rec = ensureMonthRecord(currentYear, currentMonth);
  const habits = store.habits;
  const hCount = habits.length;

  const isCurrentMonth = (currentYear === now.getFullYear() && currentMonth === now.getMonth());
  const todayDay = isCurrentMonth ? now.getDate() : days;

  const dailyDone = {};
  const dailyLeft = {};
  let monthDone = 0;

  for (let d = 1; d <= days; d++) {
    let done = 0;
    habits.forEach((h) => {
      if (rec.checks[h.id] && rec.checks[h.id][d]) done++;
    });
    dailyDone[d] = done;
    dailyLeft[d] = Math.max(0, hCount - done);
    monthDone += done;
  }

  const monthTotal = habits.reduce((acc, h) => acc + Math.min(days, h.goal || days), 0);
  const monthLeft = Math.max(0, monthTotal - monthDone);
  const monthPct = monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0;

  const dayDone = dailyDone[todayDay] || 0;
  const dayTotal = hCount;
  const dayLeft = Math.max(0, dayTotal - dayDone);
  const dayPct = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;

  const weekStart = Math.max(1, todayDay - 6);
  const weekDaysCount = todayDay - weekStart + 1;
  let weekDone = 0;
  for (let d = weekStart; d <= todayDay; d++) {
    weekDone += dailyDone[d] || 0;
  }
  const weekTotal = hCount * weekDaysCount;
  const weekLeft = Math.max(0, weekTotal - weekDone);
  const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

  const habitStats = habits.map((h) => {
    let done = 0;
    for (let d = 1; d <= days; d++) {
      if (rec.checks[h.id] && rec.checks[h.id][d]) done++;
    }
    const goal = Math.min(days, h.goal || days);
    const left = Math.max(0, goal - done);
    const pct = goal > 0 ? Math.round((done / goal) * 100) : 0;
    return { ...h, done, goal, left, pct };
  });

  let streak = 0;
  if (hCount > 0) {
    for (let d = todayDay; d >= 1; d--) {
      if (dailyDone[d] >= Math.ceil(hCount * 0.5)) streak++;
      else break;
    }
  }

  function avgStateForRange(fromDay, toDay) {
    const sums = { mood: 0, energy: 0, focus: 0 };
    const counts = { mood: 0, energy: 0, focus: 0 };
    for (let d = fromDay; d <= toDay; d++) {
      const st = rec.states[d];
      if (!st) continue;
      STATE_METRICS.forEach(({ key }) => {
        if (st[key] >= 1 && st[key] <= 5) {
          sums[key] += Number(st[key]);
          counts[key]++;
        }
      });
    }
    const res = {};
    let totalSum = 0;
    let totalCnt = 0;
    STATE_METRICS.forEach(({ key }) => {
      res[key] = counts[key] > 0 ? (sums[key] / counts[key]) : 0;
      totalSum += sums[key];
      totalCnt += counts[key];
    });
    res.overall = totalCnt > 0 ? (totalSum / totalCnt) : 0;
    return res;
  }

  const stateDay = avgStateForRange(todayDay, todayDay);
  const stateWeek = avgStateForRange(weekStart, todayDay);
  const stateMonth = avgStateForRange(1, days);

  let totalDoneAllMonths = 0;
  Object.values(store.months).forEach((m) => {
    Object.values(m.checks || {}).forEach((dayMap) => {
      Object.values(dayMap).forEach((v) => { if (v) totalDoneAllMonths++; });
    });
  });

  const hasPerfectDay = hCount > 0 && Object.values(dailyDone).some((v) => v === hCount);
  const stateDaysCount = Object.values(rec.states).filter(
    (s) => s && (s.mood || s.energy || s.focus)
  ).length;

  return {
    days,
    todayDay,
    weekStart,
    rec,
    hCount,
    dailyDone,
    dailyLeft,
    dayDone, dayLeft, dayTotal, dayPct,
    weekDone, weekLeft, weekTotal, weekPct,
    monthDone, monthLeft, monthTotal, monthPct,
    habitStats,
    streak,
    stateDay,
    stateWeek,
    stateMonth,
    totalDone: totalDoneAllMonths,
    hasPerfectDay,
    stateDaysCount,
  };
}

// ---------- ОТРИСОВКА ПРОФИЛЯ И КРУГОВЫХ ИНДИКАТОРОВ ----------
function setRing(circleId, pctId, pct) {
  const circumference = 2 * Math.PI * 40;
  const clamped = Math.max(0, Math.min(100, pct));
  const el = $(circleId);
  el.style.strokeDasharray = circumference;
  el.style.strokeDashoffset = circumference * (1 - clamped / 100);
  $(pctId).textContent = `${clamped}%`;
}

function renderHeaderAndKPIs(a) {
  const totalXp = a.totalDone * 10 + (store.profile.bonusXp || 0);
  const level = Math.floor(totalXp / 100) + 1;
  const xpInLevel = totalXp % 100;
  let rank = RANKS[0].name;
  RANKS.forEach((r) => { if (level >= r.lvl) rank = r.name; });

  const emblemObj = EMBLEMS.find((e) => e.id === store.profile.emblem) || EMBLEMS[0];
  $("profile-emblem").innerHTML = emblemObj.svg;
  $("profile-name").textContent = store.profile.name || "OPERATOR";
  $("profile-role").textContent = store.profile.role || "Software Engineer";
  $("level-badge").textContent = `LVL ${level}`;
  $("rank-pill").textContent = rank;
  $("xp-fill").style.width = `${xpInLevel}%`;
  $("xp-text").textContent = `${xpInLevel} / 100 XP`;
  $("streak-pill").textContent = `СЕРИЯ: ${a.streak} ДН.`;

  $("month-label").textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  $("today-label").textContent = `${a.todayDay} ${MONTH_NAMES[currentMonth].slice(0, 3)}`;
  $("week-label").textContent = `ДНИ ${a.weekStart}–${a.todayDay}`;
  $("month-days-label").textContent = `${a.days} ДН.`;

  setRing("ring-day", "ring-day-pct", a.dayPct);
  $("day-done").textContent = a.dayDone;
  $("day-left").textContent = a.dayLeft;
  $("day-total").textContent = a.dayTotal;

  setRing("ring-week", "ring-week-pct", a.weekPct);
  $("week-done").textContent = a.weekDone;
  $("week-left").textContent = a.weekLeft;
  $("week-total").textContent = a.weekTotal;

  setRing("ring-month", "ring-month-pct", a.monthPct);
  $("month-done").textContent = a.monthDone;
  $("month-left").textContent = a.monthLeft;
  $("month-total").textContent = a.monthTotal;

  renderStatePeriodBox("state-day-avg", "state-day-bars", a.stateDay);
  renderStatePeriodBox("state-week-avg", "state-week-bars", a.stateWeek);
  renderStatePeriodBox("state-month-avg", "state-month-bars", a.stateMonth);
}

function renderStatePeriodBox(avgId, barsId, data) {
  $(avgId).textContent = data.overall > 0 ? `${data.overall.toFixed(1)} / 5.0` : "— / 5.0";
  const box = $(barsId);
  box.innerHTML = "";
  STATE_METRICS.forEach((m) => {
    const val = data[m.key] || 0;
    const pct = Math.round((val / 5) * 100);
    const row = document.createElement("div");
    row.className = "mini-row";
    row.innerHTML = `
      <span>${m.short}</span>
      <div class="mini-track"><div class="mini-fill" style="width:${pct}%;background:${m.color}"></div></div>
      <span class="mono">${val > 0 ? val.toFixed(1) : "—"}</span>
    `;
    box.appendChild(row);
  });
}

// ---------- ОТРИСОВКА ВЕЧЕРНЕГО ИТОГА ДНЯ (5 МИН) И ПЛАНА НА ЗАВТРА ----------
function renderEveningModule(a) {
  const winsInput = $("evening-wins-input");
  const releaseInput = $("evening-release-input");
  const savedWins = a.rec.eveningWins[a.todayDay] || "";
  const savedRelease = a.rec.eveningRelease[a.todayDay] || "";

  if (document.activeElement !== winsInput) winsInput.value = savedWins;
  if (document.activeElement !== releaseInput) releaseInput.value = savedRelease;

  // Список задач на завтра
  const plans = a.rec.tomorrowPlans || [];
  $("tomorrow-plan-count").textContent = `${plans.length} задач`;
  const listEl = $("tomorrow-list");
  listEl.innerHTML = "";

  plans.forEach((p) => {
    const li = document.createElement("li");
    li.className = `tomorrow-item ${p.done ? "done" : ""}`;
    li.innerHTML = `
      <div class="tomorrow-item-left" data-toggle-plan="${p.id}">
        <button type="button" class="chk-btn ${p.done ? "checked" : ""}">✓</button>
        <span>${escapeHtml(p.text)}</span>
      </div>
      <button type="button" class="row-act-btn del" data-del-plan="${p.id}" title="Удалить из плана">✕</button>
    `;
    listEl.appendChild(li);
  });

  // Умные предложения планов:
  // 1) 2 самые отстающие привычки из «Требуют внимания»
  const worstHabits = [...a.habitStats]
    .sort((x, y) => x.done - y.done || x.pct - y.pct)
    .slice(0, 2)
    .map((h) => ({
      text: `Подтянуть привычку: ${h.name} (сейчас ${h.done} из ${h.goal})`,
      tag: "ВНИМАНИЕ",
      cls: "focus",
    }));

  // 2) 3 готовых предложения из пула (прокручиваются кнопкой «↻ Обновить»)
  const poolSlice = [];
  for (let i = 0; i < 3; i++) {
    const item = PLAN_SUGGESTIONS_POOL[(suggestionOffset + i) % PLAN_SUGGESTIONS_POOL.length];
    poolSlice.push(item);
  }

  const allSuggestions = [...worstHabits, ...poolSlice];
  const sugBox = $("suggestions-box");
  sugBox.innerHTML = "";

  allSuggestions.forEach((s) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sug-btn";
    btn.innerHTML = `
      <span>+ ${escapeHtml(s.text)}</span>
      <span class="sug-tag ${s.cls}">${s.tag}</span>
    `;
    btn.addEventListener("click", () => {
      a.rec.tomorrowPlans.push({
        id: "tp" + Date.now() + Math.random().toString(16).slice(2, 5),
        text: s.text,
        done: false,
      });
      render();
      showToast("Добавлено в план на завтра");
    });
    sugBox.appendChild(btn);
  });
}

// ---------- ПУЛЬТ СЕГОДНЯШНЕГО ДНЯ ----------
function renderTodayWorkspace(a) {
  const list = $("today-habit-list");
  list.innerHTML = "";
  $("today-checklist-sub").textContent = `ДЕНЬ ${a.todayDay} · ВЫПОЛНЕНО ${a.dayDone}/${a.dayTotal}`;

  a.habitStats.forEach((h) => {
    const done = Boolean(a.rec.checks[h.id] && a.rec.checks[h.id][a.todayDay]);
    const li = document.createElement("li");
    li.className = `today-item ${done ? "done" : ""}`;
    li.innerHTML = `
      <div class="today-item-left">
        <button type="button" class="chk-btn ${done ? "checked" : ""}">✓</button>
        <span class="today-item-name">${escapeHtml(h.name)}</span>
      </div>
      <span class="mono card-sub">${h.done}/${h.goal} в мес.</span>
    `;
    li.addEventListener("click", () => {
      a.rec.checks[h.id][a.todayDay] = !done;
      render();
    });
    list.appendChild(li);
  });

  const qBox = $("quick-state-controls");
  qBox.innerHTML = "";
  const todayState = a.rec.states[a.todayDay] || {};
  STATE_METRICS.forEach((m) => {
    const cur = todayState[m.key] || 0;
    const row = document.createElement("div");
    row.className = "q-state-row";
    let btns = "";
    for (let v = 1; v <= 5; v++) {
      btns += `<button type="button" class="q-btn ${cur == v ? "active" : ""}" data-qmetric="${m.key}" data-qval="${v}">${v}</button>`;
    }
    row.innerHTML = `<span style="color:${m.color};font-weight:600">◈ ${m.label}</span><div class="q-btns">${btns}</div>`;
    qBox.appendChild(row);
  });

  $("focus-sessions-count").textContent = store.profile.focusSessions || 0;
}

// ---------- «ТРЕБУЮТ ВНИМАНИЯ» И «ТОП-5 ПРИВЫЧЕК» ----------
function renderRankings(a) {
  const attEl = $("attention-list");
  const topEl = $("top-list");
  attEl.innerHTML = "";
  topEl.innerHTML = "";

  const byWorst = [...a.habitStats].sort((x, y) => x.done - y.done || x.pct - y.pct).slice(0, 5);
  byWorst.forEach((h) => {
    const li = document.createElement("li");
    li.className = "rank-item";
    li.innerHTML = `
      <div class="rank-top">
        <span class="rank-name">• ${escapeHtml(h.name)}</span>
        <span class="rank-count">${h.done} из ${h.goal} (${h.pct}%)</span>
      </div>
      <div class="rank-bar"><div class="rank-bar-fill" style="width:${Math.min(100, h.pct)}%"></div></div>
    `;
    attEl.appendChild(li);
  });

  const byBest = [...a.habitStats].sort((x, y) => y.done - x.done || y.pct - x.pct).slice(0, 5);
  byBest.forEach((h, idx) => {
    const li = document.createElement("li");
    li.className = "rank-item";
    li.innerHTML = `
      <div class="rank-top">
        <span class="rank-name">${idx + 1}. ${escapeHtml(h.name)}</span>
        <span class="rank-count">${h.done} из ${h.goal} (${h.pct}%)</span>
      </div>
      <div class="rank-bar"><div class="rank-bar-fill" style="width:${Math.min(100, h.pct)}%"></div></div>
    `;
    topEl.appendChild(li);
  });
}

// ---------- ГРАФИК СОСТОЯНИЯ ЗА МЕСЯЦ (ОСИ X / Y) ----------
function renderStateChart(a) {
  const canvas = $("state-chart");
  if (!canvas || canvas.clientWidth === 0) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const pad = { left: 28, right: 12, top: 14, bottom: 24 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  ctx.font = "500 10px 'JetBrains Mono', monospace";

  for (let v = 1; v <= 5; v++) {
    const y = pad.top + ch - ((v - 1) / 4) * ch;
    ctx.strokeStyle = v === 1 ? "#2d364d" : "#181e2c";
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = "#6b7280";
    ctx.textAlign = "right";
    ctx.fillText(v, pad.left - 6, y + 3);
  }

  const stepX = cw / Math.max(1, a.days - 1);
  ctx.fillStyle = "#6b7280";
  ctx.textAlign = "center";
  for (let d = 1; d <= a.days; d++) {
    if (d === 1 || d % 5 === 0 || d === a.days) {
      const x = pad.left + (d - 1) * stepX;
      ctx.fillText(d, x, h - 6);
    }
  }

  STATE_METRICS.forEach((metric) => {
    ctx.strokeStyle = metric.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let d = 1; d <= a.days; d++) {
      const val = a.rec.states[d] && a.rec.states[d][metric.key];
      if (!val) continue;
      const x = pad.left + (d - 1) * stepX;
      const y = pad.top + ch - ((val - 1) / 4) * ch;
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    ctx.fillStyle = metric.color;
    for (let d = 1; d <= a.days; d++) {
      const val = a.rec.states[d] && a.rec.states[d][metric.key];
      if (!val) continue;
      const x = pad.left + (d - 1) * stepX;
      const y = pad.top + ch - ((val - 1) / 4) * ch;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// ---------- ГЛАВНАЯ МАТРИЦА МЕСЯЦА ----------
function renderMatrixTable(a) {
  const table = $("matrix-table");
  const days = a.days;
  const maxDaily = Math.max(1, a.hCount);

  const weeks = [];
  for (let start = 1; start <= days; start += 7) {
    const end = Math.min(days, start + 6);
    weeks.push({ index: weeks.length + 1, start, end, span: end - start + 1 });
  }

  let html = "";

  // 1. Столбики графика по каждому дню
  html += `<tr class="bars-row"><th class="col-name">Дневной график выполнения</th>`;
  for (let d = 1; d <= days; d++) {
    const done = a.dailyDone[d] || 0;
    const hPx = Math.round((done / maxDaily) * 60);
    html += `<td class="bar-cell"><div class="day-bar-wrap"><div class="day-bar" style="height:${hPx}px" title="День ${d}: ${done}/${a.hCount}"></div></div></td>`;
  }
  html += `<th colspan="3" class="col-summary">ИТОГИ МЕСЯЦА</th></tr>`;

  // 2. Цифры: Всего / Сделано / Осталось
  html += `<tr class="stat-row"><td class="col-name">Всего привычек</td>`;
  for (let d = 1; d <= days; d++) html += `<td>${a.hCount}</td>`;
  html += `<td colspan="3" class="col-summary">План: ${a.monthTotal}</td></tr>`;

  html += `<tr class="stat-row stat-done"><td class="col-name">Сделано за день</td>`;
  for (let d = 1; d <= days; d++) html += `<td>${a.dailyDone[d]}</td>`;
  html += `<td colspan="3" class="col-summary">Сделано: ${a.monthDone}</td></tr>`;

  html += `<tr class="stat-row stat-left"><td class="col-name">Осталось за день</td>`;
  for (let d = 1; d <= days; d++) html += `<td>${a.dailyLeft[d]}</td>`;
  html += `<td colspan="3" class="col-summary">Осталось: ${a.monthLeft}</td></tr>`;

  // 3. Недели 1..5
  html += `<tr class="week-header"><th class="col-name" rowspan="3">ПРИВЫЧКИ И СОСТОЯНИЕ</th>`;
  weeks.forEach((w) => {
    html += `<th colspan="${w.span}">Неделя ${w.index}</th>`;
  });
  html += `<th rowspan="3" class="col-summary">Сделано</th>`;
  html += `<th rowspan="3" class="col-summary">Осталось</th>`;
  html += `<th rowspan="3" class="col-progress">Прогресс</th></tr>`;

  // 4. Дни недели
  html += `<tr class="dow-header">`;
  for (let d = 1; d <= days; d++) {
    const dow = new Date(currentYear, currentMonth, d).getDay();
    const cls = d === a.todayDay ? "is-today" : "";
    html += `<th class="${cls}">${DOW_SHORT[dow]}</th>`;
  }
  html += `</tr>`;

  // 5. Числа месяца
  html += `<tr class="daynum-header">`;
  for (let d = 1; d <= days; d++) {
    const cls = d === a.todayDay ? "is-today" : "";
    html += `<th class="${cls}">${d}</th>`;
  }
  html += `</tr>`;

  // 6. Трекер состояния по дням (1–5) + Среднее
  STATE_METRICS.forEach((m) => {
    const avgVal = a.stateMonth[m.key];
    const pctVal = Math.round((avgVal / 5) * 100);
    html += `<tr class="state-row"><td class="col-name" style="color:${m.color}">◈ ${m.label} (1–5)</td>`;
    for (let d = 1; d <= days; d++) {
      const cur = (a.rec.states[d] && a.rec.states[d][m.key]) || "";
      html += `<td><select class="state-select" data-day="${d}" data-metric="${m.key}">
        <option value="" ${cur === "" ? "selected" : ""}>·</option>
        <option value="1" ${cur == 1 ? "selected" : ""}>1</option>
        <option value="2" ${cur == 2 ? "selected" : ""}>2</option>
        <option value="3" ${cur == 3 ? "selected" : ""}>3</option>
        <option value="4" ${cur == 4 ? "selected" : ""}>4</option>
        <option value="5" ${cur == 5 ? "selected" : ""}>5</option>
      </select></td>`;
    }
    html += `<td colspan="2" class="col-summary">Среднее: <b>${avgVal > 0 ? avgVal.toFixed(1) : "—"}</b></td>`;
    html += `<td class="col-progress"><div class="row-prog"><div class="row-prog-track"><div class="row-prog-fill" style="width:${pctVal}%;background:${m.color}"></div></div><span class="row-prog-pct">${pctVal}%</span></div></td></tr>`;
  });

  // 7. Привычки
  a.habitStats.forEach((h) => {
    html += `<tr class="habit-row"><td class="col-name">
      <div class="habit-name-cell">
        <span>${escapeHtml(h.name)}</span>
        <div class="row-actions">
          <button type="button" class="row-act-btn" data-edit="${h.id}" title="Редактировать привычку">✎</button>
          <button type="button" class="row-act-btn del" data-del="${h.id}" title="Удалить привычку">✕</button>
        </div>
      </div>
    </td>`;
    for (let d = 1; d <= days; d++) {
      const checked = Boolean(a.rec.checks[h.id] && a.rec.checks[h.id][d]);
      html += `<td><button type="button" class="chk-btn ${checked ? "checked" : ""}" data-habit="${h.id}" data-day="${d}">✓</button></td>`;
    }
    html += `<td class="col-summary"><b>${h.done}</b></td>`;
    html += `<td class="col-summary">${h.left}</td>`;
    html += `<td class="col-progress"><div class="row-prog"><div class="row-prog-track"><div class="row-prog-fill" style="width:${Math.min(100, h.pct)}%"></div></div><span class="row-prog-pct">${h.pct}%</span></div></td></tr>`;
  });

  // 8. Итоги по неделям
  html += `<tr class="week-summary-row"><td class="col-name">Выполнено за неделю</td>`;
  weeks.forEach((w) => {
    let wDone = 0;
    let wTotal = w.span * a.hCount;
    for (let d = w.start; d <= w.end; d++) wDone += a.dailyDone[d] || 0;
    const wPct = wTotal > 0 ? Math.round((wDone / wTotal) * 100) : 0;
    html += `<td colspan="${w.span}">${wDone} из ${wTotal} (${wPct}%)</td>`;
  });
  html += `<td class="col-summary"><b>${a.monthDone}</b></td>`;
  html += `<td class="col-summary">${a.monthLeft}</td>`;
  html += `<td class="col-progress"><div class="row-prog"><div class="row-prog-track"><div class="row-prog-fill" style="width:${Math.min(100, a.monthPct)}%"></div></div><span class="row-prog-pct">${a.monthPct}%</span></div></td></tr>`;

  table.innerHTML = html;
}

// ---------- ДОСТИЖЕНИЯ ----------
function renderAchievements(a) {
  const grid = $("ach-grid");
  grid.innerHTML = "";
  let unlockedCount = 0;
  ACHIEVEMENTS.forEach((ach) => {
    const ok = ach.check(a);
    if (ok) unlockedCount++;
    const card = document.createElement("div");
    card.className = `ach-card ${ok ? "unlocked" : ""}`;
    card.innerHTML = `
      <div class="ach-code">[${ach.code}] ${ok ? "ВЫПОЛНЕНО" : "ЗАКРЫТО"}</div>
      <div class="ach-title">${ach.title}</div>
      <div class="ach-desc">${ach.desc}</div>
    `;
    grid.appendChild(card);
  });
  $("ach-counter").textContent = `${unlockedCount} / ${ACHIEVEMENTS.length} ОТКРЫТО`;
  $("nav-ach-count").textContent = `${unlockedCount}/${ACHIEVEMENTS.length}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ----------
function applyTabVisibility() {
  document.querySelectorAll("[data-section]").forEach((sec) => {
    const allowed = sec.dataset.section.split(" ");
    sec.hidden = !allowed.includes(activeTab);
  });
}

function render() {
  applyTabVisibility();
  const analytics = computeAnalytics();
  saveStore();
  renderHeaderAndKPIs(analytics);
  renderEveningModule(analytics);
  renderTodayWorkspace(analytics);
  renderRankings(analytics);
  renderStateChart(analytics);
  renderMatrixTable(analytics);
  renderAchievements(analytics);
}

// ---------- СОБЫТИЯ МОДУЛЯ «ВЕЧЕРНИЙ ИТОГ И ПЛАН НА ЗАВТРА» ----------
$("evening-wins-input").addEventListener("input", (e) => {
  const a = computeAnalytics();
  a.rec.eveningWins[a.todayDay] = e.target.value;
  saveStore();
});

$("evening-release-input").addEventListener("input", (e) => {
  const a = computeAnalytics();
  a.rec.eveningRelease[a.todayDay] = e.target.value;
  saveStore();
});

// Автоматически собрать список выполненных за сегодня привычек
$("autofill-wins-btn").addEventListener("click", () => {
  const a = computeAnalytics();
  const doneNames = store.habits
    .filter((h) => a.rec.checks[h.id] && a.rec.checks[h.id][a.todayDay])
    .map((h) => `✓ ${h.name}`);

  const summary = doneNames.length > 0
    ? `Выполнено за день (${doneNames.length}/${a.hCount}):\n` + doneNames.join("\n")
    : "Сегодня сделал полезные шаги и подвёл вечерний итог дня.";

  a.rec.eveningWins[a.todayDay] = summary;
  $("evening-wins-input").value = summary;
  saveStore();
  showToast("Итоги дня собраны из отмеченных привычек");
});

$("tomorrow-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("tomorrow-input");
  const text = input.value.trim();
  if (!text) return;
  const a = computeAnalytics();
  a.rec.tomorrowPlans.push({
    id: "tp" + Date.now(),
    text,
    done: false,
  });
  input.value = "";
  render();
  showToast("Задача добавлена в план на завтра");
});

$("tomorrow-list").addEventListener("click", (e) => {
  const toggleEl = e.target.closest("[data-toggle-plan]");
  const a = computeAnalytics();
  if (toggleEl) {
    const item = a.rec.tomorrowPlans.find((p) => p.id === toggleEl.dataset.togglePlan);
    if (item) item.done = !item.done;
    render();
    return;
  }
  const delBtn = e.target.closest("[data-del-plan]");
  if (delBtn) {
    a.rec.tomorrowPlans = a.rec.tomorrowPlans.filter((p) => p.id !== delBtn.dataset.delPlan);
    render();
  }
});

$("refresh-suggestions-btn").addEventListener("click", () => {
  suggestionOffset = (suggestionOffset + 3) % PLAN_SUGGESTIONS_POOL.length;
  render();
});

// Таймер вечернего ритуала (по умолчанию 5 мин, можно ввести любое значение)
let eveningTotalSec = 5 * 60;
let eveningSec = 5 * 60;
let eveningTimerId = null;

function updateEveningClock() {
  const m = String(Math.floor(eveningSec / 60)).padStart(2, "0");
  const s = String(eveningSec % 60).padStart(2, "0");
  $("evening-timer-display").textContent = `${m}:${s}`;
}

$("evening-custom-mins").addEventListener("input", (e) => {
  const mins = Math.min(180, Math.max(1, Number(e.target.value) || 1));
  clearInterval(eveningTimerId);
  eveningTimerId = null;
  $("evening-timer-btn").textContent = "⏱ Старт";
  eveningTotalSec = mins * 60;
  eveningSec = eveningTotalSec;
  updateEveningClock();
});

$("evening-timer-display").addEventListener("click", () => {
  $("evening-custom-mins").focus();
  $("evening-custom-mins").select();
});

$("evening-timer-btn").addEventListener("click", () => {
  if (eveningTimerId) {
    clearInterval(eveningTimerId);
    eveningTimerId = null;
    $("evening-timer-btn").textContent = "⏱ Старт";
    return;
  }
  $("evening-timer-btn").textContent = "⏸ Пауза";
  eveningTimerId = setInterval(() => {
    eveningSec--;
    updateEveningClock();
    if (eveningSec <= 0) {
      clearInterval(eveningTimerId);
      eveningTimerId = null;
      eveningSec = eveningTotalSec;
      updateEveningClock();
      $("evening-timer-btn").textContent = "⏱ Старт";
      showToast("Время вечернего итога завершено! Можно отдыхать.");
    }
  }, 1000);
});

$("evening-timer-reset").addEventListener("click", () => {
  clearInterval(eveningTimerId);
  eveningTimerId = null;
  $("evening-timer-btn").textContent = "⏱ Старт";
  eveningSec = eveningTotalSec;
  updateEveningClock();
});

$("complete-evening-btn").addEventListener("click", () => {
  const a = computeAnalytics();
  const eveningHabit = store.habits.find(
    (h) => h.id === "h_evening" || h.name.toLowerCase().includes("вечерний")
  );
  if (eveningHabit) {
    if (!a.rec.checks[eveningHabit.id]) a.rec.checks[eveningHabit.id] = {};
    a.rec.checks[eveningHabit.id][a.todayDay] = true;
  }
  store.profile.bonusXp = (store.profile.bonusXp || 0) + 15;
  render();
  showToast("Вечерний итог зафиксирован! +15 XP. Спокойного сна.");
});

// ---------- МОДАЛЬНОЕ ОКНО ПРОФИЛЯ И СМЕНЫ НИКА ----------
function openProfileModal() {
  $("profile-name-input").value = store.profile.name || "OPERATOR";
  $("profile-role-input").value = store.profile.role || "";
  selectedEmblemInModal = store.profile.emblem || "terminal";
  renderEmblemPicker();
  $("profile-modal").hidden = false;
  $("profile-name-input").focus();
}

function renderEmblemPicker() {
  const picker = $("emblem-picker");
  picker.innerHTML = "";
  EMBLEMS.forEach((e) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `emblem-opt ${e.id === selectedEmblemInModal ? "selected" : ""}`;
    btn.innerHTML = e.svg;
    btn.addEventListener("click", () => {
      selectedEmblemInModal = e.id;
      renderEmblemPicker();
    });
    picker.appendChild(btn);
  });
}

$("open-profile-btn").addEventListener("click", openProfileModal);

$("profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const newName = $("profile-name-input").value.trim();
  const newRole = $("profile-role-input").value.trim();
  if (newName) store.profile.name = newName;
  store.profile.role = newRole || "Software Engineer";
  store.profile.emblem = selectedEmblemInModal;
  $("profile-modal").hidden = true;
  render();
  showToast(`Профиль обновлён: ${store.profile.name}`);
});

// ---------- МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ПРИВЫЧКИ ----------
function openHabitModal(habitId) {
  const h = store.habits.find((item) => item.id === habitId);
  if (!h) return;
  $("edit-habit-id").value = h.id;
  $("edit-habit-name").value = h.name;
  $("edit-habit-goal").value = h.goal || 30;
  $("habit-modal").hidden = false;
  $("edit-habit-name").focus();
}

$("edit-habit-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = $("edit-habit-id").value;
  const h = store.habits.find((item) => item.id === id);
  if (h) {
    h.name = $("edit-habit-name").value.trim() || h.name;
    h.goal = Math.min(31, Math.max(1, Number($("edit-habit-goal").value) || 30));
  }
  $("habit-modal").hidden = true;
  render();
  showToast("Привычка сохранена");
});

$("delete-habit-modal-btn").addEventListener("click", () => {
  const id = $("edit-habit-id").value;
  store.habits = store.habits.filter((h) => h.id !== id);
  $("habit-modal").hidden = true;
  render();
  showToast("Привычка удалена");
});

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    $(btn.dataset.close).hidden = true;
  });
});

document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.hidden = true;
  });
});

// ---------- СОБЫТИЯ МАТРИЦЫ И ПУЛЬТА СЕГОДНЯ ----------
$("matrix-table").addEventListener("click", (e) => {
  const chk = e.target.closest(".chk-btn");
  if (chk) {
    const hId = chk.dataset.habit;
    const day = Number(chk.dataset.day);
    const rec = ensureMonthRecord(currentYear, currentMonth);
    rec.checks[hId][day] = !rec.checks[hId][day];
    render();
    return;
  }

  const editBtn = e.target.closest("[data-edit]");
  if (editBtn) {
    openHabitModal(editBtn.dataset.edit);
    return;
  }

  const delBtn = e.target.closest("[data-del]");
  if (delBtn) {
    store.habits = store.habits.filter((h) => h.id !== delBtn.dataset.del);
    render();
    showToast("Привычка удалена");
  }
});

$("matrix-table").addEventListener("change", (e) => {
  const sel = e.target.closest(".state-select");
  if (!sel) return;
  const day = Number(sel.dataset.day);
  const metric = sel.dataset.metric;
  const val = sel.value ? Number(sel.value) : null;
  const rec = ensureMonthRecord(currentYear, currentMonth);
  if (!rec.states[day]) rec.states[day] = {};
  if (val) rec.states[day][metric] = val;
  else delete rec.states[day][metric];
  render();
});

$("quick-state-controls").addEventListener("click", (e) => {
  const btn = e.target.closest(".q-btn");
  if (!btn) return;
  const metric = btn.dataset.qmetric;
  const val = Number(btn.dataset.qval);
  const a = computeAnalytics();
  if (!a.rec.states[a.todayDay]) a.rec.states[a.todayDay] = {};
  a.rec.states[a.todayDay][metric] = val;
  render();
});

$("add-habit-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nameInput = $("habit-name-input");
  const goalInput = $("habit-goal-input");
  const name = nameInput.value.trim();
  if (!name) return;
  const maxDays = daysInMonth(currentYear, currentMonth);
  const goal = goalInput.value ? Math.min(31, Math.max(1, Number(goalInput.value))) : maxDays;
  store.habits.push({ id: "h" + Date.now(), name, goal });
  nameInput.value = "";
  goalInput.value = "";
  render();
  showToast(`Добавлена привычка: ${name}`);
});

$("nav-tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeTab = btn.dataset.tab;
  render();
});

$("prev-month").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  render();
});

$("next-month").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  render();
});

$("demo-btn").addEventListener("click", () => {
  if (store.habits.length === 0) store.habits = defaultHabits();
  const mk = monthKey(currentYear, currentMonth);
  store.months[mk] = seedMonthData(currentYear, currentMonth, store.habits);
  render();
  showToast("Демо-данные за месяц загружены");
});

$("reset-btn").addEventListener("click", () => {
  const mk = monthKey(currentYear, currentMonth);
  store.months[mk] = { checks: {}, states: {}, eveningWins: {}, eveningRelease: {}, tomorrowPlans: [] };
  render();
  showToast("Отметки текущего месяца очищены");
});

// ---------- БЭКАП (ЭКСПОРТ / ИМПОРТ JSON) ----------
$("backup-btn").addEventListener("click", () => {
  $("backup-textarea").value = JSON.stringify(store, null, 2);
  $("backup-modal").hidden = false;
});

$("download-json-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nexus-backup-${monthKey(currentYear, currentMonth)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Файл резервной копии скачан");
});

$("import-json-btn").addEventListener("click", () => {
  try {
    const parsed = JSON.parse($("backup-textarea").value);
    if (!parsed.habits || !parsed.months) throw new Error("Invalid format");
    store = parsed;
    saveStore();
    $("backup-modal").hidden = true;
    render();
    showToast("Данные успешно импортированы");
  } catch {
    showToast("Ошибка: неверный формат JSON");
  }
});

// ---------- ФОКУС-ТАЙМЕР (POMODORO) ----------
let timerTotalSec = 25 * 60;
let timerRemainingSec = 25 * 60;
let timerInterval = null;

function updateTimerView() {
  const m = String(Math.floor(timerRemainingSec / 60)).padStart(2, "0");
  const s = String(timerRemainingSec % 60).padStart(2, "0");
  $("timer-display").textContent = `${m}:${s}`;
}

document.querySelectorAll(".timer-modes button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".timer-modes button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    clearInterval(timerInterval);
    timerInterval = null;
    $("timer-start").textContent = "СТАРТ";
    const mins = Number(btn.dataset.mins);
    $("focus-custom-mins").value = mins;
    timerTotalSec = mins * 60;
    timerRemainingSec = timerTotalSec;
    updateTimerView();
  });
});

$("focus-custom-mins").addEventListener("input", (e) => {
  const mins = Math.min(240, Math.max(1, Number(e.target.value) || 1));
  document.querySelectorAll(".timer-modes button").forEach((b) => b.classList.remove("active"));
  clearInterval(timerInterval);
  timerInterval = null;
  $("timer-start").textContent = "СТАРТ";
  timerTotalSec = mins * 60;
  timerRemainingSec = timerTotalSec;
  updateTimerView();
});

$("timer-display").addEventListener("click", () => {
  $("focus-custom-mins").focus();
  $("focus-custom-mins").select();
});

$("timer-start").addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    $("timer-start").textContent = "СТАРТ";
    return;
  }
  $("timer-start").textContent = "ПАУЗА";
  timerInterval = setInterval(() => {
    timerRemainingSec--;
    updateTimerView();
    if (timerRemainingSec <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      $("timer-start").textContent = "СТАРТ";
      timerRemainingSec = timerTotalSec;
      updateTimerView();
      store.profile.focusSessions = (store.profile.focusSessions || 0) + 1;
      store.profile.bonusXp = (store.profile.bonusXp || 0) + 25;
      render();
      showToast("Фокус-сессия завершена! +25 XP");
    }
  }, 1000);
});

$("timer-reset").addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  $("timer-start").textContent = "СТАРТ";
  timerRemainingSec = timerTotalSec;
  updateTimerView();
});

window.addEventListener("resize", () => {
  const analytics = computeAnalytics();
  renderStateChart(analytics);
});

// Старт приложения
render();
