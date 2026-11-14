"use strict";

(() => {
  const CONFIG_KEY = "suixing-supabase-config-v1";
  const QUEUE_KEY = "suixing-sync-queue-v1";
  const KNOWN_COUPLE_KEY = "suixing-sync-known-couple-v1";
  const PRE_JOIN_BACKUP_KEY = "suixing-prejoin-backup-v1";
  const BUCKET = "trip-photos";

  const localCloudConfig = loadJson(CONFIG_KEY, null);
  const committedCloudConfig = loadCommittedCloudConfig();

  const syncState = {
    client: null,
    user: null,
    config: syncValidCommittedConfig(committedCloudConfig) ? committedCloudConfig : localCloudConfig,
    coupleId: null,
    coupleName: "",
    inviteCode: "",
    memberCount: 0,
    status: "disabled",
    error: "",
    lastSync: null,
    remoteTripCount: null,
    syncing: false,
    pulling: false,
    channel: null,
    knownCouple: false
  };

  let syncQueue = loadQueue();
  let syncFlushPromise = null;
  let syncPullTimer = null;
  let syncRetryTimer = null;
  let syncIsInitialized = false;
  const photoUrlCache = new Map();
  const pendingPhotoRequests = new Set();

  window.SuixingSync = {
    mutation: syncMutation,
    getPhotoUrl,
    refreshUi: syncRefreshUi,
    flush: syncFlushQueue,
    pull: syncPullRemoteData,
    isConnected: () => Boolean(syncState.client && syncState.coupleId),
    openSettings: syncOpenSettings
  };

  initSync();

  function initSync() {
    if (syncIsInitialized) return;
    syncIsInitialized = true;
    const button = document.getElementById("cloudSyncButton");
    if (button) button.addEventListener("click", syncOpenSettings);
    document.addEventListener("click", (event) => {
      if (event.target.closest("#tripCloudChip")) syncOpenSettings();
    });
    window.addEventListener("online", () => {
      if (syncState.client && syncState.coupleId) {
        syncSetStatus("syncing", "网络恢复了，正在同步…");
        syncScheduleFlush(80);
        syncSchedulePull(250);
      }
    });
    window.addEventListener("offline", () => {
      if (syncState.coupleId) syncSetStatus("offline", "当前离线 · 本机修改会稍后上传");
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && syncState.coupleId && navigator.onLine) {
        syncSchedulePull(120);
      }
    });
    syncRefreshUi();
    if (syncState.config?.url && syncState.config?.key) {
      window.setTimeout(() => {
        syncConnect({ silent: true }).then((hasCouple) => {
          if (!hasCouple && syncValidCommittedConfig(committedCloudConfig)) {
            syncOpenPairingPanel();
          }
        }).catch((error) => {
          console.warn("Cloud reconnect failed.", error);
          syncSetStatus("error", syncFriendlyError(error), error);
          if (syncValidCommittedConfig(committedCloudConfig)) {
            syncOpenConfigPanel(syncFriendlyError(error));
          }
        });
      }, 0);
    }
  }

  function loadJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function loadCommittedCloudConfig() {
    const config = window.SUIXING_CLOUD_CONFIG;
    if (!config || typeof config !== "object") return null;
    return {
      url: String(config.url || "").trim().replace(/\/+$/, ""),
      key: String(config.key || "").trim()
    };
  }

  function syncValidCommittedConfig(config) {
    return Boolean(
      config
      && /^https?:\/\//i.test(config.url)
      && config.key
      && !config.key.startsWith("sb_secret_")
      && !config.key.includes("service_role")
    );
  }

  function loadQueue() {
    const queue = loadJson(QUEUE_KEY, []);
    return Array.isArray(queue) ? queue : [];
  }

  function syncSaveQueue() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(syncQueue));
  }

  function syncSaveConfig(config) {
    syncState.config = config;
    if (config) localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    else localStorage.removeItem(CONFIG_KEY);
  }

  async function syncConnect({ silent = false } = {}) {
    const config = syncState.config;
    if (!config?.url || !config?.key) {
      syncSetStatus("disabled", "未开启 · 点击连接免费共享空间");
      return false;
    }
    if (!window.supabase?.createClient) {
      throw new Error("同步组件没有加载完成，请刷新页面后重试");
    }

    syncSetStatus("connecting", "正在连接 Supabase…");
    if (!syncState.client) {
      syncState.client = window.supabase.createClient(config.url, config.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }

    let sessionResult = await syncState.client.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    let session = sessionResult.data.session;
    if (!session) {
      const anonymousResult = await syncState.client.auth.signInAnonymously();
      if (anonymousResult.error) throw anonymousResult.error;
      session = anonymousResult.data.session;
    }
    if (!session?.user) throw new Error("无法建立设备身份，请检查 Supabase 匿名登录设置");
    syncState.user = session.user;

    const membershipResult = await syncState.client
      .from("couple_members")
      .select("couple_id, role, couple_spaces(name, invite_code)")
      .eq("user_id", syncState.user.id)
      .maybeSingle();
    if (membershipResult.error) throw membershipResult.error;

    if (!membershipResult.data) {
      syncSetStatus("pairing", "已连接 Supabase · 等待创建或加入共享空间");
      return false;
    }

    const space = Array.isArray(membershipResult.data.couple_spaces)
      ? membershipResult.data.couple_spaces[0]
      : membershipResult.data.couple_spaces;
    syncState.knownCouple = localStorage.getItem(KNOWN_COUPLE_KEY) === membershipResult.data.couple_id;
    await syncActivateCouple({
      id: membershipResult.data.couple_id,
      name: space?.name || "我们的旅行",
      inviteCode: space?.invite_code || ""
    });
    return true;
  }

  async function syncActivateCouple({ id, name, inviteCode }) {
    syncState.coupleId = id;
    syncState.coupleName = name || "我们的旅行";
    syncState.inviteCode = inviteCode || syncState.inviteCode;
    syncState.error = "";
    syncSetStatus("syncing", "正在同步两个人的行程…");
    syncSubscribeRealtime();
    await syncPullRemoteData({ silent: true, initial: true });
    syncState.knownCouple = true;
    localStorage.setItem(KNOWN_COUPLE_KEY, id);
    syncSetStatus(navigator.onLine ? "online" : "offline", navigator.onLine ? "云端已同步" : "离线 · 修改会稍后上传");
    syncScheduleFlush(50);
  }

  function syncSubscribeRealtime() {
    if (!syncState.client || !syncState.coupleId) return;
    if (syncState.channel) {
      syncState.client.removeChannel(syncState.channel);
      syncState.channel = null;
    }
    const coupleId = syncState.coupleId;
    syncState.channel = syncState.client
      .channel(`suixing-couple-${coupleId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "trips",
        filter: `couple_id=eq.${coupleId}`
      }, () => syncSchedulePull(180))
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "activities",
        filter: `couple_id=eq.${coupleId}`
      }, () => syncSchedulePull(180))
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && !syncState.syncing) {
          syncSetStatus(navigator.onLine ? "online" : "offline", navigator.onLine ? "云端已同步" : "离线 · 修改会稍后上传");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          syncSetStatus("offline", "实时连接中断，正在重试");
        }
      });
  }

  function syncSetStatus(status, text, error = null) {
    syncState.status = status;
    syncState.error = error ? syncFriendlyError(error) : "";
    const statusText = document.getElementById("syncStatusText");
    const dot = document.getElementById("syncStateDot");
    if (statusText) statusText.textContent = text;
    if (dot) {
      dot.className = "sync-state-dot";
      if (status === "online") dot.classList.add("sync-state-dot--online");
      if (status === "syncing" || status === "connecting") dot.classList.add("sync-state-dot--syncing");
      if (status === "error") dot.classList.add("sync-state-dot--error");
    }
    const tripChip = document.getElementById("tripCloudChip");
    if (tripChip) {
      const chipLabels = {
        disabled: "☁ 仅保存在本机 · 点击开启共享",
        pairing: "☁ 已配置云端 · 点击完成配对",
        connecting: "☁ 正在连接共享空间…",
        syncing: "☁ 正在同步两个人的修改…",
        online: `☁ 已与 ${syncState.coupleName || "TA"} 同步`,
        offline: "☁ 离线编辑 · 联网后自动上传",
        error: "☁ 同步遇到问题 · 本机内容已保存"
      };
      tripChip.textContent = chipLabels[status] || text;
      tripChip.className = "trip-cloud-chip";
      if (status === "online") tripChip.classList.add("trip-cloud-chip--online");
      if (status === "syncing" || status === "connecting") tripChip.classList.add("trip-cloud-chip--syncing");
      if (status === "error") tripChip.classList.add("trip-cloud-chip--error");
    }
  }

  function syncRefreshUi() {
    if (syncState.coupleId && syncState.status === "online") {
      syncSetStatus("online", syncState.lastSync
        ? `已与 ${syncState.coupleName} 同步`
        : `已连接 ${syncState.coupleName}`);
    } else if (syncState.config && syncState.status === "disabled") {
      syncSetStatus("pairing", "已配置 Supabase · 点击查看共享状态");
    } else {
      const currentText = document.getElementById("syncStatusText")?.textContent
        || "未开启 · 点击连接免费共享空间";
      syncSetStatus(syncState.status, currentText, syncState.error || null);
    }
  }

  function syncMutation(kind, tripId, activityId = null) {
    if (!syncState.client || !syncState.coupleId) return;
    const allowed = ["upsert_trip", "delete_trip", "upsert_activity", "delete_activity"];
    if (!allowed.includes(kind)) return;
    const coupleId = syncState.coupleId;
    syncQueue = syncQueue.filter((operation) => {
      if (operation.coupleId !== coupleId) return true;
      if (kind === "delete_trip" && operation.tripId === tripId) return false;
      if (operation.tripId !== tripId) return true;
      if (kind === "upsert_trip" && operation.kind === "upsert_trip") return false;
      if (activityId && operation.activityId === activityId) return false;
      return true;
    });
    syncQueue.push({
      id: syncOperationId(),
      kind,
      coupleId,
      tripId,
      activityId,
      createdAt: new Date().toISOString()
    });
    syncSaveQueue();
    syncSetStatus("syncing", "本机已保存 · 正在同步…");
    syncScheduleFlush(120);
  }

  function syncQueueAllLocal() {
    if (!syncState.coupleId) return;
    const existingByKey = new Map();
    syncQueue = syncQueue.filter((operation) => operation.coupleId !== syncState.coupleId);
    state.trips.forEach((trip) => {
      existingByKey.set(`trip:${trip.id}`, {
        id: syncOperationId(),
        kind: "upsert_trip",
        coupleId: syncState.coupleId,
        tripId: trip.id,
        activityId: null,
        createdAt: new Date().toISOString()
      });
      trip.activities.forEach((activity) => {
        existingByKey.set(`activity:${activity.id}`, {
          id: syncOperationId(),
          kind: "upsert_activity",
          coupleId: syncState.coupleId,
          tripId: trip.id,
          activityId: activity.id,
          createdAt: new Date().toISOString()
        });
      });
    });
    syncQueue.push(...existingByKey.values());
    syncSaveQueue();
    syncScheduleFlush(20);
  }

  function syncScheduleFlush(delay = 200) {
    if (!syncState.client || !syncState.coupleId || !navigator.onLine) return;
    window.clearTimeout(syncRetryTimer);
    syncRetryTimer = window.setTimeout(() => syncFlushQueue(), delay);
  }

  async function syncFlushQueue() {
    if (syncFlushPromise) return syncFlushPromise;
    if (!syncState.client || !syncState.coupleId || !navigator.onLine) return false;
    const flushTask = (async () => {
      syncState.syncing = true;
      syncSetStatus("syncing", "正在上传本机修改…");
      try {
        let operation;
        while ((operation = syncQueue.find((item) => item.coupleId === syncState.coupleId))) {
          await syncExecuteOperation(operation);
          syncQueue = syncQueue.filter((item) => item.id !== operation.id);
          syncSaveQueue();
        }
        syncState.lastSync = new Date();
        syncSetStatus("online", "云端已同步");
        syncSchedulePull(250);
        return true;
      } catch (error) {
        console.warn("Cloud sync failed.", error);
        syncSetStatus("error", "同步失败 · 修改仍保存在本机", error);
        window.setTimeout(() => {
          if (syncState.coupleId && navigator.onLine) syncFlushQueue();
        }, 12000);
        return false;
      } finally {
        syncState.syncing = false;
      }
    })();
    syncFlushPromise = flushTask;
    flushTask.finally(() => {
      if (syncFlushPromise === flushTask) syncFlushPromise = null;
    });
    return flushTask;
  }

  async function syncExecuteOperation(operation) {
    const trip = state.trips.find((item) => item.id === operation.tripId);
    if (operation.kind === "delete_trip") {
      const result = await syncState.client
        .from("trips")
        .delete()
        .eq("id", operation.tripId)
        .eq("couple_id", syncState.coupleId);
      if (result.error) throw result.error;
      return;
    }
    if (operation.kind === "delete_activity") {
      const result = await syncState.client
        .from("activities")
        .delete()
        .eq("id", operation.activityId)
        .eq("couple_id", syncState.coupleId);
      if (result.error) throw result.error;
      return;
    }
    if (!trip) return;

    if (operation.kind === "upsert_trip") {
      const { activities, ...payload } = trip;
      const result = await syncState.client.from("trips").upsert({
        id: trip.id,
        couple_id: syncState.coupleId,
        payload: syncCleanPayload(payload)
      }, { onConflict: "id" });
      if (result.error) throw result.error;
      return;
    }

    const activity = trip.activities.find((item) => item.id === operation.activityId);
    if (!activity) return;
    await syncUploadActivityPhoto(activity);
    const result = await syncState.client.from("activities").upsert({
      id: activity.id,
      couple_id: syncState.coupleId,
      trip_id: trip.id,
      payload: syncCleanPayload(activity)
    }, { onConflict: "id" });
    if (result.error) throw result.error;
  }

  async function syncUploadActivityPhoto(activity) {
    if (!syncIsDataUrl(activity?.photo)) return;
    const blob = await fetch(activity.photo).then((response) => response.blob());
    const safeActivityId = String(activity.id).replace(/[^a-zA-Z0-9_-]/g, "-");
    const path = `${syncState.coupleId}/${safeActivityId}.jpg`;
    const uploadResult = await syncState.client.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "3600"
      });
    if (uploadResult.error) {
      throw new Error(`照片上传失败：${uploadResult.error.message}`);
    }
    activity.photo = path;
    persist();
    const url = await syncCreateSignedPhotoUrl(path, true);
    if (url) {
      photoUrlCache.set(path, { url, expires: Date.now() + 50 * 60 * 1000 });
      syncRefreshPhotoDom(path, url);
    }
  }

  function syncCleanPayload(value) {
    const clean = { ...value };
    delete clean.photoUrl;
    delete clean.updatedAt;
    delete clean._remoteUpdatedAt;
    return clean;
  }

  function syncSchedulePull(delay = 160) {
    window.clearTimeout(syncPullTimer);
    syncPullTimer = window.setTimeout(() => {
      syncPullRemoteData({ silent: true }).catch((error) => {
        console.warn("Could not pull shared travel data.", error);
        syncSetStatus("error", "拉取云端修改失败", error);
      });
    }, delay);
  }

  async function syncPullRemoteData({ silent = false, initial = false } = {}) {
    if (!syncState.client || !syncState.coupleId) return false;
    if (syncState.pulling) {
      syncSchedulePull(220);
      return false;
    }
    syncState.pulling = true;
    if (!silent) syncSetStatus("syncing", "正在获取 TA 的最新修改…");
    try {
      const [tripResult, activityResult] = await Promise.all([
        syncState.client.from("trips").select("id, payload, updated_at").eq("couple_id", syncState.coupleId),
        syncState.client.from("activities").select("id, trip_id, payload, updated_at").eq("couple_id", syncState.coupleId)
      ]);
      if (tripResult.error) throw tripResult.error;
      if (activityResult.error) throw activityResult.error;

      const localTrips = state.trips;
      const remoteTrips = (tripResult.data || []).map((row) => ({
        ...(row.payload || {}),
        id: row.id,
        activities: [],
        _remoteUpdatedAt: row.updated_at
      }));
      const remoteById = new Map(remoteTrips.map((trip) => [trip.id, trip]));
      (activityResult.data || []).forEach((row) => {
        const trip = remoteById.get(row.trip_id);
        if (trip) {
          trip.activities.push({
            ...(row.payload || {}),
            id: row.id,
            _remoteUpdatedAt: row.updated_at
          });
        }
      });

      let mergedTrips = remoteTrips;
      if (remoteTrips.length === 0 && initial && !syncState.knownCouple && localTrips.length) {
        mergedTrips = localTrips.map((trip) => syncClone(trip));
      }

      syncQueue
        .filter((operation) => operation.coupleId === syncState.coupleId)
        .forEach((operation) => {
          if (operation.kind === "delete_trip") {
            mergedTrips = mergedTrips.filter((trip) => trip.id !== operation.tripId);
            return;
          }
          if (operation.kind === "upsert_trip") {
            const localTrip = localTrips.find((trip) => trip.id === operation.tripId);
            if (!localTrip) return;
            const existing = mergedTrips.find((trip) => trip.id === localTrip.id);
            if (existing) {
              Object.assign(existing, syncClone(localTrip), { activities: existing.activities });
            } else {
              mergedTrips.push({ ...syncClone(localTrip), activities: [] });
            }
            return;
          }
          if (operation.kind === "delete_activity") {
            const trip = mergedTrips.find((item) => item.id === operation.tripId);
            if (trip) trip.activities = trip.activities.filter((item) => item.id !== operation.activityId);
            return;
          }
          if (operation.kind === "upsert_activity") {
            const localTrip = localTrips.find((trip) => trip.id === operation.tripId);
            const localActivity = localTrip?.activities.find((item) => item.id === operation.activityId);
            if (!localActivity) return;
            let trip = mergedTrips.find((item) => item.id === operation.tripId);
            if (!trip && localTrip) {
              trip = { ...syncClone(localTrip), activities: [] };
              mergedTrips.push(trip);
            }
            if (trip) trip.activities = trip.activities.filter((item) => item.id !== localActivity.id);
            if (trip) trip.activities.push(syncClone(localActivity));
          }
        });

      state.trips = mergedTrips;
      if (!state.trips.some((trip) => trip.id === state.activeTripId)) {
        state.activeTripId = state.trips[0]?.id || null;
      }
      if (!state.trips.some((trip) => trip.id === selectedTripId)) {
        selectedTripId = state.activeTripId;
      }
      syncState.remoteTripCount = remoteTrips.length;
      syncState.lastSync = new Date();
      persist();
      saveAndRefresh();
      syncSetStatus(navigator.onLine ? "online" : "offline", "云端已同步");
      syncRequestAllPhotoUrls();
      return true;
    } finally {
      syncState.pulling = false;
    }
  }

  function syncRequestAllPhotoUrls() {
    state.trips.forEach((trip) => {
      trip.activities.forEach((activity) => {
        if (activity.photo && !syncIsDataUrl(activity.photo) && !syncIsHttpUrl(activity.photo)) {
          getPhotoUrl(activity.photo);
        }
      });
    });
  }

  function getPhotoUrl(path) {
    if (!path || syncIsDataUrl(path) || syncIsHttpUrl(path)) return path || "";
    const cached = photoUrlCache.get(path);
    if (cached && cached.expires > Date.now()) return cached.url;
    syncRequestSignedPhotoUrl(path);
    return "";
  }

  function syncRequestSignedPhotoUrl(path) {
    if (pendingPhotoRequests.has(path) || !syncState.client || !syncState.coupleId) return;
    pendingPhotoRequests.add(path);
    syncCreateSignedPhotoUrl(path)
      .then((url) => {
        if (!url) return;
        photoUrlCache.set(path, { url, expires: Date.now() + 50 * 60 * 1000 });
        syncRefreshPhotoDom(path, url);
      })
      .catch((error) => console.warn("Could not sign photo URL.", error))
      .finally(() => pendingPhotoRequests.delete(path));
  }

  async function syncCreateSignedPhotoUrl(path, force = false) {
    if (!force) {
      const cached = photoUrlCache.get(path);
      if (cached && cached.expires > Date.now()) return cached.url;
    }
    if (!syncState.client) return "";
    const result = await syncState.client.storage.from(BUCKET).createSignedUrl(path, 3600);
    if (result.error) throw result.error;
    return result.data?.signedUrl || "";
  }

  function syncRefreshPhotoDom(path, url) {
    document.querySelectorAll("img[data-photo-path]").forEach((image) => {
      if (image.dataset.photoPath === path) image.src = url;
    });
    document.querySelectorAll("[data-photo-placeholder]").forEach((placeholder) => {
      if (placeholder.dataset.photoPlaceholder !== path) return;
      const image = document.createElement("img");
      image.src = url;
      image.alt = "旅行照片";
      image.dataset.photoPath = path;
      placeholder.replaceWith(image);
    });
  }

  function syncOpenSettings() {
    if (!syncState.config) return syncOpenConfigPanel();
    syncConnect({ silent: false })
      .then((hasCouple) => {
        if (hasCouple) syncOpenConnectedPanel();
        else syncOpenPairingPanel();
      })
      .catch((error) => {
        console.warn(error);
        syncOpenConfigPanel(syncFriendlyError(error));
      });
  }

  function syncOpenConfigPanel(initialError = "") {
    const config = syncState.config || { url: "", key: "" };
    openModal(`
      <div class="sheet-heading"><h2>两个人的同一份行程</h2><p>使用 Supabase Free 套餐。行程先保存在手机里，再自动同步到你们自己的云端空间。</p></div>
      <div class="sync-hero">
        <span class="sync-hero-icon">☁</span>
        <div><b>本地优先 · 免费起步</b><p>两台手机通过匿名设备账号和邀请码配对。照片会压缩后上传，数据库权限只允许空间成员访问。</p></div>
      </div>
      <div class="sync-error ${initialError ? "sync-error--visible" : ""}" id="syncConfigError">${escapeHtml(initialError)}</div>
      <div class="sync-steps">
        <div class="sync-step"><span>1</span><p>在 <a href="https://supabase.com/dashboard" target="_blank" rel="noopener">Supabase</a> 新建免费项目，并在 Authentication → Providers 中开启 Anonymous Sign-ins。</p></div>
        <div class="sync-step"><span>2</span><p>打开 <a href="./schema.sql" target="_blank" rel="noopener">schema.sql</a>，在 Supabase 的 SQL Editor 中完整运行一次。</p></div>
        <div class="sync-step"><span>3</span><p>在 Project Settings → API 复制 Project URL 和 anon public key，填入下面。</p></div>
      </div>
      <form id="supabaseConfigForm" class="form-grid">
        <label class="field"><span>Project URL</span><input name="url" type="url" value="${escapeAttr(config.url || "")}" placeholder="https://xxxx.supabase.co" required></label>
        <label class="field"><span>anon public key</span><input name="key" type="password" value="${escapeAttr(config.key || "")}" placeholder="eyJ… 或 sb_publishable_…" autocomplete="off" required></label>
        <div class="sync-config-actions">
          <a class="sync-inline-link" href="./schema.sql" target="_blank" rel="noopener">查看数据库脚本</a>
          <a class="sync-inline-link" href="https://supabase.com/dashboard" target="_blank" rel="noopener">打开 Supabase</a>
        </div>
        <div class="sync-error" id="syncConfigFormError"></div>
        <button class="button button--primary button--wide" type="submit">连接免费云空间</button>
      </form>
      <div class="privacy-note"><b>不要把 secret key 或 service_role key 填进来</b><p>anon public key 本来就是给网页客户端用的，真正的访问隔离由数据库里的成员权限策略完成。</p></div>
    `, () => {
      const form = document.getElementById("supabaseConfigForm");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const errorBox = document.getElementById("syncConfigFormError");
        errorBox.className = "sync-error";
        const data = new FormData(form);
        const url = String(data.get("url")).trim().replace(/\/+$/, "");
        const key = String(data.get("key")).trim();
        if (!/^https?:\/\//i.test(url)) {
          errorBox.textContent = "Project URL 需要以 https:// 开头";
          errorBox.classList.add("sync-error--visible");
          return;
        }
        if (key.includes("service_role") || key.startsWith("sb_secret_")) {
          errorBox.textContent = "这是服务端密钥，不能放进网页。请填写 anon public key。";
          errorBox.classList.add("sync-error--visible");
          return;
        }
        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        submit.textContent = "正在连接…";
        syncDisconnect(false);
        syncSaveConfig({ url, key });
        try {
          const hasCouple = await syncConnect();
          if (hasCouple) syncOpenConnectedPanel();
          else syncOpenPairingPanel();
        } catch (error) {
          console.warn(error);
          errorBox.textContent = syncFriendlyError(error);
          errorBox.classList.add("sync-error--visible");
          submit.disabled = false;
          submit.textContent = "重新连接";
        }
      });
    });
  }

  function syncOpenPairingPanel() {
    if (!syncState.user) {
      syncOpenConfigPanel("设备身份尚未连接，请重新连接 Supabase。");
      return;
    }
    const suggestedCode = syncGenerateInviteCode();
    openModal(`
      <div class="sheet-heading"><h2>把几台设备连起来</h2><p>由一个人创建空间，再把邀请码发给 TA 或自己的另一台设备。邀请码可以随时更换。</p></div>
      <div class="sync-error" id="pairingError"></div>
      <div class="pair-grid">
        <div class="pair-card">
          <span class="sync-badge">先开始的一方</span>
          <h3>创建共享空间</h3>
          <p>会把这台设备上已有的行程一起上传。</p>
          <form id="createCoupleForm" class="form-grid">
            <label class="field"><span>空间名称</span><input name="name" value="我们的旅行" maxlength="48" required></label>
            <label class="field"><span>邀请码</span><input name="code" value="${escapeAttr(suggestedCode)}" minlength="8" maxlength="24" pattern="[A-Za-z0-9-]{8,24}" required></label>
            <button class="button button--primary button--wide" type="submit">创建并上传本机行程</button>
          </form>
        </div>
        <div class="pair-card pair-card--join">
          <span class="sync-badge">加入的一方</span>
          <h3>使用 TA 的邀请码</h3>
          <p>手机、平板或电脑都能用同一个邀请码加入，本机原来的内容会留一份备份。</p>
          <form id="joinCoupleForm" class="form-grid">
            <label class="field"><span>邀请码</span><input name="code" placeholder="例如 SUI-AB12CD" minlength="8" maxlength="24" required></label>
            <button class="button button--primary button--wide" type="submit">加入共享空间</button>
          </form>
        </div>
      </div>
    `, () => {
      const createForm = document.getElementById("createCoupleForm");
      const joinForm = document.getElementById("joinCoupleForm");
      createForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = createForm.querySelector("button");
        button.disabled = true;
        button.textContent = "正在创建…";
        const data = new FormData(createForm);
        try {
          const result = await syncState.client.rpc("create_couple_space", {
            p_name: String(data.get("name")).trim(),
            p_invite_code: String(data.get("code")).trim().toUpperCase()
          });
          if (result.error) throw result.error;
          await syncConnect();
          syncQueueAllLocal();
          await syncFlushQueue();
          syncOpenConnectedPanel({ justCreated: true });
        } catch (error) {
          syncShowPairingError(error);
          button.disabled = false;
          button.textContent = "创建并上传本机行程";
        }
      });

      joinForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = joinForm.querySelector("button");
        button.disabled = true;
        button.textContent = "正在加入…";
        const data = new FormData(joinForm);
        localStorage.setItem(PRE_JOIN_BACKUP_KEY, JSON.stringify({
          savedAt: new Date().toISOString(),
          data: state
        }));
        try {
          const result = await syncState.client.rpc("join_couple_space", {
            p_invite_code: String(data.get("code")).trim().toUpperCase()
          });
          if (result.error) throw result.error;
          await syncConnect();
          if (syncState.remoteTripCount === 0) {
            syncQueueAllLocal();
            await syncFlushQueue();
          }
          syncOpenConnectedPanel();
          showToast("已加入 TA 的旅行空间");
        } catch (error) {
          syncShowPairingError(error);
          button.disabled = false;
          button.textContent = "加入共享空间";
        }
      });
    });
  }

  function syncShowPairingError(error) {
    const box = document.getElementById("pairingError");
    if (!box) return;
    box.textContent = syncFriendlyError(error);
    box.classList.add("sync-error--visible");
  }

  async function syncOpenConnectedPanel({ justCreated = false } = {}) {
    await syncRefreshMemberCount();
    const statusText = syncState.status === "online"
      ? "云端已同步"
      : syncState.status === "offline"
        ? "当前离线，本机修改会在联网后上传"
        : syncState.error || "正在同步";
    openModal(`
      <div class="sheet-heading"><h2>${justCreated ? "共享空间建好了" : "情侣云端同步"}</h2><p>${justCreated ? "把邀请码发给 TA，让另一半加入同一份行程。" : "你们现在编辑的是同一份旅行清单。"}</p></div>
      <div class="sync-hero">
        <span class="sync-hero-icon">✓</span>
        <div><b>${escapeHtml(syncState.coupleName)}</b><p id="syncConnectedStatus">${escapeHtml(statusText)} · ${syncState.memberCount || 1}/6 台设备</p></div>
      </div>
      <div>
        <span class="field-label">发给 TA 的邀请码</span>
        <div class="invite-code" id="syncInviteCode">${escapeHtml(syncState.inviteCode || "暂无")}</div>
      </div>
      <div class="sync-management">
        <button class="button button--primary" type="button" id="copyInviteButton">复制邀请码</button>
        <button class="button button--ghost" type="button" id="syncNowButton">立即同步</button>
        <button class="button button--ghost" type="button" id="uploadLocalButton">上传本机行程</button>
        <button class="button button--ghost" type="button" id="changeConfigButton">更换云项目</button>
      </div>
      <div class="sync-detail-list">
        <div class="sync-detail-row"><span>实时状态</span><b>${escapeHtml(statusText)}</b></div>
        <div class="sync-detail-row"><span>最近同步</span><b>${syncState.lastSync ? escapeHtml(syncFormatTime(syncState.lastSync)) : "等待首次同步"}</b></div>
        <div class="sync-detail-row"><span>待上传修改</span><b>${syncQueue.filter((item) => item.coupleId === syncState.coupleId).length} 项</b></div>
      </div>
      <button class="sync-danger-link" type="button" id="rotateInviteButton">邀请码泄露了？生成新邀请码</button>
      <button class="sync-danger-link" type="button" id="disconnectSyncButton">仅在这台设备上关闭云同步</button>
    `, () => {
      document.getElementById("copyInviteButton").addEventListener("click", () => syncCopyInviteCode());
      document.getElementById("syncNowButton").addEventListener("click", async () => {
        const button = document.getElementById("syncNowButton");
        button.disabled = true;
        button.textContent = "同步中…";
        await syncFlushQueue();
        await syncPullRemoteData({ silent: false });
        syncOpenConnectedPanel();
        showToast("已经检查过两个人的最新修改");
      });
      document.getElementById("uploadLocalButton").addEventListener("click", async () => {
        const button = document.getElementById("uploadLocalButton");
        button.disabled = true;
        button.textContent = "上传中…";
        syncQueueAllLocal();
        const success = await syncFlushQueue();
        syncOpenConnectedPanel();
        showToast(success ? "本机行程已上传，同名行程会被更新" : "上传失败，内容仍保留在本机");
      });
      document.getElementById("changeConfigButton").addEventListener("click", () => {
        syncOpenConfigPanel();
      });
      document.getElementById("rotateInviteButton").addEventListener("click", () => syncRotateInviteCode());
      document.getElementById("disconnectSyncButton").addEventListener("click", () => syncDisconnectLocal());
    });
  }

  async function syncRefreshMemberCount() {
    if (!syncState.client || !syncState.coupleId) return;
    const result = await syncState.client
      .from("couple_members")
      .select("user_id", { count: "exact" })
      .eq("couple_id", syncState.coupleId);
    if (!result.error) syncState.memberCount = result.count ?? result.data?.length ?? 0;
  }

  async function syncCopyInviteCode() {
    try {
      await navigator.clipboard.writeText(syncState.inviteCode);
      showToast("邀请码已复制，发给 TA 即可");
    } catch {
      const input = document.createElement("textarea");
      input.value = syncState.inviteCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast("邀请码已复制");
    }
  }

  async function syncRotateInviteCode() {
    const result = await syncState.client
      .from("couple_spaces")
      .update({ invite_code: syncGenerateInviteCode() })
      .eq("id", syncState.coupleId)
      .select("invite_code")
      .single();
    if (result.error) {
      showToast("邀请码更新失败，请稍后重试");
      return;
    }
    syncState.inviteCode = result.data.invite_code;
    syncOpenConnectedPanel();
    showToast("新邀请码已生成，旧邀请码立即失效");
  }

  async function syncDisconnectLocal() {
    const confirmed = await showConfirm(
      "在这台设备关闭同步？",
      "云端数据不会删除，本机行程也会保留。之后可以重新连接 Supabase 并恢复共享。",
      "关闭同步"
    );
    if (!confirmed) return;
    syncDisconnect(true);
    syncSaveConfig(null);
    closeModal();
    showToast("已切换为仅本机保存");
  }

  function syncDisconnect(clearKnown = true) {
    if (syncState.client && syncState.channel) syncState.client.removeChannel(syncState.channel);
    syncState.channel = null;
    syncState.client = null;
    syncState.user = null;
    syncState.coupleId = null;
    syncState.coupleName = "";
    syncState.inviteCode = "";
    syncState.lastSync = null;
    syncState.memberCount = 0;
    syncState.error = "";
    photoUrlCache.clear();
    if (clearKnown) {
      localStorage.removeItem(KNOWN_COUPLE_KEY);
      syncSetStatus("disabled", "未开启 · 点击连接免费共享空间");
    }
  }

  function syncFriendlyError(error) {
    const message = String(error?.message || error || "未知错误");
    if (/anonymous.*(disabled|not enabled)|anonymous_provider_disabled/i.test(message)) {
      return "请先在 Supabase 的 Authentication → Providers 中开启 Anonymous Sign-ins。";
    }
    if (/relation .* does not exist|Could not find the table|schema cache/i.test(message)) {
      return "数据库表还未创建。请先在 SQL Editor 运行 schema.sql。";
    }
    if (/row-level security|permission denied/i.test(message)) {
      return "云端权限拒绝了这个操作，请确认已经运行完整 schema.sql。";
    }
    if (/bucket.*not found/i.test(message)) {
      return "照片存储桶不存在，请重新运行 schema.sql。";
    }
    if (/invite|邀请码/i.test(message) && /exist|不存在/i.test(message)) {
      return "邀请码不存在，请检查后重新输入。";
    }
    if (/6 台设备|6.*device|member.*limit/i.test(message)) {
      return "这个共享空间已经达到 6 台设备上限。可以在 Supabase Table Editor 中删除不再使用的设备记录。";
    }
    if (/fetch|network|Failed to fetch/i.test(message)) {
      return "无法连接 Supabase。请检查网络、Project URL 和项目是否处于暂停状态。";
    }
    return message.length > 160 ? `${message.slice(0, 160)}…` : message;
  }

  function syncGenerateInviteCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
    return `SUI-${suffix}`;
  }

  function syncOperationId() {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function syncClone(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function syncIsDataUrl(value) {
    return typeof value === "string" && /^data:image\//i.test(value);
  }

  function syncIsHttpUrl(value) {
    return typeof value === "string" && /^https?:\/\//i.test(value);
  }

  function syncFormatTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "刚刚";
    return new Intl.DateTimeFormat("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }
})();
