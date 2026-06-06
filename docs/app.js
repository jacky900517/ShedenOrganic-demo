let data = window.APP_DATA || null;
let currentUser = null;
let serviceWorkerReloading = false;
let accountUsers = [];
let accountUsersLoaded = false;
let storePages = [];
let baseStorePages = [];
let activeSalesRows = [];
let activeSalesPivot = [];
let activeSalesTotals = { salesQty: 0, discardQty: 0, endingStock: 0 };
const loadedSalesMonths = new Set();
const salesMonthPayloads = new Map();
const salesMonthPromises = new Map();
const loadedOpeningStockMonths = new Set();
const openingStockMonthPromises = new Map();
localStorage.removeItem("shipmentInputs");
const savedShipments = {};
const draftShipments = { ...savedShipments };
const savedStockAdjustments = {};
const draftStockAdjustments = {};
const inventoryRealtimeSync = {
  version: "",
  timer: null,
  inFlight: false,
  intervalMs: 5000,
};
let savedShipmentIndex = new Map();
let savedStockAdjustmentIndex = new Map();
const savedHarvestEntries = {};
const draftHarvestEntries = {};
const savedHarvestCellPriorities = {};
const draftHarvestCellPriorities = {};
const savedHarvestCellFormulas = {};
const draftHarvestCellFormulas = {};
const savedCityEntries = {};
const draftCityEntries = {};
const savedYfyEntries = {};
const draftYfyEntries = {};
const savedYfyShipmentTimes = {};
const draftYfyShipmentTimes = {};
const savedLooseVegetableEntries = {};
const draftLooseVegetableEntries = {};
const savedLooseVegetableColumnsByDate = {};
const draftLooseVegetableColumnsByDate = {};
let savedLooseVegetableColumns = [];
let draftLooseVegetableColumns = [];
const savedGeneralChannelEntries = {};
const draftGeneralChannelEntries = {};
const savedGeneralChannelPuqianEntries = {};
const draftGeneralChannelPuqianEntries = {};
const savedGeneralChannelColumnsByDate = {};
const draftGeneralChannelColumnsByDate = {};
let savedGeneralChannelColumns = [];
let draftGeneralChannelColumns = [];
let fieldNetHouseData = { zones: [] };
const savedFieldWorkRecords = {};
const savedFieldBtRecords = {};
const savedNetHouseStatusRecords = {};
const savedDailyVegetableManualEntries = {};
const storeNotes = {};
const storeRoutes = {};
const harvestMessagesByDate = {};
const harvestMessageLoadPromises = new Map();
const fieldWorkMessagesByDate = {};
const fieldWorkMessageLoadPromises = new Map();
const fieldWorkMessageAllKey = "__all__";
const harvestSubtotalRow = 41;
const harvestGrandTotalRow = "__grand_total__";
const harvestUnfinishedStockColumn = { col: 3, column: "C", label: "庫存" };
const whiteRadishProduct = { productCode: "985421", productName: "白蘿蔔" };
const whiteRadishHarvestRow = 47;
const harvestNoPackageColumn = { col: 500, column: "SF" };
const harvestQuantityField3FColumn = { col: 501, column: "SG", category: "有機", label: "3場F" };
const harvestUnfinishedField3FColumn = { col: 502, column: "SH", category: "有機", label: "3場F" };
const harvestPxReserveColumn = { col: 503, column: "SI", label: "全聯備貨" };
const harvestPxStockColumn = { col: 504, column: "SJ", label: "全聯庫存" };
const harvestFieldExtraColumnStart = 600;
const harvestField3FColumns = [harvestQuantityField3FColumn, harvestUnfinishedField3FColumn];
const harvestPxInventoryColumns = [harvestPxStockColumn, harvestPxReserveColumn];
const harvestQuantityBaseFieldColumns = [4, 5, harvestQuantityField3FColumn.col, 6, 7];
const harvestUnfinishedBaseFieldColumns = [9, 10, harvestUnfinishedField3FColumn.col, 11, 12];
const harvestCrewCategories = ["有機", "轉型"];
const defaultHarvestCrewColumns = [
  { name: "王正堯", category: "有機", col: 14, column: "N", source: "default" },
  { name: "李日貴", category: "有機", col: 15, column: "O", source: "default" },
  { name: "余育鴻", category: "有機", col: 16, column: "P", source: "default" },
];
const defaultHarvestCrewOptions = harvestCrewCategories.flatMap((category) =>
  defaultHarvestCrewColumns.map((column) => ({ ...column, category, col: null, column: "", source: "default" })),
);
const harvestPackageCalculatorRows = [
  { key: "mostly", label: "大部分", packLabel: "250g", precoolFactor: 3.8 * 0.96, noPrecoolFromPrecool: true },
  { key: "leafy220", label: "奶白、山茼蒿、菠菜、萵苣類", packLabel: "220g", precoolFactor: 4.3 * 0.96, noPrecoolFromPrecool: true },
  { key: "crownDaisy", label: "只有茼蒿", packLabel: "180g", precoolFactor: 5.4 * 0.96, noPrecoolFromPrecool: true },
  { key: "kaleSesame", label: "羽衣、芝麻", packLabel: "160g", precoolFactor: 5.8 * 0.96, noPrecoolFromPrecool: true },
  { key: "basil", label: "九層塔", packLabel: "40g", noPrecoolFactor: 22 },
  { key: "cilantro", label: "香菜", packLabel: "35g", precoolFactor: 25 * 0.96, noPrecoolFromPrecool: true },
];
const harvestConversionPackageKeys = harvestPackageCalculatorRows.map((row) => row.key);
const harvestPriorityLevels = [1, 2, 3, 4, 5, 6, 7];
const harvestPriorityColors = {
  1: "#ffffcc",
  2: "#ccffff",
  3: "#ffcc66",
  4: "#ddddff",
  5: "#c6efce",
  6: "#97e4ff",
  7: "#ffbdff",
};
const harvestLargeLabelColors = {
  otherFarmHeader: "#ccff99",
  oneTwoHeader: "#ffffcc",
  threeHeader: "#e7f4dc",
  fourHeader: "#fdd9ad",
  fiveHeader: "#ddddff",
  threeFHeader: "#ffffcc",
  printDay: "#ffffcc",
};
const harvestPriorityOrderLabelStyles = {
  oneTwo: { backgroundColor: "#a7e2ff", color: "#18201b" },
  threeF: { backgroundColor: "#a7e2ff", color: "#18201b" },
  three: { backgroundColor: "#c6efce", color: "#18201b" },
  four: { backgroundColor: "#a5a5a5", color: "#ffffff" },
  five: { backgroundColor: "#ecd5e9", color: "#18201b" },
  otherFarm: { backgroundColor: "#ffffaf", color: "#18201b" },
};
let allProducts = [];
let visibleProductCodes = null;
let visibleProductCodesByDate = {};
let allHarvestProducts = [];
let visibleHarvestProductKeys = null;
let visibleHarvestProductKeysByDate = {};
let visibleDailyVegetableProductKeys = null;
let inventoryStoreSwitchInFlight = false;
let harvestCrewColumnsByDate = {};
let legacyHarvestCrewColumns = null;
let harvestCrewPickerOpen = false;
let harvestFieldExtraPickerOpen = "";
let harvestFieldExtraColumnsByDate = {};
const harvestUnfinishedSelectedRows = new Set();
const fieldNumericKeypadState = {
  input: null,
  mode: "decimal",
  initialValue: "",
};
const defaultHarvestField3FExpanded = {
  unfinished: true,
  quantity: true,
};
let harvestField3FExpandedByDate = {};
let harvestPackageCalculatorInputs = {};
let harvestConversionSettings = { hasPrecoolByDate: {}, packagedChannelsByDate: {}, productPackages: {} };
let harvestPriorityMenuCell = null;
let shipmentManifestSelections = {};
const manifestSelectionStorageKey = "shipmentManifestSelections";
let draggedManifestStoreKey = "";
let persistManifestSelectionTimer = 0;
const channelPages = {
  GREENandSAFE: "永豐餘",
  city: "City",
  generalChannel: "一般通路",
  looseVegetable: "裸菜",
};
const harvestPackagingChannels = [
  { key: "yfy", label: "永豐餘" },
  { key: "city", label: "City" },
  { key: "generalChannel", label: "一般通路" },
];
const harvestPackagingChannelKeys = harvestPackagingChannels.map((channel) => channel.key);
const harvestPackagingAllocationChannelKeys = ["city", "generalChannel", "yfy"];
const recordPages = {
  fieldWorkRecords: "田間工作紀錄",
  fieldWorkMessageBoard: "田間留言板",
  fieldBtRecords: "蘇力菌",
  netHouseStatusRecords: "網室狀態紀錄",
  dailyVegetableAvailability: "每日菜量表",
  harvestPickList: "採菜單",
};
const roleLabels = {
  root: "管理員",
  inside: "內場",
  field: "外場",
};
const pageRoleAccess = {
  home: ["root", "inside", "field"],
  inventory: ["root", "inside"],
  shipmentManifest: ["root", "inside"],
  harvestPlanning: ["root", "inside"],
  GREENandSAFE: ["root", "inside"],
  city: ["root", "inside"],
  generalChannel: ["root", "inside"],
  looseVegetable: ["root", "inside"],
  fieldWorkRecords: ["root", "field"],
  fieldWorkMessageBoard: ["root", "field"],
  fieldBtRecords: ["root", "field"],
  netHouseStatusRecords: ["root"],
  dailyVegetableAvailability: ["root"],
  harvestPickList: ["root"],
  accountUsers: ["root"],
};
const homeSectionRoleAccess = {
  harvest: ["root", "inside"],
  field: ["root", "field"],
  netHouse: ["root"],
  px: ["root", "inside"],
  channels: ["root", "inside"],
  accountAdmin: ["root"],
};
const fieldWorkMessageReturnPages = ["fieldWorkRecords", "netHouseStatusRecords"];
const netHouseStatusOptions = ["空園", "苗室", "種植"];
const dailyVegetableHorizonDays = 14;
const harvestPickListFieldLabels = ["一場", "二場", "三場", "四場", "五場"];
const dailyVegetableCropAliases = {
  京都水菜: "京水菜",
  味美: "味美菜",
  空心菜: "空心",
  紅莧菜: "紅莧",
  白花椰菜: "白花菜",
  恐龍羽衣: "羽衣",
  捲葉羽衣: "羽衣",
};
const fieldWorkVietnameseCropPronunciations = {
  皺葉白: "xiǎo bai",
  荷葉白: "hơ bai",
  黑葉白: "hây bai",
  青江菜: "chinh cheng",
  甜菜心: "thiên chai xim",
  小松菜: "xiǎo xông",
  廣島菜: "quảng đảo",
  小芥菜: "xiǎo chia",
  芥藍菜: "chia làn",
  塔菇菜: "tha cu",
  雪菜: "xài chai",
  京水菜: "sủy chai",
  奶白: "nai bai",
  青松菜: "chinh xông",
  味美菜: "wê mây",
  空心: "không xin",
  紅莧: "hông xiên",
  白莧: "bai xiên",
  皇宮菜: "hoàng cung",
  地瓜葉: "ti qua yê",
  山菠菜: "san bô",
  菠菜: "bô chai",
  蘿蔓: "lố man",
  福山: "phú san",
  A菜: "a chai",
  山茼蒿: "san thống hao",
  菊苣: "chúy chư",
  茼蒿: "thống hao",
  九層塔: "chiêu tầng ta",
  羽衣: "dúy y",
  芝麻: "trư ma",
  香菜: "xeng chai",
  高麗菜: "cao li chai",
  包心白: "bao xim bai",
  青花菜: "chinh hoa",
  白花菜: "bai hoa",
  白蘿蔔: "bai luo bô",
  青蒜: "chinh xoam",
  青蔥: "chinh chông",
};
const dailyVegetableWeekdayLabels = ["日", "一", "二", "三", "四", "五", "六"];
const fieldWorkTaskOptions = [
  { key: "soilPreparationTractorClean", labelKey: "fieldWork.task.soilPreparationTractorClean" },
  { key: "burn", labelKey: "fieldWork.task.burn" },
  { key: "weed", labelKey: "fieldWork.task.weed" },
  { key: "directSow", labelKey: "fieldWork.task.directSow" },
  { key: "seedlingTransplant", labelKey: "fieldWork.task.seedlingTransplant" },
  { key: "bacillusThuringiensis", labelKey: "fieldWork.task.bacillusThuringiensis" },
];
const fieldBtAreaOptions = [
  { key: "oneTwo", label: "1、2場" },
  { key: "three", label: "3場" },
  { key: "five", label: "3F、5場" },
  { key: "four", label: "4場" },
];
const fieldBtAreaZoneNames = {
  oneTwo: ["一場", "二場"],
  three: ["三場"],
  five: ["三場F", "五場"],
  threeFive: ["三場", "三場F", "五場"],
  four: ["四場"],
};
const yfyPageKey = "GREENandSAFE";
const yfyInputColumns = [
  { key: "greenSafe", label: "永豐餘" },
  { key: "greenSafeBaibao", labelLines: ["永豐餘", "百寶"] },
];
const harvestInventoryTotalHeaderHtml = "庫存總數<br />(包)";
const looseVegetableRemainingInventoryHeaderHtml = "剩餘庫存<br />(包)";
const cityInputColumns = [
  { key: "stock", label: "庫存" },
  { key: "farEastern", label: "遠企 city" },
  { key: "tianmu", label: "天母 city" },
  { key: "fuxing", label: "復興 city" },
  { key: "banqiao", label: "板橋 city" },
  { key: "zhubei", label: "竹北 city" },
  { key: "hsinchu", label: "新竹 city" },
  { key: "reserve", label: "備貨 city" },
];
const cityChannelColumns = cityInputColumns.filter((column) => column.key !== "stock");
const generalChannelPuqianColumns = [
  { key: "zhongshan01", label: "01 中山" },
  { key: "tucheng02", label: "02 土城" },
  { key: "zhongping06", label: "06 中平" },
  { key: "minan07", label: "07 民安" },
];
const generalChannelPuqianTotalSource = "puqianTotal";
const generalChannelColumnPresets = [
  { label: "興國" },
  { label: "板農" },
  { label: "日燦" },
  { label: "竹北農會" },
  { label: "蔬果鋪子" },
  { label: "巷青" },
  { label: "大自然" },
  { label: "桃區農" },
  { label: "埔墘統倉", source: generalChannelPuqianTotalSource },
];
const harvestViewLabels = {
  planningTable: "採收規劃表",
  messageBoard: "留言板",
  largeLabelPrint: "大標",
  priorityOrder: "排順序",
};
const defaultHarvestView = "planningTable";

function todayDate() {
  return isoDate(new Date());
}

const state = {
  language: "zh-Hant",
  page: "home",
  view: "salesPage",
  search: "",
  storeSearch: "",
  group: "",
  threshold: 3,
  target: 8,
  selectedStoreKey: storePages[0]?.key || "",
  shipmentDate: todayDate(),
  fieldWorkDate: todayDate(),
  fieldBtDate: todayDate(),
  netHouseStatusDate: todayDate(),
  dailyVegetableDate: todayDate(),
  harvestPickListDate: todayDate(),
  fieldWorkZoneName: "",
  fieldWorkNetHouseCode: "",
  netHouseStatusZoneName: "",
  netHouseStatusNetHouseCode: "",
  fieldWorkMessageReturnPage: "",
  manifestStorePickerGroup: "A",
  harvestView: defaultHarvestView,
  harvestConversionSettingsOpen: false,
  dailyVegetableSettingsOpen: false,
  dailyVegetableManualFormOpen: false,
  dailyVegetableManualEditingId: "",
};
let lastNetHouseStatusNavTouchAt = 0;

const initialHashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
const initialStoreFromHash = initialHashParams.get("store");
const initialPageFromHash = initialHashParams.get("page");
const initialHarvestViewFromHash = initialHashParams.get("harvestView");
const initialFieldWorkMessageReturnPageFromHash = initialHashParams.get("fieldWorkMessageReturnPage");
const initialFieldWorkMessageDateFromHash = initialHashParams.get("fieldWorkMessageDate");
const initialFieldWorkMessageZoneNameFromHash = initialHashParams.get("fieldWorkMessageZoneName");
const initialFieldWorkMessageNetHouseCodeFromHash = initialHashParams.get("fieldWorkMessageNetHouseCode");

const format = new Intl.NumberFormat("zh-Hant-TW", { maximumFractionDigits: 1 });
const tableInputNavigationSelector = [
  "input.shipment-input",
  "input.stock-adjustment-input",
  "input.manifest-box-input",
  "input.harvest-input",
  "input.city-table-input",
  "input.yfy-table-input",
  "input.loose-vegetable-table-input",
  "input.general-channel-table-input",
  "input.general-channel-puqian-input",
].join(",");
const tableInputArrowDirections = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

function byId(id) {
  return document.getElementById(id);
}

function reloadForAppUpdate() {
  if (serviceWorkerReloading) return;
  if (typeof hasUnsavedPageInputs === "function" && hasUnsavedPageInputs()) {
    if (!confirm(t("app.updateReloadConfirm"))) return;
  }
  serviceWorkerReloading = true;
  window.location.reload();
}

function suppressAppInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) {
      hadController = true;
      return;
    }
    reloadForAppUpdate();
  });
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "APP_VERSION_ACTIVATED") {
      if (!hadController) {
        hadController = true;
        return;
      }
      reloadForAppUpdate();
    }
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { scope: "./", updateViaCache: "none" })
      .then((registration) => {
        const checkForUpdate = () => registration.update().catch((error) => {
          console.warn("Service worker update check failed.", error);
        });
        checkForUpdate();
        window.setInterval(checkForUpdate, 60 * 1000);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") checkForUpdate();
        });
      })
      .catch((error) => {
        console.warn("Service worker registration failed.", error);
      });
  });
}

function currentRole() {
  return currentUser?.role || "";
}

function currentRoleLabel() {
  return roleLabels[currentRole()] || currentRole();
}

function canUsePage(page) {
  const roles = pageRoleAccess[page] || [];
  return Boolean(currentUser && roles.includes(currentRole()));
}

function canUseHomeSection(section) {
  const roles = homeSectionRoleAccess[section] || [];
  return Boolean(currentUser && roles.includes(currentRole()));
}

function shouldLoadSalesData() {
  return canUsePage("inventory") || canUsePage("shipmentManifest") || canUsePage("harvestPlanning");
}

function normalizeCurrentUser(user) {
  if (!user || typeof user !== "object") return null;
  const role = String(user.role || "");
  if (!roleLabels[role]) return null;
  return {
    id: Number(user.id) || 0,
    username: String(user.username || ""),
    displayName: String(user.displayName || user.username || ""),
    role,
    roleLabel: roleLabels[role],
  };
}

const languageStorageKey = "appLanguage";
const defaultLanguage = "zh-Hant";
const supportedLanguages = new Set([defaultLanguage, "vi"]);

function loadAppLanguage() {
  try {
    const saved = localStorage.getItem(languageStorageKey);
    return supportedLanguages.has(saved) ? saved : defaultLanguage;
  } catch {
    return defaultLanguage;
  }
}

let activeLanguage = loadAppLanguage();
state.language = activeLanguage;

const translations = {
  "zh-Hant": {
    "app.title": "庫存管理系統",
    "language.label": "語言",
    "login.username": "帳號",
    "login.password": "密碼",
    "login.submit": "登入",
    "login.loading": "登入中...",
    "login.failed": "登入失敗",
    "login.invalid": "帳號或密碼錯誤",
    "app.updateReloadConfirm": "系統已有新版本。重新載入會套用更新，但尚未儲存的內容可能會遺失。要現在重新載入嗎？",
    "home": "首頁",
    "logout": "登出",
    "home.currentUser": "目前登入：{name}",
    "home.field.kicker": "田間",
    "home.field.title": "田間工作紀錄",
    "home.netHouse.kicker": "網室",
    "home.netHouse.title": "網室狀態紀錄",
    "page.fieldWorkRecords": "田間工作紀錄",
    "page.fieldWorkMessageBoard": "田間留言板",
    "page.fieldBtRecords": "蘇力菌",
    "page.netHouseStatusRecords": "網室狀態紀錄",
    "page.netHouseStatusShort": "網室狀態",
    "page.dailyVegetableAvailability": "每日菜量表",
    "page.harvestPickList": "採菜單",
    "nav.fieldWorkRecords": "工作紀錄",
    "nav.dailyVegetableAvailability": "菜量表",
    "nav.harvestPickList": "採菜單",
    "dailyVegetable.manualAdd": "新增手動菜量",
    "dailyVegetable.manualEdit": "編輯",
    "dailyVegetable.manualDelete": "刪除",
    "dailyVegetable.manualCancel": "取消",
    "dailyVegetable.manualSave": "保存",
    "dailyVegetable.manualUpdate": "更新",
    "dailyVegetable.manualDate": "採收日期",
    "dailyVegetable.manualCrop": "作物",
    "dailyVegetable.manualSource": "網室編號/來源",
    "dailyVegetable.manualQuantity": "採收量",
    "dailyVegetable.manualListTitle": "手動菜量",
    "dailyVegetable.manualEmpty": "目前沒有手動菜量",
    "dailyVegetable.manualClose": "關閉",
    "dailyVegetable.manualDateRequired": "請選擇採收日期。",
    "dailyVegetable.manualCropRequired": "請填寫作物。",
    "dailyVegetable.manualSourceRequired": "請填寫網室編號或來源。",
    "dailyVegetable.manualQuantityRequired": "請填寫採收量。",
    "dailyVegetable.manualQuantityInvalid": "採收量必須是 0 以上數字。",
    "dailyVegetable.manualSaveError": "手動菜量保存失敗",
    "dailyVegetable.manualDeleteError": "手動菜量刪除失敗",
    "dailyVegetable.manualDeleteConfirm": "確定要刪除這筆手動菜量？",
    "export.thisMonth": "匯出本月",
    "fieldWork.date": "日期",
    "fieldWork.zone": "場區",
    "fieldWork.netHouse": "網室",
    "fieldWork.accountName": "填寫帳號",
    "fieldWork.crop": "作物",
    "fieldWork.chooseCrop": "選擇作物",
    "fieldWork.trayCount": "盤數",
    "fieldWork.seedlingTrayCount": "苗移植盤數",
    "fieldWork.addSeedlingCrop": "增加苗移植作物",
    "fieldWork.removeSeedlingCrop": "移除苗移植作物",
    "fieldWork.seedlingCropRequired": "勾選苗移植後，請選擇作物。",
    "fieldWork.seedlingTrayRequired": "勾選苗移植後，請填寫盤數。",
    "fieldWork.seedlingTrayIntegerRequired": "苗移植盤數必須是 0 以上整數。",
    "fieldWork.fertilizerRequired": "勾選翻土整地,曳引機清潔後，請填寫肥料使用包數。",
    "fieldWork.fertilizerBags": "肥料使用包數",
    "fieldWork.task.soilPreparationTractorClean": "翻土整地,曳引機清潔",
    "fieldWork.task.burn": "燒",
    "fieldWork.task.weed": "除草",
    "fieldWork.task.directSow": "直播",
    "fieldWork.task.seedlingTransplant": "苗移植",
    "fieldWork.task.bacillusThuringiensis": "病蟲害防治",
    "fieldWork.saveError": "工作紀錄保存失敗",
    "fieldWork.validDateRequired": "請先選擇有效日期。",
    "fieldWork.exportError": "匯出 Excel 失敗",
    "fieldWork.exportFilename": "田間工作紀錄",
    "fieldWork.unselectedMonth": "未選擇月份",
    "fieldWork.messageBoard": "留言板",
    "fieldWork.addMessage": "新增留言",
    "fieldWork.messagePlaceholder": "輸入田間工作留言",
    "fieldWork.photo": "照片",
    "fieldWork.photoAlt": "留言照片 {count}",
    "fieldWork.messagesLoading": "留言載入中...",
    "fieldWork.noMessages": "目前沒有留言",
    "fieldWork.delete": "刪除",
    "fieldWork.deleteConfirm": "刪除這則留言？",
    "fieldWork.deleteMessageError": "留言刪除失敗",
    "fieldWork.saveMessageError": "留言保存失敗",
    "fieldWork.loadMessageError": "留言載入失敗",
    "fieldWork.selectedPhotos": "已選擇 {count} 張照片",
    "fieldWork.messagePageReturnDefault": "回到剛剛頁面",
    "fieldWork.messagePageReturnNetHouse": "回到網室狀態",
    "fieldWork.chooseNetHouse": "請先選擇網室",
    "fieldWork.missingDate": "缺少日期",
    "fieldWork.chooseZoneAndNetHouse": "請先選擇場區與網室",
    "fieldWork.messageOrPhotoRequired": "請輸入留言或選擇照片",
    "fieldWork.photoLimit": "照片最多 6 張",
    "fieldWork.photoFileOnly": "只支援照片檔案",
    "fieldWork.photoSizeLimit": "單張照片最多 8MB",
    "numericKeypad.label": "數字鍵盤",
    "numericKeypad.clear": "清除",
    "numericKeypad.backspace": "刪除",
    "numericKeypad.done": "完成",
    "fieldBt.area.oneTwo": "1、2場",
    "fieldBt.area.three": "3場",
    "fieldBt.area.five": "3F、5場",
    "fieldBt.area.four": "4場",
    "fieldBt.packageCount": "使用包數",
    "fieldBt.packagePlaceholder": "使用包數",
    "fieldBt.saveError": "蘇力菌紀錄保存失敗",
    "fieldBt.exportFilename": "蘇力菌統計",
    "netHouseStatus.plantingActive": "種植中",
    "netHouseStatus.status": "狀態",
    "netHouseStatus.status.empty": "空園",
    "netHouseStatus.status.seedling": "苗室",
    "netHouseStatus.status.planting": "種植",
    "netHouseStatus.cropName": "作物名稱",
    "netHouseStatus.plantedDate": "種植日期",
    "netHouseStatus.harvestDate": "採收日期",
    "netHouseStatus.days": "天數",
    "netHouseStatus.estimatedQuantity": "預估量",
    "netHouseStatus.harvestQuantity": "採收量",
    "netHouseStatus.destroyCrop": "打掉",
    "netHouseStatus.extendHarvest": "延期",
    "netHouseStatus.removeHarvest": "移除",
    "netHouseStatus.lunch": "午餐",
    "netHouseStatus.previousNetHouse": "上一個網室",
    "netHouseStatus.nextNetHouse": "下一個網室",
    "netHouseStatus.saveError": "網室狀態保存失敗",
    "netHouseStatus.lunchSaveError": "午餐標記保存失敗",
    "netHouseStatus.harvestBeforePlantingError": "採收日期不可早於種植日期，可與種植日期同一天。",
    "netHouseStatus.daysInvalid": "天數請輸入 0 以上的整數。",
  },
  vi: {
    "app.title": "Hệ thống quản lý kho",
    "language.label": "Ngôn ngữ",
    "login.username": "Tài khoản",
    "login.password": "Mật khẩu",
    "login.submit": "Đăng nhập",
    "login.loading": "Đang đăng nhập...",
    "login.failed": "Đăng nhập thất bại",
    "login.invalid": "Tài khoản hoặc mật khẩu không đúng",
    "app.updateReloadConfirm": "Đã có phiên bản mới. Tải lại sẽ áp dụng cập nhật, nhưng nội dung chưa lưu có thể bị mất. Tải lại bây giờ?",
    "home": "Trang chủ",
    "logout": "Đăng xuất",
    "home.currentUser": "Đang đăng nhập: {name}",
    "home.field.kicker": "Đồng ruộng",
    "home.field.title": "Nhật ký công việc đồng ruộng",
    "home.netHouse.kicker": "Nhà lưới",
    "home.netHouse.title": "Nhật ký trạng thái nhà lưới",
    "page.fieldWorkRecords": "Nhật ký công việc đồng ruộng",
    "page.fieldWorkMessageBoard": "Bảng ghi chú đồng ruộng",
    "page.fieldBtRecords": "Bacillus thuringiensis",
    "page.netHouseStatusRecords": "Nhật ký trạng thái nhà lưới",
    "page.netHouseStatusShort": "Nhà lưới",
    "page.dailyVegetableAvailability": "Rau hằng ngày",
    "page.harvestPickList": "Danh sách hái",
    "nav.fieldWorkRecords": "Công việc",
    "nav.dailyVegetableAvailability": "Rau",
    "nav.harvestPickList": "Hái rau",
    "dailyVegetable.manualAdd": "Thêm sản lượng thủ công",
    "dailyVegetable.manualEdit": "Sửa",
    "dailyVegetable.manualDelete": "Xóa",
    "dailyVegetable.manualCancel": "Hủy",
    "dailyVegetable.manualSave": "Lưu",
    "dailyVegetable.manualUpdate": "Cập nhật",
    "dailyVegetable.manualDate": "Ngày thu hoạch",
    "dailyVegetable.manualCrop": "Cây trồng",
    "dailyVegetable.manualSource": "Mã nhà lưới/nguồn",
    "dailyVegetable.manualQuantity": "Sản lượng thu hoạch",
    "dailyVegetable.manualListTitle": "Sản lượng thủ công",
    "dailyVegetable.manualEmpty": "Hiện chưa có sản lượng thủ công",
    "dailyVegetable.manualClose": "Đóng",
    "dailyVegetable.manualDateRequired": "Vui lòng chọn ngày thu hoạch.",
    "dailyVegetable.manualCropRequired": "Vui lòng nhập cây trồng.",
    "dailyVegetable.manualSourceRequired": "Vui lòng nhập mã nhà lưới hoặc nguồn.",
    "dailyVegetable.manualQuantityRequired": "Vui lòng nhập sản lượng thu hoạch.",
    "dailyVegetable.manualQuantityInvalid": "Sản lượng thu hoạch phải là số từ 0 trở lên.",
    "dailyVegetable.manualSaveError": "Lưu sản lượng thủ công thất bại",
    "dailyVegetable.manualDeleteError": "Xóa sản lượng thủ công thất bại",
    "dailyVegetable.manualDeleteConfirm": "Bạn có chắc muốn xóa sản lượng thủ công này không?",
    "export.thisMonth": "Xuất tháng này",
    "fieldWork.date": "Ngày",
    "fieldWork.zone": "Khu vực",
    "fieldWork.netHouse": "Nhà lưới",
    "fieldWork.accountName": "Tài khoản ghi",
    "fieldWork.crop": "Cây trồng",
    "fieldWork.chooseCrop": "Chọn cây trồng",
    "fieldWork.trayCount": "Số khay",
    "fieldWork.seedlingTrayCount": "Số khay cấy cây con",
    "fieldWork.addSeedlingCrop": "Thêm cây trồng cấy cây con",
    "fieldWork.removeSeedlingCrop": "Xóa cây trồng cấy cây con",
    "fieldWork.seedlingCropRequired": "Sau khi chọn cấy cây con, vui lòng chọn cây trồng.",
    "fieldWork.seedlingTrayRequired": "Sau khi chọn cấy cây con, vui lòng nhập số khay.",
    "fieldWork.seedlingTrayIntegerRequired": "Số khay cấy cây con phải là số nguyên từ 0 trở lên.",
    "fieldWork.fertilizerRequired": "Sau khi chọn xới đất, làm đất, vệ sinh máy kéo, vui lòng nhập số bao phân bón đã dùng.",
    "fieldWork.fertilizerBags": "Số bao phân bón đã dùng",
    "fieldWork.task.soilPreparationTractorClean": "Xới đất, làm đất, vệ sinh máy kéo",
    "fieldWork.task.burn": "Đốt",
    "fieldWork.task.weed": "Làm cỏ",
    "fieldWork.task.directSow": "Máy gieo hạt",
    "fieldWork.task.seedlingTransplant": "Cấy cây con",
    "fieldWork.task.bacillusThuringiensis": "Phòng trừ sâu bệnh",
    "fieldWork.saveError": "Lưu nhật ký công việc thất bại",
    "fieldWork.validDateRequired": "Vui lòng chọn ngày hợp lệ trước.",
    "fieldWork.exportError": "Xuất Excel thất bại",
    "fieldWork.exportFilename": "Nhật ký công việc đồng ruộng",
    "fieldWork.unselectedMonth": "Chưa chọn tháng",
    "fieldWork.messageBoard": "Bảng ghi chú",
    "fieldWork.addMessage": "Thêm ghi chú",
    "fieldWork.messagePlaceholder": "Nhập ghi chú công việc đồng ruộng",
    "fieldWork.photo": "Ảnh",
    "fieldWork.photoAlt": "Ảnh ghi chú {count}",
    "fieldWork.messagesLoading": "Đang tải ghi chú...",
    "fieldWork.noMessages": "Hiện chưa có ghi chú",
    "fieldWork.delete": "Xóa",
    "fieldWork.deleteConfirm": "Xóa ghi chú này?",
    "fieldWork.deleteMessageError": "Xóa ghi chú thất bại",
    "fieldWork.saveMessageError": "Lưu ghi chú thất bại",
    "fieldWork.loadMessageError": "Tải ghi chú thất bại",
    "fieldWork.selectedPhotos": "Đã chọn {count} ảnh",
    "fieldWork.messagePageReturnDefault": "Quay lại trang trước",
    "fieldWork.messagePageReturnNetHouse": "Quay lại trạng thái nhà lưới",
    "fieldWork.chooseNetHouse": "Vui lòng chọn nhà lưới trước",
    "fieldWork.missingDate": "Thiếu ngày",
    "fieldWork.chooseZoneAndNetHouse": "Vui lòng chọn khu vực và nhà lưới trước",
    "fieldWork.messageOrPhotoRequired": "Vui lòng nhập ghi chú hoặc chọn ảnh",
    "fieldWork.photoLimit": "Tối đa 6 ảnh",
    "fieldWork.photoFileOnly": "Chỉ hỗ trợ tệp ảnh",
    "fieldWork.photoSizeLimit": "Mỗi ảnh tối đa 8MB",
    "numericKeypad.label": "Bàn phím số",
    "numericKeypad.clear": "Xóa",
    "numericKeypad.backspace": "Xóa lùi",
    "numericKeypad.done": "Xong",
    "fieldBt.area.oneTwo": "Khu 1, 2",
    "fieldBt.area.three": "Khu 3",
    "fieldBt.area.five": "Khu 3F, 5",
    "fieldBt.area.four": "Khu 4",
    "fieldBt.packageCount": "Số gói đã dùng",
    "fieldBt.packagePlaceholder": "Số gói đã dùng",
    "fieldBt.saveError": "Lưu ghi chép Bacillus thuringiensis thất bại",
    "fieldBt.exportFilename": "Thống kê Bacillus thuringiensis",
    "netHouseStatus.plantingActive": "Đang trồng",
    "netHouseStatus.status": "Trạng thái",
    "netHouseStatus.status.empty": "Nhà trống",
    "netHouseStatus.status.seedling": "Nhà ươm",
    "netHouseStatus.status.planting": "Trồng",
    "netHouseStatus.cropName": "Tên cây trồng",
    "netHouseStatus.plantedDate": "Ngày trồng",
    "netHouseStatus.harvestDate": "Ngày thu hoạch",
    "netHouseStatus.days": "Số ngày",
    "netHouseStatus.estimatedQuantity": "Sản lượng ước tính",
    "netHouseStatus.harvestQuantity": "Sản lượng thu hoạch",
    "netHouseStatus.destroyCrop": "Hủy cây",
    "netHouseStatus.extendHarvest": "Dời ngày",
    "netHouseStatus.removeHarvest": "Xóa",
    "netHouseStatus.lunch": "Bữa trưa",
    "netHouseStatus.previousNetHouse": "Nhà lưới trước",
    "netHouseStatus.nextNetHouse": "Nhà lưới kế tiếp",
    "netHouseStatus.saveError": "Lưu trạng thái nhà lưới thất bại",
    "netHouseStatus.lunchSaveError": "Lưu đánh dấu bữa trưa thất bại",
    "netHouseStatus.harvestBeforePlantingError": "Ngày thu hoạch không được sớm hơn ngày trồng; có thể cùng ngày.",
    "netHouseStatus.daysInvalid": "Vui lòng nhập số ngày là số nguyên từ 0 trở lên.",
  },
};

function t(key, params = {}) {
  const text = translations[activeLanguage]?.[key] ?? translations[defaultLanguage][key] ?? key;
  return Object.entries(params).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    text,
  );
}

function netHouseStatusOptionLabel(status) {
  const labelKeys = {
    空園: "netHouseStatus.status.empty",
    苗室: "netHouseStatus.status.seedling",
    種植: "netHouseStatus.status.planting",
  };
  return labelKeys[status] ? t(labelKeys[status]) : status;
}

function fieldNumericInputAttributes(mode = "decimal") {
  const normalizedMode = mode === "integer" ? "integer" : "decimal";
  const nativeInputMode = normalizedMode === "integer" ? "numeric" : "decimal";
  return `inputmode="${nativeInputMode}" data-field-numeric-keypad="${normalizedMode}" autocomplete="off" enterkeyhint="done"`;
}

function fieldNumericKeypadInputMode(input) {
  return input?.dataset?.fieldNumericKeypad === "integer" ? "integer" : "decimal";
}

function fieldNumericNativeInputMode(input) {
  return fieldNumericKeypadInputMode(input) === "integer" ? "numeric" : "decimal";
}

function isIpadMiniLikeViewport() {
  const query = [
    "(min-width: 700px) and (max-width: 780px) and (min-height: 1000px) and (max-height: 1180px)",
    "(min-width: 1000px) and (max-width: 1180px) and (min-height: 700px) and (max-height: 780px)",
  ].join(", ");
  return window.matchMedia?.(query).matches ?? false;
}

function shouldUseFieldNumericKeypad() {
  const maxTouchPoints = globalThis.navigator?.maxTouchPoints || 0;
  const hasTouch = maxTouchPoints > 1 || "ontouchstart" in window;
  return hasTouch && isIpadMiniLikeViewport();
}

function syncFieldNumericInputMode(input) {
  if (!input) return;
  const useCustomKeypad = shouldUseFieldNumericKeypad();
  input.readOnly = useCustomKeypad;
  input.setAttribute("inputmode", useCustomKeypad ? "none" : fieldNumericNativeInputMode(input));
}

function syncFieldNumericKeypadControls(container = document) {
  container.querySelectorAll("[data-field-numeric-keypad]").forEach(syncFieldNumericInputMode);
  if (fieldNumericKeypadState.input && !shouldUseFieldNumericKeypad()) closeFieldNumericKeypad();
}

function normalizeFieldNumericKeypadValue(value, mode = "decimal", { commit = false } = {}) {
  if (mode === "integer") return String(value ?? "").replace(/\D/g, "");
  let text = String(value ?? "").replace(/[，,]/g, ".").replace(/[^\d.]/g, "");
  const dotIndex = text.indexOf(".");
  if (dotIndex >= 0) {
    text = `${text.slice(0, dotIndex + 1)}${text.slice(dotIndex + 1).replace(/\./g, "")}`;
  }
  if (text.startsWith(".")) text = `0${text}`;
  if (commit) text = text.replace(/\.$/, "");
  return text;
}

function ensureFieldNumericKeypad() {
  let keypad = byId("fieldNumericKeypad");
  if (!keypad) {
    keypad = document.createElement("div");
    keypad.id = "fieldNumericKeypad";
    keypad.className = "field-numeric-keypad";
    keypad.hidden = true;
    keypad.setAttribute("aria-hidden", "true");
    document.body.append(keypad);
    keypad.addEventListener("pointerdown", (event) => {
      event.preventDefault();
    });
    keypad.addEventListener("click", handleFieldNumericKeypadClick);
  }
  return keypad;
}

function renderFieldNumericKeypad(mode = "decimal") {
  const keypad = ensureFieldNumericKeypad();
  const decimalDisabled = mode === "integer";
  const button = ({ label, className = "", attributes = "" }) => (
    `<button class="field-numeric-keypad-button${className ? ` ${className}` : ""}" type="button" ${attributes}>${escapeHtml(label)}</button>`
  );
  keypad.innerHTML = `<div class="field-numeric-keypad-panel" role="group" aria-label="${escapeAttribute(t("numericKeypad.label"))}">
    <div class="field-numeric-keypad-grid">
      ${["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => button({ label: digit, attributes: `data-field-numeric-key="${digit}"` })).join("")}
      ${button({ label: ".", className: "field-numeric-keypad-decimal", attributes: `data-field-numeric-key="." ${decimalDisabled ? "disabled" : ""}` })}
      ${button({ label: "0", attributes: `data-field-numeric-key="0"` })}
      ${button({ label: "⌫", className: "field-numeric-keypad-action", attributes: `data-field-numeric-action="backspace" aria-label="${escapeAttribute(t("numericKeypad.backspace"))}"` })}
      ${button({ label: t("numericKeypad.clear"), className: "field-numeric-keypad-action", attributes: `data-field-numeric-action="clear"` })}
      ${button({ label: t("numericKeypad.done"), className: "field-numeric-keypad-done", attributes: `data-field-numeric-action="done"` })}
    </div>
  </div>`;
}

function commitFieldNumericKeypadInput(input = fieldNumericKeypadState.input) {
  if (!input) return;
  const mode = fieldNumericKeypadInputMode(input);
  const committedValue = normalizeFieldNumericKeypadValue(input.value, mode, { commit: true });
  if (input.value !== committedValue) input.value = committedValue;
  if (input.value !== fieldNumericKeypadState.initialValue) {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function closeFieldNumericKeypad({ commit = true } = {}) {
  const input = fieldNumericKeypadState.input;
  if (input) {
    if (commit && input.isConnected && !input.disabled) commitFieldNumericKeypadInput(input);
    input.classList.remove("is-field-numeric-keypad-active");
    if (input.isConnected) syncFieldNumericInputMode(input);
  }
  fieldNumericKeypadState.input = null;
  fieldNumericKeypadState.initialValue = "";
  document.body.classList.remove("field-numeric-keypad-open");
  const keypad = byId("fieldNumericKeypad");
  if (keypad) {
    keypad.hidden = true;
    keypad.setAttribute("aria-hidden", "true");
  }
}

function openFieldNumericKeypad(input) {
  if (!input || input.disabled) return;
  if (!shouldUseFieldNumericKeypad()) {
    syncFieldNumericInputMode(input);
    return;
  }
  const mode = fieldNumericKeypadInputMode(input);
  if (fieldNumericKeypadState.input && fieldNumericKeypadState.input !== input) closeFieldNumericKeypad();
  fieldNumericKeypadState.input = input;
  fieldNumericKeypadState.mode = mode;
  fieldNumericKeypadState.initialValue = String(input.value || "");
  input.readOnly = true;
  input.setAttribute("inputmode", "none");
  input.classList.add("is-field-numeric-keypad-active");
  input.value = normalizeFieldNumericKeypadValue(input.value, mode);
  renderFieldNumericKeypad(mode);
  const keypad = ensureFieldNumericKeypad();
  keypad.hidden = false;
  keypad.setAttribute("aria-hidden", "false");
  document.body.classList.add("field-numeric-keypad-open");
  window.setTimeout(() => {
    if (input.isConnected) input.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 0);
}

function setFieldNumericKeypadValue(value) {
  const input = fieldNumericKeypadState.input;
  if (!input) return;
  const mode = fieldNumericKeypadInputMode(input);
  const normalizedValue = normalizeFieldNumericKeypadValue(value, mode);
  if (input.value === normalizedValue) return;
  input.value = normalizedValue;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function handleFieldNumericKeypadClick(event) {
  const button = event.target.closest?.("[data-field-numeric-key], [data-field-numeric-action]");
  if (!button || button.disabled) return;
  const input = fieldNumericKeypadState.input;
  if (!input || input.disabled) {
    closeFieldNumericKeypad({ commit: false });
    return;
  }
  const key = button.dataset.fieldNumericKey;
  const action = button.dataset.fieldNumericAction;
  if (key !== undefined) {
    setFieldNumericKeypadValue(`${input.value || ""}${key}`);
    return;
  }
  if (action === "backspace") {
    setFieldNumericKeypadValue(String(input.value || "").slice(0, -1));
    return;
  }
  if (action === "clear") {
    setFieldNumericKeypadValue("");
    return;
  }
  if (action === "done") {
    closeFieldNumericKeypad();
  }
}

function handleFieldNumericInputKeydown(event) {
  if (!shouldUseFieldNumericKeypad()) return;
  const input = event.currentTarget;
  if (event.key === "Enter") {
    event.preventDefault();
    closeFieldNumericKeypad();
    input.blur();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    closeFieldNumericKeypad({ commit: false });
    input.blur();
    return;
  }
  if (event.key === "Backspace") {
    event.preventDefault();
    setFieldNumericKeypadValue(String(input.value || "").slice(0, -1));
    return;
  }
  if (event.key === "Delete") {
    event.preventDefault();
    setFieldNumericKeypadValue("");
    return;
  }
  if (/^\d$/.test(event.key) || (event.key === "." && fieldNumericKeypadInputMode(input) !== "integer")) {
    event.preventDefault();
    openFieldNumericKeypad(input);
    setFieldNumericKeypadValue(`${input.value || ""}${event.key}`);
  }
}

function handleFieldNumericPointerDown(event) {
  if (!shouldUseFieldNumericKeypad()) return;
  const input = event.currentTarget;
  event.preventDefault();
  openFieldNumericKeypad(input);
  input.focus?.({ preventScroll: true });
}

function bindFieldNumericKeypadControls(container = document) {
  container.querySelectorAll("[data-field-numeric-keypad]").forEach((input) => {
    syncFieldNumericInputMode(input);
    if (input.dataset.fieldNumericKeypadBound === "1") return;
    input.dataset.fieldNumericKeypadBound = "1";
    input.addEventListener("pointerdown", handleFieldNumericPointerDown);
    input.addEventListener("focus", (event) => openFieldNumericKeypad(event.currentTarget));
    input.addEventListener("click", (event) => openFieldNumericKeypad(event.currentTarget));
    input.addEventListener("keydown", handleFieldNumericInputKeydown);
  });
}

function fieldWorkDateLocale() {
  return activeLanguage === "vi" ? "vi-VN" : "zh-Hant-TW";
}

function saveAppLanguage(language) {
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // Language preference is optional; ignore storage failures.
  }
}

function applyLocalizedStaticText() {
  document.documentElement.lang = activeLanguage === "vi" ? "vi" : "zh-Hant";
  document.title = t("app.title");
  const loginLogo = document.querySelector(".login-logo");
  if (loginLogo) loginLogo.alt = t("app.title");
  const languageSelect = byId("languageSelect");
  if (languageSelect) languageSelect.value = activeLanguage;
  const textTargets = {
    loginTitle: "app.title",
    loginUsernameLabel: "login.username",
    loginPasswordLabel: "login.password",
    loginSubmitBtn: "login.submit",
    languageControlLabel: "language.label",
    logoutBtn: "logout",
    homeNavBtn: "home",
    fieldWorkRecordsNavBtn: "nav.fieldWorkRecords",
    netHouseStatusNavBtn: "page.netHouseStatusShort",
    dailyVegetableNavBtn: "nav.dailyVegetableAvailability",
    harvestPickListNavBtn: "nav.harvestPickList",
    fieldHomeKicker: "home.field.kicker",
    fieldHomeTitle: "home.field.title",
    netHouseHomeKicker: "home.netHouse.kicker",
    netHouseHomeTitle: "home.netHouse.title",
    enterFieldWorkRecordsBtn: "page.fieldWorkRecords",
    enterFieldBtRecordsBtn: "page.fieldBtRecords",
    enterNetHouseStatusRecordsBtn: "page.netHouseStatusRecords",
    enterDailyVegetableAvailabilityBtn: "page.dailyVegetableAvailability",
    enterHarvestPickListBtn: "page.harvestPickList",
    headerExportFieldWorkMonthBtn: "export.thisMonth",
    headerExportFieldBtMonthSummaryBtn: "export.thisMonth",
  };
  Object.entries(textTargets).forEach(([id, key]) => {
    const element = byId(id);
    if (element) element.textContent = t(key);
  });
}

function renderHeaderAccountControls() {
  const authenticated = Boolean(currentUser && data);
  const isHome = state.page === "home";
  const authActions = byId("authActions");
  const languageControl = byId("languageControl");
  if (authActions) authActions.classList.toggle("is-hidden", !authenticated || !isHome);
  if (languageControl) languageControl.classList.toggle("is-hidden", authenticated && !isHome);
}

function renderAuthState() {
  const authenticated = Boolean(currentUser && data);
  document.body.classList.toggle("is-authenticated", authenticated);
  document.body.classList.toggle("is-logged-out", !authenticated);
  byId("loginPage").hidden = authenticated;
  renderHeaderAccountControls();
  if (!authenticated) {
    byId("homePage").classList.remove("is-visible");
    document.querySelector(".workspace")?.classList.add("is-hidden");
    byId("headerActions").classList.add("is-hidden");
    byId("recordExportActions").classList.add("is-hidden");
    byId("dailyVegetableSettings").classList.add("is-hidden");
  }
}

function setAppLanguage(language) {
  activeLanguage = supportedLanguages.has(language) ? language : defaultLanguage;
  state.language = activeLanguage;
  saveAppLanguage(activeLanguage);
  applyLocalizedStaticText();
  render();
}

function isFocusableTableInput(input) {
  return input
    && !input.disabled
    && !input.readOnly
    && input.offsetParent !== null;
}

function focusTableInput(input) {
  input.focus();
  try {
    input.select?.();
  } catch {
    // Some browser input types cannot be selected, but they can still receive focus.
  }
  return true;
}

function focusableInputsInTableCell(cell) {
  return [...(cell?.querySelectorAll(tableInputNavigationSelector) || [])]
    .filter(isFocusableTableInput);
}

function focusVerticalTableInput(input, rowStep) {
  const cell = input.closest("td, th");
  const row = cell?.closest("tr");
  const table = row?.closest("table");
  if (!cell || !row || !table) return false;
  const rows = [...table.querySelectorAll("tr")];
  const rowIndex = rows.indexOf(row);
  if (rowIndex < 0) return false;
  for (let index = rowIndex + rowStep; index >= 0 && index < rows.length; index += rowStep) {
    const nextCell = rows[index].cells[cell.cellIndex];
    const nextInput = focusableInputsInTableCell(nextCell)[0];
    if (!nextInput) continue;
    return focusTableInput(nextInput);
  }
  return false;
}

function focusHorizontalTableInput(input, cellStep) {
  const cell = input.closest("td, th");
  const row = cell?.closest("tr");
  if (!cell || !row) return false;
  const cells = [...row.cells];
  const cellIndex = cells.indexOf(cell);
  if (cellIndex < 0) return false;
  for (let index = cellIndex + cellStep; index >= 0 && index < cells.length; index += cellStep) {
    const inputs = focusableInputsInTableCell(cells[index]);
    const nextInput = cellStep < 0 ? inputs[inputs.length - 1] : inputs[0];
    if (!nextInput) continue;
    return focusTableInput(nextInput);
  }
  return false;
}

function focusTableInputInDirection(input, direction) {
  if (direction === "up") return focusVerticalTableInput(input, -1);
  if (direction === "down") return focusVerticalTableInput(input, 1);
  if (direction === "left") return focusHorizontalTableInput(input, -1);
  if (direction === "right") return focusHorizontalTableInput(input, 1);
  return false;
}

function handleTableInputKeyboardNavigation(event) {
  if (event.isComposing || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
  const input = event.target.closest?.(tableInputNavigationSelector);
  if (!input) return;
  if (event.key === "Enter") {
    if (focusTableInputInDirection(input, "down")) event.preventDefault();
    return;
  }
  const direction = tableInputArrowDirections[event.key];
  if (!direction) return;
  event.preventDefault();
  focusTableInputInDirection(input, direction);
}

function activeSaveButton() {
  const saveButtonIdByPage = {
    harvestPlanning: "saveHarvestBtn",
    city: "saveCityBtn",
    [yfyPageKey]: "saveYfyBtn",
    looseVegetable: "saveLooseVegetableBtn",
    generalChannel: "saveGeneralChannelBtn",
  };
  const buttonId = state.page === "inventory" && state.view === "salesPage"
    ? "saveShipmentsBtn"
    : saveButtonIdByPage[state.page];
  const button = buttonId ? byId(buttonId) : null;
  return button && !button.disabled && button.offsetParent !== null ? button : null;
}

function handleSaveShortcut(event) {
  if (event.isComposing || event.altKey || event.shiftKey || !(event.ctrlKey || event.metaKey)) return;
  if (String(event.key || "").toLowerCase() !== "s") return;
  event.preventDefault();
  activeSaveButton()?.click();
}

function loadManifestSelectionsFromStorage() {
  try {
    const raw = localStorage.getItem(manifestSelectionStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveManifestSelectionsToStorage() {
  localStorage.setItem(manifestSelectionStorageKey, JSON.stringify(shipmentManifestSelections));
}

function manifestRoundLabel(index) {
  const numerals = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  const numeral = numerals[index - 1] || String(index);
  return `第${numeral}輪`;
}

function productIdentityKeys(product) {
  const keys = [];
  const productCode = String(product?.productCode || "").trim();
  const productName = String(product?.productName || "").trim();
  if (productCode && productCode !== "#N/A") keys.push(`code:${productCode}`);
  if (productName) keys.push(`name:${normalizeProductName(productName)}`);
  return keys;
}

function n(value) {
  return Number(value || 0);
}

function columnIndexFromLetter(letter) {
  return String(letter || "")
    .toUpperCase()
    .split("")
    .reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0);
}

function normalizeHarvestCrewColumns(columns) {
  const seen = new Set();
  const normalized = [];
  const source = Array.isArray(columns) ? columns : defaultHarvestCrewColumns;
  source.forEach((column) => {
    const name = String(column?.name || "").trim();
    const category = harvestCrewCategories.includes(column?.category) ? column.category : "有機";
    const col = Number(column?.col || columnIndexFromLetter(column?.column));
    if (!name || !col || seen.has(col)) return;
    normalized.push({
      name,
      category,
      col,
      column: columnLetterFromIndex(col),
      source: column?.source === "custom" ? "custom" : "default",
    });
    seen.add(col);
  });
  return normalized;
}

function harvestCrewKey(column) {
  return `${column?.category || "有機"}|${String(column?.name || "").trim()}`;
}

function normalizeHarvestCrewColumnsByDate(columnsByDate) {
  if (!columnsByDate || typeof columnsByDate !== "object" || Array.isArray(columnsByDate)) return {};
  return Object.fromEntries(
    Object.entries(columnsByDate)
      .map(([date, columns]) => [date, normalizeHarvestCrewColumns(columns)])
      .filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)),
  );
}

function activeHarvestCrewColumns() {
  const date = harvestDate();
  return harvestCrewColumnsByDate[date] || normalizeHarvestCrewColumns(defaultHarvestCrewColumns);
}

function setActiveHarvestCrewColumns(columns) {
  const date = harvestDate();
  if (!date) return;
  harvestCrewColumnsByDate = {
    ...harvestCrewColumnsByDate,
    [date]: normalizeHarvestCrewColumns(columns),
  };
}

function harvestFieldSectionForBaseColumn(baseCol) {
  const col = Number(baseCol);
  if (harvestQuantityBaseFieldColumns.includes(col)) return "quantity";
  if (harvestUnfinishedBaseFieldColumns.includes(col)) return "unfinished";
  return "";
}

function normalizeHarvestFieldExtraColumns(columns) {
  const seenCols = new Set();
  const normalized = [];
  (Array.isArray(columns) ? columns : []).forEach((column) => {
    const col = Number(column?.col || columnIndexFromLetter(column?.column));
    const baseCol = Number(column?.baseCol);
    const section = column?.section === harvestFieldSectionForBaseColumn(baseCol)
      ? column.section
      : harvestFieldSectionForBaseColumn(baseCol);
    if (!section || col < harvestFieldExtraColumnStart || seenCols.has(col)) return;
    normalized.push({
      section,
      baseCol,
      col,
      column: columnLetterFromIndex(col),
    });
    seenCols.add(col);
  });
  return normalized;
}

function normalizeHarvestFieldExtraColumnsByDate(columnsByDate) {
  if (!columnsByDate || typeof columnsByDate !== "object" || Array.isArray(columnsByDate)) return {};
  return Object.fromEntries(
    Object.entries(columnsByDate)
      .map(([date, columns]) => [date, normalizeHarvestFieldExtraColumns(columns)])
      .filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)),
  );
}

function activeHarvestFieldExtraColumns() {
  return normalizeHarvestFieldExtraColumns(harvestFieldExtraColumnsByDate[harvestDate()]);
}

function setActiveHarvestFieldExtraColumns(columns) {
  const date = harvestDate();
  if (!date) return;
  harvestFieldExtraColumnsByDate = {
    ...harvestFieldExtraColumnsByDate,
    [date]: normalizeHarvestFieldExtraColumns(columns),
  };
}

function harvestFieldExtraColumnByCol(col) {
  return activeHarvestFieldExtraColumns().find((column) => column.col === col) || null;
}

function isHarvestFieldExtraColumn(col) {
  return Boolean(harvestFieldExtraColumnByCol(col));
}

function harvestFieldBaseColumn(col) {
  return harvestFieldExtraColumnByCol(col)?.baseCol || col;
}

function normalizeHarvestField3FExpanded(value) {
  const normalized = { ...defaultHarvestField3FExpanded };
  if (!value || typeof value !== "object" || Array.isArray(value)) return normalized;
  Object.keys(defaultHarvestField3FExpanded).forEach((key) => {
    if (typeof value[key] === "boolean") normalized[key] = value[key];
  });
  return normalized;
}

function normalizeHarvestField3FExpandedByDate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date))
      .map(([date, expanded]) => [date, normalizeHarvestField3FExpanded(expanded)]),
  );
}

function activeHarvestField3FExpanded() {
  return normalizeHarvestField3FExpanded(harvestField3FExpandedByDate[harvestDate()]);
}

function setActiveHarvestField3FExpanded(expanded) {
  const date = harvestDate();
  if (!date) return;
  harvestField3FExpandedByDate = {
    ...harvestField3FExpandedByDate,
    [date]: normalizeHarvestField3FExpanded(expanded),
  };
}

function harvestEntryKey(harvestDate, sheetName, rowIndex, columnLetter) {
  return `${harvestDate}|${sheetName}|${rowIndex}|${columnLetter}`;
}

function normalizeHarvestPriority(value) {
  const priority = Number(value);
  return Number.isInteger(priority) && priority >= 1 && priority <= 7 ? priority : 0;
}

function normalizeHarvestCellPriorities(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const normalized = {};
  Object.entries(value).forEach(([key, priority]) => {
    const parts = String(key).split("|");
    const rowIndex = Number(parts.at(-2));
    const columnLetter = parts.at(-1);
    const col = columnIndexFromLetter(columnLetter);
    const normalizedPriority = normalizeHarvestPriority(priority);
    if (!Number.isInteger(rowIndex) || rowIndex < 1 || !/^[A-Z]+$/.test(String(columnLetter || ""))) return;
    if (isHarvestPriorityExcludedColumn(col)) return;
    if (normalizedPriority) normalized[key] = normalizedPriority;
  });
  return normalized;
}

function normalizeHarvestCellFormulas(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const normalized = {};
  Object.entries(value).forEach(([key, formula]) => {
    const parts = String(key).split("|");
    const rowIndex = Number(parts.at(-2));
    const columnLetter = parts.at(-1);
    const normalizedFormula = String(formula ?? "").trim();
    if (!Number.isInteger(rowIndex) || rowIndex < 1 || !/^[A-Z]+$/.test(String(columnLetter || ""))) return;
    if (!normalizedFormula || normalizedFormula.length > 160) return;
    normalized[key] = normalizedFormula;
  });
  return normalized;
}

function harvestPriorityForCell(cell) {
  const template = harvestTemplate();
  const date = harvestDate();
  if (!cell || !template || !date || !cell.column) return 0;
  return normalizeHarvestPriority(draftHarvestCellPriorities[
    harvestEntryKey(date, template.sheetName, cell.row, cell.column)
  ]);
}

function isHarvestPriorityCell(cell) {
  if (!cell || !isHarvestEditableCell(cell) || isHarvestNoPackageColumn(cell.col) || isHarvestPriorityExcludedColumn(cell.col)) return false;
  return isHarvestItemRow(cell.row)
    && (
      (cell.col >= 4 && cell.col <= 7)
      || (cell.col >= 9 && cell.col <= 12)
      || isHarvestField3FColumn(cell.col)
      || isHarvestFieldExtraColumn(cell.col)
      || isHarvestCrewColumn(cell.col)
    );
}

function harvestCellPriorityKey(cell) {
  const template = harvestTemplate();
  const date = harvestDate();
  if (!cell || !template || !date || !cell.column) return "";
  return harvestEntryKey(date, template.sheetName, cell.row, cell.column);
}

function harvestCellFormulaKey(cell) {
  const template = harvestTemplate();
  const date = harvestDate();
  if (!cell || !template || !date || !cell.column) return "";
  return harvestEntryKey(date, template.sheetName, cell.row, cell.column);
}

function harvestFormulaForCell(cell) {
  const key = harvestCellFormulaKey(cell);
  return key ? String(draftHarvestCellFormulas[key] || "") : "";
}

function setDraftHarvestCellFormula(cell, formula) {
  if (!isHarvestEditableCell(cell)) return false;
  const key = harvestCellFormulaKey(cell);
  if (!key) return false;
  const normalizedFormula = String(formula ?? "").trim();
  if (normalizedFormula) {
    draftHarvestCellFormulas[key] = normalizedFormula.slice(0, 160);
  } else {
    delete draftHarvestCellFormulas[key];
  }
  return true;
}

function harvestPriorityOwner(priority, currentCell = null) {
  const normalizedPriority = normalizeHarvestPriority(priority);
  const template = harvestTemplate();
  const date = harvestDate();
  if (!normalizedPriority || !template || !date) return "";
  const prefix = `${date}|${template.sheetName}|`;
  const currentKey = currentCell ? harvestCellPriorityKey(currentCell) : "";
  const currentRow = currentCell ? Number(currentCell.row) : 0;
  const cellMap = harvestCellMap();
  for (const [key, value] of Object.entries(draftHarvestCellPriorities)) {
    if (!key.startsWith(prefix) || key === currentKey) continue;
    if (normalizeHarvestPriority(value) !== normalizedPriority) continue;
    const parts = key.split("|");
    const rowIndex = Number(parts.at(-2));
    if (currentRow && rowIndex !== currentRow) continue;
    const col = columnIndexFromLetter(parts.at(-1));
    const cell = cellMap.get(`${rowIndex}:${col}`);
    if (cell && isHarvestPriorityCell(cell)) return key;
  }
  return "";
}

function setDraftHarvestCellPriority(cell, priority) {
  if (!isHarvestPriorityCell(cell)) return false;
  const key = harvestCellPriorityKey(cell);
  if (!key) return false;
  const normalizedPriority = normalizeHarvestPriority(priority);
  if (normalizedPriority) {
    if (harvestPriorityOwner(normalizedPriority, cell)) return false;
    draftHarvestCellPriorities[key] = normalizedPriority;
  } else {
    delete draftHarvestCellPriorities[key];
  }
  return true;
}

function harvestPriorityClass(cell) {
  if (!isHarvestPriorityCell(cell)) return "";
  const priority = harvestPriorityForCell(cell);
  return priority ? `harvest-priority-cell harvest-priority-${priority}` : "";
}

function harvestPriorityBadge(priority) {
  return priority ? `<span class="harvest-priority-badge">${priority}</span>` : "";
}

function harvestTemplate() {
  return data?.harvestPlanningTemplate || null;
}

function harvestDate() {
  return state.shipmentDate || todayDate();
}

function formatDateShort(date) {
  const match = String(date || "").match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return date || "";
  return `${Number(match[2])}/${Number(match[3])}`;
}

function formatDateInputDisplay(date) {
  const match = String(date || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return date || "";
  return `${match[1]}/${String(Number(match[2])).padStart(2, "0")}/${String(Number(match[3])).padStart(2, "0")}`;
}

function overlayControlMarkup({ type, id = "", value = "", display = "", displayHtml = "", inputClass = "", attributes = "", optionsHtml = "" } = {}) {
  const idAttribute = id ? ` id="${escapeAttribute(id)}"` : "";
  const className = `mobile-${type}-native${inputClass ? ` ${inputClass}` : ""}`;
  const classAttribute = ` class="${escapeAttribute(className)}"`;
  const extraAttributes = attributes ? ` ${attributes}` : "";
  const iconClass = type === "date" ? "mobile-date-icon" : "mobile-select-icon";
  const displayMarkup = displayHtml || escapeHtml(display);
  const nativeControl = type === "select"
    ? `<select${idAttribute}${classAttribute}${extraAttributes}>${optionsHtml}</select>`
    : `<input${idAttribute}${classAttribute} type="date" value="${escapeAttribute(value)}"${extraAttributes} />`;
  return `<span class="mobile-${type}-control">
    <span class="mobile-${type}-display" aria-hidden="true">${displayMarkup}</span>
    <span class="${iconClass}" aria-hidden="true"></span>
    ${nativeControl}
  </span>`;
}

function dateInputMarkup({ id = "", value = "", inputClass = "", attributes = "" } = {}) {
  return overlayControlMarkup({
    type: "date",
    id,
    value,
    inputClass,
    attributes,
    display: formatDateInputDisplay(value),
  });
}

function selectInputMarkup({ id = "", display = "", displayHtml = "", inputClass = "", attributes = "", optionsHtml = "" } = {}) {
  return overlayControlMarkup({
    type: "select",
    id,
    inputClass,
    attributes,
    optionsHtml,
    display,
    displayHtml,
  });
}

function updateOverlayControlDisplay(control, displayText = "") {
  const wrapper = control?.closest?.(".mobile-date-control, .mobile-select-control");
  const display = wrapper?.querySelector(".mobile-date-display, .mobile-select-display");
  if (display) display.textContent = displayText;
}

function updateDateInputDisplay(input) {
  updateOverlayControlDisplay(input, formatDateInputDisplay(input.value));
}

function updateSelectDisplay(select) {
  updateOverlayControlDisplay(select, select?.selectedOptions?.[0]?.textContent || select?.value || "");
}

function numberText(value) {
  const numeric = n(value);
  const text = format.format(Math.abs(numeric));
  return numeric < 0 ? `<span class="negative">(${text})</span>` : text;
}

function inventoryAccountingText(value) {
  return n(value) ? numberText(value) : "-";
}

function inventoryBlankableNumberText(value) {
  return n(value) ? numberText(value) : "";
}

function signedInputValue(rawValue) {
  const text = String(rawValue ?? "").trim();
  if (!text) return "";
  const isNegative = text.startsWith("-") || /^\(.*\)$/.test(text);
  const unsigned = text.replace(/[(),]/g, "").replace(/-/g, "").replace(/[^\d.]/g, "");
  const parts = unsigned.split(".");
  const normalized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];
  if (!normalized) return isNegative ? "-" : "";
  return `${isNegative ? "-" : ""}${normalized}`;
}

function signedNumberValue(rawValue) {
  const normalized = signedInputValue(rawValue);
  if (!normalized || normalized === "-") return "";
  const value = Number(normalized);
  return Number.isFinite(value) ? value : "";
}

function adjustmentInputText(value) {
  const numeric = n(value);
  if (!numeric) return "";
  const text = format.format(Math.abs(numeric));
  return numeric < 0 ? `(${text})` : text;
}

function integerText(value) {
  const numeric = n(value);
  if (!numeric) return "";
  return new Intl.NumberFormat("zh-Hant-TW", { maximumFractionDigits: 0 }).format(numeric);
}

function setHarvestPackageCalculatorInput(key, rawValue) {
  const normalized = String(rawValue ?? "").replace(/[^\d.]/g, "");
  const value = normalized === "" ? 0 : Number(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    delete harvestPackageCalculatorInputs[key];
  } else {
    harvestPackageCalculatorInputs[key] = value;
  }
}

function harvestPackageCalculatorResult(row, inputKg, kind) {
  const kg = n(inputKg);
  if (!kg) return 0;
  if (kind === "precool") return row.precoolFactor ? kg * row.precoolFactor : 0;
  if (row.noPrecoolFactor) return kg * row.noPrecoolFactor;
  if (row.noPrecoolFromPrecool) return kg * n(row.precoolFactor) * 1.04;
  return 0;
}

function harvestRoundedPackageCount(value) {
  const numeric = n(value);
  if (!numeric) return 0;
  return Math.floor(Math.ceil(numeric) / 5) * 5;
}

function harvestRoundedPackageText(value) {
  const rounded = harvestRoundedPackageCount(value);
  return rounded ? integerText(rounded) : "";
}

function harvestConversionPackageRow(packageKey) {
  return harvestPackageCalculatorRows.find((row) => row.key === packageKey) || harvestPackageCalculatorRows[0];
}

function harvestConversionDefaultPackageKey(productName) {
  const name = normalizeProductName(productName);
  if (name.includes("九層塔")) return "basil";
  if (name.includes("香菜")) return "cilantro";
  if (name.includes("羽衣") || name.includes("芝麻")) return "kaleSesame";
  if (name.includes("茼蒿") && !name.includes("山茼蒿")) return "crownDaisy";
  if (name.includes("奶白") || name.includes("山茼蒿") || name.includes("菠菜") || name.includes("萵苣")) return "leafy220";
  return "mostly";
}

function normalizeHarvestConversionSettings(value) {
  const normalized = { hasPrecoolByDate: {}, packagedChannelsByDate: {}, productPackages: {} };
  if (!value || typeof value !== "object" || Array.isArray(value)) return normalized;
  if (value.hasPrecoolByDate && typeof value.hasPrecoolByDate === "object" && !Array.isArray(value.hasPrecoolByDate)) {
    Object.entries(value.hasPrecoolByDate).forEach(([date, checked]) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && typeof checked === "boolean") normalized.hasPrecoolByDate[date] = checked;
    });
  }
  if (value.packagedChannelsByDate && typeof value.packagedChannelsByDate === "object" && !Array.isArray(value.packagedChannelsByDate)) {
    Object.entries(value.packagedChannelsByDate).forEach(([date, channels]) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !channels || typeof channels !== "object" || Array.isArray(channels)) return;
      Object.entries(channels).forEach(([channelKey, checked]) => {
        if (harvestPackagingChannelKeys.includes(channelKey) && typeof checked === "boolean") {
          normalized.packagedChannelsByDate[date] ||= {};
          normalized.packagedChannelsByDate[date][channelKey] = checked;
        }
      });
    });
  }
  if (value.productPackages && typeof value.productPackages === "object" && !Array.isArray(value.productPackages)) {
    Object.entries(value.productPackages).forEach(([productKey, packageKey]) => {
      const key = String(productKey || "").trim();
      const normalizedPackageKey = String(packageKey || "").trim();
      if (key && harvestConversionPackageKeys.includes(normalizedPackageKey)) {
        normalized.productPackages[key] = normalizedPackageKey;
      }
    });
  }
  return normalized;
}

function harvestConversionProductRows() {
  return allHarvestProducts.filter((product) => product.rowIndex >= 5 && product.rowIndex <= 40);
}

function activeHarvestConversionHasPrecool(date = harvestDate()) {
  const value = harvestConversionSettings.hasPrecoolByDate?.[date];
  return typeof value === "boolean" ? value : true;
}

function setActiveHarvestConversionHasPrecool(checked, date = harvestDate()) {
  if (!date) return;
  harvestConversionSettings = normalizeHarvestConversionSettings({
    ...harvestConversionSettings,
    hasPrecoolByDate: {
      ...(harvestConversionSettings.hasPrecoolByDate || {}),
      [date]: Boolean(checked),
    },
  });
}

function activeHarvestPackagedChannels(date = harvestDate()) {
  const channels = harvestConversionSettings.packagedChannelsByDate?.[date] || {};
  return Object.fromEntries(harvestPackagingChannels.map((channel) => [
    channel.key,
    channels[channel.key] === true,
  ]));
}

function activeHarvestChannelPackaged(channelKey, date = harvestDate()) {
  return activeHarvestPackagedChannels(date)[channelKey] === true;
}

function setActiveHarvestChannelPackaged(channelKey, checked, date = harvestDate()) {
  if (!date || !harvestPackagingChannelKeys.includes(channelKey)) return;
  harvestConversionSettings = normalizeHarvestConversionSettings({
    ...harvestConversionSettings,
    packagedChannelsByDate: {
      ...(harvestConversionSettings.packagedChannelsByDate || {}),
      [date]: {
        ...(harvestConversionSettings.packagedChannelsByDate?.[date] || {}),
        [channelKey]: Boolean(checked),
      },
    },
  });
}

function harvestConversionProductPackageKey(product) {
  const key = productFilterKey(product);
  return harvestConversionSettings.productPackages?.[key] || harvestConversionDefaultPackageKey(product?.productName || "");
}

function setHarvestConversionProductPackage(productKey, packageKey) {
  const normalizedProductKey = String(productKey || "").trim();
  const normalizedPackageKey = harvestConversionPackageKeys.includes(packageKey) ? packageKey : "";
  if (!normalizedProductKey || !normalizedPackageKey) return;
  harvestConversionSettings = normalizeHarvestConversionSettings({
    ...harvestConversionSettings,
    productPackages: {
      ...(harvestConversionSettings.productPackages || {}),
      [normalizedProductKey]: normalizedPackageKey,
    },
  });
}

function harvestConversionPackageCount(packageKey, estimatedKg, hasPrecool) {
  const packageRow = harvestConversionPackageRow(packageKey);
  const kind = hasPrecool && packageRow.precoolFactor ? "precool" : "noPrecool";
  const converted = harvestPackageCalculatorResult(packageRow, estimatedKg, kind);
  return harvestRoundedPackageCount(converted);
}

function parseDateValue(date) {
  const match = String(date || "").match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function monthKey(date) {
  const match = String(date || "").match(/^(\d{4})-(\d{1,2})-\d{1,2}$/);
  if (!match) return "";
  return `${match[1]}-${String(Number(match[2])).padStart(2, "0")}`;
}

function monthStartDate(month) {
  const match = String(month || "").match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

function monthRangeFromKey(month) {
  const start = monthStartDate(month);
  if (!start) return null;
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  return { key: month, start: isoDate(start), end: isoDate(end) };
}

function previousMonthEndDate(date) {
  const parsed = parseDateValue(date);
  if (!parsed) return "";
  return isoDate(new Date(parsed.getFullYear(), parsed.getMonth(), 0));
}

function nextDateText(date) {
  const parsed = parseDateValue(date);
  if (!parsed) return date || "";
  const nextDate = new Date(parsed);
  nextDate.setDate(parsed.getDate() + 1);
  return isoDate(nextDate);
}

function previousDateText(date) {
  const parsed = parseDateValue(date);
  if (!parsed) return date || "";
  const previousDate = new Date(parsed);
  previousDate.setDate(parsed.getDate() - 1);
  return isoDate(previousDate);
}

function salesArrivalInputDate(date = state.shipmentDate) {
  return nextDateText(date);
}

function currentStockForDate(store, row, date = state.shipmentDate) {
  const openingStock = openingStockForDate(row, date, store);
  const shipmentQty = savedShipmentTotalThroughDate(store, row.productCode, date);
  const salesQty = importedQuantityThroughDate(store?.dates || [], row.sales, date);
  const discardQty = importedQuantityThroughDate(store?.dates || [], row.discards, date);
  const adjustmentQty = savedStockAdjustmentThroughDate(store, row.productCode, date);
  return openingStock + shipmentQty - salesQty - discardQty + adjustmentQty;
}

function openingStockForDate(row, date = state.shipmentDate, store = null) {
  const key = monthKey(date);
  const byMonth = row?.openingStocksByMonth;
  if (
    key
    && byMonth
    && typeof byMonth === "object"
    && !Array.isArray(byMonth)
    && Object.prototype.hasOwnProperty.call(byMonth, key)
  ) {
    return n(byMonth[key]);
  }
  return 0;
}

function salesLoadMonthsForDate(store, date) {
  const currentMonth = monthKey(date);
  if (!currentMonth) return [];
  const end = parseDateValue(date);
  const months = new Set([currentMonth]);
  if (!end) return [...months];
  for (let offset = 1; offset <= 5; offset += 1) {
    const current = new Date(end);
    current.setDate(end.getDate() - offset);
    const key = monthKey(isoDate(current));
    if (key) months.add(key);
  }
  const previousMonth = monthKey(previousMonthEndDate(date));
  if (previousMonth) months.add(previousMonth);
  return [...months].sort();
}

function combineSalesPayloads(keys, storeCode) {
  const payloads = keys
    .map((key) => salesMonthPayloads.get(`${key}|${storeCode}`))
    .filter(Boolean);
  activeSalesRows = payloads.flatMap((payload) => payload.salesRows || []);
  activeSalesPivot = payloads.flatMap((payload) => payload.salesPivot || []);
  activeSalesTotals = payloads.reduce(
    (totals, payload) => {
      totals.salesQty += n(payload.salesTotals?.salesQty);
      totals.discardQty += n(payload.salesTotals?.discardQty);
      totals.endingStock += n(payload.salesTotals?.endingStock);
      return totals;
    },
    { salesQty: 0, discardQty: 0, endingStock: 0 },
  );
}

function setOpeningStocksForStoreMonth(stores, month, storeCode, openingStocks) {
  if (!Array.isArray(stores) || !month || !storeCode || !openingStocks || typeof openingStocks !== "object") return;
  stores.forEach((store) => {
    if (String(store.storeCode || "") !== String(storeCode)) return;
    (store.products || []).forEach((product) => {
      const productCode = String(product.productCode || "");
      if (!productCode) return;
      if (!product.openingStocksByMonth || typeof product.openingStocksByMonth !== "object" || Array.isArray(product.openingStocksByMonth)) {
        product.openingStocksByMonth = {};
      }
      product.openingStocksByMonth[month] = n(openingStocks[productCode]);
    });
  });
}

function applyOpeningStockPayload(month, storeCode, payload) {
  const openingStocks = payload?.openingStocks || {};
  setOpeningStocksForStoreMonth(data?.storePages, month, storeCode, openingStocks);
  setOpeningStocksForStoreMonth(baseStorePages, month, storeCode, openingStocks);
  setOpeningStocksForStoreMonth(storePages, month, storeCode, openingStocks);
}

function removeOpeningStocksAfterMonth(stores, changedMonth, storeCode) {
  if (!Array.isArray(stores) || !changedMonth || !storeCode) return;
  stores.forEach((store) => {
    if (String(store.storeCode || "") !== String(storeCode)) return;
    (store.products || []).forEach((product) => {
      const byMonth = product.openingStocksByMonth;
      if (!byMonth || typeof byMonth !== "object" || Array.isArray(byMonth)) return;
      Object.keys(byMonth).forEach((month) => {
        if (/^\d{4}-\d{2}$/.test(month) && month > changedMonth) delete byMonth[month];
      });
    });
  });
}

function invalidateFutureOpeningStockCache(date, store) {
  const changedMonth = monthKey(date);
  const storeCode = store?.storeCode || "";
  if (!changedMonth || !storeCode) return;
  const shouldInvalidate = (cacheKey) => {
    const [month, cachedStoreCode] = String(cacheKey).split("|");
    return cachedStoreCode === String(storeCode) && month > changedMonth;
  };
  [...loadedOpeningStockMonths].forEach((cacheKey) => {
    if (shouldInvalidate(cacheKey)) loadedOpeningStockMonths.delete(cacheKey);
  });
  [...openingStockMonthPromises.keys()].forEach((cacheKey) => {
    if (shouldInvalidate(cacheKey)) openingStockMonthPromises.delete(cacheKey);
  });
  removeOpeningStocksAfterMonth(data?.storePages, changedMonth, storeCode);
  removeOpeningStocksAfterMonth(baseStorePages, changedMonth, storeCode);
  removeOpeningStocksAfterMonth(storePages, changedMonth, storeCode);
}

function importedQuantityThroughDate(dates, values, date) {
  const month = monthKey(date);
  if (!month || !Array.isArray(values)) return 0;
  return (dates || []).reduce(
    (sum, rowDate, idx) => sum + (monthKey(rowDate) === month && rowDate <= date ? n(values[idx]) : 0),
    0,
  );
}

function savedEntryIndexKey(store, productCode) {
  const storeKey = typeof store === "string" ? store : store?.key;
  return `${storeKey || ""}|${productCode || ""}`;
}

function rebuildSavedEntryIndex(entries, { includeZero = false } = {}) {
  const index = new Map();
  Object.entries(entries).forEach(([key, quantity]) => {
    const parts = key.split("|");
    if (parts.length < 3 || (!includeZero && !n(quantity))) return;
    const productCode = parts.at(-1);
    const entryDate = parts.at(-2);
    const storeKey = parts.slice(0, -2).join("|");
    const indexKey = savedEntryIndexKey(storeKey, productCode);
    if (!index.has(indexKey)) index.set(indexKey, new Map());
    index.get(indexKey).set(entryDate, n(quantity));
  });
  return index;
}

function rebuildSavedShipmentIndex() {
  savedShipmentIndex = rebuildSavedEntryIndex(savedShipments);
}

function rebuildSavedStockAdjustmentIndex() {
  savedStockAdjustmentIndex = rebuildSavedEntryIndex(savedStockAdjustments, { includeZero: true });
}

function savedEntryTotalThroughDate(index, store, productCode, date) {
  const month = monthKey(date);
  if (!store || !productCode || !month) return 0;
  const byDate = index.get(savedEntryIndexKey(store, productCode));
  if (!byDate) return 0;
  let total = 0;
  for (const [entryDate, quantity] of byDate) {
    if (monthKey(entryDate) === month && entryDate <= date) total += n(quantity);
  }
  return total;
}

function savedShipmentTotalThroughDate(store, productCode, date = state.shipmentDate) {
  return savedEntryTotalThroughDate(savedShipmentIndex, store, productCode, date);
}

function savedEntryLatestThroughDate(index, store, productCode, date) {
  const month = monthKey(date);
  if (!store || !productCode || !month) return 0;
  const byDate = index.get(savedEntryIndexKey(store, productCode));
  if (!byDate) return 0;
  let latestDate = "";
  let latestQuantity = 0;
  for (const [entryDate, quantity] of byDate) {
    if (monthKey(entryDate) !== month || entryDate > date || entryDate < latestDate) continue;
    latestDate = entryDate;
    latestQuantity = n(quantity);
  }
  return latestQuantity;
}

function savedStockAdjustmentThroughDate(store, productCode, date = state.shipmentDate) {
  return savedEntryLatestThroughDate(savedStockAdjustmentIndex, store, productCode, date);
}

function stockAdjustmentForSalesRowAtDate(store, productCode, date) {
  const byDate = savedStockAdjustmentIndex.get(savedEntryIndexKey(store, productCode));
  if (byDate?.has(date)) return n(byDate.get(date));
  return savedStockAdjustmentThroughDate(store, productCode, date);
}

function currentStockForSalesRow(store, row, date = state.shipmentDate) {
  return currentStockForDate(store, row, date);
}

function discardQtyForSalesRow(store, row, date = state.shipmentDate) {
  return importedQuantityThroughDate(store?.dates || [], row.discards, date);
}

function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function salesWindowDates(dates) {
  const end = parseDateValue(state.shipmentDate);
  if (!end) return dates.slice(-5).map((date) => ({ date, idx: dates.indexOf(date) }));
  const dateIndex = new Map(dates.map((date, idx) => [date, idx]));
  return Array.from({ length: 5 }, (_, offset) => {
    const current = new Date(end);
    current.setDate(end.getDate() - (5 - offset));
    const date = isoDate(current);
    return { date, idx: dateIndex.has(date) ? dateIndex.get(date) : -1 };
  });
}

function monthRange(date) {
  const parsed = parseDateValue(date);
  if (!parsed) return null;
  const start = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  const end = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0);
  return { key: monthKey(date), start: isoDate(start), end: isoDate(end) };
}

function cloneBaseStorePages(pages) {
  return (pages || []).map((store) => {
    const clonedStore = {
      ...store,
      dates: [...(store.dates || [])],
      products: (store.products || []).map((product) => ({
        ...product,
        openingStocksByMonth: { ...(product.openingStocksByMonth || {}) },
        sales: [...(product.sales || [])],
        discards: [...(product.discards || [])],
        monthlySales: 0,
        discardQty: 0,
        currentStock: 0,
      })),
    };
    clonedStore.products.forEach((product) => {
      product.currentStock = openingStockForDate(product, state.shipmentDate, clonedStore) + n(product.existingShipmentQty);
    });
    return clonedStore;
  });
}

function mergeSalesIntoStores(stores, salesPivot) {
  const salesDates = [...new Set((salesPivot || []).map((row) => row.date).filter(Boolean))].sort();
  if (!salesDates.length) return stores;
  const salesByKey = new Map();
  const discardByKey = new Map();
  (salesPivot || []).forEach((row) => {
    const key = `${row.date}|${row.storeCode}|${row.productCode}`;
    salesByKey.set(key, n(row.salesQty));
    discardByKey.set(key, n(row.discardQty));
  });

  stores.forEach((store) => {
    const sortedDates = [...new Set([...(store.dates || []), ...salesDates])].sort();
    const oldPositions = new Map((store.dates || []).map((date, idx) => [date, idx]));
    store.dates = sortedDates;
    (store.products || []).forEach((product) => {
      const oldSales = product.sales || [];
      const oldDiscards = product.discards || [];
      product.sales = sortedDates.map((date) => {
        const oldIdx = oldPositions.get(date);
        return oldIdx === undefined ? 0 : n(oldSales[oldIdx]);
      });
      product.discards = sortedDates.map((date) => {
        const oldIdx = oldPositions.get(date);
        return oldIdx === undefined ? 0 : n(oldDiscards[oldIdx]);
      });
      product.monthlySales = 0;
      product.discardQty = 0;
      salesDates.forEach((salesDate) => {
        const dateIdx = store.dates.indexOf(salesDate);
        if (dateIdx < 0) return;
        const key = `${salesDate}|${store.storeCode}|${product.productCode}`;
        if (!salesByKey.has(key)) return;
        const salesQty = n(salesByKey.get(key));
        const discardQty = n(discardByKey.get(key));
        product.sales[dateIdx] = salesQty;
        product.discards[dateIdx] = discardQty;
        if (monthKey(salesDate) === monthKey(state.shipmentDate) && salesDate <= state.shipmentDate) {
          product.monthlySales += salesQty;
          product.discardQty += discardQty;
        }
      });
      product.currentStock = currentStockForDate(store, product, state.shipmentDate);
    });
  });
  return stores;
}

function applyActiveSalesData() {
  if (!data) return;
  data.salesRows = activeSalesRows;
  data.salesPivot = activeSalesPivot;
  data.salesTotals = activeSalesTotals;
  storePages = mergeSalesIntoStores(cloneBaseStorePages(baseStorePages), activeSalesPivot);
  data.storePages = storePages;
}

async function ensureSalesForDate(date) {
  const store = selectedStore();
  const storeCode = store?.storeCode || "";
  const monthKeys = salesLoadMonthsForDate(store, date);
  if (!monthKeys.length || !storeCode) {
    applyActiveSalesData();
    return;
  }
  await ensureOpeningStockForDate(date, store);
  const loads = monthKeys.map((month) => {
    const cacheKey = `${month}|${storeCode}`;
    if (loadedSalesMonths.has(cacheKey)) return salesMonthPromises.get(cacheKey) || Promise.resolve();
    if (!salesMonthPromises.has(cacheKey)) {
      const range = monthRangeFromKey(month);
      const url = `/api/sales?start=${encodeURIComponent(range.start)}&end=${encodeURIComponent(range.end)}&storeCode=${encodeURIComponent(storeCode)}`;
      salesMonthPromises.set(
        cacheKey,
        fetch(url)
          .then((response) => response.json().then((result) => ({ response, result })))
          .then(({ response, result }) => {
            if (!response.ok || !result.ok) throw new Error(result.error || "銷售資料載入失敗");
            loadedSalesMonths.add(cacheKey);
            salesMonthPayloads.set(cacheKey, result);
          }),
      );
    }
    return salesMonthPromises.get(cacheKey);
  });
  await Promise.all(loads);
  combineSalesPayloads(monthKeys, storeCode);
  applyActiveSalesData();
}

async function ensureOpeningStockForDate(date, store = selectedStore()) {
  const storeCode = store?.storeCode || "";
  const month = monthKey(date);
  if (!storeCode || !month) return;
  const cacheKey = `${month}|${storeCode}`;
  if (loadedOpeningStockMonths.has(cacheKey)) return openingStockMonthPromises.get(cacheKey) || Promise.resolve();
  const hasLocalOpening = (store.products || []).some((product) =>
    Object.prototype.hasOwnProperty.call(product.openingStocksByMonth || {}, month),
  );
  if (hasLocalOpening) {
    loadedOpeningStockMonths.add(cacheKey);
    return;
  }
  if (!openingStockMonthPromises.has(cacheKey)) {
    const url = `/api/opening-stock?month=${encodeURIComponent(month)}&storeCode=${encodeURIComponent(storeCode)}`;
    openingStockMonthPromises.set(
      cacheKey,
      fetch(url)
        .then((response) => response.json().then((result) => ({ response, result })))
        .then(({ response, result }) => {
          if (!response.ok || !result.ok) throw new Error(result.error || "期初庫存載入失敗");
          applyOpeningStockPayload(month, storeCode, result);
          loadedOpeningStockMonths.add(cacheKey);
        }),
    );
  }
  return openingStockMonthPromises.get(cacheKey);
}

function includes(row, query) {
  if (!query) return true;
  const haystack = [
    row.group,
    row.storeCode,
    row.storeName,
    row.storeSheet,
    row.productCode,
    row.productName,
    row.route,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function sortByNumber(field, direction = "asc") {
  return (a, b) => (n(a[field]) - n(b[field])) * (direction === "asc" ? 1 : -1);
}

function storeOrderValue(store) {
  const value = Number(store?.mailOrder);
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

function compareTextValue(a, b) {
  return String(a || "").localeCompare(String(b || ""), "zh-Hant", {
    numeric: true,
    sensitivity: "base",
  });
}

function routeSortParts(route) {
  const value = String(route || "").trim();
  if (!value) return { missing: 1, area: "", code: "" };
  const match = value.match(/^(.*?)([A-Za-z0-9]+)$/u);
  if (match) return { missing: 0, area: match[1], code: match[2] };
  return { missing: 0, area: value, code: "" };
}

function compareManifestStoreOrder(a, b) {
  if (a.group !== b.group) return compareTextValue(a.group, b.group);

  const aRoute = routeSortParts(a.route);
  const bRoute = routeSortParts(b.route);
  if (aRoute.missing !== bRoute.missing) return aRoute.missing - bRoute.missing;

  const areaCompare = compareTextValue(aRoute.area, bRoute.area);
  if (areaCompare) return areaCompare;

  const codeCompare = compareTextValue(aRoute.code, bRoute.code);
  if (codeCompare) return codeCompare;

  if (storeOrderValue(a) !== storeOrderValue(b)) return storeOrderValue(a) - storeOrderValue(b);
  return compareTextValue(a.storeCode, b.storeCode);
}

function padIdeographic(text, length) {
  const value = String(text || "");
  return value.length >= length ? value : value + "\u3000".repeat(length - value.length);
}

function storeOptionLabel(store) {
  const group = String(store.group || "");
  const storeName = padIdeographic(store.storeName, 5);
  const storeCodeRaw = String(store.storeCode || store.sheet || "");
  const storeCode = /^\d+$/.test(storeCodeRaw) ? storeCodeRaw.padStart(6, "0") : storeCodeRaw;
  return `${group} - ${storeName} - ${storeCode}`;
}

function normalizedStoreRoute(store) {
  return String(storeRouteValue(store) || store?.route || "").trim();
}

function storeRouteList() {
  return Array.from(new Set(storePages.map((item) => normalizedStoreRoute(item)).filter(Boolean)))
    .sort(compareTextValue);
}

function storeRouteColorStyle(store, routeList = storeRouteList()) {
  const route = normalizedStoreRoute(store);
  if (!route) return "";
  const index = routeList.indexOf(route);
  if (index < 0) return "";
  const hue = (index * 37 + 42) % 360;
  return `background-color: hsl(${hue}, 70%, 92%); color: #18201b;`;
}

function storeMatchesQuery(store, query) {
  if (!query) return true;
  const haystack = [store.group, store.storeName, store.storeCode, store.sheet, store.route].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function currentInventory() {
  return data.inventory.filter((row) => {
    if (state.group && row.group !== state.group) return false;
    return includes(row, state.search);
  });
}

function selectedStore() {
  return storePages.find((store) => store.key === state.selectedStoreKey) || storePages[0];
}

function storeRecordKey(record) {
  if (!record) return "";
  return String(record.key || `${record.group || ""}:${record.sheet || record.storeSheet || record.storeName || ""}`);
}

function hasStoredRoute(storeKey) {
  return Object.prototype.hasOwnProperty.call(storeRoutes, storeKey);
}

function storeRouteValue(store) {
  const storeKey = storeRecordKey(store);
  if (!storeKey) return "";
  if (hasStoredRoute(storeKey)) return storeRoutes[storeKey] || "";
  return "";
}

function applyStoreRoutesToRecords(records) {
  (records || []).forEach((record) => {
    const route = storeRouteValue(record);
    record.route = route;
  });
}

function applyStoreRoutesToData() {
  applyStoreRoutesToRecords(data?.stores);
  applyStoreRoutesToRecords(data?.inventory);
  applyStoreRoutesToRecords(data?.lowStock);
  applyStoreRoutesToRecords(data?.storePages);
  applyStoreRoutesToRecords(baseStorePages);
  applyStoreRoutesToRecords(storePages);
}

function setStoreRouteValue(store, route) {
  const storeKey = storeRecordKey(store);
  if (!storeKey) return;
  storeRoutes[storeKey] = route;
  [data?.stores, data?.inventory, data?.lowStock, data?.storePages, baseStorePages, storePages].forEach((records) => {
    (records || []).forEach((record) => {
      if (storeRecordKey(record) === storeKey) record.route = route;
    });
  });
}

function setStoreNameValue(store, storeName) {
  const storeKey = storeRecordKey(store);
  const nextName = String(storeName || "").trim();
  if (!storeKey || !nextName) return;
  [data?.stores, data?.inventory, data?.lowStock, data?.storePages, baseStorePages, storePages].forEach((records) => {
    (records || []).forEach((record) => {
      if (storeRecordKey(record) === storeKey) record.storeName = nextName;
    });
  });
}

function storeNoteValue(store) {
  return storeNotes[store.key] || "";
}

function bindStoreName(store) {
  const input = byId("storeNameInput");
  if (!input) return;
  const title = byId("storeNameTitleText");
  const status = byId("storeNameStatus");
  let savedName = String(store.storeName || "").trim();
  let saveTimer = null;
  let saving = false;
  const setStatus = (text, isError = false) => {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("is-error", Boolean(isError));
  };
  const applyName = (name) => {
    setStoreNameValue(store, name);
    if (title) title.textContent = name;
    populateStoreControls();
    syncStoreHash();
  };
  const commit = async () => {
    if (saveTimer) {
      window.clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (saving) return;
    const nextName = String(input.value || "").trim();
    if (!nextName) {
      input.value = savedName;
      applyName(savedName);
      setStatus("名稱不可空白", true);
      return;
    }
    if (nextName === savedName) {
      input.value = savedName;
      setStatus("");
      return;
    }
    input.disabled = true;
    saving = true;
    setStatus("保存中...");
    try {
      const result = await saveStoreName(store.key, nextName);
      data = result.appData || data;
      rebuildDerivedState({ applyInitialHash: false });
      savedName = String(result.store?.storeName || nextName).trim();
      input.value = savedName;
      applyName(savedName);
      setStatus("已保存");
      window.setTimeout(() => {
        if (status?.textContent === "已保存") setStatus("");
      }, 1200);
    } catch (error) {
      input.value = savedName;
      applyName(savedName);
      setStatus(error.message, true);
      alert(`門市名稱保存失敗：${error.message}`);
    } finally {
      input.disabled = false;
      saving = false;
    }
  };
  input.addEventListener("input", (event) => {
    const nextName = String(event.target.value || "").trim();
    if (title) title.textContent = nextName || savedName;
    setStatus("");
    if (saveTimer) window.clearTimeout(saveTimer);
    if (nextName && nextName !== savedName) {
      saveTimer = window.setTimeout(commit, 600);
    }
  });
  input.addEventListener("change", commit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    }
    if (event.key === "Escape") {
      input.value = savedName;
      applyName(savedName);
      setStatus("");
    }
  });
}

function bindStoreNote(store) {
  const input = byId("storeNoteInput");
  if (!input) return;
  let timer = null;
  input.addEventListener("input", (event) => {
    storeNotes[store.key] = event.target.value;
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      saveStoreNote(store.key, event.target.value).catch((error) => console.error(error));
    }, 300);
  });
}

function bindStoreRoute(store) {
  const input = byId("storeRouteInput");
  if (!input) return;
  let timer = null;
  input.addEventListener("input", (event) => {
    setStoreRouteValue(store, event.target.value);
    populateStoreControls();
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      saveStoreRoute(store.key, event.target.value).catch((error) => console.error(error));
    }, 300);
  });
}

function storeTitleMarkup(store, includeSaveActions = false) {
  return `<div class="sales-title-row">
    <div class="store-title-main">
      <h2><span id="storeNameTitleText">${escapeHtml(store.storeName)}</span> <span class="subtle">(${escapeHtml(store.group)} 檔 / ${escapeHtml(store.storeCode || store.sheet)})</span></h2>
      <div class="store-meta-inputs">
        <input id="storeNameInput" class="store-name-input" type="text" aria-label="門市名稱" placeholder="門市名稱" value="${escapeAttribute(store.storeName)}" />
        <span id="storeNameStatus" class="store-name-status" aria-live="polite"></span>
        <input id="storeNoteInput" class="store-note-input" type="text" placeholder="門市註記" value="${escapeAttribute(storeNoteValue(store))}" />
        <input id="storeRouteInput" class="store-route-input" type="text" placeholder="路線" value="${escapeAttribute(storeRouteValue(store))}" />
      </div>
    </div>
    ${
      includeSaveActions
        ? `<div class="sales-save-actions">
            <span id="saveStatus" class="date-pill">到貨未變更</span>
            <button id="saveShipmentsBtn" type="button">保存</button>
          </div>`
        : ""
    }
  </div>`;
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function uniqueStrings(items) {
  return [...new Set((Array.isArray(items) ? items : []).map((item) => String(item)).filter(Boolean))];
}

function replaceObjectContents(target, source) {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, source || {});
}

function normalizeHarvestMessage(message) {
  if (!message || typeof message !== "object") return null;
  const id = Number(message.id);
  const harvestDateValue = String(message.harvestDate || "");
  const text = String(message.message || "").trim();
  if (!Number.isFinite(id) || !harvestDateValue || !text) return null;
  return {
    id,
    harvestDate: harvestDateValue,
    message: text,
    createdAt: String(message.createdAt || ""),
  };
}

function normalizeHarvestMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .map(normalizeHarvestMessage)
    .filter(Boolean);
}

function harvestMessagesLoaded(date = harvestDate()) {
  return Object.prototype.hasOwnProperty.call(harvestMessagesByDate, date);
}

function harvestMessagesForDate(date = harvestDate()) {
  return harvestMessagesByDate[date] || [];
}

function setHarvestMessagesForDate(date, messages) {
  const byId = new Map();
  normalizeHarvestMessages(messages).forEach((message) => byId.set(message.id, message));
  harvestMessagesForDate(date).forEach((message) => {
    if (!byId.has(message.id)) byId.set(message.id, message);
  });
  harvestMessagesByDate[date] = [...byId.values()].sort((a, b) => a.id - b.id);
  if (date === harvestDate()) updateHarvestMessageTabBadge(date);
}

function harvestMessageTabBadgeText(count) {
  if (count > 99) return "99+";
  return String(count);
}

function updateHarvestMessageTabBadge(date = harvestDate()) {
  const button = document.querySelector("[data-harvest-view='messageBoard']");
  const badge = byId("harvestMessageTabBadge");
  if (!button || !badge) return;
  const count = date && harvestMessagesLoaded(date) ? harvestMessagesForDate(date).length : 0;
  const hasMessages = count > 0;
  badge.textContent = hasMessages ? harvestMessageTabBadgeText(count) : "";
  badge.hidden = !hasMessages;
  button.classList.toggle("has-message-badge", hasMessages);
  button.setAttribute("aria-label", hasMessages ? `留言板，${count} 則留言` : "留言板");
}

function ensureHarvestMessageBadgeForDate(date = harvestDate()) {
  if (!date || harvestMessagesLoaded(date)) {
    updateHarvestMessageTabBadge(date);
    return;
  }
  ensureHarvestMessagesForDate(date)
    .then(() => {
      if (harvestDate() === date) updateHarvestMessageTabBadge(date);
    })
    .catch((error) => {
      console.warn("Harvest message badge load failed.", error);
    });
}

const isoDateTimeWithoutZonePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

function parseTaipeiTimestamp(value) {
  const text = String(value || "");
  if (!text) return null;
  const normalized = isoDateTimeWithoutZonePattern.test(text) ? `${text}+08:00` : text;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTaipeiMonthDayTime(value) {
  const date = parseTaipeiTimestamp(value);
  if (!date) return String(value || "").replace("T", " ");
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatHarvestMessageTime(createdAt) {
  return formatTaipeiMonthDayTime(createdAt);
}

function normalizeFieldWorkMessage(message) {
  if (!message || typeof message !== "object") return null;
  const id = Number(message.id);
  const workDateValue = String(message.workDate || "");
  const text = String(message.message || "").trim();
  const photos = normalizeFieldWorkMessagePhotos(message.photos);
  if (!Number.isFinite(id) || !workDateValue || (!text && !photos.length)) return null;
  return {
    id,
    workDate: workDateValue,
    zoneName: String(message.zoneName || ""),
    netHouseCode: String(message.netHouseCode || ""),
    message: text,
    createdAt: String(message.createdAt || ""),
    photos,
  };
}

function normalizeFieldWorkMessagePhotos(photos) {
  return (Array.isArray(photos) ? photos : [])
    .map((photo) => {
      if (!photo || typeof photo !== "object") return null;
      const urlPath = String(photo.urlPath || "").trim();
      if (!urlPath) return null;
      const id = Number(photo.id);
      return {
        id: Number.isFinite(id) ? id : 0,
        urlPath,
        originalName: String(photo.originalName || ""),
        contentType: String(photo.contentType || ""),
      };
    })
    .filter(Boolean);
}

function normalizeFieldWorkMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .map(normalizeFieldWorkMessage)
    .filter(Boolean);
}

function fieldWorkMessageScope() {
  if (!state.fieldWorkDate) state.fieldWorkDate = todayDate();
  if (!state.fieldWorkZoneName || !state.fieldWorkNetHouseCode) {
    fieldWorkSelection();
  }
  return {
    date: state.fieldWorkDate || todayDate(),
    zoneName: state.fieldWorkZoneName || "",
    netHouseCode: state.fieldWorkNetHouseCode || "",
  };
}

function fieldWorkMessageScopeKey(scope = fieldWorkMessageScope()) {
  return scope.zoneName && scope.netHouseCode
    ? `${scope.zoneName}|${scope.netHouseCode}`
    : fieldWorkMessageAllKey;
}

function fieldWorkMessageScopeLabel(scope = fieldWorkMessageScope()) {
  return scope.zoneName && scope.netHouseCode ? `${scope.zoneName} / ${scope.netHouseCode}` : t("fieldWork.chooseNetHouse");
}

function fieldWorkMessagesLoaded(key = fieldWorkMessageScopeKey()) {
  return Object.prototype.hasOwnProperty.call(fieldWorkMessagesByDate, key);
}

function fieldWorkMessagesForDate(key = fieldWorkMessageScopeKey()) {
  return fieldWorkMessagesByDate[key] || [];
}

function setFieldWorkMessagesForDate(key, messages) {
  const byId = new Map();
  normalizeFieldWorkMessages(messages).forEach((message) => byId.set(message.id, message));
  fieldWorkMessagesForDate(key).forEach((message) => {
    if (!byId.has(message.id)) byId.set(message.id, message);
  });
  fieldWorkMessagesByDate[key] = [...byId.values()].sort((a, b) =>
    String(b.workDate || "").localeCompare(String(a.workDate || "")) || b.id - a.id,
  );
}

function formatFieldWorkMessageMeta(message) {
  const workDate = String(message?.workDate || "");
  const date = new Date(`${workDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return workDate;
  return new Intl.DateTimeFormat(fieldWorkDateLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function cityDate() {
  return harvestDate();
}

function cityRowKey(row) {
  return row?.type === "subtotal" ? "subtotal" : `row:${row?.rowIndex}`;
}

function normalizeCityTableEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowedColumns = new Set(cityInputColumns.map((column) => column.key));
  const normalized = {};
  Object.entries(value).forEach(([date, rows]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !rows || typeof rows !== "object" || Array.isArray(rows)) return;
    Object.entries(rows).forEach(([rowKey, columns]) => {
      if (!/^row:\d+$/.test(rowKey) || !columns || typeof columns !== "object" || Array.isArray(columns)) return;
      Object.entries(columns).forEach(([columnKey, quantity]) => {
        if (!allowedColumns.has(columnKey)) return;
        const numeric = Number(quantity);
        if (!Number.isFinite(numeric) || numeric <= 0) return;
        normalized[date] ||= {};
        normalized[date][rowKey] ||= {};
        normalized[date][rowKey][columnKey] = numeric;
      });
    });
  });
  return normalized;
}

function cloneCityEntries(entries) {
  return normalizeCityTableEntries(JSON.parse(JSON.stringify(entries || {})));
}

function cityEntryValue(entries, date, rowKey, columnKey) {
  return n(entries?.[date]?.[rowKey]?.[columnKey]);
}

function normalizeCityInputValue(rawValue) {
  const cleaned = String(rawValue ?? "").replace(/[^\d.]/g, "");
  const [whole, ...decimals] = cleaned.split(".");
  return decimals.length ? `${whole}.${decimals.join("")}` : whole;
}

function setDraftCityEntry(date, rowKey, columnKey, rawValue) {
  const normalizedRawValue = normalizeCityInputValue(rawValue);
  const value = normalizedRawValue === "" ? "" : Number(normalizedRawValue);
  draftCityEntries[date] ||= {};
  draftCityEntries[date][rowKey] ||= {};
  if (value === "" || !Number.isFinite(value) || value <= 0) {
    delete draftCityEntries[date][rowKey][columnKey];
  } else {
    draftCityEntries[date][rowKey][columnKey] = value;
  }
  if (!Object.keys(draftCityEntries[date][rowKey]).length) delete draftCityEntries[date][rowKey];
  if (!Object.keys(draftCityEntries[date]).length) delete draftCityEntries[date];
}

function yfyDate() {
  return harvestDate();
}

function yfyRowKey(row) {
  return cityRowKey(row);
}

function normalizeYfyTableEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowedColumns = new Set(yfyInputColumns.map((column) => column.key));
  const normalized = {};
  Object.entries(value).forEach(([date, rows]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !rows || typeof rows !== "object" || Array.isArray(rows)) return;
    Object.entries(rows).forEach(([rowKey, columns]) => {
      if (!/^row:\d+$/.test(rowKey) || !columns || typeof columns !== "object" || Array.isArray(columns)) return;
      Object.entries(columns).forEach(([columnKey, quantity]) => {
        if (!allowedColumns.has(columnKey)) return;
        const numeric = Number(quantity);
        if (!Number.isFinite(numeric) || numeric <= 0) return;
        normalized[date] ||= {};
        normalized[date][rowKey] ||= {};
        normalized[date][rowKey][columnKey] = numeric;
      });
    });
  });
  return normalized;
}

function cloneYfyEntries(entries) {
  return normalizeYfyTableEntries(JSON.parse(JSON.stringify(entries || {})));
}

function yfyEntryValue(entries, date, rowKey, columnKey) {
  return n(entries?.[date]?.[rowKey]?.[columnKey]);
}

function setDraftYfyEntry(date, rowKey, columnKey, rawValue) {
  const normalizedRawValue = normalizeCityInputValue(rawValue);
  const value = normalizedRawValue === "" ? "" : Number(normalizedRawValue);
  draftYfyEntries[date] ||= {};
  draftYfyEntries[date][rowKey] ||= {};
  if (value === "" || !Number.isFinite(value) || value <= 0) {
    delete draftYfyEntries[date][rowKey][columnKey];
  } else {
    draftYfyEntries[date][rowKey][columnKey] = value;
  }
  if (!Object.keys(draftYfyEntries[date][rowKey]).length) delete draftYfyEntries[date][rowKey];
  if (!Object.keys(draftYfyEntries[date]).length) delete draftYfyEntries[date];
}

function normalizeYfyShipmentTimes(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([date, time]) => [String(date), String(time || "").trim()])
      .filter(([date, time]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)),
  );
}

function cloneYfyShipmentTimes(times) {
  return normalizeYfyShipmentTimes({ ...(times || {}) });
}

function setDraftYfyShipmentTime(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return;
  const normalized = String(time || "").trim();
  if (!normalized) {
    delete draftYfyShipmentTimes[date];
    return;
  }
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(normalized)) {
    draftYfyShipmentTimes[date] = normalized;
  }
}

function looseVegetableDate() {
  return harvestDate();
}

function looseVegetableRowKey(row) {
  return cityRowKey(row);
}

function looseVegetableColumnKey() {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `col_${Date.now().toString(36)}_${randomPart}`;
}

function normalizeLooseVegetableColumns(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const normalized = [];
  value.forEach((column) => {
    if (!column || typeof column !== "object") return;
    const key = String(column.key || "").trim();
    const label = String(column.label || "").trim();
    if (!/^[A-Za-z0-9_-]{1,48}$/.test(key) || !label || seen.has(key)) return;
    normalized.push({ key, label: label.slice(0, 24) });
    seen.add(key);
  });
  return normalized;
}

function normalizeLooseVegetableColumnsByDate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([date, columns]) => [/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "", normalizeLooseVegetableColumns(columns)])
      .filter(([date, columns]) => date && columns.length),
  );
}

function cloneLooseVegetableColumnsByDate(value) {
  return normalizeLooseVegetableColumnsByDate(JSON.parse(JSON.stringify(value || {})));
}

function looseVegetableColumnsForDate(columns, date = looseVegetableDate()) {
  if (Array.isArray(columns)) return normalizeLooseVegetableColumns(columns);
  if (!columns || typeof columns !== "object") return [];
  return normalizeLooseVegetableColumns(columns[date]);
}

function looseVegetableActiveSavedColumns(date = looseVegetableDate()) {
  return looseVegetableColumnsForDate(savedLooseVegetableColumnsByDate, date);
}

function looseVegetableActiveDraftColumns(date = looseVegetableDate()) {
  return looseVegetableColumnsForDate(draftLooseVegetableColumnsByDate, date);
}

function setDraftLooseVegetableColumnsForDate(date, columns) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return;
  const normalized = normalizeLooseVegetableColumns(columns);
  if (normalized.length) {
    draftLooseVegetableColumnsByDate[date] = normalized;
  } else {
    delete draftLooseVegetableColumnsByDate[date];
  }
}

function migrateLooseVegetableColumnsByDate(rawColumnsByDate, legacyColumns, entries) {
  const columnsByDate = normalizeLooseVegetableColumnsByDate(rawColumnsByDate);
  const legacy = normalizeLooseVegetableColumns(legacyColumns);
  if (!legacy.length) return columnsByDate;
  const entryDates = Object.keys(entries || {}).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
  const dates = entryDates.length ? entryDates : [looseVegetableDate()];
  dates.forEach((date) => {
    if (!columnsByDate[date]?.length) columnsByDate[date] = cloneLooseVegetableColumns(legacy);
  });
  return columnsByDate;
}

function normalizeLooseVegetableEntries(value, columns = draftLooseVegetableColumnsByDate) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const normalized = {};
  Object.entries(value).forEach(([date, rows]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !rows || typeof rows !== "object" || Array.isArray(rows)) return;
    const allowedColumns = new Set(looseVegetableColumnsForDate(columns, date).map((column) => column.key));
    if (!allowedColumns.size) return;
    Object.entries(rows).forEach(([rowKey, rowColumns]) => {
      if (!/^row:\d+$/.test(rowKey) || !rowColumns || typeof rowColumns !== "object" || Array.isArray(rowColumns)) return;
      Object.entries(rowColumns).forEach(([columnKey, quantity]) => {
        if (!allowedColumns.has(columnKey)) return;
        const numeric = Number(quantity);
        if (!Number.isFinite(numeric) || numeric <= 0) return;
        normalized[date] ||= {};
        normalized[date][rowKey] ||= {};
        normalized[date][rowKey][columnKey] = numeric;
      });
    });
  });
  return normalized;
}

function cloneLooseVegetableColumns(columns) {
  return normalizeLooseVegetableColumns(JSON.parse(JSON.stringify(columns || [])));
}

function cloneLooseVegetableEntries(entries, columns = draftLooseVegetableColumnsByDate) {
  return normalizeLooseVegetableEntries(JSON.parse(JSON.stringify(entries || {})), columns);
}

function looseVegetableEntryValue(entries, date, rowKey, columnKey) {
  return n(entries?.[date]?.[rowKey]?.[columnKey]);
}

function setDraftLooseVegetableEntry(date, rowKey, columnKey, rawValue) {
  const normalizedRawValue = normalizeCityInputValue(rawValue);
  const value = normalizedRawValue === "" ? "" : Number(normalizedRawValue);
  draftLooseVegetableEntries[date] ||= {};
  draftLooseVegetableEntries[date][rowKey] ||= {};
  if (value === "" || !Number.isFinite(value) || value <= 0) {
    delete draftLooseVegetableEntries[date][rowKey][columnKey];
  } else {
    draftLooseVegetableEntries[date][rowKey][columnKey] = value;
  }
  if (!Object.keys(draftLooseVegetableEntries[date][rowKey]).length) delete draftLooseVegetableEntries[date][rowKey];
  if (!Object.keys(draftLooseVegetableEntries[date]).length) delete draftLooseVegetableEntries[date];
}

function pruneLooseVegetableEntriesForColumns(entries, columns) {
  return normalizeLooseVegetableEntries(entries, columns);
}

function generalChannelDate() {
  return harvestDate();
}

function generalChannelRowKey(row) {
  return cityRowKey(row);
}

function generalChannelColumnKey() {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `col_${Date.now().toString(36)}_${randomPart}`;
}

function generalChannelColumnPresetForLabel(label) {
  return generalChannelColumnPresets.find((preset) => preset.label === label) || null;
}

function generalChannelColumnSource(label, source = "") {
  const normalizedSource = String(source || "").trim();
  if (normalizedSource === generalChannelPuqianTotalSource) return normalizedSource;
  return generalChannelColumnPresetForLabel(label)?.source || "";
}

function isGeneralChannelComputedColumn(column) {
  return generalChannelColumnSource(column?.label, column?.source) === generalChannelPuqianTotalSource;
}

function normalizeGeneralChannelColumns(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const normalized = [];
  value.forEach((column) => {
    if (!column || typeof column !== "object") return;
    const key = String(column.key || "").trim();
    const label = String(column.label || "").trim();
    if (!/^[A-Za-z0-9_-]{1,48}$/.test(key) || !label || seen.has(key)) return;
    const normalizedLabel = label.slice(0, 24);
    const source = generalChannelColumnSource(normalizedLabel, column.source);
    normalized.push(source ? { key, label: normalizedLabel, source } : { key, label: normalizedLabel });
    seen.add(key);
  });
  return normalized;
}

function normalizeGeneralChannelColumnsByDate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([date, columns]) => [/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "", normalizeGeneralChannelColumns(columns)])
      .filter(([date, columns]) => date && columns.length),
  );
}

function cloneGeneralChannelColumnsByDate(value) {
  return normalizeGeneralChannelColumnsByDate(JSON.parse(JSON.stringify(value || {})));
}

function generalChannelColumnsForDate(columns, date = generalChannelDate()) {
  if (Array.isArray(columns)) return normalizeGeneralChannelColumns(columns);
  if (!columns || typeof columns !== "object") return [];
  return normalizeGeneralChannelColumns(columns[date]);
}

function generalChannelActiveSavedColumns(date = generalChannelDate()) {
  return generalChannelColumnsForDate(savedGeneralChannelColumnsByDate, date);
}

function generalChannelActiveDraftColumns(date = generalChannelDate()) {
  return generalChannelColumnsForDate(draftGeneralChannelColumnsByDate, date);
}

function setDraftGeneralChannelColumnsForDate(date, columns) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return;
  const normalized = normalizeGeneralChannelColumns(columns);
  if (normalized.length) {
    draftGeneralChannelColumnsByDate[date] = normalized;
  } else {
    delete draftGeneralChannelColumnsByDate[date];
  }
}

function migrateGeneralChannelColumnsByDate(rawColumnsByDate, legacyColumns, entries) {
  const columnsByDate = normalizeGeneralChannelColumnsByDate(rawColumnsByDate);
  const legacy = normalizeGeneralChannelColumns(legacyColumns);
  if (!legacy.length) return columnsByDate;
  const entryDates = Object.keys(entries || {}).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
  const dates = entryDates.length ? entryDates : [generalChannelDate()];
  dates.forEach((date) => {
    if (!columnsByDate[date]?.length) columnsByDate[date] = cloneGeneralChannelColumns(legacy);
  });
  return columnsByDate;
}

function normalizeGeneralChannelEntries(value, columns = draftGeneralChannelColumns) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const normalized = {};
  Object.entries(value).forEach(([date, rows]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !rows || typeof rows !== "object" || Array.isArray(rows)) return;
    const allowedColumns = new Set(
      generalChannelColumnsForDate(columns, date)
        .filter((column) => !isGeneralChannelComputedColumn(column))
        .map((column) => column.key),
    );
    Object.entries(rows).forEach(([rowKey, rowColumns]) => {
      if (!/^row:\d+$/.test(rowKey) || !rowColumns || typeof rowColumns !== "object" || Array.isArray(rowColumns)) return;
      Object.entries(rowColumns).forEach(([columnKey, quantity]) => {
        if (!allowedColumns.has(columnKey)) return;
        const numeric = Number(quantity);
        if (!Number.isFinite(numeric) || numeric <= 0) return;
        normalized[date] ||= {};
        normalized[date][rowKey] ||= {};
        normalized[date][rowKey][columnKey] = numeric;
      });
    });
  });
  return normalized;
}

function cloneGeneralChannelColumns(columns) {
  return normalizeGeneralChannelColumns(JSON.parse(JSON.stringify(columns || [])));
}

function cloneGeneralChannelEntries(entries, columns = draftGeneralChannelColumnsByDate) {
  return normalizeGeneralChannelEntries(JSON.parse(JSON.stringify(entries || {})), columns);
}

function generalChannelEntryValue(entries, date, rowKey, columnKey) {
  return n(entries?.[date]?.[rowKey]?.[columnKey]);
}

function generalChannelColumnValue(
  column,
  row,
  date,
  entries = draftGeneralChannelEntries,
  puqianEntries = draftGeneralChannelPuqianEntries,
) {
  if (isGeneralChannelComputedColumn(column)) return generalChannelPuqianRowTotal(row, date, puqianEntries);
  return generalChannelEntryValue(entries, date, generalChannelRowKey(row), column.key);
}

function setDraftGeneralChannelEntry(date, rowKey, columnKey, rawValue) {
  const normalizedRawValue = normalizeCityInputValue(rawValue);
  const value = normalizedRawValue === "" ? "" : Number(normalizedRawValue);
  draftGeneralChannelEntries[date] ||= {};
  draftGeneralChannelEntries[date][rowKey] ||= {};
  if (value === "" || !Number.isFinite(value) || value <= 0) {
    delete draftGeneralChannelEntries[date][rowKey][columnKey];
  } else {
    draftGeneralChannelEntries[date][rowKey][columnKey] = value;
  }
  if (!Object.keys(draftGeneralChannelEntries[date][rowKey]).length) delete draftGeneralChannelEntries[date][rowKey];
  if (!Object.keys(draftGeneralChannelEntries[date]).length) delete draftGeneralChannelEntries[date];
}

function pruneGeneralChannelEntriesForColumns(entries, columns) {
  return normalizeGeneralChannelEntries(entries, columns);
}

function normalizeGeneralChannelPuqianEntries(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowedColumns = new Set(generalChannelPuqianColumns.map((column) => column.key));
  const normalized = {};
  Object.entries(value).forEach(([date, rows]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !rows || typeof rows !== "object" || Array.isArray(rows)) return;
    Object.entries(rows).forEach(([rowKey, rowColumns]) => {
      if (!/^row:\d+$/.test(rowKey) || !rowColumns || typeof rowColumns !== "object" || Array.isArray(rowColumns)) return;
      Object.entries(rowColumns).forEach(([columnKey, quantity]) => {
        if (!allowedColumns.has(columnKey)) return;
        const numeric = Number(quantity);
        if (!Number.isFinite(numeric) || numeric <= 0) return;
        normalized[date] ||= {};
        normalized[date][rowKey] ||= {};
        normalized[date][rowKey][columnKey] = numeric;
      });
    });
  });
  return normalized;
}

function cloneGeneralChannelPuqianEntries(entries) {
  return normalizeGeneralChannelPuqianEntries(JSON.parse(JSON.stringify(entries || {})));
}

function generalChannelPuqianEntryValue(entries, date, rowKey, columnKey) {
  return n(entries?.[date]?.[rowKey]?.[columnKey]);
}

function setDraftGeneralChannelPuqianEntry(date, rowKey, columnKey, rawValue) {
  const normalizedRawValue = normalizeCityInputValue(rawValue);
  const value = normalizedRawValue === "" ? "" : Number(normalizedRawValue);
  draftGeneralChannelPuqianEntries[date] ||= {};
  draftGeneralChannelPuqianEntries[date][rowKey] ||= {};
  if (value === "" || !Number.isFinite(value) || value <= 0) {
    delete draftGeneralChannelPuqianEntries[date][rowKey][columnKey];
  } else {
    draftGeneralChannelPuqianEntries[date][rowKey][columnKey] = value;
  }
  if (!Object.keys(draftGeneralChannelPuqianEntries[date][rowKey]).length) delete draftGeneralChannelPuqianEntries[date][rowKey];
  if (!Object.keys(draftGeneralChannelPuqianEntries[date]).length) delete draftGeneralChannelPuqianEntries[date];
}

function productListWithWhiteRadish(products) {
  const list = Array.isArray(products) ? products : [];
  const withoutWhiteRadish = list.filter((product) => String(product?.productCode || "") !== whiteRadishProduct.productCode);
  const whiteRadish = list.find((product) => String(product?.productCode || "") === whiteRadishProduct.productCode) || whiteRadishProduct;
  const flowerIndex = withoutWhiteRadish.findIndex((product) => ["白花菜", "白花椰菜"].includes(String(product?.productName || "")));
  const garlicIndex = withoutWhiteRadish.findIndex((product) => String(product?.productName || "") === "青蒜");
  const insertIndex = flowerIndex >= 0
    ? flowerIndex + 1
    : garlicIndex >= 0 ? garlicIndex : withoutWhiteRadish.length;
  return [
    ...withoutWhiteRadish.slice(0, insertIndex),
    { ...whiteRadish, ...whiteRadishProduct },
    ...withoutWhiteRadish.slice(insertIndex),
  ];
}

function normalizeWhiteRadishHarvestTemplate(template) {
  if (!template || typeof template !== "object") return false;
  const products = Array.isArray(template.products) ? template.products : [];
  if (products.some((product) => String(product?.productName || "") === whiteRadishProduct.productName)) {
    template.maxRow = Math.max(Number(template.maxRow) || 0, 49);
    template.editableRows = (Array.isArray(template.editableRows) ? template.editableRows : []).map((range) => (
      Array.isArray(range) && range[0] === 42 && range[1] < 49 ? [42, 49] : range
    ));
    return false;
  }

  template.products = products.map((product) => {
    const rowIndex = Number(product?.rowIndex);
    return {
      ...product,
      rowIndex: Number.isInteger(rowIndex) && rowIndex >= whiteRadishHarvestRow ? rowIndex + 1 : product.rowIndex,
    };
  });
  const flowerIndex = template.products.findIndex((product) => String(product?.productName || "") === "白花菜");
  template.products.splice(flowerIndex >= 0 ? flowerIndex + 1 : template.products.length, 0, {
    rowIndex: whiteRadishHarvestRow,
    productName: whiteRadishProduct.productName,
  });

  const cells = Array.isArray(template.cells) ? template.cells : [];
  template.cells = cells.map((cell) => {
    const row = Number(cell?.row);
    if (!Number.isInteger(row) || row < whiteRadishHarvestRow) return { ...cell };
    return {
      ...cell,
      row: row + 1,
      address: `${cell.column || ""}${row + 1}`,
    };
  });
  const shiftedSourceCells = template.cells.filter((cell) => Number(cell?.row) === whiteRadishHarvestRow + 1);
  const sourceCols = shiftedSourceCells.length
    ? shiftedSourceCells.map((cell) => Number(cell.col)).filter((col) => Number.isInteger(col))
    : Array.from(
      { length: Math.max(0, Number(template.maxCol || 0) - Number(template.minCol || 2) + 1) },
      (_, index) => Number(template.minCol || 2) + index,
    );
  const existingKeys = new Set(template.cells.map((cell) => `${cell.row}:${cell.col}`));
  sourceCols.forEach((col) => {
    const key = `${whiteRadishHarvestRow}:${col}`;
    if (existingKeys.has(key)) return;
    const source = shiftedSourceCells.find((cell) => Number(cell.col) === col);
    const column = source?.column || columnLetterFromIndex(col);
    template.cells.push({
      row: whiteRadishHarvestRow,
      col,
      column,
      address: `${column}${whiteRadishHarvestRow}`,
      value: col === 2 ? whiteRadishProduct.productName : null,
      formula: null,
      isFormula: false,
    });
  });
  template.cells.sort((a, b) => Number(a.row) - Number(b.row) || Number(a.col) - Number(b.col));

  template.maxRow = Math.max(Number(template.maxRow) || 0, 49);
  template.range = typeof template.range === "string" ? template.range.replace(/48$/, "49") : template.range;
  template.editableRows = (Array.isArray(template.editableRows) ? template.editableRows : []).map((range) => (
    Array.isArray(range) && range[0] === 42 && range[1] === 48 ? [42, 49] : range
  ));
  template.hiddenRows = (Array.isArray(template.hiddenRows) ? template.hiddenRows : []).map((row) => (
    Number(row) >= whiteRadishHarvestRow ? Number(row) + 1 : row
  ));
  return true;
}

function normalizeWhiteRadishCropData(payload) {
  if (!payload || typeof payload !== "object") return;
  const appData = payload.appData || payload;
  appData.products = productListWithWhiteRadish(appData.products);
  (appData.storePages || []).forEach((store) => {
    store.products = productListWithWhiteRadish(store.products);
  });
  normalizeWhiteRadishHarvestTemplate(appData.harvestPlanningTemplate);
}

function productFilterDateKey() {
  return state.shipmentDate || todayDate();
}

function productFilterKey(product) {
  return String(product?.productCode || product?.key || "");
}

function allInventoryProductFilterKeys() {
  return uniqueStrings(allProducts.map(productFilterKey));
}

function allHarvestProductFilterKeys() {
  return uniqueStrings(allHarvestProducts.map(productFilterKey));
}

function pageUsesHarvestProductFilter(page = state.page) {
  return page === "harvestPlanning"
    || page === "city"
    || page === yfyPageKey
    || page === "looseVegetable"
    || page === "generalChannel";
}

function normalizeVisibleProductCodesByDate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([date, selected]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Array.isArray(selected))
      .map(([date, selected]) => [date, uniqueStrings(selected)]),
  );
}

function defaultVisibleProductCodesForDate() {
  return allInventoryProductFilterKeys();
}

function defaultVisibleHarvestProductKeysForDate() {
  return allHarvestProductFilterKeys();
}

function visibleProductCodesForDate(date = productFilterDateKey()) {
  const selected = visibleProductCodesByDate?.[date];
  return Array.isArray(selected) ? uniqueStrings(selected) : defaultVisibleProductCodesForDate();
}

function setVisibleProductCodesForDate(selectedKeys, date = productFilterDateKey()) {
  if (!date) return;
  visibleProductCodesByDate = {
    ...visibleProductCodesByDate,
    [date]: uniqueStrings(selectedKeys),
  };
}

function visibleHarvestProductKeysForDate(date = productFilterDateKey()) {
  const selected = visibleHarvestProductKeysByDate?.[date];
  return Array.isArray(selected) ? uniqueStrings(selected) : defaultVisibleHarvestProductKeysForDate();
}

function setVisibleHarvestProductKeysForDate(selectedKeys, date = productFilterDateKey()) {
  if (!date) return;
  visibleHarvestProductKeysByDate = {
    ...visibleHarvestProductKeysByDate,
    [date]: uniqueStrings(selectedKeys),
  };
}

function visibleProductSet() {
  return new Set(visibleProductCodesForDate());
}

function visibleHarvestProductSet() {
  return new Set(visibleHarvestProductKeysForDate());
}

function dailyVegetableProductByName(productName) {
  const normalizedName = normalizeProductName(dailyVegetableCanonicalCropName(productName));
  return allHarvestProducts.find((product) =>
    normalizeProductName(dailyVegetableCanonicalCropName(product.productName)) === normalizedName,
  ) || null;
}

function dailyVegetableEntryProductKey(productName) {
  const product = dailyVegetableProductByName(productName);
  return product ? productFilterKey(product) : `name:${dailyVegetableCropKey(productName)}`;
}

function dailyVegetableProducts() {
  const cilantroIndex = allHarvestProducts.findIndex((product) =>
    normalizeProductName(product.productName).includes("香菜"),
  );
  return cilantroIndex >= 0 ? allHarvestProducts.slice(0, cilantroIndex + 1) : allHarvestProducts;
}

function defaultVisibleDailyVegetableProductKeys() {
  return uniqueStrings(dailyVegetableProducts().map(productFilterKey));
}

function visibleDailyVegetableProductCodes() {
  return Array.isArray(visibleDailyVegetableProductKeys)
    ? uniqueStrings(visibleDailyVegetableProductKeys)
    : defaultVisibleDailyVegetableProductKeys();
}

function setVisibleDailyVegetableProductCodes(selectedKeys) {
  visibleDailyVegetableProductKeys = uniqueStrings(selectedKeys);
}

function visibleDailyVegetableProductSet() {
  return new Set(visibleDailyVegetableProductCodes());
}

function shipmentKey(store, productCode) {
  return `${store.key}|${salesArrivalInputDate()}|${productCode}`;
}

function stockAdjustmentKey(store, productCode) {
  return `${store.key}|${state.shipmentDate}|${productCode}`;
}

function enteredShipment(store, productCode) {
  return n(savedShipments[shipmentKey(store, productCode)]);
}

function savedShipmentAtDate(store, productCode, date) {
  return n(savedShipmentIndex.get(savedEntryIndexKey(store, productCode))?.get(date));
}

function savedShipmentDatesForProduct(store, productCode) {
  return [...(savedShipmentIndex.get(savedEntryIndexKey(store, productCode))?.keys() || [])];
}

function previousShipmentDatesForStore(store, products, beforeDate = state.shipmentDate, limit = 3) {
  const dates = new Set();
  (products || []).forEach((product) => {
    savedShipmentDatesForProduct(store, product.productCode).forEach((date) => {
      if (beforeDate && date >= beforeDate) return;
      if (!n(savedShipmentAtDate(store, product.productCode, date))) return;
      dates.add(date);
    });
  });
  const records = [...dates]
    .sort()
    .slice(-limit);
  return Array.from({ length: limit }, (_, index) => records[records.length - limit + index] || "");
}

function draftShipment(store, productCode) {
  return n(draftShipments[shipmentKey(store, productCode)]);
}

function draftStockAdjustment(store, productCode) {
  const key = stockAdjustmentKey(store, productCode);
  if (Object.prototype.hasOwnProperty.call(draftStockAdjustments, key)) return n(draftStockAdjustments[key]);
  return savedStockAdjustmentThroughDate(store, productCode);
}

function savedStockAdjustment(store, productCode) {
  return n(savedStockAdjustments[stockAdjustmentKey(store, productCode)]);
}

function setDraftShipment(store, productCode, value) {
  const key = shipmentKey(store, productCode);
  if (value === "" || Number(value) === 0) {
    delete draftShipments[key];
  } else {
    draftShipments[key] = Number(value);
  }
}

function setDraftStockAdjustment(store, productCode, value) {
  const key = stockAdjustmentKey(store, productCode);
  const normalized = signedNumberValue(value);
  draftStockAdjustments[key] = normalized === "" ? 0 : normalized;
}

function resetDraftShipments() {
  Object.keys(draftShipments).forEach((key) => delete draftShipments[key]);
  Object.assign(draftShipments, savedShipments);
  Object.keys(draftStockAdjustments).forEach((key) => delete draftStockAdjustments[key]);
  Object.assign(draftStockAdjustments, savedStockAdjustments);
  updateSaveStatus();
}

function hasUnsavedShipments() {
  return JSON.stringify(savedShipments) !== JSON.stringify(draftShipments)
    || JSON.stringify(savedStockAdjustments) !== JSON.stringify(draftStockAdjustments);
}

function updateSaveStatus() {
  const status = byId("saveStatus");
  if (status) status.textContent = hasUnsavedShipments() ? "到貨尚未保存" : "到貨已保存";
}

function hasUnsavedHarvestEntries() {
  return JSON.stringify(savedHarvestEntries) !== JSON.stringify(draftHarvestEntries)
    || JSON.stringify(savedHarvestCellPriorities) !== JSON.stringify(draftHarvestCellPriorities)
    || JSON.stringify(savedHarvestCellFormulas) !== JSON.stringify(draftHarvestCellFormulas);
}

function updateHarvestSaveStatus() {
  const status = byId("harvestSaveStatus");
  if (status) status.textContent = hasUnsavedHarvestEntries() ? "採收資料尚未保存" : "採收資料已保存";
}

function hasUnsavedCityEntries() {
  return JSON.stringify(savedCityEntries) !== JSON.stringify(draftCityEntries);
}

function updateCitySaveStatus() {
  const status = byId("citySaveStatus");
  if (status) status.textContent = hasUnsavedCityEntries() ? "City 尚未保存" : "City 已保存";
}

function hasUnsavedYfyEntries() {
  return JSON.stringify(savedYfyEntries) !== JSON.stringify(draftYfyEntries)
    || JSON.stringify(savedYfyShipmentTimes) !== JSON.stringify(draftYfyShipmentTimes);
}

function updateYfySaveStatus() {
  const status = byId("yfySaveStatus");
  if (status) status.textContent = hasUnsavedYfyEntries() ? "永豐餘尚未保存" : "永豐餘已保存";
}

function hasUnsavedLooseVegetableEntries() {
  return JSON.stringify(savedLooseVegetableColumnsByDate) !== JSON.stringify(draftLooseVegetableColumnsByDate)
    || JSON.stringify(savedLooseVegetableEntries) !== JSON.stringify(draftLooseVegetableEntries);
}

function updateLooseVegetableSaveStatus() {
  const status = byId("looseVegetableSaveStatus");
  if (status) status.textContent = hasUnsavedLooseVegetableEntries() ? "裸菜尚未保存" : "裸菜已保存";
}

function hasUnsavedGeneralChannelEntries() {
  return JSON.stringify(savedGeneralChannelColumnsByDate) !== JSON.stringify(draftGeneralChannelColumnsByDate)
    || JSON.stringify(savedGeneralChannelEntries) !== JSON.stringify(draftGeneralChannelEntries)
    || JSON.stringify(savedGeneralChannelPuqianEntries) !== JSON.stringify(draftGeneralChannelPuqianEntries);
}

function updateGeneralChannelSaveStatus() {
  const status = byId("generalChannelSaveStatus");
  if (status) status.textContent = hasUnsavedGeneralChannelEntries() ? "一般通路尚未保存" : "一般通路已保存";
}

function hasUnsavedPageInputs() {
  return hasUnsavedShipments()
    || hasUnsavedHarvestEntries()
    || hasUnsavedCityEntries()
    || hasUnsavedYfyEntries()
    || hasUnsavedLooseVegetableEntries()
    || hasUnsavedGeneralChannelEntries();
}

function unsavedChangesMessage() {
  return "目前有尚未保存的資料，確定要離開嗎？";
}

function discardUnsavedPageInputs() {
  resetDraftShipments();
  resetDraftHarvestEntries();
  resetDraftCityEntries();
  resetDraftYfyEntries();
  resetDraftLooseVegetableEntries();
  resetDraftGeneralChannelEntries();
}

function confirmDiscardUnsavedChanges() {
  if (!hasUnsavedPageInputs()) return true;
  if (!window.confirm(unsavedChangesMessage())) return false;
  discardUnsavedPageInputs();
  return true;
}

function resetDraftHarvestEntries() {
  Object.keys(draftHarvestEntries).forEach((key) => delete draftHarvestEntries[key]);
  Object.assign(draftHarvestEntries, savedHarvestEntries);
  Object.keys(draftHarvestCellPriorities).forEach((key) => delete draftHarvestCellPriorities[key]);
  Object.assign(draftHarvestCellPriorities, savedHarvestCellPriorities);
  Object.keys(draftHarvestCellFormulas).forEach((key) => delete draftHarvestCellFormulas[key]);
  Object.assign(draftHarvestCellFormulas, savedHarvestCellFormulas);
  updateHarvestSaveStatus();
}

function resetDraftCityEntries() {
  replaceObjectContents(draftCityEntries, cloneCityEntries(savedCityEntries));
  updateCitySaveStatus();
}

function resetDraftYfyEntries() {
  replaceObjectContents(draftYfyEntries, cloneYfyEntries(savedYfyEntries));
  replaceObjectContents(draftYfyShipmentTimes, cloneYfyShipmentTimes(savedYfyShipmentTimes));
  updateYfySaveStatus();
}

function resetDraftLooseVegetableEntries() {
  replaceObjectContents(draftLooseVegetableColumnsByDate, cloneLooseVegetableColumnsByDate(savedLooseVegetableColumnsByDate));
  savedLooseVegetableColumns = cloneLooseVegetableColumns(looseVegetableActiveSavedColumns());
  draftLooseVegetableColumns = cloneLooseVegetableColumns(looseVegetableActiveDraftColumns());
  replaceObjectContents(draftLooseVegetableEntries, cloneLooseVegetableEntries(savedLooseVegetableEntries, draftLooseVegetableColumnsByDate));
  updateLooseVegetableSaveStatus();
}

function resetDraftGeneralChannelEntries() {
  replaceObjectContents(draftGeneralChannelColumnsByDate, cloneGeneralChannelColumnsByDate(savedGeneralChannelColumnsByDate));
  savedGeneralChannelColumns = cloneGeneralChannelColumns(generalChannelActiveSavedColumns());
  draftGeneralChannelColumns = cloneGeneralChannelColumns(generalChannelActiveDraftColumns());
  replaceObjectContents(draftGeneralChannelEntries, cloneGeneralChannelEntries(savedGeneralChannelEntries, draftGeneralChannelColumnsByDate));
  replaceObjectContents(draftGeneralChannelPuqianEntries, cloneGeneralChannelPuqianEntries(savedGeneralChannelPuqianEntries));
  updateGeneralChannelSaveStatus();
}

function applyInventorySyncVersion(version) {
  if (version) inventoryRealtimeSync.version = String(version);
}

function canUseInventoryRealtimeSync() {
  return currentRole() === "root" || currentRole() === "inside";
}

function entryKeyFromServerEntry(entry) {
  return `${entry.storeKey}|${entry.shipmentDate}|${entry.productCode}`;
}

function entryMapFromServerEntries(entries, { includeZero = false } = {}) {
  const next = {};
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    const key = entryKeyFromServerEntry(entry);
    const quantity = n(entry.quantity);
    if (!includeZero && !quantity) return;
    next[key] = quantity;
  });
  return next;
}

function dirtyEntryKeys(saved, draft) {
  const keys = new Set([...Object.keys(saved), ...Object.keys(draft)]);
  return new Set([...keys].filter((key) => n(saved[key]) !== n(draft[key])));
}

function replaceSavedEntriesAndMergeDraft(saved, draft, entries, options = {}) {
  const dirtyKeys = dirtyEntryKeys(saved, draft);
  const nextSaved = entryMapFromServerEntries(entries, options);
  replaceObjectContents(saved, nextSaved);
  Object.keys(draft).forEach((key) => {
    if (!dirtyKeys.has(key)) delete draft[key];
  });
  Object.entries(nextSaved).forEach(([key, quantity]) => {
    if (!dirtyKeys.has(key)) draft[key] = quantity;
  });
}

function replaceSavedHarvestEntriesFromServer(entries) {
  Object.keys(savedHarvestEntries).forEach((key) => delete savedHarvestEntries[key]);
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    savedHarvestEntries[
      harvestEntryKey(entry.harvestDate, entry.sheetName, entry.rowIndex, entry.columnLetter)
    ] = n(entry.quantity);
  });
}

function replaceSavedHarvestPrioritiesFromServer(priorities) {
  replaceObjectContents(savedHarvestCellPriorities, normalizeHarvestCellPriorities(priorities));
}

function replaceSavedHarvestFormulasFromServer(formulas) {
  replaceObjectContents(savedHarvestCellFormulas, normalizeHarvestCellFormulas(formulas));
}

function inventoryInputIsActive() {
  const element = document.activeElement;
  return Boolean(element?.matches?.(".shipment-input, .stock-adjustment-input"));
}

function editableControlIsActive() {
  const element = document.activeElement;
  return Boolean(element?.matches?.("input, textarea, select, [contenteditable='true']"));
}

function updateSalesPageDerivedCells() {
  if (state.page !== "inventory" || state.view !== "salesPage") return;
  const store = selectedStore();
  if (!store) return;
  const totalProducts = store.products || [];
  const productsByCode = new Map(totalProducts.map((row) => [String(row.productCode || ""), row]));
  const harvestTotals = harvestRowTotalLookup(totalProducts);

  document.querySelectorAll("[data-remaining-allocation]").forEach((cell) => {
    const productCode = String(cell.dataset.remainingAllocation || "");
    const row = productsByCode.get(productCode);
    if (!row) return;
    const value = harvestTotalForSalesRow(row, harvestTotals);
    cell.innerHTML = inventoryBlankableNumberText(value);
  });

  let totalHarvestQty = 0;
  let totalInputQty = 0;
  let totalProjectedStock = 0;
  totalProducts.forEach((row, index) => {
    const productCode = String(row.productCode || "");
    const inputQty = draftShipment(store, productCode);
    const adjustedCurrentStock = currentStockForSalesRow(store, row);
    const projectedStock = adjustedCurrentStock + inputQty;
    totalHarvestQty += harvestTotalForSalesRow(row, harvestTotals, index);
    totalInputQty += inputQty;
    totalProjectedStock += projectedStock;

    document.querySelectorAll(".shipment-input").forEach((input) => {
      if (String(input.dataset.product || "") === productCode) {
        input.dataset.current = String(adjustedCurrentStock);
      }
    });
    document.querySelectorAll("[data-current-stock]").forEach((cell) => {
      if (String(cell.dataset.currentStock || "") === productCode) cell.innerHTML = stockText(adjustedCurrentStock);
    });
    document.querySelectorAll("[data-projected]").forEach((cell) => {
      if (String(cell.dataset.projected || "") === productCode) cell.innerHTML = stockText(projectedStock);
    });
  });

  const remainingTotalCell = document.querySelector("[data-sales-total-remaining-allocation]");
  if (remainingTotalCell) remainingTotalCell.innerHTML = inventoryBlankableNumberText(totalHarvestQty);
  const inputTotalCell = document.querySelector("[data-sales-total-input-qty]");
  if (inputTotalCell) inputTotalCell.innerHTML = inventoryAccountingText(totalInputQty);
  const projectedTotalCell = document.querySelector("[data-sales-total-projected-stock]");
  if (projectedTotalCell) projectedTotalCell.innerHTML = inventoryAccountingText(totalProjectedStock);
}

function refreshAfterInventoryRealtimeSync(changed) {
  if (!changed) return;
  updateSaveStatus();
  updateHarvestSaveStatus();
  updateCitySaveStatus();
  updateYfySaveStatus();
  updateLooseVegetableSaveStatus();
  updateGeneralChannelSaveStatus();
  if (state.page === "inventory" && state.view === "salesPage") {
    updateSalesPageDerivedCells();
    if (inventoryInputIsActive() || hasUnsavedShipments()) return;
  }
  if (editableControlIsActive() || hasUnsavedPageInputs()) return;
  render();
}

function applyInventoryRealtimePayload(payload) {
  applyInventorySyncVersion(payload?.version);
  if (!payload || payload.changed === false) return false;

  const preserveHarvestDraft = hasUnsavedHarvestEntries();
  const preserveCityDraft = hasUnsavedCityEntries();
  const preserveYfyDraft = hasUnsavedYfyEntries();
  const preserveLooseVegetableDraft = hasUnsavedLooseVegetableEntries();
  const preserveGeneralChannelDraft = hasUnsavedGeneralChannelEntries();

  replaceSavedEntriesAndMergeDraft(savedShipments, draftShipments, payload.shipmentEntries);
  rebuildSavedShipmentIndex();
  replaceSavedEntriesAndMergeDraft(savedStockAdjustments, draftStockAdjustments, payload.stockAdjustmentEntries, {
    includeZero: true,
  });
  rebuildSavedStockAdjustmentIndex();

  replaceSavedHarvestEntriesFromServer(payload.harvestEntries);
  replaceSavedHarvestPrioritiesFromServer(payload.harvestCellPriorities);
  replaceSavedHarvestFormulasFromServer(payload.harvestCellFormulas);
  harvestFieldExtraColumnsByDate = normalizeHarvestFieldExtraColumnsByDate(payload.harvestFieldExtraColumnsByDate);
  harvestConversionSettings = normalizeHarvestConversionSettings(payload.harvestConversionSettings);
  if (!preserveHarvestDraft) resetDraftHarvestEntries();

  replaceObjectContents(savedCityEntries, cloneCityEntries(payload.cityTableEntries));
  if (!preserveCityDraft) resetDraftCityEntries();

  replaceObjectContents(savedYfyEntries, cloneYfyEntries(payload.yfyTableEntries));
  replaceObjectContents(savedYfyShipmentTimes, cloneYfyShipmentTimes(payload.yfyShipmentTimes));
  if (!preserveYfyDraft) resetDraftYfyEntries();

  const looseVegetableColumnsByDate = migrateLooseVegetableColumnsByDate(
    payload.looseVegetableColumnsByDate,
    payload.looseVegetableColumns,
    payload.looseVegetableTableEntries,
  );
  replaceObjectContents(savedLooseVegetableColumnsByDate, looseVegetableColumnsByDate);
  savedLooseVegetableColumns = cloneLooseVegetableColumns(looseVegetableActiveSavedColumns());
  replaceObjectContents(
    savedLooseVegetableEntries,
    cloneLooseVegetableEntries(payload.looseVegetableTableEntries, savedLooseVegetableColumnsByDate),
  );
  if (!preserveLooseVegetableDraft) resetDraftLooseVegetableEntries();

  replaceObjectContents(
    savedGeneralChannelColumnsByDate,
    cloneGeneralChannelColumnsByDate(payload.generalChannelColumnsByDate),
  );
  if (!Object.keys(savedGeneralChannelColumnsByDate).length && Array.isArray(payload.generalChannelColumns)) {
    const date = generalChannelDate();
    const columns = cloneGeneralChannelColumns(payload.generalChannelColumns);
    if (columns.length && date) savedGeneralChannelColumnsByDate[date] = columns;
  }
  savedGeneralChannelColumns = cloneGeneralChannelColumns(generalChannelActiveSavedColumns());
  replaceObjectContents(
    savedGeneralChannelEntries,
    cloneGeneralChannelEntries(payload.generalChannelTableEntries, savedGeneralChannelColumnsByDate),
  );
  replaceObjectContents(
    savedGeneralChannelPuqianEntries,
    cloneGeneralChannelPuqianEntries(payload.generalChannelPuqianEntries),
  );
  if (!preserveGeneralChannelDraft) resetDraftGeneralChannelEntries();

  return true;
}

async function pollInventoryRealtimeSync() {
  if (!canUseInventoryRealtimeSync() || inventoryRealtimeSync.inFlight || document.hidden) return;
  inventoryRealtimeSync.inFlight = true;
  try {
    const query = inventoryRealtimeSync.version
      ? `?since=${encodeURIComponent(inventoryRealtimeSync.version)}`
      : "";
    const response = await fetch(`/api/inventory-sync${query}`);
    if (response.status === 401 || response.status === 403) {
      stopInventoryRealtimeSync();
      return;
    }
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "同步失敗");
    const changed = applyInventoryRealtimePayload(result);
    refreshAfterInventoryRealtimeSync(changed);
  } catch (error) {
    console.warn("Inventory realtime sync failed.", error);
  } finally {
    inventoryRealtimeSync.inFlight = false;
  }
}

function startInventoryRealtimeSync() {
  if (!canUseInventoryRealtimeSync() || inventoryRealtimeSync.timer) return;
  inventoryRealtimeSync.timer = window.setInterval(
    () => pollInventoryRealtimeSync(),
    inventoryRealtimeSync.intervalMs,
  );
}

function stopInventoryRealtimeSync() {
  if (inventoryRealtimeSync.timer) {
    window.clearInterval(inventoryRealtimeSync.timer);
    inventoryRealtimeSync.timer = null;
  }
  inventoryRealtimeSync.inFlight = false;
}

function saveDraftShipments() {
  persistDraftShipments().catch((error) => alert(`保存失敗：${error.message}`));
}

async function persistDraftShipments() {
  const store = selectedStore();
  if (!store || !state.shipmentDate) {
    throw new Error("缺少門市或到貨日期");
  }
  const shipmentDate = salesArrivalInputDate(state.shipmentDate);
  const shipmentPrefix = `${store.key}|${shipmentDate}|`;
  const adjustmentPrefix = `${store.key}|${state.shipmentDate}|`;
  const entries = Object.entries(draftShipments)
    .filter(([key]) => key.startsWith(shipmentPrefix))
    .map(([key, quantity]) => ({
      productCode: key.slice(shipmentPrefix.length),
      quantity: n(quantity),
    }));
  const adjustmentEntries = Object.entries(draftStockAdjustments)
    .filter(([key]) => key.startsWith(adjustmentPrefix))
    .map(([key, quantity]) => ({
      productCode: key.slice(adjustmentPrefix.length),
      quantity: n(quantity),
    }));
  const response = await fetch("/api/shipments", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storeKey: store.key, shipmentDate, entries }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "保存失敗");
  applyInventorySyncVersion(result.syncVersion);
  const adjustmentResponse = await fetch("/api/stock-adjustments", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storeKey: store.key, shipmentDate: state.shipmentDate, entries: adjustmentEntries }),
  });
  const adjustmentContentType = adjustmentResponse.headers.get("content-type") || "";
  if (!adjustmentContentType.includes("application/json")) {
    throw new Error("調整庫存 API 尚未啟用，請重啟後端服務");
  }
  const adjustmentResult = await adjustmentResponse.json();
  if (!adjustmentResponse.ok || !adjustmentResult.ok) throw new Error(adjustmentResult.error || "調整庫存保存失敗");
  applyInventorySyncVersion(adjustmentResult.syncVersion);
  Object.keys(savedShipments).forEach((key) => {
    if (key.startsWith(shipmentPrefix)) delete savedShipments[key];
  });
  entries.forEach((entry) => {
    if (n(entry.quantity)) savedShipments[`${store.key}|${shipmentDate}|${entry.productCode}`] = n(entry.quantity);
  });
  rebuildSavedShipmentIndex();
  Object.keys(savedStockAdjustments).forEach((key) => {
    if (key.startsWith(adjustmentPrefix)) delete savedStockAdjustments[key];
  });
  adjustmentEntries.forEach((entry) => {
    savedStockAdjustments[`${store.key}|${state.shipmentDate}|${entry.productCode}`] = n(entry.quantity);
  });
  rebuildSavedStockAdjustmentIndex();
  Object.keys(draftShipments).forEach((key) => {
    if (key.startsWith(shipmentPrefix)) delete draftShipments[key];
  });
  Object.assign(draftShipments, savedShipments);
  Object.keys(draftStockAdjustments).forEach((key) => {
    if (key.startsWith(adjustmentPrefix)) delete draftStockAdjustments[key];
  });
  Object.assign(draftStockAdjustments, savedStockAdjustments);
  invalidateFutureOpeningStockCache(state.shipmentDate, store);
  if (shipmentDate !== state.shipmentDate) invalidateFutureOpeningStockCache(shipmentDate, store);
  updateSaveStatus();
  render();
}

function saveDraftHarvestEntries() {
  persistDraftHarvestEntries().catch((error) => alert(`保存採收資料失敗：${error.message}`));
}

function clearDraftHarvestEntriesForColumn(date, sheetName, columnLetter) {
  const prefix = `${date}|${sheetName}|`;
  Object.keys(draftHarvestEntries).forEach((key) => {
    if (!key.startsWith(prefix)) return;
    if (key.split("|").at(-1) === columnLetter) delete draftHarvestEntries[key];
  });
  Object.keys(draftHarvestCellPriorities).forEach((key) => {
    if (!key.startsWith(prefix)) return;
    if (key.split("|").at(-1) === columnLetter) delete draftHarvestCellPriorities[key];
  });
}

async function persistDraftHarvestEntries() {
  const template = harvestTemplate();
  const date = harvestDate();
  if (!template || !date) throw new Error("缺少採收表或日期");
  const prefix = `${date}|${template.sheetName}|`;
  const cellMap = harvestCellMap();
  const entries = Object.entries(draftHarvestEntries)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, quantity]) => {
      const parts = key.split("|");
      const rowIndex = parts.at(-2);
      const columnLetter = parts.at(-1);
      const col = columnIndexFromLetter(columnLetter);
      const cell = cellMap.get(`${Number(rowIndex)}:${col}`);
      return {
        rowIndex: Number(rowIndex),
        columnLetter,
        productName: harvestProductName(Number(rowIndex)),
        quantity: n(quantity),
        editable: cell ? isHarvestEditableCell(cell) : false,
      };
    })
    .filter((entry) => entry.editable && n(entry.quantity));
  const usedPrioritiesByRow = new Map();
  const priorities = Object.entries(draftHarvestCellPriorities)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, priority]) => {
      const parts = key.split("|");
      const rowIndex = parts.at(-2);
      const columnLetter = parts.at(-1);
      const col = columnIndexFromLetter(columnLetter);
      const cell = cellMap.get(`${Number(rowIndex)}:${col}`);
      return {
        rowIndex: Number(rowIndex),
        columnLetter,
        priority: normalizeHarvestPriority(priority),
        priorityCell: cell ? isHarvestPriorityCell(cell) : false,
      };
    })
    .filter((entry) => {
      if (!entry.priorityCell || !entry.priority) return false;
      const usedPriorities = usedPrioritiesByRow.get(entry.rowIndex) || new Set();
      if (usedPriorities.has(entry.priority)) return false;
      usedPriorities.add(entry.priority);
      usedPrioritiesByRow.set(entry.rowIndex, usedPriorities);
      return true;
    });
  const formulas = Object.entries(draftHarvestCellFormulas)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, formula]) => {
      const parts = key.split("|");
      const rowIndex = parts.at(-2);
      const columnLetter = parts.at(-1);
      const col = columnIndexFromLetter(columnLetter);
      const cell = cellMap.get(`${Number(rowIndex)}:${col}`);
      return {
        rowIndex: Number(rowIndex),
        columnLetter,
        formula: String(formula || "").trim(),
        editable: cell ? isHarvestEditableCell(cell) : false,
      };
    })
    .filter((entry) => entry.editable && entry.formula);
  const response = await fetch("/api/harvest-entries", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ harvestDate: date, sheetName: template.sheetName, entries, priorities, formulas }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "保存失敗");
  applyInventorySyncVersion(result.syncVersion);
  Object.keys(savedHarvestEntries).forEach((key) => {
    if (key.startsWith(prefix)) delete savedHarvestEntries[key];
  });
  entries.forEach((entry) => {
    savedHarvestEntries[harvestEntryKey(date, template.sheetName, entry.rowIndex, entry.columnLetter)] = n(entry.quantity);
  });
  Object.keys(savedHarvestCellPriorities).forEach((key) => {
    if (key.startsWith(prefix)) delete savedHarvestCellPriorities[key];
  });
  priorities.forEach((entry) => {
    savedHarvestCellPriorities[
      harvestEntryKey(date, template.sheetName, entry.rowIndex, entry.columnLetter)
    ] = entry.priority;
  });
  Object.keys(savedHarvestCellFormulas).forEach((key) => {
    if (key.startsWith(prefix)) delete savedHarvestCellFormulas[key];
  });
  formulas.forEach((entry) => {
    savedHarvestCellFormulas[
      harvestEntryKey(date, template.sheetName, entry.rowIndex, entry.columnLetter)
    ] = entry.formula;
  });
  resetDraftHarvestEntries();
  render();
}

function saveDraftCityEntries() {
  persistDraftCityEntries().catch((error) => alert(`保存 City 失敗：${error.message}`));
}

async function persistDraftCityEntries() {
  const response = await fetch("/api/city-table-entries", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cityTableEntries: draftCityEntries }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "City 保存失敗");
  applyInventorySyncVersion(result.syncVersion);
  replaceObjectContents(savedCityEntries, cloneCityEntries(draftCityEntries));
  resetDraftCityEntries();
  render();
}

function saveDraftYfyEntries() {
  persistDraftYfyEntries().catch((error) => alert(`保存永豐餘失敗：${error.message}`));
}

async function persistDraftYfyEntries() {
  const response = await fetch("/api/yfy-table-entries", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      yfyTableEntries: draftYfyEntries,
      yfyShipmentTimes: draftYfyShipmentTimes,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "永豐餘保存失敗");
  applyInventorySyncVersion(result.syncVersion);
  replaceObjectContents(savedYfyEntries, cloneYfyEntries(draftYfyEntries));
  replaceObjectContents(savedYfyShipmentTimes, cloneYfyShipmentTimes(draftYfyShipmentTimes));
  resetDraftYfyEntries();
  render();
}

function saveDraftLooseVegetableEntries() {
  persistDraftLooseVegetableEntries().catch((error) => alert(`保存裸菜失敗：${error.message}`));
}

async function persistDraftLooseVegetableEntries() {
  const date = looseVegetableDate();
  setDraftLooseVegetableColumnsForDate(date, draftLooseVegetableColumns);
  const columns = cloneLooseVegetableColumns(draftLooseVegetableColumns);
  const columnsByDate = cloneLooseVegetableColumnsByDate(draftLooseVegetableColumnsByDate);
  const entries = cloneLooseVegetableEntries(draftLooseVegetableEntries, columnsByDate);
  const response = await fetch("/api/loose-vegetable-table", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      looseVegetableDate: date,
      looseVegetableColumns: columns,
      looseVegetableColumnsByDate: columnsByDate,
      looseVegetableTableEntries: entries,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "裸菜保存失敗");
  applyInventorySyncVersion(result.syncVersion);
  replaceObjectContents(savedLooseVegetableColumnsByDate, cloneLooseVegetableColumnsByDate(columnsByDate));
  savedLooseVegetableColumns = cloneLooseVegetableColumns(looseVegetableActiveSavedColumns());
  replaceObjectContents(savedLooseVegetableEntries, cloneLooseVegetableEntries(entries, savedLooseVegetableColumnsByDate));
  resetDraftLooseVegetableEntries();
  render();
}

function saveDraftGeneralChannelEntries() {
  persistDraftGeneralChannelEntries().catch((error) => alert(`保存一般通路失敗：${error.message}`));
}

async function persistDraftGeneralChannelEntries() {
  setDraftGeneralChannelColumnsForDate(generalChannelDate(), draftGeneralChannelColumns);
  const columns = cloneGeneralChannelColumns(draftGeneralChannelColumns);
  const columnsByDate = cloneGeneralChannelColumnsByDate(draftGeneralChannelColumnsByDate);
  const entries = cloneGeneralChannelEntries(draftGeneralChannelEntries, columnsByDate);
  const puqianEntries = cloneGeneralChannelPuqianEntries(draftGeneralChannelPuqianEntries);
  const response = await fetch("/api/general-channel-table", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      generalChannelDate: generalChannelDate(),
      generalChannelColumns: columns,
      generalChannelColumnsByDate: columnsByDate,
      generalChannelTableEntries: entries,
      generalChannelPuqianEntries: puqianEntries,
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "一般通路保存失敗");
  applyInventorySyncVersion(result.syncVersion);
  replaceObjectContents(savedGeneralChannelColumnsByDate, cloneGeneralChannelColumnsByDate(columnsByDate));
  savedGeneralChannelColumns = cloneGeneralChannelColumns(generalChannelActiveSavedColumns());
  replaceObjectContents(savedGeneralChannelEntries, cloneGeneralChannelEntries(entries, savedGeneralChannelColumnsByDate));
  replaceObjectContents(savedGeneralChannelPuqianEntries, cloneGeneralChannelPuqianEntries(puqianEntries));
  resetDraftGeneralChannelEntries();
  render();
}

async function saveStoreNote(storeKey, note) {
  const response = await fetch(`/api/store-notes/${encodeURIComponent(storeKey)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "註記保存失敗");
}

async function saveStoreName(storeKey, storeName) {
  const response = await fetch(`/api/stores/${encodeURIComponent(storeKey)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storeName }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "門市名稱保存失敗");
  return result;
}

async function saveStoreRoute(storeKey, route) {
  const response = await fetch(`/api/store-routes/${encodeURIComponent(storeKey)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ route }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "路線保存失敗");
}

function setAddStoreFormVisible(visible) {
  const form = byId("addStoreForm");
  if (!form) return;
  form.hidden = !visible;
  byId("toggleAddStoreBtn").textContent = visible ? "收合新增" : "新增門市";
  if (visible) {
    byId("newStoreGroup").value = state.group || "A";
    byId("newStoreName").focus();
  }
}

function clearAddStoreForm() {
  byId("newStoreGroup").value = state.group || "A";
  byId("newStoreCode").value = "";
  byId("newStoreName").value = "";
  byId("newStoreRoute").value = "";
}

async function addStore(event) {
  event.preventDefault();
  if (!confirmDiscardUnsavedChanges()) return;
  const payload = {
    group: byId("newStoreGroup").value,
    storeCode: byId("newStoreCode").value.trim(),
    storeName: byId("newStoreName").value.trim(),
    route: byId("newStoreRoute").value.trim(),
  };
  if (!payload.storeName || !payload.storeCode) {
    alert("請輸入門市名稱與門市代號");
    return;
  }
  const submitButton = event.submitter || byId("addStoreForm").querySelector("button[type='submit']");
  submitButton.disabled = true;
  try {
    const response = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "新增門市失敗");
    data = result.appData;
    storeRoutes[result.store.key] = payload.route;
    resetDraftShipments();
    rebuildDerivedState();
    state.group = result.store.group;
    state.storeSearch = "";
    byId("groupFilter").value = state.group;
    byId("storeSearchInput").value = "";
    state.selectedStoreKey = result.store.key;
    clearAddStoreForm();
    setAddStoreFormVisible(false);
    populateStoreControls();
    syncStoreHash();
    render();
  } catch (error) {
    alert(`新增門市失敗：${error.message}`);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteSelectedStore() {
  if (!confirmDiscardUnsavedChanges()) return;
  const store = storePages.find((item) => item.key === state.selectedStoreKey);
  if (!store) {
    alert("目前沒有可刪除的門市");
    return;
  }
  const confirmed = confirm(`確定刪除「${store.storeName}（${store.storeCode || store.sheet}）」？這會移除這間門市的庫存頁資料、註記與已保存的到貨輸入。`);
  if (!confirmed) return;
  const button = byId("deleteStoreBtn");
  button.disabled = true;
  try {
    const response = await fetch(`/api/stores/${encodeURIComponent(store.key)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "刪除門市失敗");
    await bootstrap();
    delete storeNotes[store.key];
    delete storeRoutes[store.key];
    state.selectedStoreKey = storePages[0]?.key || "";
    resetDraftShipments();
    populateStoreControls();
    syncStoreHash();
    render();
  } catch (error) {
    alert(`刪除門市失敗：${error.message}`);
  } finally {
    button.disabled = false;
  }
}

function setImportMenuOpen(open) {
  const panel = byId("importMenuPanel");
  const button = byId("importMenuBtn");
  if (!panel || !button) return;
  panel.hidden = !open;
  button.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) byId("salesDateInput")?.focus();
}

function toggleImportMenu() {
  const panel = byId("importMenuPanel");
  if (!panel) return;
  setImportMenuOpen(panel.hidden);
}

async function importSalesFile(file) {
  if (!file) return;
  if (!confirmDiscardUnsavedChanges()) {
    byId("salesFileInput").value = "";
    return;
  }
  const salesDate = byId("salesDateInput").value;
  if (!salesDate) {
    alert("請先選擇匯入日期");
    byId("salesFileInput").value = "";
    return;
  }
  byId("importStatus").textContent = "匯入中...";
  const form = new FormData();
  form.append("salesFile", file);
  form.append("salesDate", salesDate);
  try {
    const response = await fetch("/api/import-sales", { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "匯入失敗");
    byId("importStatus").textContent = "匯入完成，重新載入...";
    window.location.reload();
  } catch (error) {
    byId("importStatus").textContent = "匯入失敗";
    alert(`匯入失敗：${error.message}`);
  }
}

async function importSalesFromWebsite() {
  if (!confirmDiscardUnsavedChanges()) return;
  const salesDate = byId("salesDateInput").value;
  if (!salesDate) {
    alert("請先選擇匯入日期");
    return;
  }
  const button = byId("importFromWebsiteBtn");
  byId("importStatus").textContent = "網站下載中...";
  button.disabled = true;
  try {
    const response = await fetch("/api/import-sales-from-website", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salesDate }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "網站匯入失敗");
    byId("importStatus").textContent = "匯入完成，重新載入...";
    window.location.reload();
  } catch (error) {
    byId("importStatus").textContent = "匯入失敗";
    alert(`網站匯入失敗：${error.message}`);
  } finally {
    button.disabled = false;
  }
}

function lowStockRows() {
  return currentInventory()
    .filter((row) => n(row.currentStock) <= state.threshold)
    .map((row) => ({
      ...row,
      suggestedQty: Math.max(0, state.target - n(row.currentStock)),
    }))
    .sort(sortByNumber("currentStock"));
}

function renderMetrics() {
  return;
}

function renderAppShell() {
  applyLocalizedStaticText();
  renderAuthState();
  const isHome = state.page === "home";
  const isInventory = state.page === "inventory";
  const isManifest = state.page === "shipmentManifest";
  const isHarvest = state.page === "harvestPlanning";
  const isCity = state.page === "city";
  const isYfy = state.page === yfyPageKey;
  const isLooseVegetable = state.page === "looseVegetable";
  const isGeneralChannel = state.page === "generalChannel";
  const isChannel = Object.prototype.hasOwnProperty.call(channelPages, state.page);
  const isRecordPage = Object.prototype.hasOwnProperty.call(recordPages, state.page);
  const isAdminPage = state.page === "accountUsers";
  const isFieldWorkRecords = state.page === "fieldWorkRecords";
  const isFieldBtRecords = state.page === "fieldBtRecords";
  const isNetHouseStatus = state.page === "netHouseStatusRecords";
  const isDailyVegetable = state.page === "dailyVegetableAvailability";
  const isHarvestPickList = state.page === "harvestPickList";
  const showNetHouseRecordNav = isNetHouseStatus || isDailyVegetable || isHarvestPickList || isHarvest;
  const showNetHouseStatusNav = (showNetHouseRecordNav || isFieldWorkRecords)
    && currentRole() === "root"
    && canUsePage("netHouseStatusRecords");
  const showDailyVegetableNav = (showNetHouseRecordNav || isFieldWorkRecords)
    && canUsePage("dailyVegetableAvailability");
  const showFieldWorkRecordsNav = isNetHouseStatus
    && currentRole() === "root"
    && canUsePage("fieldWorkRecords");
  const showFieldWorkExport = isFieldWorkRecords && currentRole() === "root";
  const showFieldBtExport = isFieldBtRecords && currentRole() === "root";
  const showRecordExportActions = showFieldWorkExport || showFieldBtExport;
  const showHarvestShortcutNav = isHarvest;
  const showHarvestPlanningNav = isInventory || isManifest || isChannel || showNetHouseRecordNav;
  const showChannelNav = isChannel || showHarvestShortcutNav;
  const isNetHouseWorkflowPage = isHarvest || isNetHouseStatus || isDailyVegetable || isHarvestPickList;
  const isHarvestMessageBoard = isHarvest && state.harvestView === "messageBoard";
  const usesHarvestProductFilter = (isHarvest && !isHarvestMessageBoard) || isCity || isYfy || isLooseVegetable || isGeneralChannel;
  const needsSidebar = isInventory || isManifest || isHarvest || isCity || isYfy || isLooseVegetable || isGeneralChannel;
  document.querySelectorAll("[data-home-section]").forEach((section) => {
    section.hidden = !canUseHomeSection(section.dataset.homeSection);
  });
  if (!isDailyVegetable) {
    state.dailyVegetableSettingsOpen = false;
    state.dailyVegetableManualFormOpen = false;
    state.dailyVegetableManualEditingId = "";
  }
  byId("homePage").classList.toggle("is-visible", isHome);
  const homeAccountBar = byId("homeAccountBar");
  if (homeAccountBar) {
    const accountName = currentUser?.displayName || currentUser?.username || "";
    homeAccountBar.textContent = accountName ? t("home.currentUser", { name: accountName }) : "";
  }
  document.querySelector(".workspace")?.classList.toggle("is-hidden", isHome);
  document.querySelector(".app-header")?.classList.toggle("is-net-house-workflow", isNetHouseWorkflowPage);
  document.querySelector(".workspace")?.classList.toggle(
    "is-full",
    isAdminPage || isRecordPage || (isChannel && !isCity && !isYfy && !isLooseVegetable && !isGeneralChannel),
  );
  document.querySelector(".workspace")?.classList.toggle("is-record-page", isAdminPage || isRecordPage);
  document.querySelector(".header-nav")?.classList.toggle("is-hidden", isHome || isHarvest);
  byId("headerActions").classList.toggle("is-hidden", !isInventory);
  if (!isInventory) setImportMenuOpen(false);
  byId("recordExportActions").classList.toggle("is-hidden", !showRecordExportActions);
  byId("headerExportFieldWorkMonthBtn").classList.toggle("is-hidden", !showFieldWorkExport);
  byId("headerExportFieldBtMonthSummaryBtn").classList.toggle("is-hidden", !showFieldBtExport);
  byId("homeNavBtn").classList.toggle("is-hidden", isHome);
  byId("fieldWorkRecordsNavBtn").classList.toggle("is-hidden", !showFieldWorkRecordsNav);
  byId("netHouseStatusNavBtn").classList.toggle("is-hidden", !showNetHouseStatusNav);
  byId("dailyVegetableNavBtn").classList.toggle("is-hidden", !showDailyVegetableNav);
  byId("harvestPickListNavBtn").classList.toggle("is-hidden", !showNetHouseRecordNav || !canUsePage("harvestPickList"));
  byId("dailyVegetableSettings").classList.toggle("is-hidden", !isDailyVegetable || !canUsePage("dailyVegetableAvailability"));
  byId("inventoryNavBtn").classList.toggle("is-hidden", isHome || isChannel || isAdminPage || isRecordPage || !canUsePage("inventory"));
  byId("manifestNavBtn").classList.toggle("is-hidden", isHome || isHarvest || isChannel || isAdminPage || isRecordPage || !canUsePage("shipmentManifest"));
  byId("harvestNavBtn").classList.toggle("is-hidden", !showHarvestPlanningNav || !canUsePage("harvestPlanning"));
  byId("yfyNavBtn").classList.toggle("is-hidden", !showChannelNav || !canUsePage(yfyPageKey));
  byId("cityNavBtn").classList.toggle("is-hidden", !showChannelNav || !canUsePage("city"));
  byId("generalChannelNavBtn").classList.toggle("is-hidden", !showChannelNav || !canUsePage("generalChannel"));
  byId("looseVegetableNavBtn").classList.toggle("is-hidden", !showChannelNav || !canUsePage("looseVegetable"));
  byId("homeNavBtn").classList.toggle("is-active", isHome);
  byId("fieldWorkRecordsNavBtn").classList.toggle("is-active", isFieldWorkRecords);
  byId("netHouseStatusNavBtn").classList.toggle("is-active", state.page === "netHouseStatusRecords");
  byId("dailyVegetableNavBtn").classList.toggle("is-active", isDailyVegetable);
  byId("harvestPickListNavBtn").classList.toggle("is-active", isHarvestPickList);
  byId("inventoryNavBtn").classList.toggle("is-active", isInventory);
  byId("manifestNavBtn").classList.toggle("is-active", isManifest);
  byId("harvestNavBtn").classList.toggle("is-active", isHarvest);
  byId("yfyNavBtn").classList.toggle("is-active", state.page === yfyPageKey);
  byId("cityNavBtn").classList.toggle("is-active", state.page === "city");
  byId("generalChannelNavBtn").classList.toggle("is-active", state.page === "generalChannel");
  byId("looseVegetableNavBtn").classList.toggle("is-active", state.page === "looseVegetable");

  const tabs = document.querySelector(".tabs");
  const inventoryViewTabs = document.querySelectorAll(".inventory-view-tab");
  const harvestViewTabs = document.querySelectorAll(".harvest-view-tab");
  const storePicker = document.querySelector(".store-picker");
  const productFilter = document.querySelector(".product-filter");
  const harvestPackageCalculator = byId("harvestPackageCalculator");
  const harvestConversionSettingsSection = byId("harvestConversionSettingsSection");
  const manifestStoreFilter = byId("manifestStoreFilter");
  const manifestRoundsSection = byId("manifestRoundsSection");
  const groupFilterControl = byId("groupFilterControl");
  const shipmentDateControl = byId("shipmentDateControl");
  const shipmentDateLabel = byId("shipmentDateLabel");
  const dailyVegetableSettingsBtn = byId("dailyVegetableSettingsBtn");
  const dailyVegetableSettingsPanel = byId("dailyVegetableSettingsPanel");
  const dailyVegetableSettingsDateInput = byId("dailyVegetableSettingsDateInput");
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) sidebar.classList.toggle("is-hidden", isAdminPage || !needsSidebar);
  if (tabs) tabs.style.display = (isInventory || isHarvest) ? "" : "none";
  inventoryViewTabs.forEach((button) => {
    button.hidden = !isInventory;
    button.classList.toggle("is-active", isInventory && button.dataset.view === state.view);
  });
  harvestViewTabs.forEach((button) => {
    button.hidden = !isHarvest;
    button.classList.toggle("is-active", isHarvest && button.dataset.harvestView === state.harvestView);
  });
  if (isHarvest) {
    updateHarvestMessageTabBadge();
    ensureHarvestMessageBadgeForDate();
  }
  if (storePicker) storePicker.style.display = isInventory ? "" : "none";
  if (productFilter) productFilter.style.display = (isInventory || usesHarvestProductFilter) ? "" : "none";
  if (harvestConversionSettingsSection) harvestConversionSettingsSection.hidden = !(isHarvest && state.harvestView === defaultHarvestView);
  if (harvestPackageCalculator) harvestPackageCalculator.hidden = !(isHarvest && state.harvestView === defaultHarvestView);
  if (manifestStoreFilter) manifestStoreFilter.hidden = !isManifest;
  if (manifestRoundsSection) manifestRoundsSection.hidden = !isManifest;
  if (groupFilterControl) groupFilterControl.style.display = isInventory ? "" : "none";
  if (shipmentDateControl) shipmentDateControl.style.display = isDailyVegetable ? "none" : "";
  if (shipmentDateLabel) shipmentDateLabel.textContent = "出貨日期";
  if (dailyVegetableSettingsBtn) dailyVegetableSettingsBtn.setAttribute("aria-expanded", isDailyVegetable && state.dailyVegetableSettingsOpen ? "true" : "false");
  if (dailyVegetableSettingsPanel) dailyVegetableSettingsPanel.hidden = !isDailyVegetable || !state.dailyVegetableSettingsOpen;
  if (dailyVegetableSettingsDateInput && isDailyVegetable) dailyVegetableSettingsDateInput.value = state.dailyVegetableDate || todayDate();
  if (sidebar) sidebar.classList.toggle("is-compact", isHarvest || isManifest || isCity || isYfy || isLooseVegetable || isGeneralChannel || isDailyVegetable);
  const productFilterProducts = isDailyVegetable ? dailyVegetableProducts() : usesHarvestProductFilter ? allHarvestProducts : allProducts;
  if ((isInventory || usesHarvestProductFilter) && productFilterProducts.length) renderProductFilter();
  if (isDailyVegetable) renderDailyVegetableSettings();
  if (isHarvest && state.harvestView === defaultHarvestView) renderHarvestPackageCalculator();
}

function table(headers, rows, rowClass = () => "") {
  if (!rows.length) return `<div class="empty">沒有符合條件的資料</div>`;
  return `<table><thead><tr>${headers
    .map((header) => `<th class="${header.num ? "num" : ""}">${header.label}</th>`)
    .join("")}</tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr class="${rowClass(row)}">${headers
          .map((header) => {
            const value = header.render ? header.render(row) : row[header.key];
            return `<td class="${header.num ? "num" : ""}">${value ?? ""}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("")}</tbody></table>`;
}

function renderLowStock() {
  const rows = lowStockRows().slice(0, 600);
  byId("viewTitle").innerHTML =
    "<h2>低庫存補貨</h2><p>等同於你現在在各門市 sheet 的 BG6:BG48 判斷補貨，只是改成集中篩選並自動產生建議量。</p>";
  byId("tableHost").innerHTML = table(
    [
      { label: "檔案", key: "group" },
      { label: "門市代號", key: "storeCode" },
      { label: "門市", key: "storeName" },
      { label: "呼出碼", key: "productCode" },
      { label: "品項", key: "productName" },
      { label: "庫存", key: "currentStock", num: true, render: (r) => stockText(r.currentStock) },
      { label: "銷售", key: "salesQty", num: true, render: (r) => format.format(n(r.salesQty)) },
      { label: "丟棄", key: "discardQty", num: true, render: (r) => format.format(n(r.discardQty)) },
      { label: "建議到貨", key: "suggestedQty", num: true, render: (r) => format.format(n(r.suggestedQty)) },
    ],
    rows,
    (row) => (n(row.currentStock) < 0 ? "warning-row" : ""),
  );
}

function visibleStoreProducts(store) {
  const productSet = visibleProductSet();
  return store.products.filter((row) => {
    if (!productSet.has(row.productCode)) return false;
    return true;
  });
}

function renderProductFilter() {
  const isDailyVegetable = state.page === "dailyVegetableAvailability";
  const usesHarvestScopedFilter = pageUsesHarvestProductFilter();
  const usesHarvestProducts = usesHarvestScopedFilter || isDailyVegetable;
  const products = isDailyVegetable ? dailyVegetableProducts() : usesHarvestProducts ? allHarvestProducts : allProducts;
  const selected = isDailyVegetable
    ? visibleDailyVegetableProductSet()
    : usesHarvestScopedFilter
      ? visibleHarvestProductSet()
      : visibleProductSet();
  const productKeys = products.map(productFilterKey).filter(Boolean);
  const productKeySet = new Set(productKeys);
  const selectedInPage = productKeys.filter((key) => selected.has(key)).length;
  byId("toggleProductFilterBtn").textContent = `呼出碼篩選 (${selectedInPage}/${products.length})`;
  byId("productFilterSummary").textContent = `已勾選 ${selectedInPage} / ${products.length}`;
  byId("productFilterList").innerHTML = products
    .map(
      (product) => `<label class="product-check">
        <input type="checkbox" value="${productFilterKey(product)}" ${selected.has(productFilterKey(product)) ? "checked" : ""} />
        <span>${product.productCode || ""}</span>
        <span>${product.productName}</span>
      </label>`,
    )
    .join("");

  document.querySelectorAll("#productFilterList input").forEach((input) => {
    input.addEventListener("change", () => {
      const checked = [...document.querySelectorAll("#productFilterList input:checked")].map((item) => item.value);
      if (isDailyVegetable) {
        setVisibleDailyVegetableProductCodes(checked);
        persistVisibleDailyVegetableProductKeys().catch((error) => alert(`篩選保存失敗：${error.message}`));
        render();
        return;
      }
      if (usesHarvestScopedFilter) {
        const preserved = visibleHarvestProductKeysForDate().filter((key) => !productKeySet.has(key));
        setVisibleHarvestProductKeysForDate([...preserved, ...checked]);
        persistVisibleHarvestProductKeys().catch((error) => alert(`篩選保存失敗：${error.message}`));
      } else {
        const preserved = visibleProductCodesForDate().filter((key) => !productKeySet.has(key));
        setVisibleProductCodesForDate([...preserved, ...checked]);
        persistVisibleProductCodes().catch((error) => alert(`篩選保存失敗：${error.message}`));
      }
      render();
    });
  });
}

function renderDailyVegetableSettings() {
  const products = dailyVegetableProducts();
  const selected = visibleDailyVegetableProductSet();
  const productKeys = products.map(productFilterKey).filter(Boolean);
  const selectedInPage = productKeys.filter((key) => selected.has(key)).length;
  const summary = byId("dailyVegetableSettingsSummary");
  const list = byId("dailyVegetableSettingsList");
  if (summary) summary.textContent = `呼出碼篩選 (${selectedInPage}/${products.length})`;
  if (!list) return;
  list.innerHTML = products
    .map(
      (product) => `<label class="product-check">
        <input type="checkbox" value="${productFilterKey(product)}" ${selected.has(productFilterKey(product)) ? "checked" : ""} />
        <span>${product.productCode || ""}</span>
        <span>${product.productName}</span>
      </label>`,
    )
    .join("");

  list.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      const checked = [...list.querySelectorAll("input:checked")].map((item) => item.value);
      setVisibleDailyVegetableProductCodes(checked);
      persistVisibleDailyVegetableProductKeys().catch((error) => alert(`篩選保存失敗：${error.message}`));
      render();
    });
  });
}

function renderHarvestPackageCalculator() {
  const host = byId("harvestPackageCalculator");
  if (!host) return;
  const inputs = harvestPackageCalculatorInputs;
  host.innerHTML = `<div class="harvest-package-title">包數換算</div>
    <div class="harvest-package-list">
      ${harvestPackageCalculatorRows
        .map((row) => {
          const inputKg = n(inputs[row.key]);
          const precool = harvestPackageCalculatorResult(row, inputKg, "precool");
          const noPrecool = harvestPackageCalculatorResult(row, inputKg, "noPrecool");
          return `<section class="harvest-package-row" data-package-row="${escapeAttribute(row.key)}">
            <div class="harvest-package-row-head">
              <strong>${escapeHtml(row.label)}</strong>
              <span class="harvest-package-pack-label">${escapeHtml(row.packLabel)}/包數</span>
            </div>
            <div class="harvest-package-grid">
              <label>
                <span>公斤</span>
                <input class="harvest-package-input" type="text" inputmode="decimal" value="${escapeAttribute(inputKg || "")}" data-package-key="${escapeAttribute(row.key)}" />
              </label>
              ${row.precoolFactor ? `<div class="harvest-package-result-wrap">
                <span>有預冷</span>
                <button class="harvest-package-result" type="button" data-copy-package-result="precool" title="複製數值"><strong data-package-result="precool">${harvestRoundedPackageText(precool)}</strong></button>
              </div>` : '<div class="harvest-package-result-placeholder" aria-hidden="true"></div>'}
              <div class="harvest-package-result-wrap">
                <span>無預冷</span>
                <button class="harvest-package-result" type="button" data-copy-package-result="noPrecool" title="複製數值"><strong data-package-result="noPrecool">${harvestRoundedPackageText(noPrecool)}</strong></button>
              </div>
            </div>
          </section>`;
        })
        .join("")}
    </div>`;
  document.querySelectorAll(".harvest-package-input").forEach((input) => {
    input.addEventListener("contextmenu", (event) => openHarvestPackageFormulaMenu(event, input));
    input.addEventListener("input", (event) => {
      event.target.value = String(event.target.value || "").replace(/[^\d.]/g, "");
      setHarvestPackageCalculatorInput(event.target.dataset.packageKey, event.target.value);
      updateHarvestPackageCalculatorResults();
    });
  });
  document.querySelectorAll("[data-copy-package-result]").forEach((button) => {
    button.addEventListener("click", copyHarvestPackageResult);
  });
}

async function copyHarvestPackageResult(event) {
  const button = event.currentTarget;
  const valueElement = button.querySelector("[data-package-result]");
  const originalText = valueElement?.textContent || "";
  const value = originalText.trim().replace(/,/g, "");
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement("input");
    input.value = value;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  button.classList.add("is-copied");
  if (valueElement) valueElement.textContent = "已複製";
  window.setTimeout(() => {
    button.classList.remove("is-copied");
    if (valueElement?.textContent === "已複製") valueElement.textContent = originalText;
  }, 900);
}

function updateHarvestPackageCalculatorResults() {
  const inputs = harvestPackageCalculatorInputs;
  harvestPackageCalculatorRows.forEach((row) => {
    const element = document.querySelector(`[data-package-row="${row.key}"]`);
    if (!element) return;
    const inputKg = n(inputs[row.key]);
    const precool = harvestPackageCalculatorResult(row, inputKg, "precool");
    const noPrecool = harvestPackageCalculatorResult(row, inputKg, "noPrecool");
    const precoolElement = element.querySelector('[data-package-result="precool"]');
    if (precoolElement) precoolElement.textContent = harvestRoundedPackageText(precool);
    element.querySelector('[data-package-result="noPrecool"]').textContent = harvestRoundedPackageText(noPrecool);
  });
}

function selectAllProducts() {
  if (state.page === "dailyVegetableAvailability") {
    setVisibleDailyVegetableProductCodes(defaultVisibleDailyVegetableProductKeys());
    persistVisibleDailyVegetableProductKeys().catch((error) => alert(`篩選保存失敗：${error.message}`));
    render();
    return;
  }
  if (pageUsesHarvestProductFilter()) {
    setVisibleHarvestProductKeysForDate(defaultVisibleHarvestProductKeysForDate());
    persistVisibleHarvestProductKeys().catch((error) => alert(`篩選保存失敗：${error.message}`));
  } else {
    setVisibleProductCodesForDate(defaultVisibleProductCodesForDate());
    persistVisibleProductCodes().catch((error) => alert(`篩選保存失敗：${error.message}`));
  }
  renderProductFilter();
  render();
}

function toggleProductFilter() {
  const panel = byId("productFilterPanel");
  panel.hidden = !panel.hidden;
}

function updateSalesShipmentFooterTotals(store, products) {
  const totalInputQty = products.reduce((sum, row) => sum + draftShipment(store, row.productCode), 0);
  const totalProjectedStock = products.reduce(
    (sum, row) => sum + n(row.adjustedCurrentStock) + draftShipment(store, row.productCode),
    0,
  );
  const inputTotalCell = document.querySelector("[data-sales-total-input-qty]");
  const projectedTotalCell = document.querySelector("[data-sales-total-projected-stock]");
  if (inputTotalCell) inputTotalCell.innerHTML = inventoryAccountingText(totalInputQty);
  if (projectedTotalCell) projectedTotalCell.innerHTML = inventoryAccountingText(totalProjectedStock);
}

function renderSalesPage() {
  const store = selectedStore();
  if (!store) {
    byId("viewTitle").innerHTML = "<h2>銷售頁</h2><p>尚未載入門市資料。</p>";
    byId("tableHost").innerHTML = "";
    return;
  }

  const arrivalInputDate = salesArrivalInputDate(state.shipmentDate);
  const arrivalInputLabel = arrivalInputDate ? formatDateShort(arrivalInputDate) : "到貨";
  const dateHeaders = salesWindowDates(store.dates || []);
  const products = visibleStoreProducts(store).map((row) => {
    const inputQty = draftShipment(store, row.productCode);
    const savedInputQty = savedShipmentAtDate(store, row.productCode, arrivalInputDate);
    const stockAdjustment = draftStockAdjustment(store, row.productCode);
    const openingStock = openingStockForDate(row, state.shipmentDate, store);
    const discardQty = discardQtyForSalesRow(store, row);
    const adjustedCurrentStock = currentStockForSalesRow(store, row);
    const projectedStock = adjustedCurrentStock + inputQty;
    return { ...row, openingStock, discardQty, inputQty, savedInputQty, stockAdjustment, adjustedCurrentStock, projectedStock };
  });
  const totalProducts = store.products.map((row) => {
    const inputQty = draftShipment(store, row.productCode);
    const savedInputQty = savedShipmentAtDate(store, row.productCode, arrivalInputDate);
    const stockAdjustment = draftStockAdjustment(store, row.productCode);
    const openingStock = openingStockForDate(row, state.shipmentDate, store);
    const discardQty = discardQtyForSalesRow(store, row);
    const adjustedCurrentStock = currentStockForSalesRow(store, row);
    const projectedStock = adjustedCurrentStock + inputQty;
    return { ...row, openingStock, discardQty, inputQty, savedInputQty, stockAdjustment, adjustedCurrentStock, projectedStock };
  });
  const previousShipmentDates = previousShipmentDatesForStore(store, totalProducts, arrivalInputDate);
  const previousMonthEnd = previousMonthEndDate(state.shipmentDate);
  const harvestTotals = harvestRowTotalLookup(totalProducts);

  byId("viewTitle").innerHTML = storeTitleMarkup(store, true);
  bindStoreName(store);
  bindStoreNote(store);
  bindStoreRoute(store);
  byId("saveShipmentsBtn").addEventListener("click", saveDraftShipments);
  updateSaveStatus();

  const head = `
    <thead>
      <tr>
        <th class="sticky-col code-col">呼出碼</th>
        <th class="sticky-col name-col">菜種</th>
        ${previousShipmentDates.map((date) => `<th class="num previous-shipment-col">${date ? formatDateShort(date) : ""}</th>`).join("")}
        <th class="num opening-stock-col">期初庫存</th>
        ${dateHeaders.map(({ date }) => `<th class="num date-col">${formatDateShort(date)}</th>`).join("")}
        <th class="num monthly-sales-col">出售小計</th>
        <th class="num">報廢</th>
        <th class="num input-col">調整庫存</th>
        <th class="num current-stock-col">目前庫存</th>
        <th>菜種</th>
        <th class="num remaining-allocation-col">剩餘可配數量</th>
        <th class="num input-col">${arrivalInputLabel} 到貨</th>
        <th class="num projected-stock-col">到貨後庫存</th>
        <th class="num previous-month-end-col">上月報廢</th>
        <th class="num previous-month-end-col">上月調整</th>
      </tr>
    </thead>`;

  const body = products
    .map((row, index) => {
      const harvestTotal = harvestTotalForSalesRow(row, harvestTotals, index);
      const previousShipmentCells = previousShipmentDates
        .map((date) => {
          const value = date ? savedShipmentAtDate(store, row.productCode, date) : 0;
          return `<td class="num previous-shipment-col">${inventoryBlankableNumberText(value)}</td>`;
        })
        .join("");
      const previousMonthDiscard = previousMonthEnd ? discardQtyForSalesRow(store, row, previousMonthEnd) : 0;
      const previousMonthStockAdjustment = previousMonthEnd
        ? stockAdjustmentForSalesRowAtDate(store, row.productCode, previousMonthEnd)
        : 0;
      const saleCells = dateHeaders
        .map(({ idx }) => {
          const value = idx >= 0 ? n(row.sales[idx]) : 0;
          return `<td class="num sale-cell ${value ? "has-value" : ""}">${inventoryBlankableNumberText(value)}</td>`;
        })
        .join("");
      return `<tr class="${n(row.adjustedCurrentStock) <= state.threshold ? "warning-row" : ""}">
        <td class="sticky-col code-col">${row.productCode}</td>
        <td class="sticky-col name-col">${row.productName}</td>
        ${previousShipmentCells}
        <td class="num opening-stock-col">${inventoryAccountingText(row.openingStock)}</td>
        ${saleCells}
        <td class="num monthly-sales-col">${inventoryAccountingText(row.monthlySales)}</td>
        <td class="num">${inventoryAccountingText(row.discardQty)}</td>
        <td class="num"><input class="stock-adjustment-input ${n(row.stockAdjustment) < 0 ? "negative" : ""}" type="text" inputmode="decimal" value="${escapeAttribute(adjustmentInputText(row.stockAdjustment))}" data-product="${row.productCode}" data-current="${n(row.adjustedCurrentStock)}" /></td>
        <td class="num current-stock current-stock-col" data-current-stock="${row.productCode}">${stockText(row.adjustedCurrentStock)}</td>
        <td>${row.productName}</td>
        <td class="num remaining-allocation-col" data-remaining-allocation="${escapeAttribute(row.productCode)}">${inventoryBlankableNumberText(harvestTotal)}</td>
        <td class="num"><input class="shipment-input" type="text" inputmode="numeric" pattern="[0-9]*" value="${row.inputQty || ""}" data-product="${row.productCode}" data-current="${n(row.adjustedCurrentStock)}" /></td>
        <td class="num projected-stock projected-stock-col" data-projected="${row.productCode}">${stockText(row.projectedStock)}</td>
        <td class="num previous-month-end-col">${inventoryBlankableNumberText(previousMonthDiscard)}</td>
        <td class="num previous-month-end-col">${inventoryBlankableNumberText(previousMonthStockAdjustment)}</td>
      </tr>`;
    })
    .join("");
  const totals = dateHeaders.map(({ idx }) =>
    idx >= 0 ? totalProducts.reduce((sum, row) => sum + n(row.sales[idx]), 0) : 0,
  );
  const totalOpeningStock = totalProducts.reduce((sum, row) => sum + n(row.openingStock), 0);
  const totalHarvestQty = totalProducts.reduce((sum, row, index) => sum + harvestTotalForSalesRow(row, harvestTotals, index), 0);
  const totalMonthlySales = totalProducts.reduce((sum, row) => sum + n(row.monthlySales), 0);
  const totalDiscard = totalProducts.reduce((sum, row) => sum + n(row.discardQty), 0);
  const totalStockAdjustment = totalProducts.reduce((sum, row) => sum + n(row.stockAdjustment), 0);
  const totalCurrentStock = totalProducts.reduce((sum, row) => sum + n(row.adjustedCurrentStock), 0);
  const totalInputQty = totalProducts.reduce((sum, row) => sum + n(row.inputQty), 0);
  const totalProjectedStock = totalProducts.reduce((sum, row) => sum + n(row.projectedStock), 0);
  const previousShipmentTotals = previousShipmentDates.map((date) =>
    date ? totalProducts.reduce((sum, row) => sum + savedShipmentAtDate(store, row.productCode, date), 0) : 0,
  );
  const previousMonthDiscardTotal = previousMonthEnd
    ? totalProducts.reduce((sum, row) => sum + discardQtyForSalesRow(store, row, previousMonthEnd), 0)
    : 0;
  const previousMonthStockAdjustmentTotal = previousMonthEnd
    ? totalProducts.reduce((sum, row) => sum + stockAdjustmentForSalesRowAtDate(store, row.productCode, previousMonthEnd), 0)
    : 0;
  const footer = `<tfoot><tr>
    <td class="sticky-col code-col">加總</td>
    <td class="sticky-col name-col"></td>
    ${previousShipmentTotals.map((value) => `<td class="num previous-shipment-col">${inventoryBlankableNumberText(value)}</td>`).join("")}
    <td class="num opening-stock-col">${inventoryAccountingText(totalOpeningStock)}</td>
    ${totals.map((value) => `<td class="num">${inventoryBlankableNumberText(value)}</td>`).join("")}
    <td class="num monthly-sales-col">${inventoryAccountingText(totalMonthlySales)}</td>
    <td class="num">${inventoryAccountingText(totalDiscard)}</td>
    <td class="num">${inventoryBlankableNumberText(totalStockAdjustment)}</td>
    <td class="num current-stock-col">${inventoryAccountingText(totalCurrentStock)}</td>
    <td></td>
    <td class="num remaining-allocation-col" data-sales-total-remaining-allocation>${inventoryBlankableNumberText(totalHarvestQty)}</td>
    <td class="num" data-sales-total-input-qty>${inventoryAccountingText(totalInputQty)}</td>
    <td class="num projected-stock-col" data-sales-total-projected-stock>${inventoryAccountingText(totalProjectedStock)}</td>
    <td class="num previous-month-end-col">${inventoryBlankableNumberText(previousMonthDiscardTotal)}</td>
    <td class="num previous-month-end-col">${inventoryBlankableNumberText(previousMonthStockAdjustmentTotal)}</td>
  </tr></tfoot>`;

  byId("tableHost").innerHTML = products.length
    ? `<table class="store-sheet">${head}<tbody>${body}</tbody>${footer}</table>`
    : `<div class="empty">這間門市沒有符合篩選條件的菜種</div>`;

  document.querySelectorAll(".shipment-input").forEach((input) => {
    input.addEventListener("focus", (event) => {
      event.target.closest("tr")?.classList.add("active-input-row");
    });
    input.addEventListener("blur", (event) => {
      event.target.closest("tr")?.classList.remove("active-input-row");
    });
    input.addEventListener("input", (event) => {
      event.target.value = event.target.value.replace(/\D/g, "");
      const productCode = event.target.dataset.product;
      setDraftShipment(store, productCode, event.target.value);
      const projected = n(event.target.dataset.current) + n(event.target.value);
      const cell = document.querySelector(`[data-projected="${productCode}"]`);
      if (cell) cell.innerHTML = stockText(projected);
      updateSalesShipmentFooterTotals(store, totalProducts);
      updateSaveStatus();
    });
  });
  document.querySelectorAll(".stock-adjustment-input").forEach((input) => {
    input.addEventListener("focus", (event) => {
      event.target.closest("tr")?.classList.add("active-input-row");
      event.target.value = signedInputValue(event.target.value);
    });
    input.addEventListener("blur", (event) => {
      event.target.closest("tr")?.classList.remove("active-input-row");
      const value = signedNumberValue(event.target.value);
      event.target.classList.toggle("negative", n(value) < 0);
      event.target.value = adjustmentInputText(value);
    });
    input.addEventListener("input", (event) => {
      event.target.value = signedInputValue(event.target.value);
      event.target.classList.toggle("negative", n(event.target.value) < 0);
      const productCode = event.target.dataset.product;
      setDraftStockAdjustment(store, productCode, event.target.value);
      updateSaveStatus();
    });
  });
}

function arrivalPageEndDate(throughDate = state.shipmentDate) {
  const activeMonth = monthKey(throughDate);
  const parsed = parseDateValue(throughDate);
  if (!activeMonth || !parsed) return throughDate || "";
  const nextDate = new Date(parsed);
  nextDate.setDate(parsed.getDate() + 1);
  const nextDateText = isoDate(nextDate);
  return monthKey(nextDateText) === activeMonth ? nextDateText : throughDate;
}

function shipmentDatesForStore(store, products, throughDate = state.shipmentDate) {
  const activeMonth = monthKey(throughDate);
  const endDate = arrivalPageEndDate(throughDate);
  const dates = new Set();
  products.forEach((product) => {
    savedShipmentDatesForProduct(store, product.productCode).forEach((date) => {
      if (!activeMonth || monthKey(date) !== activeMonth || date > endDate) return;
      dates.add(date);
    });
  });
  return [...dates].filter(Boolean).sort();
}

function hasShipmentInDateRange(store, product, dates) {
  return dates.some((date) => n(shipmentQtyByDate(store, product, date)));
}

function shipmentQtyByDate(store, product, date) {
  return savedShipmentAtDate(store, product.productCode, date);
}

function arrivalSubtotalForDates(store, product, dates) {
  return dates.reduce((sum, date) => sum + shipmentQtyByDate(store, product, date), 0);
}

function splitStoreNameLines(name) {
  const text = String(name || "").trim();
  if (text.length <= 3) return text;
  if (text.length === 5 && text.startsWith("大全聯")) {
    return `大全聯<br />${text.slice(3)}`;
  }
  const splitAt = Math.floor(text.length / 2);
  return `${text.slice(0, splitAt)}<br />${text.slice(splitAt)}`;
}

function manifestSelectionKey() {
  return state.shipmentDate || "";
}

function shipmentManifestQuantityDate(date = state.shipmentDate) {
  return salesArrivalInputDate(date);
}

function normalizeManifestBoxCounts(value) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).map(([storeKey, counts]) => [
      String(storeKey),
      {
        extraLarge: Math.max(0, Math.round(n(counts?.extraLarge))),
        large: Math.max(0, Math.round(n(counts?.large))),
      },
    ]),
  );
}

function normalizeManifestSelectionRecord(value) {
  const defaultRecord = () => ({
    rounds: [],
    activeRoundId: "",
    knownAvailableStoreKeys: [],
  });
  if (Array.isArray(value)) {
    return {
      rounds: [{
        id: "round-1",
        label: manifestRoundLabel(1),
        selectedStoreKeys: value.map((item) => String(item)),
        boxCounts: {},
      }],
      activeRoundId: "round-1",
      knownAvailableStoreKeys: [],
    };
  }
  if (!value || typeof value !== "object") {
    return defaultRecord();
  }
  const rounds = Array.isArray(value.rounds)
    ? value.rounds
        .map((round, index) => ({
          id: String(round?.id || `round-${index + 1}`),
          label: String(round?.label || manifestRoundLabel(index + 1)),
          selectedStoreKeys: Array.isArray(round?.selectedStoreKeys)
            ? round.selectedStoreKeys.map((item) => String(item))
            : [],
          boxCounts: normalizeManifestBoxCounts(round?.boxCounts),
        }))
        .filter((round) => round.id)
    : [];
  if (!rounds.length) return defaultRecord();
  const activeRoundId =
    rounds.find((round) => round.id === value.activeRoundId)?.id || rounds[0]?.id || "";
  const knownAvailableStoreKeys = Array.isArray(value.knownAvailableStoreKeys)
    ? uniqueStrings(value.knownAvailableStoreKeys.map((item) => String(item)))
    : [];
  return { rounds, activeRoundId, knownAvailableStoreKeys };
}

function manifestSelectionRecord() {
  return normalizeManifestSelectionRecord(shipmentManifestSelections[manifestSelectionKey()]);
}

function setManifestSelectionRecord(record) {
  shipmentManifestSelections[manifestSelectionKey()] = {
    rounds: record.rounds.map((round) => ({
      id: round.id,
      label: round.label,
      selectedStoreKeys: [...round.selectedStoreKeys],
      boxCounts: normalizeManifestBoxCounts(round.boxCounts),
    })),
    activeRoundId: record.activeRoundId || record.rounds[0]?.id || "",
    knownAvailableStoreKeys: uniqueStrings(
      (Array.isArray(record.knownAvailableStoreKeys) ? record.knownAvailableStoreKeys : [])
        .map((item) => String(item)),
    ),
  };
}

function manifestRounds() {
  return manifestSelectionRecord().rounds;
}

function activeManifestRound() {
  const record = manifestSelectionRecord();
  return record.rounds.find((round) => round.id === record.activeRoundId) || null;
}

function manifestStoresWithShipments() {
  const quantityDate = shipmentManifestQuantityDate();
  return storePages
    .filter((store) =>
      (store.products || []).some((product) => shipmentQtyByDate(store, product, quantityDate)),
    )
    .sort(compareManifestStoreOrder);
}

function currentManifestAvailableStoreKeys() {
  return manifestStoresWithShipments().map((store) => store.key);
}

function reconcileNewManifestStoresToLatestRound() {
  const availableStoreKeys = currentManifestAvailableStoreKeys();
  const record = manifestSelectionRecord();
  if (!record.rounds.length) return false;

  const knownStoreKeys = new Set(record.knownAvailableStoreKeys || []);
  const hadKnownSnapshot = knownStoreKeys.size > 0;
  const newlyAvailableStoreKeys = hadKnownSnapshot
    ? availableStoreKeys.filter((storeKey) => !knownStoreKeys.has(storeKey))
    : [];

  const alreadySelectedStoreKeys = new Set(
    record.rounds.flatMap((round) => round.selectedStoreKeys || []),
  );
  const newUnselectedStoreKeys = newlyAvailableStoreKeys
    .filter((storeKey) => !alreadySelectedStoreKeys.has(storeKey));
  const latestRound = record.rounds[record.rounds.length - 1];
  let changed = false;

  if (latestRound && newUnselectedStoreKeys.length) {
    latestRound.selectedStoreKeys = uniqueStrings([
      ...(latestRound.selectedStoreKeys || []),
      ...newUnselectedStoreKeys,
    ]);
    changed = true;
  }

  if (JSON.stringify(record.knownAvailableStoreKeys || []) !== JSON.stringify(availableStoreKeys)) {
    record.knownAvailableStoreKeys = availableStoreKeys;
    changed = true;
  }

  if (changed) setManifestSelectionRecord(record);
  return changed;
}

function manifestCandidateStores() {
  return manifestStoresWithShipments().filter((store) => store.group === state.manifestStorePickerGroup);
}

function defaultManifestSelectedStoreKeys() {
  return [];
}

function selectedManifestStoreKeys() {
  const availableKeys = new Set(manifestStoresWithShipments().map((store) => store.key));
  const round = activeManifestRound();
  if (!round) return defaultManifestSelectedStoreKeys().filter((storeKey) => availableKeys.has(storeKey));
  return round.selectedStoreKeys.filter((storeKey) => availableKeys.has(storeKey));
}

function saveSelectedManifestStoreKeys(selectedStoreKeys) {
  const record = manifestSelectionRecord();
  const round = record.rounds.find((item) => item.id === record.activeRoundId);
  if (!round) return;
  round.selectedStoreKeys = [...selectedStoreKeys];
  setManifestSelectionRecord(record);
}

function manifestRoundBoxCount(storeKey, size) {
  const round = activeManifestRound();
  if (!round) return 0;
  return Math.max(0, Math.round(n(round.boxCounts?.[storeKey]?.[size])));
}

function suggestedManifestBoxCount(totalQty) {
  const total = n(totalQty);
  if (total < 100) return 1;
  if (total <= 150) return 2;
  return 3;
}

function setManifestRoundBoxCount(storeKey, size, value) {
  const record = manifestSelectionRecord();
  const round = record.rounds.find((item) => item.id === record.activeRoundId);
  if (!round) return;
  round.boxCounts ||= {};
  round.boxCounts[storeKey] ||= { extraLarge: 0, large: 0 };
  round.boxCounts[storeKey][size] = Math.max(0, Math.round(n(value)));
  setManifestSelectionRecord(record);
}

function scheduleManifestSelectionPersist() {
  saveManifestSelectionsToStorage();
  if (persistManifestSelectionTimer) window.clearTimeout(persistManifestSelectionTimer);
  persistManifestSelectionTimer = window.setTimeout(() => {
    persistManifestSelectionTimer = 0;
    persistShipmentManifestSelections().catch((error) => alert(`出貨單門市保存失敗：${error.message}`));
  }, 250);
}

function applyManifestBoxAutoFill(sizeKey, stores, checked) {
  stores.forEach((store) => {
    setManifestRoundBoxCount(
      store.key,
      sizeKey,
      checked ? suggestedManifestBoxCount(store.totalQty) : 0,
    );
  });
}

function isManifestBoxAutoFilled(sizeKey, stores) {
  if (!stores.length) return false;
  return stores.every((store) => (
    manifestRoundBoxCount(store.key, sizeKey) === suggestedManifestBoxCount(store.totalQty)
  ));
}

function reorderSelectedManifestStoreKeys(draggedKey, targetKey, position = "before") {
  if (!draggedKey || !targetKey || draggedKey === targetKey) return;
  const orderedKeys = selectedManifestStoreKeys();
  const draggedIndex = orderedKeys.indexOf(draggedKey);
  const targetIndex = orderedKeys.indexOf(targetKey);
  if (draggedIndex < 0 || targetIndex < 0) return;
  const nextKeys = [...orderedKeys];
  nextKeys.splice(draggedIndex, 1);
  const rawInsertIndex = nextKeys.indexOf(targetKey);
  const insertIndex = position === "after" ? rawInsertIndex + 1 : rawInsertIndex;
  nextKeys.splice(insertIndex, 0, draggedKey);
  saveSelectedManifestStoreKeys(nextKeys);
}

function setManifestStorePickerGroup(group) {
  state.manifestStorePickerGroup = group;
  renderManifestStoreFilter();
}

function addManifestRound() {
  const record = manifestSelectionRecord();
  const nextIndex = record.rounds.length + 1;
  const alreadySelectedStoreKeys = new Set(
    record.rounds.flatMap((round) => round.selectedStoreKeys || []),
  );
  const defaultSelectedStoreKeys = manifestStoresWithShipments()
    .map((store) => store.key)
    .filter((storeKey) => !alreadySelectedStoreKeys.has(storeKey));
  const round = {
    id: `round-${Date.now()}-${nextIndex}`,
    label: manifestRoundLabel(nextIndex),
    selectedStoreKeys: defaultSelectedStoreKeys,
    boxCounts: {},
  };
  record.rounds.push(round);
  record.activeRoundId = round.id;
  record.knownAvailableStoreKeys = currentManifestAvailableStoreKeys();
  setManifestSelectionRecord(record);
  persistShipmentManifestSelections().catch((error) => alert(`出貨單門市保存失敗：${error.message}`));
  render();
  renderManifestRounds();
}

function selectManifestRound(roundId) {
  const record = manifestSelectionRecord();
  if (!record.rounds.some((round) => round.id === roundId)) return;
  record.activeRoundId = roundId;
  setManifestSelectionRecord(record);
  persistShipmentManifestSelections().catch((error) => alert(`出貨單門市保存失敗：${error.message}`));
  render();
  renderManifestRounds();
  renderManifestStoreFilter();
}

function deleteManifestRound(roundId) {
  const record = manifestSelectionRecord();
  const index = record.rounds.findIndex((round) => round.id === roundId);
  if (index < 0) return;
  record.rounds.splice(index, 1);
  if (record.activeRoundId === roundId) {
    record.activeRoundId = record.rounds[index - 1]?.id || record.rounds[index]?.id || "";
  }
  setManifestSelectionRecord(record);
  persistShipmentManifestSelections().catch((error) => alert(`出貨單門市保存失敗：${error.message}`));
  closeManifestStoreModal();
  render();
  renderManifestRounds();
  renderManifestStoreFilter();
}

function renderManifestRounds() {
  const rounds = manifestRounds();
  const activeRoundId = manifestSelectionRecord().activeRoundId;
  byId("manifestRoundsList").innerHTML = rounds
    .map(
      (round) => `<div class="manifest-round-item">
        <button class="manifest-round-btn ${round.id === activeRoundId ? "is-active" : ""}" data-round-id="${round.id}" type="button">${round.label}</button>
        <button class="manifest-round-delete-btn" data-delete-round-id="${round.id}" type="button">刪除</button>
      </div>`,
    )
    .join("");
  document.querySelectorAll("#manifestRoundsList [data-round-id]").forEach((button) => {
    button.addEventListener("click", () => selectManifestRound(button.dataset.roundId));
  });
  document.querySelectorAll("#manifestRoundsList [data-delete-round-id]").forEach((button) => {
    button.addEventListener("click", () => deleteManifestRound(button.dataset.deleteRoundId));
  });
}

function openManifestStoreModal() {
  const modal = byId("manifestStoreModal");
  if (!modal) return;
  if (!activeManifestRound()) {
    alert("請先新增出貨單輪次");
    return;
  }
  renderManifestStoreFilter();
  modal.hidden = false;
}

function closeManifestStoreModal() {
  const modal = byId("manifestStoreModal");
  if (!modal) return;
  modal.hidden = true;
}

function toggleAllManifestStores() {
  if (!activeManifestRound()) return;
  const currentGroupStoreKeys = manifestCandidateStores().map((store) => store.key);
  const currentGroupStoreKeySet = new Set(currentGroupStoreKeys);
  const selected = selectedManifestStoreKeys();
  const currentSelectedCount = selected.filter((storeKey) => currentGroupStoreKeySet.has(storeKey)).length;
  const preserved = selected.filter((storeKey) => !currentGroupStoreKeySet.has(storeKey));
  saveSelectedManifestStoreKeys(
    currentSelectedCount === currentGroupStoreKeys.length ? preserved : [...preserved, ...currentGroupStoreKeys],
  );
  persistShipmentManifestSelections().catch((error) => alert(`出貨單門市保存失敗：${error.message}`));
  render();
  renderManifestStoreFilter();
}

function renderManifestStoreFilter() {
  const stores = manifestCandidateStores();
  const selected = new Set(selectedManifestStoreKeys());
  const selectedInCurrentGroup = stores.filter((store) => selected.has(store.key)).length;
  const activeRound = activeManifestRound();
  byId("manifestStoreGroupABtn").classList.toggle("is-active", state.manifestStorePickerGroup === "A");
  byId("manifestStoreGroupBBtn").classList.toggle("is-active", state.manifestStorePickerGroup === "B");
  byId("toggleAllManifestStoresBtn").textContent = "全選";
  byId("manifestStoreSummary").textContent = !activeRound
    ? "請先新增出貨單輪次"
    : stores.length
      ? `${activeRound.label} 已選 ${selected.size} 門市`
      : "這個日期沒有可選擇的出貨門市";
  byId("manifestStoreList").innerHTML = stores
    .map(
      (store) => `<label class="store-check">
        <input type="checkbox" value="${store.key}" ${selected.has(store.key) ? "checked" : ""} />
        <span class="store-check-text">
          <span>${store.storeName}</span>
          <span class="store-check-code">${store.storeCode || store.sheet || ""}</span>
        </span>
      </label>`,
    )
    .join("");

  document.querySelectorAll("#manifestStoreList input").forEach((input) => {
    input.addEventListener("change", () => {
      if (!activeManifestRound()) return;
      const currentGroupStoreKeys = new Set(manifestCandidateStores().map((store) => store.key));
      const preserved = selectedManifestStoreKeys().filter((storeKey) => !currentGroupStoreKeys.has(storeKey));
      const currentChecked = [...document.querySelectorAll("#manifestStoreList input:checked")].map((item) => item.value);
      saveSelectedManifestStoreKeys([...preserved, ...currentChecked]);
      persistShipmentManifestSelections().catch((error) => alert(`出貨單門市保存失敗：${error.message}`));
      render();
      renderManifestStoreFilter();
    });
  });
}

function shipmentManifestData() {
  const quantityDate = shipmentManifestQuantityDate();
  const selectedStoreKeyOrder = selectedManifestStoreKeys();
  const selectedStoreKeys = new Set(selectedStoreKeyOrder);
  const storeMap = new Map(
    manifestStoresWithShipments()
      .filter((store) => selectedStoreKeys.has(store.key))
      .map((store) => {
        const totalQty = (store.products || []).reduce(
          (sum, product) => sum + shipmentQtyByDate(store, product, quantityDate),
          0,
        );
        return [store.key, { ...store, totalQty }];
      }),
  );
  const stores = selectedStoreKeyOrder
    .map((storeKey) => storeMap.get(storeKey))
    .filter(Boolean)
    .map((store) => {
      return store;
    });

  const products = new Map();
  const productOrder = new Map(allProducts.map((product, idx) => [product.productCode, idx]));
  stores.forEach((store) => {
    (store.products || []).forEach((product) => {
      const quantity = shipmentQtyByDate(store, product, quantityDate);
      if (!quantity) return;
      const existing = products.get(product.productCode) || {
        productCode: product.productCode,
        productName: product.productName,
        quantities: {},
        totalQty: 0,
      };
      existing.quantities[store.key] = quantity;
      existing.totalQty += quantity;
      products.set(product.productCode, existing);
    });
  });

  return {
    stores,
    rows: [...products.values()].sort((a, b) => {
      const aOrder = productOrder.get(a.productCode) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = productOrder.get(b.productCode) ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a.productCode || "").localeCompare(String(b.productCode || ""), "zh-Hant");
    }),
    grandTotal: stores.reduce((sum, store) => sum + n(store.totalQty), 0),
    boxTotals: {
      extraLarge: stores.reduce((sum, store) => sum + manifestRoundBoxCount(store.key, "extraLarge"), 0),
      large: stores.reduce((sum, store) => sum + manifestRoundBoxCount(store.key, "large"), 0),
    },
  };
}

function shipmentManifestStoresForRound(round) {
  const availableStores = manifestStoresWithShipments();
  const selectedStoreKeys = new Set(Array.isArray(round?.selectedStoreKeys)
    ? round.selectedStoreKeys.map((storeKey) => String(storeKey))
    : []);
  return availableStores.filter((store) => selectedStoreKeys.has(store.key));
}

function shipmentRoundProductTotals(round) {
  const quantityDate = shipmentManifestQuantityDate();
  const totals = new Map();
  shipmentManifestStoresForRound(round).forEach((store) => {
    (store.products || []).forEach((product) => {
      const quantity = shipmentQtyByDate(store, product, quantityDate);
      if (!quantity) return;
      productIdentityKeys(product).forEach((key) => {
        totals.set(key, n(totals.get(key)) + quantity);
      });
    });
  });
  return totals;
}

function harvestShipmentRoundColumns() {
  if (!state.shipmentDate) return [];
  return manifestRounds().map((round, index) => ({
    id: round.id || `round-${index + 1}`,
    label: round.label || manifestRoundLabel(index + 1),
    totals: shipmentRoundProductTotals(round),
  }));
}

function harvestShipmentRoundValue(roundColumn, rowIndex) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + harvestShipmentRoundValue(roundColumn, product.rowIndex), 0);
  const product = harvestProductForRow(rowIndex);
  if (!product) return 0;
  for (const key of productIdentityKeys(product)) {
    if (roundColumn.totals.has(key)) return n(roundColumn.totals.get(key));
  }
  return 0;
}

function dailyShipmentProductTotals(date = shipmentManifestQuantityDate()) {
  const totals = new Map();
  if (!date) return totals;
  storePages.forEach((store) => {
    (store.products || []).forEach((product) => {
      const quantity = shipmentQtyByDate(store, product, date);
      if (!quantity) return;
      productIdentityKeys(product).forEach((key) => {
        totals.set(key, n(totals.get(key)) + quantity);
      });
    });
  });
  return totals;
}

function harvestDailyShipmentValue(rowIndex, totals = dailyShipmentProductTotals()) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + harvestDailyShipmentValue(product.rowIndex, totals), 0);
  const product = harvestProductForRow(rowIndex);
  if (!product) return 0;
  for (const key of productIdentityKeys(product)) {
    if (totals.has(key)) return n(totals.get(key));
  }
  return 0;
}

function manifestExportFilename(shipmentDate, roundLabel) {
  return `${shipmentDate || "未選擇日期"}_${roundLabel || "未命名輪次"}.xlsx`;
}

function shipmentDateCompactLabel(shipmentDate) {
  const match = String(shipmentDate || "").match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!match) return "0000";
  return `${match[1]}${match[2]}`;
}

function manifestUploadExportFilename(shipmentDate, roundLabel) {
  return `全聯上傳${roundLabel || "未命名輪次"}_${shipmentDateCompactLabel(shipmentDate)}.xlsx`;
}

function updateManifestBoxTotals() {
  const stores = shipmentManifestData().stores;
  const extraLargeTotal = stores.reduce((sum, store) => sum + manifestRoundBoxCount(store.key, "extraLarge"), 0);
  const largeTotal = stores.reduce((sum, store) => sum + manifestRoundBoxCount(store.key, "large"), 0);
  const extraLargeCell = document.querySelector('[data-box-total="extraLarge"]');
  const largeCell = document.querySelector('[data-box-total="large"]');
  if (extraLargeCell) extraLargeCell.textContent = extraLargeTotal ? format.format(extraLargeTotal) : "";
  if (largeCell) largeCell.textContent = largeTotal ? format.format(largeTotal) : "";
}

async function exportShipmentManifestExcel() {
  const activeRound = activeManifestRound();
  const manifest = shipmentManifestData();
  if (!state.shipmentDate) {
    alert("請先選擇出貨日期。");
    return;
  }
  if (!activeRound) {
    alert("請先新增出貨單輪次。");
    return;
  }
  if (!manifest.stores.length || !manifest.rows.length) {
    alert("目前沒有可匯出的出貨單內容。");
    return;
  }

  try {
    const response = await fetch("/api/export-shipment-manifest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentDate: state.shipmentDate,
        roundLabel: activeRound.label,
        stores: manifest.stores.map((store) => ({
          key: store.key,
          group: store.group,
          storeCode: store.storeCode,
          sheet: store.sheet,
          storeName: store.storeName,
          route: store.route,
          totalQty: n(store.totalQty),
        })),
        rows: manifest.rows.map((row) => ({
          productCode: row.productCode,
          productName: row.productName,
          quantities: row.quantities,
          totalQty: n(row.totalQty),
        })),
        grandTotal: n(manifest.grandTotal),
        boxRows: [
          {
            label: "特大",
            sizeKey: "extraLarge",
            quantities: Object.fromEntries(
              manifest.stores.map((store) => [store.key, manifestRoundBoxCount(store.key, "extraLarge")]),
            ),
            totalQty: n(manifest.boxTotals.extraLarge),
          },
          {
            label: "大",
            sizeKey: "large",
            quantities: Object.fromEntries(
              manifest.stores.map((store) => [store.key, manifestRoundBoxCount(store.key, "large")]),
            ),
            totalQty: n(manifest.boxTotals.large),
          },
        ],
      }),
    });
    if (!response.ok) {
      let message = "匯出 Excel 失敗";
      try {
        const result = await response.json();
        if (result?.error) message = result.error;
      } catch {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = manifestExportFilename(state.shipmentDate, activeRound.label);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert(`匯出 Excel 失敗：${error.message}`);
  }
}

async function exportShipmentUploadExcel() {
  const activeRound = activeManifestRound();
  const manifest = shipmentManifestData();
  if (!state.shipmentDate) {
    alert("請先選擇出貨日期。");
    return;
  }
  if (!activeRound) {
    alert("請先新增出貨單輪次。");
    return;
  }
  if (!manifest.stores.length || !manifest.rows.length) {
    alert("目前沒有可匯出的出貨單內容。");
    return;
  }

  try {
    const response = await fetch("/api/export-shipment-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shipmentDate: state.shipmentDate,
        roundLabel: activeRound.label,
        stores: manifest.stores.map((store) => ({
          key: store.key,
          storeCode: store.storeCode,
          sheet: store.sheet,
        })),
        rows: manifest.rows.map((row) => ({
          productCode: row.productCode,
          quantities: row.quantities,
        })),
      }),
    });
    if (!response.ok) {
      let message = "匯出上傳失敗";
      try {
        const result = await response.json();
        if (result?.error) message = result.error;
      } catch {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = manifestUploadExportFilename(state.shipmentDate, activeRound.label);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert(`匯出上傳失敗：${error.message}`);
  }
}

function renderShipmentManifest() {
  if (reconcileNewManifestStoresToLatestRound()) scheduleManifestSelectionPersist();
  const manifest = shipmentManifestData();
  const dateLabel = state.shipmentDate ? formatDateShort(state.shipmentDate) : "未選擇日期";
  const activeRound = activeManifestRound();
  const exportButtons = state.shipmentDate && activeRound && manifest.stores.length && manifest.rows.length
    ? `<div class="manifest-export-actions">
        <button id="exportManifestBtn" class="manifest-print-btn" type="button">匯出表格</button>
        <button id="exportUploadBtn" class="manifest-print-btn" type="button">匯出上傳</button>
      </div>`
    : "";

  byId("viewTitle").innerHTML = `<div class="view-title-row">
    <div>
      <h2>出貨單</h2>
    </div>
    ${exportButtons}
  </div>`;
  renderManifestStoreFilter();
  renderManifestRounds();

  if (!state.shipmentDate) {
    byId("tableHost").innerHTML = '<div class="empty">請先選擇出貨日期。</div>';
    return;
  }

  if (!activeRound) {
    byId("tableHost").innerHTML = '<div class="empty">請先按「新增出貨單」建立第一輪。</div>';
    return;
  }

  if (!manifest.stores.length || !manifest.rows.length) {
    byId("tableHost").innerHTML = '<div class="empty">這個日期目前沒有符合條件的出貨資料。</div>';
    return;
  }

  const head = `<thead>
    <tr>
      <th class="sticky-col code-col manifest-item-col" rowspan="3">呼出碼</th>
      <th class="sticky-col name-col manifest-name-col" rowspan="3">品項</th>
      ${manifest.stores
        .map(
          (store) =>
            `<th class="manifest-store-route" data-store-key="${store.key}" draggable="true" title="${escapeAttribute(store.storeName)}">${escapeHtml(store.route || "")}</th>`,
        )
        .join("")}
      <th class="manifest-sum-col" rowspan="3">出貨量加總</th>
    </tr>
    <tr>
      ${manifest.stores
        .map(
          (store) =>
            `<th class="manifest-store-head" data-store-key="${store.key}" draggable="true" title="${store.storeName}">${store.storeCode || store.sheet || ""}</th>`,
        )
        .join("")}
    </tr>
    <tr>
      ${manifest.stores
        .map(
          (store) =>
            `<th class="manifest-store-subhead" data-store-key="${store.key}" draggable="true" title="${store.storeCode || ""}">${splitStoreNameLines(store.storeName)}</th>`,
        )
        .join("")}
    </tr>
  </thead>`;

  const body = manifest.rows
    .map(
      (row) => `<tr>
        <td class="sticky-col code-col manifest-item-col">${row.productCode}</td>
        <td class="sticky-col name-col manifest-name-col">${row.productName}</td>
        ${manifest.stores
          .map((store) => {
            const qty = n(row.quantities[store.key]);
            return `<td class="num manifest-qty-cell">${qty ? format.format(qty) : ""}</td>`;
          })
          .join("")}
        <td class="num manifest-sum-col">${format.format(n(row.totalQty))}</td>
      </tr>`,
    )
    .join("");

  const footer = `<tfoot><tr>
    <td class="sticky-col code-col manifest-item-col">小計</td>
    <td class="sticky-col name-col manifest-name-col"></td>
    ${manifest.stores.map((store) => `<td class="num manifest-qty-cell">${format.format(n(store.totalQty))}</td>`).join("")}
    <td class="num manifest-sum-col">${format.format(n(manifest.grandTotal))}</td>
  </tr>
  <tr class="manifest-spacer-row">
    <td class="sticky-col code-col manifest-item-col"></td>
    <td class="sticky-col name-col manifest-name-col"></td>
    ${manifest.stores.map(() => '<td class="manifest-qty-cell"></td>').join("")}
    <td class="manifest-sum-col"></td>
  </tr>
  ${[
    { label: "特大", sizeKey: "extraLarge", totalQty: manifest.boxTotals.extraLarge },
    { label: "大", sizeKey: "large", totalQty: manifest.boxTotals.large },
  ]
    .map(
      (boxRow) => `<tr class="manifest-box-row">
        <td class="sticky-col code-col manifest-item-col">${boxRow.label}</td>
        <td class="sticky-col name-col manifest-name-col">
          <label class="manifest-box-toggle">
            <input
              class="manifest-box-auto-toggle"
              type="checkbox"
              data-box-size="${boxRow.sizeKey}"
              ${isManifestBoxAutoFilled(boxRow.sizeKey, manifest.stores) ? "checked" : ""}
            />
            <span>全選</span>
          </label>
        </td>
        ${manifest.stores
          .map((store) => `<td class="manifest-qty-cell">
            <input
              class="manifest-box-input"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              value="${manifestRoundBoxCount(store.key, boxRow.sizeKey)}"
              data-store-key="${store.key}"
              data-box-size="${boxRow.sizeKey}"
            />
          </td>`)
          .join("")}
        <td class="num manifest-sum-col" data-box-total="${boxRow.sizeKey}">${boxRow.totalQty ? format.format(n(boxRow.totalQty)) : ""}</td>
      </tr>`,
    )
    .join("")}</tfoot>`;

  byId("tableHost").innerHTML = `<table class="store-sheet manifest-sheet">${head}<tbody>${body}</tbody>${footer}</table>`;
  byId("exportManifestBtn")?.addEventListener("click", exportShipmentManifestExcel);
  byId("exportUploadBtn")?.addEventListener("click", exportShipmentUploadExcel);
  document.querySelectorAll(".manifest-box-input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const value = Math.max(0, Math.round(n(event.target.value)));
      event.target.value = String(value);
      setManifestRoundBoxCount(event.target.dataset.storeKey, event.target.dataset.boxSize, value);
      scheduleManifestSelectionPersist();
      updateManifestBoxTotals();
      const toggle = document.querySelector(`.manifest-box-auto-toggle[data-box-size="${event.target.dataset.boxSize}"]`);
      if (toggle) toggle.checked = isManifestBoxAutoFilled(event.target.dataset.boxSize, manifest.stores);
    });
  });
  document.querySelectorAll(".manifest-box-auto-toggle").forEach((input) => {
    input.addEventListener("change", (event) => {
      applyManifestBoxAutoFill(event.target.dataset.boxSize, manifest.stores, event.target.checked);
      scheduleManifestSelectionPersist();
      renderShipmentManifest();
    });
  });
  bindManifestStoreDragSorting();
}

function bindManifestStoreDragSorting() {
  const headers = [...document.querySelectorAll(".manifest-store-route, .manifest-store-head, .manifest-store-subhead")];
  const scroller = byId("tableHost");
  let autoScrollFrame = 0;
  let autoScrollDelta = 0;
  const stopAutoScroll = () => {
    autoScrollDelta = 0;
    if (autoScrollFrame) {
      window.cancelAnimationFrame(autoScrollFrame);
      autoScrollFrame = 0;
    }
  };
  const startAutoScroll = (delta) => {
    autoScrollDelta = delta;
    if (autoScrollFrame) return;
    const tick = () => {
      if (!autoScrollDelta || !scroller) {
        autoScrollFrame = 0;
        return;
      }
      scroller.scrollLeft += autoScrollDelta;
      autoScrollFrame = window.requestAnimationFrame(tick);
    };
    autoScrollFrame = window.requestAnimationFrame(tick);
  };
  const updateAutoScroll = (clientX) => {
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    const edgeThreshold = 48;
    const maxStep = 18;
    if (clientX < rect.left + edgeThreshold) {
      const ratio = Math.max(0, (rect.left + edgeThreshold - clientX) / edgeThreshold);
      startAutoScroll(-Math.max(4, Math.round(maxStep * ratio)));
      return;
    }
    if (clientX > rect.right - edgeThreshold) {
      const ratio = Math.max(0, (clientX - (rect.right - edgeThreshold)) / edgeThreshold);
      startAutoScroll(Math.max(4, Math.round(maxStep * ratio)));
      return;
    }
    stopAutoScroll();
  };
  const clearDragState = () => {
    document.querySelectorAll(".manifest-store-route, .manifest-store-head, .manifest-store-subhead").forEach((cell) => {
      cell.classList.remove("is-dragging", "drag-before", "drag-after");
      delete cell.dataset.dropPosition;
    });
  };

  headers.forEach((header) => {
    header.addEventListener("dragstart", (event) => {
      draggedManifestStoreKey = header.dataset.storeKey || "";
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedManifestStoreKey);
      clearDragState();
      document
        .querySelectorAll(`[data-store-key="${draggedManifestStoreKey}"]`)
        .forEach((cell) => cell.classList.add("is-dragging"));
    });

    header.addEventListener("dragover", (event) => {
      event.preventDefault();
      updateAutoScroll(event.clientX);
      const targetKey = header.dataset.storeKey || "";
      if (!draggedManifestStoreKey || draggedManifestStoreKey === targetKey) return;
      const rect = header.getBoundingClientRect();
      const position = event.clientX - rect.left > rect.width / 2 ? "after" : "before";
      clearDragState();
      document
        .querySelectorAll(`[data-store-key="${draggedManifestStoreKey}"]`)
        .forEach((cell) => cell.classList.add("is-dragging"));
      document
        .querySelectorAll(`[data-store-key="${targetKey}"]`)
        .forEach((cell) => cell.classList.add(position === "before" ? "drag-before" : "drag-after"));
      header.dataset.dropPosition = position;
    });

    header.addEventListener("drop", (event) => {
      event.preventDefault();
      stopAutoScroll();
      const targetKey = header.dataset.storeKey || "";
      const position = header.dataset.dropPosition || "before";
      reorderSelectedManifestStoreKeys(draggedManifestStoreKey, targetKey, position);
      clearDragState();
      draggedManifestStoreKey = "";
      persistShipmentManifestSelections().catch((error) => alert(`出貨單門市保存失敗：${error.message}`));
      render();
    });

    header.addEventListener("dragend", () => {
      draggedManifestStoreKey = "";
      stopAutoScroll();
      clearDragState();
    });

    header.addEventListener("dragleave", (event) => {
      if (!event.relatedTarget) stopAutoScroll();
    });
  });
}

function renderShipmentPage() {
  const store = selectedStore();
  if (!store) {
    byId("viewTitle").innerHTML = "<h2>到貨頁</h2><p>尚未載入門市資料。</p>";
    byId("tableHost").innerHTML = "";
    return;
  }

  const totalProducts = store.products;
  const shipmentDates = shipmentDatesForStore(store, totalProducts, state.shipmentDate);
  const arrivalEndDate = arrivalPageEndDate(state.shipmentDate);
  const arrivalEndLabel = arrivalEndDate ? formatDateShort(arrivalEndDate) : "目前日期";

  byId("viewTitle").innerHTML = storeTitleMarkup(store, false);
  bindStoreName(store);
  bindStoreNote(store);
  bindStoreRoute(store);

  const head = `
    <thead>
      <tr>
        <th class="sticky-col code-col">呼出碼</th>
        <th class="sticky-col name-col">菜種</th>
        ${shipmentDates.map((date) => `<th class="num date-col">${formatDateShort(date)}</th>`).join("")}
        <th class="num">到貨小計</th>
      </tr>
    </thead>`;

  const rows = totalProducts.filter((row) => hasShipmentInDateRange(store, row, shipmentDates));
  const totalRows = totalProducts.filter((row) => hasShipmentInDateRange(store, row, shipmentDates));
  const body = rows
    .map((row) => {
      const shipmentCells = shipmentDates
        .map((date) => {
          const value = shipmentQtyByDate(store, row, date);
          return `<td class="num sale-cell ${value ? "has-value" : ""}">${inventoryBlankableNumberText(value)}</td>`;
        })
        .join("");
      const arrivalSubtotal = arrivalSubtotalForDates(store, row, shipmentDates);
      return `<tr>
        <td class="sticky-col code-col">${row.productCode}</td>
        <td class="sticky-col name-col">${row.productName}</td>
        ${shipmentCells}
        <td class="num">${inventoryAccountingText(arrivalSubtotal)}</td>
      </tr>`;
    })
    .join("");
  const shipmentTotals = shipmentDates.map((date) => totalRows.reduce((sum, row) => sum + shipmentQtyByDate(store, row, date), 0));
  const totalArrivalQty = totalRows.reduce((sum, row) => sum + arrivalSubtotalForDates(store, row, shipmentDates), 0);
  const footer = `<tfoot><tr>
    <td class="sticky-col code-col">加總</td>
    <td class="sticky-col name-col"></td>
    ${shipmentTotals.map((value) => `<td class="num">${inventoryBlankableNumberText(value)}</td>`).join("")}
    <td class="num">${inventoryAccountingText(totalArrivalQty)}</td>
  </tr></tfoot>`;

  byId("tableHost").innerHTML = rows.length
    ? `<table class="store-sheet shipment-sheet">${head}<tbody>${body}</tbody>${footer}</table>`
    : `<div class="empty">這間門市在${state.shipmentDate ? formatDateShort(state.shipmentDate) : "目前日期"}所在月份截至${arrivalEndLabel}沒有到貨紀錄；可在銷售頁輸入並保存到貨量。</div>`;

}

function stockText(value) {
  return inventoryAccountingText(value);
}

function renderSales() {
  const rows = (data.salesPivot || [])
    .filter((row) => includes(row, state.search))
    .sort(sortByNumber("salesQty", "desc"))
    .slice(0, 700);
  byId("viewTitle").innerHTML =
    "<h2>銷售 / 丟棄</h2><p>由 SalesData A:K 直接彙總，對應你原本做兩個樞紐分析表的步驟。</p>";
  byId("tableHost").innerHTML = table(
    [
      { label: "門市代號", key: "storeCode" },
      { label: "門市", key: "storeName" },
      { label: "呼出碼", key: "productCode" },
      { label: "品項", key: "productName" },
      { label: "銷售量", key: "salesQty", num: true, render: (r) => format.format(n(r.salesQty)) },
      { label: "丟棄量", key: "discardQty", num: true, render: (r) => format.format(n(r.discardQty)) },
      { label: "期末庫存", key: "endingStock", num: true, render: (r) => format.format(n(r.endingStock)) },
    ],
    rows,
  );
}

function renderStores() {
  const rows = currentInventory().sort((a, b) => String(a.storeName).localeCompare(String(b.storeName), "zh-Hant")).slice(0, 700);
  byId("viewTitle").innerHTML =
    "<h2>門市庫存</h2><p>把 A/B 檔每間門市獨立 sheet 的庫存、銷售、丟棄與到貨欄位集中檢視。</p>";
  byId("tableHost").innerHTML = table(
    [
      { label: "檔案", key: "group" },
      { label: "門市", key: "storeName" },
      { label: "路線", key: "route" },
      { label: "呼出碼", key: "productCode" },
      { label: "品項", key: "productName" },
      { label: "期初/基準庫存", key: "baseStock", num: true, render: (r) => format.format(n(r.baseStock)) },
      { label: "銷售", key: "salesQty", num: true, render: (r) => format.format(n(r.salesQty)) },
      { label: "丟棄", key: "discardQty", num: true, render: (r) => format.format(n(r.discardQty)) },
      { label: "到貨", key: "shipmentQty", num: true, render: (r) => format.format(n(r.shipmentQty)) },
      { label: "推估庫存", key: "currentStock", num: true, render: (r) => stockText(r.currentStock) },
    ],
    rows,
  );
}

function renderHarvest() {
  const rows = data.harvestOrders
    .filter((row) => includes(row, state.search))
    .sort((a, b) => String(a.storeName).localeCompare(String(b.storeName), "zh-Hant"))
    .slice(0, 700);
  byId("viewTitle").innerHTML =
    "<h2>採收規劃</h2><p>對應你最後產生的全聯到貨 sheet，可作為日後把補貨建議寫回採收規劃表 AV:ADP 的資料基礎。</p>";
  byId("tableHost").innerHTML = table(
    [
      { label: "來源 sheet", key: "sheet" },
      { label: "門市代號", key: "storeCode" },
      { label: "門市", key: "storeName" },
      { label: "呼出碼", key: "productCode" },
      { label: "品項", key: "productName" },
      { label: "到貨量", key: "quantity", num: true, render: (r) => format.format(n(r.quantity)) },
    ],
    rows,
  );
}

function harvestCellMap() {
  const template = harvestTemplate();
  const cellMap = new Map((template?.cells || []).map((cell) => [`${cell.row}:${cell.col}`, cell]));
  for (let row = template?.minRow || 3; row <= (template?.maxRow || 48); row += 1) {
    cellMap.set(`${row}:${harvestNoPackageColumn.col}`, {
      row,
      col: harvestNoPackageColumn.col,
      column: harvestNoPackageColumn.column,
      address: `${harvestNoPackageColumn.column}${row}`,
      value: row === 3 ? "不包裝" : row === 4 ? "不包裝" : null,
      formula: null,
      isFormula: false,
    });
  }
  harvestField3FColumns.forEach((fieldColumn) => {
    for (let row = template?.minRow || 3; row <= (template?.maxRow || 48); row += 1) {
      const existing = cellMap.get(`${row}:${fieldColumn.col}`) || {};
      cellMap.set(`${row}:${fieldColumn.col}`, {
        row,
        col: fieldColumn.col,
        column: fieldColumn.column,
        address: `${fieldColumn.column}${row}`,
        value: row === 3 ? fieldColumn.category : row === 4 ? fieldColumn.label : existing.value ?? null,
        formula: existing.formula || null,
        isFormula: Boolean(existing.isFormula),
      });
    }
  });
  harvestPxInventoryColumns.forEach((pxColumn) => {
    for (let row = template?.minRow || 3; row <= (template?.maxRow || 48); row += 1) {
      const existing = cellMap.get(`${row}:${pxColumn.col}`) || {};
      cellMap.set(`${row}:${pxColumn.col}`, {
        row,
        col: pxColumn.col,
        column: pxColumn.column,
        address: `${pxColumn.column}${row}`,
        value: row === 3 || row === 4 ? pxColumn.label : existing.value ?? null,
        formula: existing.formula || null,
        isFormula: Boolean(existing.isFormula),
      });
    }
  });
  activeHarvestFieldExtraColumns().forEach((fieldColumn) => {
    for (let row = template?.minRow || 3; row <= (template?.maxRow || 48); row += 1) {
      const existing = cellMap.get(`${row}:${fieldColumn.col}`) || {};
      const baseCell = cellMap.get(`${row}:${fieldColumn.baseCol}`);
      cellMap.set(`${row}:${fieldColumn.col}`, {
        row,
        col: fieldColumn.col,
        column: fieldColumn.column,
        address: `${fieldColumn.column}${row}`,
        value: row === 3 || row === 4 ? baseCell?.value ?? null : existing.value ?? null,
        formula: existing.formula || null,
        isFormula: Boolean(existing.isFormula),
      });
    }
  });
  activeHarvestCrewColumns().forEach((crew) => {
    for (let row = template?.minRow || 3; row <= (template?.maxRow || 48); row += 1) {
      const existing = cellMap.get(`${row}:${crew.col}`) || {};
      cellMap.set(`${row}:${crew.col}`, {
        row,
        col: crew.col,
        column: crew.column,
        address: `${crew.column}${row}`,
        value: row === 3 ? crew.category : row === 4 ? crew.name : existing.value ?? null,
        formula: existing.formula || null,
        isFormula: Boolean(existing.isFormula),
      });
    }
  });
  return cellMap;
}

function columnLetterFromIndex(index) {
  let value = Number(index);
  let text = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    text = String.fromCharCode(65 + remainder) + text;
    value = Math.floor((value - 1) / 26);
  }
  return text;
}

function harvestColumnList(startCol, endCol) {
  if (Array.isArray(startCol)) return startCol;
  const columns = [];
  for (let col = startCol; col <= endCol; col += 1) columns.push(col);
  return columns;
}

function isHarvestCrewColumn(col) {
  return activeHarvestCrewColumns().some((column) => column.col === col);
}

function isHarvestNoPackageColumn(col) {
  return col === harvestNoPackageColumn.col;
}

function isHarvestField3FColumn(col) {
  return harvestField3FColumns.some((column) => column.col === col);
}

function isHarvestPxReserveColumn(col) {
  return col === harvestPxReserveColumn.col;
}

function isHarvestPxStockColumn(col) {
  return col === harvestPxStockColumn.col;
}

function isHarvestPxInventoryColumn(col) {
  return isHarvestPxStockColumn(col) || isHarvestPxReserveColumn(col);
}

function isHarvestUnfinishedStockColumn(col) {
  return Number(col) === harvestUnfinishedStockColumn.col;
}

function isHarvestPriorityExcludedColumn(col) {
  return isHarvestUnfinishedStockColumn(col) || isHarvestPxInventoryColumn(Number(col));
}

function harvestCrewColumnByCol(col) {
  return activeHarvestCrewColumns().find((column) => column.col === col) || null;
}

function nextHarvestCustomColumnIndex() {
  const template = harvestTemplate();
  const prefix = `${harvestDate()}|${template?.sheetName || ""}|`;
  const used = activeHarvestCrewColumns().map((column) => column.col);
  Object.keys({ ...savedHarvestEntries, ...draftHarvestEntries }).forEach((key) => {
    if (!key.startsWith(prefix)) return;
    const columnLetter = key.split("|").at(-1);
    const col = columnIndexFromLetter(columnLetter);
    if (col >= 17 && col < harvestFieldExtraColumnStart && !isHarvestNoPackageColumn(col) && !isHarvestField3FColumn(col) && !isHarvestPxInventoryColumn(col)) used.push(col);
  });
  return Math.max(16, ...used) + 1;
}

function hasHarvestCrewColumnName(name, category) {
  const normalized = String(name || "").trim();
  return activeHarvestCrewColumns().some((column) => column.name === normalized && column.category === category);
}

function harvestMergeMaps() {
  const template = harvestTemplate();
  const origins = new Map();
  const covered = new Set();
  (template?.merges || []).forEach((merge) => {
    origins.set(`${merge.row}:${merge.col}`, merge);
    for (let row = merge.row; row < merge.row + merge.rowspan; row += 1) {
      for (let col = merge.col; col < merge.col + merge.colspan; col += 1) {
        if (row !== merge.row || col !== merge.col) covered.add(`${row}:${col}`);
      }
    }
  });
  return { origins, covered };
}

function isHarvestItemRow(row) {
  return (row >= 5 && row <= 40) || (row >= 42 && row <= 49);
}

function isHarvestSubtotalRow(row) {
  return Number(row) === harvestSubtotalRow;
}

function isHarvestGrandTotalRow(row) {
  return String(row) === harvestGrandTotalRow;
}

function harvestItemProducts() {
  return allHarvestProducts.filter((product) => isHarvestItemRow(product.rowIndex));
}

function harvestSubtotalProducts() {
  return allHarvestProducts.filter((product) => isHarvestItemRow(product.rowIndex) && product.rowIndex < harvestSubtotalRow);
}

function harvestAggregateProductsForRow(row) {
  if (isHarvestSubtotalRow(row)) return harvestSubtotalProducts();
  if (isHarvestGrandTotalRow(row)) return harvestItemProducts();
  return null;
}

function harvestAggregateSavedNumericValue(cellMap, row, col) {
  const products = harvestAggregateProductsForRow(row);
  if (!products) return harvestSavedNumericValue(cellMap, row, col);
  return products.reduce((sum, product) => sum + harvestSavedNumericValue(cellMap, product.rowIndex, col), 0);
}

function harvestHiddenRowSet(template = harvestTemplate()) {
  return new Set((template?.hiddenRows || []).map((row) => Number(row)).filter((row) => Number.isInteger(row)));
}

function isHarvestHiddenRow(rowIndex, template = harvestTemplate()) {
  return harvestHiddenRowSet(template).has(Number(rowIndex));
}

function isHarvestManualColumn(col) {
  return (col >= 3 && col <= 7)
    || (col >= 9 && col <= 12)
    || isHarvestField3FColumn(col)
    || isHarvestFieldExtraColumn(col)
    || isHarvestPxInventoryColumn(col)
    || isHarvestCrewColumn(col)
    || isHarvestNoPackageColumn(col);
}

function isHarvestEditableCell(cell) {
  if (isHarvestHiddenRow(cell.row)) return false;
  if (isHarvestNoPackageColumn(cell.col)) return isHarvestItemRow(cell.row) && !isHarvestSubtotalRow(cell.row);
  if (!isHarvestItemRow(cell.row) || cell.isFormula) return false;
  if (cell.row >= 42) return cell.col === 3 || isHarvestPxInventoryColumn(cell.col);
  return isHarvestManualColumn(cell.col);
}

function harvestProductName(rowIndex) {
  const product = harvestTemplate()?.products?.find((item) => item.rowIndex === rowIndex);
  return String(product?.productName || "");
}

function normalizeProductName(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/^有機/, "")
    .replace(/\[定\]/g, "");
}

function harvestProductCodeByName(productName) {
  const aliases = {
    京水菜: "京都水菜",
    空心: "空心菜",
    紅莧: "紅莧菜",
    白花菜: "白花椰菜",
  };
  const normalizedName = normalizeProductName(aliases[productName] || productName);
  const product = allProducts.find((item) => normalizeProductName(item.productName) === normalizedName);
  return product?.productCode === "#N/A" ? "" : product?.productCode || "";
}

function harvestProductForRow(rowIndex) {
  return allHarvestProducts.find((product) => product.rowIndex === rowIndex) || null;
}

function visibleHarvestRow(rowIndex, template = harvestTemplate()) {
  if (!isHarvestItemRow(rowIndex)) return true;
  if (isHarvestHiddenRow(rowIndex, template)) return false;
  const product = harvestProductForRow(rowIndex);
  if (!product) return true;
  return visibleHarvestProductSet().has(productFilterKey(product));
}

function harvestDraftValue(cell) {
  if (!isHarvestEditableCell(cell)) return cell.value;
  const template = harvestTemplate();
  const key = harvestEntryKey(harvestDate(), template?.sheetName || "", cell.row, cell.column);
  if (Object.prototype.hasOwnProperty.call(draftHarvestEntries, key)) return draftHarvestEntries[key];
  return cell.value;
}

function harvestSavedValue(cell) {
  if (!isHarvestEditableCell(cell)) return cell.value;
  const template = harvestTemplate();
  const key = harvestEntryKey(harvestDate(), template?.sheetName || "", cell.row, cell.column);
  if (Object.prototype.hasOwnProperty.call(savedHarvestEntries, key)) return savedHarvestEntries[key];
  return cell.value;
}

function parseHarvestInputValue(rawValue) {
  return String(rawValue ?? "").replace(/[(),，]/g, "").trim();
}

function harvestEditableInputValue(rawValue) {
  const unsigned = parseHarvestInputValue(rawValue).replace(/[^\d.]/g, "");
  const parts = unsigned.split(".");
  return parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];
}

function evaluateHarvestArithmeticFormula(rawFormula) {
  let formula = String(rawFormula ?? "")
    .trim()
    .replace(/^=/, "")
    .replace(/[＋]/g, "+")
    .replace(/[－]/g, "-")
    .replace(/[×＊]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[（）]/g, (char) => (char === "（" ? "(" : ")"))
    .replace(/，/g, ",")
    .replace(/,/g, "");
  if (!formula) return null;
  let index = 0;
  const peek = () => formula[index] || "";
  const consumeSpaces = () => {
    while (/\s/.test(peek())) index += 1;
  };
  const parseNumber = () => {
    consumeSpaces();
    const start = index;
    while (/\d|\./.test(peek())) index += 1;
    const text = formula.slice(start, index);
    if (!text || text === "." || (text.match(/\./g) || []).length > 1) {
      throw new Error("公式格式錯誤");
    }
    const value = Number(text);
    if (!Number.isFinite(value)) throw new Error("公式格式錯誤");
    return value;
  };
  const parseFactor = () => {
    consumeSpaces();
    if (peek() === "+") {
      index += 1;
      return parseFactor();
    }
    if (peek() === "-") {
      index += 1;
      return -parseFactor();
    }
    if (peek() === "(") {
      index += 1;
      const value = parseExpression();
      consumeSpaces();
      if (peek() !== ")") throw new Error("公式括號不完整");
      index += 1;
      return value;
    }
    return parseNumber();
  };
  const parseTerm = () => {
    let value = parseFactor();
    while (true) {
      consumeSpaces();
      const operator = peek();
      if (operator !== "*" && operator !== "/") return value;
      index += 1;
      const right = parseFactor();
      if (operator === "/" && right === 0) throw new Error("公式不可除以 0");
      value = operator === "*" ? value * right : value / right;
    }
  };
  const parseExpression = () => {
    let value = parseTerm();
    while (true) {
      consumeSpaces();
      const operator = peek();
      if (operator !== "+" && operator !== "-") return value;
      index += 1;
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
  };
  const result = parseExpression();
  consumeSpaces();
  if (index !== formula.length) throw new Error("公式只能包含數字、+、-、*、/ 和括號");
  if (!Number.isFinite(result)) throw new Error("公式計算結果錯誤");
  return Math.max(0, result);
}

function harvestInputDisplayValue(rawValue) {
  const normalizedRawValue = parseHarvestInputValue(rawValue);
  if (normalizedRawValue === "") return "";
  const value = Number(normalizedRawValue);
  return Number.isFinite(value) ? format.format(Math.max(0, value)) : "";
}

function harvestInputEditingValue(cell) {
  const value = harvestDraftValue(cell);
  const normalizedRawValue = parseHarvestInputValue(value);
  if (normalizedRawValue === "") return "";
  const numericValue = Number(normalizedRawValue);
  return Number.isFinite(numericValue) ? String(Math.max(0, numericValue)) : "";
}

function setDraftHarvestEntry(cell, rawValue) {
  const template = harvestTemplate();
  const key = harvestEntryKey(harvestDate(), template.sheetName, cell.row, cell.column);
  const normalizedRawValue = parseHarvestInputValue(rawValue);
  const value = normalizedRawValue === "" ? "" : Math.max(0, Number(normalizedRawValue));
  setDraftHarvestCellFormula(cell, "");
  if (value === "" || !Number.isFinite(value)) {
    delete draftHarvestEntries[key];
  } else {
    draftHarvestEntries[key] = value;
  }
}

function harvestNumericValue(cellMap, row, col) {
  const cell = cellMap.get(`${row}:${col}`);
  if (!cell) return 0;
  return n(harvestDraftValue(cell));
}

function harvestSavedNumericValue(cellMap, row, col) {
  const cell = cellMap.get(`${row}:${col}`);
  if (!cell) return 0;
  return n(harvestSavedValue(cell));
}

function harvestRangeSum(cellMap, row, startCol, endCol) {
  let total = 0;
  for (let col = startCol; col <= endCol; col += 1) {
    total += harvestNumericValue(cellMap, row, col);
  }
  return total;
}

function harvestPlanningTotalColumns() {
  return [
    3, 4, 5, harvestQuantityField3FColumn.col, 6, 7,
    harvestPxStockColumn.col, harvestPxReserveColumn.col, 9, 10, harvestUnfinishedField3FColumn.col, 11, 12,
    ...activeHarvestFieldExtraColumns().map((column) => column.col),
    ...activeHarvestCrewColumns().map((column) => column.col),
  ];
}

function harvestComputedValue(cell, cellMap) {
  const aggregateProducts = harvestAggregateProductsForRow(cell.row);
  if (aggregateProducts && ((cell.col >= 3 && cell.col <= 12) || isHarvestField3FColumn(cell.col) || isHarvestFieldExtraColumn(cell.col) || isHarvestPxInventoryColumn(cell.col) || isHarvestCrewColumn(cell.col) || isHarvestNoPackageColumn(cell.col))) {
    return aggregateProducts.reduce((sum, product) => sum + harvestSavedNumericValue(cellMap, product.rowIndex, cell.col), 0);
  }
  return null;
}

function harvestDisplayNumber(cellMap, row, col) {
  const cell = cellMap.get(`${row}:${col}`);
  if (!cell) return 0;
  const computed = harvestComputedValue(cell, cellMap);
  return computed === null ? n(harvestDraftValue(cell)) : n(computed);
}

function cityChannelTotalForRow(rowIndex, date = cityDate(), entries = draftCityEntries) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + cityChannelTotalForRow(product.rowIndex, date, entries), 0);
  const rowKey = `row:${rowIndex}`;
  return cityChannelColumns.reduce((sum, column) => sum + cityEntryValue(entries, date, rowKey, column.key), 0);
}

function cityChannelColumnValueForHarvestRow(rowIndex, columnKey, date = cityDate(), entries = draftCityEntries) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + cityChannelColumnValueForHarvestRow(product.rowIndex, columnKey, date, entries), 0);
  return cityEntryValue(entries, date, `row:${rowIndex}`, columnKey);
}

function yfyChannelTotalForRow(rowIndex, date = yfyDate(), entries = draftYfyEntries) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + yfyChannelTotalForRow(product.rowIndex, date, entries), 0);
  const rowKey = `row:${rowIndex}`;
  return yfyInputColumns.reduce((sum, column) => sum + yfyEntryValue(entries, date, rowKey, column.key), 0);
}

function yfyColumnValueForRow(rowIndex, columnKey, date = yfyDate(), entries = draftYfyEntries) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + yfyColumnValueForRow(product.rowIndex, columnKey, date, entries), 0);
  return yfyEntryValue(entries, date, `row:${rowIndex}`, columnKey);
}

function yfyConvertedTotalForRow(rowIndex, date = yfyDate(), entries = draftYfyEntries) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + yfyConvertedTotalForRow(product.rowIndex, date, entries), 0);
  const rowKey = `row:${rowIndex}`;
  return yfyEntryValue(entries, date, rowKey, "greenSafe") + yfyConvertedBaibaoValue(entries, date, rowKey);
}

function looseVegetableProductRowForHarvestRow(rowIndex) {
  const product = allHarvestProducts.find((item) => item.rowIndex === rowIndex);
  if (!product) return null;
  return {
    rowIndex: product.rowIndex,
    label: product.productName,
    section: product.rowIndex <= 40 ? "regular" : "other",
  };
}

function looseVegetableTotalForHarvestRow(
  rowIndex,
  date = looseVegetableDate(),
  entries = draftLooseVegetableEntries,
  columns = looseVegetableActiveDraftColumns(date),
) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + looseVegetableTotalForHarvestRow(product.rowIndex, date, entries, columns), 0);
  const row = looseVegetableProductRowForHarvestRow(rowIndex);
  if (!row || row.section !== "regular") return 0;
  return looseVegetableRowTotal(row, date, entries, columns);
}

function looseVegetableColumnValueForHarvestRow(rowIndex, columnKey, date = looseVegetableDate(), entries = draftLooseVegetableEntries) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + looseVegetableColumnValueForHarvestRow(product.rowIndex, columnKey, date, entries), 0);
  return looseVegetableEntryValue(entries, date, `row:${rowIndex}`, columnKey);
}

function generalChannelProductRowForHarvestRow(rowIndex) {
  const product = allHarvestProducts.find((item) => item.rowIndex === rowIndex);
  if (!product) return null;
  return {
    rowIndex: product.rowIndex,
    label: product.productName,
    section: product.rowIndex <= 40 ? "regular" : "other",
  };
}

function generalChannelTotalForHarvestRow(
  rowIndex,
  date = generalChannelDate(),
  entries = draftGeneralChannelEntries,
  columns = draftGeneralChannelColumns,
  puqianEntries = draftGeneralChannelPuqianEntries,
) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) {
    return aggregateProducts.reduce((sum, product) => (
      sum + generalChannelTotalForHarvestRow(product.rowIndex, date, entries, columns, puqianEntries)
    ), 0);
  }
  const row = generalChannelProductRowForHarvestRow(rowIndex);
  if (!row) return 0;
  return generalChannelRowTotal(row, date, entries, columns, puqianEntries);
}

function generalChannelColumnValueForHarvestRow(
  rowIndex,
  columnKey,
  date = generalChannelDate(),
  entries = draftGeneralChannelEntries,
  columns = draftGeneralChannelColumns,
  puqianEntries = draftGeneralChannelPuqianEntries,
) {
  const aggregateProducts = harvestAggregateProductsForRow(rowIndex);
  if (aggregateProducts) {
    return aggregateProducts.reduce((sum, product) => (
      sum + generalChannelColumnValueForHarvestRow(product.rowIndex, columnKey, date, entries, columns, puqianEntries)
    ), 0);
  }
  const row = generalChannelProductRowForHarvestRow(rowIndex);
  const column = columns.find((item) => item.key === columnKey);
  if (!row || !column) return 0;
  return generalChannelColumnValue(column, row, date, entries, puqianEntries);
}

function harvestRowTotal(cellMap, row, shipmentRoundColumns = [], options = {}) {
  const aggregateProducts = harvestAggregateProductsForRow(row);
  if (aggregateProducts) return aggregateProducts.reduce((sum, product) => sum + harvestRowTotal(cellMap, product.rowIndex, shipmentRoundColumns, options), 0);
  const planningTotalColumns = harvestPlanningTotalColumns().filter((col) => {
    if (options.excludePxInventoryColumns && isHarvestPxInventoryColumn(col)) return false;
    if (options.excludeUnfinishedStockColumn && isHarvestUnfinishedStockColumn(col)) return false;
    return true;
  });
  const total = planningTotalColumns.reduce((sum, col) => sum + harvestSavedNumericValue(cellMap, row, col), 0);
  const noPackage = harvestSavedNumericValue(cellMap, row, harvestNoPackageColumn.col);
  const shipped = options.dailyShipmentTotals
    ? harvestDailyShipmentValue(row, options.dailyShipmentTotals)
    : shipmentRoundColumns.reduce((sum, roundColumn) => sum + harvestShipmentRoundValue(roundColumn, row), 0);
  const cityTotal = options.includeCityTotal
    ? cityChannelTotalForRow(row, options.cityDate || cityDate(), options.cityEntries || draftCityEntries)
    : 0;
  const yfyTotal = options.includeYfyTotal
    ? yfyConvertedTotalForRow(row, options.yfyDate || yfyDate(), options.yfyEntries || draftYfyEntries)
    : 0;
  const looseVegetableTotal = options.includeLooseVegetableTotal
    ? looseVegetableTotalForHarvestRow(
      row,
      options.looseVegetableDate || looseVegetableDate(),
      options.looseVegetableEntries || draftLooseVegetableEntries,
      options.looseVegetableColumns || looseVegetableActiveDraftColumns(options.looseVegetableDate || looseVegetableDate()),
    )
    : 0;
  const generalChannelTotal = options.includeGeneralChannelTotal
    ? generalChannelTotalForHarvestRow(
      row,
      options.generalChannelDate || generalChannelDate(),
      options.generalChannelEntries || draftGeneralChannelEntries,
      options.generalChannelColumns || draftGeneralChannelColumns,
      options.generalChannelPuqianEntries || draftGeneralChannelPuqianEntries,
    )
    : 0;
  return total - noPackage - shipped - cityTotal - yfyTotal - looseVegetableTotal - generalChannelTotal;
}

function harvestInventorySourceLabel(col, section = "") {
  if (col === 3) return "庫存";
  if (col === harvestPxStockColumn.col) return harvestPxStockColumn.label;
  if (col === harvestPxReserveColumn.col) return harvestPxReserveColumn.label;
  const crewColumn = harvestCrewColumnByCol(col);
  if (crewColumn) return `其他農場 ${[crewColumn.category, crewColumn.name].filter(Boolean).join(" ")}`;
  const baseCol = harvestFieldBaseColumn(col);
  const baseLabel = harvestFieldBaseDisplayLabel(section, baseCol);
  const extraColumn = harvestFieldExtraColumnByCol(col);
  const extraLabel = extraColumn ? ` 新增${harvestFieldExtraOrdinal(extraColumn)}` : "";
  if (section === "unfinished") return `${baseLabel}${extraLabel} 未包完`;
  if (section === "quantity") return `${baseLabel}${extraLabel} 採收`;
  return baseLabel || columnLetterFromIndex(col);
}

function harvestInventorySourceColumns() {
  let sourceOrder = 0;
  const sources = [
    { col: 3, fixedOrder: 1, label: "庫存", sourceOrder: sourceOrder++ },
    { col: harvestPxStockColumn.col, fixedOrder: 2, label: harvestPxStockColumn.label, sourceOrder: sourceOrder++ },
    { col: harvestPxReserveColumn.col, fixedOrder: 3, label: harvestPxReserveColumn.label, sourceOrder: sourceOrder++ },
  ];
  const appendFieldSource = (col, section) => {
    sources.push({
      col,
      section,
      label: harvestInventorySourceLabel(col, section),
      sourceOrder: sourceOrder++,
    });
  };
  harvestUnfinishedBaseFieldColumns.forEach((col) => appendFieldSource(col, "unfinished"));
  activeHarvestFieldExtraColumns()
    .filter((column) => column.section === "unfinished")
    .forEach((column) => appendFieldSource(column.col, "unfinished"));
  harvestQuantityBaseFieldColumns.forEach((col) => appendFieldSource(col, "quantity"));
  activeHarvestFieldExtraColumns()
    .filter((column) => column.section === "quantity")
    .forEach((column) => appendFieldSource(column.col, "quantity"));
  activeHarvestCrewColumns().forEach((column) => {
    sources.push({
      col: column.col,
      label: harvestInventorySourceLabel(column.col),
      sourceOrder: sourceOrder++,
    });
  });
  return sources;
}

function harvestInventorySourceSortKey(source) {
  if (typeof source.fixedOrder === "number") return [0, source.fixedOrder, source.sourceOrder];
  if (source.priority) return [1, source.priority, source.sourceOrder];
  return [2, 0, source.sourceOrder];
}

function compareHarvestInventorySources(a, b) {
  const aKey = harvestInventorySourceSortKey(a);
  const bKey = harvestInventorySourceSortKey(b);
  for (let index = 0; index < aKey.length; index += 1) {
    if (aKey[index] !== bKey[index]) return aKey[index] - bKey[index];
  }
  return 0;
}

function harvestPackagingChannelQuantity(row, channelKey, options = {}) {
  if (channelKey === "city") {
    return cityChannelTotalForRow(row, options.cityDate || cityDate(), options.cityEntries || savedCityEntries);
  }
  if (channelKey === "generalChannel") {
    return generalChannelTotalForHarvestRow(
      row,
      options.generalChannelDate || generalChannelDate(),
      options.generalChannelEntries || savedGeneralChannelEntries,
      options.generalChannelColumns || savedGeneralChannelColumns,
      options.generalChannelPuqianEntries || savedGeneralChannelPuqianEntries,
    );
  }
  if (channelKey === "looseVegetable") {
    return looseVegetableTotalForHarvestRow(
      row,
      options.looseVegetableDate || looseVegetableDate(),
      options.looseVegetableEntries || savedLooseVegetableEntries,
      options.looseVegetableColumns || looseVegetableActiveSavedColumns(options.looseVegetableDate || looseVegetableDate()),
    );
  }
  if (channelKey === "yfy") {
    return yfyConvertedTotalForRow(row, options.yfyDate || yfyDate(), options.yfyEntries || savedYfyEntries);
  }
  return 0;
}

function consumeHarvestInventorySources(sources, rawQuantity, { allowPxInventory = true } = {}) {
  let quantity = Math.max(0, n(rawQuantity));
  let activeSource = null;
  if (!quantity) return activeSource;
  sources.forEach((source) => {
    if (!quantity || source.remaining <= 0) return;
    if (!allowPxInventory && isHarvestPxInventoryColumn(source.col)) return;
    const used = Math.min(source.remaining, quantity);
    if (!used) return;
    source.remaining -= used;
    quantity -= used;
    activeSource = source;
  });
  return activeSource;
}

function harvestActiveInventorySourceMap(cellMap, shipmentRoundColumns = harvestShipmentRoundColumns(), totalOptions = harvestInventoryTotalOptions()) {
  const activeSources = new Map();
  const sourceColumns = harvestInventorySourceColumns();
  const packagedChannels = activeHarvestPackagedChannels();
  allHarvestProducts
    .filter((product) => isHarvestItemRow(product.rowIndex) && visibleHarvestRow(product.rowIndex))
    .forEach((product) => {
      const row = product.rowIndex;
      const sources = sourceColumns
        .map((source) => {
          const quantity = harvestSavedNumericValue(cellMap, row, source.col);
          if (!quantity || quantity <= 0) return null;
          const cell = cellMap.get(`${row}:${source.col}`) || {
            row,
            col: source.col,
            column: columnLetterFromIndex(source.col),
            value: "",
            isFormula: false,
          };
          return {
            ...source,
            quantity,
            priority: typeof source.fixedOrder === "number" ? 0 : harvestPriorityForCell(cell),
          };
        })
        .filter(Boolean)
        .sort(compareHarvestInventorySources);
      if (!sources.length) return;
      const sourceTotal = sources.reduce((sum, source) => sum + source.quantity, 0);
      const noPackage = harvestSavedNumericValue(cellMap, row, harvestNoPackageColumn.col);
      const usableSourceTotal = Math.max(0, sourceTotal - noPackage);
      if (!usableSourceTotal) return;
      let remainingUsableQuantity = usableSourceTotal;
      const usableSources = sources
        .map((source) => {
          const quantity = Math.min(source.quantity, remainingUsableQuantity);
          remainingUsableQuantity -= quantity;
          return quantity > 0 ? { ...source, quantity } : null;
        })
        .filter(Boolean);
      if (!usableSources.length) return;
      const allocationSources = usableSources.map((source) => ({ ...source, remaining: source.quantity }));
      let activeSource = consumeHarvestInventorySources(
        allocationSources,
        harvestDailyShipmentValue(row, totalOptions.dailyShipmentTotals || dailyShipmentProductTotals()),
        { allowPxInventory: true },
      );
      harvestPackagingAllocationChannelKeys.forEach((channelKey) => {
        if (!packagedChannels[channelKey]) return;
        const channelActiveSource = consumeHarvestInventorySources(
          allocationSources,
          harvestPackagingChannelQuantity(row, channelKey, totalOptions),
          { allowPxInventory: false },
        );
        if (channelActiveSource) activeSource = channelActiveSource;
      });
      if (!activeSource) activeSource = allocationSources.find((source) => source.remaining > 0) || allocationSources.at(-1);
      if (activeSource) activeSources.set(row, activeSource);
    });
  return activeSources;
}

function harvestActiveInventorySourceText(source) {
  if (!source) return "";
  const priorityText = source.priority ? `P${source.priority} ` : "";
  return `目前使用來源：${priorityText}${source.label}`;
}

function harvestInventoryTotalOptions(overrides = {}) {
  const looseVegetableTotalDate = overrides.looseVegetableDate || looseVegetableDate();
  return {
    includeCityTotal: true,
    includeYfyTotal: true,
    includeLooseVegetableTotal: false,
    includeGeneralChannelTotal: true,
    dailyShipmentTotals: dailyShipmentProductTotals(),
    cityEntries: savedCityEntries,
    yfyEntries: savedYfyEntries,
    looseVegetableEntries: savedLooseVegetableEntries,
    looseVegetableColumns: looseVegetableActiveSavedColumns(looseVegetableTotalDate),
    generalChannelEntries: savedGeneralChannelEntries,
    generalChannelColumns: savedGeneralChannelColumns,
    generalChannelPuqianEntries: savedGeneralChannelPuqianEntries,
    ...overrides,
  };
}

function harvestChannelInventoryTotalOptions(overrides = {}) {
  return harvestInventoryTotalOptions({
    excludePxInventoryColumns: true,
    ...overrides,
  });
}

function harvestChannelInventoryTotalOptionsWithoutUnfinishedStock(overrides = {}) {
  return harvestChannelInventoryTotalOptions({
    excludeUnfinishedStockColumn: true,
    ...overrides,
  });
}

function harvestInventoryRowTotal(cellMap, row, shipmentRoundColumns = harvestShipmentRoundColumns(), options = {}) {
  return harvestRowTotal(cellMap, row, shipmentRoundColumns, harvestInventoryTotalOptions(options));
}

function harvestRowTotalLookup(salesRows = []) {
  const template = harvestTemplate();
  if (!template || !harvestDate()) return { byCode: new Map(), byName: new Map(), bySalesIndex: [] };
  const cellMap = harvestCellMap();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const totalOptions = harvestInventoryTotalOptions();
  const byCode = new Map();
  const byName = new Map();
  const totalsByHarvestIndex = [];
  for (const product of allHarvestProducts) {
    const total = harvestRowTotal(cellMap, product.rowIndex, shipmentRoundColumns, totalOptions);
    totalsByHarvestIndex.push(total);
    if (product.productCode) byCode.set(product.productCode, total);
    byName.set(normalizeProductName(product.productName), total);
  }
  const bySalesIndex = salesRows.map((row, index) => {
    if (byCode.has(row.productCode)) return byCode.get(row.productCode);
    const byNormalizedName = byName.get(normalizeProductName(row.productName));
    return byNormalizedName === undefined ? totalsByHarvestIndex[index] || 0 : byNormalizedName;
  });
  return { byCode, byName, bySalesIndex };
}

function harvestTotalForSalesRow(row, lookup, index = -1) {
  if (lookup.byCode.has(row.productCode)) return lookup.byCode.get(row.productCode);
  const byName = lookup.byName.get(normalizeProductName(row.productName));
  if (byName !== undefined) return byName;
  return index >= 0 ? n(lookup.bySalesIndex[index]) : 0;
}

function harvestNoPackageDisplayValue(cell) {
  const value = n(harvestDraftValue(cell));
  return value ? `(${format.format(value)})` : "";
}

function harvestNoPackageSubtotalDisplayValue(cell, cellMap) {
  const value = n(harvestComputedValue(cell, cellMap));
  return value ? `(${format.format(value)})` : "";
}

function harvestInputMarkup(cell, value, options = {}) {
  const priorityEnabled = isHarvestPriorityCell(cell);
  const priority = priorityEnabled ? harvestPriorityForCell(cell) : 0;
  const inputType = options.type || "text";
  const inputClass = ["harvest-input", options.inputClass || ""].filter(Boolean).join(" ");
  const attrs = 'inputmode="decimal"';
  const wrapperClasses = [
    "harvest-input-wrap",
    priority ? `harvest-priority-${priority}` : "",
  ].filter(Boolean).join(" ");
  return `<span class="${wrapperClasses}">
    <input class="${inputClass}" type="${inputType}" ${attrs} value="${escapeAttribute(value ?? "")}" data-row="${cell.row}" data-col="${cell.col}" data-priority-enabled="${priorityEnabled ? "true" : "false"}" />
    ${harvestPriorityBadge(priority)}
  </span>`;
}

function harvestCellDisplay(cell, cellMap) {
  const computed = harvestComputedValue(cell, cellMap);
  const value = computed === null ? harvestDraftValue(cell) : computed;
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return value ? format.format(value) : "";
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function harvestHeaderText(cellMap, row, col, fallback = "") {
  const cell = cellMap.get(`${row}:${col}`);
  const value = cell?.value;
  if (value === null || value === undefined || value === "") return fallback;
  if (String(value).match(/^\d{4}-\d{2}-\d{2}/)) return formatDateShort(String(value).slice(0, 10));
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function harvestHeaderRawText(cellMap, row, col, fallback = "") {
  const cell = cellMap.get(`${row}:${col}`);
  const value = cell?.value;
  if (value === null || value === undefined || value === "") return fallback;
  if (String(value).match(/^\d{4}-\d{2}-\d{2}/)) return formatDateShort(String(value).slice(0, 10));
  return String(value).replace(/\s+/g, " ").trim();
}

function harvestHeaderClass(text) {
  return String(text || "").replace(/<br \/>/g, "").trim() === "轉型" ? " harvest-transform-header" : "";
}

function harvestHeaderPlainText(text) {
  return String(text || "").replace(/<br \/>/g, "").trim();
}

function harvestExportText(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function harvestExportProductName(row, cellMap) {
  const cell = cellMap.get(`${row}:2`);
  const cellValue = cell ? harvestDraftValue(cell) : "";
  return harvestExportText(cellValue) || harvestProductName(row) || (isHarvestSubtotalRow(row) ? "小計" : "");
}

function harvestExportNumber(value) {
  const numeric = n(value);
  return numeric ? numeric : "";
}

function harvestExportRowTotal(values) {
  return values.slice(1).reduce((sum, value) => sum + n(value), 0);
}

function harvestShipmentExportFilename(date) {
  return `${date || "未選擇日期"}_採收到貨量.xlsx`;
}

function yfyExportHeaderLabel(column) {
  return Array.isArray(column.labelLines) ? column.labelLines.join(" ") : column.label;
}

function harvestShipmentExportPayload() {
  const template = harvestTemplate();
  const date = harvestDate();
  if (!template || !date) return null;
  const cellMap = harvestCellMap();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const totalOptions = harvestInventoryTotalOptions();
  const looseVegetableDateForExport = totalOptions.looseVegetableDate || looseVegetableDate();
  const looseVegetableColumns = totalOptions.looseVegetableColumns || looseVegetableActiveSavedColumns(looseVegetableDateForExport);
  const generalChannelColumns = totalOptions.generalChannelColumns || savedGeneralChannelColumns;
  const exportRows = visibleHarvestRows(template);
  const cityDateForExport = totalOptions.cityDate || cityDate();
  const cityEntriesForExport = totalOptions.cityEntries || draftCityEntries;
  const activeCityChannelColumns = cityChannelColumns.filter((column) =>
    exportRows.some((row) => n(cityChannelColumnValueForHarvestRow(row, column.key, cityDateForExport, cityEntriesForExport)) > 0),
  );
  const columns = [
    { key: "productName", label: "品項" },
    ...looseVegetableColumns.map((column) => ({ key: `loose:${column.key}`, label: column.label })),
    ...yfyInputColumns.map((column) => ({ key: `yfy:${column.key}`, label: yfyExportHeaderLabel(column) })),
    ...activeCityChannelColumns.map((column) => ({ key: `city:${column.key}`, label: column.label })),
    ...(activeCityChannelColumns.length ? [{ key: "cityTotal", label: "city總數" }] : []),
    ...generalChannelColumns.map((column) => ({ key: `general:${column.key}`, label: column.label })),
    ...shipmentRoundColumns.map((column) => ({ key: `round:${column.id}`, label: `${column.label} 到貨` })),
    { key: "rowTotal", label: "加總" },
  ];
  const rows = exportRows.map((row) => {
    const looseValues = looseVegetableColumns.map((column) => harvestExportNumber(looseVegetableColumnValueForHarvestRow(
      row,
      column.key,
      looseVegetableDateForExport,
      totalOptions.looseVegetableEntries || draftLooseVegetableEntries,
    )));
    const yfyValues = yfyInputColumns.map((column) => harvestExportNumber(yfyColumnValueForRow(
      row,
      column.key,
      totalOptions.yfyDate || yfyDate(),
      totalOptions.yfyEntries || draftYfyEntries,
    )));
    const cityValues = activeCityChannelColumns.map((column) => harvestExportNumber(cityChannelColumnValueForHarvestRow(
      row,
      column.key,
      cityDateForExport,
      cityEntriesForExport,
    )));
    const cityTotal = harvestExportNumber(harvestExportRowTotal(["", ...cityValues]));
    const generalValues = generalChannelColumns.map((column) => harvestExportNumber(generalChannelColumnValueForHarvestRow(
      row,
      column.key,
      totalOptions.generalChannelDate || generalChannelDate(),
      totalOptions.generalChannelEntries || draftGeneralChannelEntries,
      generalChannelColumns,
      totalOptions.generalChannelPuqianEntries || draftGeneralChannelPuqianEntries,
    )));
    const shipmentValues = shipmentRoundColumns.map((column) => harvestExportNumber(harvestShipmentRoundValue(column, row)));
    const values = [
      harvestExportProductName(row, cellMap),
      ...looseValues,
      ...yfyValues,
      ...cityValues,
      ...(activeCityChannelColumns.length ? [cityTotal] : []),
      ...generalValues,
      ...shipmentValues,
    ];
    const totalValues = [
      harvestExportProductName(row, cellMap),
      ...looseValues,
      ...yfyValues,
      ...cityValues,
      ...generalValues,
      ...shipmentValues,
    ];
    return { values: [...values, harvestExportNumber(harvestExportRowTotal(totalValues))] };
  });
  return { shipmentDate: date, columns, rows };
}

async function exportHarvestShipmentExcel() {
  const payload = harvestShipmentExportPayload();
  if (!payload) {
    alert("請先選擇到貨日期。");
    return;
  }
  if (!payload.rows.length) {
    alert("目前沒有可匯出的到貨量表格內容。");
    return;
  }
  try {
    const response = await fetch("/api/export-harvest-shipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let message = "匯出 Excel 失敗";
      try {
        const result = await response.json();
        if (result?.error) message = result.error;
      } catch {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = harvestShipmentExportFilename(payload.shipmentDate);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert(`匯出 Excel 失敗：${error.message}`);
  }
}

function harvestOtherFarmTableRows() {
  const template = harvestTemplate();
  if (!template) return [];
  const cellMap = harvestCellMap();
  return allHarvestProducts
    .filter((product) => isHarvestItemRow(product.rowIndex) && visibleHarvestRow(product.rowIndex))
    .map((product) => ({ ...product, cellMap }));
}

function harvestLargeLabelLastRowIndex() {
  const product = allHarvestProducts.find((item) => normalizeProductName(item.productName).includes("香菜"));
  return product ? product.rowIndex : Infinity;
}

function harvestLargeLabelTableRows() {
  const lastRowIndex = harvestLargeLabelLastRowIndex();
  return harvestOtherFarmTableRows().filter((row) => row.rowIndex <= lastRowIndex);
}

function harvestOtherFarmVisibleColumns(rows) {
  return activeHarvestCrewColumns().filter((column) =>
    rows.some((row) => {
      const cell = row.cellMap.get(`${row.rowIndex}:${column.col}`);
      return cell && n(harvestDraftValue(cell)) > 0;
    }),
  );
}

function harvestOtherFarmColumnValue(row, column) {
  const cell = row.cellMap.get(`${row.rowIndex}:${column.col}`);
  return cell ? n(harvestDraftValue(cell)) : 0;
}

function harvestOtherFarmRowValues(row, crewColumns) {
  return crewColumns.map((column) => harvestOtherFarmColumnValue(row, column));
}

function harvestLargeLabelPriorityClass(cell) {
  return cell && isHarvestPriorityCell(cell) ? harvestPriorityClass(cell) : "";
}

function harvestLargeLabelPriorityBadge(cell) {
  return cell && isHarvestPriorityCell(cell) ? harvestPriorityBadge(harvestPriorityForCell(cell)) : "";
}

function harvestLargeLabelPriorityColor(cell) {
  const priority = cell && isHarvestPriorityCell(cell) ? harvestPriorityForCell(cell) : 0;
  return harvestPriorityColors[priority] || "";
}

function harvestFieldColumnsWithExtras(section, baseColumns) {
  const extras = activeHarvestFieldExtraColumns().filter((column) => column.section === section);
  return baseColumns.flatMap((col) => [
    col,
    ...extras.filter((column) => column.baseCol === col).map((column) => column.col),
  ]);
}

function harvestQuantityTableColumns() {
  const field3FExpanded = activeHarvestField3FExpanded();
  return harvestFieldColumnsWithExtras("quantity", [
    2, 4, 5,
    ...(field3FExpanded.quantity ? [harvestQuantityField3FColumn.col] : []),
    6, 7,
  ]);
}

function harvestUnfinishedTableColumns() {
  const field3FExpanded = activeHarvestField3FExpanded();
  return harvestFieldColumnsWithExtras("unfinished", [
    2, 3, harvestPxStockColumn.col, harvestPxReserveColumn.col, 9, 10,
    ...(field3FExpanded.unfinished ? [harvestUnfinishedField3FColumn.col] : []),
    11, 12,
  ]);
}

function harvestLargeLabelPlanningColumns() {
  const quantityColumns = harvestQuantityTableColumns()
    .filter((col) => col !== 2)
    .map((col, index) => ({
      col,
      section: "quantity",
      isSectionStart: index === 0,
    }));
  const unfinishedColumns = harvestUnfinishedTableColumns()
    .filter((col) => col !== 2 && col !== 3 && !isHarvestPxInventoryColumn(col))
    .map((col, index) => ({
      col,
      section: "unfinished",
      isSectionStart: index === 0,
    }));
  return [...quantityColumns, ...unfinishedColumns];
}

function harvestLargeLabelPlanningHeaderColorClass(column) {
  const col = harvestFieldBaseColumn(column.col);
  if ([4, 9].includes(col)) return "harvest-large-label-header-one-two";
  if ([5, 10].includes(col)) return "harvest-large-label-header-three";
  if ([6, 11].includes(col)) return "harvest-large-label-header-four";
  if ([7, 12].includes(col)) return "harvest-large-label-header-five";
  if ([harvestQuantityField3FColumn.col, harvestUnfinishedField3FColumn.col].includes(col)) {
    return "harvest-large-label-header-three-f";
  }
  return "";
}

function harvestPlanningHeaderColorClass(col) {
  if (isHarvestCrewColumn(col)) return "harvest-large-label-other-farm-header";
  return harvestLargeLabelPlanningHeaderColorClass({ col });
}

function harvestPlanningHeaderColor(col) {
  if (isHarvestCrewColumn(col)) return harvestLargeLabelColors.otherFarmHeader;
  return harvestLargeLabelPlanningHeaderColor({ col });
}

function harvestLargeLabelPlanningHeaderColor(column) {
  const col = harvestFieldBaseColumn(column.col);
  if ([4, 9].includes(col)) return harvestLargeLabelColors.oneTwoHeader;
  if ([5, 10].includes(col)) return harvestLargeLabelColors.threeHeader;
  if ([6, 11].includes(col)) return harvestLargeLabelColors.fourHeader;
  if ([7, 12].includes(col)) return harvestLargeLabelColors.fiveHeader;
  if ([harvestQuantityField3FColumn.col, harvestUnfinishedField3FColumn.col].includes(col)) {
    return harvestLargeLabelColors.threeFHeader;
  }
  return "";
}

function harvestLargeLabelPlanningHeaderText(cellMap, column, row) {
  const baseCol = harvestFieldBaseColumn(column.col);
  const columnLetter = columnLetterFromIndex(baseCol);
  const headerText = (headerRow, fallback = "") => {
    const cell = cellMap.get(`${headerRow}:${baseCol}`);
    const value = cell?.value;
    if (value === null || value === undefined || value === "") return fallback;
    if (String(value).match(/^\d{4}-\d{2}-\d{2}/)) return formatDateShort(String(value).slice(0, 10));
    return String(value);
  };
  const firstText = headerText(3, headerText(4, columnLetter));
  const secondText = headerText(4, firstText || columnLetter);
  const quantityHeaderNames = {
    4: "林聖智",
    5: "黃麗惠",
    [harvestQuantityField3FColumn.col]: "林聖智",
    6: "林育愷",
    7: "林聖智",
  };
  return row === 3
    ? column.section === "quantity"
      ? quantityHeaderNames[baseCol] || harvestExportText(firstText)
      : column.section === "unfinished"
        ? "未包完"
        : firstText
    : secondText;
}

function harvestLargeLabelPlanningHeaderCell(cellMap, column, row) {
  const columnLetter = columnLetterFromIndex(column.col);
  const text = harvestLargeLabelPlanningHeaderText(cellMap, column, row);
  const classes = [
    "num",
    "harvest-large-label-plan-col",
    `harvest-large-label-${column.section}-col`,
    column.isSectionStart ? "harvest-large-label-section-start" : "",
    `harvest-col-${columnLetter}`,
    harvestLargeLabelPlanningHeaderColorClass(column),
    harvestHeaderClass(text).trim(),
  ].filter(Boolean).join(" ");
  return `<th class="${classes}">${escapeHtml(text).replace(/\n/g, "<br />")}</th>`;
}

function harvestLargeLabelPlanningValue(row, column) {
  const cell = row.cellMap.get(`${row.rowIndex}:${column.col}`);
  if (!cell) return "";
  return harvestCellDisplay(cell, row.cellMap);
}

function harvestLargeLabelPlanningNumber(row, column) {
  return harvestDisplayNumber(row.cellMap, row.rowIndex, column.col);
}

function harvestLargeLabelNumberText(value) {
  return value ? numberText(value) : "";
}

function harvestLargeLabelNoPackageValue(row) {
  const cell = row.cellMap.get(`${row.rowIndex}:${harvestNoPackageColumn.col}`);
  return cell ? harvestNoPackageDisplayValue(cell) : "";
}

function harvestLargeLabelNoPackageNumber(row) {
  const cell = row.cellMap.get(`${row.rowIndex}:${harvestNoPackageColumn.col}`);
  return cell ? n(harvestDraftValue(cell)) : 0;
}

function harvestLargeLabelNoPackageClass(value) {
  return n(value) ? "harvest-negative-total" : "";
}

function harvestLargeLabelNoPackageTotalText(value) {
  return value ? `(${format.format(Math.abs(value))})` : "";
}

function harvestLargeLabelYfyValue(row, column, totalOptions) {
  const value = harvestLargeLabelYfyNumber(row, column, totalOptions);
  return value ? format.format(value) : "";
}

function harvestLargeLabelYfyNumber(row, column, totalOptions) {
  const value = yfyColumnValueForRow(
    row.rowIndex,
    column.key,
    totalOptions.yfyDate || yfyDate(),
    totalOptions.yfyEntries || draftYfyEntries,
  );
  return n(value);
}

function harvestLargeLabelInventoryTotal(row, shipmentRoundColumns, totalOptions) {
  return harvestRowTotal(row.cellMap, row.rowIndex, shipmentRoundColumns, totalOptions);
}

function harvestLargeLabelPrintDayNumber(date = harvestDate()) {
  const parsed = parseDateValue(date);
  if (!parsed) return "";
  const year = parsed.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const dayOfYear = Math.floor((parsed - firstDay) / 86400000) + 1;
  const daysInYear = Math.floor((new Date(year, 11, 31) - firstDay) / 86400000) + 1;
  const nextDayOfYear = dayOfYear + 1;
  return nextDayOfYear > daysInYear ? 1 : nextDayOfYear;
}

function harvestLargeLabelPrintDayHeader() {
  const dayNumber = harvestLargeLabelPrintDayNumber();
  return `列印第${dayNumber}天<br />太陽日`;
}

function harvestLargeLabelSolarDayValue(row, inventoryTotal) {
  const pxReserve = harvestSavedNumericValue(row.cellMap, row.rowIndex, harvestPxReserveColumn.col);
  return inventoryTotal - pxReserve;
}

function renderHarvestLargeLabelControls() {
  return `<div class="harvest-large-label-controls">
    <div class="harvest-large-label-control">
      <span>採收數量 3場F</span>
      ${renderHarvestField3FGroupButton("quantity")}
    </div>
    <div class="harvest-large-label-control">
      <span>未包完 3場F</span>
      ${renderHarvestField3FGroupButton("unfinished")}
    </div>
    <button id="exportHarvestLargeLabelBtn" type="button">匯出 Excel</button>
  </div>`;
}

function harvestLargeLabelExportFilename(date) {
  return `${date || "未選擇日期"}_大標.xlsx`;
}

function harvestLargeLabelExportValue(value) {
  const numeric = n(value);
  return numeric ? numeric : "";
}

function harvestLargeLabelExportNegativeValue(value) {
  const numeric = n(value);
  return numeric ? -Math.abs(numeric) : "";
}

function harvestLargeLabelExportCell(value, options = {}) {
  return {
    value,
    backgroundColor: options.backgroundColor || "",
    bold: Boolean(options.bold),
  };
}

function harvestLargeLabelExportPayload() {
  const template = harvestTemplate();
  const date = harvestDate();
  if (!template || !date) return null;
  const productRows = harvestLargeLabelTableRows();
  const crewColumns = harvestOtherFarmVisibleColumns(productRows);
  const planningColumns = harvestLargeLabelPlanningColumns();
  const cellMap = productRows[0]?.cellMap || harvestCellMap();
  const totalOptions = harvestInventoryTotalOptions();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const columnCount = 1 + crewColumns.length + planningColumns.length + 1 + yfyInputColumns.length + 2;
  const emptyHeaderRow = () => Array.from({ length: columnCount }, () => harvestLargeLabelExportCell("", { bold: true }));
  const rows = [emptyHeaderRow(), emptyHeaderRow()];
  const merges = [];
  const mergeHeaderColumn = (col) => merges.push({ startRow: 1, startCol: col, endRow: 2, endCol: col });

  let col = 1;
  rows[0][col - 1] = harvestLargeLabelExportCell("品項", { bold: true });
  mergeHeaderColumn(col);
  col += 1;

  crewColumns.forEach((column) => {
    rows[0][col - 1] = harvestLargeLabelExportCell(column.category, {
      backgroundColor: harvestLargeLabelColors.otherFarmHeader,
      bold: true,
    });
    rows[1][col - 1] = harvestLargeLabelExportCell(column.name, {
      backgroundColor: harvestLargeLabelColors.otherFarmHeader,
      bold: true,
    });
    col += 1;
  });

  planningColumns.forEach((column) => {
    const backgroundColor = harvestLargeLabelPlanningHeaderColor(column);
    rows[0][col - 1] = harvestLargeLabelExportCell(harvestLargeLabelPlanningHeaderText(cellMap, column, 3), {
      backgroundColor,
      bold: true,
    });
    rows[1][col - 1] = harvestLargeLabelExportCell(harvestLargeLabelPlanningHeaderText(cellMap, column, 4), {
      backgroundColor,
      bold: true,
    });
    col += 1;
  });

  rows[0][col - 1] = harvestLargeLabelExportCell("不包裝", { bold: true });
  mergeHeaderColumn(col);
  col += 1;

  yfyInputColumns.forEach((column) => {
    rows[0][col - 1] = harvestLargeLabelExportCell(yfyExportHeaderLabel(column), { bold: true });
    mergeHeaderColumn(col);
    col += 1;
  });

  rows[0][col - 1] = harvestLargeLabelExportCell("庫存總數", { bold: true });
  mergeHeaderColumn(col);
  col += 1;

  rows[0][col - 1] = harvestLargeLabelExportCell(harvestExportText(harvestLargeLabelPrintDayHeader()), {
    backgroundColor: harvestLargeLabelColors.printDay,
    bold: true,
  });
  mergeHeaderColumn(col);

  productRows.forEach((product) => {
    const inventoryTotal = harvestLargeLabelInventoryTotal(product, shipmentRoundColumns, totalOptions);
    const solarDayValue = harvestLargeLabelSolarDayValue(product, inventoryTotal);
    const row = [harvestLargeLabelExportCell(product.productName, { bold: true })];
    crewColumns.forEach((column) => {
      const cell = product.cellMap.get(`${product.rowIndex}:${column.col}`);
      row.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(harvestOtherFarmColumnValue(product, column)), {
        backgroundColor: harvestLargeLabelPriorityColor(cell),
      }));
    });
    planningColumns.forEach((column) => {
      const cell = product.cellMap.get(`${product.rowIndex}:${column.col}`);
      row.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(harvestLargeLabelPlanningNumber(product, column)), {
        backgroundColor: harvestLargeLabelPriorityColor(cell),
      }));
    });
    row.push(harvestLargeLabelExportCell(harvestLargeLabelExportNegativeValue(harvestLargeLabelNoPackageNumber(product))));
    yfyInputColumns.forEach((column) => {
      row.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(harvestLargeLabelYfyNumber(product, column, totalOptions))));
    });
    row.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(inventoryTotal), { bold: true }));
    row.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(solarDayValue), {
      backgroundColor: harvestLargeLabelColors.printDay,
      bold: true,
    }));
    rows.push(row);
  });

  const subtotalRows = productRows;
  const subtotalRow = [harvestLargeLabelExportCell("小計", { bold: true })];
  crewColumns.forEach((column) => {
    subtotalRow.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(
      subtotalRows.reduce((sum, row) => sum + harvestOtherFarmColumnValue(row, column), 0)
    ), { bold: true }));
  });
  planningColumns.forEach((column) => {
    subtotalRow.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(
      subtotalRows.reduce((sum, row) => sum + harvestLargeLabelPlanningNumber(row, column), 0)
    ), { bold: true }));
  });
  const noPackageTotal = subtotalRows.reduce((sum, row) => sum + harvestLargeLabelNoPackageNumber(row), 0);
  subtotalRow.push(harvestLargeLabelExportCell(harvestLargeLabelExportNegativeValue(noPackageTotal), { bold: true }));
  yfyInputColumns.forEach((column) => {
    subtotalRow.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(
      subtotalRows.reduce((sum, row) => sum + harvestLargeLabelYfyNumber(row, column, totalOptions), 0)
    ), { bold: true }));
  });
  const inventoryTotal = subtotalRows.reduce(
    (sum, row) => sum + harvestLargeLabelInventoryTotal(row, shipmentRoundColumns, totalOptions),
    0,
  );
  const solarDayTotal = subtotalRows.reduce((sum, row) => {
    const rowInventoryTotal = harvestLargeLabelInventoryTotal(row, shipmentRoundColumns, totalOptions);
    return sum + harvestLargeLabelSolarDayValue(row, rowInventoryTotal);
  }, 0);
  subtotalRow.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(inventoryTotal), { bold: true }));
  subtotalRow.push(harvestLargeLabelExportCell(harvestLargeLabelExportValue(solarDayTotal), {
    backgroundColor: harvestLargeLabelColors.printDay,
    bold: true,
  }));
  rows.push(subtotalRow);

  return {
    harvestDate: date,
    sheetName: "大標",
    rows,
    merges,
    freezePane: "B3",
    columnWidths: Array.from({ length: columnCount }, (_, index) => (index === 0 ? 14 : 11)),
  };
}

async function exportHarvestLargeLabelExcel() {
  const payload = harvestLargeLabelExportPayload();
  if (!payload) {
    alert("請先選擇採收日期。");
    return;
  }
  if (payload.rows.length <= 2) {
    alert("目前沒有可匯出的大標表格內容。");
    return;
  }
  try {
    const response = await fetch("/api/export-harvest-large-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let message = "匯出大標 Excel 失敗";
      try {
        const result = await response.json();
        if (result?.error) message = result.error;
      } catch {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = harvestLargeLabelExportFilename(payload.harvestDate);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert(`匯出大標 Excel 失敗：${error.message}`);
  }
}

function renderHarvestLargeLabelSubtotalRow(rows, crewColumns, planningColumns, shipmentRoundColumns, totalOptions) {
  const crewTotals = crewColumns.map((column) =>
    rows.reduce((sum, row) => sum + harvestOtherFarmColumnValue(row, column), 0)
  );
  const planningTotals = planningColumns.map((column) =>
    rows.reduce((sum, row) => sum + harvestLargeLabelPlanningNumber(row, column), 0)
  );
  const noPackageTotal = rows.reduce((sum, row) => sum + harvestLargeLabelNoPackageNumber(row), 0);
  const yfyTotals = yfyInputColumns.map((column) =>
    rows.reduce((sum, row) => sum + harvestLargeLabelYfyNumber(row, column, totalOptions), 0)
  );
  const inventoryTotal = rows.reduce(
    (sum, row) => sum + harvestLargeLabelInventoryTotal(row, shipmentRoundColumns, totalOptions),
    0,
  );
  const solarDayTotal = rows.reduce((sum, row) => {
    const rowInventoryTotal = harvestLargeLabelInventoryTotal(row, shipmentRoundColumns, totalOptions);
    return sum + harvestLargeLabelSolarDayValue(row, rowInventoryTotal);
  }, 0);
  return `<tr class="harvest-subtotal-row harvest-large-label-subtotal-row">
    <td class="harvest-other-farm-product">小計</td>
    ${crewTotals.map((value) => `<td class="num">${harvestLargeLabelNumberText(value)}</td>`).join("")}
    ${planningTotals.map((value, index) => {
      const column = planningColumns[index];
      const classes = [
        "num",
        "harvest-large-label-plan-col",
        `harvest-large-label-${column.section}-col`,
        column.isSectionStart ? "harvest-large-label-section-start" : "",
      ].filter(Boolean).join(" ");
      return `<td class="${classes}">${harvestLargeLabelNumberText(value)}</td>`;
    }).join("")}
    <td class="num harvest-no-package-col harvest-large-label-section-start ${harvestLargeLabelNoPackageClass(noPackageTotal)}">${harvestLargeLabelNoPackageTotalText(noPackageTotal)}</td>
    ${yfyTotals.map((value) => `<td class="num harvest-yfy-col">${value ? format.format(value) : ""}</td>`).join("")}
    <td class="num harvest-summary-total harvest-large-label-section-start ${inventoryTotal < 0 ? "harvest-negative-total" : ""}">${harvestLargeLabelNumberText(inventoryTotal)}</td>
    <td class="num harvest-large-label-print-day-col ${solarDayTotal < 0 ? "harvest-negative-total" : ""}">${harvestLargeLabelNumberText(solarDayTotal)}</td>
  </tr>`;
}

function renderHarvestLargeLabelPrint() {
  const template = harvestTemplate();
  if (!template) {
    byId("viewTitle").innerHTML = "";
    byId("tableHost").innerHTML = "";
    return;
  }
  const rows = harvestLargeLabelTableRows();
  const crewColumns = harvestOtherFarmVisibleColumns(rows);
  const planningColumns = harvestLargeLabelPlanningColumns();
  const cellMap = rows[0]?.cellMap || harvestCellMap();
  const totalOptions = harvestInventoryTotalOptions();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const header = `<thead>
    <tr>
      <th class="harvest-other-farm-product" rowspan="2">品項</th>
      ${crewColumns.map((column) => `<th class="num harvest-large-label-other-farm-header">${escapeHtml(column.category)}</th>`).join("")}
      ${planningColumns.map((column) => harvestLargeLabelPlanningHeaderCell(cellMap, column, 3)).join("")}
      <th class="num harvest-no-package-col harvest-large-label-section-start" rowspan="2">不包裝</th>
      ${yfyInputColumns.map((column) => `<th class="num harvest-yfy-col" rowspan="2">${yfyHeaderLabel(column)}</th>`).join("")}
      <th class="num harvest-summary-total harvest-large-label-section-start" rowspan="2">${harvestInventoryTotalHeaderHtml}</th>
      <th class="num harvest-large-label-print-day-col" rowspan="2">${harvestLargeLabelPrintDayHeader()}</th>
    </tr>
    <tr>
      ${crewColumns.map((column) => `<th class="num harvest-large-label-other-farm-header">${escapeHtml(column.name)}</th>`).join("")}
      ${planningColumns.map((column) => harvestLargeLabelPlanningHeaderCell(cellMap, column, 4)).join("")}
    </tr>
  </thead>`;
  const body = rows
    .map((product) => {
      const inventoryTotal = harvestLargeLabelInventoryTotal(product, shipmentRoundColumns, totalOptions);
      const solarDayValue = harvestLargeLabelSolarDayValue(product, inventoryTotal);
      const noPackageValue = harvestLargeLabelNoPackageNumber(product);
      return `<tr>
        <td class="harvest-other-farm-product">${escapeHtml(product.productName)}</td>
        ${crewColumns.map((column) => {
          const cell = product.cellMap.get(`${product.rowIndex}:${column.col}`);
          const value = harvestOtherFarmColumnValue(product, column);
          const classes = ["num", harvestLargeLabelPriorityClass(cell)].filter(Boolean).join(" ");
          return `<td class="${classes}">${value ? format.format(value) : ""}${harvestLargeLabelPriorityBadge(cell)}</td>`;
        }).join("")}
        ${planningColumns.map((column) => {
          const cell = product.cellMap.get(`${product.rowIndex}:${column.col}`);
          const classes = [
            "num",
            "harvest-large-label-plan-col",
            `harvest-large-label-${column.section}-col`,
            column.isSectionStart ? "harvest-large-label-section-start" : "",
            harvestLargeLabelPriorityClass(cell),
          ].filter(Boolean).join(" ");
          return `<td class="${classes}">${harvestLargeLabelPlanningValue(product, column)}${harvestLargeLabelPriorityBadge(cell)}</td>`;
        }).join("")}
        <td class="num harvest-no-package-col harvest-large-label-section-start ${harvestLargeLabelNoPackageClass(noPackageValue)}">${harvestLargeLabelNoPackageValue(product)}</td>
        ${yfyInputColumns.map((column) => `<td class="num harvest-yfy-col">${harvestLargeLabelYfyValue(product, column, totalOptions)}</td>`).join("")}
        <td class="num harvest-summary-total harvest-large-label-section-start ${inventoryTotal < 0 ? "harvest-negative-total" : ""}">${inventoryTotal ? numberText(inventoryTotal) : ""}</td>
        <td class="num harvest-large-label-print-day-col ${solarDayValue < 0 ? "harvest-negative-total" : ""}">${solarDayValue ? numberText(solarDayValue) : ""}</td>
      </tr>`;
    })
    .join("") + renderHarvestLargeLabelSubtotalRow(rows, crewColumns, planningColumns, shipmentRoundColumns, totalOptions);
  byId("viewTitle").innerHTML = "";
  byId("tableHost").innerHTML = `<div class="harvest-large-label-wrap">
    ${renderHarvestLargeLabelControls()}
    <table class="harvest-other-farm-sheet">${header}<tbody>${body}</tbody></table>
  </div>`;
  bindHarvestField3FToggleButtons();
  byId("exportHarvestLargeLabelBtn")?.addEventListener("click", exportHarvestLargeLabelExcel);
}

function harvestPriorityOrderHeaderLabel(cellMap, cell) {
  const baseCol = harvestFieldBaseColumn(cell.col);
  const columnLetter = columnLetterFromIndex(baseCol);
  if ([4, 9].includes(baseCol)) return "林";
  if ([5, 10].includes(baseCol)) return "3";
  if ([6, 11].includes(baseCol)) return "4";
  if ([7, 12].includes(baseCol)) return "5";
  if (isHarvestField3FColumn(baseCol)) return "F";
  const crewColumn = harvestCrewColumnByCol(cell.col);
  if (crewColumn) return firstDisplayCharacter(crewColumn.name);
  const firstText = harvestHeaderRawText(cellMap, 3, baseCol, "");
  const secondText = harvestHeaderRawText(cellMap, 4, baseCol, "");
  const label = secondText && secondText !== firstText ? secondText : secondText || firstText || columnLetter;
  return firstDisplayCharacter(label) || columnLetter;
}

function firstDisplayCharacter(value) {
  return Array.from(String(value || "").trim())[0] || "";
}

function harvestPriorityOrderLabelStyle(label, cell = null) {
  if (cell && isHarvestCrewColumn(cell.col)) return harvestPriorityOrderLabelStyles.otherFarm;
  const baseCol = cell ? harvestFieldBaseColumn(cell.col) : 0;
  if (cell && [4, 9].includes(baseCol)) return harvestPriorityOrderLabelStyles.oneTwo;
  if (cell && isHarvestField3FColumn(baseCol)) return harvestPriorityOrderLabelStyles.threeF;
  const text = String(label || "").trim();
  if (text === "F" || text === "林") return harvestPriorityOrderLabelStyles.threeF;
  if (text === "3") return harvestPriorityOrderLabelStyles.three;
  if (text === "4") return harvestPriorityOrderLabelStyles.four;
  if (text === "5") return harvestPriorityOrderLabelStyles.five;
  if (text === "王") return harvestPriorityOrderLabelStyles.otherFarm;
  return { backgroundColor: "", color: "#18201b" };
}

function harvestPriorityOrderStyleAttribute(style) {
  const declarations = [];
  if (style?.backgroundColor) declarations.push(`background-color: ${style.backgroundColor}`);
  if (style?.color) declarations.push(`color: ${style.color}`);
  return declarations.length ? ` style="${declarations.join("; ")}"` : "";
}

function harvestPriorityOrderRows() {
  const template = harvestTemplate();
  const date = harvestDate();
  if (!template || !date) return [];
  const prefix = `${date}|${template.sheetName}|`;
  const cellMap = harvestCellMap();
  const rowsByIndex = new Map();

  Object.entries(draftHarvestCellPriorities).forEach(([key, priority]) => {
    if (!key.startsWith(prefix)) return;
    const normalizedPriority = normalizeHarvestPriority(priority);
    if (!normalizedPriority) return;
    const parts = key.split("|");
    const rowIndex = Number(parts.at(-2));
    const columnLetter = parts.at(-1);
    const col = columnIndexFromLetter(columnLetter);
    const cell = cellMap.get(`${rowIndex}:${col}`);
    if (!cell || !isHarvestPriorityCell(cell) || !visibleHarvestRow(rowIndex)) return;
    const product = harvestProductForRow(rowIndex);
    const productName = harvestExportProductName(rowIndex, cellMap);
    const existing = rowsByIndex.get(rowIndex) || {
      rowIndex,
      productCode: product?.productCode || "",
      productName,
      priorities: {},
    };
    const label = harvestPriorityOrderHeaderLabel(cellMap, cell);
    const labelStyle = harvestPriorityOrderLabelStyle(label, cell);
    existing.priorities[normalizedPriority] = {
      label,
      backgroundColor: labelStyle.backgroundColor || "",
      color: labelStyle.color || "#18201b",
    };
    rowsByIndex.set(rowIndex, existing);
  });

  return [...rowsByIndex.values()].sort((a, b) => a.rowIndex - b.rowIndex);
}

function canvasTextLines(context, value, maxWidth) {
  const text = String(value || "").trim();
  if (!text) return [""];
  const lines = [];
  let line = "";
  for (const char of text) {
    const nextLine = line + char;
    if (line && context.measureText(nextLine).width > maxWidth) {
      lines.push(line);
      line = char.trimStart();
    } else {
      line = nextLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function harvestPriorityOrderCanvas(rows) {
  const pixelRatio = Math.max(2, Math.ceil(window.devicePixelRatio || 1));
  const columns = [
    { label: "菜名", width: 112, value: (row) => row.productName, product: true },
    ...harvestPriorityLevels.map((priority) => ({
      label: String(priority),
      width: 112,
      priority,
      value: (row) => row.priorities[priority]?.label || "",
      style: (row) => row.priorities[priority] || {},
    })),
  ];
  const paddingX = 8;
  const paddingY = 7;
  const lineHeight = 22;
  const headerHeight = 42;
  const outerPadding = 18;
  const minRowHeight = 40;
  const titleRows = [
    {
      left: "",
      text: "Bảng thứ tự ưu tiên sắp xếp",
      height: 38,
      font: "700 24px 'Times New Roman', serif",
      top: true,
    },
    {
      left: "日期：",
      text: "排放順序表",
      height: 48,
      leftFont: "700 24px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif",
      font: "700 32px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif",
      bottom: true,
    },
    {
      left: formatDateShort(harvestDate()),
      text: "由外到內排放順序：",
      height: 38,
      leftFont: "24px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif",
      font: "28px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif",
      top: true,
    },
    {
      left: "",
      text: "Thứ tự sắp xếp từ ngoài vào trong",
      height: 36,
      font: "26px 'Times New Roman', serif",
      bottom: true,
    },
  ];
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");
  measureContext.font = "20px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif";
  const measuredRows = rows.map((row) => {
    const cells = columns.map((column) => {
      const text = String(column.value(row) || "");
      const lines = canvasTextLines(measureContext, text, column.width - paddingX * 2);
      return { column, text, lines };
    });
    return {
      row,
      cells,
      height: Math.max(minRowHeight, Math.max(...cells.map((cell) => cell.lines.length)) * lineHeight + paddingY * 2),
    };
  });
  const titleRowsHeight = titleRows.reduce((sum, row) => sum + row.height, 0);
  const tableHeight = titleRowsHeight + headerHeight + measuredRows.reduce((sum, row) => sum + row.height, 0);
  const width = tableWidth + outerPadding * 2;
  const height = tableHeight + outerPadding * 2;
  const tableX = outerPadding;
  const tableY = outerPadding;
  const canvas = document.createElement("canvas");
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const context = canvas.getContext("2d");
  context.scale(pixelRatio, pixelRatio);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.lineWidth = 1;
  context.strokeStyle = "#111111";
  context.textBaseline = "middle";
  context.fillStyle = "#18201b";
  context.textAlign = "center";

  const drawText = (text, x, y, cellWidth, cellHeight, font, color = "#111111") => {
    if (!text) return;
    context.font = font;
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, x + cellWidth / 2, y + cellHeight / 2);
  };
  const strokeSides = (x, y, cellWidth, cellHeight, sides, options = {}) => {
    context.save();
    context.lineWidth = options.lineWidth || 2.5;
    context.strokeStyle = options.color || "#111111";
    context.setLineDash(options.dash || []);
    context.beginPath();
    if (sides.top) {
      context.moveTo(x, y);
      context.lineTo(x + cellWidth, y);
    }
    if (sides.right) {
      context.moveTo(x + cellWidth, y);
      context.lineTo(x + cellWidth, y + cellHeight);
    }
    if (sides.bottom) {
      context.moveTo(x + cellWidth, y + cellHeight);
      context.lineTo(x, y + cellHeight);
    }
    if (sides.left) {
      context.moveTo(x, y + cellHeight);
      context.lineTo(x, y);
    }
    context.stroke();
    context.restore();
  };
  const strokeCell = (x, y, cellWidth, cellHeight, options = {}) => {
    strokeSides(
      x,
      y,
      cellWidth,
      cellHeight,
      { top: true, right: true, bottom: true, left: true },
      options,
    );
  };

  let y = tableY;
  const productWidth = columns[0].width;
  const orderWidth = tableWidth - productWidth;
  titleRows.forEach((row) => {
    drawText(
      row.left,
      tableX,
      y,
      productWidth,
      row.height,
      row.leftFont || "700 20px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif",
    );
    drawText(row.text, tableX + productWidth, y, orderWidth, row.height, row.font);
    strokeSides(tableX + productWidth, y, orderWidth, row.height, {
      top: Boolean(row.top),
      right: true,
      bottom: Boolean(row.bottom),
      left: true,
    });
    y += row.height;
  });

  let x = tableX;
  columns.forEach((column) => {
    context.fillStyle = "#ffffff";
    context.fillRect(x, y, column.width, headerHeight);
    strokeCell(x, y, column.width, headerHeight, { lineWidth: 1.5 });
    drawText(
      column.label,
      x,
      y,
      column.width,
      headerHeight,
      "700 26px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif",
    );
    x += column.width;
  });

  y += headerHeight;
  measuredRows.forEach((measuredRow) => {
    x = tableX;
    measuredRow.cells.forEach((cell) => {
      const style = cell.text && cell.column.style ? cell.column.style(measuredRow.row) : {};
      const backgroundColor = style?.backgroundColor || "";
      const textColor = style?.color || "#18201b";
      context.fillStyle = backgroundColor || "#ffffff";
      context.fillRect(x, y, cell.column.width, measuredRow.height);
      strokeCell(x, y, cell.column.width, measuredRow.height, { lineWidth: 1.5 });
      context.fillStyle = textColor;
      context.textAlign = "center";
      const textX = cell.column.align === "left"
        ? x + paddingX
        : x + cell.column.width / 2;
      const textBlockHeight = (cell.lines.length - 1) * lineHeight;
      const textY = y + measuredRow.height / 2 - textBlockHeight / 2;
      context.font = cell.column.product
        ? "700 24px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif"
        : "24px 'Microsoft JhengHei UI', 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif";
      cell.lines.forEach((line, lineIndex) => {
        context.fillText(line, textX, textY + lineIndex * lineHeight);
      });
      x += cell.column.width;
    });
    y += measuredRow.height;
  });
  return canvas;
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("圖片產生失敗"));
      }
    }, "image/png");
  });
}

async function copyHarvestPriorityOrderImage() {
  const rows = harvestPriorityOrderRows();
  const status = byId("harvestPriorityOrderCopyStatus");
  if (!rows.length) {
    alert("目前沒有可複製的排順序表格。");
    return;
  }
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    alert("這個瀏覽器不支援將圖片寫入剪貼簿。請改用最新版 Chrome、Edge 或 Safari。");
    return;
  }
  try {
    if (status) status.textContent = "圖片複製中...";
    const blob = await canvasBlob(harvestPriorityOrderCanvas(rows));
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    if (status) status.textContent = "圖片已複製";
  } catch (error) {
    if (status) status.textContent = "圖片複製失敗";
    alert(`圖片複製失敗：${error.message}`);
  }
}

function renderHarvestPriorityOrder() {
  const template = harvestTemplate();
  if (!template) {
    byId("viewTitle").innerHTML = "<h2>排順序</h2><p>尚未載入採收規劃表模板。</p>";
    byId("tableHost").innerHTML = "";
    return;
  }
  const rows = harvestPriorityOrderRows();
  byId("viewTitle").innerHTML = `<div class="view-title-row">
    <div>
      <h2>排順序</h2>
      <p>${escapeHtml(formatDateShort(harvestDate()))}</p>
    </div>
    <div class="sales-save-actions">
      <span id="harvestPriorityOrderCopyStatus" class="date-pill">可複製成圖片</span>
      <button id="copyHarvestPriorityOrderImageBtn" type="button">複製圖片</button>
    </div>
  </div>`;
  byId("copyHarvestPriorityOrderImageBtn")?.addEventListener("click", copyHarvestPriorityOrderImage);
  if (!rows.length) {
    byId("tableHost").innerHTML = '<div class="empty-state">目前沒有標記權重的品項。</div>';
    return;
  }
  byId("tableHost").innerHTML = `<div class="harvest-priority-order-wrap">
    <table class="harvest-priority-order-sheet">
      <colgroup>
        <col class="harvest-priority-order-product-col" />
        ${harvestPriorityLevels.map(() => '<col class="harvest-priority-order-rank-col" />').join("")}
      </colgroup>
      <thead>
        <tr class="harvest-priority-order-title-row harvest-priority-order-title-vn-row">
          <th class="harvest-priority-order-date-spacer"></th>
          <th class="harvest-priority-order-title-vn" colspan="7">Bảng thứ tự ưu tiên sắp xếp</th>
        </tr>
        <tr class="harvest-priority-order-title-row harvest-priority-order-title-zh-row">
          <th class="harvest-priority-order-date-label">日期：</th>
          <th class="harvest-priority-order-title-zh" colspan="7">排放順序表</th>
        </tr>
        <tr class="harvest-priority-order-title-row harvest-priority-order-instruction-zh-row">
          <td class="harvest-priority-order-date-value">${escapeHtml(formatDateShort(harvestDate()))}</td>
          <th class="harvest-priority-order-instruction-zh" colspan="7">由外到內排放順序：</th>
        </tr>
        <tr class="harvest-priority-order-title-row harvest-priority-order-instruction-vn-row">
          <th class="harvest-priority-order-date-spacer"></th>
          <th class="harvest-priority-order-instruction-vn" colspan="7">Thứ tự sắp xếp từ ngoài vào trong</th>
        </tr>
        <tr>
          <th class="harvest-priority-order-product harvest-priority-order-product-head">菜名</th>
          ${harvestPriorityLevels.map((priority) => `<th class="harvest-priority-order-priority-head">${priority}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>
          <td class="harvest-priority-order-product">${escapeHtml(row.productName)}</td>
          ${harvestPriorityLevels.map((priority) => {
            const priorityCell = row.priorities[priority] || null;
            const label = priorityCell?.label || "";
            return `<td class="harvest-priority-order-priority"${harvestPriorityOrderStyleAttribute(priorityCell)}>${escapeHtml(label)}</td>`;
          }).join("")}
        </tr>`).join("")}
      </tbody>
    </table>
  </div>`;
}

function visibleHarvestRows(template) {
  const rows = [];
  for (let row = 5; row <= template.maxRow; row += 1) {
    if (isHarvestItemRow(row) && !visibleHarvestRow(row, template)) continue;
    rows.push(row);
  }
  return rows;
}

function harvestUnfinishedSelectionKey(row) {
  return String(row);
}

function harvestUnfinishedSelectionCell(row, cellMap) {
  if (!isHarvestItemRow(row)) return '<td class="harvest-cell harvest-unfinished-select-col"></td>';
  const productName = harvestExportProductName(row, cellMap);
  if (!productName) return '<td class="harvest-cell harvest-unfinished-select-col"></td>';
  const rowKey = harvestUnfinishedSelectionKey(row);
  const checked = harvestUnfinishedSelectedRows.has(rowKey) ? "checked" : "";
  return `<td class="harvest-cell harvest-unfinished-select-col">
    <input class="harvest-unfinished-select-input" type="checkbox" ${checked} aria-label="勾選 ${escapeAttribute(productName)}" data-harvest-unfinished-select-row="${rowKey}" data-product-name="${escapeAttribute(productName)}" />
  </td>`;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const selection = document.getSelection();
  const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.top = "0";
  input.style.left = "0";
  input.style.width = "1px";
  input.style.height = "1px";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.focus();
  input.select();
  input.setSelectionRange(0, text.length);
  try {
    const copied = document.execCommand("copy");
    if (!copied) throw new Error("瀏覽器沒有允許寫入剪貼簿");
  } finally {
    input.remove();
    if (selectedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(selectedRange);
    }
  }
}

async function copyHarvestUnfinishedSelection() {
  const button = byId("copyHarvestUnfinishedSelectionBtn");
  const selectedNames = Array.from(document.querySelectorAll(".harvest-unfinished-select-input:checked"))
    .map((input) => String(input.dataset.productName || "").trim())
    .filter(Boolean);
  if (!selectedNames.length) {
    alert("請先勾選未包完品項。");
    return;
  }
  const originalText = button?.textContent || "複製勾選";
  try {
    await copyTextToClipboard(selectedNames.join("\n"));
    if (button) button.textContent = "已複製";
    window.setTimeout(() => {
      if (button?.textContent === "已複製") button.textContent = originalText;
    }, 900);
  } catch (error) {
    alert(`複製失敗：${error.message}`);
  }
}

function renderHarvestPlanningHeader(cellMap, columns, options = {}) {
  let firstRow = '<tr class="harvest-date-row">';
  let secondRow = '<tr class="harvest-label-row">';
  if (options.includeProductCode) {
    firstRow += '<th class="harvest-cell harvest-product-code-col" rowspan="2">呼出碼</th>';
  }
  for (const col of columns) {
    const columnLetter = columnLetterFromIndex(col);
    const firstText = harvestHeaderText(cellMap, 3, col, harvestHeaderText(cellMap, 4, col, columnLetter));
    const secondText = harvestHeaderText(cellMap, 4, col, firstText || columnLetter);
    const colorClass = harvestPlanningHeaderColorClass(col);
    if (harvestHeaderPlainText(firstText) === harvestHeaderPlainText(secondText)) {
      firstRow += `<th class="harvest-cell harvest-col-${columnLetter} ${colorClass}${harvestHeaderClass(firstText)}" rowspan="2">${firstText}</th>`;
    } else {
      firstRow += `<th class="harvest-cell harvest-col-${columnLetter} ${colorClass}${harvestHeaderClass(firstText)}">${firstText}</th>`;
      secondRow += `<th class="harvest-cell harvest-col-${columnLetter} ${colorClass}${harvestHeaderClass(secondText)}">${secondText}</th>`;
    }
  }
  firstRow += "</tr>";
  secondRow += "</tr>";
  return firstRow + secondRow;
}

function harvestSummaryNumberText(value) {
  return value ? numberText(value) : "";
}

function renderHarvestGrandTotalRow(columns, cellMap, options, rowTotalOptions, shipmentRoundColumns, looseVegetableColumnsForTable, generalChannelColumnsForTable, rowTotalLooseVegetableDate) {
  let rowHtml = '<tr class="harvest-grand-total-row">';
  if (options.includeUnfinishedSelection) {
    rowHtml += '<td class="harvest-cell harvest-unfinished-select-col"></td>';
  }
  if (options.includeProductCode) {
    rowHtml += '<td class="harvest-cell harvest-product-code-col"></td>';
  }
  for (const col of columns) {
    const columnLetter = columnLetterFromIndex(col);
    const value = col >= 3 ? harvestAggregateSavedNumericValue(cellMap, harvestGrandTotalRow, col) : 0;
    const classes = [
      "harvest-cell",
      `harvest-col-${columnLetter}`,
      col === 2 ? "harvest-item-name" : "",
      col >= 3 ? "num" : "",
    ].filter(Boolean).join(" ");
    const content = col === 2 ? "總計" : harvestSummaryNumberText(value);
    rowHtml += `<td class="${classes}">${content}</td>`;
    if (options.includeRowTotal && col === 2) {
      looseVegetableColumnsForTable.forEach((column) => {
        const looseVegetableValue = looseVegetableColumnValueForHarvestRow(
          harvestGrandTotalRow,
          column.key,
          rowTotalLooseVegetableDate,
          rowTotalOptions.looseVegetableEntries || draftLooseVegetableEntries,
        );
        rowHtml += `<td class="harvest-cell harvest-loose-vegetable-col num">${harvestSummaryNumberText(looseVegetableValue)}</td>`;
      });
      if (options.includeYfyColumns) {
        yfyInputColumns.forEach((column) => {
          const yfyValue = yfyColumnValueForRow(harvestGrandTotalRow, column.key, rowTotalOptions.yfyDate || yfyDate(), rowTotalOptions.yfyEntries || draftYfyEntries);
          rowHtml += `<td class="harvest-cell harvest-yfy-col num">${harvestSummaryNumberText(yfyValue)}</td>`;
        });
      }
      if (options.includeCityColumn) {
        const cityValue = cityChannelTotalForRow(harvestGrandTotalRow, rowTotalOptions.cityDate || cityDate(), rowTotalOptions.cityEntries || draftCityEntries);
        rowHtml += `<td class="harvest-cell harvest-city-col num">${harvestSummaryNumberText(cityValue)}</td>`;
      }
      generalChannelColumnsForTable.forEach((column) => {
        const generalChannelValue = generalChannelColumnValueForHarvestRow(
          harvestGrandTotalRow,
          column.key,
          rowTotalOptions.generalChannelDate || generalChannelDate(),
          rowTotalOptions.generalChannelEntries || draftGeneralChannelEntries,
          generalChannelColumnsForTable,
          rowTotalOptions.generalChannelPuqianEntries || draftGeneralChannelPuqianEntries,
        );
        rowHtml += `<td class="harvest-cell harvest-general-channel-col num">${harvestSummaryNumberText(generalChannelValue)}</td>`;
      });
      shipmentRoundColumns.forEach((roundColumn) => {
        const value = harvestShipmentRoundValue(roundColumn, harvestGrandTotalRow);
        rowHtml += `<td class="harvest-cell harvest-shipment-round-col num">${harvestSummaryNumberText(value)}</td>`;
      });
      const noPackageTotal = harvestAggregateSavedNumericValue(cellMap, harvestGrandTotalRow, harvestNoPackageColumn.col);
      rowHtml += `<td class="harvest-cell harvest-no-package-col harvest-no-package-subtotal num">${noPackageTotal ? `(${format.format(noPackageTotal)})` : ""}</td>`;
      const total = harvestRowTotal(cellMap, harvestGrandTotalRow, shipmentRoundColumns, rowTotalOptions);
      rowHtml += `<td class="harvest-cell harvest-summary-total num ${total < 0 ? "harvest-negative-total" : ""}">${harvestSummaryNumberText(total)}</td>`;
    }
  }
  rowHtml += "</tr>";
  return rowHtml;
}

function renderHarvestBlockTable(template, cellMap, origins, covered, startCol, endCol, options = {}) {
  const columns = harvestColumnList(startCol, endCol);
  const splitSingleRowHeaders = Boolean(options.splitSingleRowHeaders);
  const includeUnfinishedSelection = Boolean(options.includeUnfinishedSelection);
  const rowTotalOptions = options.useHarvestInventoryTotal
    ? harvestInventoryTotalOptions()
      : {
          includeCityTotal: Boolean(options.includeCityColumn),
          includeYfyTotal: Boolean(options.includeYfyColumns),
          dailyShipmentTotals: options.includeDailyShipmentDeduction ? dailyShipmentProductTotals() : null,
        };
  const rowTotalLooseVegetableDate = rowTotalOptions.looseVegetableDate || looseVegetableDate();
  const looseVegetableColumnsForTable = options.includeLooseVegetableColumns
    ? (rowTotalOptions.looseVegetableColumns || looseVegetableActiveSavedColumns(rowTotalLooseVegetableDate))
    : [];
  const generalChannelColumnsForTable = options.includeGeneralChannelColumns
    ? (rowTotalOptions.generalChannelColumns || savedGeneralChannelColumns)
    : [];
  let firstRow = '<tr class="harvest-date-row">';
  let secondRow = '<tr class="harvest-label-row">';
  let secondRowHasCells = false;
  if (options.includeProductCode) {
    firstRow += '<th class="harvest-cell harvest-product-code-col" rowspan="2">呼出碼</th>';
  }
  if (includeUnfinishedSelection) {
    firstRow += '<th class="harvest-cell harvest-unfinished-select-col" rowspan="2"></th>';
  }
  for (const col of columns) {
    const columnLetter = columnLetterFromIndex(col);
    const firstText = harvestHeaderText(cellMap, 3, col, harvestHeaderText(cellMap, 4, col, columnLetter));
    const secondText = harvestHeaderText(cellMap, 4, col, firstText || columnLetter);
    const colorClass = harvestPlanningHeaderColorClass(col);
    if (harvestHeaderPlainText(firstText) === harvestHeaderPlainText(secondText)) {
      firstRow += `<th class="harvest-cell harvest-col-${columnLetter} ${colorClass}${harvestHeaderClass(firstText)}" rowspan="2">${firstText}</th>`;
    } else {
      firstRow += `<th class="harvest-cell harvest-col-${columnLetter} ${colorClass}${harvestHeaderClass(firstText)}">${firstText}</th>`;
      secondRow += `<th class="harvest-cell harvest-col-${columnLetter} ${colorClass}${harvestHeaderClass(secondText)}">${secondText}</th>`;
      secondRowHasCells = true;
    }
    if (options.includeRowTotal && col === 2) {
      looseVegetableColumnsForTable.forEach((column) => {
        firstRow += `<th class="harvest-cell harvest-loose-vegetable-col" rowspan="2">${harvestLooseVegetableHeaderLabel(column.label)}</th>`;
      });
      if (options.includeYfyColumns) {
        yfyInputColumns.forEach((column) => {
          firstRow += `<th class="harvest-cell harvest-yfy-col" rowspan="2">${yfyHeaderLabel(column)}</th>`;
        });
      }
      if (options.includeCityColumn) {
        firstRow += '<th class="harvest-cell harvest-city-col" rowspan="2">city</th>';
      }
      generalChannelColumnsForTable.forEach((column) => {
        firstRow += `<th class="harvest-cell harvest-general-channel-col" rowspan="2">${escapeHtml(column.label)}</th>`;
      });
      (options.shipmentRoundColumns || []).forEach((roundColumn) => {
        if (splitSingleRowHeaders) {
          firstRow += `<th class="harvest-cell harvest-shipment-round-col">${escapeHtml(roundColumn.label)}</th>`;
          secondRow += '<th class="harvest-cell harvest-shipment-round-col">到貨</th>';
          secondRowHasCells = true;
        } else {
          firstRow += `<th class="harvest-cell harvest-shipment-round-col" rowspan="2">${escapeHtml(roundColumn.label)}<br />到貨</th>`;
        }
      });
      if (splitSingleRowHeaders) {
        firstRow += '<th class="harvest-cell harvest-no-package-col" rowspan="2">不包裝</th>';
        firstRow += `<th class="harvest-cell harvest-summary-total" rowspan="2">${harvestInventoryTotalHeaderHtml}</th>`;
      } else {
        firstRow += '<th class="harvest-cell harvest-no-package-col" rowspan="2">不包裝</th>';
        firstRow += `<th class="harvest-cell harvest-summary-total" rowspan="2">${harvestInventoryTotalHeaderHtml}</th>`;
      }
    }
  }
  firstRow += "</tr>";
  secondRow += "</tr>";
  let body = firstRow + secondRow;
  for (const row of visibleHarvestRows(template)) {
    body += `<tr class="${isHarvestSubtotalRow(row) ? "harvest-subtotal-row" : ""}">
`;
    if (includeUnfinishedSelection) {
      body += harvestUnfinishedSelectionCell(row, cellMap);
    }
    if (options.includeProductCode) {
      const productCode = harvestProductForRow(row)?.productCode || "";
      body += `<td class="harvest-cell harvest-product-code-col">${escapeHtml(productCode)}</td>`;
    }
    for (const col of columns) {
      const key = `${row}:${col}`;
      if (covered.has(key)) continue;
      const cell = cellMap.get(key) || { row, col, column: "", value: "", isFormula: false };
      const merge = origins.get(key);
      const activeInventorySource = options.activeInventorySourceMap?.get(row);
      const activeInventorySourceText = activeInventorySource?.col === col
        ? harvestActiveInventorySourceText(activeInventorySource)
        : "";
      const attrs = [
        merge?.rowspan > 1 ? `rowspan="${merge.rowspan}"` : "",
        merge?.colspan > 1 ? `colspan="${merge.colspan}"` : "",
        activeInventorySourceText ? `title="${escapeAttribute(activeInventorySourceText)}"` : "",
      ].filter(Boolean).join(" ");
      const classes = [
        "harvest-cell",
        `harvest-col-${cell.column || col}`,
        col === 2 ? "harvest-item-name" : "",
        isHarvestEditableCell(cell) ? "harvest-editable-cell" : "",
        isHarvestEditableCell(cell) ? harvestPriorityClass(cell) : "",
        activeInventorySourceText ? "harvest-active-inventory-source" : "",
        cell.isFormula ? "harvest-formula-cell" : "",
        col >= 3 ? "num" : "",
      ].filter(Boolean).join(" ");
      const content = isHarvestEditableCell(cell)
        ? harvestInputMarkup(cell, harvestInputDisplayValue(harvestDraftValue(cell)))
        : harvestCellDisplay(cell, cellMap);
      body += `<td class="${classes}" ${attrs}>${content}</td>`;
      if (options.includeRowTotal && col === 2) {
        looseVegetableColumnsForTable.forEach((column) => {
          const looseVegetableValue = looseVegetableColumnValueForHarvestRow(
            row,
            column.key,
            rowTotalLooseVegetableDate,
            rowTotalOptions.looseVegetableEntries || draftLooseVegetableEntries,
          );
          body += `<td class="harvest-cell harvest-loose-vegetable-col num">${looseVegetableValue ? format.format(looseVegetableValue) : ""}</td>`;
        });
        if (options.includeYfyColumns) {
          yfyInputColumns.forEach((column) => {
            const yfyValue = yfyColumnValueForRow(row, column.key, rowTotalOptions.yfyDate || yfyDate(), rowTotalOptions.yfyEntries || draftYfyEntries);
            body += `<td class="harvest-cell harvest-yfy-col num">${yfyValue ? format.format(yfyValue) : ""}</td>`;
          });
        }
        if (options.includeCityColumn) {
          const cityValue = cityChannelTotalForRow(row, rowTotalOptions.cityDate || cityDate(), rowTotalOptions.cityEntries || draftCityEntries);
          body += `<td class="harvest-cell harvest-city-col num">${cityValue ? format.format(cityValue) : ""}</td>`;
        }
        generalChannelColumnsForTable.forEach((column) => {
          const generalChannelValue = generalChannelColumnValueForHarvestRow(
            row,
            column.key,
            rowTotalOptions.generalChannelDate || generalChannelDate(),
            rowTotalOptions.generalChannelEntries || draftGeneralChannelEntries,
            generalChannelColumnsForTable,
            rowTotalOptions.generalChannelPuqianEntries || draftGeneralChannelPuqianEntries,
          );
          body += `<td class="harvest-cell harvest-general-channel-col num">${generalChannelValue ? format.format(generalChannelValue) : ""}</td>`;
        });
        (options.shipmentRoundColumns || []).forEach((roundColumn) => {
          const value = harvestShipmentRoundValue(roundColumn, row);
          body += `<td class="harvest-cell harvest-shipment-round-col num">${value ? format.format(value) : ""}</td>`;
        });
        const noPackageCell = cellMap.get(`${row}:${harvestNoPackageColumn.col}`);
        const noPackageEditable = isHarvestEditableCell(noPackageCell);
        const noPackageContent = noPackageEditable
          ? harvestInputMarkup(noPackageCell, harvestNoPackageDisplayValue(noPackageCell), { type: "text", inputClass: "harvest-no-package-input" })
          : harvestNoPackageSubtotalDisplayValue(noPackageCell, cellMap);
        const noPackageClasses = [
          "harvest-cell",
          "harvest-no-package-col",
          noPackageEditable ? "harvest-editable-cell" : "harvest-no-package-subtotal",
          "num",
          harvestPriorityClass(noPackageCell),
        ].filter(Boolean).join(" ");
        body += `<td class="${noPackageClasses}">${noPackageContent}</td>`;
        const total = harvestRowTotal(cellMap, row, options.shipmentRoundColumns || [], rowTotalOptions);
        body += `<td class="harvest-cell harvest-summary-total num ${total < 0 ? "harvest-negative-total" : ""}">${total ? numberText(total) : ""}</td>`;
      }
    }
    body += "</tr>";
  }
  body += renderHarvestGrandTotalRow(
    columns,
    cellMap,
    { includeUnfinishedSelection, includeProductCode: Boolean(options.includeProductCode), includeRowTotal: Boolean(options.includeRowTotal), includeYfyColumns: Boolean(options.includeYfyColumns), includeCityColumn: Boolean(options.includeCityColumn) },
    rowTotalOptions,
    options.shipmentRoundColumns || [],
    looseVegetableColumnsForTable,
    generalChannelColumnsForTable,
    rowTotalLooseVegetableDate,
  );
  const tableClasses = [
    "harvest-planning-sheet",
    "harvest-block-sheet",
    secondRowHasCells ? "" : "harvest-empty-second-header",
  ].filter(Boolean).join(" ");
  return `<table class="${tableClasses}"><tbody>${body}</tbody></table>`;
}

function renderHarvestCrewControls() {
  const activeColumns = activeHarvestCrewColumns();
  const activeByKey = new Map(activeColumns.map((column) => [harvestCrewKey(column), column]));
  const customColumns = activeColumns.filter((column) => column.source === "custom");
  const pickerColumns = [
    ...defaultHarvestCrewOptions.map((column) => activeByKey.get(harvestCrewKey(column)) || column),
    ...customColumns,
  ];
  const customDisabled = activeColumns.length >= 12 ? "disabled" : "";
  const picker = harvestCrewPickerOpen
    ? `<div class="harvest-crew-picker">
        <div class="harvest-crew-options">
          ${pickerColumns
            .map((column) => {
              const activeColumn = activeByKey.get(harvestCrewKey(column));
              const label = `${column.category} ${column.name}`;
              return `<div class="harvest-crew-option ${activeColumn ? "is-active" : ""}">
                <button type="button" data-add-harvest-crew="${escapeAttribute(column.name)}" data-add-harvest-crew-category="${escapeAttribute(column.category)}" ${activeColumn ? "disabled" : ""}>${escapeHtml(label)}</button>
                ${activeColumn ? `<button class="harvest-remove-column" type="button" title="移除此欄" data-col="${activeColumn.col}">×</button>` : ""}
              </div>`;
            })
            .join("")}
        </div>
        <form id="customHarvestCrewForm" class="harvest-crew-custom">
          <select id="customHarvestCrewCategory" ${customDisabled}>
            ${harvestCrewCategories.map((category) => `<option value="${category}">${category}</option>`).join("")}
          </select>
          <input id="customHarvestCrewName" type="text" maxlength="12" placeholder="自訂人名" ${customDisabled} />
          <button type="submit" ${customDisabled}>新增</button>
        </form>
      </div>`
    : "";
  return `<div id="harvestCrewPanel" class="harvest-crew-panel">
    <div class="harvest-crew-toolbar">
      <button id="toggleHarvestCrewPickerBtn" class="harvest-icon-button" type="button" title="新增採收人員欄位">+</button>
    </div>
    ${picker}
  </div>`;
}

function harvestFieldExtraBaseColumns(section) {
  const tableColumns = section === "quantity" ? harvestQuantityTableColumns() : harvestUnfinishedTableColumns();
  const baseColumns = section === "quantity" ? harvestQuantityBaseFieldColumns : harvestUnfinishedBaseFieldColumns;
  return baseColumns.filter((col) => tableColumns.includes(col));
}

function harvestFieldBaseDisplayLabel(section, baseCol) {
  const cellMap = harvestCellMap();
  const firstText = harvestExportText(harvestHeaderText(cellMap, 3, baseCol, ""));
  const secondText = harvestExportText(harvestHeaderText(cellMap, 4, baseCol, ""));
  if (isHarvestField3FColumn(baseCol)) return "3場F";
  if (section === "unfinished") return secondText || firstText || columnLetterFromIndex(baseCol);
  return [firstText, secondText].filter(Boolean).join(" ") || columnLetterFromIndex(baseCol);
}

function harvestFieldExtraOrdinal(column) {
  const siblings = activeHarvestFieldExtraColumns()
    .filter((item) => item.section === column.section && item.baseCol === column.baseCol)
    .sort((a, b) => a.col - b.col);
  return siblings.findIndex((item) => item.col === column.col) + 1;
}

function renderHarvestFieldExtraControls(section) {
  if (!["quantity", "unfinished"].includes(section)) return "";
  const open = harvestFieldExtraPickerOpen === section;
  const baseColumns = harvestFieldExtraBaseColumns(section);
  const extras = activeHarvestFieldExtraColumns()
    .filter((column) => column.section === section)
    .sort((a, b) => a.baseCol - b.baseCol || a.col - b.col);
  const picker = open
    ? `<div class="harvest-field-extra-picker">
        <div class="harvest-crew-options">
          ${baseColumns.map((baseCol) => `<button type="button" data-add-harvest-field-column="${escapeAttribute(section)}" data-base-col="${baseCol}">新增 ${escapeHtml(harvestFieldBaseDisplayLabel(section, baseCol))}</button>`).join("")}
          ${extras.length ? '<div class="harvest-field-extra-picker-divider"></div>' : ""}
          ${extras.map((column) => `<div class="harvest-crew-option is-active">
            <button type="button" disabled>${escapeHtml(harvestFieldBaseDisplayLabel(section, column.baseCol))} 新增欄 ${harvestFieldExtraOrdinal(column)}</button>
            <button class="harvest-remove-column" type="button" title="移除此欄" data-remove-harvest-field-column="${column.col}">×</button>
          </div>`).join("")}
        </div>
      </div>`
    : "";
  return `<div class="harvest-field-extra-panel">
    <div class="harvest-crew-toolbar harvest-field-extra-toolbar">
      ${renderHarvestField3FGroupButton(section)}
      <button class="harvest-icon-button" type="button" data-toggle-harvest-field-extra-picker="${escapeAttribute(section)}" title="新增場區欄位">+</button>
    </div>
    ${picker}
  </div>`;
}

function renderHarvestField3FGroupButton(key) {
  const expanded = Boolean(activeHarvestField3FExpanded()[key]);
  return `<button class="harvest-group-toggle" type="button" data-toggle-harvest-field="${escapeAttribute(key)}" title="${expanded ? "收起 3場F" : "展開 3場F"}">${expanded ? "−" : "+"}</button>`;
}

function renderHarvestField3FTitle(title, key) {
  return `<div class="harvest-section-title harvest-field-toggle-title harvest-field-toggle-title-${escapeAttribute(key)}">
    <span class="harvest-section-title-label">${escapeHtml(title)}</span>
    ${renderHarvestFieldExtraControls(key)}
  </div>`;
}

function renderActiveHarvestView() {
  if (state.harvestView === "messageBoard") {
    renderHarvestMessagePage();
    return;
  }
  if (state.harvestView === "largeLabelPrint") {
    renderHarvestLargeLabelPrint();
    return;
  }
  if (state.harvestView === "priorityOrder") {
    renderHarvestPriorityOrder();
    return;
  }
  renderHarvestPlanning();
}

function toggleHarvestField3FGroup(key) {
  const expanded = activeHarvestField3FExpanded();
  if (!Object.prototype.hasOwnProperty.call(expanded, key)) return;
  setActiveHarvestField3FExpanded({
    ...expanded,
    [key]: !expanded[key],
  });
  persistHarvestField3FExpanded().catch((error) => alert(`3場F 展開狀態保存失敗：${error.message}`));
  renderActiveHarvestView();
}

function bindHarvestField3FToggleButtons() {
  document.querySelectorAll("[data-toggle-harvest-field]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleHarvestField3FGroup(button.dataset.toggleHarvestField);
    });
  });
}

function nextHarvestFieldExtraColumnIndex() {
  const template = harvestTemplate();
  const prefix = `${harvestDate()}|${template?.sheetName || ""}|`;
  const used = activeHarvestFieldExtraColumns().map((column) => column.col);
  Object.keys({ ...savedHarvestEntries, ...draftHarvestEntries }).forEach((key) => {
    if (!key.startsWith(prefix)) return;
    const col = columnIndexFromLetter(key.split("|").at(-1));
    if (col >= harvestFieldExtraColumnStart) used.push(col);
  });
  return Math.max(harvestFieldExtraColumnStart - 1, ...used) + 1;
}

function harvestFieldColumnLabel(section, baseCol) {
  const label = harvestFieldBaseDisplayLabel(section, baseCol);
  return section === "unfinished" ? `未包完 ${label}` : label;
}

function addHarvestFieldExtraColumn(section, baseCol) {
  const normalizedSection = ["quantity", "unfinished"].includes(section) ? section : "";
  const normalizedBaseCol = Number(baseCol);
  if (!normalizedSection || harvestFieldSectionForBaseColumn(normalizedBaseCol) !== normalizedSection) return;
  const col = nextHarvestFieldExtraColumnIndex();
  setActiveHarvestFieldExtraColumns([
    ...activeHarvestFieldExtraColumns(),
    {
      section: normalizedSection,
      baseCol: normalizedBaseCol,
      col,
      column: columnLetterFromIndex(col),
    },
  ]);
  persistHarvestFieldExtraColumns().catch((error) => alert(`採收場區欄位保存失敗：${error.message}`));
  renderHarvestPlanning();
}

function removeHarvestFieldExtraColumn(col) {
  const column = harvestFieldExtraColumnByCol(Number(col));
  const template = harvestTemplate();
  const date = harvestDate();
  if (!column || !template || !date) return;
  const label = harvestFieldColumnLabel(column.section, column.baseCol);
  const confirmed = confirm(`移除「${label}」新增欄位會同時刪除 ${formatDateShort(date) || date} 這一天此欄已保存的採收量。確定要移除嗎？`);
  if (!confirmed) return;
  clearDraftHarvestEntriesForColumn(date, template.sheetName, column.column);
  setActiveHarvestFieldExtraColumns(activeHarvestFieldExtraColumns().filter((item) => item.col !== column.col));
  Promise.all([persistHarvestFieldExtraColumns(), persistDraftHarvestEntries()])
    .catch((error) => alert(`移除採收場區欄位失敗：${error.message}`));
  renderHarvestPlanning();
}

function bindHarvestFieldExtraColumnButtons() {
  document.querySelectorAll("[data-toggle-harvest-field-extra-picker]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const section = button.dataset.toggleHarvestFieldExtraPicker;
      harvestFieldExtraPickerOpen = harvestFieldExtraPickerOpen === section ? "" : section;
      renderHarvestPlanning();
    });
  });
  document.querySelectorAll("[data-add-harvest-field-column]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      harvestFieldExtraPickerOpen = "";
      addHarvestFieldExtraColumn(button.dataset.addHarvestFieldColumn, button.dataset.baseCol);
    });
  });
  document.querySelectorAll("[data-remove-harvest-field-column]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeHarvestFieldExtraColumn(button.dataset.removeHarvestFieldColumn);
    });
  });
}

function harvestConversionProductByCropName(cropName) {
  const normalizedName = normalizeProductName(dailyVegetableCanonicalCropName(cropName));
  return harvestConversionProductRows().find((product) =>
    normalizeProductName(dailyVegetableCanonicalCropName(product.productName)) === normalizedName,
  ) || null;
}

function harvestConversionQuantityColumn(zoneName, netHouseCode = "") {
  const normalizedZone = String(zoneName || "").trim().replace(/\s+/g, "").replaceAll("Ｆ", "F");
  if (normalizedZone.includes("三場F") || normalizedZone.includes("3場F") || normalizedZone.includes("3F")) return harvestQuantityField3FColumn.col;
  if (normalizedZone.includes("一場") || normalizedZone.includes("1場") || normalizedZone.includes("二場") || normalizedZone.includes("2場")) return 4;
  if (normalizedZone.includes("三場") || normalizedZone.includes("3場")) return 5;
  if (normalizedZone.includes("四場") || normalizedZone.includes("4場")) return 6;
  if (normalizedZone.includes("五場") || normalizedZone.includes("5場")) return 7;
  const prefix = netHouseCodeParts(netHouseCode).prefix;
  if (prefix === "1" || prefix === "2") return 4;
  if (prefix === "3") return 5;
  if (prefix === "4") return 6;
  if (prefix === "5") return 7;
  return 0;
}

function latestNetHouseStatusRecordsForHarvestDate(date = harvestDate()) {
  const latestByHouse = new Map();
  Object.values(savedNetHouseStatusRecords).forEach((record) => {
    if (!record?.zoneName || !record?.netHouseCode || !record?.recordDate || record.recordDate > date) return;
    const key = `${record.zoneName}|${record.netHouseCode}`;
    const existing = latestByHouse.get(key);
    if (!existing || String(record.recordDate || "") > String(existing.recordDate || "")) {
      latestByHouse.set(key, record);
    }
  });
  return [...latestByHouse.values()].filter((record) =>
    record.status === "種植" && isNetHouseStatusRecordActiveOnDate(record, date),
  );
}

function harvestConversionNetHouseTotals(date = harvestDate(), quantityKey = "estimatedQuantity", options = {}) {
  const normalizedQuantityKey = quantityKey === "harvestQuantity" ? "harvestQuantity" : "estimatedQuantity";
  const includeZeroQuantity = options.includeZeroQuantity === true;
  const includeUnscheduledCrops = options.includeUnscheduledCrops === true;
  const totals = new Map();
  latestNetHouseStatusRecordsForHarvestDate(date).forEach((record) => {
    const col = harvestConversionQuantityColumn(record.zoneName, record.netHouseCode);
    if (!col) return;
    activeNetHouseStatusCropItems(record).forEach((item) => {
      const cropName = String(item?.cropName || "").trim();
      const itemHarvestDate = String(item?.harvestDate || "");
      const harvestsOnDate = itemHarvestDate === date;
      const quantity = harvestsOnDate ? n(item?.[normalizedQuantityKey]) : 0;
      if (!cropName) return;
      if (item?.destroyed && !includeZeroQuantity && !includeUnscheduledCrops) return;
      if (harvestsOnDate) {
        if (!includeZeroQuantity && !quantity) return;
      } else if (!includeUnscheduledCrops) {
        return;
      }
      const product = harvestConversionProductByCropName(cropName);
      if (!product) return;
      const key = `${product.rowIndex}|${col}`;
      const current = totals.get(key) || {
        rowIndex: product.rowIndex,
        col,
        product,
        quantity: 0,
      };
      current.quantity += quantity;
      totals.set(key, current);
    });
  });
  return [...totals.values()];
}

function applyHarvestConversionToQuantityTable({ rerender = true, source = "harvest" } = {}) {
  const template = harvestTemplate();
  const targetDate = harvestDate();
  const sourceDate = previousDateText(targetDate);
  if (!template || !targetDate || !sourceDate) return 0;
  const cellMap = harvestCellMap();
  const isEstimatedSource = source === "estimated";
  const hasPrecool = isEstimatedSource ? false : activeHarvestConversionHasPrecool(targetDate);
  const quantityKey = isEstimatedSource ? "estimatedQuantity" : "harvestQuantity";
  let appliedCount = 0;
  harvestConversionNetHouseTotals(sourceDate, quantityKey, {
    includeZeroQuantity: !isEstimatedSource,
    includeUnscheduledCrops: !isEstimatedSource,
  }).forEach((item) => {
    const packageKey = harvestConversionProductPackageKey(item.product);
    const packageCount = harvestConversionPackageCount(packageKey, item.quantity, hasPrecool);
    const cell = cellMap.get(`${item.rowIndex}:${item.col}`);
    if (!cell || !isHarvestEditableCell(cell)) return;
    setDraftHarvestEntry(cell, packageCount ? String(packageCount) : "");
    appliedCount += 1;
  });
  updateHarvestSaveStatus();
  if (rerender) renderHarvestPlanning();
  return appliedCount;
}

function renderHarvestConversionSettingsModal() {
  if (!state.harvestConversionSettingsOpen) return "";
  const date = harvestDate();
  const products = harvestConversionProductRows();
  const hasPrecool = activeHarvestConversionHasPrecool(date);
  const packagedChannels = activeHarvestPackagedChannels(date);
  const packageOptions = (selectedKey) => harvestPackageCalculatorRows
    .map((row) => `<option value="${escapeAttribute(row.key)}" ${row.key === selectedKey ? "selected" : ""}>${escapeHtml(row.packLabel)}</option>`)
    .join("");
  return `<div class="modal harvest-conversion-modal">
    <div class="modal-backdrop" data-close-harvest-conversion-settings="true"></div>
    <div class="modal-card harvest-conversion-modal-card">
      <div class="modal-header">
        <h2>換算參數</h2>
        <button type="button" data-close-harvest-conversion-settings="true">關閉</button>
      </div>
      <div class="harvest-conversion-modal-toolbar">
        <label class="harvest-conversion-precool-toggle">
          <input id="harvestConversionPrecoolInput" type="checkbox" ${hasPrecool ? "checked" : ""} />
          <span>有預冷</span>
        </label>
        <div class="harvest-conversion-action-buttons">
          <button id="applyHarvestEstimatedConversionBtn" type="button">套用預估量</button>
          <button id="applyHarvestConversionBtn" type="button">套用採收量</button>
        </div>
      </div>
      <div class="harvest-conversion-packaging-section">
        <div class="harvest-conversion-section-title">已開始包裝</div>
        <div class="harvest-conversion-packaging-options">
          ${harvestPackagingChannels.map((channel) => `<label class="harvest-conversion-packaging-toggle">
            <input class="harvest-packaging-channel-input" type="checkbox" data-harvest-packaging-channel="${escapeAttribute(channel.key)}" ${packagedChannels[channel.key] ? "checked" : ""} />
            <span>${escapeHtml(channel.label)}已包裝</span>
          </label>`).join("")}
        </div>
      </div>
      <div class="harvest-conversion-list">
        ${products.map((product) => {
          const productKey = productFilterKey(product);
          const selectedKey = harvestConversionProductPackageKey(product);
          return `<label class="harvest-conversion-row">
            <span class="harvest-conversion-code">${escapeHtml(product.productCode || "")}</span>
            <span class="harvest-conversion-name">${escapeHtml(product.productName)}</span>
            <select class="harvest-conversion-select" data-harvest-conversion-product="${escapeAttribute(productKey)}">
              ${packageOptions(selectedKey)}
            </select>
          </label>`;
        }).join("")}
      </div>
    </div>
  </div>`;
}

function bindHarvestConversionSettingsModal() {
  document.querySelectorAll("[data-close-harvest-conversion-settings='true']").forEach((item) => {
    item.addEventListener("click", () => {
      state.harvestConversionSettingsOpen = false;
      renderHarvestPlanning();
    });
  });
  byId("harvestConversionPrecoolInput")?.addEventListener("change", (event) => {
    setActiveHarvestConversionHasPrecool(event.target.checked);
    persistHarvestConversionSettings().catch((error) => alert(`換算參數保存失敗：${error.message}`));
  });
  document.querySelectorAll(".harvest-packaging-channel-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      setActiveHarvestChannelPackaged(event.target.dataset.harvestPackagingChannel, event.target.checked);
      persistHarvestConversionSettings().catch((error) => alert(`換算參數保存失敗：${error.message}`));
      renderHarvestPlanning();
    });
  });
  document.querySelectorAll(".harvest-conversion-select").forEach((select) => {
    select.addEventListener("change", (event) => {
      setHarvestConversionProductPackage(event.target.dataset.harvestConversionProduct, event.target.value);
      persistHarvestConversionSettings().catch((error) => alert(`換算參數保存失敗：${error.message}`));
    });
  });
  byId("applyHarvestEstimatedConversionBtn")?.addEventListener("click", () => {
    applyHarvestConversionToQuantityTable({ source: "estimated" });
  });
  byId("applyHarvestConversionBtn")?.addEventListener("click", () => {
    applyHarvestConversionToQuantityTable({ source: "harvest" });
  });
}

function addHarvestCrewColumn(rawName, category = "有機", isCustom = false) {
  const name = String(rawName || "").trim();
  const normalizedCategory = harvestCrewCategories.includes(category) ? category : "有機";
  if (!name) {
    alert("請輸入人名");
    return;
  }
  if (hasHarvestCrewColumnName(name, normalizedCategory)) {
    alert("這個分類與人名已經在表格中");
    return;
  }
  const defaultColumn = defaultHarvestCrewColumns.find((column) => column.name === name && column.category === normalizedCategory);
  const nextColumn = defaultColumn && !isCustom
    ? defaultColumn
    : { name, category: normalizedCategory, col: nextHarvestCustomColumnIndex(), source: isCustom ? "custom" : "default" };
  setActiveHarvestCrewColumns([
    ...activeHarvestCrewColumns(),
    { ...nextColumn, column: columnLetterFromIndex(nextColumn.col) },
  ]);
  harvestCrewPickerOpen = false;
  persistHarvestCrewColumns().catch((error) => alert(`採收人員欄位保存失敗：${error.message}`));
  renderHarvestPlanning();
}

function removeHarvestCrewColumn(col) {
  const column = harvestCrewColumnByCol(col);
  const template = harvestTemplate();
  const date = harvestDate();
  if (!column || !template || !date) return;
  const confirmed = confirm(`移除「${column.category} ${column.name}」欄位會同時刪除 ${formatDateShort(date) || date} 這一天此欄已保存的採收量。確定要移除嗎？`);
  if (!confirmed) return;
  const columnLetter = columnLetterFromIndex(col);
  setActiveHarvestCrewColumns(activeHarvestCrewColumns().filter((column) => column.col !== col));
  clearDraftHarvestEntriesForColumn(date, template.sheetName, columnLetter);
  Promise.all([persistHarvestCrewColumns(), persistDraftHarvestEntries()])
    .catch((error) => alert(`移除採收人員欄位失敗：${error.message}`));
  renderHarvestPlanning();
}

function closeHarvestPriorityMenu() {
  byId("harvestPriorityMenu")?.remove();
  harvestPriorityMenuCell = null;
}

function harvestMenuCell() {
  if (!harvestPriorityMenuCell) return null;
  return harvestCellMap().get(`${harvestPriorityMenuCell.row}:${harvestPriorityMenuCell.col}`) || null;
}

function applyHarvestPrioritySelection(priority) {
  const cell = harvestMenuCell();
  if (!cell || !isHarvestPriorityCell(cell)) return;
  if (!setDraftHarvestCellPriority(cell, priority)) {
    alert("這個品項已經使用這個 Priority。");
    return;
  }
  closeHarvestPriorityMenu();
  updateHarvestSaveStatus();
  renderHarvestPlanning();
}

function applyHarvestFormulaInput(rawFormula) {
  const cell = harvestMenuCell();
  if (!cell || !isHarvestEditableCell(cell)) return;
  let result = 0;
  try {
    result = evaluateHarvestArithmeticFormula(rawFormula);
  } catch (error) {
    alert(error.message || "公式格式錯誤");
    return;
  }
  if (result === null) {
    alert("請輸入公式，例如 =160+220-130");
    return;
  }
  setDraftHarvestEntry(cell, String(result));
  setDraftHarvestCellFormula(cell, String(rawFormula || "").trim());
  closeHarvestPriorityMenu();
  updateHarvestSaveStatus();
  renderHarvestPlanning();
}

function applyHarvestPackageFormulaInput(input, rawFormula) {
  if (!input?.dataset?.packageKey) return;
  let result = 0;
  try {
    result = evaluateHarvestArithmeticFormula(rawFormula);
  } catch (error) {
    alert(error.message || "公式格式錯誤");
    return;
  }
  if (result === null) {
    alert("請輸入公式，例如 =160+220-130");
    return;
  }
  const value = String(result);
  input.value = value;
  setHarvestPackageCalculatorInput(input.dataset.packageKey, value);
  updateHarvestPackageCalculatorResults();
  closeHarvestPriorityMenu();
}

function openHarvestPackageFormulaMenu(event, input) {
  if (!input?.dataset?.packageKey) return;
  event.preventDefault();
  event.stopPropagation();
  closeHarvestPriorityMenu();
  const menu = document.createElement("div");
  menu.id = "harvestPriorityMenu";
  menu.className = "harvest-priority-menu";
  menu.innerHTML = `
    <form id="harvestFormulaForm" class="harvest-formula-form">
      <label>
        <span>公式</span>
        <input id="harvestFormulaInput" class="harvest-formula-input" type="text" inputmode="decimal" placeholder="=160+220-130" value="${escapeAttribute(input.value || "")}" autocomplete="off" />
      </label>
      <button class="harvest-formula-apply" type="submit">套用</button>
    </form>
  `;
  document.body.append(menu);
  const menuRect = menu.getBoundingClientRect();
  const left = Math.min(event.clientX, window.innerWidth - menuRect.width - 8);
  const top = Math.min(event.clientY, window.innerHeight - menuRect.height - 8);
  menu.style.left = `${Math.max(8, left)}px`;
  menu.style.top = `${Math.max(8, top)}px`;
  menu.addEventListener("click", (menuEvent) => menuEvent.stopPropagation());
  byId("harvestFormulaForm")?.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
    applyHarvestPackageFormulaInput(input, byId("harvestFormulaInput")?.value || "");
  });
  byId("harvestFormulaInput")?.focus();
}

function openHarvestCellMenu(event, input) {
  const row = Number(input.dataset.row);
  const col = Number(input.dataset.col);
  const cell = harvestCellMap().get(`${row}:${col}`);
  if (!cell || !isHarvestEditableCell(cell)) return;
  event.preventDefault();
  event.stopPropagation();
  closeHarvestPriorityMenu();
  harvestPriorityMenuCell = { row, col };
  const priorityEnabled = isHarvestPriorityCell(cell);
  const currentPriority = priorityEnabled ? harvestPriorityForCell(cell) : 0;
  const menu = document.createElement("div");
  menu.id = "harvestPriorityMenu";
  menu.className = "harvest-priority-menu";
  menu.innerHTML = `
    ${priorityEnabled ? `<div class="harvest-priority-section">
      <div class="harvest-priority-menu-title">Priority</div>
      <div class="harvest-priority-options">
        ${harvestPriorityLevels.map((priority) => {
        const usedByOtherCell = Boolean(harvestPriorityOwner(priority, cell));
        return `
          <button class="harvest-priority-option ${priority === currentPriority ? "is-active" : ""}" type="button" data-harvest-priority="${priority}" ${usedByOtherCell ? "disabled" : ""}>
            <span class="harvest-priority-swatch harvest-priority-${priority}"></span>
            <span>P${priority}</span>
          </button>
        `;
        }).join("")}
      </div>
      <button class="harvest-priority-clear" type="button" data-harvest-priority-clear="true">清除</button>
    </div>` : ""}
    <form id="harvestFormulaForm" class="harvest-formula-form">
      <label>
        <span>公式</span>
        <input id="harvestFormulaInput" class="harvest-formula-input" type="text" inputmode="decimal" placeholder="=160+220-130" value="${escapeAttribute(harvestFormulaForCell(cell))}" autocomplete="off" />
      </label>
      <button class="harvest-formula-apply" type="submit">套用</button>
    </form>
  `;
  document.body.append(menu);
  const menuRect = menu.getBoundingClientRect();
  const left = Math.min(event.clientX, window.innerWidth - menuRect.width - 8);
  const top = Math.min(event.clientY, window.innerHeight - menuRect.height - 8);
  menu.style.left = `${Math.max(8, left)}px`;
  menu.style.top = `${Math.max(8, top)}px`;
  menu.addEventListener("click", (menuEvent) => {
    menuEvent.stopPropagation();
    const clearButton = menuEvent.target.closest("[data-harvest-priority-clear]");
    if (clearButton) {
      applyHarvestPrioritySelection(0);
      return;
    }
    const button = menuEvent.target.closest("[data-harvest-priority]");
    if (!button || button.disabled) return;
    applyHarvestPrioritySelection(Number(button.dataset.harvestPriority));
  });
  byId("harvestFormulaForm")?.addEventListener("submit", (submitEvent) => {
    submitEvent.preventDefault();
    applyHarvestFormulaInput(byId("harvestFormulaInput")?.value || "");
  });
  byId("harvestFormulaInput")?.focus();
}

function harvestMessageItemsMarkup(date = harvestDate()) {
  if (!harvestMessagesLoaded(date)) {
    return '<p class="harvest-message-empty">留言載入中...</p>';
  }
  const messages = harvestMessagesForDate(date);
  if (!messages.length) {
    return '<p class="harvest-message-empty">今天沒有留言</p>';
  }
  return messages
    .map((message) => `<article class="harvest-message-item">
      <div class="harvest-message-meta">
        <time>${escapeHtml(formatHarvestMessageTime(message.createdAt))}</time>
        <button class="harvest-message-delete" type="button" data-delete-harvest-message="${message.id}">刪除</button>
      </div>
      <p>${escapeHtml(message.message).replace(/\n/g, "<br />")}</p>
    </article>`)
    .join("");
}

function renderHarvestMessageBoard() {
  const date = harvestDate();
  const loaded = harvestMessagesLoaded(date);
  const count = harvestMessagesForDate(date).length;
  return `<section id="harvestMessageBoard" class="harvest-message-board">
    <div class="harvest-message-board-head">
      <div>
        <h3>留言板</h3>
        <span>${escapeHtml(formatDateShort(date) || date)} 交接事項</span>
      </div>
      <span id="harvestMessageStatus" class="date-pill">${loaded ? `${count} 則留言` : "留言載入中"}</span>
    </div>
    <form id="harvestMessageForm" class="harvest-message-form">
      <textarea id="harvestMessageInput" class="harvest-message-input" rows="3" maxlength="1000" placeholder="輸入今天要交接的事項"></textarea>
      <button id="addHarvestMessageBtn" type="submit">新增留言</button>
    </form>
    <div id="harvestMessageList" class="harvest-message-list">
      ${harvestMessageItemsMarkup(date)}
    </div>
  </section>`;
}

function setHarvestMessageStatus(text) {
  const status = byId("harvestMessageStatus");
  if (status) status.textContent = text;
}

function updateHarvestMessageBoard(statusText = "") {
  const date = harvestDate();
  const list = byId("harvestMessageList");
  if (list) list.innerHTML = harvestMessageItemsMarkup(date);
  const count = harvestMessagesForDate(date).length;
  setHarvestMessageStatus(statusText || (harvestMessagesLoaded(date) ? `${count} 則留言` : "留言載入中"));
  updateHarvestMessageTabBadge(date);
  document.querySelectorAll("[data-delete-harvest-message]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!confirm("刪除這則留言？")) return;
      setHarvestMessageStatus("留言刪除中...");
      deleteHarvestMessage(button.dataset.deleteHarvestMessage)
        .then(() => updateHarvestMessageBoard("留言已刪除"))
        .catch((error) => {
          setHarvestMessageStatus("留言刪除失敗");
          alert(`留言刪除失敗：${error.message}`);
        });
    });
  });
}

function bindHarvestMessageBoard() {
  const date = harvestDate();
  const form = byId("harvestMessageForm");
  const input = byId("harvestMessageInput");
  const button = byId("addHarvestMessageBtn");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input?.value || "";
    if (button) button.disabled = true;
    setHarvestMessageStatus("留言保存中...");
    addHarvestMessage(message)
      .then(() => {
        if (input) input.value = "";
        updateHarvestMessageBoard("留言已保存");
      })
      .catch((error) => {
        setHarvestMessageStatus("留言保存失敗");
        alert(`留言保存失敗：${error.message}`);
      })
      .finally(() => {
        if (button) button.disabled = false;
      });
  });
  if (!harvestMessagesLoaded(date)) {
    ensureHarvestMessagesForDate(date)
      .then(() => {
        if (state.page === "harvestPlanning" && state.harvestView === "messageBoard" && harvestDate() === date) {
          updateHarvestMessageBoard();
        }
      })
      .catch((error) => {
        setHarvestMessageStatus("留言載入失敗");
        const list = byId("harvestMessageList");
        if (list) list.innerHTML = `<p class="harvest-message-empty">留言載入失敗：${escapeHtml(error.message)}</p>`;
      });
  } else {
    updateHarvestMessageBoard();
  }
}

function renderHarvestMessagePage() {
  const date = harvestDate();
  byId("viewTitle").innerHTML = `<div class="view-title-row">
    <div>
      <h2>留言板</h2>
    </div>
    <span class="date-pill">${escapeHtml(formatDateShort(date) || date)}</span>
  </div>`;
  byId("tableHost").innerHTML = `<div class="harvest-message-page">
    ${renderHarvestMessageBoard()}
  </div>`;
  bindHarvestMessageBoard();
}

function renderHarvestPlanning() {
  const template = harvestTemplate();
  if (!template) {
    byId("viewTitle").innerHTML = "<h2>每日採收規劃</h2><p>尚未載入採收規劃表模板。</p>";
    byId("tableHost").innerHTML = "";
    return;
  }
  const cellMap = harvestCellMap();
  const { origins, covered } = harvestMergeMaps();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const activeInventorySourceMap = harvestActiveInventorySourceMap(cellMap, shipmentRoundColumns);
  const unfinishedColumns = harvestUnfinishedTableColumns();
  const quantityColumns = harvestQuantityTableColumns();
  byId("viewTitle").innerHTML = `<div class="view-title-row">
    <div>
      <h2>採收規劃表</h2>
    </div>
    <div class="sales-save-actions">
      <button id="copyHarvestUnfinishedSelectionBtn" type="button">複製勾選</button>
      <span id="harvestSaveStatus" class="date-pill">採收量已保存</span>
      <button id="exportHarvestShipmentBtn" type="button">匯出 Excel</button>
      <button id="saveHarvestBtn" type="button">保存</button>
    </div>
  </div>`;

  byId("tableHost").innerHTML = `${renderHarvestConversionSettingsModal()}<div class="harvest-split-sheet">
    <div class="harvest-section-block">
      <div class="harvest-section-title">到貨量</div>
      ${renderHarvestBlockTable(template, cellMap, origins, covered, [2], null, { includeProductCode: true, includeRowTotal: true, includeLooseVegetableColumns: true, includeYfyColumns: true, includeCityColumn: true, includeGeneralChannelColumns: true, useHarvestInventoryTotal: true, shipmentRoundColumns, splitSingleRowHeaders: true, activeInventorySourceMap })}
    </div>
    <div class="harvest-section-block">
      ${renderHarvestField3FTitle("未包完", "unfinished")}
      ${renderHarvestBlockTable(template, cellMap, origins, covered, unfinishedColumns, null, { fieldSection: "unfinished", includeUnfinishedSelection: true, activeInventorySourceMap })}
    </div>
    <div class="harvest-section-block">
      ${renderHarvestField3FTitle("採收數量", "quantity")}
      ${renderHarvestBlockTable(template, cellMap, origins, covered, quantityColumns, null, { fieldSection: "quantity", activeInventorySourceMap })}
    </div>
    <div class="harvest-section-block harvest-crew-block">
      <div class="harvest-section-title harvest-crew-title-row">
        <span>其他農場</span>
        ${renderHarvestCrewControls()}
      </div>
      ${renderHarvestBlockTable(template, cellMap, origins, covered, [2, ...activeHarvestCrewColumns().map((column) => column.col)], null, { activeInventorySourceMap })}
    </div>
  </div>`;
  byId("copyHarvestUnfinishedSelectionBtn")?.addEventListener("click", copyHarvestUnfinishedSelection);
  byId("exportHarvestShipmentBtn")?.addEventListener("click", exportHarvestShipmentExcel);
  byId("saveHarvestBtn")?.addEventListener("click", saveDraftHarvestEntries);
  bindHarvestField3FToggleButtons();
  bindHarvestFieldExtraColumnButtons();
  bindHarvestConversionSettingsModal();
  byId("toggleHarvestCrewPickerBtn")?.addEventListener("click", () => {
    harvestCrewPickerOpen = !harvestCrewPickerOpen;
    renderHarvestPlanning();
  });
  byId("harvestCrewPanel")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  document.querySelectorAll("[data-add-harvest-crew]").forEach((button) => {
    button.addEventListener("click", () => addHarvestCrewColumn(button.dataset.addHarvestCrew, button.dataset.addHarvestCrewCategory));
  });
  byId("customHarvestCrewForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    addHarvestCrewColumn(
      byId("customHarvestCrewName")?.value || "",
      byId("customHarvestCrewCategory")?.value || "有機",
      true,
    );
  });
  document.querySelectorAll(".harvest-remove-column").forEach((button) => {
    button.addEventListener("click", () => removeHarvestCrewColumn(Number(button.dataset.col)));
  });
  document.querySelectorAll(".harvest-field-extra-panel").forEach((panel) => {
    panel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });
  updateHarvestSaveStatus();
  document.querySelectorAll(".harvest-unfinished-select-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      const rowKey = event.target.dataset.harvestUnfinishedSelectRow;
      if (!rowKey) return;
      if (event.target.checked) {
        harvestUnfinishedSelectedRows.add(rowKey);
      } else {
        harvestUnfinishedSelectedRows.delete(rowKey);
      }
    });
  });
  document.querySelectorAll(".harvest-input").forEach((input) => {
    input.addEventListener("contextmenu", (event) => openHarvestCellMenu(event, input));
    input.addEventListener("focus", (event) => {
      const cell = cellMap.get(`${event.target.dataset.row}:${event.target.dataset.col}`);
      if (!cell) return;
      event.target.value = harvestInputEditingValue(cell);
    });
    input.addEventListener("input", (event) => {
      const normalizedValue = harvestEditableInputValue(event.target.value);
      if (event.target.value !== normalizedValue) event.target.value = normalizedValue;
      if (Number(normalizedValue) < 0) event.target.value = "0";
      const cell = cellMap.get(`${event.target.dataset.row}:${event.target.dataset.col}`);
      if (!cell) return;
      setDraftHarvestEntry(cell, event.target.value);
      setDraftHarvestCellFormula(cell, "");
      updateHarvestSaveStatus();
    });
    input.addEventListener("blur", (event) => {
      const cell = cellMap.get(`${event.target.dataset.row}:${event.target.dataset.col}`);
      if (!cell) return;
      event.target.value = event.target.classList.contains("harvest-no-package-input")
        ? harvestNoPackageDisplayValue(cell)
        : harvestInputDisplayValue(harvestDraftValue(cell));
    });
  });
}

document.addEventListener("click", (event) => {
  if (
    fieldNumericKeypadState.input
    && !event.target.closest?.("#fieldNumericKeypad")
    && !event.target.closest?.("[data-field-numeric-keypad]")
  ) {
    closeFieldNumericKeypad();
  }
  if (!event.target.closest?.("#harvestPriorityMenu")) closeHarvestPriorityMenu();
  if (!event.target.closest?.("#headerActions")) setImportMenuOpen(false);
  let shouldRenderHarvestPlanning = false;
  if (harvestFieldExtraPickerOpen && !event.target.closest?.(".harvest-field-extra-panel")) {
    harvestFieldExtraPickerOpen = "";
    shouldRenderHarvestPlanning = true;
  }
  if (harvestCrewPickerOpen) {
    harvestCrewPickerOpen = false;
    shouldRenderHarvestPlanning = true;
  }
  if (shouldRenderHarvestPlanning && state.page === "harvestPlanning") renderHarvestPlanning();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && fieldNumericKeypadState.input) closeFieldNumericKeypad({ commit: false });
  if (event.key === "Escape") closeHarvestPriorityMenu();
  if (event.key === "Escape") setImportMenuOpen(false);
});

window.addEventListener("resize", () => syncFieldNumericKeypadControls());
window.addEventListener("orientationchange", () => syncFieldNumericKeypadControls());

function renderSpec() {
  byId("viewTitle").innerHTML = "<h2>需求規格</h2><p>依你目前 Excel 工作流整理出的系統模組。</p>";
  byId("tableHost").innerHTML = `<div class="spec-grid">
    ${[
      ["資料匯入", "上傳每日 SalesData，系統只讀 A:K，依門市代號與呼出碼彙總銷售量、丟棄量、期末庫存。"],
      ["庫存更新", "用彙總後資料取代 mail sheet 上方銷售、下方丟棄，再回寫到各門市當日欄位。"],
      ["補貨判斷", "集中顯示每間門市每個品項的即時庫存，依門檻與目標量產生建議到貨。"],
      ["採收規劃", "將補貨建議轉成採收規劃表的門市欄位格式，彙總品項、門市、到貨量與總數。"],
      ["稽核追蹤", "保留來源檔、銷售日、轉換時間與每次建議量，避免 XLOOKUP 或複製貼上錯位。"],
      ["正式版建議", "後續改成資料庫、登入權限、Excel 匯入/匯出、版本紀錄與異常提醒。"],
    ]
      .map(([title, text]) => `<article class="spec-card"><h2>${title}</h2><p>${text}</p></article>`)
      .join("")}
  </div>`;
}

function cityHarvestBaseTotal(row, cellMap, shipmentRoundColumns, totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock()) {
  if (!row?.rowIndex) return 0;
  return harvestRowTotal(cellMap, row.rowIndex, shipmentRoundColumns, totalOptions);
}

function cityRowHarvestTotal(row, date, cellMap, shipmentRoundColumns, totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock()) {
  return cityHarvestBaseTotal(row, cellMap, shipmentRoundColumns, totalOptions)
    + cityEntryValue(draftCityEntries, date, cityRowKey(row), "stock");
}

function cityRowChannelTotal(row, date, entries = draftCityEntries) {
  const rowKey = cityRowKey(row);
  return cityChannelColumns.reduce((sum, column) => sum + cityEntryValue(entries, date, rowKey, column.key), 0);
}

function cityProductRows() {
  return allHarvestProducts
    .filter((product) => isHarvestItemRow(product.rowIndex))
    .map((product) => ({
      rowIndex: product.rowIndex,
      label: product.productName,
      section: product.rowIndex <= 40 ? "regular" : "other",
    }));
}

function visibleCityProductRow(row) {
  if (!row?.rowIndex) return true;
  return visibleHarvestRow(row.rowIndex);
}

function visibleCityProductRows() {
  return cityProductRows().filter((row) => visibleCityProductRow(row));
}

function visibleCityTableRows(rows = visibleCityProductRows()) {
  const regularRows = rows.filter((row) => row.section === "regular");
  const otherRows = rows.filter((row) => row.section !== "regular");
  return regularRows.length
    ? [...regularRows, { key: "subtotal", label: "小計", type: "subtotal" }, ...otherRows]
    : otherRows;
}

function citySubtotalRows(rows = visibleCityProductRows()) {
  return rows.filter((row) => row.section === "regular");
}

function citySubtotalValue(
  date,
  columnKey,
  cellMap,
  shipmentRoundColumns,
  rows = citySubtotalRows(),
  totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock(),
) {
  if (columnKey === "harvestTotal") {
    return rows.reduce((sum, row) => sum + cityRowHarvestTotal(row, date, cellMap, shipmentRoundColumns, totalOptions), 0);
  }
  if (columnKey === "channelTotal") {
    return rows.reduce((sum, row) => sum + cityRowChannelTotal(row, date), 0);
  }
  return rows.reduce((sum, row) => sum + cityEntryValue(draftCityEntries, date, cityRowKey(row), columnKey), 0);
}

function channelTableNumberText(value) {
  return n(value) ? numberText(value) : "";
}

function citySubtotalText(value) {
  return channelTableNumberText(value);
}

const generalChannelTableColumnWidths = {
  stockBalance: 78,
  harvestTotal: 82,
  product: 80,
  input: 104,
  total: 76,
};

function channelTableColGroup(widths) {
  return `<colgroup>${widths.map((width) => `<col style="width:${width}px" />`).join("")}</colgroup>`;
}

function channelTableWidthStyle(widths) {
  const width = widths.reduce((sum, item) => sum + item, 0);
  return `style="width:${width}px;min-width:${width}px"`;
}

function updateCityTableTotals(context = {}) {
  const date = context.date || cityDate();
  const cellMap = context.cellMap || harvestCellMap();
  const shipmentRoundColumns = context.shipmentRoundColumns || harvestShipmentRoundColumns();
  const rows = context.rows || visibleCityProductRows();
  const subtotalRows = context.subtotalRows || citySubtotalRows(rows);
  const totalOptions = context.totalOptions || harvestChannelInventoryTotalOptionsWithoutUnfinishedStock();
  rows.forEach((row) => {
    const rowKey = cityRowKey(row);
    const totalCell = document.querySelector(`[data-city-harvest-total="${rowKey}"]`);
    if (totalCell) totalCell.innerHTML = channelTableNumberText(cityRowHarvestTotal(row, date, cellMap, shipmentRoundColumns, totalOptions));
    const channelTotalCell = document.querySelector(`[data-city-channel-total="${rowKey}"]`);
    if (channelTotalCell) channelTotalCell.innerHTML = channelTableNumberText(cityRowChannelTotal(row, date));
  });
  ["harvestTotal", "stock", ...cityChannelColumns.map((column) => column.key), "channelTotal"].forEach((columnKey) => {
    const subtotalCell = document.querySelector(`[data-city-subtotal="${columnKey}"]`);
    if (!subtotalCell) return;
    subtotalCell.innerHTML = citySubtotalText(citySubtotalValue(date, columnKey, cellMap, shipmentRoundColumns, subtotalRows, totalOptions));
  });
  updateCitySaveStatus();
}

function yfyRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock()) {
  if (!row?.rowIndex) return 0;
  return harvestRowTotal(cellMap, row.rowIndex, shipmentRoundColumns, totalOptions);
}

function yfyRowChannelTotal(row, date, entries = draftYfyEntries) {
  const rowKey = yfyRowKey(row);
  return yfyInputColumns.reduce((sum, column) => sum + yfyEntryValue(entries, date, rowKey, column.key), 0);
}

function yfyConvertedBaibaoValue(entries, date, rowKey) {
  const baibaoValue = yfyEntryValue(entries, date, rowKey, "greenSafeBaibao");
  return baibaoValue ? Math.ceil((baibaoValue * 300) / 250) : 0;
}

function yfyRowConvertedTotal(row, date, entries = draftYfyEntries) {
  const rowKey = yfyRowKey(row);
  return yfyEntryValue(entries, date, rowKey, "greenSafe") + yfyConvertedBaibaoValue(entries, date, rowKey);
}

function yfySubtotalValue(
  date,
  columnKey,
  cellMap,
  shipmentRoundColumns,
  rows = citySubtotalRows(),
  totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock(),
) {
  if (columnKey === "harvestTotal") {
    return rows.reduce((sum, row) => sum + yfyRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions), 0);
  }
  if (columnKey === "channelTotal") {
    return rows.reduce((sum, row) => sum + yfyRowChannelTotal(row, date), 0);
  }
  if (columnKey === "convertedTotal") {
    return rows.reduce((sum, row) => sum + yfyRowConvertedTotal(row, date), 0);
  }
  return rows.reduce((sum, row) => sum + yfyEntryValue(draftYfyEntries, date, yfyRowKey(row), columnKey), 0);
}

function yfyHeaderLabel(column) {
  if (Array.isArray(column.labelLines)) {
    return `<span class="stacked-table-header">${column.labelLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</span>`;
  }
  return escapeHtml(column.label);
}

function harvestLooseVegetableHeaderLabel(label) {
  const text = String(label || "").trim();
  const unitMatch = text.match(/^(.*?)(\s*[\(（][^()（）]+[\)）])$/u);
  if (!unitMatch || !unitMatch[1].trim()) return escapeHtml(text);
  return `${escapeHtml(unitMatch[1].trim())}<br />${escapeHtml(unitMatch[2].trim())}`;
}

function updateYfyTableTotals(context = {}) {
  const date = context.date || yfyDate();
  const cellMap = context.cellMap || harvestCellMap();
  const shipmentRoundColumns = context.shipmentRoundColumns || harvestShipmentRoundColumns();
  const rows = context.rows || visibleCityProductRows();
  const subtotalRows = context.subtotalRows || citySubtotalRows(rows);
  const totalOptions = context.totalOptions || harvestChannelInventoryTotalOptionsWithoutUnfinishedStock();
  rows.forEach((row) => {
    const rowKey = yfyRowKey(row);
    const totalCell = document.querySelector(`[data-yfy-harvest-total="${rowKey}"]`);
    if (totalCell) totalCell.innerHTML = channelTableNumberText(yfyRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions));
    const channelTotalCell = document.querySelector(`[data-yfy-channel-total="${rowKey}"]`);
    const channelTotal = yfyRowChannelTotal(row, date);
    if (channelTotalCell) channelTotalCell.innerHTML = channelTableNumberText(channelTotal);
    const convertedTotalCell = document.querySelector(`[data-yfy-converted-total="${rowKey}"]`);
    const convertedTotal = yfyRowConvertedTotal(row, date);
    if (convertedTotalCell) convertedTotalCell.innerHTML = channelTableNumberText(convertedTotal);
  });
  ["harvestTotal", ...yfyInputColumns.map((column) => column.key), "channelTotal", "convertedTotal"].forEach((columnKey) => {
    const subtotalCell = document.querySelector(`[data-yfy-subtotal="${columnKey}"]`);
    if (!subtotalCell) return;
    subtotalCell.innerHTML = citySubtotalText(yfySubtotalValue(date, columnKey, cellMap, shipmentRoundColumns, subtotalRows, totalOptions));
  });
  updateYfySaveStatus();
}

function looseVegetableRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock()) {
  if (!row?.rowIndex) return 0;
  return harvestRowTotal(cellMap, row.rowIndex, shipmentRoundColumns, totalOptions);
}

function looseVegetableRowRemainingInventoryTotal(
  row,
  date,
  cellMap,
  shipmentRoundColumns,
  totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock(),
  entries = draftLooseVegetableEntries,
  columns = looseVegetableActiveDraftColumns(date),
) {
  if (!row?.rowIndex) return 0;
  const baseTotal = looseVegetableRowHarvestTotal(row, cellMap, shipmentRoundColumns, {
    ...totalOptions,
    includeLooseVegetableTotal: false,
  });
  return baseTotal - looseVegetableRowTotal(row, date, entries, columns);
}

function looseVegetableRowRawTotal(row, date, entries = draftLooseVegetableEntries, columns = looseVegetableActiveDraftColumns(date)) {
  const rowKey = looseVegetableRowKey(row);
  return columns.reduce((sum, column) => sum + looseVegetableEntryValue(entries, date, rowKey, column.key), 0);
}

function looseVegetableRowTotalMultiplier(row) {
  if (row?.section !== "regular") return 1;
  const label = String(row.label || "");
  if (label.includes("香菜")) return 29;
  if (label.includes("九層塔")) return 9;
  if (label.includes("羽衣") || label.includes("芝麻")) return 7;
  if (label.includes("茼蒿")) return 6;
  return 4;
}

function looseVegetableRowTotal(row, date, entries = draftLooseVegetableEntries, columns = looseVegetableActiveDraftColumns(date)) {
  const converted = looseVegetableRowRawTotal(row, date, entries, columns) * looseVegetableRowTotalMultiplier(row);
  return converted > 0 ? Math.ceil(converted) : 0;
}

function looseVegetableSubtotalValue(
  date,
  columnKey,
  cellMap,
  shipmentRoundColumns,
  rows = citySubtotalRows(),
  totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock(),
) {
  if (columnKey === "harvestTotal") {
    return rows.reduce((sum, row) => (
      sum + looseVegetableRowRemainingInventoryTotal(row, date, cellMap, shipmentRoundColumns, totalOptions)
    ), 0);
  }
  if (columnKey === "channelTotal") {
    return rows.reduce((sum, row) => sum + looseVegetableRowTotal(row, date), 0);
  }
  return rows.reduce((sum, row) => sum + looseVegetableEntryValue(draftLooseVegetableEntries, date, looseVegetableRowKey(row), columnKey), 0);
}

function updateLooseVegetableTableTotals(context = {}) {
  const date = context.date || looseVegetableDate();
  const cellMap = context.cellMap || harvestCellMap();
  const shipmentRoundColumns = context.shipmentRoundColumns || harvestShipmentRoundColumns();
  const rows = context.rows || visibleCityProductRows();
  const subtotalRows = context.subtotalRows || citySubtotalRows(rows);
  const totalOptions = context.totalOptions || harvestChannelInventoryTotalOptionsWithoutUnfinishedStock();
  const columns = context.columns || looseVegetableActiveDraftColumns(date);
  rows.forEach((row) => {
    const rowKey = looseVegetableRowKey(row);
    const totalCell = document.querySelector(`[data-loose-vegetable-harvest-total="${rowKey}"]`);
    if (totalCell) totalCell.innerHTML = channelTableNumberText(looseVegetableRowRemainingInventoryTotal(row, date, cellMap, shipmentRoundColumns, totalOptions));
    const channelTotalCell = document.querySelector(`[data-loose-vegetable-channel-total="${rowKey}"]`);
    const channelTotal = looseVegetableRowTotal(row, date);
    if (channelTotalCell) channelTotalCell.innerHTML = channelTableNumberText(channelTotal);
  });
  ["harvestTotal", ...columns.map((column) => column.key), "channelTotal"].forEach((columnKey) => {
    const subtotalCell = document.querySelector(`[data-loose-vegetable-subtotal="${escapeAttribute(columnKey)}"]`);
    if (!subtotalCell) return;
    subtotalCell.innerHTML = citySubtotalText(looseVegetableSubtotalValue(date, columnKey, cellMap, shipmentRoundColumns, subtotalRows, totalOptions));
  });
  updateLooseVegetableSaveStatus();
}

function generalChannelRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions = harvestChannelInventoryTotalOptions()) {
  if (!row?.rowIndex) return 0;
  return harvestRowTotal(cellMap, row.rowIndex, shipmentRoundColumns, totalOptions);
}

function generalChannelRowUnfinishedStock(row, cellMap) {
  if (!row?.rowIndex) return 0;
  return harvestSavedNumericValue(cellMap, row.rowIndex, 3);
}

function generalChannelRowTotal(
  row,
  date,
  entries = draftGeneralChannelEntries,
  columns = draftGeneralChannelColumns,
  puqianEntries = draftGeneralChannelPuqianEntries,
) {
  return columns.reduce((sum, column) => sum + generalChannelColumnValue(column, row, date, entries, puqianEntries), 0);
}

function generalChannelRowStockMinusTotal(row, date, cellMap) {
  return generalChannelRowUnfinishedStock(row, cellMap) - generalChannelRowTotal(row, date);
}

function generalChannelPuqianRowTotal(row, date, entries = draftGeneralChannelPuqianEntries) {
  const rowKey = generalChannelRowKey(row);
  return generalChannelPuqianColumns.reduce(
    (sum, column) => sum + generalChannelPuqianEntryValue(entries, date, rowKey, column.key),
    0,
  );
}

function generalChannelSubtotalValue(
  date,
  columnKey,
  cellMap,
  shipmentRoundColumns,
  rows = citySubtotalRows(),
  totalOptions = harvestChannelInventoryTotalOptions(),
) {
  if (columnKey === "harvestTotal") {
    return rows.reduce((sum, row) => sum + generalChannelRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions), 0);
  }
  if (columnKey === "stockMinusChannelTotal") {
    return rows.reduce((sum, row) => sum + generalChannelRowStockMinusTotal(row, date, cellMap), 0);
  }
  if (columnKey === "channelTotal") {
    return rows.reduce((sum, row) => sum + generalChannelRowTotal(row, date), 0);
  }
  const column = draftGeneralChannelColumns.find((item) => item.key === columnKey);
  if (!column) return 0;
  return rows.reduce((sum, row) => sum + generalChannelColumnValue(column, row, date), 0);
}

function generalChannelPuqianSubtotalValue(
  date,
  columnKey,
  cellMap,
  shipmentRoundColumns,
  rows = citySubtotalRows(),
  totalOptions = harvestChannelInventoryTotalOptions(),
) {
  if (columnKey === "harvestTotal") {
    return rows.reduce((sum, row) => sum + generalChannelRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions), 0);
  }
  if (columnKey === "channelTotal") {
    return rows.reduce((sum, row) => sum + generalChannelPuqianRowTotal(row, date), 0);
  }
  return rows.reduce((sum, row) => (
    sum + generalChannelPuqianEntryValue(draftGeneralChannelPuqianEntries, date, generalChannelRowKey(row), columnKey)
  ), 0);
}

function updateGeneralChannelTableTotals(context = {}) {
  const date = context.date || generalChannelDate();
  const cellMap = context.cellMap || harvestCellMap();
  const shipmentRoundColumns = context.shipmentRoundColumns || harvestShipmentRoundColumns();
  const rows = context.rows || visibleCityProductRows();
  const subtotalRows = context.subtotalRows || citySubtotalRows(rows);
  const totalOptions = context.totalOptions || harvestChannelInventoryTotalOptions();
  rows.forEach((row) => {
    const rowKey = generalChannelRowKey(row);
    const stockBalanceCell = document.querySelector(`[data-general-channel-stock-balance="${rowKey}"]`);
    if (stockBalanceCell) stockBalanceCell.innerHTML = channelTableNumberText(generalChannelRowStockMinusTotal(row, date, cellMap));
    const totalCell = document.querySelector(`[data-general-channel-harvest-total="${rowKey}"]`);
    if (totalCell) totalCell.innerHTML = channelTableNumberText(generalChannelRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions));
    const channelTotalCell = document.querySelector(`[data-general-channel-total="${rowKey}"]`);
    const channelTotal = generalChannelRowTotal(row, date);
    if (channelTotalCell) channelTotalCell.innerHTML = channelTableNumberText(channelTotal);
    draftGeneralChannelColumns
      .filter(isGeneralChannelComputedColumn)
      .forEach((column) => {
        const computedCell = document.querySelector(`[data-general-channel-computed="${escapeAttribute(rowKey)}:${escapeAttribute(column.key)}"]`);
        if (!computedCell) return;
        const value = generalChannelColumnValue(column, row, date);
        computedCell.innerHTML = channelTableNumberText(value);
      });
  });
  ["stockMinusChannelTotal", "harvestTotal", ...draftGeneralChannelColumns.map((column) => column.key), "channelTotal"].forEach((columnKey) => {
    const subtotalCell = document.querySelector(`[data-general-channel-subtotal="${escapeAttribute(columnKey)}"]`);
    if (!subtotalCell) return;
    subtotalCell.innerHTML = citySubtotalText(generalChannelSubtotalValue(date, columnKey, cellMap, shipmentRoundColumns, subtotalRows, totalOptions));
  });
  updateGeneralChannelSaveStatus();
}

function updateGeneralChannelPuqianTableTotals(context = {}) {
  const date = context.date || generalChannelDate();
  const cellMap = context.cellMap || harvestCellMap();
  const shipmentRoundColumns = context.shipmentRoundColumns || harvestShipmentRoundColumns();
  const rows = context.rows || visibleCityProductRows();
  const subtotalRows = context.subtotalRows || citySubtotalRows(rows);
  const totalOptions = context.totalOptions || harvestChannelInventoryTotalOptions();
  rows.forEach((row) => {
    const rowKey = generalChannelRowKey(row);
    const harvestTotalCell = document.querySelector(`[data-general-channel-puqian-harvest-total="${rowKey}"]`);
    if (harvestTotalCell) harvestTotalCell.innerHTML = channelTableNumberText(generalChannelRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions));
    const channelTotalCell = document.querySelector(`[data-general-channel-puqian-total="${rowKey}"]`);
    const channelTotal = generalChannelPuqianRowTotal(row, date);
    if (channelTotalCell) channelTotalCell.innerHTML = channelTableNumberText(channelTotal);
  });
  ["harvestTotal", ...generalChannelPuqianColumns.map((column) => column.key), "channelTotal"].forEach((columnKey) => {
    const subtotalCell = document.querySelector(`[data-general-channel-puqian-subtotal="${escapeAttribute(columnKey)}"]`);
    if (!subtotalCell) return;
    subtotalCell.innerHTML = citySubtotalText(generalChannelPuqianSubtotalValue(date, columnKey, cellMap, shipmentRoundColumns, subtotalRows, totalOptions));
  });
  updateGeneralChannelSaveStatus();
}

function ensureGeneralChannelColumnModal() {
  let modal = byId("generalChannelColumnModal");
  if (modal) return modal;
  document.body.insertAdjacentHTML("beforeend", `
    <div id="generalChannelColumnModal" class="modal" hidden>
      <div class="modal-backdrop" data-close-general-channel-modal="true"></div>
      <div class="modal-card general-channel-modal-card">
        <div class="modal-header">
          <h2>新增一般通路表頭</h2>
          <button id="closeGeneralChannelColumnModalBtn" type="button">關閉</button>
        </div>
        <form id="generalChannelColumnForm" class="channel-column-form">
          <label>
            預設表頭
            <select id="generalChannelPresetSelect">
              <option value="">選擇預設表頭</option>
              ${generalChannelColumnPresets
                .map((preset) => `<option value="${escapeAttribute(preset.label)}">${escapeHtml(preset.label)}</option>`)
                .join("")}
            </select>
          </label>
          <label>
            自訂表頭
            <input id="generalChannelColumnNameInput" type="text" maxlength="24" autocomplete="off" />
          </label>
          <div class="modal-form-actions">
            <button type="submit">新增</button>
            <button type="button" data-close-general-channel-modal="true">取消</button>
          </div>
        </form>
      </div>
    </div>`);
  modal = byId("generalChannelColumnModal");
  byId("closeGeneralChannelColumnModalBtn")?.addEventListener("click", closeGeneralChannelColumnModal);
  modal.querySelectorAll("[data-close-general-channel-modal='true']").forEach((item) => {
    item.addEventListener("click", closeGeneralChannelColumnModal);
  });
  byId("generalChannelPresetSelect")?.addEventListener("change", (event) => {
    const input = byId("generalChannelColumnNameInput");
    if (input) input.value = event.target.value || "";
  });
  byId("generalChannelColumnForm")?.addEventListener("submit", addGeneralChannelColumnFromForm);
  return modal;
}

function openGeneralChannelColumnModal() {
  const modal = ensureGeneralChannelColumnModal();
  const input = byId("generalChannelColumnNameInput");
  const presetSelect = byId("generalChannelPresetSelect");
  if (input) input.value = "";
  if (presetSelect) presetSelect.value = "";
  modal.hidden = false;
  window.setTimeout(() => (presetSelect || input)?.focus(), 0);
}

function closeGeneralChannelColumnModal() {
  const modal = byId("generalChannelColumnModal");
  if (modal) modal.hidden = true;
}

function addGeneralChannelColumnFromForm(event) {
  event.preventDefault();
  const input = byId("generalChannelColumnNameInput");
  const presetSelect = byId("generalChannelPresetSelect");
  const label = String(presetSelect?.value || input?.value || "").trim();
  if (!label) {
    alert("請輸入表頭");
    input?.focus();
    return;
  }
  if (draftGeneralChannelColumns.some((column) => column.label === label)) {
    alert("這個表頭已經存在");
    input?.focus();
    return;
  }
  draftGeneralChannelColumns = [
    ...draftGeneralChannelColumns,
    ...normalizeGeneralChannelColumns([{ key: generalChannelColumnKey(), label: label.slice(0, 24) }]),
  ];
  setDraftGeneralChannelColumnsForDate(generalChannelDate(), draftGeneralChannelColumns);
  closeGeneralChannelColumnModal();
  updateGeneralChannelSaveStatus();
  renderGeneralChannelPage();
}

function removeGeneralChannelColumn(columnKey) {
  const column = draftGeneralChannelColumns.find((item) => item.key === columnKey);
  if (!column) return;
  if (!confirm(`移除「${column.label}」會同時刪除此欄位的數量。確定要移除嗎？`)) return;
  draftGeneralChannelColumns = draftGeneralChannelColumns.filter((item) => item.key !== columnKey);
  setDraftGeneralChannelColumnsForDate(generalChannelDate(), draftGeneralChannelColumns);
  replaceObjectContents(draftGeneralChannelEntries, pruneGeneralChannelEntriesForColumns(draftGeneralChannelEntries, draftGeneralChannelColumnsByDate));
  updateGeneralChannelSaveStatus();
  renderGeneralChannelPage();
}

function renderGeneralChannelPage() {
  const template = harvestTemplate();
  if (!template) {
    byId("viewTitle").innerHTML = "<h2>一般通路</h2><p>尚未載入採收規劃表模板。</p>";
    byId("tableHost").innerHTML = "";
    return;
  }
  const date = generalChannelDate();
  const cellMap = harvestCellMap();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const totalOptions = harvestChannelInventoryTotalOptions();
  const columns = draftGeneralChannelColumns;
  const tableColumns = columns.length
    ? columns
    : [{ key: "__generalChannelPlaceholder", label: "", placeholder: true }];
  const generalColumnWidths = [
    generalChannelTableColumnWidths.stockBalance,
    generalChannelTableColumnWidths.harvestTotal,
    generalChannelTableColumnWidths.product,
    ...tableColumns.map(() => generalChannelTableColumnWidths.input),
    generalChannelTableColumnWidths.total,
  ];
  const puqianColumnWidths = [
    generalChannelTableColumnWidths.harvestTotal,
    generalChannelTableColumnWidths.product,
    ...generalChannelPuqianColumns.map(() => generalChannelTableColumnWidths.input),
    generalChannelTableColumnWidths.total,
  ];
  byId("viewTitle").innerHTML = `<div class="view-title-row city-title-row">
    <div class="channel-title-main">
      <h2>一般通路</h2>
      <button id="addGeneralChannelColumnBtn" class="harvest-icon-button" type="button" title="新增表頭">+</button>
    </div>
    <div class="sales-save-actions">
      <span id="generalChannelSaveStatus" class="date-pill">一般通路已保存</span>
      <button id="saveGeneralChannelBtn" type="button">保存</button>
    </div>
  </div>`;

  const headers = `
    <thead>
      <tr>
        <th class="num city-stock-balance-col">庫存-總數</th>
        <th class="num city-harvest-total-col">${harvestInventoryTotalHeaderHtml}</th>
        <th class="city-product-col">品項</th>
        ${tableColumns
          .map((column) => column.placeholder
            ? '<th class="num city-input-col general-channel-input-col general-channel-placeholder-col"></th>'
            : `<th class="num city-input-col general-channel-input-col">
            <span class="channel-column-header">
              <span>${escapeHtml(column.label)}</span>
              <button class="harvest-remove-column" type="button" title="移除此欄" data-remove-general-channel-column="${escapeAttribute(column.key)}">×</button>
            </span>
          </th>`)
          .join("")}
        <th class="num city-channel-total-col">總數</th>
      </tr>
    </thead>`;
  const puqianHeaders = `
    <thead>
      <tr>
        <th class="num city-harvest-total-col">${harvestInventoryTotalHeaderHtml}</th>
        <th class="city-product-col">品項</th>
        ${generalChannelPuqianColumns
          .map((column) => `<th class="num city-input-col general-channel-input-col">${escapeHtml(column.label)}</th>`)
          .join("")}
        <th class="num city-channel-total-col">總數</th>
      </tr>
    </thead>`;
  const visibleProductRows = visibleCityProductRows();
  const subtotalRows = citySubtotalRows(visibleProductRows);
  const visibleRows = visibleCityTableRows(visibleProductRows);
  const hasVisibleProductRows = visibleRows.some((row) => row.type !== "subtotal");
  const rows = visibleRows
    .map((row) => {
      if (row.type === "subtotal") {
        return `<tr class="city-subtotal-row">
          <td class="num city-stock-balance" data-general-channel-subtotal="stockMinusChannelTotal">${citySubtotalText(generalChannelSubtotalValue(date, "stockMinusChannelTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
          <td class="num" data-general-channel-subtotal="harvestTotal">${citySubtotalText(generalChannelSubtotalValue(date, "harvestTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
          <td class="city-product-name">${escapeHtml(row.label)}</td>
          ${tableColumns
            .map((column) => column.placeholder
              ? '<td class="num general-channel-placeholder-cell"></td>'
              : `<td class="num" data-general-channel-subtotal="${escapeAttribute(column.key)}">${citySubtotalText(generalChannelSubtotalValue(date, column.key, cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>`)
            .join("")}
          <td class="num city-channel-total" data-general-channel-subtotal="channelTotal">${citySubtotalText(generalChannelSubtotalValue(date, "channelTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
        </tr>`;
      }
      const rowKey = generalChannelRowKey(row);
      const harvestTotal = generalChannelRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions);
      const channelTotal = generalChannelRowTotal(row, date);
      const stockMinusTotal = generalChannelRowStockMinusTotal(row, date, cellMap);
      return `<tr class="city-product-row" data-general-channel-row-key="${escapeAttribute(rowKey)}" data-city-section="${escapeAttribute(row.section || "")}">
        <td class="num city-stock-balance" data-general-channel-stock-balance="${escapeAttribute(rowKey)}">${channelTableNumberText(stockMinusTotal)}</td>
        <td class="num city-harvest-total" data-general-channel-harvest-total="${escapeAttribute(rowKey)}">${channelTableNumberText(harvestTotal)}</td>
        <td class="city-product-name">${escapeHtml(row.label)}</td>
        ${tableColumns
          .map((column) => {
            if (column.placeholder) return '<td class="num general-channel-placeholder-cell"></td>';
            const value = generalChannelColumnValue(column, row, date);
            if (isGeneralChannelComputedColumn(column)) {
              return `<td class="num general-channel-computed-cell" data-general-channel-computed="${escapeAttribute(`${rowKey}:${column.key}`)}">${channelTableNumberText(value)}</td>`;
            }
            return `<td class="num">
              <input class="general-channel-table-input" type="text" inputmode="decimal" value="${escapeAttribute(value || "")}" data-general-channel-date="${escapeAttribute(date)}" data-general-channel-row-key="${escapeAttribute(rowKey)}" data-general-channel-column="${escapeAttribute(column.key)}" />
            </td>`;
          })
          .join("")}
        <td class="num city-channel-total" data-general-channel-total="${escapeAttribute(rowKey)}">${channelTableNumberText(channelTotal)}</td>
      </tr>`;
    })
    .join("");
  const puqianRows = visibleRows
    .map((row) => {
      if (row.type === "subtotal") {
        return `<tr class="city-subtotal-row">
          <td class="num" data-general-channel-puqian-subtotal="harvestTotal">${citySubtotalText(generalChannelPuqianSubtotalValue(date, "harvestTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
          <td class="city-product-name">${escapeHtml(row.label)}</td>
          ${generalChannelPuqianColumns
            .map((column) => `<td class="num" data-general-channel-puqian-subtotal="${escapeAttribute(column.key)}">${citySubtotalText(generalChannelPuqianSubtotalValue(date, column.key, cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>`)
            .join("")}
          <td class="num city-channel-total" data-general-channel-puqian-subtotal="channelTotal">${citySubtotalText(generalChannelPuqianSubtotalValue(date, "channelTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
        </tr>`;
      }
      const rowKey = generalChannelRowKey(row);
      const harvestTotal = generalChannelRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions);
      const puqianTotal = generalChannelPuqianRowTotal(row, date);
      return `<tr class="city-product-row" data-general-channel-puqian-row-key="${escapeAttribute(rowKey)}" data-city-section="${escapeAttribute(row.section || "")}">
        <td class="num city-harvest-total" data-general-channel-puqian-harvest-total="${escapeAttribute(rowKey)}">${channelTableNumberText(harvestTotal)}</td>
        <td class="city-product-name">${escapeHtml(row.label)}</td>
        ${generalChannelPuqianColumns
          .map((column) => {
            const value = generalChannelPuqianEntryValue(draftGeneralChannelPuqianEntries, date, rowKey, column.key);
            return `<td class="num">
              <input class="general-channel-puqian-input" type="text" inputmode="decimal" value="${escapeAttribute(value || "")}" data-general-channel-puqian-date="${escapeAttribute(date)}" data-general-channel-puqian-row-key="${escapeAttribute(rowKey)}" data-general-channel-puqian-column="${escapeAttribute(column.key)}" />
            </td>`;
          })
          .join("")}
        <td class="num city-channel-total" data-general-channel-puqian-total="${escapeAttribute(rowKey)}">${channelTableNumberText(puqianTotal)}</td>
      </tr>`;
    })
    .join("");
  byId("tableHost").innerHTML = hasVisibleProductRows
    ? `<div class="general-channel-tables">
        <section class="general-channel-table-panel">
          <div class="general-channel-table-title">一般通路</div>
          <table class="city-planning-sheet general-channel-planning-sheet" ${channelTableWidthStyle(generalColumnWidths)}>${channelTableColGroup(generalColumnWidths)}${headers}<tbody>${rows}</tbody></table>
        </section>
        <section class="general-channel-table-panel">
          <div class="general-channel-table-title">埔墘</div>
          <table class="city-planning-sheet general-channel-puqian-sheet" ${channelTableWidthStyle(puqianColumnWidths)}>${channelTableColGroup(puqianColumnWidths)}${puqianHeaders}<tbody>${puqianRows}</tbody></table>
        </section>
      </div>`
    : `<div class="empty">沒有符合當天呼出碼篩選的一般通路品項</div>`;
  byId("addGeneralChannelColumnBtn")?.addEventListener("click", openGeneralChannelColumnModal);
  byId("saveGeneralChannelBtn")?.addEventListener("click", saveDraftGeneralChannelEntries);
  document.querySelectorAll("[data-remove-general-channel-column]").forEach((button) => {
    button.addEventListener("click", () => removeGeneralChannelColumn(button.dataset.removeGeneralChannelColumn));
  });
  const totalsContext = { date, cellMap, shipmentRoundColumns, rows: visibleProductRows, subtotalRows, totalOptions };
  document.querySelectorAll(".general-channel-table-input").forEach((input) => {
    input.addEventListener("focus", (event) => {
      event.target.closest("tr")?.classList.add("active-input-row");
    });
    input.addEventListener("blur", (event) => {
      event.target.closest("tr")?.classList.remove("active-input-row");
    });
    input.addEventListener("input", (event) => {
      event.target.value = normalizeCityInputValue(event.target.value);
      setDraftGeneralChannelEntry(
        event.target.dataset.generalChannelDate,
        event.target.dataset.generalChannelRowKey,
        event.target.dataset.generalChannelColumn,
        event.target.value,
      );
      updateGeneralChannelTableTotals(totalsContext);
    });
  });
  document.querySelectorAll(".general-channel-puqian-input").forEach((input) => {
    input.addEventListener("focus", (event) => {
      event.target.closest("tr")?.classList.add("active-input-row");
    });
    input.addEventListener("blur", (event) => {
      event.target.closest("tr")?.classList.remove("active-input-row");
    });
    input.addEventListener("input", (event) => {
      event.target.value = normalizeCityInputValue(event.target.value);
      setDraftGeneralChannelPuqianEntry(
        event.target.dataset.generalChannelPuqianDate,
        event.target.dataset.generalChannelPuqianRowKey,
        event.target.dataset.generalChannelPuqianColumn,
        event.target.value,
      );
      updateGeneralChannelPuqianTableTotals(totalsContext);
      updateGeneralChannelTableTotals(totalsContext);
    });
  });
  updateGeneralChannelSaveStatus();
}

function ensureLooseVegetableColumnModal() {
  let modal = byId("looseVegetableColumnModal");
  if (modal) return modal;
  document.body.insertAdjacentHTML("beforeend", `
    <div id="looseVegetableColumnModal" class="modal" hidden>
      <div class="modal-backdrop" data-close-loose-vegetable-modal="true"></div>
      <div class="modal-card loose-vegetable-modal-card">
        <div class="modal-header">
          <h2>新增裸菜表頭</h2>
          <button id="closeLooseVegetableColumnModalBtn" type="button">關閉</button>
        </div>
        <form id="looseVegetableColumnForm" class="loose-vegetable-column-form">
          <label>
            表頭
            <input id="looseVegetableColumnNameInput" type="text" maxlength="24" autocomplete="off" />
          </label>
          <div class="modal-form-actions">
            <button type="submit">新增</button>
            <button type="button" data-close-loose-vegetable-modal="true">取消</button>
          </div>
        </form>
      </div>
    </div>`);
  modal = byId("looseVegetableColumnModal");
  byId("closeLooseVegetableColumnModalBtn")?.addEventListener("click", closeLooseVegetableColumnModal);
  modal.querySelectorAll("[data-close-loose-vegetable-modal='true']").forEach((item) => {
    item.addEventListener("click", closeLooseVegetableColumnModal);
  });
  byId("looseVegetableColumnForm")?.addEventListener("submit", addLooseVegetableColumnFromForm);
  return modal;
}

function openLooseVegetableColumnModal() {
  const modal = ensureLooseVegetableColumnModal();
  const input = byId("looseVegetableColumnNameInput");
  if (input) input.value = "";
  modal.hidden = false;
  window.setTimeout(() => input?.focus(), 0);
}

function closeLooseVegetableColumnModal() {
  const modal = byId("looseVegetableColumnModal");
  if (modal) modal.hidden = true;
}

function addLooseVegetableColumnFromForm(event) {
  event.preventDefault();
  const input = byId("looseVegetableColumnNameInput");
  const label = String(input?.value || "").trim();
  const date = looseVegetableDate();
  const activeColumns = cloneLooseVegetableColumns(looseVegetableActiveDraftColumns(date));
  if (!label) {
    alert("請輸入表頭");
    input?.focus();
    return;
  }
  if (activeColumns.some((column) => column.label === label)) {
    alert("這個表頭已經存在");
    input?.focus();
    return;
  }
  draftLooseVegetableColumns = [
    ...activeColumns,
    { key: looseVegetableColumnKey(), label: label.slice(0, 24) },
  ];
  setDraftLooseVegetableColumnsForDate(date, draftLooseVegetableColumns);
  closeLooseVegetableColumnModal();
  updateLooseVegetableSaveStatus();
  renderLooseVegetablePage();
}

function removeLooseVegetableColumn(columnKey) {
  const date = looseVegetableDate();
  const activeColumns = cloneLooseVegetableColumns(looseVegetableActiveDraftColumns(date));
  const column = activeColumns.find((item) => item.key === columnKey);
  if (!column) return;
  if (!confirm(`移除「${column.label}」會同時刪除此欄位的數量。確定要移除嗎？`)) return;
  draftLooseVegetableColumns = activeColumns.filter((item) => item.key !== columnKey);
  setDraftLooseVegetableColumnsForDate(date, draftLooseVegetableColumns);
  const rows = draftLooseVegetableEntries[date];
  if (rows) {
    Object.keys(rows).forEach((rowKey) => {
      delete rows[rowKey]?.[columnKey];
      if (!Object.keys(rows[rowKey] || {}).length) delete rows[rowKey];
    });
    if (!Object.keys(rows).length) delete draftLooseVegetableEntries[date];
  }
  replaceObjectContents(draftLooseVegetableEntries, pruneLooseVegetableEntriesForColumns(
    draftLooseVegetableEntries,
    draftLooseVegetableColumnsByDate,
  ));
  updateLooseVegetableSaveStatus();
  renderLooseVegetablePage();
}

function renderLooseVegetablePage() {
  const template = harvestTemplate();
  if (!template) {
    byId("viewTitle").innerHTML = "<h2>裸菜</h2><p>尚未載入採收規劃表模板。</p>";
    byId("tableHost").innerHTML = "";
    return;
  }
  const date = looseVegetableDate();
  const cellMap = harvestCellMap();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock();
  draftLooseVegetableColumns = cloneLooseVegetableColumns(looseVegetableActiveDraftColumns(date));
  const columns = draftLooseVegetableColumns;
  byId("viewTitle").innerHTML = `<div class="view-title-row city-title-row">
    <div class="loose-vegetable-title-main">
      <h2>裸菜</h2>
      <button id="addLooseVegetableColumnBtn" class="harvest-icon-button" type="button" title="新增表頭">+</button>
    </div>
    <div class="sales-save-actions">
      <span id="looseVegetableSaveStatus" class="date-pill">裸菜已保存</span>
      <button id="saveLooseVegetableBtn" type="button">保存</button>
    </div>
  </div>`;

  const headers = `
    <thead>
      <tr>
        <th class="num city-harvest-total-col">${looseVegetableRemainingInventoryHeaderHtml}</th>
        <th class="city-product-col">品項</th>
        ${columns
          .map((column) => `<th class="num city-input-col loose-vegetable-input-col">
            <span class="loose-vegetable-column-header">
              <span>${escapeHtml(column.label)}</span>
              <button class="harvest-remove-column" type="button" title="移除此欄" data-remove-loose-vegetable-column="${escapeAttribute(column.key)}">×</button>
            </span>
          </th>`)
          .join("")}
        <th class="num city-channel-total-col">總數</th>
      </tr>
    </thead>`;
  const visibleProductRows = visibleCityProductRows();
  const subtotalRows = citySubtotalRows(visibleProductRows);
  const visibleRows = visibleCityTableRows(visibleProductRows);
  const hasVisibleProductRows = visibleRows.some((row) => row.type !== "subtotal");
  const rows = visibleRows
    .map((row) => {
      if (row.type === "subtotal") {
        return `<tr class="city-subtotal-row">
          <td class="num" data-loose-vegetable-subtotal="harvestTotal">${citySubtotalText(looseVegetableSubtotalValue(date, "harvestTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
          <td class="city-product-name">${escapeHtml(row.label)}</td>
          ${columns
            .map((column) => `<td class="num" data-loose-vegetable-subtotal="${escapeAttribute(column.key)}">${citySubtotalText(looseVegetableSubtotalValue(date, column.key, cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>`)
            .join("")}
          <td class="num city-channel-total" data-loose-vegetable-subtotal="channelTotal">${citySubtotalText(looseVegetableSubtotalValue(date, "channelTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
        </tr>`;
      }
      const rowKey = looseVegetableRowKey(row);
      const harvestTotal = looseVegetableRowRemainingInventoryTotal(row, date, cellMap, shipmentRoundColumns, totalOptions);
      const channelTotal = looseVegetableRowTotal(row, date);
      return `<tr class="city-product-row" data-loose-vegetable-row-key="${escapeAttribute(rowKey)}" data-city-section="${escapeAttribute(row.section || "")}">
        <td class="num city-harvest-total" data-loose-vegetable-harvest-total="${escapeAttribute(rowKey)}">${channelTableNumberText(harvestTotal)}</td>
        <td class="city-product-name">${escapeHtml(row.label)}</td>
        ${columns
          .map((column) => {
            const value = looseVegetableEntryValue(draftLooseVegetableEntries, date, rowKey, column.key);
            return `<td class="num">
              <input class="loose-vegetable-table-input" type="text" inputmode="decimal" value="${escapeAttribute(value || "")}" data-loose-vegetable-date="${escapeAttribute(date)}" data-loose-vegetable-row-key="${escapeAttribute(rowKey)}" data-loose-vegetable-column="${escapeAttribute(column.key)}" />
            </td>`;
          })
          .join("")}
        <td class="num city-channel-total" data-loose-vegetable-channel-total="${escapeAttribute(rowKey)}">${channelTableNumberText(channelTotal)}</td>
      </tr>`;
    })
    .join("");
  byId("tableHost").innerHTML = hasVisibleProductRows
    ? `<table class="city-planning-sheet loose-vegetable-planning-sheet">${headers}<tbody>${rows}</tbody></table>`
    : `<div class="empty">沒有符合當天呼出碼篩選的裸菜品項</div>`;
  byId("addLooseVegetableColumnBtn")?.addEventListener("click", openLooseVegetableColumnModal);
  byId("saveLooseVegetableBtn")?.addEventListener("click", saveDraftLooseVegetableEntries);
  document.querySelectorAll("[data-remove-loose-vegetable-column]").forEach((button) => {
    button.addEventListener("click", () => removeLooseVegetableColumn(button.dataset.removeLooseVegetableColumn));
  });
  const totalsContext = { date, cellMap, shipmentRoundColumns, rows: visibleProductRows, subtotalRows, totalOptions, columns };
  document.querySelectorAll(".loose-vegetable-table-input").forEach((input) => {
    input.addEventListener("focus", (event) => {
      event.target.closest("tr")?.classList.add("active-input-row");
    });
    input.addEventListener("blur", (event) => {
      event.target.closest("tr")?.classList.remove("active-input-row");
    });
    input.addEventListener("input", (event) => {
      event.target.value = normalizeCityInputValue(event.target.value);
      setDraftLooseVegetableEntry(
        event.target.dataset.looseVegetableDate,
        event.target.dataset.looseVegetableRowKey,
        event.target.dataset.looseVegetableColumn,
        event.target.value,
      );
      updateLooseVegetableTableTotals(totalsContext);
    });
  });
  updateLooseVegetableSaveStatus();
}

function renderYfyPage() {
  const template = harvestTemplate();
  if (!template) {
    byId("viewTitle").innerHTML = "<h2>永豐餘</h2><p>尚未載入採收規劃表模板。</p>";
    byId("tableHost").innerHTML = "";
    return;
  }
  const date = yfyDate();
  const cellMap = harvestCellMap();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock();
  byId("viewTitle").innerHTML = `<div class="view-title-row city-title-row">
    <div>
      <h2>永豐餘</h2>
    </div>
    <div class="sales-save-actions">
      <span id="yfySaveStatus" class="date-pill">永豐餘已保存</span>
      <button id="saveYfyBtn" type="button">保存</button>
    </div>
  </div>`;

  const headers = `
    <thead>
      <tr>
        <th class="num city-harvest-total-col">${harvestInventoryTotalHeaderHtml}</th>
        <th class="city-product-col">品項</th>
        ${yfyInputColumns.map((column) => `<th class="num city-input-col">${yfyHeaderLabel(column)}</th>`).join("")}
        <th class="num city-channel-total-col">總數</th>
        <th class="num city-channel-total-col">換算後總數</th>
      </tr>
    </thead>`;
  const visibleProductRows = visibleCityProductRows();
  const subtotalRows = citySubtotalRows(visibleProductRows);
  const visibleRows = visibleCityTableRows(visibleProductRows);
  const hasVisibleProductRows = visibleRows.some((row) => row.type !== "subtotal");
  const rows = visibleRows
    .map((row) => {
      if (row.type === "subtotal") {
        return `<tr class="city-subtotal-row">
          <td class="num" data-yfy-subtotal="harvestTotal">${citySubtotalText(yfySubtotalValue(date, "harvestTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
          <td class="city-product-name">${escapeHtml(row.label)}</td>
          ${yfyInputColumns
            .map((column) => `<td class="num" data-yfy-subtotal="${escapeAttribute(column.key)}">${citySubtotalText(yfySubtotalValue(date, column.key, cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>`)
            .join("")}
          <td class="num city-channel-total" data-yfy-subtotal="channelTotal">${citySubtotalText(yfySubtotalValue(date, "channelTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
          <td class="num city-channel-total" data-yfy-subtotal="convertedTotal">${citySubtotalText(yfySubtotalValue(date, "convertedTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
        </tr>`;
      }
      const rowKey = yfyRowKey(row);
      const harvestTotal = yfyRowHarvestTotal(row, cellMap, shipmentRoundColumns, totalOptions);
      const channelTotal = yfyRowChannelTotal(row, date);
      const convertedTotal = yfyRowConvertedTotal(row, date);
      return `<tr class="city-product-row" data-yfy-row-key="${escapeAttribute(rowKey)}" data-city-section="${escapeAttribute(row.section || "")}">
        <td class="num city-harvest-total" data-yfy-harvest-total="${escapeAttribute(rowKey)}">${channelTableNumberText(harvestTotal)}</td>
        <td class="city-product-name">${escapeHtml(row.label)}</td>
        ${yfyInputColumns
          .map((column) => {
            const value = yfyEntryValue(draftYfyEntries, date, rowKey, column.key);
            return `<td class="num">
              <input class="yfy-table-input" type="text" inputmode="decimal" value="${escapeAttribute(value || "")}" data-yfy-date="${escapeAttribute(date)}" data-yfy-row-key="${escapeAttribute(rowKey)}" data-yfy-column="${escapeAttribute(column.key)}" />
            </td>`;
          })
          .join("")}
        <td class="num city-channel-total" data-yfy-channel-total="${escapeAttribute(rowKey)}">${channelTableNumberText(channelTotal)}</td>
        <td class="num city-channel-total" data-yfy-converted-total="${escapeAttribute(rowKey)}">${channelTableNumberText(convertedTotal)}</td>
      </tr>`;
    })
    .join("");
  byId("tableHost").innerHTML = hasVisibleProductRows
    ? `<table class="city-planning-sheet yfy-planning-sheet">${headers}<tbody>${rows}</tbody></table>`
    : `<div class="empty">沒有符合當天呼出碼篩選的永豐餘品項</div>`;
  byId("saveYfyBtn")?.addEventListener("click", saveDraftYfyEntries);
  const totalsContext = { date, cellMap, shipmentRoundColumns, rows: visibleProductRows, subtotalRows, totalOptions };
  document.querySelectorAll(".yfy-table-input").forEach((input) => {
    input.addEventListener("focus", (event) => {
      event.target.closest("tr")?.classList.add("active-input-row");
    });
    input.addEventListener("blur", (event) => {
      event.target.closest("tr")?.classList.remove("active-input-row");
    });
    input.addEventListener("input", (event) => {
      event.target.value = normalizeCityInputValue(event.target.value);
      setDraftYfyEntry(event.target.dataset.yfyDate, event.target.dataset.yfyRowKey, event.target.dataset.yfyColumn, event.target.value);
      updateYfyTableTotals(totalsContext);
    });
  });
  updateYfySaveStatus();
}

function renderCityPage() {
  const template = harvestTemplate();
  if (!template) {
    byId("viewTitle").innerHTML = "<h2>City</h2><p>尚未載入採收規劃表模板。</p>";
    byId("tableHost").innerHTML = "";
    return;
  }
  const date = cityDate();
  const cellMap = harvestCellMap();
  const shipmentRoundColumns = harvestShipmentRoundColumns();
  const totalOptions = harvestChannelInventoryTotalOptionsWithoutUnfinishedStock();
  byId("viewTitle").innerHTML = `<div class="view-title-row city-title-row">
    <div>
      <h2>City</h2>
      <p class="city-warning">City 的高麗菜不能小於700g</p>
    </div>
    <div class="sales-save-actions">
      <span id="citySaveStatus" class="date-pill">City 已保存</span>
      <button id="saveCityBtn" type="button">保存</button>
    </div>
  </div>`;

  const headers = `
    <thead>
      <tr>
        <th class="num city-harvest-total-col">${harvestInventoryTotalHeaderHtml}</th>
        <th class="city-product-col">品項</th>
        ${cityInputColumns.map((column) => `<th class="num city-input-col">${escapeHtml(column.label).replace(" ", "<br />")}</th>`).join("")}
        <th class="num city-channel-total-col">總數</th>
      </tr>
    </thead>`;
  const visibleProductRows = visibleCityProductRows();
  const subtotalRows = citySubtotalRows(visibleProductRows);
  const visibleRows = visibleCityTableRows(visibleProductRows);
  const hasVisibleProductRows = visibleRows.some((row) => row.type !== "subtotal");
  const rows = visibleRows
    .map((row) => {
      if (row.type === "subtotal") {
        return `<tr class="city-subtotal-row">
          <td class="num" data-city-subtotal="harvestTotal">${citySubtotalText(citySubtotalValue(date, "harvestTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
          <td class="city-product-name">${escapeHtml(row.label)}</td>
          <td class="num" data-city-subtotal="stock">${citySubtotalText(citySubtotalValue(date, "stock", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
          ${cityChannelColumns
            .map((column) => `<td class="num" data-city-subtotal="${escapeAttribute(column.key)}">${citySubtotalText(citySubtotalValue(date, column.key, cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>`)
            .join("")}
          <td class="num city-channel-total" data-city-subtotal="channelTotal">${citySubtotalText(citySubtotalValue(date, "channelTotal", cellMap, shipmentRoundColumns, subtotalRows, totalOptions))}</td>
        </tr>`;
      }
      const rowKey = cityRowKey(row);
      const harvestTotal = cityRowHarvestTotal(row, date, cellMap, shipmentRoundColumns, totalOptions);
      const channelTotal = cityRowChannelTotal(row, date);
      return `<tr class="city-product-row" data-city-row-key="${escapeAttribute(rowKey)}" data-city-section="${escapeAttribute(row.section || "")}">
        <td class="num city-harvest-total" data-city-harvest-total="${escapeAttribute(rowKey)}">${channelTableNumberText(harvestTotal)}</td>
        <td class="city-product-name">${escapeHtml(row.label)}</td>
        ${cityInputColumns
          .map((column) => {
            const value = cityEntryValue(draftCityEntries, date, rowKey, column.key);
            return `<td class="num">
              <input class="city-table-input" type="text" inputmode="decimal" value="${escapeAttribute(value || "")}" data-city-date="${escapeAttribute(date)}" data-city-row-key="${escapeAttribute(rowKey)}" data-city-column="${escapeAttribute(column.key)}" />
            </td>`;
          })
          .join("")}
        <td class="num city-channel-total" data-city-channel-total="${escapeAttribute(rowKey)}">${channelTableNumberText(channelTotal)}</td>
      </tr>`;
    })
    .join("");
  byId("tableHost").innerHTML = hasVisibleProductRows
    ? `<table class="city-planning-sheet">${headers}<tbody>${rows}</tbody></table>`
    : `<div class="empty">沒有符合當天呼出碼篩選的 City 品項</div>`;
  byId("saveCityBtn")?.addEventListener("click", saveDraftCityEntries);
  const totalsContext = { date, cellMap, shipmentRoundColumns, rows: visibleProductRows, subtotalRows, totalOptions };
  document.querySelectorAll(".city-table-input").forEach((input) => {
    input.addEventListener("focus", (event) => {
      event.target.closest("tr")?.classList.add("active-input-row");
    });
    input.addEventListener("blur", (event) => {
      event.target.closest("tr")?.classList.remove("active-input-row");
    });
    input.addEventListener("input", (event) => {
      event.target.value = normalizeCityInputValue(event.target.value);
      setDraftCityEntry(event.target.dataset.cityDate, event.target.dataset.cityRowKey, event.target.dataset.cityColumn, event.target.value);
      updateCityTableTotals(totalsContext);
    });
  });
  updateCitySaveStatus();
}

function renderChannelPage() {
  if (state.page === yfyPageKey) {
    renderYfyPage();
    return;
  }
  if (state.page === "city") {
    renderCityPage();
    return;
  }
  if (state.page === "generalChannel") {
    renderGeneralChannelPage();
    return;
  }
  if (state.page === "looseVegetable") {
    renderLooseVegetablePage();
    return;
  }
  byId("viewTitle").innerHTML = `<h2>${channelPages[state.page]}</h2>`;
  byId("tableHost").innerHTML = "";
}

function normalizeFieldNetHouseData(payload) {
  const zones = Array.isArray(payload?.zones) ? payload.zones : [];
  return {
    zones: zones.map((zone, zoneIndex) => ({
      name: String(zone?.name || ""),
      sortOrder: Number.isFinite(Number(zone?.sortOrder)) ? Number(zone.sortOrder) : zoneIndex,
      netHouses: (Array.isArray(zone?.netHouses) ? zone.netHouses : [])
        .map((house) => ({
          netHouseCode: String(house?.netHouseCode || ""),
          gridCount: house?.gridCount ?? "",
          status: String(house?.status || ""),
          crop1: String(house?.crop1 || ""),
          crop2: String(house?.crop2 || ""),
          plantedDate: String(house?.plantedDate || ""),
          harvestDate: String(house?.harvestDate || ""),
          note: String(house?.note || ""),
        }))
        .filter((house) => house.netHouseCode),
    })).filter((zone) => zone.name),
  };
}

function normalizeFieldWorkRecords(entries) {
  const records = {};
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    const workDate = String(entry?.workDate || "");
    const zoneName = String(entry?.zoneName || "");
    const netHouseCode = String(entry?.netHouseCode || "");
    const taskKey = String(entry?.taskKey || "");
    if (!workDate || !zoneName || !netHouseCode || !taskKey) return;
    const key = fieldWorkRecordKey(workDate, zoneName, netHouseCode);
    if (!records[key]) records[key] = {
      taskKeys: [],
      fertilizerBagCount: "",
      directSowCropKey: "",
      directSowCropName: "",
      seedlingTransplantCropKey: "",
      seedlingTransplantCropName: "",
      seedlingTransplantCropItems: [],
      accountName: "",
      accountNames: [],
    };
    const accountName = String(entry?.accountName || "").trim();
    if (accountName) {
      if (!records[key].accountName) records[key].accountName = accountName;
      if (!records[key].accountNames.includes(accountName)) records[key].accountNames.push(accountName);
    }
    if (!records[key].taskKeys.includes(taskKey)) records[key].taskKeys.push(taskKey);
    if (taskKey === "soilPreparationTractorClean" && entry?.fertilizerBagCount !== null && entry?.fertilizerBagCount !== undefined) {
      records[key].fertilizerBagCount = String(entry.fertilizerBagCount);
    }
    if (taskKey === "directSow") {
      records[key].directSowCropKey = String(entry?.cropKey || "");
      records[key].directSowCropName = String(entry?.cropName || "");
    }
    if (taskKey === "seedlingTransplant") {
      const cropItems = fieldWorkCropItemsFromRecordEntry(entry);
      records[key].seedlingTransplantCropItems = cropItems;
      records[key].seedlingTransplantCropKey = cropItems[0]?.cropKey || "";
      records[key].seedlingTransplantCropName = cropItems[0]?.cropName || "";
    }
  });
  return records;
}

function normalizeFieldBtRecords(entries) {
  const records = {};
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    const workDate = String(entry?.workDate || "");
    const areaKey = String(entry?.areaKey || "");
    if (!workDate || !areaKey) return;
    if (!records[workDate]) records[workDate] = {
      areaKeys: [],
      oneTwoPackageCount: "",
      sharedPackageCount: "",
    };
    const packageCount = entry?.packageCount === null || entry?.packageCount === undefined ? "" : String(entry.packageCount);
    const normalizedAreaKeys = areaKey === "threeFive" ? ["three", "five"] : [areaKey];
    normalizedAreaKeys.forEach((normalizedAreaKey) => {
      if (!records[workDate].areaKeys.includes(normalizedAreaKey)) records[workDate].areaKeys.push(normalizedAreaKey);
    });
    if (areaKey === "oneTwo") records[workDate].oneTwoPackageCount = packageCount;
    if ((areaKey === "three" || areaKey === "five" || areaKey === "threeFive" || areaKey === "four") && !records[workDate].sharedPackageCount) {
      records[workDate].sharedPackageCount = packageCount;
    }
  });
  return records;
}

function normalizeNetHouseStatusRecords(entries) {
  const records = {};
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    const record = normalizeNetHouseStatusRecord(entry);
    if (!record) return;
    records[netHouseStatusRecordKey(record.recordDate, record.zoneName, record.netHouseCode)] = record;
  });
  return records;
}

function normalizeDailyVegetableManualEntries(entries) {
  const records = {};
  (Array.isArray(entries) ? entries : []).forEach((entry) => {
    const id = Number(entry?.id);
    const harvestDate = String(entry?.harvestDate || "");
    const cropName = String(entry?.cropName || "").trim();
    const netHouseCode = String(entry?.netHouseCode || "").trim();
    if (!Number.isFinite(id) || !id || !/^\d{4}-\d{2}-\d{2}$/.test(harvestDate) || !cropName || !netHouseCode) return;
    const quantity = entry?.quantity === null || entry?.quantity === undefined ? "" : String(entry.quantity);
    records[String(id)] = {
      id,
      harvestDate,
      cropName,
      netHouseCode,
      quantity,
      updatedAt: String(entry?.updatedAt || ""),
    };
  });
  return records;
}

function normalizeNetHouseStatusRecord(entry) {
  const recordDate = String(entry?.recordDate || "");
  const zoneName = String(entry?.zoneName || "");
  const netHouseCode = String(entry?.netHouseCode || "");
  const status = String(entry?.status || "");
  if (!recordDate || !zoneName || !netHouseCode || !netHouseStatusOptions.includes(status)) return null;
  const cropItems = normalizeNetHouseStatusCropItems(entry);
  return {
    recordDate,
    zoneName,
    netHouseCode,
    status,
    cropName: cropItems[0]?.cropName || String(entry?.cropName || ""),
    plantedDate: String(entry?.plantedDate || ""),
    harvestDate: cropItems[0]?.harvestDate || String(entry?.harvestDate || ""),
    estimatedQuantity: cropItems[0]?.estimatedQuantity ?? (entry?.estimatedQuantity === null || entry?.estimatedQuantity === undefined
      ? ""
      : String(entry.estimatedQuantity)),
    harvestQuantity: cropItems[0]?.harvestQuantity ?? (entry?.harvestQuantity === null || entry?.harvestQuantity === undefined
      ? ""
      : String(entry.harvestQuantity)),
    destroyed: Boolean(cropItems[0]?.destroyed || entry?.destroyed),
    lunchMarked: Boolean(entry?.lunchMarked),
    cropItems,
  };
}

function normalizeNetHouseStatusCropItems(entry) {
  const rawItems = Array.isArray(entry?.cropItems) ? entry.cropItems : [];
  const items = rawItems
    .map((item) => {
      const destroyed = Boolean(item?.destroyed);
      return {
        cropName: String(item?.cropName || "").trim(),
        harvestDate: String(item?.harvestDate || ""),
        estimatedQuantity: destroyed
          ? "0"
          : item?.estimatedQuantity === null || item?.estimatedQuantity === undefined
            ? ""
            : String(item.estimatedQuantity),
        harvestQuantity: destroyed
          ? "0"
          : item?.harvestQuantity === null || item?.harvestQuantity === undefined
            ? ""
            : String(item.harvestQuantity),
        destroyed,
      };
    })
    .filter((item) => item.cropName);
  if (items.length) return items;
  return String(entry?.cropName || "")
    .split("、")
    .map((cropName) => cropName.trim())
    .filter(Boolean)
    .map((cropName, index) => ({
      cropName,
      harvestDate: index === 0 ? String(entry?.harvestDate || "") : "",
      estimatedQuantity: index === 0 && Boolean(entry?.destroyed)
        ? "0"
        : index === 0 && entry?.estimatedQuantity !== null && entry?.estimatedQuantity !== undefined
          ? String(entry.estimatedQuantity)
          : "",
      harvestQuantity: index === 0 && Boolean(entry?.destroyed)
        ? "0"
        : index === 0 && entry?.harvestQuantity !== null && entry?.harvestQuantity !== undefined
          ? String(entry.harvestQuantity)
          : "",
      destroyed: index === 0 ? Boolean(entry?.destroyed) : false,
    }));
}

function setSavedNetHouseStatusRecord(entry) {
  const record = normalizeNetHouseStatusRecord(entry);
  if (!record) return;
  savedNetHouseStatusRecords[netHouseStatusRecordKey(record.recordDate, record.zoneName, record.netHouseCode)] = record;
}

function fieldWorkCropItemsFromRecordEntry(entry) {
  const cropItems = [];
  if (Array.isArray(entry?.cropItems)) {
    entry.cropItems.forEach((item) => {
      const cropKey = String(item?.cropKey || "");
      const cropName = String(item?.cropName || "");
      const trayCount = item?.trayCount === null || item?.trayCount === undefined ? "" : String(item.trayCount);
      if (cropKey || cropName) cropItems.push({ cropKey, cropName, trayCount });
    });
  }
  if (!cropItems.length) {
    const cropKey = String(entry?.cropKey || "");
    const cropName = String(entry?.cropName || "");
    if (cropKey || cropName) cropItems.push({ cropKey, cropName, trayCount: "" });
  }
  return cropItems;
}

function fieldWorkRecordKey(workDate = state.fieldWorkDate, zoneName = state.fieldWorkZoneName, netHouseCode = state.fieldWorkNetHouseCode) {
  return `${workDate || ""}|${zoneName || ""}|${netHouseCode || ""}`;
}

function selectedFieldWorkTaskKeys() {
  return new Set(savedFieldWorkRecords[fieldWorkRecordKey()]?.taskKeys || []);
}

function selectedFieldWorkFertilizerBagCount() {
  return savedFieldWorkRecords[fieldWorkRecordKey()]?.fertilizerBagCount || "";
}

function selectedFieldWorkAccountName() {
  const record = savedFieldWorkRecords[fieldWorkRecordKey()];
  const accountNames = Array.isArray(record?.accountNames) ? record.accountNames.filter(Boolean) : [];
  if (accountNames.length) return accountNames.join("、");
  return record?.accountName || "";
}

function fieldWorkSelectedNetHouse() {
  const zone = (Array.isArray(fieldNetHouseData?.zones) ? fieldNetHouseData.zones : [])
    .find((item) => item.name === state.fieldWorkZoneName);
  return (Array.isArray(zone?.netHouses) ? zone.netHouses : [])
    .find((house) => house.netHouseCode === state.fieldWorkNetHouseCode) || null;
}

function selectedFieldWorkSeedlingTransplantCropItems() {
  const record = savedFieldWorkRecords[fieldWorkRecordKey()];
  if (Array.isArray(record?.seedlingTransplantCropItems)) return record.seedlingTransplantCropItems;
  const cropKey = record?.seedlingTransplantCropKey || "";
  const cropName = record?.seedlingTransplantCropName || "";
  return cropKey || cropName ? [{ cropKey, cropName, trayCount: "" }] : [];
}

function hasSavedFieldWorkRecord(workDate = state.fieldWorkDate, zoneName = state.fieldWorkZoneName, netHouseCode = state.fieldWorkNetHouseCode) {
  return Boolean((savedFieldWorkRecords[fieldWorkRecordKey(workDate, zoneName, netHouseCode)]?.taskKeys || []).length);
}

function fieldWorkPlantingGuardRecord(workDate = state.fieldWorkDate, zoneName = state.fieldWorkZoneName, netHouseCode = state.fieldWorkNetHouseCode) {
  if (!workDate || !zoneName || !netHouseCode || hasSavedFieldWorkRecord(workDate, zoneName, netHouseCode)) return null;
  const activeRecord = netHouseStatusTimelineRecords(workDate, zoneName, netHouseCode)[0];
  if (activeRecord?.status !== "種植") return null;
  const harvestDate = netHouseStatusPlantingEndDate(activeRecord);
  if (harvestDate && workDate >= harvestDate) return null;
  return activeRecord;
}

function fieldWorkMonthExportFilename(month) {
  return `${month || t("fieldWork.unselectedMonth")}_${t("fieldWork.exportFilename")}.xlsx`;
}

async function exportFieldWorkMonthExcel() {
  const month = monthKey(state.fieldWorkDate || todayDate());
  if (!month) {
    alert(t("fieldWork.validDateRequired"));
    return;
  }
  const buttons = [byId("headerExportFieldWorkMonthBtn"), byId("exportFieldWorkMonthBtn")].filter(Boolean);
  buttons.forEach((button) => {
    button.disabled = true;
  });
  try {
    const response = await fetch("/api/export-field-work-month", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month }),
    });
    if (!response.ok) {
      let message = t("fieldWork.exportError");
      try {
        const result = await response.json();
        if (result?.error) message = result.error;
      } catch {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fieldWorkMonthExportFilename(month);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert(`${t("fieldWork.exportError")}：${error.message}`);
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}

function fieldWorkHarvestProductOptions(selectedKey, placeholder = t("fieldWork.chooseCrop")) {
  const products = [...allHarvestProducts].sort((a, b) => {
    if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
    return String(a.productName || "").localeCompare(String(b.productName || ""), "zh-Hant", {
      numeric: true,
      sensitivity: "base",
    });
  });
  return [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...products.map((product) => {
      const key = productFilterKey(product);
      return `<option value="${escapeAttribute(key)}" ${key === selectedKey ? "selected" : ""}>${escapeHtml(fieldWorkHarvestProductLabel(product))}</option>`;
    }),
  ].join("");
}

function fieldWorkHarvestProductLabel(product) {
  const productName = String(product?.productName || "");
  if (activeLanguage !== "vi") return productName;
  const pronunciation = fieldWorkVietnameseCropPronunciations[productName];
  return pronunciation ? `${productName}（${pronunciation}）` : productName;
}

function fieldWorkDirectSowCrop() {
  return allHarvestProducts.find((item) => ["空心", "空心菜"].includes(String(item.productName || ""))) || null;
}

function fieldWorkHarvestProductByKey(key) {
  return allHarvestProducts.find((product) => productFilterKey(product) === key) || null;
}

function collectFieldWorkSeedlingTransplantCropItems() {
  return validateFieldWorkSeedlingTransplantInputs({ showAlert: false }).cropItems;
}

function validateFieldWorkFertilizerInput({ showAlert = true } = {}) {
  const input = byId("fieldWorkFertilizerBagCountInput");
  if (!byId("fieldWorkSoilPreparationInput")?.checked) return true;
  if (String(input?.value || "").trim()) return true;
  if (showAlert) alert(t("fieldWork.fertilizerRequired"));
  input?.focus?.();
  return false;
}

function validateFieldWorkSeedlingTransplantInputs({ showAlert = true } = {}) {
  const rows = [...document.querySelectorAll(".field-work-crop-row")];
  const cropItems = [];
  const fail = (messageKey, control) => {
    if (showAlert) alert(t(messageKey));
    control?.focus?.();
    return { ok: false, cropItems: [] };
  };
  if (!rows.length) return fail("fieldWork.seedlingCropRequired");
  for (const row of rows) {
    const select = row.querySelector(".field-work-seedling-transplant-crop-select");
    const trayInput = row.querySelector(".field-work-seedling-transplant-tray-input");
    const cropKey = String(select?.value || "");
    const trayCount = String(trayInput?.value || "").trim();
    if (!cropKey) return fail("fieldWork.seedlingCropRequired", select);
    if (!trayCount) return fail("fieldWork.seedlingTrayRequired", trayInput);
    if (!/^\d+$/.test(trayCount)) return fail("fieldWork.seedlingTrayIntegerRequired", trayInput);
    const crop = fieldWorkHarvestProductByKey(cropKey);
    cropItems.push({ cropKey, cropName: String(crop?.productName || ""), trayCount });
  }
  return { ok: true, cropItems };
}

function canLeaveFieldWorkRecordsPage() {
  if (state.page !== "fieldWorkRecords") return true;
  if (!validateFieldWorkFertilizerInput()) return false;
  if (!byId("fieldWorkSeedlingTransplantInput")?.checked) return true;
  return validateFieldWorkSeedlingTransplantInputs().ok;
}

function canUseFieldWorkMessageBoardAction() {
  return canLeaveFieldWorkRecordsPage();
}

function fieldWorkSeedlingTransplantCropRow(cropKey = "", trayCount = "", action = "remove", disabled = false) {
  const isAddAction = action === "add";
  return `<div class="field-work-crop-row">
    <select class="field-work-seedling-transplant-crop-select" ${disabled ? "disabled" : ""}>
      ${fieldWorkHarvestProductOptions(cropKey)}
    </select>
    <input
      class="field-work-seedling-transplant-tray-input"
      type="text"
      ${fieldNumericInputAttributes("integer")}
      placeholder="${escapeAttribute(t("fieldWork.trayCount"))}"
      aria-label="${escapeAttribute(t("fieldWork.seedlingTrayCount"))}"
      value="${escapeAttribute(trayCount)}"
      ${disabled ? "disabled" : ""}
    />
    <button
      class="field-work-crop-action field-work-seedling-transplant-crop-action"
      type="button"
      data-field-work-crop-action="${isAddAction ? "add" : "remove"}"
      aria-label="${escapeAttribute(isAddAction ? t("fieldWork.addSeedlingCrop") : t("fieldWork.removeSeedlingCrop"))}"
      ${disabled ? "disabled" : ""}
    >${isAddAction ? "+" : "-"}</button>
  </div>`;
}

function bindSeedlingTransplantCropControls(container = document) {
  container.querySelectorAll(".field-work-seedling-transplant-crop-select").forEach((select) => {
    select.addEventListener("change", (event) => {
      if (!byId("fieldWorkSeedlingTransplantInput")?.checked) return;
      const row = event.target.closest(".field-work-crop-row");
      const trayInput = row?.querySelector(".field-work-seedling-transplant-tray-input");
      if (event.target.value && !String(trayInput?.value || "").trim()) {
        trayInput?.focus?.();
        return;
      }
      saveFieldWorkRecords();
    });
  });
  container.querySelectorAll(".field-work-seedling-transplant-tray-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      event.target.value = String(event.target.value || "").trim();
      saveFieldWorkRecords();
    });
  });
  container.querySelectorAll(".field-work-seedling-transplant-crop-action").forEach((button) => {
    button.addEventListener("click", handleSeedlingTransplantCropAction);
  });
  bindFieldNumericKeypadControls(container);
}

function addSeedlingTransplantCropSelect() {
  if (!byId("fieldWorkSeedlingTransplantInput")?.checked) return;
  const cropList = document.querySelector(".field-work-seedling-transplant-crop-list");
  if (!cropList) return;
  cropList.insertAdjacentHTML("beforeend", fieldWorkSeedlingTransplantCropRow("", "", "remove", false));
  const cropRow = cropList.lastElementChild;
  if (!cropRow) return;
  bindSeedlingTransplantCropControls(cropRow);
  cropRow.querySelector(".field-work-seedling-transplant-crop-select")?.focus();
}

function handleSeedlingTransplantCropAction(event) {
  const action = event.currentTarget.dataset.fieldWorkCropAction;
  if (action === "add") {
    addSeedlingTransplantCropSelect();
    return;
  }
  event.currentTarget.closest(".field-work-crop-row")?.remove();
  saveFieldWorkRecords();
}

function fieldWorkMessageItemsMarkup(key = fieldWorkMessageScopeKey()) {
  if (!fieldWorkMessagesLoaded(key)) {
    return `<p class="harvest-message-empty">${escapeHtml(t("fieldWork.messagesLoading"))}</p>`;
  }
  const messages = fieldWorkMessagesForDate(key);
  if (!messages.length) {
    return `<p class="harvest-message-empty">${escapeHtml(t("fieldWork.noMessages"))}</p>`;
  }
  return messages
    .map((message) => `<article class="harvest-message-item field-work-message-item">
      <div class="harvest-message-meta">
        <time>${escapeHtml(formatFieldWorkMessageMeta(message))}</time>
        <button class="harvest-message-delete field-work-message-delete" type="button" data-delete-field-work-message="${message.id}">${escapeHtml(t("fieldWork.delete"))}</button>
      </div>
      ${message.message ? `<p>${escapeHtml(message.message).replace(/\n/g, "<br />")}</p>` : ""}
      ${fieldWorkMessagePhotosMarkup(message)}
    </article>`)
    .join("");
}

function fieldWorkMessagePhotosMarkup(message) {
  const photos = Array.isArray(message?.photos) ? message.photos : [];
  if (!photos.length) return "";
  return `<div class="field-work-message-photos">
    ${photos
      .map((photo, index) => {
        const label = photo.originalName || t("fieldWork.photoAlt", { count: index + 1 });
        return `<a class="field-work-message-photo" href="${escapeAttribute(photo.urlPath)}" target="_blank" rel="noopener">
          <img src="${escapeAttribute(photo.urlPath)}" alt="${escapeAttribute(label)}" loading="lazy" />
        </a>`;
      })
      .join("")}
  </div>`;
}

function renderFieldWorkMessageBoard() {
  const scope = fieldWorkMessageScope();
  const scopeKey = fieldWorkMessageScopeKey(scope);
  return `<section id="fieldWorkMessageBoard" class="harvest-message-board field-work-message-board">
    <div class="harvest-message-board-head">
      <div>
        <h3>${escapeHtml(t("fieldWork.messageBoard"))}</h3>
        <span>${escapeHtml(fieldWorkMessageScopeLabel(scope))}</span>
      </div>
      <button id="addFieldWorkMessageBtn" class="field-work-message-add" type="submit" form="fieldWorkMessageForm">${escapeHtml(t("fieldWork.addMessage"))}</button>
    </div>
    <form id="fieldWorkMessageForm" class="harvest-message-form">
      <textarea id="fieldWorkMessageInput" class="harvest-message-input" rows="2" maxlength="1000" placeholder="${escapeAttribute(t("fieldWork.messagePlaceholder"))}"></textarea>
      <label class="field-work-photo-control">
        <span>${escapeHtml(t("fieldWork.photo"))}</span>
        <input id="fieldWorkMessagePhotoInput" class="field-work-photo-input" type="file" accept="image/*,.heic,.heif" multiple />
      </label>
      <p id="fieldWorkMessagePhotoSummary" class="field-work-photo-summary"></p>
    </form>
    <div id="fieldWorkMessageList" class="harvest-message-list">
      ${fieldWorkMessageItemsMarkup(scopeKey)}
    </div>
  </section>`;
}

function updateFieldWorkMessageBoard() {
  const list = byId("fieldWorkMessageList");
  if (list) list.innerHTML = fieldWorkMessageItemsMarkup();
  document.querySelectorAll("[data-delete-field-work-message]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!canUseFieldWorkMessageBoardAction()) return;
      if (!confirm(t("fieldWork.deleteConfirm"))) return;
      deleteFieldWorkMessage(button.dataset.deleteFieldWorkMessage)
        .then(() => updateFieldWorkMessageBoard())
        .catch((error) => {
          alert(`${t("fieldWork.deleteMessageError")}：${error.message}`);
        });
    });
  });
}

function bindFieldWorkMessageBoard() {
  const form = byId("fieldWorkMessageForm");
  const input = byId("fieldWorkMessageInput");
  const photoInput = byId("fieldWorkMessagePhotoInput");
  const photoSummary = byId("fieldWorkMessagePhotoSummary");
  const button = byId("addFieldWorkMessageBtn");
  const updatePhotoSummary = () => {
    const count = photoInput?.files?.length || 0;
    if (photoSummary) photoSummary.textContent = count ? t("fieldWork.selectedPhotos", { count }) : "";
  };
  input?.addEventListener("focus", () => {
    if (!canUseFieldWorkMessageBoardAction()) input.blur();
  });
  photoInput?.addEventListener("click", (event) => {
    if (canUseFieldWorkMessageBoardAction()) return;
    event.preventDefault();
  });
  photoInput?.addEventListener("change", (event) => {
    if (!canUseFieldWorkMessageBoardAction()) {
      event.target.value = "";
      updatePhotoSummary();
      return;
    }
    updatePhotoSummary();
  });
  button?.addEventListener("click", (event) => {
    if (canUseFieldWorkMessageBoardAction()) return;
    event.preventDefault();
  });
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!canUseFieldWorkMessageBoardAction()) return;
    const message = input?.value || "";
    const photos = photoInput?.files ? [...photoInput.files] : [];
    if (button) button.disabled = true;
    addFieldWorkMessage(message, photos)
      .then(() => {
        if (input) input.value = "";
        if (photoInput) photoInput.value = "";
        updatePhotoSummary();
        updateFieldWorkMessageBoard();
      })
      .catch((error) => {
        alert(`${t("fieldWork.saveMessageError")}：${error.message}`);
      })
      .finally(() => {
        if (button) button.disabled = false;
      });
  });
  const scope = fieldWorkMessageScope();
  const scopeKey = fieldWorkMessageScopeKey(scope);
  if (!fieldWorkMessagesLoaded(scopeKey)) {
    ensureFieldWorkMessagesForScope(scope)
      .then(() => {
        if (state.page === "fieldWorkRecords" || state.page === "fieldWorkMessageBoard") {
          updateFieldWorkMessageBoard();
        }
      })
      .catch((error) => {
        const list = byId("fieldWorkMessageList");
        if (list) list.innerHTML = `<p class="harvest-message-empty">${escapeHtml(t("fieldWork.loadMessageError"))}：${escapeHtml(error.message)}</p>`;
      });
  } else {
    updateFieldWorkMessageBoard();
  }
}

function renderFieldWorkMessageBoardPage() {
  const date = state.fieldWorkDate || todayDate();
  const returnLabel = state.fieldWorkMessageReturnPage === "netHouseStatusRecords"
    ? t("fieldWork.messagePageReturnNetHouse")
    : t("fieldWork.messagePageReturnDefault");
  byId("viewTitle").innerHTML = `<div class="view-title-row">
    <div>
      <h2>${escapeHtml(t("page.fieldWorkMessageBoard"))}</h2>
    </div>
    <div class="field-work-message-page-actions">
      <button id="returnFromFieldWorkMessageBoardBtn" type="button">${escapeHtml(returnLabel)}</button>
      <span class="date-pill">${escapeHtml(formatDateShort(date) || date)}</span>
    </div>
  </div>`;
  byId("tableHost").innerHTML = `<section class="field-work-panel field-work-message-page">
    <div class="field-work-form field-work-message-page-form">
      ${renderFieldWorkMessageBoard()}
    </div>
  </section>`;
  byId("returnFromFieldWorkMessageBoardBtn")?.addEventListener("click", returnFromFieldWorkMessageBoard);
  bindFieldWorkMessageBoard();
}

const chineseNumberOrder = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

function zoneSortParts(name) {
  const text = String(name || "");
  const chineseNumber = chineseNumberOrder[text[0]];
  if (chineseNumber) return { rank: chineseNumber, suffix: text.slice(1) };
  const numericPrefix = text.match(/^\d+/)?.[0];
  if (numericPrefix) return { rank: Number(numericPrefix), suffix: text.slice(numericPrefix.length) };
  return { rank: null, suffix: text };
}

function compareZoneName(a, b) {
  const aParts = zoneSortParts(a);
  const bParts = zoneSortParts(b);
  if (aParts.rank !== null && bParts.rank !== null && aParts.rank !== bParts.rank) {
    return aParts.rank - bParts.rank;
  }
  return String(a).localeCompare(String(b), "zh-Hant", {
      numeric: true,
      sensitivity: "base",
    });
}

function fieldZones() {
  return [...(Array.isArray(fieldNetHouseData?.zones) ? fieldNetHouseData.zones : [])].sort((a, b) =>
    compareZoneName(a.name, b.name),
  );
}

function netHouseCodeParts(code) {
  const parts = String(code || "").split("-");
  return {
    prefix: parts[0] || "",
    suffix: parts.slice(1).join("-"),
  };
}

function compareNetHouseCodePart(a, b) {
  const aNumber = /^\d+$/.test(a) ? Number(a) : null;
  const bNumber = /^\d+$/.test(b) ? Number(b) : null;
  if (aNumber !== null && bNumber !== null) return aNumber - bNumber;
  return String(a).localeCompare(String(b), "en", {
    numeric: true,
    sensitivity: "base",
  });
}

function azSortedNetHouses(netHouses) {
  return [...(netHouses || [])].sort((a, b) => {
    const aParts = netHouseCodeParts(a.netHouseCode);
    const bParts = netHouseCodeParts(b.netHouseCode);
    return compareNetHouseCodePart(aParts.prefix, bParts.prefix)
      || compareNetHouseCodePart(aParts.suffix, bParts.suffix)
      || String(a.netHouseCode || "").localeCompare(String(b.netHouseCode || ""), "en", {
        numeric: true,
        sensitivity: "base",
      });
  });
}

function gridCountText(value) {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  if (Number.isFinite(number) && Number.isInteger(number)) return String(number);
  return String(value);
}

function fieldWorkSelection() {
  const zones = fieldZones();
  if (!state.fieldWorkDate) state.fieldWorkDate = todayDate();
  if (!zones.some((zone) => zone.name === state.fieldWorkZoneName)) {
    state.fieldWorkZoneName = zones[0]?.name || "";
  }
  const zone = zones.find((item) => item.name === state.fieldWorkZoneName);
  const netHouses = azSortedNetHouses(zone?.netHouses || []);
  if (!netHouses.some((house) => house.netHouseCode === state.fieldWorkNetHouseCode)) {
    state.fieldWorkNetHouseCode = netHouses[0]?.netHouseCode || "";
  }
  return { zones, netHouses };
}

function fieldWorkNetHouseDisplayText(house) {
  const code = String(house?.netHouseCode || "");
  const gridCount = gridCountText(house?.gridCount);
  if (activeLanguage === "vi" || !gridCount) return code;
  return `${code} (${gridCount})`;
}

function fieldWorkNetHouseDisplayMarkup(house) {
  const code = String(house?.netHouseCode || "");
  const gridCount = gridCountText(house?.gridCount);
  const gridCountMarkup = activeLanguage === "vi" || !gridCount
    ? ""
    : `<span class="field-work-net-house-grid-count">(${escapeHtml(gridCount)})</span>`;
  return `<span class="field-work-net-house-code">${escapeHtml(code)}</span>${gridCountMarkup}`;
}

function fieldWorkNetHousePickerMarkup(netHouses) {
  const selectedHouse = netHouses.find((house) => house.netHouseCode === state.fieldWorkNetHouseCode) || netHouses[0] || null;
  const selectedMarkup = selectedHouse
    ? fieldWorkNetHouseDisplayMarkup(selectedHouse)
    : `<span class="field-work-net-house-code">${escapeHtml(t("fieldWork.chooseNetHouse"))}</span>`;
  const selectedLabel = selectedHouse ? fieldWorkNetHouseDisplayText(selectedHouse) : t("fieldWork.chooseNetHouse");
  const options = netHouses
    .map((house) => {
      const selected = house.netHouseCode === state.fieldWorkNetHouseCode;
      return `<button
        class="field-work-net-house-option ${selected ? "is-selected" : ""}"
        type="button"
        role="option"
        aria-selected="${selected ? "true" : "false"}"
        aria-label="${escapeAttribute(fieldWorkNetHouseDisplayText(house))}"
        data-net-house-code="${escapeAttribute(house.netHouseCode)}"
      >${fieldWorkNetHouseDisplayMarkup(house)}</button>`;
    })
    .join("");
  return `<div class="field-work-net-house-picker">
    <button
      id="fieldWorkNetHousePickerBtn"
      class="field-work-net-house-picker-button"
      type="button"
      aria-haspopup="listbox"
      aria-expanded="false"
      aria-label="${escapeAttribute(selectedLabel)}"
    >${selectedMarkup}</button>
    <div id="fieldWorkNetHousePickerList" class="field-work-net-house-picker-list" role="listbox" hidden>
      ${options}
    </div>
  </div>`;
}

function scrollNetHousePickerSelectionIntoView(list) {
  const selectedOption = list?.querySelector?.(".field-work-net-house-option.is-selected");
  if (!list || !selectedOption) return;
  const scrollSelection = () => {
    if (list.hidden || !list.clientHeight) return;
    const centeredTop = selectedOption.offsetTop - Math.max(0, (list.clientHeight - selectedOption.offsetHeight) / 2);
    list.scrollTop = Math.max(0, centeredTop);
  };
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(scrollSelection);
  } else {
    scrollSelection();
  }
}

function setFieldWorkNetHousePickerOpen(open) {
  const picker = document.querySelector(".field-work-net-house-picker");
  const button = byId("fieldWorkNetHousePickerBtn");
  const list = byId("fieldWorkNetHousePickerList");
  if (!picker || !button || !list) return;
  picker.classList.toggle("is-open", open);
  button.setAttribute("aria-expanded", open ? "true" : "false");
  list.hidden = !open;
  if (open) scrollNetHousePickerSelectionIntoView(list);
}

function bindFieldWorkNetHousePicker() {
  const picker = document.querySelector(".field-work-net-house-picker");
  const button = byId("fieldWorkNetHousePickerBtn");
  if (!picker || !button) return;
  button.addEventListener("click", () => {
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    setFieldWorkNetHousePickerOpen(willOpen);
    if (willOpen) {
      window.setTimeout(() => {
        document.addEventListener("click", closeFieldWorkNetHousePickerOnOutside, { once: true });
      }, 0);
    }
  });
  button.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    setFieldWorkNetHousePickerOpen(true);
    document.querySelector(".field-work-net-house-option.is-selected, .field-work-net-house-option")?.focus();
  });
  picker.querySelectorAll(".field-work-net-house-option").forEach((option) => {
    option.addEventListener("click", () => {
      const nextNetHouseCode = option.dataset.netHouseCode || "";
      if (nextNetHouseCode !== state.fieldWorkNetHouseCode && !canLeaveFieldWorkRecordsPage()) return;
      state.fieldWorkNetHouseCode = option.dataset.netHouseCode || "";
      render();
    });
    option.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setFieldWorkNetHousePickerOpen(false);
      button.focus();
    });
  });
}

function closeFieldWorkNetHousePickerOnOutside(event) {
  if (event.target?.closest?.(".field-work-net-house-picker")) {
    document.addEventListener("click", closeFieldWorkNetHousePickerOnOutside, { once: true });
    return;
  }
  setFieldWorkNetHousePickerOpen(false);
}

function netHouseStatusNetHousePickerMarkup(netHouses, selectedHouse) {
  const selectedMarkup = selectedHouse
    ? fieldWorkNetHouseDisplayMarkup(selectedHouse)
    : `<span class="field-work-net-house-code">${escapeHtml(t("fieldWork.chooseNetHouse"))}</span>`;
  const selectedLabel = selectedHouse ? fieldWorkNetHouseDisplayText(selectedHouse) : t("fieldWork.chooseNetHouse");
  const options = netHouses
    .map((house) => {
      const selected = house.netHouseCode === state.netHouseStatusNetHouseCode;
      return `<button
        class="field-work-net-house-option net-house-status-net-house-option ${selected ? "is-selected" : ""}"
        type="button"
        role="option"
        aria-selected="${selected ? "true" : "false"}"
        aria-label="${escapeAttribute(fieldWorkNetHouseDisplayText(house))}"
        data-net-house-code="${escapeAttribute(house.netHouseCode)}"
      >${fieldWorkNetHouseDisplayMarkup(house)}</button>`;
    })
    .join("");
  return `<div class="field-work-net-house-picker net-house-status-net-house-select-picker">
    <button
      id="netHouseStatusNetHousePickerBtn"
      class="field-work-net-house-picker-button"
      type="button"
      aria-haspopup="listbox"
      aria-expanded="false"
      aria-label="${escapeAttribute(selectedLabel)}"
    >${selectedMarkup}</button>
    <div id="netHouseStatusNetHousePickerList" class="field-work-net-house-picker-list" role="listbox" hidden>
      ${options}
    </div>
  </div>`;
}

function setNetHouseStatusNetHousePickerOpen(open) {
  const picker = document.querySelector(".net-house-status-net-house-select-picker");
  const button = byId("netHouseStatusNetHousePickerBtn");
  const list = byId("netHouseStatusNetHousePickerList");
  if (!picker || !button || !list) return;
  picker.classList.toggle("is-open", open);
  button.setAttribute("aria-expanded", open ? "true" : "false");
  list.hidden = !open;
  if (open) scrollNetHousePickerSelectionIntoView(list);
}

function bindNetHouseStatusNetHousePicker() {
  const picker = document.querySelector(".net-house-status-net-house-select-picker");
  const button = byId("netHouseStatusNetHousePickerBtn");
  if (!picker || !button) return;
  button.addEventListener("click", () => {
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    setNetHouseStatusNetHousePickerOpen(willOpen);
    if (willOpen) {
      window.setTimeout(() => {
        document.addEventListener("click", closeNetHouseStatusNetHousePickerOnOutside, { once: true });
      }, 0);
    }
  });
  button.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "Enter", " "].includes(event.key)) return;
    event.preventDefault();
    setNetHouseStatusNetHousePickerOpen(true);
    document.querySelector(".net-house-status-net-house-option.is-selected, .net-house-status-net-house-option")?.focus();
  });
  picker.querySelectorAll(".net-house-status-net-house-option").forEach((option) => {
    option.addEventListener("click", () => {
      state.netHouseStatusNetHouseCode = option.dataset.netHouseCode || "";
      render();
    });
    option.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setNetHouseStatusNetHousePickerOpen(false);
      button.focus();
    });
  });
}

function closeNetHouseStatusNetHousePickerOnOutside(event) {
  if (event.target?.closest?.(".net-house-status-net-house-select-picker")) {
    document.addEventListener("click", closeNetHouseStatusNetHousePickerOnOutside, { once: true });
    return;
  }
  setNetHouseStatusNetHousePickerOpen(false);
}

function netHouseStatusSelection() {
  const zones = fieldZones();
  if (!state.netHouseStatusDate) state.netHouseStatusDate = todayDate();
  if (!zones.some((zone) => zone.name === state.netHouseStatusZoneName)) {
    state.netHouseStatusZoneName = zones[0]?.name || "";
  }
  const zone = zones.find((item) => item.name === state.netHouseStatusZoneName);
  const netHouses = azSortedNetHouses(zone?.netHouses || []);
  if (!netHouses.some((house) => house.netHouseCode === state.netHouseStatusNetHouseCode)) {
    state.netHouseStatusNetHouseCode = netHouses[0]?.netHouseCode || "";
  }
  return { zones, netHouses };
}

function netHouseStatusRecordKey(
  recordDate = state.netHouseStatusDate,
  zoneName = state.netHouseStatusZoneName,
  netHouseCode = state.netHouseStatusNetHouseCode,
) {
  return `${recordDate || ""}|${zoneName || ""}|${netHouseCode || ""}`;
}

function netHouseStatusSelectedNetHouse() {
  const zone = (Array.isArray(fieldNetHouseData?.zones) ? fieldNetHouseData.zones : [])
    .find((item) => item.name === state.netHouseStatusZoneName);
  return (Array.isArray(zone?.netHouses) ? zone.netHouses : [])
    .find((house) => house.netHouseCode === state.netHouseStatusNetHouseCode) || null;
}

function parseFieldWorkRecordKey(key) {
  const [workDate = "", zoneName = "", netHouseCode = ""] = String(key || "").split("|");
  return { workDate, zoneName, netHouseCode };
}

function cropItemsFromFieldWorkRecord(record) {
  const items = [];
  if ((record?.taskKeys || []).includes("directSow")) {
    const cropName = String(record.directSowCropName || "空心菜").trim();
    if (cropName && !items.some((item) => item.cropName === cropName)) {
      items.push({ cropName, harvestDate: "", estimatedQuantity: "", harvestQuantity: "", destroyed: false });
    }
  }
  if ((record?.taskKeys || []).includes("seedlingTransplant")) {
    const seedlingItems = Array.isArray(record.seedlingTransplantCropItems) ? record.seedlingTransplantCropItems : [];
    seedlingItems.forEach((item) => {
      const cropName = String(item?.cropName || "").trim();
      if (cropName && !items.some((existing) => existing.cropName === cropName)) {
        items.push({ cropName, harvestDate: "", estimatedQuantity: "", harvestQuantity: "", destroyed: false });
      }
    });
    const fallbackName = String(record.seedlingTransplantCropName || "").trim();
    if (fallbackName && !items.some((item) => item.cropName === fallbackName)) {
      items.push({ cropName: fallbackName, harvestDate: "", estimatedQuantity: "", harvestQuantity: "", destroyed: false });
    }
  }
  return items;
}

function fieldWorkPlantingStatusRecord(workDate, zoneName, netHouseCode, record) {
  const cropItems = cropItemsFromFieldWorkRecord(record);
  if (!cropItems.length) return null;
  return {
    recordDate: workDate,
    zoneName,
    netHouseCode,
    status: "種植",
    cropName: cropItems[0].cropName,
    plantedDate: workDate,
    harvestDate: cropItems[0].harvestDate,
    estimatedQuantity: cropItems[0].estimatedQuantity,
    harvestQuantity: cropItems[0].harvestQuantity,
    destroyed: Boolean(cropItems[0].destroyed),
    cropItems,
    lunchMarked: false,
    source: "fieldWork",
  };
}

function netHouseStatusPlantingEndDate(record) {
  const cropItems = activeNetHouseStatusCropItems(record);
  if (cropItems.length) {
    const harvestDates = cropItems
      .map((item) => String(item?.harvestDate || "").trim())
      .filter(Boolean)
      .sort();
    if (harvestDates.length < cropItems.length) return "";
    return harvestDates[harvestDates.length - 1] || "";
  }
  return String(record?.harvestDate || "").trim();
}

function netHouseStatusHarvestDateError(plantedDate, cropItems = []) {
  const planted = String(plantedDate || "").trim();
  if (!planted) return "";
  const invalidItem = (Array.isArray(cropItems) ? cropItems : []).find((item) => {
    const harvestDate = String(item?.harvestDate || "").trim();
    return harvestDate && harvestDate < planted;
  });
  return invalidItem ? t("netHouseStatus.harvestBeforePlantingError") : "";
}

function alertNetHouseStatusHarvestDateError(plantedDate, cropItems = []) {
  const message = netHouseStatusHarvestDateError(plantedDate, cropItems);
  if (!message) return false;
  alert(message);
  return true;
}

function isNetHouseStatusRecordActiveOnDate(record, selectedDate) {
  if (!record || record.status !== "種植") return true;
  if (!activeNetHouseStatusCropItems(record).length) return false;
  const date = String(selectedDate || "").trim();
  if (!date) return true;
  const plantedDate = String(record.plantedDate || record.recordDate || "").trim();
  if (plantedDate && date < plantedDate) return false;
  const harvestDate = netHouseStatusPlantingEndDate(record);
  if (harvestDate && date > harvestDate) return false;
  return true;
}

function netHouseStatusTimelineRecords(recordDate = state.netHouseStatusDate, zoneName = state.netHouseStatusZoneName, netHouseCode = state.netHouseStatusNetHouseCode) {
  const selectedDate = recordDate || todayDate();
  const records = [];
  Object.values(savedNetHouseStatusRecords).forEach((record) => {
    if (record.zoneName !== zoneName || record.netHouseCode !== netHouseCode) return;
    if (record.recordDate > selectedDate) return;
    if (!isNetHouseStatusRecordActiveOnDate(record, selectedDate)) return;
    records.push({ ...record, source: "status", priority: 1 });
  });
  Object.entries(savedFieldWorkRecords).forEach(([key, record]) => {
    const parts = parseFieldWorkRecordKey(key);
    if (parts.zoneName !== zoneName || parts.netHouseCode !== netHouseCode) return;
    if (!parts.workDate || parts.workDate > selectedDate) return;
    const statusKey = netHouseStatusRecordKey(parts.workDate, zoneName, netHouseCode);
    if (savedNetHouseStatusRecords[statusKey]) return;
    const plantingRecord = fieldWorkPlantingStatusRecord(parts.workDate, zoneName, netHouseCode, record);
    if (plantingRecord && !isNetHouseStatusRecordActiveOnDate(plantingRecord, selectedDate)) return;
    if (plantingRecord) records.push({ ...plantingRecord, priority: 0 });
  });
  return records.sort((a, b) =>
    String(b.recordDate || "").localeCompare(String(a.recordDate || ""))
    || (b.priority || 0) - (a.priority || 0),
  );
}

function restorableNetHousePlantingRecord(recordDate = state.netHouseStatusDate, zoneName = state.netHouseStatusZoneName, netHouseCode = state.netHouseStatusNetHouseCode) {
  const selectedDate = recordDate || todayDate();
  const records = [];
  Object.values(savedNetHouseStatusRecords).forEach((record) => {
    if (record.zoneName !== zoneName || record.netHouseCode !== netHouseCode) return;
    if (record.status !== "種植" || !record.recordDate || record.recordDate >= selectedDate) return;
    if (!activeNetHouseStatusCropItems(record).length) return;
    if (!isNetHouseStatusRecordActiveOnDate(record, selectedDate)) return;
    records.push({ ...record, source: "status", priority: 1 });
  });
  Object.entries(savedFieldWorkRecords).forEach(([key, record]) => {
    const parts = parseFieldWorkRecordKey(key);
    if (parts.zoneName !== zoneName || parts.netHouseCode !== netHouseCode) return;
    if (!parts.workDate || parts.workDate >= selectedDate) return;
    const statusKey = netHouseStatusRecordKey(parts.workDate, zoneName, netHouseCode);
    if (activeNetHouseStatusCropItems(savedNetHouseStatusRecords[statusKey]).length) return;
    const plantingRecord = fieldWorkPlantingStatusRecord(parts.workDate, zoneName, netHouseCode, record);
    if (!plantingRecord || !activeNetHouseStatusCropItems(plantingRecord).length) return;
    if (!isNetHouseStatusRecordActiveOnDate(plantingRecord, selectedDate)) return;
    records.push({ ...plantingRecord, priority: 0 });
  });
  return records.sort((a, b) =>
    String(b.recordDate || "").localeCompare(String(a.recordDate || ""))
    || (b.priority || 0) - (a.priority || 0),
  )[0] || null;
}

function netHouseStatusActiveRecord() {
  const record = netHouseStatusTimelineRecords()[0];
  if (record) return record;
  return {
    recordDate: state.netHouseStatusDate || todayDate(),
    zoneName: state.netHouseStatusZoneName || "",
    netHouseCode: state.netHouseStatusNetHouseCode || "",
    status: "空園",
    cropName: "",
    plantedDate: "",
    harvestDate: "",
    estimatedQuantity: "",
    harvestQuantity: "",
    destroyed: false,
    cropItems: [],
    lunchMarked: false,
    source: "default",
  };
}

function selectedNetHouseStatus() {
  const status = netHouseStatusActiveRecord().status || "";
  return netHouseStatusOptions.includes(status) ? status : "空園";
}

function moveNetHouseStatusNetHouse(offset) {
  const { netHouses } = netHouseStatusSelection();
  const currentIndex = netHouses.findIndex((house) => house.netHouseCode === state.netHouseStatusNetHouseCode);
  const nextHouse = netHouses[currentIndex + offset];
  if (!nextHouse) return;
  state.netHouseStatusNetHouseCode = nextHouse.netHouseCode;
  render();
}

function bindNetHouseStatusNavButton(button) {
  const offset = Number(button?.dataset?.netHouseStatusNav || 0);
  if (!button || !offset) return;
  button.addEventListener("touchend", (event) => {
    if (button.disabled) return;
    event.preventDefault();
    lastNetHouseStatusNavTouchAt = Date.now();
    moveNetHouseStatusNetHouse(offset);
  }, { passive: false });
  button.addEventListener("click", () => {
    if (Date.now() - lastNetHouseStatusNavTouchAt < 700) return;
    moveNetHouseStatusNetHouse(offset);
  });
}

function openFieldWorkMessageBoardFromNetHouseStatus() {
  state.fieldWorkDate = state.netHouseStatusDate || todayDate();
  state.fieldWorkZoneName = state.netHouseStatusZoneName || "";
  state.fieldWorkNetHouseCode = state.netHouseStatusNetHouseCode || "";
  state.fieldWorkMessageReturnPage = "netHouseStatusRecords";
  setPage("fieldWorkMessageBoard");
}

function openFieldWorkRecordsFromNetHouseStatus() {
  if (currentRole() !== "root") return;
  setPage("fieldWorkRecords", () => {
    state.fieldWorkDate = state.netHouseStatusDate || todayDate();
    state.fieldWorkZoneName = state.netHouseStatusZoneName || "";
    state.fieldWorkNetHouseCode = state.netHouseStatusNetHouseCode || "";
  });
}

function openNetHouseStatusFromFieldWorkRecords() {
  if (currentRole() !== "root") return;
  setPage("netHouseStatusRecords", () => {
    state.netHouseStatusZoneName = state.fieldWorkZoneName || "";
    state.netHouseStatusNetHouseCode = state.fieldWorkNetHouseCode || "";
  });
}

function returnFromFieldWorkMessageBoard() {
  const targetPage = fieldWorkMessageReturnPages.includes(state.fieldWorkMessageReturnPage)
    ? state.fieldWorkMessageReturnPage
    : "fieldWorkRecords";
  state.fieldWorkMessageReturnPage = "";
  setPage(targetPage);
}

async function saveNetHouseStatusRecord() {
  const statusSelect = byId("netHouseStatusSelect");
  const lunchInput = byId("netHouseStatusLunchInput");
  const status = String(statusSelect?.value || "");
  if (!state.netHouseStatusDate || !state.netHouseStatusZoneName || !state.netHouseStatusNetHouseCode || !status) return;
  const activeRecord = netHouseStatusActiveRecord();
  const activeCropItems = activeNetHouseStatusCropItems(activeRecord);
  const detailRecord = (activeRecord.status === "種植" || activeCropItems.length)
    ? activeRecord
    : status === "種植"
      ? restorableNetHousePlantingRecord()
      : null;
  const cropItems = detailRecord ? activeNetHouseStatusCropItems(detailRecord) : [];
  const shouldCarryPlanting = Boolean(detailRecord && cropItems.length);
  const plantedDate = shouldCarryPlanting ? detailRecord.plantedDate || detailRecord.recordDate || state.netHouseStatusDate : "";
  if (alertNetHouseStatusHarvestDateError(plantedDate, cropItems)) return;
  if (statusSelect) statusSelect.disabled = true;
  try {
    const response = await fetch("/api/net-house-status-records", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordDate: state.netHouseStatusDate,
        zoneName: state.netHouseStatusZoneName,
        netHouseCode: state.netHouseStatusNetHouseCode,
        status,
        cropName: shouldCarryPlanting ? detailRecord.cropName || cropItems[0]?.cropName || "" : "",
        plantedDate,
        harvestDate: shouldCarryPlanting ? cropItems[0]?.harvestDate || detailRecord.harvestDate || "" : "",
        estimatedQuantity: shouldCarryPlanting ? cropItems[0]?.estimatedQuantity ?? detailRecord.estimatedQuantity ?? "" : "",
        harvestQuantity: shouldCarryPlanting ? cropItems[0]?.harvestQuantity ?? detailRecord.harvestQuantity ?? "" : "",
        cropItems,
        lunchMarked: lunchInput ? lunchInput.checked : Boolean(activeRecord.lunchMarked),
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || t("netHouseStatus.saveError"));
    setSavedNetHouseStatusRecord(result.record);
    render();
  } catch (error) {
    alert(`${t("netHouseStatus.saveError")}：${error.message}`);
    render();
  } finally {
    if (statusSelect) statusSelect.disabled = false;
  }
}

async function saveNetHouseStatusDetails(nextCropItems = null, { renderAfterSave = false } = {}) {
  const activeRecord = netHouseStatusActiveRecord();
  if (activeRecord.status !== "種植" || !activeRecord.recordDate) return false;
  const cropItems = Array.isArray(nextCropItems) ? nextCropItems : collectNetHouseStatusCropItems(activeRecord);
  const plantedDate = activeRecord.plantedDate || activeRecord.recordDate || "";
  if (alertNetHouseStatusHarvestDateError(plantedDate, cropItems)) {
    render();
    return false;
  }
  try {
    const response = await fetch("/api/net-house-status-records", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordDate: activeRecord.recordDate,
        zoneName: activeRecord.zoneName,
        netHouseCode: activeRecord.netHouseCode,
        status: "種植",
        cropName: activeRecord.cropName,
        plantedDate,
        harvestDate: cropItems[0]?.harvestDate || "",
        estimatedQuantity: cropItems[0]?.estimatedQuantity ?? "",
        harvestQuantity: cropItems[0]?.harvestQuantity ?? "",
        cropItems,
        lunchMarked: Boolean(activeRecord.lunchMarked),
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || t("netHouseStatus.saveError"));
    setSavedNetHouseStatusRecord(result.record);
    if (renderAfterSave || !isNetHouseStatusRecordActiveOnDate(result.record, state.netHouseStatusDate || activeRecord.recordDate)) render();
    return true;
  } catch (error) {
    alert(`${t("netHouseStatus.saveError")}：${error.message}`);
    render();
    return false;
  }
}

async function saveNetHouseStatusLunchMarked() {
  const activeRecord = netHouseStatusActiveRecord();
  const lunchInput = byId("netHouseStatusLunchInput");
  const recordDate = activeRecord.recordDate || state.netHouseStatusDate || todayDate();
  const zoneName = activeRecord.zoneName || state.netHouseStatusZoneName || "";
  const netHouseCode = activeRecord.netHouseCode || state.netHouseStatusNetHouseCode || "";
  if (!recordDate || !zoneName || !netHouseCode || !lunchInput) return;
  const cropItems = activeRecord.status === "種植" ? collectNetHouseStatusCropItems(activeRecord) : [];
  const plantedDate = activeRecord.status === "種植" ? activeRecord.plantedDate || activeRecord.recordDate || recordDate : "";
  if (alertNetHouseStatusHarvestDateError(plantedDate, cropItems)) {
    render();
    return;
  }
  lunchInput.disabled = true;
  try {
    const response = await fetch("/api/net-house-status-records", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordDate,
        zoneName,
        netHouseCode,
        status: activeRecord.status || selectedNetHouseStatus(),
        cropName: activeRecord.cropName || "",
        plantedDate,
        harvestDate: cropItems[0]?.harvestDate || activeRecord.harvestDate || "",
        estimatedQuantity: cropItems[0]?.estimatedQuantity ?? activeRecord.estimatedQuantity ?? "",
        harvestQuantity: cropItems[0]?.harvestQuantity ?? activeRecord.harvestQuantity ?? "",
        cropItems,
        lunchMarked: lunchInput.checked,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || t("netHouseStatus.lunchSaveError"));
    setSavedNetHouseStatusRecord(result.record);
    render();
  } catch (error) {
    alert(`${t("netHouseStatus.lunchSaveError")}：${error.message}`);
    render();
  } finally {
    lunchInput.disabled = false;
  }
}

function activeNetHouseStatusCropItems(record = netHouseStatusActiveRecord()) {
  if (Array.isArray(record?.cropItems) && record.cropItems.length) return record.cropItems;
  const cropName = String(record?.cropName || "").trim();
  return cropName ? [{
    cropName,
    harvestDate: String(record?.harvestDate || ""),
    estimatedQuantity: record?.destroyed ? "0" : record?.estimatedQuantity ?? "",
    harvestQuantity: record?.destroyed ? "0" : record?.harvestQuantity ?? "",
    destroyed: Boolean(record?.destroyed),
  }] : [];
}

function collectNetHouseStatusCropItems(activeRecord = netHouseStatusActiveRecord()) {
  return activeNetHouseStatusCropItems(activeRecord).map((item, index) => {
    const harvestDateInput = document.querySelector(`[data-net-house-harvest-date="${index}"]`);
    const estimatedQuantityInput = document.querySelector(`[data-net-house-estimated-quantity="${index}"]`);
    const harvestQuantityInput = document.querySelector(`[data-net-house-harvest-quantity="${index}"]`);
    const destroyedInput = document.querySelector(`[data-net-house-destroyed="${index}"]`);
    const destroyed = Boolean(destroyedInput?.checked);
    return {
      cropName: item.cropName,
      harvestDate: harvestDateInput ? String(harvestDateInput.value || "") : String(item.harvestDate || ""),
      estimatedQuantity: destroyed ? "0" : String(estimatedQuantityInput?.value ?? item.estimatedQuantity ?? "").trim(),
      harvestQuantity: destroyed ? "0" : String(harvestQuantityInput?.value ?? item.harvestQuantity ?? "").trim(),
      destroyed,
    };
  });
}

function netHouseStatusRecordWithCropItems(record, cropItems) {
  const firstCrop = Array.isArray(cropItems) ? cropItems[0] : null;
  return {
    ...record,
    cropName: firstCrop?.cropName || record.cropName || "",
    harvestDate: firstCrop?.harvestDate || "",
    estimatedQuantity: firstCrop?.destroyed ? "0" : firstCrop?.estimatedQuantity ?? "",
    harvestQuantity: firstCrop?.destroyed ? "0" : firstCrop?.harvestQuantity ?? "",
    destroyed: Boolean(firstCrop?.destroyed),
    cropItems: Array.isArray(cropItems) ? cropItems : [],
  };
}

async function addNetHouseStatusHarvestPeriod(index) {
  const activeRecord = netHouseStatusActiveRecord();
  if (activeRecord.status !== "種植" || !activeRecord.recordDate) return;
  const previousRecord = netHouseStatusRecordWithCropItems(activeRecord, activeNetHouseStatusCropItems(activeRecord));
  const cropItems = collectNetHouseStatusCropItems(activeRecord);
  const sourceItem = cropItems[index] || activeNetHouseStatusCropItems(activeRecord)[index];
  const cropName = String(sourceItem?.cropName || "").trim();
  if (!cropName) return;
  cropItems.splice(index + 1, 0, {
    cropName,
    harvestDate: "",
    estimatedQuantity: "",
    harvestQuantity: "",
    destroyed: false,
  });
  setSavedNetHouseStatusRecord(netHouseStatusRecordWithCropItems(activeRecord, cropItems));
  render();
  const ok = await saveNetHouseStatusDetails(cropItems, { renderAfterSave: true });
  if (!ok) {
    setSavedNetHouseStatusRecord(previousRecord);
    render();
  }
}

async function removeNetHouseStatusHarvestPeriod(index) {
  const activeRecord = netHouseStatusActiveRecord();
  if (activeRecord.status !== "種植" || !activeRecord.recordDate) return;
  const previousRecord = netHouseStatusRecordWithCropItems(activeRecord, activeNetHouseStatusCropItems(activeRecord));
  const cropItems = collectNetHouseStatusCropItems(activeRecord);
  const cropName = String(cropItems[index]?.cropName || "").trim();
  if (!cropName) return;
  const sameCropCount = cropItems.filter((item) => String(item?.cropName || "").trim() === cropName).length;
  if (sameCropCount <= 1) return;
  cropItems.splice(index, 1);
  setSavedNetHouseStatusRecord(netHouseStatusRecordWithCropItems(activeRecord, cropItems));
  render();
  const ok = await saveNetHouseStatusDetails(cropItems, { renderAfterSave: true });
  if (!ok) {
    setSavedNetHouseStatusRecord(previousRecord);
    render();
  }
}

function netHouseStatusDayCountText(plantedDate, harvestDate) {
  const planted = parseDateValue(plantedDate);
  const harvest = parseDateValue(harvestDate);
  if (!planted || !harvest) return "";
  if (harvest.getTime() < planted.getTime()) return "";
  const days = Math.round((harvest.getTime() - planted.getTime()) / 86400000);
  return Number.isFinite(days) ? String(days) : "";
}

function netHouseStatusHarvestDateFromDayCount(plantedDate, rawDays) {
  const text = String(rawDays ?? "").trim();
  if (!/^\d+$/.test(text)) return "";
  const planted = parseDateValue(plantedDate);
  const days = Number(text);
  if (!planted || !Number.isSafeInteger(days)) return "";
  const harvest = new Date(planted);
  harvest.setDate(planted.getDate() + days);
  return isoDate(harvest);
}

function updateNetHouseStatusDayCount(index, plantedDate) {
  const harvestInput = document.querySelector(`[data-net-house-harvest-date="${index}"]`);
  const daysInput = document.querySelector(`[data-net-house-days="${index}"]`);
  if (!daysInput) return;
  daysInput.value = netHouseStatusDayCountText(plantedDate, harvestInput?.value || "");
}

function dailyVegetableCanonicalCropName(cropName) {
  const name = String(cropName || "").trim();
  return dailyVegetableCropAliases[name] || name;
}

function dailyVegetableCropKey(cropName) {
  return normalizeProductName(dailyVegetableCanonicalCropName(cropName));
}

function dailyVegetableDateRange(startDate = state.dailyVegetableDate || todayDate()) {
  const start = parseDateValue(startDate) || parseDateValue(todayDate());
  return Array.from({ length: dailyVegetableHorizonDays }, (_, offset) => {
    const current = new Date(start);
    current.setDate(start.getDate() + offset);
    return isoDate(current);
  });
}

function dailyVegetableDateLabel(date) {
  const parsed = parseDateValue(date);
  if (!parsed) return String(date || "");
  return `${parsed.getMonth() + 1}/${parsed.getDate()}(${dailyVegetableWeekdayLabels[parsed.getDay()]})`;
}

function dailyVegetableNetHouseLabel(entry) {
  const base = String(entry?.netHouseCode || "").trim() || String(entry?.zoneName || "").trim();
  return base && entry?.lunchMarked ? `${base} 午` : base;
}

function dailyVegetableFieldName(entry) {
  const normalizedZone = String(entry?.zoneName || "").trim().replace(/\s+/g, "").replaceAll("Ｆ", "F");
  if (normalizedZone.includes("三場F") || normalizedZone.includes("3F")) return "三場F";
  return harvestPickListFieldName(entry?.zoneName, entry?.netHouseCode);
}

function dailyVegetableFieldColorClassForField(fieldName) {
  const fieldColorClasses = {
    三場: "daily-vegetable-field-three",
    三場F: "daily-vegetable-field-three-f",
    四場: "daily-vegetable-field-four",
    五場: "daily-vegetable-field-five",
  };
  return fieldColorClasses[fieldName] || "";
}

function dailyVegetableEntryFieldColorClass(entry) {
  return dailyVegetableFieldColorClassForField(dailyVegetableFieldName(entry));
}

function dailyVegetableNetHouseLinkMarkup(entry) {
  const label = dailyVegetableNetHouseLabel(entry);
  const fieldClass = dailyVegetableEntryFieldColorClass(entry);
  const fieldClassAttr = fieldClass ? ` ${fieldClass}` : "";
  if (!label || !entry?.zoneName || !entry?.netHouseCode) {
    return fieldClass
      ? `<span class="daily-vegetable-net-house-label${fieldClassAttr}">${escapeHtml(label)}</span>`
      : escapeHtml(label);
  }
  const targetDate = entry.recordDate || entry.plantedDate || entry.date || todayDate();
  return `<button
    class="daily-vegetable-net-house-link${fieldClassAttr}"
    type="button"
    data-zone-name="${escapeAttribute(entry.zoneName)}"
    data-net-house-code="${escapeAttribute(entry.netHouseCode)}"
    data-record-date="${escapeAttribute(targetDate)}"
    title="前往網室狀態"
  >${escapeHtml(label)}</button>`;
}

function openNetHouseStatusFromDailyVegetableLink(button) {
  if (!button) return;
  const zoneName = String(button.dataset.zoneName || "").trim();
  const netHouseCode = String(button.dataset.netHouseCode || "").trim();
  if (!zoneName || !netHouseCode) return;
  if (state.page !== "netHouseStatusRecords" && !confirmDiscardUnsavedChanges()) return;
  state.netHouseStatusDate = todayDate();
  state.netHouseStatusZoneName = zoneName;
  state.netHouseStatusNetHouseCode = netHouseCode;
  state.fieldWorkMessageReturnPage = "";
  state.page = "netHouseStatusRecords";
  syncStoreHash();
  render();
}

function bindDailyVegetableNetHouseLinks() {
  document.querySelectorAll(".daily-vegetable-net-house-link").forEach((button) => {
    button.addEventListener("click", () => openNetHouseStatusFromDailyVegetableLink(button));
  });
}

function compareDailyVegetableEntry(a, b) {
  return compareZoneName(a.zoneName, b.zoneName)
    || compareNetHouseCodePart(netHouseCodeParts(a.netHouseCode).prefix, netHouseCodeParts(b.netHouseCode).prefix)
    || compareNetHouseCodePart(netHouseCodeParts(a.netHouseCode).suffix, netHouseCodeParts(b.netHouseCode).suffix)
    || String(a.cropName || "").localeCompare(String(b.cropName || ""), "zh-Hant", {
      numeric: true,
      sensitivity: "base",
    });
}

function dailyVegetableEntriesForDate(date) {
  const entriesByKey = new Map();
  latestNetHouseStatusRecordsForHarvestDate(date).forEach((record) => {
    activeNetHouseStatusCropItems(record).forEach((item) => {
      const cropName = String(item?.cropName || "").trim();
      if (!cropName || String(item?.harvestDate || "") !== date) return;
      const productName = dailyVegetableCanonicalCropName(cropName);
      const productKey = dailyVegetableEntryProductKey(productName);
      const entryKey = [
        date,
        record.zoneName,
        record.netHouseCode,
        productKey,
      ].join("|");
      const entry = {
        date,
        cropName,
        productName,
        productKey,
        zoneName: record.zoneName,
        netHouseCode: record.netHouseCode,
        plantedDate: record.plantedDate || record.recordDate || "",
        recordDate: record.recordDate || "",
        lunchMarked: Boolean(record.lunchMarked),
        quantity: item?.estimatedQuantity ?? "",
      };
      const existing = entriesByKey.get(entryKey);
      if (!existing || String(entry.recordDate || "") >= String(existing.recordDate || "")) {
        entriesByKey.set(entryKey, entry);
      }
    });
  });
  Object.values(savedDailyVegetableManualEntries).forEach((item) => {
    if (String(item?.harvestDate || "") !== date) return;
    const cropName = String(item?.cropName || "").trim();
    const netHouseCode = String(item?.netHouseCode || "").trim();
    if (!cropName || !netHouseCode) return;
    const productName = dailyVegetableCanonicalCropName(cropName);
    const productKey = dailyVegetableEntryProductKey(productName);
    entriesByKey.set(`manual|${item.id}`, {
      id: item.id,
      date,
      cropName,
      productName,
      productKey,
      zoneName: "",
      netHouseCode,
      plantedDate: "",
      recordDate: "",
      lunchMarked: false,
      quantity: item?.quantity ?? "",
      source: "manual",
    });
  });
  return [...entriesByKey.values()].sort(compareDailyVegetableEntry);
}

function dailyVegetableProductRankMap() {
  return new Map(dailyVegetableProducts().map((product, index) => [productFilterKey(product), index]));
}

function dailyVegetableProductRank(productRank, productKey) {
  return productRank.has(productKey) ? productRank.get(productKey) : Number.MAX_SAFE_INTEGER;
}

function compareDailyVegetableProductRow(productRank, a, b) {
  return dailyVegetableProductRank(productRank, a.productKey) - dailyVegetableProductRank(productRank, b.productKey)
    || String(a.productName || "").localeCompare(String(b.productName || ""), "zh-Hant", {
      numeric: true,
      sensitivity: "base",
    });
}

function dailyVegetableModel(startDate = state.dailyVegetableDate || todayDate()) {
  const dates = dailyVegetableDateRange(startDate);
  const groupMap = new Map();
  const totals = new Map(dates.map((date) => [date, { quantity: 0, count: 0 }]));

  dates.forEach((date) => {
    dailyVegetableEntriesForDate(date).forEach((entry) => {
      if (!entry.productKey) return;
      if (!groupMap.has(entry.productKey)) {
        groupMap.set(entry.productKey, {
          productKey: entry.productKey,
          productName: entry.productName,
          dates: {},
        });
      }
      const group = groupMap.get(entry.productKey);
      group.dates[date] ||= [];
      group.dates[date].push(entry);
    });
  });

  const productRank = dailyVegetableProductRankMap();
  const productRows = [...groupMap.values()]
    .map((group) => ({
      productKey: group.productKey,
      productName: group.productName,
    }))
    .sort((a, b) => compareDailyVegetableProductRow(productRank, a, b));

  let entryCount = 0;
  productRows.forEach((product) => {
    const group = groupMap.get(product.productKey);
    dates.forEach((date) => {
      (group?.dates?.[date] || []).forEach((entry) => {
        const total = totals.get(date);
        const quantity = Number(entry.quantity);
        if (Number.isFinite(quantity)) total.quantity += quantity;
        total.count += 1;
        entryCount += 1;
      });
    });
  });

  return { dates, groupMap, productRows, totals, entryCount };
}

function dailyVegetableQuantityText(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const numeric = Number(text);
  return Number.isFinite(numeric) ? format.format(numeric) : escapeHtml(text);
}

function dailyVegetableLotCellMarkup(entry, boundaryClass = "") {
  const fieldClass = entry ? dailyVegetableEntryFieldColorClass(entry) : "";
  const fieldClassAttr = fieldClass ? ` ${fieldClass}` : "";
  return `<td class="daily-vegetable-lot-cell${boundaryClass}${fieldClassAttr}">${entry ? dailyVegetableNetHouseLinkMarkup(entry) : ""}</td>`;
}

function dailyVegetableQtyCellMarkup(entry) {
  return `<td class="daily-vegetable-qty-cell">${entry ? dailyVegetableQuantityText(entry.quantity) : ""}</td>`;
}

function dailyVegetableProductRowsMarkup(product, model, productIndex = 0) {
  const group = model.groupMap.get(product.productKey);
  const itemsByDate = new Map(
    model.dates.map((date) => [date, [...(group?.dates?.[date] || [])].sort(compareDailyVegetableEntry)]),
  );
  const rowCount = Math.max(1, ...[...itemsByDate.values()].map((items) => items.length));
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const rowClass = rowIndex === 0 && productIndex > 0 ? ' class="daily-vegetable-product-boundary"' : "";
    const cells = model.dates.map((date, dateIndex) => {
      const boundaryClass = dateIndex > 0 ? " daily-vegetable-date-boundary" : "";
      const entry = itemsByDate.get(date)?.[rowIndex] || null;
      return `${dailyVegetableLotCellMarkup(entry, boundaryClass)}${dailyVegetableQtyCellMarkup(entry)}`;
    }).join("");
    const productCell = rowIndex === 0
      ? `<th class="daily-vegetable-product-cell" rowspan="${rowCount}">${escapeHtml(product.productName)}</th>`
      : "";
    return `<tr${rowClass}>
      ${productCell}
      ${cells}
    </tr>`;
  }).join("");
}

function dailyVegetableTotalsRowMarkup(model) {
  const cells = model.dates.map((date, index) => {
    const total = model.totals.get(date) || { quantity: 0, count: 0 };
    const boundaryClass = index > 0 ? " daily-vegetable-date-boundary" : "";
    return `<td class="daily-vegetable-total-count${boundaryClass}"></td>
      <td class="daily-vegetable-total-qty">${total.count ? format.format(total.quantity) : ""}</td>`;
  }).join("");
  return `<tr class="daily-vegetable-total-row">
    <th class="daily-vegetable-total-label">小計</th>
    ${cells}
  </tr>`;
}

function dailyVegetableTableMarkup(model) {
  const headerDates = model.dates
    .map((date, index) => `<th class="daily-vegetable-date-head${index > 0 ? " daily-vegetable-date-boundary" : ""}" colspan="2">${escapeHtml(dailyVegetableDateLabel(date))}</th>`)
    .join("");
  const rows = model.productRows.length
    ? model.productRows.map((product, index) => dailyVegetableProductRowsMarkup(product, model, index)).join("")
    : `<tr><td class="daily-vegetable-empty" colspan="${1 + model.dates.length * 2}">這 14 天沒有採收品項</td></tr>`;
  return `<div class="daily-vegetable-table-scroll">
    <table class="daily-vegetable-table">
      <thead>
        <tr>
          <th class="daily-vegetable-product-head">作物</th>
          ${headerDates}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>${dailyVegetableTotalsRowMarkup(model)}</tfoot>
    </table>
  </div>`;
}

function dailyVegetableManualEntriesForDates(dates) {
  const dateSet = new Set(dates);
  return Object.values(savedDailyVegetableManualEntries)
    .filter((entry) => dateSet.has(String(entry.harvestDate || "")))
    .sort((a, b) =>
      String(a.harvestDate || "").localeCompare(String(b.harvestDate || ""))
      || String(a.netHouseCode || "").localeCompare(String(b.netHouseCode || ""), "zh-Hant", {
        numeric: true,
        sensitivity: "base",
      })
      || String(a.cropName || "").localeCompare(String(b.cropName || ""), "zh-Hant", {
        numeric: true,
        sensitivity: "base",
      })
      || Number(a.id || 0) - Number(b.id || 0),
    );
}

function dailyVegetableManualProductOptionsMarkup() {
  const names = uniqueStrings([
    ...dailyVegetableProducts().map((product) => product.productName),
    ...Object.values(savedDailyVegetableManualEntries).map((entry) => entry.cropName),
  ].filter(Boolean));
  return `<datalist id="dailyVegetableManualCropOptions">
    ${names.map((name) => `<option value="${escapeAttribute(name)}"></option>`).join("")}
  </datalist>`;
}

function dailyVegetableManualFormMarkup() {
  const editingEntry = savedDailyVegetableManualEntries[String(state.dailyVegetableManualEditingId || "")] || null;
  const isEditing = Boolean(editingEntry);
  const harvestDate = editingEntry?.harvestDate || state.dailyVegetableDate || todayDate();
  const cropName = editingEntry?.cropName || "";
  const netHouseCode = editingEntry?.netHouseCode || "";
  const quantity = editingEntry?.quantity || "";
  return `<form id="dailyVegetableManualForm" class="daily-vegetable-manual-form">
    ${dailyVegetableManualProductOptionsMarkup()}
    <label>
      <span>${escapeHtml(t("dailyVegetable.manualDate"))}</span>
      <input id="dailyVegetableManualDateInput" type="date" value="${escapeAttribute(harvestDate)}" required />
    </label>
    <label>
      <span>${escapeHtml(t("dailyVegetable.manualCrop"))}</span>
      <input id="dailyVegetableManualCropInput" type="text" list="dailyVegetableManualCropOptions" value="${escapeAttribute(cropName)}" autocomplete="off" required />
    </label>
    <label>
      <span>${escapeHtml(t("dailyVegetable.manualSource"))}</span>
      <input id="dailyVegetableManualNetHouseInput" type="text" value="${escapeAttribute(netHouseCode)}" autocomplete="off" required />
    </label>
    <label>
      <span>${escapeHtml(t("dailyVegetable.manualQuantity"))}</span>
      <input id="dailyVegetableManualQuantityInput" type="number" min="0" step="0.1" inputmode="decimal" value="${escapeAttribute(quantity)}" required />
    </label>
    <div class="daily-vegetable-manual-form-actions">
      <button id="saveDailyVegetableManualBtn" type="submit">${escapeHtml(t(isEditing ? "dailyVegetable.manualUpdate" : "dailyVegetable.manualSave"))}</button>
      <button id="cancelDailyVegetableManualBtn" type="button">${escapeHtml(t("dailyVegetable.manualCancel"))}</button>
    </div>
  </form>`;
}

function dailyVegetableManualEntriesMarkup(model) {
  const entries = dailyVegetableManualEntriesForDates(model.dates);
  if (!entries.length) return `<section class="daily-vegetable-manual-list">
    <h3>${escapeHtml(t("dailyVegetable.manualListTitle"))}</h3>
    <p class="daily-vegetable-manual-empty">${escapeHtml(t("dailyVegetable.manualEmpty"))}</p>
  </section>`;
  const rows = entries.map((entry) => `<tr>
    <td>${escapeHtml(formatDateShort(entry.harvestDate) || entry.harvestDate)}</td>
    <td>${escapeHtml(entry.netHouseCode)}</td>
    <td>${escapeHtml(entry.cropName)}</td>
    <td class="num">${dailyVegetableQuantityText(entry.quantity)}</td>
    <td class="daily-vegetable-manual-action-cell">
      <div class="daily-vegetable-manual-row-actions">
        <button class="daily-vegetable-manual-edit-btn" type="button" data-edit-daily-vegetable-manual="${escapeAttribute(entry.id)}">${escapeHtml(t("dailyVegetable.manualEdit"))}</button>
        <button class="daily-vegetable-manual-delete-btn" type="button" data-delete-daily-vegetable-manual="${escapeAttribute(entry.id)}">${escapeHtml(t("dailyVegetable.manualDelete"))}</button>
      </div>
    </td>
  </tr>`).join("");
  return `<section class="daily-vegetable-manual-list">
    <h3>${escapeHtml(t("dailyVegetable.manualListTitle"))}</h3>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(t("dailyVegetable.manualDate"))}</th>
          <th>${escapeHtml(t("dailyVegetable.manualSource"))}</th>
          <th>${escapeHtml(t("dailyVegetable.manualCrop"))}</th>
          <th>${escapeHtml(t("dailyVegetable.manualQuantity"))}</th>
          <th class="daily-vegetable-manual-action-head"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function dailyVegetableManualControlsMarkup(model) {
  const modal = state.dailyVegetableManualFormOpen
    ? `<div class="modal daily-vegetable-manual-modal">
      <div class="modal-backdrop" data-close-daily-vegetable-manual="true"></div>
      <div class="modal-card daily-vegetable-manual-modal-card">
        <div class="modal-header">
          <h2>${escapeHtml(t("dailyVegetable.manualAdd"))}</h2>
          <button type="button" data-close-daily-vegetable-manual="true">${escapeHtml(t("dailyVegetable.manualClose"))}</button>
        </div>
        <div class="daily-vegetable-manual-modal-content">
          ${dailyVegetableManualFormMarkup()}
          ${dailyVegetableManualEntriesMarkup(model)}
        </div>
      </div>
    </div>`
    : "";
  return `<section class="daily-vegetable-manual-panel">
    <div class="daily-vegetable-manual-topbar">
      <button id="openDailyVegetableManualFormBtn" type="button">${escapeHtml(t("dailyVegetable.manualAdd"))}</button>
    </div>
    ${modal}
  </section>`;
}

function collectDailyVegetableManualFormPayload() {
  const harvestDateInput = byId("dailyVegetableManualDateInput");
  const cropInput = byId("dailyVegetableManualCropInput");
  const netHouseInput = byId("dailyVegetableManualNetHouseInput");
  const quantityInput = byId("dailyVegetableManualQuantityInput");
  const harvestDate = String(harvestDateInput?.value || "").trim();
  const cropName = String(cropInput?.value || "").trim();
  const netHouseCode = String(netHouseInput?.value || "").trim();
  const quantity = String(quantityInput?.value || "").trim();
  if (!harvestDate) {
    alert(t("dailyVegetable.manualDateRequired"));
    harvestDateInput?.focus?.();
    return null;
  }
  if (!cropName) {
    alert(t("dailyVegetable.manualCropRequired"));
    cropInput?.focus?.();
    return null;
  }
  if (!netHouseCode) {
    alert(t("dailyVegetable.manualSourceRequired"));
    netHouseInput?.focus?.();
    return null;
  }
  if (!quantity) {
    alert(t("dailyVegetable.manualQuantityRequired"));
    quantityInput?.focus?.();
    return null;
  }
  const numericQuantity = Number(quantity);
  if (!Number.isFinite(numericQuantity) || numericQuantity < 0) {
    alert(t("dailyVegetable.manualQuantityInvalid"));
    quantityInput?.focus?.();
    return null;
  }
  return { harvestDate, cropName, netHouseCode, quantity };
}

async function saveDailyVegetableManualEntry(event) {
  event.preventDefault();
  const payload = collectDailyVegetableManualFormPayload();
  if (!payload) return;
  const entryId = String(state.dailyVegetableManualEditingId || "");
  const button = byId("saveDailyVegetableManualBtn");
  if (button) button.disabled = true;
  try {
    const response = await fetch(
      entryId ? `/api/daily-vegetable-manual-entries/${encodeURIComponent(entryId)}` : "/api/daily-vegetable-manual-entries",
      {
        method: entryId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || t("dailyVegetable.manualSaveError"));
    const normalized = normalizeDailyVegetableManualEntries([result.entry]);
    Object.assign(savedDailyVegetableManualEntries, normalized);
    state.dailyVegetableDate = result.entry.harvestDate || state.dailyVegetableDate;
    state.dailyVegetableManualFormOpen = true;
    state.dailyVegetableManualEditingId = "";
    render();
  } catch (error) {
    alert(`${t("dailyVegetable.manualSaveError")}：${error.message}`);
  } finally {
    if (button) button.disabled = false;
  }
}

function startDailyVegetableManualEntryEdit(entryId) {
  if (!savedDailyVegetableManualEntries[String(entryId)]) return;
  state.dailyVegetableManualEditingId = String(entryId);
  state.dailyVegetableManualFormOpen = true;
  render();
  byId("dailyVegetableManualDateInput")?.focus?.();
}

function closeDailyVegetableManualModal() {
  state.dailyVegetableManualEditingId = "";
  state.dailyVegetableManualFormOpen = false;
  render();
}

async function deleteDailyVegetableManualEntry(entryId) {
  if (!confirm(t("dailyVegetable.manualDeleteConfirm"))) return;
  try {
    const response = await fetch(`/api/daily-vegetable-manual-entries/${encodeURIComponent(entryId)}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || t("dailyVegetable.manualDeleteError"));
    delete savedDailyVegetableManualEntries[String(entryId)];
    if (String(state.dailyVegetableManualEditingId || "") === String(entryId)) {
      state.dailyVegetableManualEditingId = "";
      state.dailyVegetableManualFormOpen = false;
    }
    render();
  } catch (error) {
    alert(`${t("dailyVegetable.manualDeleteError")}：${error.message}`);
  }
}

function bindDailyVegetableManualControls() {
  byId("openDailyVegetableManualFormBtn")?.addEventListener("click", () => {
    state.dailyVegetableManualEditingId = "";
    state.dailyVegetableManualFormOpen = true;
    render();
    byId("dailyVegetableManualDateInput")?.focus?.();
  });
  byId("dailyVegetableManualForm")?.addEventListener("submit", saveDailyVegetableManualEntry);
  byId("cancelDailyVegetableManualBtn")?.addEventListener("click", () => {
    closeDailyVegetableManualModal();
  });
  document.querySelectorAll("[data-close-daily-vegetable-manual='true']").forEach((item) => {
    item.addEventListener("click", closeDailyVegetableManualModal);
  });
  document.querySelectorAll("[data-edit-daily-vegetable-manual]").forEach((button) => {
    button.addEventListener("click", () => startDailyVegetableManualEntryEdit(button.dataset.editDailyVegetableManual));
  });
  document.querySelectorAll("[data-delete-daily-vegetable-manual]").forEach((button) => {
    button.addEventListener("click", () => deleteDailyVegetableManualEntry(button.dataset.deleteDailyVegetableManual));
  });
}

function harvestPickListFieldName(zoneName, netHouseCode = "") {
  const normalizedZone = String(zoneName || "").trim().replace(/\s+/g, "").replaceAll("Ｆ", "F");
  if (normalizedZone.includes("一場") || normalizedZone.includes("1場")) return "一場";
  if (normalizedZone.includes("二場") || normalizedZone.includes("2場")) return "二場";
  if (normalizedZone.includes("三場") || normalizedZone.includes("3場") || normalizedZone.includes("3F")) return "三場";
  if (normalizedZone.includes("四場") || normalizedZone.includes("4場")) return "四場";
  if (normalizedZone.includes("五場") || normalizedZone.includes("5場")) return "五場";
  const prefix = netHouseCodeParts(netHouseCode).prefix;
  if (prefix === "1") return "一場";
  if (prefix === "2") return "二場";
  if (prefix === "3") return "三場";
  if (prefix === "4") return "四場";
  if (prefix === "5") return "五場";
  return "";
}

function harvestPickListEmptyFieldBuckets() {
  return Object.fromEntries(
    harvestPickListFieldLabels.map((label) => [label, { entries: [], quantity: 0 }]),
  );
}

function harvestPickListQuantityValue(value) {
  const quantity = Number(value);
  return Number.isFinite(quantity) ? quantity : 0;
}

function harvestPickListQuantityText(value, blankZero = false) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || (blankZero && !quantity)) return "";
  return format.format(quantity);
}

function harvestPickListModel(date = state.harvestPickListDate || todayDate()) {
  const productRank = dailyVegetableProductRankMap();
  const rowsByProduct = new Map();
  const totals = Object.fromEntries(harvestPickListFieldLabels.map((label) => [label, 0]));
  let lunchTotal = 0;
  let entryCount = 0;

  dailyVegetableEntriesForDate(date).forEach((entry) => {
    if (entry.source === "manual") return;
    const fieldName = harvestPickListFieldName(entry.zoneName, entry.netHouseCode);
    if (!fieldName) return;
    const productKey = entry.productKey || dailyVegetableEntryProductKey(entry.productName || entry.cropName);
    if (!rowsByProduct.has(productKey)) {
      rowsByProduct.set(productKey, {
        productKey,
        productName: entry.productName || entry.cropName || "",
        fields: harvestPickListEmptyFieldBuckets(),
        lunchQuantity: 0,
      });
    }
    const row = rowsByProduct.get(productKey);
    const quantity = harvestPickListQuantityValue(entry.quantity);
    row.fields[fieldName].entries.push(entry);
    row.fields[fieldName].quantity += quantity;
    totals[fieldName] += quantity;
    if (entry.lunchMarked) {
      row.lunchQuantity += quantity;
      lunchTotal += quantity;
    }
    entryCount += 1;
  });

  const rows = [...rowsByProduct.values()].sort((a, b) => compareDailyVegetableProductRow(productRank, a, b));

  return { date, rows, totals, lunchTotal, entryCount };
}

function harvestPickListNetHouseMarkup(entry) {
  const label = dailyVegetableNetHouseLabel(entry);
  if (!label) return "";
  const targetDate = entry.recordDate || entry.plantedDate || entry.date || state.harvestPickListDate || todayDate();
  const classes = `daily-vegetable-net-house-link harvest-pick-list-net-house-link${entry.lunchMarked ? " is-lunch" : ""}`;
  if (!entry.zoneName || !entry.netHouseCode) {
    return `<span class="${entry.lunchMarked ? "harvest-pick-list-lunch-text" : ""}">${escapeHtml(label)}</span>`;
  }
  return `<button
    class="${classes}"
    type="button"
    data-zone-name="${escapeAttribute(entry.zoneName)}"
    data-net-house-code="${escapeAttribute(entry.netHouseCode)}"
    data-record-date="${escapeAttribute(targetDate)}"
    title="前往網室狀態"
  >${escapeHtml(label)}</button>`;
}

function harvestPickListNetHouseCellMarkup(entries) {
  const seen = new Set();
  return [...entries]
    .sort(compareDailyVegetableEntry)
    .map((entry) => {
      const key = `${entry.zoneName || ""}|${entry.netHouseCode || ""}|${entry.lunchMarked ? "1" : "0"}`;
      if (seen.has(key)) return "";
      seen.add(key);
      return harvestPickListNetHouseMarkup(entry);
    })
    .filter(Boolean)
    .join("<br />");
}

function harvestPickListRowMarkup(row) {
  const fieldNetHouseCells = harvestPickListFieldLabels
    .map((fieldName) => `<td class="harvest-pick-list-net-cell">${harvestPickListNetHouseCellMarkup(row.fields[fieldName].entries)}</td>`)
    .join("");
  const fieldQuantityCells = harvestPickListFieldLabels
    .map((fieldName) => `<td class="harvest-pick-list-qty-cell">${harvestPickListQuantityText(row.fields[fieldName].quantity, true)}</td>`)
    .join("");
  return `<tr>
    ${fieldNetHouseCells}
    <th class="harvest-pick-list-product-cell">${escapeHtml(row.productName)}</th>
    ${fieldQuantityCells}
    <td class="harvest-pick-list-lunch-cell">${harvestPickListQuantityText(row.lunchQuantity, true)}</td>
  </tr>`;
}

function harvestPickListTableMarkup(model) {
  const rows = model.rows.length
    ? model.rows.map(harvestPickListRowMarkup).join("")
    : `<tr><td class="harvest-pick-list-empty" colspan="12">當天沒有採收品項</td></tr>`;
  const totals = harvestPickListFieldLabels
    .map((fieldName) => `<td class="harvest-pick-list-qty-cell">${harvestPickListQuantityText(model.totals[fieldName], true)}</td>`)
    .join("");
  return `<div class="harvest-pick-list-table-scroll">
    <table class="harvest-pick-list-table">
      <colgroup>
        <col class="harvest-pick-list-net-col" />
        <col class="harvest-pick-list-net-col" />
        <col class="harvest-pick-list-net-col" />
        <col class="harvest-pick-list-net-col" />
        <col class="harvest-pick-list-net-col" />
        <col class="harvest-pick-list-product-col" />
        <col class="harvest-pick-list-qty-col" />
        <col class="harvest-pick-list-qty-col" />
        <col class="harvest-pick-list-qty-col" />
        <col class="harvest-pick-list-qty-col" />
        <col class="harvest-pick-list-qty-col" />
        <col class="harvest-pick-list-lunch-col" />
      </colgroup>
      <thead>
        <tr>
          ${harvestPickListFieldLabels.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}
          <th>品項</th>
          ${harvestPickListFieldLabels.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}
          <th>午餐</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          ${harvestPickListFieldLabels.map(() => "<td></td>").join("")}
          <th>小計</th>
          ${totals}
          <td class="harvest-pick-list-lunch-cell">${harvestPickListQuantityText(model.lunchTotal, true)}</td>
        </tr>
      </tfoot>
    </table>
  </div>`;
}

function renderHarvestPickListPage() {
  if (!state.harvestPickListDate) state.harvestPickListDate = todayDate();
  const model = harvestPickListModel(state.harvestPickListDate);
  byId("viewTitle").innerHTML = "";
  byId("tableHost").innerHTML = `<section class="harvest-pick-list-panel">
    <div class="harvest-pick-list-toolbar">
      <label class="harvest-pick-list-date-control">
        <span>採收日期</span>
        <input id="harvestPickListDateInput" type="date" value="${escapeAttribute(state.harvestPickListDate)}" />
      </label>
    </div>
    ${harvestPickListTableMarkup(model)}
  </section>`;
  byId("harvestPickListDateInput")?.addEventListener("change", (event) => {
    state.harvestPickListDate = event.target.value || todayDate();
    render();
  });
  bindDailyVegetableNetHouseLinks();
}

function dailyVegetableExportFilename(startDate) {
  return `${startDate || "未選擇日期"}_每日菜量表.xlsx`;
}

function dailyVegetableExportPayload() {
  if (!state.dailyVegetableDate) state.dailyVegetableDate = todayDate();
  const model = dailyVegetableModel();
  return {
    startDate: state.dailyVegetableDate,
    dates: model.dates.map((date) => ({
      date,
      label: dailyVegetableDateLabel(date),
    })),
    rows: model.productRows.map((product) => {
      const group = model.groupMap.get(product.productKey);
      return {
        productKey: product.productKey,
        productName: product.productName,
        cells: model.dates.map((date) => {
          const items = [...(group?.dates?.[date] || [])].sort(compareDailyVegetableEntry);
          return {
            date,
            items: items.map((entry) => ({
              lot: dailyVegetableNetHouseLabel(entry),
              quantity: String(entry.quantity ?? "").trim(),
              zoneName: entry.zoneName || "",
              netHouseCode: entry.netHouseCode || "",
              cropName: entry.cropName || entry.productName || "",
              fieldName: dailyVegetableFieldName(entry),
            })),
          };
        }),
      };
    }),
    totals: model.dates.map((date) => {
      const total = model.totals.get(date) || { quantity: 0, count: 0 };
      return {
        date,
        count: n(total.count),
        quantity: n(total.quantity),
      };
    }),
    entryCount: model.entryCount,
  };
}

async function exportDailyVegetableExcel() {
  const payload = dailyVegetableExportPayload();
  if (!payload.rows.length) {
    alert("目前沒有可匯出的作物列。");
    return;
  }
  const button = byId("dailyVegetableExportBtn");
  if (button) button.disabled = true;
  try {
    const response = await fetch("/api/export-daily-vegetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let message = "匯出 Excel 失敗";
      try {
        const result = await response.json();
        if (result?.error) message = result.error;
      } catch {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = dailyVegetableExportFilename(payload.startDate);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert(`匯出 Excel 失敗：${error.message}`);
  } finally {
    if (button) button.disabled = false;
  }
}

function renderDailyVegetableAvailabilityPage() {
  if (!state.dailyVegetableDate) state.dailyVegetableDate = todayDate();
  const model = dailyVegetableModel();
  byId("viewTitle").innerHTML = "";
  byId("tableHost").innerHTML = `<section class="daily-vegetable-panel">
    ${dailyVegetableManualControlsMarkup(model)}
    ${dailyVegetableTableMarkup(model)}
  </section>`;
  bindDailyVegetableManualControls();
  bindDailyVegetableNetHouseLinks();
}

async function saveFieldWorkRecords() {
  const checkboxes = [...document.querySelectorAll(".field-work-task-input")];
  const taskKeys = checkboxes.filter((input) => input.checked).map((input) => input.value);
  const fertilizerInput = byId("fieldWorkFertilizerBagCountInput");
  const seedlingTransplantCropControls = [
    ...document.querySelectorAll(".field-work-seedling-transplant-crop-select, .field-work-seedling-transplant-tray-input, .field-work-seedling-transplant-crop-action"),
  ];
  const fertilizerBagCount = taskKeys.includes("soilPreparationTractorClean")
    ? String(fertilizerInput?.value || "").trim()
    : "";
  const directSowCrop = fieldWorkDirectSowCrop();
  const directSowCropKey = taskKeys.includes("directSow") && directSowCrop
    ? productFilterKey(directSowCrop)
    : "";
  const directSowCropName = taskKeys.includes("directSow") ? "空心菜" : "";
  if (!validateFieldWorkFertilizerInput()) return;
  const seedlingTransplantValidation = taskKeys.includes("seedlingTransplant")
    ? validateFieldWorkSeedlingTransplantInputs()
    : { ok: true, cropItems: [] };
  if (!seedlingTransplantValidation.ok) return;
  const seedlingTransplantCropItems = seedlingTransplantValidation.cropItems;
  const seedlingTransplantCropKey = seedlingTransplantCropItems[0]?.cropKey || "";
  const seedlingTransplantCropName = seedlingTransplantCropItems[0]?.cropName || "";
  if (!state.fieldWorkDate || !state.fieldWorkZoneName || !state.fieldWorkNetHouseCode) return;
  checkboxes.forEach((input) => {
    input.disabled = true;
  });
  if (fertilizerInput) fertilizerInput.disabled = true;
  seedlingTransplantCropControls.forEach((control) => {
    control.disabled = true;
  });
  try {
    const response = await fetch("/api/field-work-records", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workDate: state.fieldWorkDate,
        zoneName: state.fieldWorkZoneName,
        netHouseCode: state.fieldWorkNetHouseCode,
        taskKeys,
        fertilizerBagCount,
        directSowCropKey,
        directSowCropName,
        seedlingTransplantCropKey,
        seedlingTransplantCropName,
        seedlingTransplantCropItems,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || t("fieldWork.saveError"));
    const savedAccountName = String(
      (Array.isArray(result.tasks) ? result.tasks.find((task) => task?.accountName)?.accountName : "")
      || currentUser?.displayName
      || currentUser?.username
      || "",
    ).trim();
    savedFieldWorkRecords[fieldWorkRecordKey()] = {
      taskKeys,
      fertilizerBagCount,
      directSowCropKey,
      directSowCropName,
      seedlingTransplantCropKey,
      seedlingTransplantCropName,
      seedlingTransplantCropItems,
      accountName: savedAccountName,
      accountNames: savedAccountName ? [savedAccountName] : [],
    };
    const statusKey = netHouseStatusRecordKey(
      result.netHouseStatusRecordDate || state.fieldWorkDate,
      state.fieldWorkZoneName,
      state.fieldWorkNetHouseCode,
    );
    if (result.netHouseStatusRecord) {
      setSavedNetHouseStatusRecord(result.netHouseStatusRecord);
    } else if (
      savedNetHouseStatusRecords[statusKey]?.status === "種植"
      && savedNetHouseStatusRecords[statusKey]?.plantedDate === (result.netHouseStatusRecordDate || state.fieldWorkDate)
    ) {
      delete savedNetHouseStatusRecords[statusKey];
    }
  } catch (error) {
    alert(`${t("fieldWork.saveError")}：${error.message}`);
    render();
  } finally {
    checkboxes.forEach((input) => {
      input.disabled = false;
    });
    if (fertilizerInput) fertilizerInput.disabled = !byId("fieldWorkSoilPreparationInput")?.checked;
    const seedlingTransplantChecked = Boolean(byId("fieldWorkSeedlingTransplantInput")?.checked);
    seedlingTransplantCropControls.forEach((control) => {
      control.disabled = !seedlingTransplantChecked;
    });
  }
}

function fieldBtPackageOptions(selectedValue) {
  const selected = String(selectedValue || "");
  return [
    `<option value="">${escapeHtml(t("fieldBt.packagePlaceholder"))}</option>`,
    ...Array.from({ length: 30 }, (_, index) => {
      const value = String(index + 1);
      return `<option value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`;
    }),
  ].join("");
}

function selectedFieldBtRecord() {
  return savedFieldBtRecords[state.fieldBtDate] || {
    areaKeys: [],
    oneTwoPackageCount: "",
    sharedPackageCount: "",
  };
}

function fieldBtMonthSummaryExportFilename(month) {
  return `${month || t("fieldWork.unselectedMonth")}_${t("fieldBt.exportFilename")}.xlsx`;
}

async function exportFieldBtMonthSummaryExcel() {
  const month = monthKey(state.fieldBtDate || todayDate());
  if (!month) {
    alert(t("fieldWork.validDateRequired"));
    return;
  }
  const buttons = [byId("headerExportFieldBtMonthSummaryBtn"), byId("exportFieldBtMonthSummaryBtn")].filter(Boolean);
  buttons.forEach((button) => {
    button.disabled = true;
  });
  try {
    const response = await fetch("/api/export-field-bt-month-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month }),
    });
    if (!response.ok) {
      let message = t("fieldWork.exportError");
      try {
        const result = await response.json();
        if (result?.error) message = result.error;
      } catch {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fieldBtMonthSummaryExportFilename(month);
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert(`${t("fieldWork.exportError")}：${error.message}`);
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}

function emptyFieldWorkRecord() {
  return {
    taskKeys: [],
    fertilizerBagCount: "",
    directSowCropKey: "",
    directSowCropName: "",
    seedlingTransplantCropKey: "",
    seedlingTransplantCropName: "",
    seedlingTransplantCropItems: [],
    accountName: "",
    accountNames: [],
  };
}

function isEmptyFieldWorkRecord(record) {
  return !record.taskKeys.length
    && !record.fertilizerBagCount
    && !record.directSowCropKey
    && !record.directSowCropName
    && !record.seedlingTransplantCropKey
    && !record.seedlingTransplantCropName
    && !(Array.isArray(record.seedlingTransplantCropItems) && record.seedlingTransplantCropItems.length);
}

function applyFieldBtAutoFieldWorkRecords(workDate, areaKeys, previousAreaKeys = [], accountName = "") {
  const zoneNamesForAreaKeys = (keys) => new Set(
    (Array.isArray(keys) ? keys : []).flatMap((areaKey) => fieldBtAreaZoneNames[areaKey] || []),
  );
  const selectedZoneNames = zoneNamesForAreaKeys(areaKeys);
  const previousZoneNames = zoneNamesForAreaKeys(previousAreaKeys);
  const canceledZoneNames = new Set(
    [...previousZoneNames].filter((zoneName) => !selectedZoneNames.has(zoneName)),
  );
  if (!workDate || (!selectedZoneNames.size && !canceledZoneNames.size)) return;
  (Array.isArray(fieldNetHouseData?.zones) ? fieldNetHouseData.zones : []).forEach((zone) => {
    const zoneName = String(zone?.name || "");
    if (!selectedZoneNames.has(zoneName) && !canceledZoneNames.has(zoneName)) return;
    (Array.isArray(zone?.netHouses) ? zone.netHouses : []).forEach((house) => {
      const netHouseCode = String(house?.netHouseCode || "");
      if (!netHouseCode) return;
      const key = fieldWorkRecordKey(workDate, zoneName, netHouseCode);
      if (canceledZoneNames.has(zoneName) && savedFieldWorkRecords[key]) {
        savedFieldWorkRecords[key].taskKeys = savedFieldWorkRecords[key].taskKeys.filter((taskKey) => taskKey !== "bacillusThuringiensis");
        if (isEmptyFieldWorkRecord(savedFieldWorkRecords[key])) delete savedFieldWorkRecords[key];
      }
      if (selectedZoneNames.has(zoneName)) {
        if (!savedFieldWorkRecords[key]) savedFieldWorkRecords[key] = emptyFieldWorkRecord();
        if (!savedFieldWorkRecords[key].taskKeys.includes("bacillusThuringiensis")) {
          savedFieldWorkRecords[key].taskKeys.push("bacillusThuringiensis");
        }
        if (accountName) {
          if (!savedFieldWorkRecords[key].accountName) savedFieldWorkRecords[key].accountName = accountName;
          if (!Array.isArray(savedFieldWorkRecords[key].accountNames)) savedFieldWorkRecords[key].accountNames = [];
          if (!savedFieldWorkRecords[key].accountNames.includes(accountName)) savedFieldWorkRecords[key].accountNames.push(accountName);
        }
      }
    });
  });
}

async function saveFieldBtRecords() {
  const checkboxes = [...document.querySelectorAll(".field-bt-area-input")];
  const areaKeys = checkboxes.filter((input) => input.checked).map((input) => input.value);
  const oneTwoPackageSelect = byId("fieldBtOneTwoPackageSelect");
  const sharedPackageSelect = byId("fieldBtSharedPackageSelect");
  const workDate = state.fieldBtDate;
  const oneTwoPackageCount = areaKeys.includes("oneTwo") ? String(oneTwoPackageSelect?.value || "") : "";
  const sharedPackageCount = areaKeys.includes("three") || areaKeys.includes("five") || areaKeys.includes("four")
    ? String(sharedPackageSelect?.value || "")
    : "";
  if (!workDate) return;
  const previousAreaKeys = [...(savedFieldBtRecords[workDate]?.areaKeys || [])];
  checkboxes.forEach((input) => {
    input.disabled = true;
  });
  if (oneTwoPackageSelect) oneTwoPackageSelect.disabled = true;
  if (sharedPackageSelect) sharedPackageSelect.disabled = true;
  try {
    const response = await fetch("/api/field-bt-records", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workDate,
        areaKeys,
        oneTwoPackageCount,
        sharedPackageCount,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || t("fieldBt.saveError"));
    savedFieldBtRecords[workDate] = {
      areaKeys,
      oneTwoPackageCount,
      sharedPackageCount,
    };
    const accountName = String(currentUser?.displayName || currentUser?.username || "").trim();
    applyFieldBtAutoFieldWorkRecords(workDate, areaKeys, previousAreaKeys, accountName);
  } catch (error) {
    alert(`${t("fieldBt.saveError")}：${error.message}`);
    render();
  } finally {
    checkboxes.forEach((input) => {
      input.disabled = false;
    });
    if (oneTwoPackageSelect) oneTwoPackageSelect.disabled = !byId("fieldBtOneTwoInput")?.checked;
    if (sharedPackageSelect) {
      sharedPackageSelect.disabled = !byId("fieldBtThreeInput")?.checked && !byId("fieldBtFiveInput")?.checked && !byId("fieldBtFourInput")?.checked;
    }
  }
}

function renderFieldBtRecordsPage() {
  if (!state.fieldBtDate) state.fieldBtDate = todayDate();
  const record = selectedFieldBtRecord();
  const selectedAreaKeys = new Set(record.areaKeys || []);
  const oneTwoChecked = selectedAreaKeys.has("oneTwo");
  const sharedChecked = selectedAreaKeys.has("three") || selectedAreaKeys.has("five") || selectedAreaKeys.has("four");

  byId("viewTitle").innerHTML = "";
  byId("tableHost").innerHTML = `<section class="field-work-panel field-bt-records-panel">
    <div class="field-work-form field-bt-records-form">
      <div class="field-work-date-row">
        <label class="field-work-date-control">
          <span>${escapeHtml(t("fieldWork.date"))}</span>
          ${dateInputMarkup({ id: "fieldBtDateInput", value: state.fieldBtDate || todayDate() })}
        </label>
      </div>
      <div class="field-bt-task-grid">
        <div class="field-bt-task-with-detail">
          <label class="field-work-task-option">
            <input
              id="fieldBtOneTwoInput"
              class="field-bt-area-input"
              type="checkbox"
              value="oneTwo"
              ${oneTwoChecked ? "checked" : ""}
            />
            <span>${escapeHtml(t("fieldBt.area.oneTwo"))}</span>
          </label>
          <label class="field-bt-package-control">
            <span>${escapeHtml(t("fieldBt.packageCount"))}</span>
            <select id="fieldBtOneTwoPackageSelect" ${oneTwoChecked ? "" : "disabled"}>
              ${fieldBtPackageOptions(record.oneTwoPackageCount)}
            </select>
          </label>
        </div>
        <div class="field-bt-task-with-detail">
          <label class="field-work-task-option">
            <input
              id="fieldBtThreeInput"
              class="field-bt-area-input"
              type="checkbox"
              value="three"
              ${selectedAreaKeys.has("three") ? "checked" : ""}
            />
            <span>${escapeHtml(t("fieldBt.area.three"))}</span>
          </label>
          <label class="field-work-task-option">
            <input
              id="fieldBtFiveInput"
              class="field-bt-area-input"
              type="checkbox"
              value="five"
              ${selectedAreaKeys.has("five") ? "checked" : ""}
            />
            <span>${escapeHtml(t("fieldBt.area.five"))}</span>
          </label>
          <label class="field-work-task-option">
            <input
              id="fieldBtFourInput"
              class="field-bt-area-input"
              type="checkbox"
              value="four"
              ${selectedAreaKeys.has("four") ? "checked" : ""}
            />
            <span>${escapeHtml(t("fieldBt.area.four"))}</span>
          </label>
          <label class="field-bt-package-control">
            <span>${escapeHtml(t("fieldBt.packageCount"))}</span>
            <select id="fieldBtSharedPackageSelect" ${sharedChecked ? "" : "disabled"}>
              ${fieldBtPackageOptions(record.sharedPackageCount)}
            </select>
          </label>
        </div>
      </div>
    </div>
  </section>`;

  byId("fieldBtDateInput")?.addEventListener("change", (event) => {
    updateDateInputDisplay(event.target);
    state.fieldBtDate = event.target.value || todayDate();
    render();
  });
  document.querySelectorAll(".field-bt-area-input").forEach((input) => {
    input.addEventListener("change", () => {
      const oneTwoSelect = byId("fieldBtOneTwoPackageSelect");
      const sharedSelect = byId("fieldBtSharedPackageSelect");
      if (oneTwoSelect) {
        oneTwoSelect.disabled = !byId("fieldBtOneTwoInput")?.checked;
        if (oneTwoSelect.disabled) oneTwoSelect.value = "";
      }
      if (sharedSelect) {
        sharedSelect.disabled = !byId("fieldBtThreeInput")?.checked && !byId("fieldBtFiveInput")?.checked && !byId("fieldBtFourInput")?.checked;
        if (sharedSelect.disabled) sharedSelect.value = "";
      }
      saveFieldBtRecords();
    });
  });
  byId("fieldBtOneTwoPackageSelect")?.addEventListener("change", saveFieldBtRecords);
  byId("fieldBtSharedPackageSelect")?.addEventListener("change", saveFieldBtRecords);
}

function renderFieldWorkRecordsPage() {
  const { zones, netHouses } = fieldWorkSelection();
  const selectedTaskKeys = selectedFieldWorkTaskKeys();
  const fertilizerBagCount = selectedFieldWorkFertilizerBagCount();
  const accountName = selectedFieldWorkAccountName();
  const seedlingTransplantCropItems = selectedFieldWorkSeedlingTransplantCropItems();
  const soilPreparationChecked = selectedTaskKeys.has("soilPreparationTractorClean");
  const directSowChecked = selectedTaskKeys.has("directSow");
  const seedlingTransplantChecked = selectedTaskKeys.has("seedlingTransplant");
  const plantingGuardRecord = fieldWorkPlantingGuardRecord();
  const zoneOptions = zones
    .map((zone) => `<option value="${escapeAttribute(zone.name)}" ${zone.name === state.fieldWorkZoneName ? "selected" : ""}>${escapeHtml(zone.name)}</option>`)
    .join("");
  const taskOptions = plantingGuardRecord ? `
    <div class="field-work-planting-guard" role="status">
      <strong>${escapeHtml(t("netHouseStatus.plantingActive"))}</strong>
    </div>
  ` : fieldWorkTaskOptions
    .map((task) => {
      const option = `<label class="field-work-task-option">
        <input
          ${task.key === "soilPreparationTractorClean" ? 'id="fieldWorkSoilPreparationInput"' : ""}
          ${task.key === "directSow" ? 'id="fieldWorkDirectSowInput"' : ""}
          ${task.key === "seedlingTransplant" ? 'id="fieldWorkSeedlingTransplantInput"' : ""}
          class="field-work-task-input"
          type="checkbox"
          value="${escapeAttribute(task.key)}"
          ${selectedTaskKeys.has(task.key) ? "checked" : ""}
        />
        <span>${escapeHtml(t(task.labelKey))}</span>
      </label>`;
      if (task.key === "soilPreparationTractorClean") {
        return `<div class="field-work-task-with-detail">
          ${option}
          <label class="field-work-fertilizer-control">
            <span>${escapeHtml(t("fieldWork.fertilizerBags"))}</span>
            <input
              id="fieldWorkFertilizerBagCountInput"
              type="text"
              ${fieldNumericInputAttributes("decimal")}
              value="${escapeAttribute(fertilizerBagCount)}"
              ${soilPreparationChecked ? "" : "disabled"}
            />
          </label>
        </div>`;
      }
      if (task.key === "directSow") {
        return `<div class="field-work-task-with-detail">
          ${option}
          <label class="field-work-crop-control">
            <span>${escapeHtml(t("fieldWork.crop"))}</span>
            <input type="text" value="空心菜" disabled />
          </label>
        </div>`;
      }
      if (task.key === "seedlingTransplant") {
        const cropRows = (seedlingTransplantCropItems.length ? seedlingTransplantCropItems : [{ cropKey: "" }])
          .map((item, index) => fieldWorkSeedlingTransplantCropRow(item.cropKey, item.trayCount, index === 0 ? "add" : "remove", !seedlingTransplantChecked))
          .join("");
        return `<div class="field-work-task-with-detail">
          ${option}
          <div class="field-work-crop-control field-work-multi-crop-control">
            <span>${escapeHtml(t("fieldWork.crop"))}</span>
            <div class="field-work-crop-list field-work-seedling-transplant-crop-list">
              ${cropRows}
            </div>
          </div>
        </div>`;
      }
      return option;
    })
    .join("");

  byId("viewTitle").innerHTML = "";
  byId("tableHost").innerHTML = `<section class="field-work-panel field-work-records-panel">
    <div class="field-work-form field-work-records-form">
      <div class="field-work-date-row">
        <label class="field-work-date-control">
          <span>${escapeHtml(t("fieldWork.date"))}</span>
          ${dateInputMarkup({ id: "fieldWorkDateInput", value: state.fieldWorkDate || todayDate() })}
        </label>
        ${accountName ? `<div class="field-work-account-name">
          <span>${escapeHtml(t("fieldWork.accountName"))}</span>
          <strong>${escapeHtml(accountName)}</strong>
        </div>` : ""}
      </div>
      <div class="field-work-select-row">
        <label class="field-work-control">
          <span>${escapeHtml(t("fieldWork.zone"))}</span>
          ${selectInputMarkup({ id: "fieldWorkZoneSelect", display: state.fieldWorkZoneName, optionsHtml: zoneOptions })}
        </label>
        <div class="field-work-control">
          <span>${escapeHtml(t("fieldWork.netHouse"))}</span>
          ${fieldWorkNetHousePickerMarkup(netHouses)}
        </div>
      </div>
      <div class="field-work-task-grid">${taskOptions}</div>
      ${renderFieldWorkMessageBoard()}
    </div>
  </section>`;

  byId("fieldWorkDateInput")?.addEventListener("change", (event) => {
    updateDateInputDisplay(event.target);
    const nextDate = event.target.value || todayDate();
    if (nextDate !== state.fieldWorkDate && !canLeaveFieldWorkRecordsPage()) {
      event.target.value = state.fieldWorkDate || todayDate();
      updateDateInputDisplay(event.target);
      return;
    }
    state.fieldWorkDate = event.target.value || todayDate();
    render();
  });
  byId("fieldWorkZoneSelect")?.addEventListener("change", (event) => {
    updateSelectDisplay(event.target);
    if (event.target.value !== state.fieldWorkZoneName && !canLeaveFieldWorkRecordsPage()) {
      event.target.value = state.fieldWorkZoneName;
      updateSelectDisplay(event.target);
      return;
    }
    state.fieldWorkZoneName = event.target.value;
    state.fieldWorkNetHouseCode = "";
    render();
  });
  bindFieldWorkNetHousePicker();
  document.querySelectorAll(".field-work-task-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      if (event.target.value === "soilPreparationTractorClean") {
        const fertilizerInput = byId("fieldWorkFertilizerBagCountInput");
        if (fertilizerInput) {
          fertilizerInput.disabled = !event.target.checked;
          if (!event.target.checked) fertilizerInput.value = "";
          if (event.target.checked) {
            fertilizerInput.focus();
            return;
          }
        }
      }
      if (event.target.value === "seedlingTransplant") {
        const cropControls = [
          ...document.querySelectorAll(".field-work-seedling-transplant-crop-select, .field-work-seedling-transplant-tray-input, .field-work-seedling-transplant-crop-action"),
        ];
        cropControls.forEach((control) => {
          control.disabled = !event.target.checked;
          if (!event.target.checked && control.matches(".field-work-seedling-transplant-crop-select, .field-work-seedling-transplant-tray-input")) control.value = "";
        });
        if (event.target.checked) {
          document.querySelector(".field-work-seedling-transplant-crop-select")?.focus();
          return;
        }
      }
      saveFieldWorkRecords();
    });
  });
  byId("fieldWorkFertilizerBagCountInput")?.addEventListener("change", (event) => {
    event.target.value = String(event.target.value || "").trim();
    saveFieldWorkRecords();
  });
  bindSeedlingTransplantCropControls();
  bindFieldWorkMessageBoard();
}

function renderNetHouseStatusRecordsPage() {
  const { zones, netHouses } = netHouseStatusSelection();
  const activeRecord = netHouseStatusActiveRecord();
  const selectedStatus = selectedNetHouseStatus();
  const cropItems = activeNetHouseStatusCropItems(activeRecord);
  const showPlantingDetails = selectedStatus === "種植" && cropItems.length;
  const currentNetHouseIndex = netHouses.findIndex((house) => house.netHouseCode === state.netHouseStatusNetHouseCode);
  const hasPreviousNetHouse = currentNetHouseIndex > 0;
  const hasNextNetHouse = currentNetHouseIndex >= 0 && currentNetHouseIndex < netHouses.length - 1;
  const plantedDate = activeRecord.plantedDate || activeRecord.recordDate || "";
  const zoneOptions = zones
    .map((zone) => `<option value="${escapeAttribute(zone.name)}" ${zone.name === state.netHouseStatusZoneName ? "selected" : ""}>${escapeHtml(zone.name)}</option>`)
    .join("");
  const selectedNetHouse = netHouses.find((house) => house.netHouseCode === state.netHouseStatusNetHouseCode) || netHouses[0] || null;
  const statusOptions = netHouseStatusOptions
    .map((status) => `<option value="${escapeAttribute(status)}" ${status === selectedStatus ? "selected" : ""}>${escapeHtml(netHouseStatusOptionLabel(status))}</option>`)
    .join("");
  const plantingDetails = showPlantingDetails ? `<div class="net-house-status-detail-list">
      ${cropItems.map((item, index) => {
        const sameCropCount = cropItems.filter((candidate) => candidate.cropName === item.cropName).length;
        const showCropName = cropItems.findIndex((candidate) => candidate.cropName === item.cropName) === index;
        const harvestDate = String(item.harvestDate || "");
        const destroyed = Boolean(item.destroyed);
        const canMarkDestroyed = Boolean(harvestDate && harvestDate === state.netHouseStatusDate);
        return `<div class="net-house-status-detail-row ${showCropName ? "" : "is-continuation"}">
        ${showCropName ? `<label class="field-work-control net-house-status-crop-control">
          <span>${escapeHtml(t("netHouseStatus.cropName"))}</span>
          <input type="text" value="${escapeAttribute(item.cropName || "")}" disabled />
        </label>` : ""}
        <label class="field-work-control net-house-status-planted-control">
          <span>${escapeHtml(t("netHouseStatus.plantedDate"))}</span>
          <input type="text" value="${escapeAttribute(plantedDate)}" disabled />
        </label>
        <label class="field-work-control net-house-status-harvest-control">
          <span>${escapeHtml(t("netHouseStatus.harvestDate"))}</span>
          ${dateInputMarkup({
            value: item.harvestDate || "",
            inputClass: "net-house-harvest-date-input",
            attributes: `data-net-house-harvest-date="${escapeAttribute(index)}"${plantedDate ? ` min="${escapeAttribute(plantedDate)}"` : ""}`,
          })}
        </label>
        <label class="field-work-control net-house-status-days-control">
          <span>${escapeHtml(t("netHouseStatus.days"))}</span>
          <input class="net-house-days-input" data-net-house-days="${index}" type="text" ${fieldNumericInputAttributes("integer")} value="${escapeAttribute(netHouseStatusDayCountText(plantedDate, item.harvestDate || ""))}" />
        </label>
        <div class="field-work-control net-house-status-quantity-control">
          <div class="net-house-status-quantity-action-row">
            <div class="net-house-status-estimated-column">
              <label class="net-house-status-quantity-field">
                <span>${escapeHtml(t("netHouseStatus.estimatedQuantity"))}</span>
                <input class="net-house-estimated-quantity-input" data-net-house-estimated-quantity="${index}" type="text" ${fieldNumericInputAttributes("decimal")} value="${escapeAttribute(destroyed ? "0" : item.estimatedQuantity ?? "")}" ${destroyed ? "disabled" : ""} />
              </label>
              <div class="net-house-status-period-action-row">
                <label class="net-house-status-destroy-option">
                  <input type="checkbox" data-net-house-destroyed="${index}" ${destroyed ? "checked" : ""} ${canMarkDestroyed ? "" : "disabled"} />
                  <span>${escapeHtml(t("netHouseStatus.destroyCrop"))}</span>
                </label>
                <button class="net-house-status-period-button" type="button" data-net-house-extend-harvest="${escapeAttribute(index)}">${escapeHtml(t("netHouseStatus.extendHarvest"))}</button>
                ${sameCropCount > 1 ? `<button class="net-house-status-period-button net-house-status-period-remove-button" type="button" data-net-house-remove-harvest="${escapeAttribute(index)}">${escapeHtml(t("netHouseStatus.removeHarvest"))}</button>` : ""}
              </div>
            </div>
            <label class="net-house-status-quantity-field">
              <span>${escapeHtml(t("netHouseStatus.harvestQuantity"))}</span>
              <input class="net-house-harvest-quantity-input" data-net-house-harvest-quantity="${index}" type="text" ${fieldNumericInputAttributes("decimal")} value="${escapeAttribute(destroyed ? "0" : item.harvestQuantity ?? "")}" ${destroyed ? "disabled" : ""} />
            </label>
          </div>
        </div>
      </div>`;
      }).join("")}
      </div>` : "";

  byId("viewTitle").innerHTML = "";
  byId("tableHost").innerHTML = `<section class="field-work-panel net-house-status-panel">
    <div class="field-work-form net-house-status-form">
      <div class="field-work-date-row net-house-status-date-row">
        <label class="field-work-date-control">
          <span>${escapeHtml(t("fieldWork.date"))}</span>
          ${dateInputMarkup({
            id: "netHouseStatusDateInput",
            value: state.netHouseStatusDate || todayDate(),
            attributes: `aria-label="${escapeAttribute(t("fieldWork.date"))}"`,
          })}
        </label>
      </div>
      <div class="field-work-select-row net-house-status-select-row">
        <label class="field-work-control">
          <span>${escapeHtml(t("fieldWork.zone"))}</span>
          ${selectInputMarkup({
            id: "netHouseStatusZoneSelect",
            display: state.netHouseStatusZoneName,
            optionsHtml: zoneOptions,
            attributes: `aria-label="${escapeAttribute(t("fieldWork.zone"))}"`,
          })}
        </label>
        <div class="field-work-control net-house-status-net-house-control">
          <span>${escapeHtml(t("fieldWork.netHouse"))}</span>
          <div class="net-house-status-net-house-picker">
            <button
              class="net-house-status-nav-button net-house-status-nav-prev"
              type="button"
              data-net-house-status-nav="-1"
              aria-label="${escapeAttribute(t("netHouseStatus.previousNetHouse"))}"
              ${hasPreviousNetHouse ? "" : "disabled"}
            ></button>
            ${netHouseStatusNetHousePickerMarkup(netHouses, selectedNetHouse)}
            <button
              class="net-house-status-nav-button net-house-status-nav-next"
              type="button"
              data-net-house-status-nav="1"
              aria-label="${escapeAttribute(t("netHouseStatus.nextNetHouse"))}"
              ${hasNextNetHouse ? "" : "disabled"}
            ></button>
          </div>
        </div>
        <div class="field-work-control net-house-status-status-control">
          <span>${escapeHtml(t("netHouseStatus.status"))}</span>
          <div class="net-house-status-status-row">
            <select id="netHouseStatusSelect" aria-label="${escapeAttribute(t("netHouseStatus.status"))}">${statusOptions}</select>
            <label class="net-house-status-lunch-option">
              <input id="netHouseStatusLunchInput" type="checkbox" ${activeRecord.lunchMarked ? "checked" : ""} />
              <span>${escapeHtml(t("netHouseStatus.lunch"))}</span>
            </label>
            <button id="openFieldWorkMessageBoardBtn" class="net-house-status-message-button" type="button">${escapeHtml(t("fieldWork.messageBoard"))}</button>
          </div>
        </div>
      </div>
      ${plantingDetails}
    </div>
  </section>`;

  byId("netHouseStatusDateInput")?.addEventListener("change", (event) => {
    updateDateInputDisplay(event.target);
    state.netHouseStatusDate = event.target.value || todayDate();
    render();
  });
  byId("netHouseStatusZoneSelect")?.addEventListener("change", (event) => {
    updateSelectDisplay(event.target);
    state.netHouseStatusZoneName = event.target.value;
    state.netHouseStatusNetHouseCode = "";
    render();
  });
  bindNetHouseStatusNetHousePicker();
  byId("netHouseStatusSelect")?.addEventListener("change", saveNetHouseStatusRecord);
  byId("netHouseStatusLunchInput")?.addEventListener("change", saveNetHouseStatusLunchMarked);
  byId("openFieldWorkMessageBoardBtn")?.addEventListener("click", openFieldWorkMessageBoardFromNetHouseStatus);
  document.querySelectorAll("[data-net-house-status-nav]").forEach((button) => {
    bindNetHouseStatusNavButton(button);
  });
  document.querySelectorAll(".net-house-harvest-date-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      updateDateInputDisplay(event.target);
      if (plantedDate && event.target.value && event.target.value < plantedDate) {
        alert(t("netHouseStatus.harvestBeforePlantingError"));
        const index = Number(event.target.dataset.netHouseHarvestDate || 0);
        event.target.value = cropItems[index]?.harvestDate || "";
        updateDateInputDisplay(event.target);
        updateNetHouseStatusDayCount(event.target.dataset.netHouseHarvestDate, plantedDate);
        return;
      }
      updateNetHouseStatusDayCount(event.target.dataset.netHouseHarvestDate, plantedDate);
      const destroyedInput = document.querySelector(`[data-net-house-destroyed="${event.target.dataset.netHouseHarvestDate}"]`);
      const estimatedQuantityInput = document.querySelector(`[data-net-house-estimated-quantity="${event.target.dataset.netHouseHarvestDate}"]`);
      const harvestQuantityInput = document.querySelector(`[data-net-house-harvest-quantity="${event.target.dataset.netHouseHarvestDate}"]`);
      const canMarkDestroyed = Boolean(event.target.value && event.target.value === state.netHouseStatusDate);
      if (destroyedInput) {
        destroyedInput.disabled = !canMarkDestroyed;
        if (!canMarkDestroyed) {
          destroyedInput.checked = false;
          if (estimatedQuantityInput) estimatedQuantityInput.disabled = false;
          if (harvestQuantityInput) harvestQuantityInput.disabled = false;
        }
      }
      saveNetHouseStatusDetails();
    });
  });
  document.querySelectorAll(".net-house-days-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      const index = event.target.dataset.netHouseDays;
      const rawDays = String(event.target.value || "").trim();
      if (!rawDays) {
        updateNetHouseStatusDayCount(index, plantedDate);
        return;
      }
      const harvestDate = netHouseStatusHarvestDateFromDayCount(plantedDate, rawDays);
      if (!harvestDate) {
        alert(t("netHouseStatus.daysInvalid"));
        updateNetHouseStatusDayCount(index, plantedDate);
        return;
      }
      const harvestInput = document.querySelector(`[data-net-house-harvest-date="${index}"]`);
      if (!harvestInput) return;
      harvestInput.value = harvestDate;
      updateDateInputDisplay(harvestInput);
      event.target.value = netHouseStatusDayCountText(plantedDate, harvestDate);
      saveNetHouseStatusDetails();
    });
  });
  document.querySelectorAll(".net-house-estimated-quantity-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      const destroyedInput = document.querySelector(`[data-net-house-destroyed="${event.target.dataset.netHouseEstimatedQuantity}"]`);
      if (destroyedInput?.checked) {
        event.target.value = "0";
        return;
      }
      event.target.value = String(event.target.value || "").trim();
      saveNetHouseStatusDetails();
    });
  });
  document.querySelectorAll(".net-house-harvest-quantity-input").forEach((input) => {
    input.addEventListener("change", (event) => {
      const destroyedInput = document.querySelector(`[data-net-house-destroyed="${event.target.dataset.netHouseHarvestQuantity}"]`);
      if (destroyedInput?.checked) {
        event.target.value = "0";
        return;
      }
      event.target.value = String(event.target.value || "").trim();
      saveNetHouseStatusDetails();
    });
  });
  document.querySelectorAll("[data-net-house-destroyed]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const index = event.target.dataset.netHouseDestroyed;
      const harvestInput = document.querySelector(`[data-net-house-harvest-date="${index}"]`);
      const estimatedQuantityInput = document.querySelector(`[data-net-house-estimated-quantity="${index}"]`);
      const harvestQuantityInput = document.querySelector(`[data-net-house-harvest-quantity="${index}"]`);
      const canMarkDestroyed = Boolean(harvestInput?.value && harvestInput.value === state.netHouseStatusDate);
      if (!canMarkDestroyed) {
        event.target.checked = false;
        return;
      }
      if (estimatedQuantityInput) {
        estimatedQuantityInput.value = event.target.checked ? "0" : String(estimatedQuantityInput.value || "").trim();
        estimatedQuantityInput.disabled = event.target.checked;
      }
      if (harvestQuantityInput) {
        harvestQuantityInput.value = event.target.checked ? "0" : String(harvestQuantityInput.value || "").trim();
        harvestQuantityInput.disabled = event.target.checked;
      }
      saveNetHouseStatusDetails();
    });
  });
  document.querySelectorAll("[data-net-house-extend-harvest]").forEach((button) => {
    button.addEventListener("click", () => {
      addNetHouseStatusHarvestPeriod(Number(button.dataset.netHouseExtendHarvest || 0));
    });
  });
  document.querySelectorAll("[data-net-house-remove-harvest]").forEach((button) => {
    button.addEventListener("click", () => {
      removeNetHouseStatusHarvestPeriod(Number(button.dataset.netHouseRemoveHarvest || 0));
    });
  });
}

function renderRecordPage() {
  if (state.page === "fieldWorkRecords") {
    renderFieldWorkRecordsPage();
    return;
  }
  if (state.page === "fieldWorkMessageBoard") {
    renderFieldWorkMessageBoardPage();
    return;
  }
  if (state.page === "fieldBtRecords") {
    renderFieldBtRecordsPage();
    return;
  }
  if (state.page === "netHouseStatusRecords") {
    renderNetHouseStatusRecordsPage();
    return;
  }
  if (state.page === "dailyVegetableAvailability") {
    renderDailyVegetableAvailabilityPage();
    return;
  }
  if (state.page === "harvestPickList") {
    renderHarvestPickListPage();
    return;
  }
  const recordLabelKey = state.page === "fieldWorkRecords"
    ? "page.fieldWorkRecords"
    : state.page === "fieldWorkMessageBoard"
      ? "page.fieldWorkMessageBoard"
      : state.page === "fieldBtRecords"
        ? "page.fieldBtRecords"
        : "";
  byId("viewTitle").innerHTML = `<h2>${escapeHtml(recordLabelKey ? t(recordLabelKey) : (recordPages[state.page] || ""))}</h2>`;
  byId("tableHost").innerHTML = "";
}

function render() {
  if (!data) {
    renderAuthState();
    return;
  }
  closeFieldNumericKeypad({ commit: false });
  if (!canUsePage(state.page)) state.page = "home";
  renderAppShell();
  if (state.page === "home") return;
  if (state.page === "inventory" && state.view === "salesPage") renderSalesPage();
  if (state.page === "inventory" && state.view === "shipmentPage") renderShipmentPage();
  if (state.page === "shipmentManifest") renderShipmentManifest();
  if (state.page === "harvestPlanning") {
    renderActiveHarvestView();
  }
  if (Object.prototype.hasOwnProperty.call(channelPages, state.page)) renderChannelPage();
  if (Object.prototype.hasOwnProperty.call(recordPages, state.page)) renderRecordPage();
  if (state.page === "accountUsers") renderAccountUsersPage();
  bindFieldNumericKeypadControls();
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function exportPlan() {
  const headers = ["group", "storeCode", "storeName", "productCode", "productName", "currentStock", "suggestedQty"];
  const lines = [headers.join(",")];
  for (const row of lowStockRows()) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shipment_plan_${data.salesDate || "today"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function currentStoreControlStores() {
  const selectedGroup = state.group;
  return storePages
    .filter((store) => (!selectedGroup || store.group === selectedGroup) && storeMatchesQuery(store, state.storeSearch))
    .sort((a, b) => {
      if (a.group !== b.group) return String(a.group).localeCompare(String(b.group), "zh-Hant");
      return storeOrderValue(a) - storeOrderValue(b);
    });
}

async function switchSelectedStore(storeKey, sourceElement = null) {
  const nextStoreKey = String(storeKey || "");
  if (!nextStoreKey || nextStoreKey === state.selectedStoreKey) {
    if (sourceElement) sourceElement.value = state.selectedStoreKey;
    return false;
  }
  if (!confirmDiscardUnsavedChanges()) {
    if (sourceElement) sourceElement.value = state.selectedStoreKey;
    return false;
  }
  resetDraftShipments();
  state.selectedStoreKey = nextStoreKey;
  syncStoreHash();
  populateStoreControls();
  byId("importStatus").textContent = "銷售資料載入中...";
  try {
    await ensureSalesForDate(state.shipmentDate || todayDate());
    byId("importStatus").textContent = "銷售資料已載入";
  } catch (error) {
    byId("importStatus").textContent = "銷售資料載入失敗";
    alert(`銷售資料載入失敗：${error.message}`);
  }
  render();
  return true;
}

function populateStoreControls() {
  const stores = currentStoreControlStores();
  if (!stores.some((store) => store.key === state.selectedStoreKey)) {
    state.selectedStoreKey = stores[0]?.key || "";
  }
  const routeList = storeRouteList();
  byId("storeSelect").innerHTML = stores
    .map(
      (store) => {
        const route = normalizedStoreRoute(store);
        const routeColorStyle = storeRouteColorStyle(store, routeList);
        return `<option value="${escapeAttribute(store.key)}" class="${routeColorStyle ? "store-route-colored" : ""}" style="${escapeAttribute(routeColorStyle)}" data-route="${escapeAttribute(route)}" ${store.key === state.selectedStoreKey ? "selected" : ""}>${escapeHtml(storeOptionLabel(store))}</option>`;
      },
    )
    .join("");
  const store = storePages.find((item) => item.key === state.selectedStoreKey);
  const dates = store?.dates || [];
  if (!state.shipmentDate) {
    state.shipmentDate = dates.at(-1) || state.shipmentDate;
  }
  byId("shipmentDateInput").value = state.shipmentDate || "";
  byId("deleteStoreBtn").disabled = !store;
  if (byId("addStoreForm").hidden) byId("newStoreGroup").value = state.group || "A";
}

function nextInventoryStoreKey(direction) {
  const stores = currentStoreControlStores();
  if (!stores.length) return "";
  const currentIndex = stores.findIndex((store) => store.key === state.selectedStoreKey);
  if (currentIndex < 0) return stores[0]?.key || "";
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= stores.length) return "";
  return stores[nextIndex]?.key || "";
}

function inventoryStoreShortcutDirection(event) {
  if (state.page !== "inventory") return 0;
  if (event.isComposing || event.shiftKey) return 0;
  if (!event.altKey || event.ctrlKey || event.metaKey) return 0;
  const key = String(event.key || "");
  const code = String(event.code || "");
  if (key === "PageUp" || code === "PageUp") return -1;
  if (key === "PageDown" || code === "PageDown") return 1;
  if (key === "ArrowUp" || code === "ArrowUp") return -1;
  if (key === "ArrowDown" || code === "ArrowDown") return 1;
  return 0;
}

async function handleInventoryStoreSwitchShortcut(event) {
  const direction = inventoryStoreShortcutDirection(event);
  if (!direction) return;
  event.preventDefault();
  event.stopPropagation();
  if (inventoryStoreSwitchInFlight) return;
  const nextStoreKey = nextInventoryStoreKey(direction);
  if (!nextStoreKey) return;
  inventoryStoreSwitchInFlight = true;
  try {
    await switchSelectedStore(nextStoreKey, byId("storeSelect"));
  } finally {
    inventoryStoreSwitchInFlight = false;
  }
}

async function updateShipmentDate(nextDate, input = null) {
  if (!confirmDiscardUnsavedChanges()) {
    if (input) input.value = state.shipmentDate || "";
    return;
  }
  state.shipmentDate = nextDate;
  resetDraftShipments();
  resetDraftHarvestEntries();
  resetDraftCityEntries();
  resetDraftYfyEntries();
  resetDraftLooseVegetableEntries();
  resetDraftGeneralChannelEntries();
  const sidebarDateInput = byId("shipmentDateInput");
  if (sidebarDateInput) sidebarDateInput.value = state.shipmentDate || "";
  byId("importStatus").textContent = "銷售資料載入中...";
  try {
    await ensureSalesForDate(state.shipmentDate);
    byId("importStatus").textContent = "銷售資料已載入";
  } catch (error) {
    byId("importStatus").textContent = "銷售資料載入失敗";
    alert(`銷售資料載入失敗：${error.message}`);
  }
  render();
}

function rebuildDerivedState(options = {}) {
  const applyInitialHash = options.applyInitialHash !== false;
  baseStorePages = cloneBaseStorePages(data?.storePages || []);
  storePages = cloneBaseStorePages(baseStorePages);
  data.storePages = storePages;
  applyStoreRoutesToData();
  const productMap = new Map((data?.products || []).map((product) => [product.productCode, product]));
  const orderedProductCodes = [];
  storePages.forEach((store) => {
    (store.products || []).forEach((product) => {
      if (!orderedProductCodes.includes(product.productCode)) orderedProductCodes.push(product.productCode);
      if (!productMap.has(product.productCode)) productMap.set(product.productCode, product);
    });
  });
  allProducts = orderedProductCodes.map((code) => productMap.get(code)).filter(Boolean);
  const template = harvestTemplate();
  const templateCells = new Map((template?.cells || []).map((cell) => [`${cell.row}:${cell.col}`, cell]));
  allHarvestProducts = [];
  for (const product of template?.products || []) {
    const productName = String(product.productName || "");
    if (!productName) continue;
    const productCode = harvestProductCodeByName(productName);
    allHarvestProducts.push({
      key: productCode || `row:${product.rowIndex}`,
      rowIndex: product.rowIndex,
      productCode,
      productName,
    });
  }
  visibleProductCodesByDate = normalizeVisibleProductCodesByDate(visibleProductCodesByDate);
  visibleHarvestProductKeysByDate = normalizeVisibleProductCodesByDate(visibleHarvestProductKeysByDate);
  const activeFilterDate = productFilterDateKey();
  if (activeFilterDate && !Array.isArray(visibleProductCodesByDate[activeFilterDate])) {
    const legacySelected = uniqueStrings(Array.isArray(visibleProductCodes) ? visibleProductCodes : []);
    setVisibleProductCodesForDate(legacySelected.length ? legacySelected : defaultVisibleProductCodesForDate(), activeFilterDate);
  }
  if (activeFilterDate && !Array.isArray(visibleHarvestProductKeysByDate[activeFilterDate])) {
    const legacySelected = uniqueStrings([
      ...(Array.isArray(visibleHarvestProductKeys) ? visibleHarvestProductKeys : []),
      ...(Array.isArray(visibleProductCodesByDate[activeFilterDate]) ? visibleProductCodesByDate[activeFilterDate] : []),
    ]);
    setVisibleHarvestProductKeysForDate(legacySelected.length ? legacySelected : defaultVisibleHarvestProductKeysForDate(), activeFilterDate);
  }
  if (applyInitialHash && initialStoreFromHash && storePages.some((store) => store.key === initialStoreFromHash)) {
    state.selectedStoreKey = initialStoreFromHash;
  } else if (!storePages.some((store) => store.key === state.selectedStoreKey)) {
    state.selectedStoreKey = storePages[0]?.key || "";
  }
  if (!state.shipmentDate) state.shipmentDate = todayDate();
  if (state.shipmentDate && !Array.isArray(visibleProductCodesByDate[state.shipmentDate])) {
    const legacySelected = uniqueStrings(Array.isArray(visibleProductCodes) ? visibleProductCodes : []);
    setVisibleProductCodesForDate(legacySelected.length ? legacySelected : defaultVisibleProductCodesForDate());
  }
  if (state.shipmentDate && !Array.isArray(visibleHarvestProductKeysByDate[state.shipmentDate])) {
    const legacySelected = uniqueStrings([
      ...(Array.isArray(visibleHarvestProductKeys) ? visibleHarvestProductKeys : []),
      ...(Array.isArray(visibleProductCodesByDate[state.shipmentDate]) ? visibleProductCodesByDate[state.shipmentDate] : []),
    ]);
    setVisibleHarvestProductKeysForDate(legacySelected.length ? legacySelected : defaultVisibleHarvestProductKeysForDate());
  }
  const validPages = [
    "inventory",
    "shipmentManifest",
    "harvestPlanning",
    "accountUsers",
    ...Object.keys(channelPages),
    ...Object.keys(recordPages),
  ];
  if (applyInitialHash && validPages.includes(initialPageFromHash) && canUsePage(initialPageFromHash)) {
    state.page = initialPageFromHash;
  }
  if (!canUsePage(state.page)) state.page = "home";
  if (
    applyInitialHash
    && state.page === "fieldWorkMessageBoard"
    && fieldWorkMessageReturnPages.includes(initialFieldWorkMessageReturnPageFromHash)
  ) {
    state.fieldWorkMessageReturnPage = initialFieldWorkMessageReturnPageFromHash;
  }
  if (applyInitialHash && state.page === "fieldWorkMessageBoard") {
    if (initialFieldWorkMessageDateFromHash && /^\d{4}-\d{2}-\d{2}$/.test(initialFieldWorkMessageDateFromHash)) {
      state.fieldWorkDate = initialFieldWorkMessageDateFromHash;
    }
    if (initialFieldWorkMessageZoneNameFromHash) {
      state.fieldWorkZoneName = initialFieldWorkMessageZoneNameFromHash;
      if (state.fieldWorkMessageReturnPage === "netHouseStatusRecords") {
        state.netHouseStatusZoneName = initialFieldWorkMessageZoneNameFromHash;
      }
    }
    if (initialFieldWorkMessageNetHouseCodeFromHash) {
      state.fieldWorkNetHouseCode = initialFieldWorkMessageNetHouseCodeFromHash;
      if (state.fieldWorkMessageReturnPage === "netHouseStatusRecords") {
        state.netHouseStatusNetHouseCode = initialFieldWorkMessageNetHouseCodeFromHash;
      }
    }
  }
  if (applyInitialHash && Object.prototype.hasOwnProperty.call(harvestViewLabels, initialHarvestViewFromHash)) {
    state.harvestView = initialHarvestViewFromHash;
  }
  applyActiveSalesData();
}

function loadServerState(payload, options = {}) {
  currentUser = normalizeCurrentUser(payload.currentUser);
  normalizeWhiteRadishCropData(payload);
  data = payload.appData;
  applyInventorySyncVersion(payload.inventorySyncVersion);
  fieldNetHouseData = normalizeFieldNetHouseData(payload.fieldNetHouses);
  Object.keys(savedFieldWorkRecords).forEach((key) => delete savedFieldWorkRecords[key]);
  Object.assign(savedFieldWorkRecords, normalizeFieldWorkRecords(payload.fieldWorkRecords));
  Object.keys(savedFieldBtRecords).forEach((key) => delete savedFieldBtRecords[key]);
  Object.assign(savedFieldBtRecords, normalizeFieldBtRecords(payload.fieldBtRecords));
  Object.keys(savedNetHouseStatusRecords).forEach((key) => delete savedNetHouseStatusRecords[key]);
  Object.assign(savedNetHouseStatusRecords, normalizeNetHouseStatusRecords(payload.netHouseStatusRecords));
  Object.keys(savedDailyVegetableManualEntries).forEach((key) => delete savedDailyVegetableManualEntries[key]);
  Object.assign(savedDailyVegetableManualEntries, normalizeDailyVegetableManualEntries(payload.dailyVegetableManualEntries));
  visibleProductCodes = Array.isArray(payload.visibleProductCodes) ? payload.visibleProductCodes : null;
  visibleProductCodesByDate = normalizeVisibleProductCodesByDate(payload.visibleProductCodesByDate);
  visibleHarvestProductKeys = Array.isArray(payload.visibleHarvestProductKeys) ? payload.visibleHarvestProductKeys : null;
  visibleHarvestProductKeysByDate = normalizeVisibleProductCodesByDate(payload.visibleHarvestProductKeysByDate);
  visibleDailyVegetableProductKeys = Array.isArray(payload.visibleDailyVegetableProductKeys)
    ? uniqueStrings(payload.visibleDailyVegetableProductKeys)
    : null;
  harvestCrewColumnsByDate = normalizeHarvestCrewColumnsByDate(payload.harvestCrewColumnsByDate);
  legacyHarvestCrewColumns = Array.isArray(payload.harvestCrewColumns)
    ? normalizeHarvestCrewColumns(payload.harvestCrewColumns)
    : null;
  harvestFieldExtraColumnsByDate = normalizeHarvestFieldExtraColumnsByDate(payload.harvestFieldExtraColumnsByDate);
  harvestField3FExpandedByDate = normalizeHarvestField3FExpandedByDate(payload.harvestField3FExpandedByDate);
  harvestConversionSettings = normalizeHarvestConversionSettings(payload.harvestConversionSettings);
  harvestPackageCalculatorInputs = {};
  shipmentManifestSelections = payload.shipmentManifestSelections || loadManifestSelectionsFromStorage();
  Object.keys(storeNotes).forEach((key) => delete storeNotes[key]);
  Object.assign(storeNotes, payload.storeNotes || {});
  Object.keys(storeRoutes).forEach((key) => delete storeRoutes[key]);
  Object.assign(storeRoutes, payload.storeRoutes || {});
  Object.keys(savedShipments).forEach((key) => delete savedShipments[key]);
  (payload.shipmentEntries || []).forEach((entry) => {
    savedShipments[`${entry.storeKey}|${entry.shipmentDate}|${entry.productCode}`] = n(entry.quantity);
  });
  rebuildSavedShipmentIndex();
  Object.keys(draftShipments).forEach((key) => delete draftShipments[key]);
  Object.assign(draftShipments, savedShipments);
  Object.keys(savedStockAdjustments).forEach((key) => delete savedStockAdjustments[key]);
  (payload.stockAdjustmentEntries || []).forEach((entry) => {
    savedStockAdjustments[`${entry.storeKey}|${entry.shipmentDate}|${entry.productCode}`] = n(entry.quantity);
  });
  rebuildSavedStockAdjustmentIndex();
  Object.keys(draftStockAdjustments).forEach((key) => delete draftStockAdjustments[key]);
  Object.assign(draftStockAdjustments, savedStockAdjustments);
  Object.keys(savedHarvestEntries).forEach((key) => delete savedHarvestEntries[key]);
  (payload.harvestEntries || []).forEach((entry) => {
    savedHarvestEntries[
      harvestEntryKey(entry.harvestDate, entry.sheetName, entry.rowIndex, entry.columnLetter)
    ] = n(entry.quantity);
  });
  replaceObjectContents(savedHarvestCellPriorities, normalizeHarvestCellPriorities(payload.harvestCellPriorities));
  replaceObjectContents(savedHarvestCellFormulas, normalizeHarvestCellFormulas(payload.harvestCellFormulas));
  resetDraftHarvestEntries();
  replaceObjectContents(savedCityEntries, normalizeCityTableEntries(payload.cityTableEntries));
  resetDraftCityEntries();
  replaceObjectContents(savedYfyEntries, normalizeYfyTableEntries(payload.yfyTableEntries));
  replaceObjectContents(savedYfyShipmentTimes, normalizeYfyShipmentTimes(payload.yfyShipmentTimes));
  resetDraftYfyEntries();
  const looseVegetableColumnsByDate = migrateLooseVegetableColumnsByDate(
    payload.looseVegetableColumnsByDate,
    payload.looseVegetableColumns,
    payload.looseVegetableTableEntries,
  );
  replaceObjectContents(savedLooseVegetableColumnsByDate, looseVegetableColumnsByDate);
  savedLooseVegetableColumns = cloneLooseVegetableColumns(looseVegetableActiveSavedColumns());
  replaceObjectContents(savedLooseVegetableEntries, normalizeLooseVegetableEntries(
    payload.looseVegetableTableEntries,
    savedLooseVegetableColumnsByDate,
  ));
  resetDraftLooseVegetableEntries();
  const generalChannelColumnsByDate = migrateGeneralChannelColumnsByDate(
    payload.generalChannelColumnsByDate,
    payload.generalChannelColumns,
    payload.generalChannelTableEntries,
  );
  replaceObjectContents(savedGeneralChannelColumnsByDate, generalChannelColumnsByDate);
  savedGeneralChannelColumns = cloneGeneralChannelColumns(generalChannelActiveSavedColumns());
  replaceObjectContents(savedGeneralChannelEntries, normalizeGeneralChannelEntries(payload.generalChannelTableEntries, savedGeneralChannelColumnsByDate));
  replaceObjectContents(savedGeneralChannelPuqianEntries, normalizeGeneralChannelPuqianEntries(payload.generalChannelPuqianEntries));
  resetDraftGeneralChannelEntries();
  rebuildDerivedState(options);
  if (legacyHarvestCrewColumns && !harvestCrewColumnsByDate[harvestDate()]) {
    setActiveHarvestCrewColumns(legacyHarvestCrewColumns);
  }
}

async function persistVisibleProductCodes() {
  const response = await fetch("/api/product-filter", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibleProductCodesByDate }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "篩選保存失敗");
}

async function persistVisibleHarvestProductKeys() {
  const response = await fetch("/api/harvest-product-filter", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibleHarvestProductKeysByDate }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "篩選保存失敗");
}

async function persistVisibleDailyVegetableProductKeys() {
  const response = await fetch("/api/daily-vegetable-product-filter", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibleDailyVegetableProductKeys: visibleDailyVegetableProductCodes() }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "篩選保存失敗");
}

async function persistHarvestCrewColumns() {
  const response = await fetch("/api/harvest-crew-columns", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ harvestDate: harvestDate(), harvestCrewColumns: activeHarvestCrewColumns() }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "採收人員欄位保存失敗");
}

async function persistHarvestFieldExtraColumns() {
  const response = await fetch("/api/harvest-field-extra-columns", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ harvestDate: harvestDate(), harvestFieldExtraColumns: activeHarvestFieldExtraColumns() }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "採收場區欄位保存失敗");
  applyInventorySyncVersion(result.syncVersion);
}

async function persistHarvestField3FExpanded() {
  const response = await fetch("/api/harvest-field-3f-expanded", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      harvestDate: harvestDate(),
      harvestField3FExpanded: activeHarvestField3FExpanded(),
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "3場F 展開狀態保存失敗");
}

async function persistHarvestConversionSettings() {
  const response = await fetch("/api/harvest-conversion-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ harvestConversionSettings }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "換算參數保存失敗");
  applyInventorySyncVersion(result.syncVersion);
}

async function ensureHarvestMessagesForDate(date = harvestDate()) {
  if (!date) return [];
  if (harvestMessagesLoaded(date)) return harvestMessagesForDate(date);
  if (harvestMessageLoadPromises.has(date)) return harvestMessageLoadPromises.get(date);
  const promise = fetch(`/api/harvest-messages?date=${encodeURIComponent(date)}`)
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "留言載入失敗");
      setHarvestMessagesForDate(date, result.messages);
      return harvestMessagesForDate(date);
    })
    .finally(() => {
      harvestMessageLoadPromises.delete(date);
    });
  harvestMessageLoadPromises.set(date, promise);
  return promise;
}

async function addHarvestMessage(message) {
  const date = harvestDate();
  const text = String(message || "").trim();
  if (!date) throw new Error("缺少採收日期");
  if (!text) throw new Error("請輸入留言");
  const response = await fetch("/api/harvest-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ harvestDate: date, message: text }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "留言保存失敗");
  const savedMessage = normalizeHarvestMessage(result.message);
  if (savedMessage) {
    harvestMessagesByDate[date] = [...harvestMessagesForDate(date), savedMessage];
    updateHarvestMessageTabBadge(date);
  }
  return savedMessage;
}

async function deleteHarvestMessage(messageId) {
  const date = harvestDate();
  if (!date) throw new Error("缺少採收日期");
  const response = await fetch(`/api/harvest-messages/${encodeURIComponent(messageId)}?date=${encodeURIComponent(date)}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "留言刪除失敗");
  harvestMessagesByDate[date] = harvestMessagesForDate(date).filter((message) => message.id !== Number(messageId));
  updateHarvestMessageTabBadge(date);
}

async function ensureFieldWorkMessagesForScope(scope = fieldWorkMessageScope()) {
  const key = fieldWorkMessageScopeKey(scope);
  if (fieldWorkMessagesLoaded(key)) return fieldWorkMessagesForDate(key);
  if (fieldWorkMessageLoadPromises.has(key)) return fieldWorkMessageLoadPromises.get(key);
  if (!scope.zoneName || !scope.netHouseCode) throw new Error(t("fieldWork.chooseZoneAndNetHouse"));
  const params = new URLSearchParams({
    zoneName: scope.zoneName,
    netHouseCode: scope.netHouseCode,
  });
  const promise = fetch(`/api/field-work-messages?${params.toString()}`)
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || t("fieldWork.loadMessageError"));
      setFieldWorkMessagesForDate(key, result.messages);
      return fieldWorkMessagesForDate(key);
    })
    .finally(() => {
      fieldWorkMessageLoadPromises.delete(key);
    });
  fieldWorkMessageLoadPromises.set(key, promise);
  return promise;
}

async function addFieldWorkMessage(message, photos = []) {
  const scope = fieldWorkMessageScope();
  const date = scope.date;
  const text = String(message || "").trim();
  const photoFiles = (Array.isArray(photos) ? photos : [...(photos || [])]).filter((file) => file && file.size > 0);
  if (!date) throw new Error(t("fieldWork.missingDate"));
  if (!scope.zoneName || !scope.netHouseCode) throw new Error(t("fieldWork.chooseZoneAndNetHouse"));
  if (!text && !photoFiles.length) throw new Error(t("fieldWork.messageOrPhotoRequired"));
  if (photoFiles.length > 6) throw new Error(t("fieldWork.photoLimit"));
  const photoExtensionPattern = /\.(jpe?g|png|webp|gif|heic|heif)$/i;
  photoFiles.forEach((file) => {
    const isImageType = String(file.type || "").startsWith("image/");
    if (!isImageType && !photoExtensionPattern.test(file.name || "")) {
      throw new Error(t("fieldWork.photoFileOnly"));
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error(t("fieldWork.photoSizeLimit"));
    }
  });
  let response;
  if (photoFiles.length) {
    const body = new FormData();
    body.append("workDate", date);
    body.append("zoneName", scope.zoneName);
    body.append("netHouseCode", scope.netHouseCode);
    body.append("message", text);
    photoFiles.forEach((file) => body.append("photos", file));
    response = await fetch("/api/field-work-messages", {
      method: "POST",
      body,
    });
  } else {
    response = await fetch("/api/field-work-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workDate: date,
        zoneName: scope.zoneName,
        netHouseCode: scope.netHouseCode,
        message: text,
      }),
    });
  }
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || t("fieldWork.saveMessageError"));
  const savedMessage = normalizeFieldWorkMessage(result.message);
  if (savedMessage) {
    const key = fieldWorkMessageScopeKey(scope);
    fieldWorkMessagesByDate[key] = [savedMessage, ...fieldWorkMessagesForDate(key)].sort((a, b) =>
      String(b.workDate || "").localeCompare(String(a.workDate || "")) || b.id - a.id,
    );
  }
  return savedMessage;
}

async function deleteFieldWorkMessage(messageId) {
  const scope = fieldWorkMessageScope();
  const params = new URLSearchParams();
  if (scope.zoneName) params.set("zoneName", scope.zoneName);
  if (scope.netHouseCode) params.set("netHouseCode", scope.netHouseCode);
  const query = params.toString();
  const response = await fetch(`/api/field-work-messages/${encodeURIComponent(messageId)}${query ? `?${query}` : ""}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || t("fieldWork.deleteMessageError"));
  Object.keys(fieldWorkMessagesByDate).forEach((date) => {
    fieldWorkMessagesByDate[date] = fieldWorkMessagesForDate(date).filter((message) => message.id !== Number(messageId));
  });
}

async function persistShipmentManifestSelections() {
  saveManifestSelectionsToStorage();
  try {
    const response = await fetch("/api/shipment-manifest-selection", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentManifestSelections }),
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      if (!response.ok) return;
      throw new Error("出貨單門市保存失敗");
    }
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "出貨單門市保存失敗");
  } catch (error) {
    console.warn("Persisting shipment manifest selections via API failed; kept local copy instead.", error);
  }
}

async function bootstrap(options = {}) {
  const response = await fetch("/api/bootstrap");
  if (response.status === 401) {
    currentUser = null;
    data = null;
    renderAuthState();
    return false;
  }
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "資料載入失敗");
  loadServerState(result, options);
  if (shouldLoadSalesData()) {
    await ensureSalesForDate(state.shipmentDate || todayDate());
  }
  renderAuthState();
  return true;
}

async function initializeAuthenticatedApp(options = {}) {
  const loaded = await bootstrap(options);
  if (!loaded) return false;
  populateStoreControls();
  renderProductFilter();
  syncStoreHash();
  updateSaveStatus();
  updateHarvestSaveStatus();
  updateLooseVegetableSaveStatus();
  updateGeneralChannelSaveStatus();
  byId("salesDateInput").value = todayDate();
  render();
  startInventoryRealtimeSync();
  return true;
}

async function login(event) {
  event.preventDefault();
  const usernameInput = byId("loginUsername");
  const passwordInput = byId("loginPassword");
  const submitButton = byId("loginSubmitBtn");
  const status = byId("loginStatus");
  if (status) {
    status.textContent = t("login.loading");
    status.classList.remove("is-error");
  }
  if (submitButton) submitButton.disabled = true;
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameInput?.value || "",
        password: passwordInput?.value || "",
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(response.status === 401 ? t("login.invalid") : t("login.failed"));
    }
    currentUser = normalizeCurrentUser(result.user);
    if (passwordInput) passwordInput.value = "";
    if (status) status.textContent = "";
    state.page = "home";
    await initializeAuthenticatedApp({ applyInitialHash: false });
  } catch (error) {
    if (status) {
      status.textContent = error.message;
      status.classList.add("is-error");
    }
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}

async function logout() {
  stopInventoryRealtimeSync();
  await fetch("/api/logout", { method: "POST" }).catch(() => {});
  currentUser = null;
  data = null;
  accountUsers = [];
  accountUsersLoaded = false;
  state.page = "home";
  syncStoreHash();
  renderAuthState();
}

function roleOptionsMarkup(selectedRole) {
  return Object.entries(roleLabels)
    .map(([role, label]) => `<option value="${role}" ${role === selectedRole ? "selected" : ""}>${label}</option>`)
    .join("");
}

function renderAccountUsers() {
  const list = byId("accountUserList");
  if (!list) return;
  if (!accountUsers.length) {
    list.innerHTML = `<p class="empty">目前沒有帳號</p>`;
    return;
  }
  list.innerHTML = accountUsers
    .map((user) => {
      const isCurrentAccount = Number(user.id) === Number(currentUser?.id);
      return `<div class="account-user-row" data-account-user-id="${user.id}">
      <div class="account-user-name">
        <span>系統編號</span>
        <strong>#${escapeHtml(user.id)}</strong>
      </div>
      <label>
        帳號 ID
        <input data-account-username type="text" autocomplete="off" spellcheck="false" value="${escapeAttribute(user.username || "")}" />
      </label>
      <label>
        名稱
        <input data-account-display-name type="text" value="${escapeAttribute(user.displayName || "")}" />
      </label>
      <label>
        角色
        <select data-account-role>${roleOptionsMarkup(user.role)}</select>
      </label>
      <label class="account-active-label">
        啟用
        <input data-account-active type="checkbox" ${user.isActive ? "checked" : ""} />
      </label>
      <label>
        新密碼
        <input data-account-password type="text" autocomplete="new-password" spellcheck="false" placeholder="不變更可留空" />
      </label>
      <div class="account-user-actions">
        <button type="button" data-save-account-user="${user.id}">保存</button>
        <button class="danger-button" type="button" data-delete-account-user="${user.id}" ${isCurrentAccount ? "disabled" : ""}>刪除</button>
      </div>
    </div>`;
    })
    .join("");
  list.querySelectorAll("[data-save-account-user]").forEach((button) => {
    button.addEventListener("click", () => saveAccountUser(Number(button.dataset.saveAccountUser)));
  });
  list.querySelectorAll("[data-delete-account-user]").forEach((button) => {
    button.addEventListener("click", () => deleteAccountUser(Number(button.dataset.deleteAccountUser)));
  });
}

async function loadAccountUsers() {
  const response = await fetch("/api/users");
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "帳號載入失敗");
  accountUsers = Array.isArray(result.users) ? result.users : [];
  accountUsersLoaded = true;
  renderAccountUsers();
}

function renderAccountUsersPage() {
  byId("viewTitle").innerHTML = `<h2>帳號管理</h2>`;
  byId("tableHost").innerHTML = `<section class="account-page">
    <form id="createUserForm" class="account-create-form">
      <label>
        帳號
        <input id="createUsernameInput" type="text" autocomplete="off" required />
      </label>
      <label>
        名稱
        <input id="createDisplayNameInput" type="text" autocomplete="off" required />
      </label>
      <label>
        角色
        <select id="createUserRoleSelect">
          <option value="inside">內場</option>
          <option value="field">外場</option>
          <option value="root">管理員</option>
        </select>
      </label>
      <label>
        密碼
        <input id="createUserPasswordInput" type="text" autocomplete="new-password" spellcheck="false" required />
      </label>
      <button type="submit">新增帳號</button>
    </form>
    <div id="accountUserList" class="account-user-list"></div>
    <p id="accountAdminStatus" class="login-status"></p>
  </section>`;
  byId("createUserForm")?.addEventListener("submit", createAccountUser);
  if (accountUsersLoaded) {
    renderAccountUsers();
    return;
  }
  const status = byId("accountAdminStatus");
  if (status) status.textContent = "載入中...";
  loadAccountUsers()
    .then(() => {
      const currentStatus = byId("accountAdminStatus");
      if (currentStatus) currentStatus.textContent = "";
    })
    .catch((error) => {
      const currentStatus = byId("accountAdminStatus");
      if (currentStatus) {
        currentStatus.textContent = error.message;
        currentStatus.classList.add("is-error");
      }
    });
}

async function createAccountUser(event) {
  event.preventDefault();
  const status = byId("accountAdminStatus");
  if (status) {
    status.textContent = "新增中...";
    status.classList.remove("is-error");
  }
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: byId("createUsernameInput")?.value || "",
        displayName: byId("createDisplayNameInput")?.value || "",
        password: byId("createUserPasswordInput")?.value || "",
        role: byId("createUserRoleSelect")?.value || "inside",
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "新增帳號失敗");
    byId("createUserForm")?.reset();
    await loadAccountUsers();
    if (status) status.textContent = "帳號已新增";
  } catch (error) {
    if (status) {
      status.textContent = error.message;
      status.classList.add("is-error");
    }
  }
}

async function saveAccountUser(userId) {
  const row = document.querySelector(`[data-account-user-id="${userId}"]`);
  if (!row) return;
  const status = byId("accountAdminStatus");
  if (status) {
    status.textContent = "保存中...";
    status.classList.remove("is-error");
  }
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: row.querySelector("[data-account-username]")?.value || "",
        displayName: row.querySelector("[data-account-display-name]")?.value || "",
        role: row.querySelector("[data-account-role]")?.value || "inside",
        isActive: Boolean(row.querySelector("[data-account-active]")?.checked),
        password: row.querySelector("[data-account-password]")?.value || "",
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "帳號保存失敗");
    if (result.user && Number(result.user.id) === Number(currentUser?.id)) {
      currentUser = normalizeCurrentUser(result.user);
      renderAuthState();
    }
    await loadAccountUsers();
    if (status) status.textContent = "帳號已保存";
  } catch (error) {
    if (status) {
      status.textContent = error.message;
      status.classList.add("is-error");
    }
  }
}

async function deleteAccountUser(userId) {
  const user = accountUsers.find((item) => Number(item.id) === Number(userId));
  if (!user) return;
  if (!confirm(`刪除帳號「${user.username}」？刪除後該帳號會立即登出。`)) return;
  const status = byId("accountAdminStatus");
  if (status) {
    status.textContent = "刪除中...";
    status.classList.remove("is-error");
  }
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "帳號刪除失敗");
    await loadAccountUsers();
    if (status) status.textContent = "帳號已刪除";
  } catch (error) {
    if (status) {
      status.textContent = error.message;
      status.classList.add("is-error");
    }
  }
}

function syncStoreHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  params.set("page", state.page);
  if (state.page === "inventory" && state.selectedStoreKey) {
    params.set("store", state.selectedStoreKey);
  } else {
    params.delete("store");
  }
  if (state.page === "harvestPlanning" && state.harvestView !== defaultHarvestView) {
    params.set("harvestView", state.harvestView);
  } else {
    params.delete("harvestView");
  }
  if (
    state.page === "fieldWorkMessageBoard"
    && fieldWorkMessageReturnPages.includes(state.fieldWorkMessageReturnPage)
  ) {
    params.set("fieldWorkMessageReturnPage", state.fieldWorkMessageReturnPage);
  } else {
    params.delete("fieldWorkMessageReturnPage");
  }
  if (state.page === "fieldWorkMessageBoard") {
    const scope = fieldWorkMessageScope();
    params.set("fieldWorkMessageDate", scope.date);
    params.set("fieldWorkMessageZoneName", scope.zoneName);
    params.set("fieldWorkMessageNetHouseCode", scope.netHouseCode);
  } else {
    params.delete("fieldWorkMessageDate");
    params.delete("fieldWorkMessageZoneName");
    params.delete("fieldWorkMessageNetHouseCode");
  }
  history.replaceState(null, "", `#${params.toString()}`);
}

function setPage(page, beforeCommit) {
  if (!canUsePage(page)) {
    alert("此帳號沒有使用這個功能的權限");
    return false;
  }
  if (page !== state.page && !canLeaveFieldWorkRecordsPage()) return false;
  if (page !== state.page && !confirmDiscardUnsavedChanges()) return false;
  if (typeof beforeCommit === "function") beforeCommit();
  state.page = page;
  if (page === "netHouseStatusRecords") {
    state.netHouseStatusDate = todayDate();
  }
  if (page !== "fieldWorkMessageBoard") {
    state.fieldWorkMessageReturnPage = "";
  }
  syncStoreHash();
  render();
  return true;
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    if (!button.dataset.view) return;
    if (!canLeaveFieldWorkRecordsPage()) return;
    if (button.dataset.view !== state.view && !confirmDiscardUnsavedChanges()) return;
    if (state.view === "salesPage" && button.dataset.view !== "salesPage") {
      resetDraftShipments();
    }
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    state.view = button.dataset.view;
    render();
  });
});

document.querySelectorAll("[data-harvest-view]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextView = button.dataset.harvestView;
    if (!Object.prototype.hasOwnProperty.call(harvestViewLabels, nextView) || nextView === state.harvestView) return;
    if (!canLeaveFieldWorkRecordsPage()) return;
    if (!confirmDiscardUnsavedChanges()) return;
    state.harvestView = nextView;
    syncStoreHash();
    render();
  });
});

byId("homeNavBtn").addEventListener("click", () => setPage("home"));
byId("loginForm").addEventListener("submit", login);
byId("logoutBtn").addEventListener("click", logout);
byId("fieldWorkRecordsNavBtn").addEventListener("click", openFieldWorkRecordsFromNetHouseStatus);
byId("netHouseStatusNavBtn").addEventListener("click", () => {
  if (state.page === "fieldWorkRecords") {
    openNetHouseStatusFromFieldWorkRecords();
    return;
  }
  setPage("netHouseStatusRecords");
});
byId("dailyVegetableNavBtn").addEventListener("click", () => {
  if (!state.dailyVegetableDate) state.dailyVegetableDate = todayDate();
  setPage("dailyVegetableAvailability");
});
byId("harvestPickListNavBtn").addEventListener("click", () => {
  if (!state.harvestPickListDate) state.harvestPickListDate = state.dailyVegetableDate || todayDate();
  setPage("harvestPickList");
});
byId("headerExportFieldWorkMonthBtn").addEventListener("click", exportFieldWorkMonthExcel);
byId("headerExportFieldBtMonthSummaryBtn").addEventListener("click", exportFieldBtMonthSummaryExcel);
byId("dailyVegetableExportBtn").addEventListener("click", exportDailyVegetableExcel);
byId("inventoryNavBtn").addEventListener("click", () => setPage("inventory"));
byId("manifestNavBtn").addEventListener("click", () => setPage("shipmentManifest"));
byId("harvestNavBtn").addEventListener("click", () => setPage("harvestPlanning"));
byId("yfyNavBtn").addEventListener("click", () => setPage(yfyPageKey));
byId("cityNavBtn").addEventListener("click", () => setPage("city"));
byId("generalChannelNavBtn").addEventListener("click", () => setPage("generalChannel"));
byId("looseVegetableNavBtn").addEventListener("click", () => setPage("looseVegetable"));
byId("enterInventoryBtn").addEventListener("click", () => setPage("inventory"));
byId("enterManifestBtn").addEventListener("click", () => setPage("shipmentManifest"));
byId("enterHarvestBtn").addEventListener("click", () => setPage("harvestPlanning"));
byId("enterFieldWorkRecordsBtn").addEventListener("click", () => setPage("fieldWorkRecords"));
byId("enterFieldBtRecordsBtn").addEventListener("click", () => setPage("fieldBtRecords"));
byId("enterNetHouseStatusRecordsBtn").addEventListener("click", () => setPage("netHouseStatusRecords"));
byId("enterDailyVegetableAvailabilityBtn").addEventListener("click", () => setPage("dailyVegetableAvailability"));
byId("enterHarvestPickListBtn").addEventListener("click", () => {
  if (!state.harvestPickListDate) state.harvestPickListDate = state.dailyVegetableDate || todayDate();
  setPage("harvestPickList");
});
byId("enterYfyBtn").addEventListener("click", () => setPage(yfyPageKey));
byId("enterCityBtn").addEventListener("click", () => setPage("city"));
byId("enterGeneralChannelBtn").addEventListener("click", () => setPage("generalChannel"));
byId("enterLooseVegetableBtn").addEventListener("click", () => setPage("looseVegetable"));
byId("enterAccountUsersBtn").addEventListener("click", () => setPage("accountUsers"));
byId("openManifestStoreModalBtn").addEventListener("click", openManifestStoreModal);
byId("closeManifestStoreModalBtn").addEventListener("click", closeManifestStoreModal);
byId("manifestStoreGroupABtn").addEventListener("click", () => setManifestStorePickerGroup("A"));
byId("manifestStoreGroupBBtn").addEventListener("click", () => setManifestStorePickerGroup("B"));
byId("toggleAllManifestStoresBtn").addEventListener("click", toggleAllManifestStores);
byId("addManifestRoundBtn").addEventListener("click", addManifestRound);
document.querySelectorAll("[data-close-manifest-modal='true']").forEach((item) => {
  item.addEventListener("click", closeManifestStoreModal);
});
byId("toggleAddStoreBtn").addEventListener("click", () => {
  setAddStoreFormVisible(byId("addStoreForm").hidden);
});
byId("cancelAddStoreBtn").addEventListener("click", () => {
  clearAddStoreForm();
  setAddStoreFormVisible(false);
});
byId("addStoreForm").addEventListener("submit", addStore);
byId("deleteStoreBtn").addEventListener("click", deleteSelectedStore);

byId("groupFilter").addEventListener("change", (event) => {
  if (!confirmDiscardUnsavedChanges()) {
    event.target.value = state.group;
    return;
  }
  resetDraftShipments();
  state.group = event.target.value;
  populateStoreControls();
  render();
});
byId("storeSearchInput").addEventListener("input", (event) => {
  state.storeSearch = event.target.value.trim();
  populateStoreControls();
  syncStoreHash();
  render();
});
byId("storeSelect").addEventListener("change", async (event) => {
  await switchSelectedStore(event.target.value, event.target);
});
byId("shipmentDateInput").addEventListener("change", (event) => {
  updateShipmentDate(event.target.value, event.target);
});
byId("dailyVegetableSettingsBtn").addEventListener("click", () => {
  state.dailyVegetableSettingsOpen = !state.dailyVegetableSettingsOpen;
  render();
});
byId("dailyVegetableSettingsDateInput").addEventListener("change", (event) => {
  state.dailyVegetableDate = event.target.value || todayDate();
  render();
});
byId("dailyVegetableSettingsSelectAllBtn")?.addEventListener("click", selectAllProducts);
byId("toggleProductFilterBtn").addEventListener("click", toggleProductFilter);
byId("selectAllProductsBtn").addEventListener("click", selectAllProducts);
byId("openHarvestConversionSettingsBtn").addEventListener("click", () => {
  state.harvestConversionSettingsOpen = true;
  renderActiveHarvestView();
});
byId("importMenuBtn").addEventListener("click", toggleImportMenu);
byId("closeImportMenuBtn").addEventListener("click", () => setImportMenuOpen(false));
byId("salesFileInput").addEventListener("change", (event) => importSalesFile(event.target.files[0]));
byId("importFromWebsiteBtn").addEventListener("click", importSalesFromWebsite);
byId("languageSelect").addEventListener("change", (event) => setAppLanguage(event.target.value));
document.addEventListener("keydown", handleTableInputKeyboardNavigation);
document.addEventListener("keydown", handleSaveShortcut);
document.addEventListener("keydown", handleInventoryStoreSwitchShortcut, true);

window.addEventListener("beforeunload", (event) => {
  if (!hasUnsavedPageInputs()) return;
  event.preventDefault();
  event.returnValue = "";
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    pollInventoryRealtimeSync();
  }
});

applyLocalizedStaticText();
suppressAppInstallPrompt();
registerServiceWorker();

initializeAuthenticatedApp()
  .catch((error) => {
    byId("importStatus").textContent = "資料載入失敗";
    alert(`資料載入失敗：${error.message}`);
  });
