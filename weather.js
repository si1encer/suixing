"use strict";

(() => {
  const WEATHER_CACHE_KEY = "suixing-weather-cache-v1";
  const GEOCODE_CACHE_KEY = "suixing-geocode-cache-v1";
  const CACHE_MS = 30 * 60 * 1000;
  const weatherCache = loadCache(WEATHER_CACHE_KEY);
  const geocodeCache = loadCache(GEOCODE_CACHE_KEY);
  const pendingRenders = new Set();

  window.SuixingWeather = {
    chipMarkup,
    refresh
  };

  document.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-weather-day-index]");
    if (!chip) return;
    const trip = findTrip(selectedTripId);
    const dayIndex = Number(chip.dataset.weatherDayIndex);
    const day = trip?.days?.[dayIndex];
    if (!trip || !day) return;
    const date = addDays(trip.startDate, dayIndex);
    openWeatherRegionPicker(trip, day, date, dayIndex, getStaysForDate(trip, date));
  });

  window.setTimeout(refresh, 0);

  function chipMarkup(trip, day, date, index) {
    return `<button class="weather-chip weather-chip--loading" type="button" data-weather-day-index="${Number(index)}"><span class="weather-chip-icon">☁</span><span class="weather-chip-text">天气</span></button>`;
  }

  function refresh() {
    document.querySelectorAll("[data-weather-day-index]").forEach((button) => {
      if (button.dataset.weatherBound === "true") return;
      button.dataset.weatherBound = "true";
      hydrateChip(button).catch((error) => {
        console.warn("Weather display failed.", error);
        setChipState(button, "error", "☁", "重试", "天气暂时无法获取");
      });
    });
  }

  async function hydrateChip(button) {
    const trip = findTrip(selectedTripId);
    const index = Number(button.dataset.weatherDayIndex);
    const day = trip?.days?.[index];
    if (!trip || !day) return;
    const date = addDays(trip.startDate, index);
    const dateKey = toYmd(date);
    const stayOffset = daysBetween(startOfDay(new Date()), startOfDay(date));
    const stays = getStaysForDate(trip, date);
    const region = await resolveWeatherRegion(trip, day, stays);
    const placeLabel = region ? shortWeatherPlace(region) : "";

    if (stayOffset < 0) {
      setChipState(button, "muted", "☁", "已过去", "当天天气仅供出发前参考", placeLabel);
      return;
    }
    if (stayOffset > 15) {
      setChipState(button, "muted", "☁", "待更新", "天气预报将在出发前 16 天内显示", placeLabel);
      return;
    }

    if (!region) {
      setChipState(button, "muted", "☁", "选地区", "选择天气地区后显示预报");
      return;
    }

    const cacheKey = `${region.latitude.toFixed(3)},${region.longitude.toFixed(3)},${dateKey}`;
    const cached = getCache(weatherCache, cacheKey);
    if (cached) {
      renderForecastChip(button, cached, region);
      return;
    }

    const renderKey = `${trip.id}:${index}:${cacheKey}`;
    if (pendingRenders.has(renderKey)) return;
    pendingRenders.add(renderKey);
    setChipState(button, "loading", "☁", "天气", "", placeLabel);
    try {
      const params = new URLSearchParams({
        latitude: String(region.latitude),
        longitude: String(region.longitude),
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        timezone: "auto",
        start_date: dateKey,
        end_date: dateKey
      });
      const response = await fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`);
      const daily = response.daily;
      if (!daily?.time?.length) {
        setChipState(button, "muted", "☁", "待更新", "暂时没有这一天的天气预报", placeLabel);
        return;
      }
      const data = {
        code: Number(daily.weather_code?.[0]),
        high: Math.round(Number(daily.temperature_2m_max?.[0])),
        low: Math.round(Number(daily.temperature_2m_min?.[0])),
        rain: Number(daily.precipitation_probability_max?.[0] ?? 0)
      };
      setCache(weatherCache, WEATHER_CACHE_KEY, cacheKey, data);
      renderForecastChip(button, data, region);
    } finally {
      pendingRenders.delete(renderKey);
    }
  }

  function renderForecastChip(button, data, region) {
    const weather = weatherMeta(data.code);
    const detail = `${region.name} · ${weather.label} · 最高 ${data.high}° / 最低 ${data.low}° · 降水概率 ${Number.isFinite(data.rain) ? data.rain : 0}%`;
    setChipState(button, "ready", weather.icon, `${data.high}°/${data.low}°`, detail, shortWeatherPlace(region));
  }

  function setChipState(button, state, icon, text, title = "", location = "") {
    button.className = `weather-chip weather-chip--${state}`;
    button.title = title;
    button.innerHTML = `
      <span class="weather-chip-icon">${icon}</span>
      ${location ? `<span class="weather-chip-place">${escapeHtml(location)}</span>` : ""}
      <span class="weather-chip-text">${escapeHtml(text)}</span>`;
  }

  function shortWeatherPlace(region) {
    return String(region?.name || "")
      .split(" · ")[0]
      .replace(/市$/, "")
      .trim();
  }

  async function resolveWeatherRegion(trip, day, stays) {
    if (isValidRegion(day.weatherRegion)) return { ...day.weatherRegion, source: "manual" };
    const stay = stays[0];
    const areaName = inferWeatherArea(stay, trip);
    if (!areaName) return null;
    const cached = getCache(geocodeCache, areaName.toLowerCase());
    if (cached) return cached;
    const result = await geocodeArea(areaName);
    if (!result) return null;
    const region = {
      name: result.displayName,
      latitude: result.latitude,
      longitude: result.longitude,
      source: stay ? "hotel" : "destination",
      stayId: stay?.id || null
    };
    setCache(geocodeCache, GEOCODE_CACHE_KEY, areaName.toLowerCase(), region, 24 * 60 * 60 * 1000);
    return region;
  }

  function inferWeatherArea(stay, trip) {
    const address = String(stay?.address || "").replace(/\s+/g, "");
    if (address) {
      const withoutProvince = address.replace(/^.*?(?:省|自治区|特别行政区)/, "");
      const city = withoutProvince.match(/^([\u4e00-\u9fa5]{2,12}?(?:市|自治州|地区|盟))/);
      if (city) return city[1];
    }
    return String(trip.destination || "").trim();
  }

  async function geocodeArea(query) {
    if (!query) return null;
    const params = new URLSearchParams({
      name: query,
      count: "8",
      language: "zh",
      format: "json"
    });
    const response = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
    const results = Array.isArray(response.results) ? response.results : [];
    if (!results.length) return null;
    return normalizeGeocodeResult(results[0]);
  }

  function normalizeGeocodeResult(result) {
    const parts = [result.admin2, result.admin1, result.country]
      .filter(Boolean)
      .filter((item) => item !== result.name)
      .filter((item, index, list) => list.indexOf(item) === index);
    return {
      name: result.name,
      displayName: parts.length ? `${result.name} · ${parts.join(" / ")}` : result.name,
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
      timezone: result.timezone || ""
    };
  }

  function isValidRegion(region) {
    return Boolean(
      region
      && Number.isFinite(Number(region.latitude))
      && Number.isFinite(Number(region.longitude))
      && String(region.name || "").trim()
    );
  }

  function openWeatherRegionPicker(trip, day, date, dayIndex, stays) {
    const stay = stays[0];
    const defaultArea = inferWeatherArea(stay, trip) || "行程目的地";
    const manualRegion = isValidRegion(day.weatherRegion) ? day.weatherRegion : null;
    const defaultLabel = stay ? `${stay.name} · ${defaultArea}` : defaultArea;
    openModal(`
      <div class="sheet-heading"><h2>选择这一天的天气地区</h2><p>默认跟随当天酒店；也可以只看目的地或临时切换城市。</p></div>
      <div class="weather-location-current">
        <span>当前</span>
        <div><b>${escapeHtml(manualRegion?.name || defaultLabel)}</b><small>${manualRegion ? "手动选择" : stay ? "默认住宿地区" : "默认行程地区"}</small></div>
      </div>
      <button class="weather-default-button" type="button" id="useDefaultWeatherArea">
        <span>⌂</span><div><b>使用默认地区</b><small>${escapeHtml(defaultLabel)}</small></div>
      </button>
      <form class="weather-search-form" id="weatherSearchForm">
        <label class="field"><span>搜索城市或地区</span><input name="query" value="${escapeAttr(manualRegion?.name || defaultArea)}" placeholder="例如：泉州市、厦门、京都" required></label>
        <button class="button button--primary" type="submit">搜索</button>
      </form>
      <div class="weather-results" id="weatherSearchResults"></div>
      <p class="weather-attribution">天气与地点数据由 <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> 提供，仅供旅行参考。</p>
    `, () => {
      document.getElementById("useDefaultWeatherArea").addEventListener("click", () => {
        delete day.weatherRegion;
        notifyCloudMutation("upsert_trip", trip.id);
        persist();
        closeModal();
        saveAndRefresh();
        showToast("已使用当天酒店的默认天气地区");
      });
      const form = document.getElementById("weatherSearchForm");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const query = String(new FormData(form).get("query")).trim();
        if (!query) return;
        const results = document.getElementById("weatherSearchResults");
        results.innerHTML = `<div class="weather-search-status">正在查找地区…</div>`;
        try {
          const params = new URLSearchParams({ name: query, count: "10", language: "zh", format: "json" });
          const response = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
          const places = (response.results || []).map(normalizeGeocodeResult);
          if (!places.length) {
            results.innerHTML = `<div class="weather-search-status">没有找到这个地区，试试城市名或邮编。</div>`;
            return;
          }
          results.innerHTML = places.map((place, index) => `
            <button class="weather-place-result" type="button" data-weather-place="${index}">
              <span>${escapeHtml(place.name.slice(0, 1))}</span>
              <span><b>${escapeHtml(place.name)}</b><small>${escapeHtml(place.displayName)}</small></span>
              <em>选择</em>
            </button>`).join("");
          results.querySelectorAll("[data-weather-place]").forEach((button) => {
            button.addEventListener("click", () => {
              const place = places[Number(button.dataset.weatherPlace)];
              day.weatherRegion = {
                name: place.displayName,
                latitude: place.latitude,
                longitude: place.longitude,
                source: "manual"
              };
              notifyCloudMutation("upsert_trip", trip.id);
              persist();
              closeModal();
              saveAndRefresh();
              showToast(`这一天改为显示 ${place.name} 的天气`);
            });
          });
        } catch (error) {
          console.warn(error);
          results.innerHTML = `<div class="weather-search-status">地区搜索失败，请检查网络后重试。</div>`;
        }
      });
    });
  }

  function weatherMeta(code) {
    if (code === 0) return { icon: "☀", label: "晴" };
    if ([1, 2].includes(code)) return { icon: "🌤", label: "少云" };
    if (code === 3) return { icon: "☁", label: "多云" };
    if ([45, 48].includes(code)) return { icon: "🌫", label: "有雾" };
    if (code >= 51 && code <= 57) return { icon: "🌦", label: "毛毛雨" };
    if (code >= 61 && code <= 67) return { icon: "🌧", label: "有雨" };
    if (code >= 71 && code <= 77) return { icon: "🌨", label: "有雪" };
    if (code >= 80 && code <= 82) return { icon: "🌦", label: "阵雨" };
    if ([85, 86].includes(code)) return { icon: "🌨", label: "阵雪" };
    if (code >= 95) return { icon: "⛈", label: "雷雨" };
    return { icon: "☁", label: "多云" };
  }

  async function fetchJson(url) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function loadCache(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function getCache(store, key) {
    const entry = store[key];
    if (!entry) return null;
    if (Number(entry.expiresAt) <= Date.now()) {
      delete store[key];
      return null;
    }
    return entry.data;
  }

  function setCache(store, storageKey, key, data, ttl = CACHE_MS) {
    store[key] = { data, expiresAt: Date.now() + ttl };
    try {
      localStorage.setItem(storageKey, JSON.stringify(store));
    } catch (error) {
      console.warn("Could not cache weather data.", error);
    }
  }
})();
