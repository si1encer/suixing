"use strict";

const STORAGE_KEY = "suixing-travel-data-v1";
const UI_KEY = "suixing-travel-ui-v1";

const CATEGORY = {
  "景点": { icon: "览", bg: "#dce7dc", dot: "#76957e" },
  "美食": { icon: "吃", bg: "#f3d4c9", dot: "#d66f55" },
  "酒店": { icon: "住", bg: "#dbe1eb", dot: "#8494ab" },
  "活动": { icon: "玩", bg: "#f4e2b5", dot: "#e1ad3d" },
  "交通": { icon: "行", bg: "#d7e4e7", dot: "#70929c" }
};

const THEMES = {
  forest: { name: "森林", className: "forest", color: "#4b6657" },
  coast: { name: "海岸", className: "coast", color: "#426b75" },
  autumn: { name: "秋日", className: "autumn", color: "#846b4d" },
  city: { name: "城市", className: "city", color: "#65616e" }
};

const seedData = {
  version: 1,
  activeTripId: "quanzhou-new-year",
  trips: [
    {
      id: "quanzhou-new-year",
      title: "元旦 · 泉州",
      destination: "泉州",
      english: "QUANZHOU",
      tagline: "半城烟火，半城仙",
      startDate: "2026-12-31",
      endDate: "2027-01-03",
      theme: "coast",
      stays: [
        {
          id: "qz-stay-1",
          name: "西街小院酒店",
          address: "泉州市鲤城区西街附近",
          startDate: "2026-12-31",
          endDate: "2027-01-03",
          note: "示例住宿，可在住宿模块中修改"
        }
      ],
      days: [
        { title: "抵达 · 老城散步", note: "不赶景点，从一碗面线糊开始。" },
        { title: "簪花 · 去看海", note: "早点出门，把下午留给海边。" },
        { title: "桥与旧时光", note: "今天只安排两件事，其余看心情。" },
        { title: "慢慢回家", note: "给买伴手礼和赖床留出时间。" }
      ],
      activities: [
        {
          id: "qz-1", title: "泉州站 → 西街", category: "交通", day: 0, time: "14:20",
          duration: "约 40 分钟", cost: "¥20", location: "泉州站", note: "打车到西街附近，先放行李。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-2", title: "西街闲逛 + 开元寺", category: "景点", day: 0, time: "16:00",
          duration: "2 小时", cost: "免费", location: "西街 / 开元寺", note: "没有必打卡路线，看到小巷就钻进去。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-3", title: "面线糊配油条", category: "美食", day: 0, time: "18:30",
          duration: "1 小时", cost: "¥35", location: "老城区", note: "找一家本地人多的店，吃完去钟楼散步。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-4", title: "蟳埔村簪花", category: "活动", day: 1, time: "09:30",
          duration: "3 小时", cost: "¥200 内", location: "蟳埔村", note: "提前预约，穿舒服的鞋。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-5", title: "海蛎煎和牛肉羹", category: "美食", day: 1, time: "13:30",
          duration: "1 小时", cost: "¥50", location: "蟳埔 / 丰泽", note: "簪花拍完就近吃，不特地折返。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-6", title: "清净寺与关岳庙", category: "景点", day: 1, time: "16:00",
          duration: "2 小时", cost: "¥3", location: "涂门街", note: "两处离得近，傍晚的光线最好。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-7", title: "洛阳桥吹风", category: "景点", day: 2, time: "10:00",
          duration: "2 小时", cost: "免费", location: "洛阳桥", note: "如果前一天太累，就改到下午。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-8", title: "木偶剧院看一场戏", category: "活动", day: 2, time: "19:30",
          duration: "1.5 小时", cost: "¥50", location: "泉州木偶剧院", note: "需确认当天场次，没票就去看夜景。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-9", title: "吃一块刚出锅的绿豆饼", category: "美食", day: 2, time: "15:30",
          duration: "30 分钟", cost: "¥15", location: "老城区", note: "不用专门排队，路过人少就买。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-10", title: "买伴手礼，去车站", category: "交通", day: 3, time: "12:30",
          duration: "2 小时", cost: "¥30", location: "西街 / 泉州站", note: "最晚 13:30 出发去车站。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-idea-1", title: "小岞风车岛", category: "景点", day: -1, time: "",
          duration: "半天", cost: "约 ¥80", location: "惠安小岞", note: "天气好才去，来回车程较长。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-idea-2", title: "晚上逛一场市集", category: "活动", day: -1, time: "",
          duration: "看心情", cost: "待定", location: "泉州老城", note: "出发前再搜最近的活动安排。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        },
        {
          id: "qz-idea-3", title: "找一间有天台的小酒店", category: "酒店", day: -1, time: "",
          duration: "3 晚", cost: "¥1000 内", location: "西街附近", note: "优先看能否步行到老城。",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        }
      ]
    },
    {
      id: "hangzhou-october",
      title: "国庆 · 杭州",
      destination: "杭州",
      english: "HANGZHOU",
      tagline: "闻着桂花香，走得很慢",
      startDate: "2026-10-01",
      endDate: "2026-10-05",
      theme: "autumn",
      stays: [
        {
          id: "hz-stay-1",
          name: "西湖边精品酒店",
          address: "杭州市西湖风景区附近",
          startDate: "2026-10-01",
          endDate: "2026-10-05",
          note: ""
        }
      ],
      days: [
        { title: "西湖边见面", note: "" },
        { title: "进山喝茶", note: "" },
        { title: "桂花味的下午", note: "" },
        { title: "没有计划的一天", note: "" },
        { title: "回程", note: "" }
      ],
      activities: [
        {
          id: "hz-1", title: "拖着箱子去西湖", category: "交通", day: 0, time: "14:00",
          duration: "1 小时", cost: "¥18", location: "凤起路", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-10-01",
          reflection: "一走出地铁就闻到桂花味，旅行真正开始了。"
        },
        {
          id: "hz-2", title: "绕苏堤走到日落", category: "景点", day: 0, time: "16:30",
          duration: "2.5 小时", cost: "免费", location: "苏堤", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-10-01",
          reflection: "原计划只走一半，结果一直走到了灯亮。"
        },
        {
          id: "hz-3", title: "片儿川和葱包桧", category: "美食", day: 1, time: "12:00",
          duration: "1 小时", cost: "¥68", location: "河坊街附近", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-10-02",
          reflection: "排队最久的一顿，但热汤很值得。"
        },
        {
          id: "hz-4", title: "灵隐寺的清晨", category: "景点", day: 1, time: "08:00",
          duration: "3 小时", cost: "¥75", location: "灵隐寺", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-10-02",
          reflection: "因为起晚了，清早变成了中午，但还是很喜欢。"
        },
        {
          id: "hz-5", title: "九溪烟树徒步", category: "景点", day: 2, time: "10:30",
          duration: "2 小时", cost: "免费", location: "九溪", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-10-03",
          reflection: "鞋子湿了，笑了一路。"
        },
        {
          id: "hz-6", title: "在龙井村喝茶发呆", category: "美食", day: 2, time: "15:00",
          duration: "2 小时", cost: "¥120", location: "龙井村", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-10-03",
          reflection: "没去下一个景点，坐在院子里看了一下午树影。"
        },
        {
          id: "hz-7", title: "桂语山房吃晚饭", category: "美食", day: 3, time: "18:00",
          duration: "2 小时", cost: "¥280", location: "满觉陇", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-10-04",
          reflection: "为这一顿专门留着肚子。"
        },
        {
          id: "hz-8", title: "去良渚看一场展", category: "活动", day: -1, time: "",
          duration: "半天", cost: "¥60", location: "良渚", note: "",
          link: "", status: "todo", photo: "", reflection: "", doneAt: null
        }
      ]
    },
    {
      id: "qingdao-summer",
      title: "盛夏 · 青岛",
      destination: "青岛",
      english: "QINGDAO",
      tagline: "把脚伸进海风里",
      startDate: "2026-08-08",
      endDate: "2026-08-11",
      theme: "coast",
      days: [
        { title: "去海边", note: "" },
        { title: "老城散步", note: "" },
        { title: "看日出", note: "" },
        { title: "慢慢回家", note: "" }
      ],
      activities: [
        {
          id: "qd-1", title: "小麦岛等日落", category: "景点", day: 0, time: "17:00",
          duration: "2 小时", cost: "免费", location: "小麦岛", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-08-08",
          reflection: "人很多，但海风把一路的疲惫都吹走了。"
        },
        {
          id: "qd-2", title: "台东夜市吃到走不动", category: "美食", day: 0, time: "20:00",
          duration: "2 小时", cost: "¥120", location: "台东步行街", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-08-08",
          reflection: "烤鱿鱼和袋装啤酒，正式喜欢上青岛。"
        },
        {
          id: "qd-3", title: "沿着老城区乱走", category: "景点", day: 1, time: "14:00",
          duration: "3 小时", cost: "免费", location: "大学路 / 龙江路", note: "",
          link: "", status: "done", photo: "", doneAt: "2026-08-09",
          reflection: "放弃导航之后，遇到了一条特别安静的坡道。"
        }
      ]
    }
  ]
};

let state = loadState();
let ui = loadUi();
let currentView = "home";
let selectedTripId = state.activeTripId || state.trips[0]?.id || null;
let tripFilter = ui.tripFilter || "all";
let navHistory = [];
let deferredInstallPrompt = null;
let toastTimer = null;
let pendingPhotoData = null;
let currentActivityId = null;
let activeConfirmResolver = null;

init();

function init() {
  bindGlobalEvents();
  renderAll();
  updateTodayLabel();
  registerServiceWorker();
  if ("serviceWorker" in navigator) {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      const button = document.getElementById("installButton");
      if (button) button.querySelector("small").textContent = "现在即可安装到手机桌面";
    });
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.trips) && saved.trips.length >= 0) return migrateState(saved);
  } catch (error) {
    console.warn("Could not read saved travel data.", error);
  }
  return structuredCloneSafe(seedData);
}

function migrateState(data) {
  return {
    version: 1,
    activeTripId: data.activeTripId || data.trips[0]?.id || null,
    trips: data.trips.map((trip) => ({
      ...trip,
      theme: THEMES[trip.theme] ? trip.theme : "forest",
      stays: Array.isArray(trip.stays) ? trip.stays : [],
      days: Array.isArray(trip.days) ? trip.days : [],
      activities: (trip.activities || []).map((activity) => ({
        status: "todo",
        photo: "",
        reflection: "",
        doneAt: null,
        ...activity
      }))
    }))
  };
}

function loadUi() {
  try {
    return JSON.parse(localStorage.getItem(UI_KEY)) || {};
  } catch {
    return {};
  }
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(UI_KEY, JSON.stringify({ tripFilter, lastSearch: ui.lastSearch || "" }));
    return true;
  } catch (error) {
    console.error("Could not save travel data.", error);
    showToast("照片可能太大，存储空间已满。请先导出备份。");
    return false;
  }
}

function renderAll() {
  renderHome();
  if (currentView === "trip") renderTrip();
  renderDiscover();
  renderFootprints();
  renderProfile();
  updateChrome();
}

function updateTodayLabel() {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(now);
  document.getElementById("todayLabel").textContent =
    `${now.getMonth() + 1}月${now.getDate()}日 · ${weekday} · TRAVEL NOTES`;
}

function renderHome() {
  const featured = getFeaturedTrip();
  const featuredEl = document.getElementById("featuredTrip");
  if (featured) {
    featuredEl.innerHTML = featuredTripMarkup(featured);
  } else {
    featuredEl.innerHTML = `
      <div class="empty-featured">
        <div>
          <span>＋</span>
          <h2>从下一次出发开始</h2>
          <p>先建一张简单的旅行卡，之后再慢慢添东西。</p>
          <button class="button button--primary" type="button" data-action="new-trip">新建第一段旅行</button>
        </div>
      </div>`;
  }
  renderTripGrid();
  renderProfileSummary();
}

function getFeaturedTrip() {
  const today = startOfDay(new Date());
  const active = findTrip(state.activeTripId);
  if (active && getTripStatus(active) === "ongoing") return active;
  const future = state.trips
    .filter((trip) => parseDate(trip.endDate) >= today)
    .sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate));
  if (future.length) return future[0];
  if (active) return active;
  return state.trips.slice().sort((a, b) => parseDate(b.endDate) - parseDate(a.endDate))[0] || null;
}

function featuredTripMarkup(trip) {
  const stats = getTripStats(trip);
  const status = getTripStatus(trip);
  const countdown = getCountdownLabel(trip);
  const statusLabel = status === "ongoing" ? "正在旅行" : status === "upcoming" ? "下一段旅程" : "旅行回忆";
  return `
    <article class="featured-card featured-card--${escapeAttr(trip.theme)}" data-trip-id="${escapeAttr(trip.id)}" role="button" tabindex="0">
      <div class="featured-top">
        <span class="featured-label"><i></i>${statusLabel}</span>
        <span class="featured-countdown">${escapeHtml(countdown)}</span>
      </div>
      <div class="featured-body">
        <p class="featured-city-en">${escapeHtml(trip.english || pinyinFallback(trip.destination))}</p>
        <h2>${escapeHtml(trip.destination)}</h2>
        <p class="featured-date">${escapeHtml(formatShortDate(trip.startDate))} — ${escapeHtml(formatShortDate(trip.endDate))} · ${stats.dayCount} 天</p>
        <div class="featured-illustration" aria-hidden="true"><span class="sun-disc"></span><span class="hill"></span></div>
      </div>
      <div class="featured-footer">
        <span class="featured-progress-text"><strong>${stats.done}</strong> / ${stats.total || 0} 件事</span>
        <button class="round-arrow" type="button" aria-label="打开${escapeAttr(trip.title)}" data-trip-id="${escapeAttr(trip.id)}">→</button>
      </div>
    </article>`;
}

function renderTripGrid() {
  const filtered = state.trips.filter((trip) => {
    const status = getTripStatus(trip);
    if (tripFilter === "upcoming") return status === "upcoming" || status === "ongoing";
    if (tripFilter === "past") return status === "past";
    return true;
  });
  const sorted = filtered.sort((a, b) => {
    const aPast = getTripStatus(a) === "past" ? 1 : 0;
    const bPast = getTripStatus(b) === "past" ? 1 : 0;
    if (aPast !== bPast) return aPast - bPast;
    return bPast ? parseDate(b.startDate) - parseDate(a.startDate) : parseDate(a.startDate) - parseDate(b.startDate);
  });
  const cards = sorted.map(tripCardMarkup).join("");
  document.getElementById("tripGrid").innerHTML = cards + `
    <button class="trip-card trip-card--draft" type="button" data-action="new-trip" aria-label="新建旅行">
      <span class="draft-copy"><b>下一段去哪儿？</b><p>建一张新的旅行卡</p></span>
    </button>`;
}

function tripCardMarkup(trip) {
  const stats = getTripStats(trip);
  const status = getTripStatus(trip);
  const label = status === "upcoming" ? "计划中" : status === "ongoing" ? "旅行中" : "已归档";
  const percentage = stats.total ? Math.round(stats.done / stats.total * 100) : 0;
  return `
    <button class="trip-card trip-card--${escapeAttr(trip.theme)} ${status === "past" ? "trip-card--past" : ""}" type="button" data-trip-id="${escapeAttr(trip.id)}">
      <span class="trip-status">${label}</span>
      <span class="trip-card-name">
        <h3>${escapeHtml(trip.destination)}</h3>
        <p>${escapeHtml(formatShortDate(trip.startDate))} — ${escapeHtml(formatShortDate(trip.endDate))}</p>
      </span>
      <span class="trip-progress">
        <span>${stats.done}/${stats.total || 0}</span>
        <span class="trip-progress-bar"><i style="width:${percentage}%"></i></span>
      </span>
    </button>`;
}

function openTrip(tripId, options = {}) {
  const trip = findTrip(tripId);
  if (!trip) {
    showToast("这段旅行已不存在");
    return;
  }
  selectedTripId = trip.id;
  state.activeTripId = trip.id;
  ui.currentDay = "all";
  persist();
  navigate("trip", { push: options.push !== false });
}

function renderTrip() {
  const trip = findTrip(selectedTripId) || getFeaturedTrip();
  if (!trip) {
    selectedTripId = null;
    document.getElementById("tripView").innerHTML = `
      <div class="subpage-heading"><p class="eyebrow">NO JOURNEY YET</p><h1>还没有<br><em>旅行清单。</em></h1></div>
      <button class="button button--primary button--wide" type="button" data-action="new-trip">新建一段旅行</button>`;
    return;
  }
  selectedTripId = trip.id;
  const requestedDay = Number(ui.currentDay);
  if (ui.currentDay !== "all" && (!Number.isInteger(requestedDay) || requestedDay < 0 || requestedDay >= trip.days.length)) {
    ui.currentDay = "all";
  }
  const stats = getTripStats(trip);
  const status = getTripStatus(trip);
  const dayTabs = [
    `<button class="day-tab ${ui.currentDay === "all" ? "day-tab--active" : ""}" type="button" data-day="all"><b>总览</b><small>${stats.dayCount} 天</small></button>`,
    ...trip.days.map((day, index) => {
      const date = addDays(trip.startDate, index);
      return `<button class="day-tab ${Number(ui.currentDay) === index ? "day-tab--active" : ""}" type="button" data-day="${index}">
        <b>DAY ${index + 1}</b><small>${formatMonthDay(date)}</small>
      </button>`;
    })
  ].join("");

  const busyDays = new Set(trip.activities.filter((item) => item.day >= 0).map((item) => item.day));
  const content = ui.currentDay === "all"
    ? trip.days.map((day, index) => renderDaySection(trip, day, index, busyDays)).join("")
    : renderDaySection(trip, trip.days[Number(ui.currentDay)] || {}, Number(ui.currentDay), busyDays);

  document.getElementById("tripView").innerHTML = `
    <header class="trip-cover trip-cover--${escapeAttr(trip.theme)}">
      <span class="trip-cover-label">${status === "ongoing" ? "● 正在旅行" : status === "upcoming" ? `还有 ${daysBetween(new Date(), parseDate(trip.startDate))} 天` : "旅行已归档"}</span>
      <div class="trip-cover-menu">
        <button class="cover-menu-button" type="button" data-action="edit-trip" aria-label="编辑行程">✎</button>
      </div>
      <h1>${escapeHtml(trip.destination)}</h1>
      <p class="trip-cover-sub">${escapeHtml(formatShortDate(trip.startDate))} — ${escapeHtml(formatShortDate(trip.endDate))}<i></i>${escapeHtml(trip.tagline || "出发，去看一点新的风景")}</p>
    </header>
    <div class="trip-overview">
      <div class="overview-cell"><strong>${stats.total}</strong><span>想去的事</span></div>
      <div class="overview-cell"><strong>${stats.done}</strong><span>已经完成</span></div>
      <div class="overview-cell"><strong>${stats.ideas}</strong><span>灵感池</span></div>
    </div>
    <button class="trip-cloud-chip" id="tripCloudChip" type="button">☁ 仅保存在本机 · 点击开启共享</button>
    ${renderStayOverview(trip)}
    <div class="flex-note"><span>✽</span><p>计划是草稿。睡过头、玩累了，随时把项目换一天。</p></div>
    <div class="day-tabs" role="tablist" aria-label="选择日期">${dayTabs}</div>
    <div class="itinerary-heading">
      <div>
        <p class="eyebrow">${ui.currentDay === "all" ? "THE WHOLE TRIP" : "YOUR FLEXIBLE DAY"}</p>
        <h2>${ui.currentDay === "all" ? "这次怎么玩" : `第 ${Number(ui.currentDay) + 1} 天`}</h2>
        <p>${stats.done} / ${stats.total} 已完成</p>
      </div>
      <button type="button" data-action="add-activity" data-day="${ui.currentDay === "all" ? -1 : Number(ui.currentDay)}">＋ 临时安排</button>
    </div>
    <div id="itinerarySections">${content}</div>
    ${renderUnscheduled(trip)}
    <button class="add-activity-row" type="button" data-action="add-activity" data-day="${ui.currentDay === "all" ? -1 : Number(ui.currentDay)}">＋ 再放一件事进来</button>
    <p class="trip-detail-note">不必全部完成，玩得开心就算成功。</p>`;
  window.SuixingWeather?.refresh();
}

function renderDaySection(trip, day, index, busyDays) {
  const date = addDays(trip.startDate, index);
  const activities = trip.activities
    .filter((item) => item.day === index)
    .sort((a, b) => sortTime(a.time) - sortTime(b.time));
  const planActivities = activities.filter((item) => item.category !== "酒店");
  const stays = getStaysForDate(trip, date);
  const displayTitle = getDayDisplayTitle(trip, date, planActivities, stays);
  const cards = activities.length
    ? activities.map(activityCardMarkup).join("") + `
      <button class="add-activity-row" type="button" data-action="add-activity" data-day="${index}">＋ 给这一天加一件事</button>`
    : `<div class="empty-day">
        <span>${busyDays.has(index + 1) ? "☁" : "○"}</span>
        <b>今天先留白</b>
        <p>睡懒觉、随便走走，也是一种安排。</p>
        <button type="button" data-action="add-activity" data-day="${index}">还是放一件事</button>
      </div>`;
  return `
    <section class="day-section" aria-label="第 ${index + 1} 天">
      <div class="itinerary-heading">
        <div class="day-heading-copy">
          <div class="day-meta-row">
            <p class="eyebrow">DAY ${index + 1} · ${escapeHtml(formatMonthDay(date))}</p>
            ${window.SuixingWeather?.chipMarkup(trip, day, date, index, stays) || `<button class="weather-chip weather-chip--loading" type="button" data-weather-day-index="${index}"><span>☁</span>天气</button>`}
          </div>
          <h2 class="day-heading-title">${escapeHtml(displayTitle)}</h2>
          ${day.note ? `<p class="day-note-line">${escapeHtml(day.note)}</p>` : ""}
        </div>
      </div>
      ${renderDayStayInfo(stays, date, index)}
      ${renderRoutePreview(trip, date, planActivities, stays)}
      <div class="timeline">${cards}</div>
    </section>`;
}

function getDayDisplayTitle(trip, date, activities, stays = getStaysForDate(trip, date)) {
  if (!activities.length) return "今日留白";
  const firstLocatedPlan = activities.find((item) => String(item.location || "").trim());
  const stay = stays[0];
  const fallbackLocation = stay ? (stay.address || stay.name) : "";
  const location = String(firstLocatedPlan?.location || fallbackLocation || "地点待补充").trim();
  return `【${truncateTitle(location, 12)}】附近等${activities.length}个计划`;
}

function truncateTitle(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function getTripStays(trip) {
  return Array.isArray(trip.stays) ? trip.stays : [];
}

function getStaysForDate(trip, date) {
  const ymd = toYmd(date);
  return getTripStays(trip)
    .filter((stay) => stay.startDate <= ymd && stay.endDate >= ymd)
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
}

function renderStayOverview(trip) {
  const stays = getTripStays(trip).slice().sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
  return `
    <section class="stay-overview">
      <div class="stay-overview-heading">
        <div><p class="eyebrow">WHERE WE STAY</p><h2>住宿安排</h2></div>
        <button type="button" data-action="add-stay" data-day="${ui.currentDay === "all" ? -1 : Number(ui.currentDay)}">＋ 添加住宿</button>
      </div>
      ${stays.length
        ? `<div class="stay-card-row">${stays.map((stay) => `
          <article class="stay-overview-card">
            <div class="stay-overview-top"><span>住</span><small>${escapeHtml(formatStayDateRange(stay))}</small></div>
            <h3>${escapeHtml(stay.name)}</h3>
            <p>${escapeHtml(stay.address || "地址待补充")}</p>
            <div class="stay-card-actions">
              <button type="button" data-action="edit-stay" data-stay-id="${escapeAttr(stay.id)}">编辑</button>
              <a href="${escapeAttr(getMapUrl(stay.address || stay.name))}" target="_blank" rel="noopener">地图</a>
            </div>
          </article>`).join("")}</div>`
        : `<button class="stay-overview-empty" type="button" data-action="add-stay" data-day="${ui.currentDay === "all" ? -1 : Number(ui.currentDay)}">
            <span>＋</span><b>还没有住宿安排</b><small>选择酒店、地址和入住日期，每天会自动显示。</small>
          </button>`}
    </section>`;
}

function renderDayStayInfo(stays, date, dayIndex) {
  if (!stays.length) {
    return `<div class="day-stay-empty">
      <span>住</span><p>这一天还没安排住宿</p>
      <button type="button" data-action="add-stay" data-day="${dayIndex}">＋ 添加</button>
    </div>`;
  }
  return `<div class="day-stay-list">
    ${stays.map((stay) => {
      const status = getStayDayStatus(stay, date);
      return `<button class="day-stay-card" type="button" data-action="edit-stay" data-stay-id="${escapeAttr(stay.id)}">
        <span class="day-stay-icon">住</span>
        <span class="day-stay-copy"><small>${status}</small><b>${escapeHtml(stay.name)}</b><em>${escapeHtml(stay.address || "地址待补充")}</em></span>
        <span class="activity-arrow">›</span>
      </button>`;
    }).join("")}
  </div>`;
}

function getStayDayStatus(stay, date) {
  const ymd = toYmd(date);
  if (stay.startDate === ymd && stay.endDate === ymd) return "今日住宿";
  if (stay.startDate === ymd) return "今日入住";
  if (stay.endDate === ymd) return "今日退房";
  return "今晚住这里";
}

function formatStayDateRange(stay) {
  const start = parseDate(stay.startDate);
  const end = parseDate(stay.endDate);
  return `${start.getMonth() + 1}.${start.getDate()} — ${end.getMonth() + 1}.${end.getDate()}`;
}

function renderRoutePreview(trip, date, activities, stays) {
  const startStay = stays[0];
  if (!startStay) {
    return `<section class="route-preview route-preview--empty">
      <div><span class="route-empty-icon">⌖</span><b>路线预览</b><p>先添加当天住宿，再按计划时间生成从酒店出发的路线。</p></div>
      <button type="button" data-action="add-stay" data-day="${Math.max(daysBetween(parseDate(trip.startDate), date), 0)}">添加住宿</button>
    </section>`;
  }

  const locatedActivities = activities.filter((activity) => String(activity.location || "").trim());
  const uniqueStops = [];
  const seen = new Set();
  const startLocation = String(startStay.address || startStay.name || "").trim();
  [{ type: "stay", stay: startStay, location: startLocation }].forEach((stop) => {
    seen.add(stop.location.toLocaleLowerCase());
    uniqueStops.push(stop);
  });
  locatedActivities.forEach((activity) => {
    const location = activity.location.trim();
    const key = location.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueStops.push({ type: "plan", activity, location });
    }
  });

  const routeNodes = uniqueStops.slice(0, 6);
  const coords = routeNodes.map((_, index) => {
    if (routeNodes.length === 1) return { x: 50, y: 45 };
    const x = 12 + index * (76 / (routeNodes.length - 1));
    const yPattern = [54, 27, 58, 30, 52, 25];
    return { x, y: yPattern[index] };
  });
  const path = coords.reduce((value, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = coords[index - 1];
    const midX = (previous.x + point.x) / 2;
    return `${value} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
  const missingLocations = activities.length - locatedActivities.length;

  return `<section class="route-preview">
    <div class="route-preview-heading">
      <div><p class="eyebrow">TODAY'S ROUTE</p><h3>今日路线</h3></div>
      <span>按计划时间排序</span>
    </div>
    <div class="route-map-schematic">
      <svg class="route-map-path" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true">
        <path class="route-road route-road--a" d="M -5 18 C 25 2, 48 30, 105 12"></path>
        <path class="route-road route-road--b" d="M 8 72 C 30 42, 66 67, 104 38"></path>
        <path class="route-line" d="${escapeAttr(path)}"></path>
      </svg>
      <span class="route-map-compass">N ↑</span>
      ${routeNodes.map((stop, index) => `
        <span class="route-map-node ${stop.type === "stay" ? "route-map-node--stay" : ""}" style="left:${coords[index].x}%;top:${coords[index].y}%">
          ${stop.type === "stay" ? "宿" : index}
        </span>`).join("")}
      ${uniqueStops.length > routeNodes.length ? `<span class="route-map-more">+${uniqueStops.length - routeNodes.length}</span>` : ""}
    </div>
    <ol class="route-stop-list">
      <li>
        <span class="route-stop-index route-stop-index--stay">宿</span>
        <div><b>${escapeHtml(startStay.name)}</b><small>${escapeHtml(startLocation || "住宿地点待补充")} · 出发</small></div>
        <a href="${escapeAttr(getMapUrl(startLocation || startStay.name))}" target="_blank" rel="noopener">地图</a>
      </li>
      ${locatedActivities.map((activity, index) => `
        <li>
          <span class="route-stop-index">${index + 1}</span>
          <div><b>${escapeHtml(activity.title)}</b><small>${escapeHtml(activity.time || "时间待定")} · ${escapeHtml(activity.location)}</small></div>
          <a href="${escapeAttr(getMapUrl(activity.location))}" target="_blank" rel="noopener">地图</a>
        </li>`).join("")}
    </ol>
    ${missingLocations ? `<p class="route-warning">还有 ${missingLocations} 个计划没有填写地点，暂未加入路线。</p>` : ""}
    <p class="route-footnote">顺序预览用于检查是否顺路；点击地点可在地图 App 中查看。</p>
  </section>`;
}

function renderUnscheduled(trip) {
  const ideas = trip.activities.filter((item) => item.day === -1);
  return `
    <section class="unscheduled-card">
      <div class="unscheduled-title"><b>灵感池 · 还没定哪天</b><span>${ideas.length} 个</span></div>
      <p>临时加进来、或者搜到的备选，都可以先放这里。</p>
      <div class="idea-pills">
        ${ideas.length
          ? ideas.map((item) => `<button class="idea-pill" type="button" data-activity-id="${escapeAttr(item.id)}"><span>${categoryInfo(item.category).icon}</span>${escapeHtml(item.title)}</button>`).join("")
          : `<button class="idea-pill" type="button" data-action="add-activity" data-day="-1"><span>＋</span>收集第一个灵感</button>`}
      </div>
    </section>`;
}

function activityCardMarkup(activity) {
  const category = categoryInfo(activity.category);
  return `
    <article class="activity-card ${activity.status === "done" ? "activity-card--done" : ""}" data-activity-id="${escapeAttr(activity.id)}" role="button" tabindex="0">
      <span class="activity-check" style="--activity-bg:${category.bg};--activity-dot:${category.dot}">${category.icon}</span>
      <span class="activity-copy">
        <span class="activity-title-line"><h3>${escapeHtml(activity.title)}</h3>${activity.status === "done" ? `<span class="activity-status">已完成</span>` : ""}</span>
        <span class="activity-meta">
          ${activity.time ? `<span>${escapeHtml(activity.time)}</span>` : ""}
          ${activity.location ? `<span>${escapeHtml(activity.location)}</span>` : ""}
          ${activity.cost ? `<span>${escapeHtml(activity.cost)}</span>` : ""}
        </span>
        ${activity.note ? `<p class="activity-note-preview">${escapeHtml(activity.note)}</p>` : ""}
      </span>
      <span class="activity-arrow">›</span>
    </article>`;
}

function renderDiscover() {
  const trip = findTrip(state.activeTripId) || state.trips[0];
  const ideas = trip ? trip.activities.filter((item) => item.day === -1 && item.status !== "done") : [];
  document.getElementById("ideaCount").textContent = `${ideas.length} 个灵感`;
  document.getElementById("ideaList").innerHTML = ideas.length
    ? ideas.map((idea) => {
      const category = categoryInfo(idea.category);
      return `<article class="idea-row">
        <span class="idea-row-icon" style="--idea-bg:${category.bg}">${category.icon}</span>
        <span class="idea-row-copy"><b>${escapeHtml(idea.title)}</b><small>${escapeHtml(idea.location || trip.destination)} · ${escapeHtml(idea.cost || "费用待定")}</small></span>
        <button class="small-round" type="button" data-activity-id="${escapeAttr(idea.id)}" aria-label="打开${escapeAttr(idea.title)}">›</button>
      </article>`;
    }).join("")
    : `<div class="empty-list">还没有待定灵感，去搜一个心动的地方吧。</div>`;

  const destination = trip?.destination || "目的地";
  document.querySelectorAll("[data-search-link]").forEach((link) => {
    link.href = buildDiscoverUrl(link.dataset.searchLink, destination);
  });
  const input = document.getElementById("discoverSearchInput");
  if (!input.value && ui.lastSearch) input.value = ui.lastSearch;
  renderSearchResultPanel();
}

function renderSearchResultPanel() {
  const form = document.getElementById("discoverSearchForm");
  let panel = document.getElementById("webResultPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "webResultPanel";
    form.insertAdjacentElement("afterend", panel);
  }
  if (!ui.lastSearch) {
    panel.innerHTML = "";
    return;
  }
  const trip = findTrip(state.activeTripId) || state.trips[0];
  panel.innerHTML = `
    <div class="web-result-panel">
      <span class="web-result-icon">↗</span>
      <div><b>正在找“${escapeHtml(ui.lastSearch)}”</b><p>网页会在新标签打开。看到喜欢的，保存回来就能用。</p></div>
      <button type="button" data-action="create-from-search">做成行程卡</button>
    </div>`;
}

function renderFootprints() {
  const items = [];
  state.trips.forEach((trip) => {
    trip.activities.forEach((activity) => {
      if (activity.status === "done") items.push({ trip, activity });
    });
  });
  items.sort((a, b) => {
    const dateA = a.activity.doneAt ? parseDate(a.activity.doneAt) : parseDate(a.trip.endDate);
    const dateB = b.activity.doneAt ? parseDate(b.activity.doneAt) : parseDate(b.trip.endDate);
    return dateB - dateA;
  });
  const destinations = new Set(items.map(({ trip }) => trip.destination)).size;
  const notes = items.filter(({ activity }) => activity.reflection).length;
  const photos = items.filter(({ activity }) => activity.photo).length;
  document.getElementById("memoryStats").innerHTML = `
    <div class="memory-stat"><strong>${destinations}</strong><span>座城市</span></div>
    <div class="memory-stat"><strong>${items.length}</strong><span>个瞬间</span></div>
    <div class="memory-stat"><strong>${photos || notes}</strong><span>段回忆</span></div>`;

  document.getElementById("memoryList").innerHTML = items.length
    ? items.map(({ trip, activity }) => memoryMarkup(trip, activity)).join("")
    : `<div class="empty-list">完成一次游玩，并在清单里上传照片或写句话，这里就会有第一张回忆卡。</div>`;
}

function memoryMarkup(trip, activity) {
  const theme = THEMES[trip.theme] || THEMES.forest;
  const category = categoryInfo(activity.category);
  const reflection = activity.reflection || activity.note || "这一站已经走过，具体的心情还没有写下来。";
  const photoSrc = getActivityPhotoSrc(activity.photo);
  return `
    <article class="memory-card">
      <div class="memory-photo" style="--memory-base:${theme.color};--memory-deep:#30483e;--memory-accent:${category.dot}">
        ${photoSrc
          ? `<img src="${escapeAttr(photoSrc)}" alt="${escapeAttr(activity.title)}的照片">`
          : activity.photo
            ? `<span class="memory-photo-placeholder" data-photo-placeholder="${escapeAttr(activity.photo)}">照片正在载入…</span>`
            : `<span class="memory-photo-placeholder">${category.icon} · ${escapeHtml(trip.destination)}</span>`}
      </div>
      <div class="memory-copy">
        <div class="memory-meta"><span>${escapeHtml(trip.title)} · ${escapeHtml(activity.category)}</span><span>${escapeHtml(formatMemoryDate(activity.doneAt))}</span></div>
        <h3>${escapeHtml(activity.title)}</h3>
        <p class="memory-reflection">${escapeHtml(reflection)}</p>
        <div class="memory-footer">
          <span>✓ 已完成</span>
          <button type="button" data-activity-id="${escapeAttr(activity.id)}">补照片或心情 ›</button>
        </div>
      </div>
    </article>`;
}

function renderProfile() {
  renderProfileSummary();
}

function renderProfileSummary() {
  const target = document.getElementById("profileSummary");
  if (!target) return;
  const activities = state.trips.flatMap((trip) => trip.activities);
  const done = activities.filter((item) => item.status === "done").length;
  target.textContent = `${state.trips.length} 段旅行 · ${activities.length} 个计划 · ${done} 次完成`;
}

function navigate(viewName, options = {}) {
  const allowed = ["home", "trip", "discover", "footprints", "profile"];
  if (!allowed.includes(viewName)) viewName = "home";
  if (viewName === "trip" && !findTrip(selectedTripId) && !state.trips.length) {
    openAddTrip();
    return;
  }
  if (options.push !== false && (currentView !== viewName || (viewName === "trip" && options.tripId))) {
    navHistory.push({ view: currentView, tripId: selectedTripId });
    if (navHistory.length > 30) navHistory.shift();
  }
  currentView = viewName;
  document.querySelectorAll(".view").forEach((view) => {
    const active = view.id === `${viewName}View`;
    view.hidden = !active;
    view.classList.toggle("view--active", active);
  });
  if (viewName === "trip") renderTrip();
  if (viewName === "discover") renderDiscover();
  if (viewName === "footprints") renderFootprints();
  if (viewName === "profile") renderProfile();
  updateChrome();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateChrome() {
  const bottomNav = document.getElementById("bottomNav");
  const backButton = document.getElementById("backButton");
  const brand = document.querySelector(".topbar .brand");
  const avatar = document.querySelector(".avatar-button");
  const title = document.getElementById("topbarTitle");
  backButton.hidden = currentView === "home";
  title.hidden = currentView === "home";
  brand.style.visibility = currentView === "home" ? "visible" : "hidden";
  avatar.hidden = currentView === "trip" || currentView === "profile";
  bottomNav.hidden = false;
  const trip = findTrip(selectedTripId);
  title.textContent = currentView === "trip" && trip ? trip.title : currentView === "profile" ? "数据与设置" : "";

  document.querySelectorAll(".nav-button").forEach((button) => {
    let buttonView = button.dataset.nav;
    const active = buttonView === currentView || (buttonView === "home" && currentView === "profile") || (buttonView === "trip" && currentView === "trip");
    button.classList.toggle("nav-button--active", active);
  });
}

function goBack() {
  const previous = navHistory.pop();
  if (previous) {
    currentView = previous.view;
    if (previous.tripId && findTrip(previous.tripId)) selectedTripId = previous.tripId;
    document.querySelectorAll(".view").forEach((view) => {
      const active = view.id === `${currentView}View`;
      view.hidden = !active;
      view.classList.toggle("view--active", active);
    });
    if (currentView === "trip") renderTrip();
    updateChrome();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  navigate("home", { push: false });
  navHistory = [];
}

function bindGlobalEvents() {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.getElementById("modalLayer").hidden) closeModal();
    const card = event.target.closest(".activity-card[role='button'], .featured-card[role='button']");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      card.click();
    }
  });
  document.getElementById("backButton").addEventListener("click", goBack);
  document.getElementById("tripFilters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    tripFilter = button.dataset.filter;
    document.querySelectorAll("#tripFilters [data-filter]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("filter-chip--active", active);
      item.setAttribute("aria-selected", String(active));
    });
    persist();
    renderTripGrid();
  });
  const searchForm = document.getElementById("discoverSearchForm");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = document.getElementById("discoverSearchInput").value.trim();
    if (!query) return;
    runWebSearch(query);
  });
  document.getElementById("exportButton").addEventListener("click", exportData);
  document.getElementById("importInput").addEventListener("change", importData);
  document.getElementById("installButton").addEventListener("click", installApp);
  document.getElementById("manageTripsButton").addEventListener("click", openManageTrips);
  document.getElementById("confirmCancel").addEventListener("click", () => resolveConfirm(false));
  document.getElementById("confirmAccept").addEventListener("click", () => resolveConfirm(true));
  document.getElementById("confirmDialog").addEventListener("cancel", (event) => {
    event.preventDefault();
    resolveConfirm(false);
  });
}

function handleDocumentClick(event) {
  const navButton = event.target.closest("[data-nav]");
  if (navButton) {
    event.preventDefault();
    const destination = navButton.dataset.nav;
    if (destination === "trip") {
      if (!state.trips.length) return openAddTrip();
      if (!selectedTripId) selectedTripId = getFeaturedTrip()?.id;
      navigate("trip");
    } else {
      navigate(destination);
    }
    return;
  }

  const dayTab = event.target.closest("[data-day].day-tab");
  if (dayTab) {
    ui.currentDay = dayTab.dataset.day === "all" ? "all" : Number(dayTab.dataset.day);
    renderTrip();
    return;
  }

  const activityTarget = event.target.closest("[data-activity-id]");
  if (activityTarget && !activityTarget.closest("[data-action]")) {
    const activityId = activityTarget.dataset.activityId;
    const found = findActivity(activityId);
    if (found) {
      selectedTripId = found.trip.id;
      state.activeTripId = found.trip.id;
      openActivityDetail(activityId);
    }
    return;
  }

  const tripTarget = event.target.closest("[data-trip-id]:not([data-action])");
  if (tripTarget) {
    openTrip(tripTarget.dataset.tripId);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  switch (action) {
    case "new-trip":
      openAddTrip();
      break;
    case "edit-trip":
      openEditTrip(selectedTripId);
      break;
    case "add-stay":
      openStayEditor(null, Number(actionTarget.dataset.day ?? -1));
      break;
    case "edit-stay":
      openStayEditor(actionTarget.dataset.stayId);
      break;
    case "delete-stay":
      requestDeleteStay(actionTarget.dataset.stayId);
      break;
    case "add-activity":
      openAddActivity({
        day: Number(actionTarget.dataset.day ?? -1),
        tripId: selectedTripId,
        fromSearch: actionTarget.dataset.fromSearch === "true"
      });
      break;
    case "manage-trips":
      openManageTrips();
      break;
    case "create-from-search":
      openAddActivity({
        day: -1,
        tripId: state.activeTripId || state.trips[0]?.id,
        prefillName: ui.lastSearch || "",
        fromSearch: true
      });
      break;
    case "save-memory":
      saveMemory(actionTarget.dataset.activityId);
      break;
    case "undo-done":
      toggleDone(actionTarget.dataset.activityId, false);
      break;
    case "edit-activity":
      openEditActivity(actionTarget.dataset.activityId);
      break;
    case "delete-activity":
      requestDeleteActivity(actionTarget.dataset.activityId);
      break;
    case "delete-trip":
      requestDeleteTrip(actionTarget.dataset.tripId);
      break;
    case "edit-trip-row":
      openEditTrip(actionTarget.dataset.tripId);
      break;
    case "make-active":
      state.activeTripId = actionTarget.dataset.tripId;
      persist();
      renderAll();
      showToast("已设为当前旅行");
      break;
    default:
      break;
  }
}

function openModal(content, afterOpen) {
  const layer = document.getElementById("modalLayer");
  document.getElementById("modalContent").innerHTML = content;
  layer.hidden = false;
  document.body.classList.add("modal-open");
  document.querySelectorAll("[data-close-modal]").forEach((element) => {
    if (element.dataset.bound === "true") return;
    element.addEventListener("click", closeModal);
    element.dataset.bound = "true";
  });
  if (typeof afterOpen === "function") afterOpen();
}

function closeModal() {
  const layer = document.getElementById("modalLayer");
  if (layer.hidden) return;
  layer.hidden = true;
  document.getElementById("modalContent").innerHTML = "";
  document.body.classList.remove("modal-open");
  pendingPhotoData = null;
  currentActivityId = null;
}

function openAddTrip() {
  const suggestedStart = toYmd(addDays(Date.now(), 21));
  const suggestedEnd = toYmd(addDays(Date.now(), 24));
  openModal(`
    <div class="sheet-heading"><h2>下一站，去哪儿？</h2><p>先写最基本的，日期和项目之后都能改。</p></div>
    <form id="tripForm" class="form-grid">
      <label class="field"><span>给这次旅行起个名字</span><input name="title" placeholder="例如：元旦 · 泉州" required maxlength="40"></label>
      <div class="form-row">
        <label class="field"><span>目的地</span><input name="destination" placeholder="泉州" required maxlength="20"></label>
        <label class="field"><span>一句期待</span><input name="tagline" placeholder="半城烟火，半城仙" maxlength="32"></label>
      </div>
      <div class="form-row">
        <label class="field"><span>出发</span><input type="date" name="startDate" value="${suggestedStart}" required></label>
        <label class="field"><span>回来</span><input type="date" name="endDate" value="${suggestedEnd}" required></label>
      </div>
      <div class="field">
        <span class="field-label">行程封面色</span>
        <div class="theme-options">
          ${Object.entries(THEMES).map(([key, theme], index) => `
            <label class="theme-option theme-option--${theme.className} ${index === 1 ? "theme-option--active" : ""}">
              <input type="radio" name="theme" value="${key}" ${index === 1 ? "checked" : ""} hidden>${theme.name}
            </label>`).join("")}
        </div>
      </div>
      <button class="button button--primary button--wide" type="submit">建好这张旅行卡</button>
    </form>`, () => {
    const form = document.getElementById("tripForm");
    form.addEventListener("change", (event) => {
      if (event.target.name === "theme") {
        form.querySelectorAll(".theme-option").forEach((option) => {
          option.classList.toggle("theme-option--active", option.querySelector("input").checked);
        });
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const startDate = String(data.get("startDate"));
      const endDate = String(data.get("endDate"));
      if (parseDate(endDate) < parseDate(startDate)) {
        showToast("回程日期不能早于出发日期");
        return;
      }
      const trip = createTrip({
        title: String(data.get("title")).trim(),
        destination: String(data.get("destination")).trim(),
        tagline: String(data.get("tagline")).trim(),
        english: pinyinFallback(String(data.get("destination")).trim()),
        startDate,
        endDate,
        theme: String(data.get("theme"))
      });
      state.trips.push(trip);
      state.activeTripId = trip.id;
      selectedTripId = trip.id;
      persist();
      notifyCloudMutation("upsert_trip", trip.id);
      closeModal();
      renderAll();
      openTrip(trip.id);
      showToast("旅行卡建好了，开始往里放想做的事吧");
    });
  });
}

function createTrip(data) {
  const dayCount = Math.min(Math.max(daysBetween(parseDate(data.startDate), parseDate(data.endDate)) + 1, 1), 30);
  return {
    id: makeId("trip"),
    ...data,
    days: Array.from({ length: dayCount }, () => ({
      title: "",
      note: "",
      titleMode: "auto"
    })),
    stays: [],
    activities: []
  };
}

function openStayEditor(stayId = null, dayIndex = -1) {
  const trip = findTrip(selectedTripId);
  if (!trip) return;
  trip.stays = getTripStays(trip);
  const stay = stayId ? trip.stays.find((item) => item.id === stayId) : null;
  const defaultStart = dayIndex >= 0 ? addDays(trip.startDate, dayIndex) : parseDate(trip.startDate);
  const defaultEnd = dayIndex >= 0 ? addDays(defaultStart, 1) : parseDate(trip.endDate);
  openModal(`
    <div class="sheet-heading"><h2>${stay ? "编辑住宿" : "添加住宿"}</h2><p>住宿会独立显示在每一天和路线预览里，不再作为普通计划。</p></div>
    <form id="stayForm" class="form-grid">
      <label class="field"><span>酒店名称</span><input name="name" value="${escapeAttr(stay?.name || "")}" placeholder="例如：西街小院酒店" required maxlength="50"></label>
      <label class="field"><span>酒店地址</span><input name="address" value="${escapeAttr(stay?.address || "")}" placeholder="用于每天定位和路线起点" required maxlength="120"></label>
      <div class="form-row">
        <label class="field"><span>入住日期</span><input type="date" name="startDate" value="${escapeAttr(stay?.startDate || toYmd(defaultStart))}" required></label>
        <label class="field"><span>退房日期</span><input type="date" name="endDate" value="${escapeAttr(stay?.endDate || toYmd(defaultEnd))}" required></label>
      </div>
      <label class="field"><span>住宿备注（可选）</span><textarea name="note" maxlength="160" placeholder="例如：含早餐、前台电话、停车方式">${escapeHtml(stay?.note || "")}</textarea></label>
      <div class="form-actions">
        ${stay ? `<button class="button button--ghost" type="button" data-action="delete-stay" data-stay-id="${escapeAttr(stay.id)}">删除</button>` : `<button class="button button--ghost" type="button" data-close-modal>取消</button>`}
        <button class="button button--primary" type="submit">${stay ? "保存住宿" : "添加住宿"}</button>
      </div>
    </form>`, () => {
    const form = document.getElementById("stayForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const startDate = String(data.get("startDate"));
      const endDate = String(data.get("endDate"));
      if (parseDate(endDate) < parseDate(startDate)) {
        showToast("退房日期不能早于入住日期");
        return;
      }
      const values = {
        name: String(data.get("name")).trim(),
        address: String(data.get("address")).trim(),
        startDate,
        endDate,
        note: String(data.get("note")).trim()
      };
      if (stay) Object.assign(stay, values);
      else trip.stays.push({ id: makeId("stay"), ...values });
      notifyCloudMutation("upsert_trip", trip.id);
      persist();
      closeModal();
      saveAndRefresh();
      showToast(stay ? "住宿信息已更新" : "住宿已加入每天的行程");
    });
  });
}

async function requestDeleteStay(stayId) {
  const trip = findTrip(selectedTripId);
  const stay = getTripStays(trip).find((item) => item.id === stayId);
  if (!trip || !stay) return;
  const confirmed = await showConfirm("删除这条住宿？", `“${stay.name}”会从住宿安排和每日路线中移除。`, "删除住宿");
  if (!confirmed) return;
  trip.stays = trip.stays.filter((item) => item.id !== stayId);
  notifyCloudMutation("upsert_trip", trip.id);
  persist();
  closeModal();
  saveAndRefresh();
  showToast("住宿安排已删除");
}

function openEditTrip(tripId) {
  const trip = findTrip(tripId);
  if (!trip) return;
  openModal(`
    <div class="sheet-heading"><h2>编辑这次旅行</h2><p>改名字、改日期，已经放进来的计划都会保留。</p></div>
    <form id="editTripForm" class="form-grid">
      <label class="field"><span>旅行名称</span><input name="title" value="${escapeAttr(trip.title)}" required maxlength="40"></label>
      <div class="form-row">
        <label class="field"><span>目的地</span><input name="destination" value="${escapeAttr(trip.destination)}" required maxlength="20"></label>
        <label class="field"><span>一句期待</span><input name="tagline" value="${escapeAttr(trip.tagline || "")}" maxlength="32"></label>
      </div>
      <div class="form-row">
        <label class="field"><span>出发</span><input type="date" name="startDate" value="${escapeAttr(trip.startDate)}" required></label>
        <label class="field"><span>回来</span><input type="date" name="endDate" value="${escapeAttr(trip.endDate)}" required></label>
      </div>
      <div class="field">
        <span class="field-label">行程封面色</span>
        <div class="theme-options">
          ${Object.entries(THEMES).map(([key, theme]) => `
            <label class="theme-option theme-option--${theme.className} ${trip.theme === key ? "theme-option--active" : ""}">
              <input type="radio" name="theme" value="${key}" ${trip.theme === key ? "checked" : ""} hidden>${theme.name}
            </label>`).join("")}
        </div>
      </div>
      <div class="form-actions"><button class="button button--primary" type="submit">保存修改</button></div>
    </form>`, () => {
    const form = document.getElementById("editTripForm");
    form.addEventListener("change", (event) => {
      if (event.target.name === "theme") {
        form.querySelectorAll(".theme-option").forEach((option) => {
          option.classList.toggle("theme-option--active", option.querySelector("input").checked);
        });
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const newStart = String(data.get("startDate"));
      const newEnd = String(data.get("endDate"));
      if (parseDate(newEnd) < parseDate(newStart)) {
        showToast("回程日期不能早于出发日期");
        return;
      }
      trip.title = String(data.get("title")).trim();
      trip.destination = String(data.get("destination")).trim();
      trip.tagline = String(data.get("tagline")).trim();
      trip.english = trip.english || pinyinFallback(trip.destination);
      trip.startDate = newStart;
      trip.endDate = newEnd;
      trip.theme = String(data.get("theme"));
      const dayCount = Math.min(daysBetween(parseDate(newStart), parseDate(newEnd)) + 1, 30);
      while (trip.days.length < dayCount) trip.days.push({ title: "没有计划的一天", note: "" });
      const movedActivities = [];
      if (trip.days.length > dayCount) {
        trip.days = trip.days.slice(0, dayCount);
        trip.activities.forEach((item) => {
          if (item.day >= dayCount) {
            item.day = -1;
            movedActivities.push(item);
          }
        });
      }
      notifyCloudMutation("upsert_trip", trip.id);
      movedActivities.forEach((item) => notifyCloudMutation("upsert_activity", trip.id, item.id));
      saveAndRefresh();
      closeModal();
      showToast("旅行信息已更新");
    });
  });
}

function openManageTrips() {
  openModal(`
    <div class="sheet-heading"><h2>管理旅行</h2><p>当前旅行会显示在首页和底部清单入口。</p></div>
    <div class="manage-trip-list">
      ${state.trips.map((trip) => `
        <div class="manage-trip-row">
          <span class="manage-trip-swatch" style="--swatch:${THEMES[trip.theme]?.color || "#496558"}"></span>
          <div><b>${escapeHtml(trip.title)}</b><small>${escapeHtml(formatShortDate(trip.startDate))} — ${escapeHtml(formatShortDate(trip.endDate))}${state.activeTripId === trip.id ? " · 当前" : ""}</small></div>
          <div class="manage-row-actions">
            ${state.activeTripId !== trip.id ? `<button type="button" data-action="make-active" data-trip-id="${escapeAttr(trip.id)}">设为当前</button>` : ""}
            <button type="button" data-action="edit-trip-row" data-trip-id="${escapeAttr(trip.id)}">编辑</button>
            <button class="delete" type="button" data-action="delete-trip" data-trip-id="${escapeAttr(trip.id)}">删除</button>
          </div>
        </div>`).join("")}
    </div>
    <button class="button button--primary button--wide" type="button" data-action="new-trip" style="margin-top:14px">＋ 新建旅行</button>`);
}

function openAddActivity({ day = -1, tripId = null, prefillName = "", fromSearch = false } = {}) {
  const trip = findTrip(tripId) || findTrip(selectedTripId) || findTrip(state.activeTripId) || state.trips[0];
  if (!trip) {
    closeModal();
    showToast("先新建一段旅行，再添加安排");
    openAddTrip();
    return;
  }
  const selectedDay = Number.isInteger(Number(day)) ? Number(day) : -1;
  const destination = trip.destination;
  openModal(`
    <div class="sheet-heading"><h2>${fromSearch ? "把灵感放进行程" : "临时加一件事"}</h2><p>先记下来，玩不玩、哪天玩都可以再调整。</p></div>
    <form id="activityForm" class="form-grid">
      <label class="field"><span>想做什么</span><input name="title" value="${escapeAttr(prefillName)}" placeholder="例如：西街吃一碗面线糊" required maxlength="60"></label>
      <div class="field">
        <span class="field-label">类别</span>
        <div class="category-options category-options--plans">
          ${Object.entries(CATEGORY).filter(([name]) => name !== "酒店").map(([name, info], index) => `
            <label class="category-option ${index === 0 ? "category-option--active" : ""}">
              <input type="radio" name="category" value="${name}" ${index === 0 ? "checked" : ""} hidden><b>${info.icon}</b>${name}
            </label>`).join("")}
        </div>
      </div>
      <div class="form-row">
        <label class="field"><span>放在哪天</span>
          <select name="day">
            <option value="-1" ${selectedDay === -1 ? "selected" : ""}>还没想好 · 放灵感池</option>
            ${trip.days.map((item, index) => `<option value="${index}" ${selectedDay === index ? "selected" : ""}>第 ${index + 1} 天 · ${formatMonthDay(addDays(trip.startDate, index))}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>几点</span><input type="time" name="time" value=""></label>
      </div>
      <div class="form-row">
        <label class="field"><span>大概玩多久</span><input name="duration" placeholder="2 小时" maxlength="20"></label>
        <label class="field"><span>预计花费</span><input name="cost" placeholder="¥100" maxlength="20"></label>
      </div>
      <label class="field"><span>地点</span><input name="location" placeholder="${escapeAttr(destination)}的某个地方" maxlength="50"></label>
      <label class="field"><span>备注</span><textarea name="note" placeholder="想吃什么、要预约吗、和谁去…" maxlength="300"></textarea></label>
      <label class="field"><span>网页链接（可选）</span>
        <span class="search-with-action">
          <input name="link" type="url" placeholder="粘贴小红书、地图或订房链接">
          <button type="button" id="searchForFormButton">搜一下</button>
        </span>
      </label>
      <div class="form-actions">
        <button class="button button--ghost" type="button" data-close-modal>先不记</button>
        <button class="button button--primary" type="submit">放进${escapeHtml(trip.destination)}清单</button>
      </div>
    </form>`, () => {
    const form = document.getElementById("activityForm");
    form.addEventListener("change", (event) => {
      if (event.target.name === "category") {
        form.querySelectorAll(".category-option").forEach((option) => {
          option.classList.toggle("category-option--active", option.querySelector("input").checked);
        });
      }
    });
    document.getElementById("searchForFormButton").addEventListener("click", () => {
      const title = form.elements.title.value.trim();
      const query = `${destination} ${title || "好吃的 好玩的"}`;
      window.open(buildGeneralSearchUrl(query), "_blank", "noopener,noreferrer");
      showToast("已打开网页搜索，看到合适的就把链接粘回来");
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const title = String(data.get("title")).trim();
      if (!title) return;
      const activity = {
        id: makeId("act"),
        title,
        category: String(data.get("category")),
        day: Number(data.get("day")),
        time: String(data.get("time")),
        duration: String(data.get("duration")).trim(),
        cost: String(data.get("cost")).trim(),
        location: String(data.get("location")).trim(),
        note: String(data.get("note")).trim(),
        link: String(data.get("link")).trim(),
        status: "todo",
        photo: "",
        reflection: "",
        doneAt: null
      };
      trip.activities.push(activity);
      state.activeTripId = trip.id;
      selectedTripId = trip.id;
      ui.currentDay = activity.day === -1 ? "all" : activity.day;
      if (ui.currentDay === -1) ui.currentDay = "all";
      notifyCloudMutation("upsert_activity", trip.id, activity.id);
      saveAndRefresh();
      closeModal();
      if (currentView !== "trip") navigate("trip");
      showToast(activity.day === -1 ? "已放进灵感池，之后随时安排" : "已加入这一天的行程");
    });
  });
  const titleInput = document.querySelector('#activityForm [name="title"]');
  if (titleInput) titleInput.focus();
}

function openEditActivity(activityId) {
  const found = findActivity(activityId);
  if (!found) return;
  const { trip, activity } = found;
  openModal(`
    <div class="sheet-heading"><h2>编辑这张行程卡</h2><p>换时间、换日期或者补上网页链接。</p></div>
    <form id="editActivityForm" class="form-grid">
      <label class="field"><span>想做什么</span><input name="title" value="${escapeAttr(activity.title)}" required maxlength="60"></label>
      <div class="field"><span class="field-label">类别</span>
        <div class="category-options">
          ${Object.entries(CATEGORY).map(([name, info]) => `
            <label class="category-option ${activity.category === name ? "category-option--active" : ""}">
              <input type="radio" name="category" value="${name}" ${activity.category === name ? "checked" : ""} hidden><b>${info.icon}</b>${name}
            </label>`).join("")}
        </div>
      </div>
      <div class="form-row">
        <label class="field"><span>放在哪天</span>
          <select name="day">
            <option value="-1" ${activity.day === -1 ? "selected" : ""}>还没想好 · 灵感池</option>
            ${trip.days.map((item, index) => `<option value="${index}" ${activity.day === index ? "selected" : ""}>第 ${index + 1} 天 · ${formatMonthDay(addDays(trip.startDate, index))}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span>几点</span><input type="time" name="time" value="${escapeAttr(activity.time)}"></label>
      </div>
      <div class="form-row">
        <label class="field"><span>大概玩多久</span><input name="duration" value="${escapeAttr(activity.duration)}" maxlength="20"></label>
        <label class="field"><span>预计花费</span><input name="cost" value="${escapeAttr(activity.cost)}" maxlength="20"></label>
      </div>
      <label class="field"><span>地点</span><input name="location" value="${escapeAttr(activity.location)}" maxlength="50"></label>
      <label class="field"><span>备注</span><textarea name="note" maxlength="300">${escapeHtml(activity.note)}</textarea></label>
      <label class="field"><span>网页链接</span><input name="link" type="url" value="${escapeAttr(activity.link)}" placeholder="https://…"></label>
      <div class="form-actions">
        <button class="button button--ghost" type="button" data-action="delete-activity" data-activity-id="${escapeAttr(activity.id)}">删除</button>
        <button class="button button--primary" type="submit">保存修改</button>
      </div>
    </form>`, () => {
    const form = document.getElementById("editActivityForm");
    form.addEventListener("change", (event) => {
      if (event.target.name === "category") {
        form.querySelectorAll(".category-option").forEach((option) => {
          option.classList.toggle("category-option--active", option.querySelector("input").checked);
        });
      }
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      Object.assign(activity, {
        title: String(data.get("title")).trim(),
        category: String(data.get("category")),
        day: Number(data.get("day")),
        time: String(data.get("time")),
        duration: String(data.get("duration")).trim(),
        cost: String(data.get("cost")).trim(),
        location: String(data.get("location")).trim(),
        note: String(data.get("note")).trim(),
        link: String(data.get("link")).trim()
      });
      notifyCloudMutation("upsert_activity", trip.id, activity.id);
      saveAndRefresh();
      closeModal();
      showToast("行程卡已更新");
    });
  });
}

function openActivityDetail(activityId) {
  const found = findActivity(activityId);
  if (!found) return;
  const { trip, activity } = found;
  const category = categoryInfo(activity.category);
  const photoSrc = getActivityPhotoSrc(activity.photo);
  const dateLabel = activity.day >= 0
    ? `DAY ${activity.day + 1} · ${formatMonthDay(addDays(trip.startDate, activity.day))}`
    : "灵感池 · 还没定哪天";
  currentActivityId = activity.id;
  pendingPhotoData = null;
  openModal(`
    <div class="activity-detail-top" style="--detail-bg:${category.bg}">
      <span class="detail-category">${category.icon} · ${escapeHtml(activity.category)}</span>
      <h2>${escapeHtml(activity.title)}</h2>
      <div class="detail-meta">
        <span>${escapeHtml(dateLabel)}</span>
        ${activity.time ? `<span>${escapeHtml(activity.time)}</span>` : ""}
        ${activity.duration ? `<span>${escapeHtml(activity.duration)}</span>` : ""}
        ${activity.cost ? `<span>${escapeHtml(activity.cost)}</span>` : ""}
      </div>
    </div>
    <div class="detail-body">
      ${activity.note ? `<div class="detail-note">${escapeHtml(activity.note)}</div>` : ""}
      <div class="detail-actions">
        <a class="detail-action detail-action--map" href="${escapeAttr(getMapUrl(activity.location || trip.destination + " " + activity.title))}" target="_blank" rel="noopener">⌖ 打开地图</a>
        <a class="detail-action" href="${escapeAttr(getActivityWebUrl(activity, trip))}" target="_blank" rel="noopener">↗ 网页看看</a>
        <button class="detail-action" type="button" data-action="edit-activity" data-activity-id="${escapeAttr(activity.id)}">✎ 编辑行程</button>
        <button class="detail-action" type="button" data-action="delete-activity" data-activity-id="${escapeAttr(activity.id)}">× 移除</button>
      </div>
      <section class="completion-zone ${activity.status === "done" ? "completion-zone--done" : ""}">
        <h3>${activity.status === "done" ? "✓ 这一站，已经走过" : "玩完啦？留下一点什么"}</h3>
        <p>${activity.status === "done" ? "可以继续补充照片或心得，它会一直收在“足迹”里。" : "照片和心情不是必须的。按下完成，就把它收进旅行回忆。"}</p>
        <label class="photo-upload">
          ${photoSrc
            ? `<img id="photoPreview" src="${escapeAttr(photoSrc)}" alt="已上传的照片">`
            : activity.photo
              ? `<span data-photo-placeholder="${escapeAttr(activity.photo)}">照片正在载入…</span>`
              : `<span><b>＋</b>上传一张当时的照片</span>`}
          <input type="file" id="memoryPhotoInput" accept="image/*">
        </label>
        <label class="field"><span>当时的心情</span>
          <textarea class="completion-note" id="completionNote" placeholder="例如：没按计划走，却误打误撞遇到一家很好吃的店…" maxlength="500">${escapeHtml(activity.reflection || "")}</textarea>
        </label>
        <div class="completion-buttons">
          <button class="button button--primary" type="button" data-action="save-memory" data-activity-id="${escapeAttr(activity.id)}">${activity.status === "done" ? "保存这段回忆" : "完成并收进足迹"}</button>
          ${activity.status === "done" ? `<button class="text-danger" type="button" data-action="undo-done" data-activity-id="${escapeAttr(activity.id)}">撤销</button>` : `<span></span>`}
        </div>
      </section>
    </div>`, () => {
    const input = document.getElementById("memoryPhotoInput");
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      input.disabled = true;
      try {
        pendingPhotoData = await compressImage(file);
        const label = input.closest(".photo-upload");
        label.innerHTML = `<img id="photoPreview" src="${escapeAttr(pendingPhotoData)}" alt="待保存的照片"><input type="file" id="memoryPhotoInput" accept="image/*">`;
        const newInput = document.getElementById("memoryPhotoInput");
        newInput.addEventListener("change", async (innerEvent) => {
          const newFile = innerEvent.target.files?.[0];
          if (newFile) {
            pendingPhotoData = await compressImage(newFile);
            const preview = document.getElementById("photoPreview");
            if (preview) preview.src = pendingPhotoData;
          }
        });
        showToast("照片已选好，保存后会进入足迹");
      } catch (error) {
        console.warn(error);
        showToast("这张图片无法读取，换一张试试");
      }
    });
  });
}

function saveMemory(activityId) {
  const found = findActivity(activityId);
  if (!found) return;
  const { activity } = found;
  const note = document.getElementById("completionNote")?.value.trim() || "";
  activity.reflection = note;
  if (pendingPhotoData) activity.photo = pendingPhotoData;
  if (activity.status !== "done") {
    activity.status = "done";
    activity.doneAt = toYmd(new Date());
  }
  notifyCloudMutation("upsert_activity", found.trip.id, activity.id);
  const saved = persist();
  pendingPhotoData = null;
  closeModal();
  saveAndRefresh();
  if (saved) showToast("已收进足迹。完成比按计划更重要 ✽");
}

function toggleDone(activityId, done) {
  const found = findActivity(activityId);
  if (!found) return;
  found.activity.status = done ? "done" : "todo";
  found.activity.doneAt = done ? (found.activity.doneAt || toYmd(new Date())) : null;
  notifyCloudMutation("upsert_activity", found.trip.id, found.activity.id);
  persist();
  closeModal();
  saveAndRefresh();
  showToast(done ? "这一站已经标记完成" : "已恢复为待完成");
}

async function requestDeleteActivity(activityId) {
  const found = findActivity(activityId);
  if (!found) return;
  const confirmed = await showConfirm("移除这件事？", `“${found.activity.title}”会从这段旅行里删除，已经保存的照片和心得也会一起移除。`, "确认移除");
  if (!confirmed) return;
  found.trip.activities = found.trip.activities.filter((item) => item.id !== activityId);
  notifyCloudMutation("delete_activity", found.trip.id, activityId);
  persist();
  closeModal();
  saveAndRefresh();
  showToast("已从旅行清单移除");
}

async function requestDeleteTrip(tripId) {
  const trip = findTrip(tripId);
  if (!trip) return;
  const confirmed = await showConfirm("删除整段旅行？", `“${trip.title}”里的所有计划、照片和心得都会删除。建议先导出备份。`, "删除旅行");
  if (!confirmed) return;
  notifyCloudMutation("delete_trip", tripId);
  state.trips = state.trips.filter((item) => item.id !== tripId);
  if (selectedTripId === tripId) selectedTripId = state.trips[0]?.id || null;
  if (state.activeTripId === tripId) state.activeTripId = state.trips[0]?.id || null;
  persist();
  closeModal();
  renderAll();
  if (currentView === "trip" && !findTrip(selectedTripId)) navigate("home", { push: false });
  showToast("旅行已删除");
}

function saveAndRefresh() {
  persist();
  if (currentView === "trip") renderTrip();
  renderHome();
  renderDiscover();
  renderFootprints();
  renderProfile();
  updateChrome();
  window.SuixingSync?.refreshUi();
  window.SuixingWeather?.refresh();
}

function notifyCloudMutation(kind, tripId, activityId = null) {
  window.SuixingSync?.mutation(kind, tripId, activityId);
}

function getActivityPhotoSrc(photo) {
  if (!photo) return "";
  if (/^(data:image\/|https?:\/\/)/i.test(photo)) return photo;
  return window.SuixingSync?.getPhotoUrl(photo) || "";
}

function getTripStats(trip) {
  const scheduled = trip.activities.filter((item) => item.day >= 0 && item.category !== "酒店");
  return {
    total: scheduled.length,
    done: trip.activities.filter((item) => item.status === "done" && item.category !== "酒店").length,
    ideas: trip.activities.filter((item) => item.day === -1 && item.status !== "done" && item.category !== "酒店").length,
    dayCount: Math.max(daysBetween(parseDate(trip.startDate), parseDate(trip.endDate)) + 1, 1)
  };
}

function getTripStatus(trip) {
  const today = startOfDay(new Date());
  const start = parseDate(trip.startDate);
  const end = parseDate(trip.endDate);
  if (today < start) return "upcoming";
  if (today > end) return "past";
  return "ongoing";
}

function getCountdownLabel(trip) {
  const status = getTripStatus(trip);
  if (status === "ongoing") return "把计划放轻一点";
  if (status === "past") return "回忆已归档";
  const days = daysBetween(new Date(), parseDate(trip.startDate));
  return days === 0 ? "就是今天 · 出发" : `距离出发 ${days} 天`;
}

function findTrip(id) {
  return state.trips.find((trip) => trip.id === id) || null;
}

function findActivity(id) {
  for (const trip of state.trips) {
    const activity = trip.activities.find((item) => item.id === id);
    if (activity) return { trip, activity };
  }
  return null;
}

function categoryInfo(name) {
  return CATEGORY[name] || CATEGORY["景点"];
}

function runWebSearch(query) {
  ui.lastSearch = query;
  localStorage.setItem(UI_KEY, JSON.stringify({ tripFilter, lastSearch: query }));
  window.open(buildGeneralSearchUrl(query), "_blank", "noopener,noreferrer");
  renderSearchResultPanel();
  showToast("已打开网页搜索，回来点“做成行程卡”就行");
}

function buildDiscoverUrl(type, destination) {
  const queryMap = {
    food: `${destination} 本地美食 必吃 大众点评`,
    hotel: `${destination} 高性价比 酒店 住宿 评价`,
    event: `${destination} 近期 活动 市集 展览`,
    map: `${destination} 景点 地图`
  };
  if (type === "map") return `https://uri.amap.com/search?keyword=${encodeURIComponent(destination + "景点")}&callnative=1`;
  return buildGeneralSearchUrl(queryMap[type] || destination);
}

function buildGeneralSearchUrl(query) {
  return `https://cn.bing.com/search?q=${encodeURIComponent(query)}`;
}

function getMapUrl(query) {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(query)}&callnative=1`;
}

function getActivityWebUrl(activity, trip) {
  if (activity.link && /^https?:\/\//i.test(activity.link)) return activity.link;
  return buildGeneralSearchUrl(`${trip.destination} ${activity.title} ${activity.category}`);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("toast--visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("toast--visible"), 3000);
}

function showConfirm(title, message, acceptText = "确认") {
  const dialog = document.getElementById("confirmDialog");
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMessage").textContent = message;
  document.getElementById("confirmAccept").textContent = acceptText;
  dialog.showModal();
  return new Promise((resolve) => {
    activeConfirmResolver = resolve;
  });
}

function resolveConfirm(value) {
  const dialog = document.getElementById("confirmDialog");
  if (dialog.open) dialog.close();
  if (activeConfirmResolver) {
    const resolve = activeConfirmResolver;
    activeConfirmResolver = null;
    resolve(value);
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Not an image"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxSide = 1000;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function exportData() {
  const payload = {
    app: "随行",
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    data: state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `随行旅行备份-${toYmd(new Date())}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast("备份已导出，请保存到网盘或发给自己");
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onerror = () => showToast("文件读取失败");
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const imported = parsed.data?.trips ? parsed.data : parsed;
      if (!Array.isArray(imported.trips)) throw new Error("Invalid backup");
      const confirmed = await showConfirm(
        "用备份替换当前内容？",
        `备份里有 ${imported.trips.length} 段旅行。当前手机里的数据会被替换，照片也会一并替换。`,
        "导入备份"
      );
      if (!confirmed) return;
      state = migrateState(imported);
      state.activeTripId = state.activeTripId || state.trips[0]?.id || null;
      selectedTripId = state.activeTripId;
      persist();
      renderAll();
      navigate("home");
      showToast("旅行备份已恢复");
    } catch (error) {
      console.warn(error);
      showToast("这不是有效的随行备份文件");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

async function installApp() {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    showToast("已经有桌面图标啦");
    return;
  }
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (result.outcome === "accepted") showToast("已开始安装随行");
    return;
  }
  openModal(`
    <div class="sheet-heading"><h2>添加到安卓桌面</h2><p>用 Chrome 或 Edge 打开这个页面，就能像普通 App 一样使用。</p></div>
    <div class="install-steps">
      <div><span>1</span><p>点浏览器右上角的 <b>⋮</b> 菜单。</p></div>
      <div><span>2</span><p>选择 <b>“添加到主屏幕”</b> 或 <b>“安装应用”</b>。</p></div>
      <div><span>3</span><p>确认后，桌面会出现“随行”图标，离线也能查看。</p></div>
    </div>
    <p class="privacy-note">安装功能需要通过网址打开。直接双击电脑本地的 HTML 文件不能安装。</p>`);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
  navigator.serviceWorker.register("./sw.js").catch((error) => console.warn("Service worker registration failed.", error));
}

function parseDate(value) {
  if (value instanceof Date) return startOfDay(value);
  if (typeof value === "number") return startOfDay(new Date(value));
  if (!value) return new Date(NaN);
  const parts = String(value).slice(0, 10).split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function startOfDay(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value, days) {
  const date = value instanceof Date ? new Date(value) : parseDate(value);
  date.setDate(date.getDate() + days);
  return date;
}

function daysBetween(from, to) {
  const start = startOfDay(from instanceof Date ? from : new Date(from));
  const end = startOfDay(to instanceof Date ? to : new Date(to));
  return Math.round((end - start) / 86400000);
}

function formatShortDate(value) {
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatMonthDay(value) {
  const date = value instanceof Date ? value : parseDate(value);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatMemoryDate(value) {
  if (!value) return "最近";
  const date = parseDate(value);
  return Number.isNaN(date.getTime()) ? "最近" : `${date.getFullYear()} · ${formatMonthDay(date)}`;
}

function toYmd(value) {
  const date = value instanceof Date ? value : parseDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sortTime(time) {
  if (!time) return 9999;
  return Number(String(time).replace(":", "")) || 9999;
}

function makeId(prefix) {
  if (crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pinyinFallback(value) {
  const map = {
    "泉州": "QUANZHOU", "杭州": "HANGZHOU", "青岛": "QINGDAO", "南京": "NANJING",
    "苏州": "SUZHOU", "上海": "SHANGHAI", "北京": "BEIJING", "成都": "CHENGDU",
    "广州": "GUANGZHOU", "深圳": "SHENZHEN", "厦门": "XIAMEN", "大理": "DALI"
  };
  return map[value] || String(value).toUpperCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
