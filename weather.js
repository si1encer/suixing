"use strict";

(() => {
  const WEATHER_CACHE_KEY = "suixing-weather-cache-v1";
  const GEOCODE_CACHE_KEY = "suixing-geocode-cache-v1";
  const DISTRICT_DATA_URL = "./data/china-districts.json";
  const CACHE_MS = 30 * 60 * 1000;
  const weatherCache = loadCache(WEATHER_CACHE_KEY);
  const geocodeCache = loadCache(GEOCODE_CACHE_KEY);
  const pendingRenders = new Set();
  let districtDataPromise = null;
  let districtRecords = [];

  window.SuixingWeather = {
    chipMarkup,
    refresh,
    prepareRegionOptions,
    validateStayRegion
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
  loadDistrictData().catch((error) => console.warn("Could not load district data.", error));

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
    if (stay && Number.isFinite(Number(stay.regionLatitude)) && Number.isFinite(Number(stay.regionLongitude))) {
      return {
        name: stay.regionName || stay.address || stay.name,
        latitude: Number(stay.regionLatitude),
        longitude: Number(stay.regionLongitude),
        source: "hotel-district",
        stayId: stay.id
      };
    }
    if (stay?.regionName) {
      await loadDistrictData();
      const district = findDistrictByName(stay.regionName);
      if (district) {
        return {
          ...districtToRegion(district),
          source: "hotel-district",
          stayId: stay.id
        };
      }
    }
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

  async function validateStayRegion(value) {
    const query = String(value || "").trim();
    if (!query) return null;
    await loadDistrictData();
    const exact = findDistrictByName(query);
    if (exact) return {
      name: exact.label,
      latitude: exact.latitude,
      longitude: exact.longitude,
      adcode: exact.adcode
    };
    if (/[区县旗]$/.test(query)) return null;
    try {
      const fallback = await geocodeArea(query);
      if (!fallback) return null;
      return {
        name: fallback.displayName,
        latitude: fallback.latitude,
        longitude: fallback.longitude,
        adcode: ""
      };
    } catch {
      return null;
    }
  }

  async function prepareRegionOptions() {
    const datalist = document.getElementById("chinaDistrictOptions");
    if (!datalist || datalist.dataset.ready === "true") return;
    try {
      await loadDistrictData();
      const sorted = districtRecords.slice().sort((a, b) =>
        `${a.province}${a.city}${a.district}`.localeCompare(`${b.province}${b.city}${b.district}`, "zh-CN")
      );
      datalist.innerHTML = sorted.map((district) =>
        `<option value="${escapeAttr(district.label)}">${escapeHtml(`${district.province} ${district.city}`)}</option>`
      ).join("");
      datalist.dataset.ready = "true";
    } catch (error) {
      console.warn("Could not prepare district options.", error);
    }
  }

  async function loadDistrictData() {
    if (districtRecords.length) return districtRecords;
    if (!districtDataPromise) {
      districtDataPromise = fetchJson(DISTRICT_DATA_URL).then((payload) => {
        districtRecords = Array.isArray(payload.records) ? payload.records : [];
        return districtRecords;
      });
    }
    return districtDataPromise;
  }

  function findDistrictByName(value) {
    const normalized = normalizeRegionText(value);
    if (!normalized) return null;
    const exact = districtRecords.filter((district) => normalizeRegionText(district.label) === normalized);
    if (exact.length === 1) return exact[0];
    const byDistrict = districtRecords.filter((district) => normalizeRegionText(district.district) === normalized);
    return byDistrict.length === 1 ? byDistrict[0] : null;
  }

  function normalizeRegionText(value) {
    return String(value || "").replace(/[\s·/\\-]/g, "").toLowerCase();
  }

  function districtToRegion(district) {
    return {
      name: district.label,
      latitude: district.latitude,
      longitude: district.longitude,
      adcode: district.adcode,
      source: "district"
    };
  }

  function openWeatherRegionPicker(trip, day, date, dayIndex, stays) {
    const stay = stays[0];
    const defaultArea = stay?.regionName || inferWeatherArea(stay, trip) || "行程目的地";
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
        <label class="field"><span>搜索区县或城市</span><input name="query" value="${escapeAttr(manualRegion?.name || defaultArea)}" placeholder="例如：鲤城区、思明区、京都" required></label>
        <button class="button button--primary" type="submit">搜索</button>
      </form>
      <div class="weather-results" id="weatherSearchResults"></div>
      <p class="weather-attribution">天气由 <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> 提供；中国区县中心点来自 DataV 行政区划数据，仅供旅行参考。</p>
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
          await loadDistrictData();
          const districtMatches = searchDistrictRecords(query, 12);
          let places = districtMatches.map((district) => ({
            name: district.district,
            displayName: district.label,
            latitude: district.latitude,
            longitude: district.longitude,
            adcode: district.adcode,
            source: "district"
          }));
          if (!places.length) {
            const params = new URLSearchParams({ name: query, count: "10", language: "zh", format: "json" });
            const response = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
            places = (response.results || []).map(normalizeGeocodeResult);
          }
          if (!places.length) {
            results.innerHTML = `<div class="weather-search-status">没有找到这个地区，试试完整的区县名称。</div>`;
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
                adcode: place.adcode || "",
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

  function searchDistrictRecords(query, limit = 10) {
    const normalized = normalizeRegionText(query);
    if (!normalized) return [];
    return districtRecords
      .map((district) => {
        const districtName = normalizeRegionText(district.district);
        const cityName = normalizeRegionText(district.city);
        const provinceName = normalizeRegionText(district.province);
        const label = normalizeRegionText(district.label);
        let score = 0;
        if (districtName === normalized) score = 100;
        else if (districtName.startsWith(normalized)) score = 80;
        else if (label.includes(normalized)) score = 60;
        else if (cityName === normalized) score = 50;
        else if (provinceName === normalized) score = 30;
        return { district, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.district.adcode.localeCompare(b.district.adcode))
      .slice(0, limit)
      .map((item) => item.district);
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
