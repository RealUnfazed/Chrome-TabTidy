importScripts("shared.js");

const ALARM_NAME = "tab-cleaner-sweep";

async function getSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  return { ...globalThis.TC.DEFAULT_SETTINGS, ...(settings || {}) };
}

async function getArchive() {
  const { archivedTabs } = await chrome.storage.local.get("archivedTabs");
  return Array.isArray(archivedTabs) ? archivedTabs : [];
}

async function ensureAlarm() {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 5, delayInMinutes: 1 });
  }
}

async function archiveTab(tab) {
  const archive = await getArchive();
  archive.unshift({
    archiveId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: tab.url,
    title: tab.title || tab.url,
    favIconUrl: tab.favIconUrl || "",
    closedAt: Date.now(),
  });
  await chrome.storage.local.set({
    archivedTabs: archive.slice(0, globalThis.TC.MAX_ARCHIVE_ENTRIES),
  });
}

async function setBadge(count) {
  if (count > 0) {
    await chrome.action.setBadgeBackgroundColor({ color: "#2F6E5C" });
    await chrome.action.setBadgeText({ text: String(count) });
  }
}

async function sweep() {
  const settings = await getSettings();
  if (!settings.enabled) return { swept: [], disabled: true };

  const thresholdMs = settings.thresholdHours * 3600 * 1000;
  const now = Date.now();
  const allTabs = await chrome.tabs.query({});
  const swept = [];

  for (const tab of allTabs) {
    if (tab.active) continue; // never sweep the tab currently in view
    if (settings.excludePinned && tab.pinned) continue;
    if (settings.excludeAudible && tab.audible) continue;
    if (globalThis.TC.isProtectedUrl(tab.url)) continue;
    if (globalThis.TC.matchesWhitelist(tab.url, settings.whitelist)) continue;

    const lastAccessed = typeof tab.lastAccessed === "number" ? tab.lastAccessed : now;
    if (now - lastAccessed < thresholdMs) continue;

    if (settings.mode === "archive") {
      await archiveTab(tab);
    }
    try {
      await chrome.tabs.remove(tab.id);
      swept.push({ id: tab.id, title: tab.title, url: tab.url });
    } catch {
      // tab may have already closed; ignore
    }
  }

  await setBadge(swept.length);
  return { swept, disabled: false };
}

async function restoreArchivedTab(archiveId) {
  const archive = await getArchive();
  const entry = archive.find((item) => item.archiveId === archiveId);
  if (!entry) return { ok: false };
  await chrome.tabs.create({ url: entry.url, active: true });
  await chrome.storage.local.set({
    archivedTabs: archive.filter((item) => item.archiveId !== archiveId),
  });
  return { ok: true };
}

async function deleteArchivedTab(archiveId) {
  const archive = await getArchive();
  await chrome.storage.local.set({
    archivedTabs: archive.filter((item) => item.archiveId !== archiveId),
  });
  return { ok: true };
}

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.local.get("settings");
  if (!settings) {
    await chrome.storage.local.set({ settings: globalThis.TC.DEFAULT_SETTINGS });
  }
  const { archivedTabs } = await chrome.storage.local.get("archivedTabs");
  if (!archivedTabs) {
    await chrome.storage.local.set({ archivedTabs: [] });
  }
  ensureAlarm();
});

chrome.runtime.onStartup.addListener(ensureAlarm);
ensureAlarm();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) sweep();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) return false;

  if (message.type === "sweepNow") {
    sweep().then(sendResponse);
    return true;
  }
  if (message.type === "restoreArchivedTab") {
    restoreArchivedTab(message.archiveId).then(sendResponse);
    return true;
  }
  if (message.type === "deleteArchivedTab") {
    deleteArchivedTab(message.archiveId).then(sendResponse);
    return true;
  }
  if (message.type === "clearArchive") {
    chrome.storage.local.set({ archivedTabs: [] }).then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});
