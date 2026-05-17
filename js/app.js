(function () {
  var STORAGE_KEY = "rage-boyfriend-mobile-v3";
  var LEGACY_STORAGE_KEY = "rage-boyfriend-mobile-v2";
  var DEFAULT_MODE = "rage";
  var DEFAULT_DRAWER_TAB = "interact";
  var ENDING_THRESHOLD = 50;
  var AREA_SPAM_WINDOW_MS = 3000;
  var AREA_SPAM_LIMIT = 5;
  var AREA_LOCK_MS = 4000;

  var itemCatalog = [
    {
      id: "fist",
      label: "小拳拳",
      icon: "👊",
      type: "tool",
      cost: 0,
      unlocked: true,
      usableModes: ["rage"],
      affectionChange: -1,
      moodChange: "annoyed",
      useText: "一拳下去，先把气势做足。",
      rageTitle: "小拳拳制裁",
      rageLines: [
        "你这一拳不重，但威慑力很足。",
        "我怀疑你打开网页就是为了合法收拾我。",
        "这个出手动作，一看就练过。"
      ]
    },
    {
      id: "pat",
      label: "摸摸头",
      icon: "🫳",
      type: "tool",
      cost: 0,
      unlocked: true,
      usableModes: ["care"],
      affectionChange: 2,
      moodChange: "happy",
      heartReward: 2,
      useText: "抚摸一下，先把气氛哄软。",
      careTitle: "摸头安抚",
      careLines: [
        "你一摸头，我就自动切换乖巧模式。",
        "就让你摸这一下，再多我可要脸红了。",
        "这个动作很有用，我决定稍微听话一点。"
      ]
    },
    {
      id: "milk-tea",
      label: "奶茶",
      icon: "🧋",
      type: "gift",
      cost: 10,
      usableModes: ["care"],
      affectionChange: 3,
      moodChange: "happy",
      heartReward: 0,
      useText: "你怎么知道我现在正想喝这个？",
      careTitle: "递上奶茶",
      careLines: [
        "好吧，这杯奶茶确实很会哄人。",
        "你突然这么贴心，我都有点不习惯了。",
        "这一口下去，我决定少跟你计较一点。"
      ],
      summary: "补给型礼物，主打回血和哄人。"
    },
    {
      id: "flower",
      label: "鲜花",
      icon: "💐",
      type: "gift",
      cost: 18,
      usableModes: ["care"],
      affectionChange: 5,
      moodChange: "shy",
      heartReward: 0,
      useText: "突然送花真的很犯规。",
      careTitle: "送上一束花",
      careLines: [
        "你这样我真的会不好意思。",
        "花收下了，但你别以为这样就能全免处罚。",
        "行吧，这次被你拿捏到了。"
      ],
      summary: "高好感礼物，适合快速升温。"
    },
    {
      id: "snack",
      label: "零食",
      icon: "🍪",
      type: "gift",
      cost: 14,
      usableModes: ["care"],
      affectionChange: 2,
      moodChange: "happy",
      heartReward: 1,
      useText: "拿零食哄人，虽然老套但有效。",
      careTitle: "投喂零食",
      careLines: [
        "你是不是早就发现我嘴硬但很好哄。",
        "这个零食来得正好，我心情立刻好一点。",
        "边吃边被你哄，感觉也不是不行。"
      ],
      summary: "小额礼物，稳定提升心情。"
    },
    {
      id: "slipper",
      label: "丢拖鞋",
      icon: "🩴",
      type: "tool",
      cost: 16,
      usableModes: ["rage"],
      affectionChange: -2,
      moodChange: "angry",
      useText: "拖鞋是威慑，不是简单的投掷物。",
      rageTitle: "拖鞋袭击",
      rageLines: [
        "拖鞋飞来的那一刻，我的人生开始回放。",
        "这一丢很有气势，我根本不敢躲。",
        "拖鞋也能丢出压迫感，真有你的。"
      ],
      summary: "高能整活道具，节目效果很强。"
    },
    {
      id: "pillow",
      label: "抱枕",
      icon: "🛋️",
      type: "weapon",
      cost: 28,
      usableModes: ["rage", "care"],
      affectionChange: 1,
      moodChange: "speechless",
      useText: "软绵绵的攻击，打完还能顺手抱一下。",
      rageTitle: "抱枕暴击",
      careTitle: "抱枕贴贴",
      rageLines: [
        "被抱枕砸了也不亏，至少闻起来香香的。",
        "你这是整蛊里带一点温柔，让我没法纯生气。",
        "抱枕飞过来的瞬间，我甚至有点期待。"
      ],
      careLines: [
        "这个抱枕看起来像是给我台阶下。",
        "如果打完还能抱一下，那就算你会哄。",
        "这样贴过来，我连生气都不太有底气了。"
      ],
      summary: "兼容两种模式的混合型道具。"
    },
    {
      id: "hammer",
      label: "小锤子",
      icon: "🔨",
      type: "weapon",
      cost: 36,
      usableModes: ["rage"],
      affectionChange: -3,
      moodChange: "angry",
      useText: "视觉威慑极强的整蛊武器。",
      rageTitle: "小锤警告",
      rageLines: [
        "这个小锤子看着可爱，敲下来一点都不可爱。",
        "你举锤的姿势，像在执行恋爱天条。",
        "我已经准备好在下一秒认错了。"
      ],
      summary: "高级武器，适合暴揍模式后期使用。"
    }
  ];

  var bodyAreas = {
    head: {
      name: "头部",
      expression: "happy",
      punishable: false,
      punishExpression: "angry",
      punishTexts: [
        "头发都要被你揉乱了，先停一下。",
        "摸归摸，别把我当宠物。",
        "我知道你喜欢这个位置，但也别太频繁。"
      ],
      modes: {
        rage: {
          affectionChange: 0,
          heartChange: 0,
          expression: "speechless",
          mood: "annoyed",
          texts: [
            "别总敲我头，我会怀疑你在记仇。",
            "头顶属于警告区，打一下就够了吧。",
            "这一下更多是羞辱，不是伤害。"
          ]
        },
        care: {
          affectionChange: 2,
          heartChange: 2,
          expression: "happy",
          mood: "happy",
          texts: [
            "别把我当小孩啊……不过这一下还挺舒服。",
            "你一摸头，我就很难继续嘴硬。",
            "好吧，就让你多摸一下。"
          ]
        }
      }
    },
    face: {
      name: "脸部",
      expression: "shy",
      punishable: true,
      punishExpression: "angry",
      punishTexts: [
        "别一直捏脸，我真的会躲开。",
        "你是不是故意看我脸红。",
        "这个地方玩太久，我就要翻脸了。"
      ],
      modes: {
        rage: {
          affectionChange: -1,
          heartChange: 0,
          expression: "speechless",
          mood: "speechless",
          texts: [
            "脸都要给你捏圆了，还不打算停吗。",
            "你这根本不是制裁，是借机占便宜。",
            "再这样下去，我连表情管理都做不到了。"
          ]
        },
        care: {
          affectionChange: 1,
          heartChange: 1,
          expression: "shy",
          mood: "shy",
          texts: [
            "你靠太近了，我有点不好意思。",
            "一直摸脸算什么招式……挺犯规的。",
            "别看了，我知道自己现在脸有点红。"
          ]
        }
      }
    },
    hand: {
      name: "手部",
      expression: "happy",
      punishable: false,
      punishExpression: "speechless",
      punishTexts: [
        "手都要被你拉麻了，休息一会吧。",
        "你今天很黏人欸。",
        "给你牵可以，但别一直不松手。"
      ],
      modes: {
        rage: {
          affectionChange: 0,
          heartChange: 0,
          expression: "speechless",
          mood: "speechless",
          texts: [
            "你这是警告我，还是想让我配合一点？",
            "手都被你拍麻了，我已经准备认错。",
            "这个地方打起来，羞耻感比疼更重。"
          ]
        },
        care: {
          affectionChange: 2,
          heartChange: 2,
          expression: "happy",
          mood: "happy",
          texts: [
            "牵手这种动作对好感提升真的很快。",
            "你这样来拉我，我会默认你在示好。",
            "好吧，手给你，但只许温柔一点。"
          ]
        }
      }
    },
    shoulder: {
      name: "肩膀",
      expression: "tired",
      punishable: false,
      punishExpression: "speechless",
      punishTexts: [
        "肩膀已经被你拍酸了，先缓一缓。",
        "安慰归安慰，也别一直按同一个地方。",
        "我知道你在示好，但这也太频繁了。"
      ],
      modes: {
        rage: {
          affectionChange: -1,
          heartChange: 0,
          expression: "speechless",
          mood: "annoyed",
          texts: [
            "肩膀上这一下，很像在催我赶紧认错。",
            "你拍这里的时候，语气都显得更强势了。",
            "这种动作比直接打还让人压力大。"
          ]
        },
        care: {
          affectionChange: 2,
          heartChange: 1,
          expression: "tired",
          mood: "tired",
          texts: [
            "你这样拍肩膀，像在安慰我一样。",
            "这一下有点像按摩，我勉强给高分。",
            "好吧，肩膀这里确实有被你安抚到。"
          ]
        }
      }
    },
    sensitive: {
      name: "身体敏感区",
      expression: "angry",
      punishable: true,
      punishExpression: "angry",
      punishTexts: [
        "都说了这个地方不可以，再碰就锁区。",
        "你今天是故意试探我底线吗。",
        "这个地方要立刻禁止继续互动。"
      ],
      modes: {
        rage: {
          affectionChange: -3,
          heartChange: 0,
          expression: "angry",
          mood: "angry",
          texts: [
            "这个地方不可以乱碰。",
            "喂，你注意一点，我真的会生气。",
            "再试一次，我就直接翻脸。"
          ]
        },
        care: {
          affectionChange: -2,
          heartChange: -1,
          expression: "angry",
          mood: "angry",
          texts: [
            "抚摸模式也不代表什么都可以。",
            "这个位置不能当成开玩笑。",
            "你再这样，我连奶茶都不想收了。"
          ]
        }
      }
    }
  };

  var milestones = [
    {
      id: "total-10",
      title: "委屈脸上线",
      body: "总互动达到 10 次后，他开始更容易露出委屈和无语表情。",
      check: function (state) {
        return state.totalCount >= 10;
      }
    },
    {
      id: "heart-20",
      title: "会哄人了",
      body: "累计获得 20 爱心值，说明你已经掌握基本安抚技巧。",
      check: function (state) {
        return state.heartEarned >= 20;
      }
    },
    {
      id: "affection-15",
      title: "关系升温",
      body: "好感值达到 15，开始具备后续事件和等级扩展空间。",
      check: function (state) {
        return state.affection >= 15;
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
    affection: 0,
    mood: "neutral",
    currentExpression: "normal",
    rageTapCount: 0,
    careTapCount: 0,
    equippedItemId: "fist",
    lastSpeech: "先别急着出手，点不同位置看看今天会发生什么。",
    lastTouchedArea: "",
    areaClickCounts: {},
    areaLockUntil: {},
    unlockedMilestones: [],
    unlockedEvents: [],
    inventory: buildDefaultInventory(),
    itemUsage: {},
    debugHotspots: false,
    endingSeen: false
  };

  var state = loadState();
  var toastTimer = null;

  var nodes = {
    drawerToggle: document.getElementById("drawerToggle"),
    rageModeButton: document.getElementById("rageModeButton"),
    careModeButton: document.getElementById("careModeButton"),
    heartBalance: document.getElementById("heartBalance"),
    affectionValue: document.getElementById("affectionValue"),
    unlockCount: document.getElementById("unlockCount"),
    stage: document.getElementById("stage"),
    speechBubble: document.getElementById("speechBubble"),
    boyfriendName: document.getElementById("boyfriendName"),
    equippedItemLabel: document.getElementById("equippedItemLabel"),
    avatarRoot: document.getElementById("avatarRoot"),
    hotspotLayer: document.getElementById("hotspotLayer"),
    floatingFeedback: document.getElementById("floatingFeedback"),
    statusLabel: document.getElementById("statusLabel"),
    lastAreaLabel: document.getElementById("lastAreaLabel"),
    modeDescription: document.getElementById("modeDescription"),
    expressionLabel: document.getElementById("expressionLabel"),
    survivalLabel: document.getElementById("survivalLabel"),
    survivalMeter: document.getElementById("survivalMeter"),
    bottomDrawer: document.getElementById("bottomDrawer"),
    activeModeTag: document.getElementById("activeModeTag"),
    interactList: document.getElementById("interactList"),
    shopList: document.getElementById("shopList"),
    totalCount: document.getElementById("totalCount"),
    heartEarned: document.getElementById("heartEarned"),
    recordAffection: document.getElementById("recordAffection"),
    rageTapCount: document.getElementById("rageTapCount"),
    careTapCount: document.getElementById("careTapCount"),
    favoriteItem: document.getElementById("favoriteItem"),
    moodLabel: document.getElementById("moodLabel"),
    nextUnlock: document.getElementById("nextUnlock"),
    milestoneList: document.getElementById("milestoneList"),
    nameInput: document.getElementById("nameInput"),
    photoInput: document.getElementById("photoInput"),
    photoOverlay: document.getElementById("photoOverlay"),
    debugHotspotButton: document.getElementById("debugHotspotButton"),
    removePhotoButton: document.getElementById("removePhotoButton"),
    resetButton: document.getElementById("resetButton"),
    drawerTabs: Array.prototype.slice.call(document.querySelectorAll(".drawer-tab")),
    hotspots: Array.prototype.slice.call(document.querySelectorAll(".hotspot")),
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
    nodes.nameInput.addEventListener("input", function (event) {
      state.customName = event.target.value.trim().slice(0, 16);
      saveState();
      renderHeader();
    });
    nodes.photoInput.addEventListener("change", handlePhotoUpload);
    nodes.debugHotspotButton.addEventListener("click", toggleDebugHotspots);
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

    nodes.hotspots.forEach(function (button) {
      button.addEventListener("click", function () {
        handleAreaInteraction(button.getAttribute("data-area-id"));
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
    ensureCompatibleEquip();
    state.lastSpeech = mode === "rage"
      ? "已切到暴揍模式。点不同位置会出现更强烈的反应。"
      : "已切到抚摸模式。现在更适合赚爱心值和拉好感。";
    state.currentExpression = mode === "rage" ? "speechless" : "happy";
    state.mood = mode === "rage" ? "annoyed" : "happy";
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

  function toggleDebugHotspots() {
    state.debugHotspots = !state.debugHotspots;
    saveState();
    renderHotspotDebug();
    showToast(state.debugHotspots ? "热区调试已开启。" : "热区调试已关闭。");
  }

  function handleAreaInteraction(areaId) {
    var area = bodyAreas[areaId];
    var now = Date.now();
    var modeConfig = area.modes[state.currentMode];
    var equipped = getEquippedItem();
    var effects = [];

    if (!area) {
      return;
    }

    if (isAreaLocked(areaId, now)) {
      state.currentExpression = "angry";
      state.mood = "angry";
      state.lastTouchedArea = areaId;
      state.lastSpeech = "这个区域刚被你惹毛了，先冷静几秒再碰。";
      saveState();
      renderAll();
      animateAvatar("annoyed");
      effects.push({ text: "锁定中", type: "bad" });
      renderFloatingFeedback(effects);
      showToast("他现在不让你碰这里。");
      return;
    }

    registerAreaClick(areaId, now);
    state.totalCount += 1;
    state.lastTouchedArea = areaId;
    state.lastSpeech = pickLine(modeConfig.texts);
    state.currentExpression = modeConfig.expression;
    state.mood = modeConfig.mood;

    if (state.currentMode === "rage") {
      state.rageTapCount += 1;
    } else {
      state.careTapCount += 1;
    }

    applyStatDelta("affection", modeConfig.affectionChange, effects, "好感");
    applyStatDelta("heartBalance", modeConfig.heartChange, effects, "爱心");
    if (modeConfig.heartChange > 0) {
      state.heartEarned += modeConfig.heartChange;
    }

    var itemApplied = applyEquippedItemEffect(equipped, effects);
    incrementItemUsage(equipped.id);

    if (area.punishable && isAreaSpamTriggered(areaId)) {
      triggerAreaPunish(areaId, area, effects);
    }

    unlockMilestonesIfNeeded();

    if (state.totalCount >= ENDING_THRESHOLD && !state.endingSeen) {
      state.endingSeen = true;
      openEndingDialog();
    }

    saveState();
    renderAll();
    animateAvatar(resolveAnimation(itemApplied));
    renderFloatingFeedback(effects);
  }

  function renderAll() {
    renderHeader();
    renderModeUI();
    renderStage();
    renderDrawerState();
    renderTabs();
    renderHotspotDebug();
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
      ? "暴揍模式更适合整蛊和武器类道具，会让他更快出现无语或生气反应。"
      : "抚摸模式主要赚爱心值，并通过温柔互动慢慢提升好感。";
    nodes.heartBalance.textContent = String(state.heartBalance);
    nodes.affectionValue.textContent = String(state.affection);
    nodes.unlockCount.textContent = countUnlockedItems(state) + " / " + itemCatalog.length;
    nodes.debugHotspotButton.textContent = state.debugHotspots ? "关闭热区调试" : "显示热区调试";
  }

  function renderStage() {
    var survivalPercent = Math.max(4, 100 - Math.min(state.rageTapCount * 3 + state.totalCount, 96));
    var expressionClass = "expression-" + state.currentExpression;
    var moodClass = "mood-" + state.mood;
    nodes.stage.className = "character-stage " + expressionClass + " " + moodClass;
    nodes.speechBubble.textContent = state.lastSpeech;
    nodes.equippedItemLabel.textContent = getEquippedItem().icon + " " + getEquippedItem().label;
    nodes.statusLabel.textContent = buildStatusLabel();
    nodes.lastAreaLabel.textContent = state.lastTouchedArea ? bodyAreas[state.lastTouchedArea].name : "还没开始互动";
    nodes.expressionLabel.textContent = getExpressionLabel(state.currentExpression);
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

  function renderHotspotDebug() {
    nodes.hotspotLayer.classList.toggle("is-debug", state.debugHotspots);
  }

  function renderInteract() {
    nodes.interactList.innerHTML = itemCatalog.map(function (item) {
      var unlocked = isUnlocked(item.id);
      var equipped = state.equippedItemId === item.id;
      var usable = isItemUsableInMode(item, state.currentMode);

      return [
        '<button class="item-button' + (equipped ? " is-equipped" : "") + (unlocked ? "" : " is-locked") + '" type="button" data-item-id="' + escapeHtml(item.id) + '"' + (unlocked ? "" : " disabled") + ">",
        "<strong>" + escapeHtml(item.icon + " " + item.label) + "</strong>",
        '<span>' + escapeHtml(item.type === "weapon" ? "武器" : item.type === "gift" ? "礼物" : "基础动作") + " · " + escapeHtml(buildItemSummary(item)) + "</span>",
        '<span>' + escapeHtml(unlocked ? (usable ? "点击装备，可叠加到身体互动上" : "当前模式下效果较弱，建议切换模式") : "未解锁，请先去商店兑换") + "</span>",
        '<span>' + escapeHtml(equipped ? "当前已装备" : "点击装备") + "</span>",
        "</button>"
      ].join("");
    }).join("");

    Array.prototype.forEach.call(nodes.interactList.querySelectorAll("[data-item-id]"), function (button) {
      button.addEventListener("click", function () {
        equipItem(button.getAttribute("data-item-id"));
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
        "<strong>" + escapeHtml(item.icon + " " + item.label) + "</strong>",
        '<span class="type-pill">' + escapeHtml(item.type === "weapon" ? "武器" : item.type === "gift" ? "礼物" : "道具") + "</span>",
        "</div>",
        "<p>" + escapeHtml(buildItemSummary(item)) + "</p>",
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
    nodes.recordAffection.textContent = String(state.affection);
    nodes.rageTapCount.textContent = String(state.rageTapCount);
    nodes.careTapCount.textContent = String(state.careTapCount);
    nodes.favoriteItem.textContent = getFavoriteItemLabel();
    nodes.moodLabel.textContent = getMoodLabel(state.mood);
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
        '<span class="tag-chip">' + (done ? "已达成" : "未达成") + "</span>",
        "</article>"
      ].join("");
    }).join("");
  }

  function equipItem(itemId) {
    if (!isUnlocked(itemId)) {
      showToast("这个道具还没解锁。");
      return;
    }
    state.equippedItemId = itemId;
    state.lastSpeech = "已装备 " + findItem(itemId).label + "。现在点不同位置会叠加它的反馈。";
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
    state.lastSpeech = "商店已解锁 " + item.label + "，现在它会加入互动反馈。";
    unlockMilestonesIfNeeded();
    saveState();
    renderAll();
    showToast("已解锁 " + item.label);
  }

  function applyEquippedItemEffect(item, effects) {
    var usable = isItemUsableInMode(item, state.currentMode);
    if (!item || !usable) {
      return false;
    }

    if (item.affectionChange) {
      applyStatDelta("affection", item.affectionChange, effects, "好感");
    }

    if (item.moodChange) {
      state.mood = item.moodChange;
    }

    if (state.currentMode === "care" && Number(item.heartReward || 0) > 0) {
      applyStatDelta("heartBalance", item.heartReward, effects, "爱心");
      state.heartEarned += item.heartReward;
    }

    if (item.useText) {
      state.lastSpeech = item.useText + " " + pickLine(getLinesByMode(item));
    }

    return true;
  }

  function triggerAreaPunish(areaId, area, effects) {
    state.areaLockUntil[areaId] = Date.now() + AREA_LOCK_MS;
    state.currentExpression = area.punishExpression || "angry";
    state.mood = "angry";
    state.lastSpeech = pickLine(area.punishTexts);
    applyStatDelta("affection", -3, effects, "好感");
    effects.push({ text: "区域锁定", type: "bad" });
    showToast(area.name + " 已暂时锁定。");
  }

  function registerAreaClick(areaId, now) {
    var list = state.areaClickCounts[areaId] || [];
    list = list.filter(function (value) {
      return now - value <= AREA_SPAM_WINDOW_MS;
    });
    list.push(now);
    state.areaClickCounts[areaId] = list;
  }

  function isAreaSpamTriggered(areaId) {
    var list = state.areaClickCounts[areaId] || [];
    return list.length > AREA_SPAM_LIMIT;
  }

  function isAreaLocked(areaId, now) {
    return Number(state.areaLockUntil[areaId] || 0) > now;
  }

  function applyStatDelta(key, delta, effects, label) {
    if (!delta) {
      return;
    }
    state[key] = Math.max(0, numberOrZero(state[key]) + delta);
    effects.push({
      text: label + " " + (delta > 0 ? "+" + delta : String(delta)),
      type: delta > 0 ? "good" : "bad"
    });
  }

  function renderFloatingFeedback(entries) {
    nodes.floatingFeedback.innerHTML = "";
    entries.forEach(function (entry, index) {
      var node = document.createElement("span");
      node.className = "floating-tag " + (entry.type || "info");
      node.style.top = 40 + index * 8 + "%";
      node.textContent = entry.text;
      nodes.floatingFeedback.appendChild(node);
      window.setTimeout(function () {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }, 1200);
    });
  }

  function openEndingDialog() {
    nodes.endingMessage.textContent =
      (state.customName || "男朋友") +
      " 今日求生值已经归零。建议你先切回抚摸模式，给他一点补偿。";
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
    nodes.avatarRoot.classList.remove("hit", "comforted", "spark", "annoyed");
    nodes.avatarRoot.offsetWidth;
    nodes.avatarRoot.classList.add(kind);
  }

  function resolveAnimation(itemApplied) {
    if (state.currentExpression === "angry") {
      return "annoyed";
    }
    if (state.currentMode === "care") {
      return "comforted";
    }
    return itemApplied ? "spark" : "hit";
  }

  function ensureCompatibleEquip() {
    var current = getEquippedItem();
    if (isItemUsableInMode(current, state.currentMode)) {
      return;
    }
    var fallback = itemCatalog.find(function (item) {
      return isUnlocked(item.id) && isItemUsableInMode(item, state.currentMode);
    });
    if (fallback) {
      state.equippedItemId = fallback.id;
    }
  }

  function renderShopAction(item, unlocked, equipped, canBuy) {
    if (unlocked) {
      return '<button class="shop-button' + (equipped ? " is-secondary" : "") + '" type="button" data-equip-item="' + escapeHtml(item.id) + '">' + (equipped ? "已装备" : "装备") + "</button>";
    }
    return '<button class="shop-button" type="button" data-buy-item="' + escapeHtml(item.id) + '"' + (canBuy ? "" : " disabled") + ">解锁</button>";
  }

  function buildItemSummary(item) {
    var prefix = item.summary || item.useText || "";
    return prefix + (item.usableModes ? " · 适用：" + item.usableModes.join("/") : "");
  }

  function getLinesByMode(item) {
    return state.currentMode === "care"
      ? (item.careLines || item.rageLines || [])
      : (item.rageLines || item.careLines || []);
  }

  function isItemUsableInMode(item, mode) {
    return !item.usableModes || item.usableModes.indexOf(mode) !== -1;
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

  function buildStatusLabel() {
    if (state.totalCount >= ENDING_THRESHOLD) {
      return "今日求生失败";
    }
    if (state.mood === "angry") {
      return "明显不爽中";
    }
    if (state.affection >= 20) {
      return "关系升温中";
    }
    if (state.currentMode === "care") {
      return "安抚回血中";
    }
    return "待机观察中";
  }

  function getNextMilestoneLabel() {
    var pending = milestones.find(function (item) {
      return state.unlockedMilestones.indexOf(item.id) === -1;
    });
    return pending ? pending.title : "全部彩蛋已解锁";
  }

  function getMoodLabel(mood) {
    switch (mood) {
      case "happy":
        return "开心";
      case "shy":
        return "害羞";
      case "angry":
        return "生气";
      case "speechless":
        return "无语";
      case "tired":
        return "疲惫";
      case "annoyed":
        return "不耐烦";
      default:
        return "平静";
    }
  }

  function getExpressionLabel(expression) {
    switch (expression) {
      case "happy":
        return "开心";
      case "shy":
        return "害羞";
      case "angry":
        return "生气";
      case "speechless":
        return "无语";
      case "tired":
        return "疲惫";
      default:
        return "普通";
    }
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

  function buildDefaultInventory() {
    var inventory = {};
    itemCatalog.forEach(function (item) {
      inventory[item.id] = Boolean(item.unlocked);
    });
    return inventory;
  }

  function loadState() {
    var next = null;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        next = normalizeState(JSON.parse(raw));
      }
    } catch (error) {
      next = null;
    }

    if (next) {
      return next;
    }

    try {
      var legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        return migrateLegacyState(JSON.parse(legacyRaw));
      }
    } catch (legacyError) {
      return clone(defaultSave);
    }

    return clone(defaultSave);
  }

  function migrateLegacyState(value) {
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
    next.affection = Math.max(0, Math.floor(numberOrZero(value.totalCount) / 2));
    next.mood = "neutral";
    next.currentExpression = "normal";
    next.rageTapCount = numberOrZero(value.rageTapCount);
    next.careTapCount = numberOrZero(value.careTapCount);
    next.equippedItemId = findItem(value.equippedItemId) ? value.equippedItemId : "fist";
    next.lastSpeech = typeof value.lastSpeech === "string" ? value.lastSpeech : defaultSave.lastSpeech;
    next.unlockedMilestones = Array.isArray(value.unlockedMilestones)
      ? value.unlockedMilestones.filter(isKnownMilestone)
      : [];
    next.inventory = normalizeInventory(value.inventory);
    next.itemUsage = value.itemUsage && typeof value.itemUsage === "object" ? value.itemUsage : {};
    next.endingSeen = Boolean(value.endingSeen);
    return next;
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
    next.affection = numberOrZero(value.affection);
    next.mood = typeof value.mood === "string" ? value.mood : "neutral";
    next.currentExpression = typeof value.currentExpression === "string" ? value.currentExpression : "normal";
    next.rageTapCount = numberOrZero(value.rageTapCount);
    next.careTapCount = numberOrZero(value.careTapCount);
    next.equippedItemId = findItem(value.equippedItemId) ? value.equippedItemId : "fist";
    next.lastSpeech = typeof value.lastSpeech === "string" ? value.lastSpeech : defaultSave.lastSpeech;
    next.lastTouchedArea = isKnownArea(value.lastTouchedArea) ? value.lastTouchedArea : "";
    next.areaClickCounts = value.areaClickCounts && typeof value.areaClickCounts === "object" ? value.areaClickCounts : {};
    next.areaLockUntil = value.areaLockUntil && typeof value.areaLockUntil === "object" ? value.areaLockUntil : {};
    next.unlockedMilestones = Array.isArray(value.unlockedMilestones)
      ? value.unlockedMilestones.filter(isKnownMilestone)
      : [];
    next.unlockedEvents = Array.isArray(value.unlockedEvents) ? value.unlockedEvents : [];
    next.inventory = normalizeInventory(value.inventory);
    next.itemUsage = value.itemUsage && typeof value.itemUsage === "object" ? value.itemUsage : {};
    next.debugHotspots = Boolean(value.debugHotspots);
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

  function isKnownArea(areaId) {
    return Object.prototype.hasOwnProperty.call(bodyAreas, areaId);
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
    }, 2400);
  }

  function pickLine(lines) {
    return lines[Math.floor(Math.random() * lines.length)];
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
