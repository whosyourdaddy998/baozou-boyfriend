(function () {
  var STORAGE_KEY = "rage-boyfriend-mobile-v2";
  var DEFAULT_MODE = "rage";
  var DEFAULT_DRAWER_TAB = "interact";
  var ENDING_THRESHOLD = 50;

  var itemCatalog = [
    {
      id: "fist",
      label: "小拳拳",
      type: "tool",
      cost: 0,
      unlocked: true,
      mood: "hit",
      summary: "免费基础动作，暴揍模式下默认装备。",
      rageTitle: "出拳一下",
      rageLines: [
        "这一拳看起来不重，但很有威慑力。",
        "你是不是专门点开网页来收拾我。",
        "我感觉你这一下打得很熟练。"
      ],
      careLines: [
        "拳头放下，换成摸摸头会更甜一点。",
        "这只小拳拳现在改成爱心拳也来得及。"
      ]
    },
    {
      id: "pat",
      label: "摸摸头",
      type: "tool",
      cost: 0,
      unlocked: true,
      mood: "flirty",
      summary: "抚摸模式专属基础动作，每次点击可获得爱心值。",
      careTitle: "摸头安抚",
      careReward: 2,
      careLines: [
        "你一摸头，我就自动切换乖巧模式。",
        "这个摸头值得再来几次，我可以配合装乖。",
        "爱心值到账，我愿意继续被你摸。"
      ],
      rageLines: [
        "摸头这种温柔招式还是切到抚摸模式更合适。",
        "你这是边打边哄，恋爱执法也太专业了。"
      ]
    },
    {
      id: "pinch",
      label: "捏脸",
      type: "tool",
      cost: 8,
      mood: "pout",
      summary: "圆脸专用，越捏越委屈。",
      rageTitle: "捏脸制裁",
      rageLines: [
        "脸都给你捏圆了，还不许我委屈一下。",
        "这是整蛊还是借机占便宜，我分不太清。",
        "捏一次就想求饶了，但你看起来还没玩够。"
      ]
    },
    {
      id: "slipper",
      label: "丢拖鞋",
      type: "tool",
      cost: 16,
      mood: "annoyed",
      summary: "高能整活道具，威慑效果很足。",
      rageTitle: "拖鞋袭击",
      rageLines: [
        "拖鞋飞来的那一刻，我感觉人生开始回放。",
        "请注意安全距离，拖鞋也是有杀伤力的。",
        "你这一丢很有大女主气场，我不敢躲。"
      ]
    },
    {
      id: "hammer",
      label: "小锤子",
      type: "weapon",
      cost: 24,
      mood: "hit",
      summary: "轻型武器，敲一下会有更明显的反馈。",
      rageTitle: "小锤警告",
      rageLines: [
        "这个小锤子看起来萌，砸下来一点都不萌。",
        "我愿称之为粉色暴力美学。",
        "你举锤的样子，像在执行恋爱天条。"
      ]
    },
    {
      id: "paper-plane",
      label: "纸飞机",
      type: "weapon",
      cost: 32,
      mood: "annoyed",
      summary: "看似轻巧，其实很会羞辱人。",
      rageTitle: "纸飞机狙击",
      rageLines: [
        "连纸飞机都带制导，这还怎么玩。",
        "我刚抬头，它就精准命中我自尊心。",
        "纸飞机飞得很浪漫，结果目标是我。"
      ]
    },
    {
      id: "pillow",
      label: "抱枕",
      type: "weapon",
      cost: 40,
      mood: "flirty",
      summary: "软绵绵的武器，打完还能顺手抱抱。",
      rageTitle: "抱枕暴击",
      rageLines: [
        "被抱枕打了也不亏，至少闻起来香香的。",
        "这算家暴还是情侣打闹，我选择后者。",
        "抱枕飞过来的瞬间，我甚至有点期待。"
      ],
      careLines: [
        "抱枕一抱，今天的检讨书都想重写成情书。",
        "如果打完还能抱一下，那我申请继续配合。"
      ]
    },
    {
      id: "salty-fish",
      label: "咸鱼",
      type: "weapon",
      cost: 56,
      mood: "cry",
      summary: "终极搞怪武器，羞耻值和节目效果拉满。",
      rageTitle: "咸鱼制裁",
      rageLines: [
        "被咸鱼打到的那一刻，我决定立刻认错。",
        "这件武器的精神伤害比物理伤害更大。",
        "你连咸鱼都买了，我今天真的很难活。"
      ]
    }
  ];

  var milestones = [
    {
      id: "total-10",
      title: "委屈脸上线",
      body: "总互动达到 10 次后，角色会更容易切换到委屈表情。",
      check: function (state) {
        return state.totalCount >= 10;
      }
    },
    {
      id: "heart-30",
      title: "甜蜜商店开门",
      body: "累计获得 30 爱心值，证明你已经学会边哄边整蛊。",
      check: function (state) {
        return state.heartEarned >= 30;
      }
    },
    {
      id: "weapon-3",
      title: "武器收藏家",
      body: "解锁 3 个武器类物品后，说明恋爱军火库正在扩张。",
      check: function (state) {
        return countUnlockedByType(state, "weapon") >= 3;
      }
    },
    {
      id: "ending-50",
      title: "今日求生失败",
      body: "总互动达到 50 次后，男朋友会触发抱头认错结局。",
      check: function (state) {
        return state.totalCount >= ENDING_THRESHOLD;
      }
    }
  ];

  var defaultSave = {
    currentMode: DEFAULT_MODE,
    activeTab: DEFAULT_DRAWER_TAB,
    drawerOpen: true,
    customName: "",
    photoDataUrl: "",
    totalCount: 0,
    heartBalance: 0,
    heartEarned: 0,
    rageTapCount: 0,
    careTapCount: 0,
    equippedItemId: "fist",
    lastMood: "idle",
    lastActionLabel: "",
    lastSpeech: "先别急着制裁，点点我试试今天是什么模式。",
    unlockedMilestones: [],
    inventory: buildDefaultInventory(),
    itemUsage: {},
    endingSeen: false
  };

  var state = loadState();
  var toastTimer = null;

  var nodes = {
    drawerToggle: document.getElementById("drawerToggle"),
    rageModeButton: document.getElementById("rageModeButton"),
    careModeButton: document.getElementById("careModeButton"),
    heartBalance: document.getElementById("heartBalance"),
    unlockCount: document.getElementById("unlockCount"),
    stage: document.getElementById("stage"),
    speechBubble: document.getElementById("speechBubble"),
    boyfriendName: document.getElementById("boyfriendName"),
    equippedItemLabel: document.getElementById("equippedItemLabel"),
    characterButton: document.getElementById("characterButton"),
    avatarRoot: document.getElementById("avatarRoot"),
    statusLabel: document.getElementById("statusLabel"),
    modeDescription: document.getElementById("modeDescription"),
    survivalLabel: document.getElementById("survivalLabel"),
    survivalMeter: document.getElementById("survivalMeter"),
    bottomDrawer: document.getElementById("bottomDrawer"),
    activeModeTag: document.getElementById("activeModeTag"),
    interactList: document.getElementById("interactList"),
    shopList: document.getElementById("shopList"),
    totalCount: document.getElementById("totalCount"),
    heartEarned: document.getElementById("heartEarned"),
    rageTapCount: document.getElementById("rageTapCount"),
    careTapCount: document.getElementById("careTapCount"),
    favoriteItem: document.getElementById("favoriteItem"),
    nextUnlock: document.getElementById("nextUnlock"),
    milestoneList: document.getElementById("milestoneList"),
    nameInput: document.getElementById("nameInput"),
    photoInput: document.getElementById("photoInput"),
    photoOverlay: document.getElementById("photoOverlay"),
    removePhotoButton: document.getElementById("removePhotoButton"),
    resetButton: document.getElementById("resetButton"),
    drawerTabs: Array.prototype.slice.call(document.querySelectorAll(".drawer-tab")),
    panels: {
      interact: document.getElementById("panel-interact"),
      shop: document.getElementById("panel-shop"),
      record: document.getElementById("panel-record"),
      settings: document.getElementById("panel-settings")
    },
    toast: document.getElementById("toast"),
    endingDialog: document.getElementById("endingDialog"),
    endingMessage: document.getElementById("endingMessage"),
    closeDialogButton: document.getElementById("closeDialogButton")
  };

  bootstrap();

  function bootstrap() {
    bindEvents();
    hydrateInputs();
    renderAll();
  }

  function bindEvents() {
    nodes.drawerToggle.addEventListener("click", toggleDrawer);
    nodes.rageModeButton.addEventListener("click", function () {
      switchMode("rage");
    });
    nodes.careModeButton.addEventListener("click", function () {
      switchMode("care");
    });
    nodes.characterButton.addEventListener("click", handleCharacterTap);
    nodes.nameInput.addEventListener("input", function (event) {
      state.customName = event.target.value.trim().slice(0, 16);
      saveState();
      renderHeader();
    });
    nodes.photoInput.addEventListener("change", handlePhotoUpload);
    nodes.removePhotoButton.addEventListener("click", removePhoto);
    nodes.resetButton.addEventListener("click", resetProgress);
    nodes.closeDialogButton.addEventListener("click", function () {
      nodes.endingDialog.close();
    });

    nodes.drawerTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab.getAttribute("data-tab"));
      });
    });
  }

  function hydrateInputs() {
    nodes.nameInput.value = state.customName;
    applyPhoto();
  }

  function switchMode(mode) {
    if (state.currentMode === mode) {
      return;
    }
    state.currentMode = mode;
    state.lastSpeech = mode === "rage"
      ? "模式已切到暴揍，点人物就会立刻受到制裁。"
      : "模式已切到抚摸，快来赚爱心值解锁更多花样。";
    state.lastMood = mode === "rage" ? "annoyed" : "flirty";
    saveState();
    renderAll();
    animateAvatar(mode === "rage" ? "spark" : "comforted");
    showToast(mode === "rage" ? "已切到暴揍模式。" : "已切到抚摸模式。");
  }

  function toggleDrawer() {
    state.drawerOpen = !state.drawerOpen;
    saveState();
    renderDrawerState();
  }

  function activateTab(tabId) {
    state.activeTab = tabId;
    saveState();
    renderTabs();
  }

  function handleCharacterTap() {
    var equipped = getEquippedItem();
    var speech;
    state.totalCount += 1;

    if (state.currentMode === "care") {
      var reward = resolveCareReward(equipped);
      state.careTapCount += 1;
      state.heartBalance += reward;
      state.heartEarned += reward;
      speech = pickLine(equipped.careLines || getFallbackCareLines());
      state.lastMood = "flirty";
      state.lastActionLabel = "抚摸人物 +" + reward + " 爱心值";
      showToast("爱心值 +" + reward);
      animateAvatar("comforted");
    } else {
      state.rageTapCount += 1;
      state.lastMood = resolveRageMood(equipped);
      state.lastActionLabel = "点击人物 · " + equipped.label;
      speech = pickLine(equipped.rageLines || getFallbackRageLines());
      showToast("已使用 " + equipped.label);
      animateAvatar(equipped.type === "weapon" ? "spark" : "hit");
    }

    incrementItemUsage(equipped.id);
    state.lastSpeech = speech;
    unlockMilestonesIfNeeded();

    if (state.totalCount >= ENDING_THRESHOLD && !state.endingSeen) {
      state.endingSeen = true;
      openEndingDialog();
    }

    saveState();
    renderAll();
  }

  function renderAll() {
    renderHeader();
    renderModeUI();
    renderStage();
    renderDrawerState();
    renderTabs();
    renderInteract();
    renderShop();
    renderRecords();
    applyPhoto();
  }

  function renderHeader() {
    nodes.boyfriendName.textContent = state.customName || "今日挨揍担当";
  }

  function renderModeUI() {
    var rageActive = state.currentMode === "rage";
    nodes.rageModeButton.classList.toggle("is-active", rageActive);
    nodes.careModeButton.classList.toggle("is-active", !rageActive);
    nodes.activeModeTag.textContent = rageActive ? "暴揍模式" : "抚摸模式";
    nodes.modeDescription.textContent = rageActive
      ? "点击人物会搞怪制裁并掉求生值。"
      : "点击人物会抚摸安抚并获得爱心值。";
    nodes.heartBalance.textContent = String(state.heartBalance);
    nodes.unlockCount.textContent = countUnlockedItems(state) + " / " + itemCatalog.length;
  }

  function renderStage() {
    var survivalPercent = Math.max(4, 100 - Math.min(state.totalCount * 2, 96));
    nodes.stage.className = "character-stage mood-" + (state.lastMood || "idle");
    nodes.speechBubble.textContent = state.lastSpeech;
    nodes.equippedItemLabel.textContent = getEquippedItem().label;
    nodes.statusLabel.textContent = buildStatusLabel();
    nodes.survivalLabel.textContent = survivalPercent + "%";
    nodes.survivalMeter.style.width = survivalPercent + "%";
  }

  function renderDrawerState() {
    nodes.bottomDrawer.classList.toggle("is-open", state.drawerOpen);
    nodes.bottomDrawer.classList.toggle("is-collapsed", !state.drawerOpen);
    nodes.drawerToggle.textContent = state.drawerOpen ? "收起面板" : "展开面板";
    nodes.drawerToggle.setAttribute("aria-expanded", String(state.drawerOpen));
  }

  function renderTabs() {
    nodes.drawerTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-tab") === state.activeTab;
      tab.classList.toggle("is-active", active);
    });
    Object.keys(nodes.panels).forEach(function (key) {
      nodes.panels[key].classList.toggle("is-active", key === state.activeTab);
    });
  }

  function renderInteract() {
    nodes.interactList.innerHTML = itemCatalog.map(function (item) {
      var unlocked = isUnlocked(item.id);
      var equipped = state.equippedItemId === item.id;
      var actionLabel = state.currentMode === "rage"
        ? (item.rageTitle || "点击人物触发")
        : (item.careTitle || "点击人物触发");

      return [
        '<button class="item-button' + (equipped ? " is-equipped" : "") + (unlocked ? "" : " is-locked") + '" type="button" data-item-id="' + escapeHtml(item.id) + '"' + (unlocked ? "" : " disabled") + ">",
        "<strong>" + escapeHtml(item.label) + "</strong>",
        '<span>' + escapeHtml(item.type === "weapon" ? "武器" : "整蛊道具") + " · " + escapeHtml(item.summary) + "</span>",
        '<span>' + escapeHtml(unlocked ? actionLabel : "未解锁，先去商店兑换") + "</span>",
        '<span>' + escapeHtml(equipped ? "当前已装备" : "点击装备") + "</span>",
        "</button>"
      ].join("");
    }).join("");

    Array.prototype.forEach.call(nodes.interactList.querySelectorAll("[data-item-id]"), function (button) {
      button.addEventListener("click", function () {
        var itemId = button.getAttribute("data-item-id");
        equipItem(itemId);
      });
    });
  }

  function renderShop() {
    nodes.shopList.innerHTML = itemCatalog.map(function (item) {
      var unlocked = isUnlocked(item.id);
      var equipped = state.equippedItemId === item.id;
      var canBuy = !unlocked && state.heartBalance >= item.cost;

      return [
        '<article class="shop-card">',
        '<div class="shop-topline">',
        "<strong>" + escapeHtml(item.label) + "</strong>",
        '<span class="type-pill">' + escapeHtml(item.type === "weapon" ? "武器" : "道具") + "</span>",
        "</div>",
        "<p>" + escapeHtml(item.summary) + "</p>",
        '<div class="shop-actions">',
        '<span class="price-pill">' + (item.cost === 0 ? "免费" : item.cost + " 爱心值") + "</span>",
        renderShopAction(item, unlocked, equipped, canBuy),
        "</div>",
        "</article>"
      ].join("");
    }).join("");

    Array.prototype.forEach.call(nodes.shopList.querySelectorAll("[data-buy-item]"), function (button) {
      button.addEventListener("click", function () {
        buyItem(button.getAttribute("data-buy-item"));
      });
    });

    Array.prototype.forEach.call(nodes.shopList.querySelectorAll("[data-equip-item]"), function (button) {
      button.addEventListener("click", function () {
        equipItem(button.getAttribute("data-equip-item"));
      });
    });
  }

  function renderRecords() {
    nodes.totalCount.textContent = String(state.totalCount);
    nodes.heartEarned.textContent = String(state.heartEarned);
    nodes.rageTapCount.textContent = String(state.rageTapCount);
    nodes.careTapCount.textContent = String(state.careTapCount);
    nodes.favoriteItem.textContent = getFavoriteItemLabel();
    nodes.nextUnlock.textContent = getNextMilestoneLabel();
    renderMilestones();
  }

  function renderMilestones() {
    nodes.milestoneList.innerHTML = milestones.map(function (item) {
      var done = state.unlockedMilestones.indexOf(item.id) !== -1;
      return [
        '<article class="milestone-item' + (done ? " is-done" : "") + '">',
        "<div>",
        "<strong>" + escapeHtml(item.title) + "</strong>",
        "<p>" + escapeHtml(item.body) + "</p>",
        "</div>",
        '<span class="tag-chip">' + (done ? "已解锁" : "未达成") + "</span>",
        "</article>"
      ].join("");
    }).join("");
  }

  function equipItem(itemId) {
    if (!isUnlocked(itemId)) {
      showToast("还没解锁这个道具。");
      return;
    }
    state.equippedItemId = itemId;
    state.lastSpeech = "已装备 " + findItem(itemId).label + "，点击人物就能立刻触发。";
    saveState();
    renderAll();
    showToast("已装备 " + findItem(itemId).label);
  }

  function buyItem(itemId) {
    var item = findItem(itemId);
    if (!item || isUnlocked(itemId)) {
      return;
    }
    if (state.heartBalance < item.cost) {
      showToast("爱心值不够，先多抚摸几次。");
      return;
    }

    state.heartBalance -= item.cost;
    state.inventory[itemId] = true;
    state.equippedItemId = itemId;
    state.lastSpeech = "商店已解锁 " + item.label + "，现在点人物就能试试新花样。";
    unlockMilestonesIfNeeded();
    saveState();
    renderAll();
    showToast("已解锁 " + item.label);
  }

  function openEndingDialog() {
    nodes.endingMessage.textContent =
      (state.customName || "男朋友") +
      " 今日求生值已归零，建议你先切到抚摸模式给点补偿。";
    if (typeof nodes.endingDialog.showModal === "function") {
      nodes.endingDialog.showModal();
    }
  }

  function handlePhotoUpload(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      state.photoDataUrl = typeof reader.result === "string" ? reader.result : "";
      saveState();
      applyPhoto();
      showToast("照片已贴脸，只保存在当前浏览器。");
    };
    reader.onerror = function () {
      showToast("照片读取失败。");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removePhoto() {
    if (!state.photoDataUrl) {
      showToast("当前还没有上传照片。");
      return;
    }
    state.photoDataUrl = "";
    saveState();
    applyPhoto();
    showToast("已移除照片。");
  }

  function applyPhoto() {
    if (!state.photoDataUrl) {
      nodes.photoOverlay.classList.add("hidden");
      nodes.photoOverlay.removeAttribute("src");
      return;
    }
    nodes.photoOverlay.src = state.photoDataUrl;
    nodes.photoOverlay.classList.remove("hidden");
  }

  function resetProgress() {
    state = clone(defaultSave);
    saveState();
    hydrateInputs();
    renderAll();
    showToast("已重置全部进度。");
  }

  function unlockMilestonesIfNeeded() {
    milestones.forEach(function (item) {
      if (item.check(state) && state.unlockedMilestones.indexOf(item.id) === -1) {
        state.unlockedMilestones.push(item.id);
        showToast("达成彩蛋：" + item.title);
      }
    });
  }

  function animateAvatar(kind) {
    nodes.avatarRoot.classList.remove("hit", "comforted", "spark");
    nodes.avatarRoot.offsetWidth;
    nodes.avatarRoot.classList.add(kind);
  }

  function renderShopAction(item, unlocked, equipped, canBuy) {
    if (unlocked) {
      return '<button class="shop-button' + (equipped ? " is-secondary" : "") + '" type="button" data-equip-item="' + escapeHtml(item.id) + '">' + (equipped ? "已装备" : "装备") + "</button>";
    }
    return '<button class="shop-button" type="button" data-buy-item="' + escapeHtml(item.id) + '"' + (canBuy ? "" : " disabled") + ">解锁</button>";
  }

  function resolveCareReward(item) {
    if (item.id === "pat") {
      return 3;
    }
    if (item.type === "weapon") {
      return 1;
    }
    return 2;
  }

  function resolveRageMood(item) {
    if (item.id === "slipper" || item.id === "paper-plane") {
      return "annoyed";
    }
    if (item.id === "salty-fish" || state.totalCount >= ENDING_THRESHOLD) {
      return "cry";
    }
    if (item.id === "pinch") {
      return "pout";
    }
    if (item.id === "pillow") {
      return "flirty";
    }
    return "hit";
  }

  function buildStatusLabel() {
    if (state.totalCount >= ENDING_THRESHOLD) {
      return "今日求生失败";
    }
    if (state.currentMode === "care") {
      return "安抚回血中";
    }
    if (state.totalCount >= 30) {
      return "疯狂求饶中";
    }
    if (state.totalCount >= 10) {
      return "委屈升级中";
    }
    return "待机观察中";
  }

  function getNextMilestoneLabel() {
    var pending = milestones.find(function (item) {
      return state.unlockedMilestones.indexOf(item.id) === -1;
    });
    return pending ? pending.title : "全部彩蛋已解锁";
  }

  function getFavoriteItemLabel() {
    var bestId = null;
    Object.keys(state.itemUsage).forEach(function (itemId) {
      if (!bestId || state.itemUsage[itemId] > state.itemUsage[bestId]) {
        bestId = itemId;
      }
    });
    if (!bestId) {
      return getEquippedItem().label;
    }
    return findItem(bestId).label + " · " + state.itemUsage[bestId] + " 次";
  }

  function incrementItemUsage(itemId) {
    state.itemUsage[itemId] = (state.itemUsage[itemId] || 0) + 1;
  }

  function findItem(itemId) {
    return itemCatalog.find(function (item) {
      return item.id === itemId;
    });
  }

  function getEquippedItem() {
    return findItem(state.equippedItemId) || itemCatalog[0];
  }

  function isUnlocked(itemId) {
    return Boolean(state.inventory[itemId]);
  }

  function countUnlockedItems(stateValue) {
    return Object.keys(stateValue.inventory).filter(function (itemId) {
      return stateValue.inventory[itemId];
    }).length;
  }

  function countUnlockedByType(stateValue, type) {
    return itemCatalog.filter(function (item) {
      return item.type === type && stateValue.inventory[item.id];
    }).length;
  }

  function getFallbackRageLines() {
    return [
      "你这一点，我条件反射就开始认错。",
      "这个页面就是你合法制裁我的秘密基地吧。",
      "我已经准备好下一句求饶台词了。"
    ];
  }

  function getFallbackCareLines() {
    return [
      "这个摸头很有效，我决定继续装乖。",
      "爱心值到账，我今天可以再听话一点。",
      "你一温柔，我就开始怀疑刚才是不是打轻了。"
    ];
  }

  function pickLine(lines) {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function buildDefaultInventory() {
    var inventory = {};
    itemCatalog.forEach(function (item) {
      inventory[item.id] = Boolean(item.unlocked);
    });
    return inventory;
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return clone(defaultSave);
      }
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      return clone(defaultSave);
    }
  }

  function normalizeState(value) {
    var next = clone(defaultSave);
    if (!value || typeof value !== "object") {
      return next;
    }
    next.currentMode = value.currentMode === "care" ? "care" : "rage";
    next.activeTab = isKnownTab(value.activeTab) ? value.activeTab : DEFAULT_DRAWER_TAB;
    next.drawerOpen = value.drawerOpen !== false;
    next.customName = typeof value.customName === "string" ? value.customName.slice(0, 16) : "";
    next.photoDataUrl = typeof value.photoDataUrl === "string" ? value.photoDataUrl : "";
    next.totalCount = numberOrZero(value.totalCount);
    next.heartBalance = numberOrZero(value.heartBalance);
    next.heartEarned = numberOrZero(value.heartEarned);
    next.rageTapCount = numberOrZero(value.rageTapCount);
    next.careTapCount = numberOrZero(value.careTapCount);
    next.equippedItemId = findItem(value.equippedItemId) ? value.equippedItemId : "fist";
    next.lastMood = typeof value.lastMood === "string" ? value.lastMood : "idle";
    next.lastActionLabel = typeof value.lastActionLabel === "string" ? value.lastActionLabel : "";
    next.lastSpeech = typeof value.lastSpeech === "string" ? value.lastSpeech : defaultSave.lastSpeech;
    next.unlockedMilestones = Array.isArray(value.unlockedMilestones)
      ? value.unlockedMilestones.filter(isKnownMilestone)
      : [];
    next.inventory = normalizeInventory(value.inventory);
    next.itemUsage = value.itemUsage && typeof value.itemUsage === "object" ? value.itemUsage : {};
    next.endingSeen = Boolean(value.endingSeen);
    return next;
  }

  function normalizeInventory(value) {
    var inventory = buildDefaultInventory();
    if (!value || typeof value !== "object") {
      return inventory;
    }
    itemCatalog.forEach(function (item) {
      if (item.cost === 0) {
        inventory[item.id] = true;
      } else {
        inventory[item.id] = Boolean(value[item.id]);
      }
    });
    return inventory;
  }

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function isKnownTab(tabId) {
    return ["interact", "shop", "record", "settings"].indexOf(tabId) !== -1;
  }

  function isKnownMilestone(id) {
    return milestones.some(function (item) {
      return item.id === id;
    });
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    nodes.toast.textContent = message;
    nodes.toast.classList.remove("hidden");
    toastTimer = window.setTimeout(function () {
      nodes.toast.classList.add("hidden");
    }, 2200);
  }

  function numberOrZero(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
