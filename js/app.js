(function () {
  var STORAGE_KEY = "rage-boyfriend-mobile-v4";
  var LEGACY_KEYS = ["rage-boyfriend-mobile-v3", "rage-boyfriend-mobile-v2"];
  var DEFAULT_MODE = "rage";
  var DEFAULT_DRAWER_TAB = "interact";
  var AREA_SPAM_WINDOW_MS = 3000;
  var AREA_SPAM_LIMIT = 5;
  var AREA_LOCK_MS = 4000;
  var LOW_SURVIVAL_THRESHOLD = 30;
  var MAX_EFFECTIVE_ITEM_USES = 3;

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
      survivalImpact: -1,
      affectionChance: 0,
      fatigueMultiplier: 0.8,
      useText: "一拳下去，先把气势做足。",
      rageTitle: "小拳拳制裁",
      rageLines: [
        "这一拳像警告，不像真正的伤害。",
        "你这一手，看得出来是来立规矩的。",
        "我已经在想怎么更快认错了。"
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
      affectionChange: 1,
      survivalImpact: 2,
      heartReward: 1,
      affectionChance: 0.35,
      fatigueMultiplier: 0.9,
      useText: "抚摸一下，先把气氛哄软。",
      careTitle: "摸头安抚",
      careLines: [
        "你一摸头，我就有点不想继续跟你嘴硬。",
        "这样轻轻摸，我很难不心软。",
        "好吧，这一下确实把我哄到了。"
      ]
    },
    {
      id: "milk-tea",
      label: "奶茶",
      icon: "🧋",
      type: "gift",
      cost: 16,
      usableModes: ["care"],
      affectionChange: 2,
      survivalImpact: 1,
      affectionChance: 0.5,
      fatigueMultiplier: 1,
      useText: "你怎么知道我现在正想喝这个？",
      careTitle: "递上奶茶",
      careLines: [
        "好吧，这杯奶茶确实很会哄人。",
        "这个选择有点过于精准，我被拿捏到了。",
        "行，这一杯算你立功。"
      ],
      summary: "补给型礼物，主打安抚和哄人。"
    },
    {
      id: "flower",
      label: "鲜花",
      icon: "💐",
      type: "gift",
      cost: 28,
      usableModes: ["care"],
      affectionChange: 3,
      survivalImpact: 2,
      affectionChance: 0.7,
      fatigueMultiplier: 1,
      useText: "突然送花真的很犯规。",
      careTitle: "送上一束花",
      careLines: [
        "你这样我真的会不好意思。",
        "花是收下了，但我还得装一下矜持。",
        "你要是继续这样，我会很难继续凶你。"
      ],
      summary: "高好感礼物，适合关键时刻升温。"
    },
    {
      id: "snack",
      label: "零食",
      icon: "🍪",
      type: "gift",
      cost: 22,
      usableModes: ["care"],
      affectionChange: 1,
      heartReward: 1,
      survivalImpact: 1,
      affectionChance: 0.45,
      fatigueMultiplier: 0.95,
      useText: "拿零食哄人，虽然老套但确实有用。",
      careTitle: "投喂零食",
      careLines: [
        "你是不是发现我嘴硬但很好哄。",
        "这个小零食来得正是时候。",
        "边吃边被你哄，确实有点没出息。"
      ],
      summary: "小额礼物，适合稳定推进关系。"
    },
    {
      id: "slipper",
      label: "丢拖鞋",
      icon: "🩴",
      type: "tool",
      cost: 30,
      usableModes: ["rage"],
      affectionChange: -2,
      survivalImpact: -2,
      affectionChance: 0,
      fatigueMultiplier: 1.1,
      useText: "拖鞋是威慑，不是普通投掷物。",
      rageTitle: "拖鞋袭击",
      rageLines: [
        "拖鞋飞来的那一瞬间，我已经想好检讨词了。",
        "这一丢很有压迫感，我根本不敢躲。",
        "这下不仅丢脸，拖鞋也丢过来了。"
      ],
      summary: "高能整蛊道具，节目效果很强。"
    },
    {
      id: "pillow",
      label: "抱枕",
      icon: "🛋️",
      type: "weapon",
      cost: 42,
      usableModes: ["rage", "care"],
      affectionChange: 1,
      survivalImpact: 0,
      affectionChance: 0.4,
      fatigueMultiplier: 0.95,
      useText: "软绵绵的攻击，打完还能顺手抱一下。",
      rageTitle: "抱枕暴击",
      careTitle: "抱枕贴贴",
      rageLines: [
        "被抱枕砸了也不亏，至少闻起来香香的。",
        "这种武器太狡猾了，根本没法纯生气。",
        "你这一下像惩罚，也像撒娇。"
      ],
      careLines: [
        "这个抱枕像是给我一个台阶下。",
        "如果打完还能抱一下，那我就不计较了。",
        "这种贴贴式互动，对我杀伤力很高。"
      ],
      summary: "混合型道具，两种模式都能触发反馈。"
    },
    {
      id: "hammer",
      label: "小锤子",
      icon: "🔨",
      type: "weapon",
      cost: 58,
      usableModes: ["rage"],
      affectionChange: -2,
      survivalImpact: -3,
      affectionChance: 0,
      fatigueMultiplier: 1.15,
      useText: "视觉威慑极强的整蛊武器。",
      rageTitle: "小锤警告",
      rageLines: [
        "这个小锤子看着可爱，敲下来一点都不可爱。",
        "你举锤的姿势，像在执行恋爱天条。",
        "看到这个我就知道今天不能再硬撑了。"
      ],
      summary: "高级武器，后期暴揍模式才适合用。"
    }
  ];

  var bodyAreas = {
    head: {
      name: "头部",
      animationKey: "head",
      effectType: "heart",
      punishable: false,
      responseTiming: { expression: 150, speech: 300, numbers: 600, reset: 1200 },
      lowAffectionBehavior: "speechless",
      highAffectionBehavior: "happy",
      modes: {
        rage: {
          baseAffection: 0,
          heartReward: 0,
          expression: "speechless",
          mood: "annoyed",
          survivalImpact: -1,
          texts: [
            "别总敲我头，我会怀疑你在记仇。",
            "头顶属于警告区，这一下已经够有存在感了。",
            "你这一下更像是宣告主权，不像真打。"
          ]
        },
        care: {
          baseAffection: 1,
          heartReward: 1,
          expression: "happy",
          mood: "happy",
          survivalImpact: 2,
          texts: [
            "别把我当小孩啊……不过这一下还挺舒服。",
            "你一摸头，我就很难继续嘴硬。",
            "好吧，这个位置确实很容易哄到我。"
          ]
        }
      }
    },
    face: {
      name: "脸部",
      animationKey: "face",
      effectType: "blush",
      punishable: true,
      punishExpression: "angry",
      punishTexts: [
        "别一直戳脸，我真的会躲开。",
        "你是不是故意想看我脸红。",
        "这个地方不能一直玩，我也会翻脸。"
      ],
      responseTiming: { expression: 150, speech: 330, numbers: 620, reset: 1200 },
      lowAffectionBehavior: "speechless",
      highAffectionBehavior: "shy",
      modes: {
        rage: {
          baseAffection: -1,
          heartReward: 0,
          expression: "speechless",
          mood: "speechless",
          survivalImpact: -1,
          texts: [
            "脸都快给你捏圆了，这还不算收手吗。",
            "你这根本不是制裁，是借机整我。",
            "再这样下去，我连表情管理都做不到了。"
          ]
        },
        care: {
          baseAffection: 1,
          heartReward: 1,
          expression: "shy",
          mood: "shy",
          survivalImpact: 1,
          texts: [
            "你靠太近了，我有点不好意思。",
            "一直碰脸这种动作……真的挺犯规。",
            "别看了，我知道自己现在肯定有点脸红。"
          ]
        }
      }
    },
    hand: {
      name: "手部",
      animationKey: "hand",
      effectType: "spark",
      punishable: false,
      responseTiming: { expression: 150, speech: 300, numbers: 620, reset: 1200 },
      lowAffectionBehavior: "speechless",
      highAffectionBehavior: "happy",
      modes: {
        rage: {
          baseAffection: 0,
          heartReward: 0,
          expression: "speechless",
          mood: "speechless",
          survivalImpact: -1,
          texts: [
            "你这是提醒我收敛一点，还是要我配合一点。",
            "拍手这一招，羞耻感比疼更明显。",
            "这一下像命令，不像安慰。"
          ]
        },
        care: {
          baseAffection: 1,
          heartReward: 1,
          expression: "happy",
          mood: "happy",
          survivalImpact: 1,
          texts: [
            "好吧，手给你，但别一直不松开。",
            "你这样来拉我，我会默认你在示好。",
            "牵手类动作，对好感确实挺有效。"
          ]
        }
      }
    },
    shoulder: {
      name: "肩膀",
      animationKey: "shoulder",
      effectType: "calm",
      punishable: false,
      responseTiming: { expression: 180, speech: 320, numbers: 620, reset: 1200 },
      lowAffectionBehavior: "tired",
      highAffectionBehavior: "happy",
      modes: {
        rage: {
          baseAffection: -1,
          heartReward: 0,
          expression: "speechless",
          mood: "annoyed",
          survivalImpact: -1,
          texts: [
            "肩膀上这一下，很像在催我赶紧认错。",
            "你拍这里的时候，语气都显得更强势了。",
            "这种动作比直接打还让人有压力。"
          ]
        },
        care: {
          baseAffection: 1,
          heartReward: 1,
          expression: "tired",
          mood: "tired",
          survivalImpact: 2,
          texts: [
            "你这样拍肩膀，像在安慰我一样。",
            "这一点像按摩，我可以给高一点分。",
            "肩膀这里确实有被你安抚到。"
          ]
        }
      }
    },
    sensitive: {
      name: "身体敏感区",
      animationKey: "body",
      effectType: "warn",
      punishable: true,
      punishExpression: "angry",
      punishTexts: [
        "都说了这个地方不可以，再碰就锁区。",
        "你今天是故意试探我底线吗。",
        "这个位置现在直接禁止继续互动。"
      ],
      responseTiming: { expression: 120, speech: 280, numbers: 600, reset: 1200 },
      lowAffectionBehavior: "angry",
      highAffectionBehavior: "speechless",
      modes: {
        rage: {
          baseAffection: -2,
          heartReward: 0,
          expression: "angry",
          mood: "angry",
          survivalImpact: -3,
          texts: [
            "这个地方不可以乱碰。",
            "喂，你注意一点，我真的会生气。",
            "再试一次，我就直接翻脸。"
          ]
        },
        care: {
          baseAffection: -2,
          heartReward: -1,
          expression: "angry",
          mood: "angry",
          survivalImpact: -1,
          texts: [
            "抚摸模式也不代表什么都可以。",
            "这个位置不能当成玩笑。",
            "你再这样，我连奶茶都不想收了。"
          ]
        }
      }
    }
  };

  var milestones = [
    {
      id: "unlock-3",
      title: "第三个内容",
      body: "总互动达到 20 次后，开始逐步解锁中级内容。",
      check: function (state) {
        return state.totalCount >= 20;
      }
    },
    {
      id: "unlock-4",
      title: "关系升温",
      body: "好感值达到 20，说明互动开始有明显效果。",
      check: function (state) {
        return state.affection >= 20;
      }
    },
    {
      id: "unlock-5",
      title: "会用道具了",
      body: "累计有效道具使用 5 次，开始进入更丰富的互动阶段。",
      check: function (state) {
        return getTotalEffectiveItemUses(state) >= 5;
      }
    },
    {
      id: "unlock-6",
      title: "高阶互动铺开",
      body: "覆盖 4 个以上区域互动，并保持好感稳定增长。",
      check: function (state) {
        return countVisitedAreas(state) >= 4 && state.affection >= 30;
      }
    },
    {
      id: "unlock-7",
      title: "接近亲密",
      body: "好感值达到 60，后续可接更高级内容。",
      check: function (state) {
        return state.affection >= 60;
      }
    },
    {
      id: "hidden-ending-ready",
      title: "隐藏结局条件接近完成",
      body: "达到高门槛组合条件后，才允许进入隐藏结局范围。",
      check: function (state) {
        return canReachHiddenEnding(state);
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
    survivalValue: 100,
    mood: "neutral",
    currentExpression: "normal",
    rageTapCount: 0,
    careTapCount: 0,
    equippedItemId: "fist",
    lastSpeech: "先别急着出手，点不同位置看看今天会发生什么。",
    lastTouchedArea: "",
    areaClickCounts: {},
    areaLockUntil: {},
    areaRewardDecay: {},
    areaVisitFlags: {},
    modeStreak: { rage: 0, care: 0 },
    unlockedMilestones: [],
    unlockedEvents: [],
    softEventFlags: [],
    inventory: buildDefaultInventory(),
    itemUsage: {},
    itemEffectiveUsage: {},
    debugHotspots: false,
    endingSeen: false,
    failEndingSeen: false,
    protectionTriggered: false,
    idleStateSeed: Math.floor(Math.random() * 1000)
  };

  var state = loadState();
  var toastTimer = null;
  var feedbackCycleToken = 0;

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
    headLayer: document.getElementById("headLayer"),
    faceLayer: document.getElementById("faceLayer"),
    bodyLayer: document.getElementById("bodyLayer"),
    handLayer: document.getElementById("handLayer"),
    hotspotLayer: document.getElementById("hotspotLayer"),
    floatingFeedback: document.getElementById("floatingFeedback"),
    effectLayer: document.getElementById("effectLayer"),
    statusLabel: document.getElementById("statusLabel"),
    lastAreaLabel: document.getElementById("lastAreaLabel"),
    modeDescription: document.getElementById("modeDescription"),
    expressionLabel: document.getElementById("expressionLabel"),
    protectionLabel: document.getElementById("protectionLabel"),
    streakLabel: document.getElementById("streakLabel"),
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
    state.modeStreak[mode] = 0;
    ensureCompatibleEquip();
    state.lastSpeech = mode === "rage"
      ? "已切到暴揍模式。现在互动更偏整蛊和压迫感。"
      : "已切到抚摸模式。现在主要赚爱心值并慢慢拉高好感。";
    queueFeedback({
      expression: mode === "rage" ? "speechless" : "happy",
      mood: mode === "rage" ? "annoyed" : "happy",
      speech: state.lastSpeech,
      animation: mode === "rage" ? "tap-boost" : "tap-care",
      areaKey: "head",
      floating: []
    });
    saveState();
    renderAll();
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
    var floating = [];
    var payload;
    var punishTriggered = false;

    if (!area) {
      return;
    }

    if (isAreaLocked(areaId, now)) {
      queueFeedback({
        expression: "angry",
        mood: "protected",
        speech: "这个区域刚被你惹毛了，先冷静几秒再碰。",
        animation: "tap-protect",
        areaKey: area.animationKey,
        effectType: "warn",
        floating: [{ text: "锁定中", type: "bad" }]
      });
      showToast("他现在不让你碰这里。");
      return;
    }

    state.totalCount += 1;
    state.lastTouchedArea = areaId;
    state.areaVisitFlags[areaId] = true;
    updateModeStreak();
    registerAreaClick(areaId, now);

    var baseAffection = resolveAreaAffection(areaId, modeConfig);
    var baseHeart = resolveAreaHeart(areaId, modeConfig);
    var survivalDelta = resolveSurvivalDelta(areaId, modeConfig);
    var itemEffects = applyEquippedItemEffect(equipped, floating);

    if (baseAffection !== 0) {
      applyStatDelta("affection", baseAffection, floating, "好感");
    }
    if (baseHeart !== 0) {
      applyHeartGain(baseHeart, floating);
    }
    if (survivalDelta !== 0) {
      applySurvivalDelta(survivalDelta, floating);
    }

    if (state.currentMode === "rage") {
      state.rageTapCount += 1;
    } else {
      state.careTapCount += 1;
    }

    incrementItemUsage(equipped.id);
    if (itemEffects.effectiveUse) {
      incrementEffectiveItemUsage(equipped.id);
    }

    if (area.punishable && isAreaSpamTriggered(areaId)) {
      triggerAreaPunish(areaId, area, floating);
      punishTriggered = true;
    }

    refreshProtectionState();
    unlockMilestonesIfNeeded();
    checkEndingStates();

    payload = {
      expression: punishTriggered ? area.punishExpression || "angry" : resolveExpression(area, modeConfig),
      mood: punishTriggered ? "angry" : resolveMood(area, modeConfig),
      speech: punishTriggered ? pickLine(area.punishTexts) : buildSpeech(area, modeConfig, itemEffects),
      animation: resolveAnimation(area.animationKey, punishTriggered),
      areaKey: area.animationKey,
      effectType: punishTriggered ? "warn" : area.effectType,
      floating: floating
    };

    saveState();
    renderAll();
    queueFeedback(payload);
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
      ? "暴揍模式更适合整蛊和武器，但求生值掉得更快。"
      : "抚摸模式主要赚爱心值，并在安全区慢慢提升好感。";
    nodes.heartBalance.textContent = String(state.heartBalance);
    nodes.affectionValue.textContent = String(state.affection);
    nodes.unlockCount.textContent = countUnlockedItems(state) + " / " + itemCatalog.length;
    nodes.debugHotspotButton.textContent = state.debugHotspots ? "关闭热区调试" : "显示热区调试";
  }

  function renderStage() {
    nodes.stage.className = "character-stage expression-" + state.currentExpression + " mood-" + state.mood;
    nodes.speechBubble.textContent = state.lastSpeech;
    nodes.equippedItemLabel.textContent = getEquippedItem().icon + " " + getEquippedItem().label;
    nodes.statusLabel.textContent = buildStatusLabel();
    nodes.lastAreaLabel.textContent = state.lastTouchedArea ? bodyAreas[state.lastTouchedArea].name : "还没开始互动";
    nodes.expressionLabel.textContent = getExpressionLabel(state.currentExpression);
    nodes.protectionLabel.textContent = state.protectionTriggered ? "已触发" : "未触发";
    nodes.streakLabel.textContent = buildStreakLabel();
    nodes.survivalLabel.textContent = state.survivalValue + "%";
    nodes.survivalMeter.style.width = state.survivalValue + "%";
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
        '<span>' + escapeHtml(unlocked ? (usable ? "点击装备，可叠加到身体互动反馈里" : "当前模式下收益较弱，建议切换模式") : "未解锁，请先去商店兑换") + "</span>",
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
    state.lastSpeech = "已装备 " + findItem(itemId).label + "。现在它会参与不同部位的互动反馈。";
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
    state.lastSpeech = "商店已解锁 " + item.label + "。现在互动会更丰富，但推进也不会太快。";
    unlockMilestonesIfNeeded();
    saveState();
    renderAll();
    showToast("已解锁 " + item.label);
  }

  function queueFeedback(payload) {
    var token = ++feedbackCycleToken;
    var timing = resolveTiming(payload.areaKey);

    applyBaseAnimation(payload);

    window.setTimeout(function () {
      if (feedbackCycleToken !== token) {
        return;
      }
      state.currentExpression = payload.expression;
      state.mood = payload.mood;
      saveState();
      renderStage();
    }, timing.expression);

    window.setTimeout(function () {
      if (feedbackCycleToken !== token) {
        return;
      }
      state.lastSpeech = payload.speech;
      saveState();
      renderStage();
      spawnEffect(payload.effectType);
    }, timing.speech);

    window.setTimeout(function () {
      if (feedbackCycleToken !== token) {
        return;
      }
      renderFloatingFeedback(payload.floating);
    }, timing.numbers);

    window.setTimeout(function () {
      if (feedbackCycleToken !== token) {
        return;
      }
      clearAnimationClasses();
      nodes.avatarRoot.classList.remove("is-acting");
    }, timing.reset);
  }

  function applyBaseAnimation(payload) {
    clearAnimationClasses();
    nodes.avatarRoot.classList.add("is-acting");
    if (payload.animation) {
      nodes.avatarRoot.classList.add(payload.animation);
    }
    if (payload.areaKey === "head" || payload.areaKey === "shoulder") {
      nodes.headLayer.classList.add(payload.areaKey === "head" ? "tap-head" : "tap-shoulder");
    }
    if (payload.areaKey === "face") {
      nodes.faceLayer.classList.add("tap-face");
    }
    if (payload.areaKey === "body") {
      nodes.bodyLayer.classList.add("tap-body");
    }
    if (payload.areaKey === "hand") {
      nodes.handLayer.classList.add("tap-hand");
    }
  }

  function clearAnimationClasses() {
    nodes.avatarRoot.classList.remove("tap-rage", "tap-care", "tap-protect", "tap-boost");
    nodes.headLayer.classList.remove("tap-head", "tap-shoulder");
    nodes.faceLayer.classList.remove("tap-face");
    nodes.bodyLayer.classList.remove("tap-body");
    nodes.handLayer.classList.remove("tap-hand");
  }

  function spawnEffect(type) {
    var symbolMap = {
      heart: "♥",
      blush: "✦",
      spark: "✧",
      calm: "…",
      warn: "!"
    };
    var node = document.createElement("span");
    node.className = "effect-puff";
    node.textContent = symbolMap[type] || "✦";
    nodes.effectLayer.innerHTML = "";
    nodes.effectLayer.appendChild(node);
    window.setTimeout(function () {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }, 800);
  }

  function resolveTiming(areaKey) {
    var area = Object.keys(bodyAreas).find(function (id) {
      return bodyAreas[id].animationKey === areaKey;
    });
    if (!area) {
      return { expression: 150, speech: 300, numbers: 600, reset: 1200 };
    }
    return bodyAreas[area].responseTiming;
  }

  function buildSpeech(area, modeConfig, itemEffects) {
    if (itemEffects && itemEffects.overrideSpeech) {
      return itemEffects.overrideSpeech;
    }
    return pickLine(modeConfig.texts);
  }

  function resolveExpression(area, modeConfig) {
    if (state.affection >= 50 && area.highAffectionBehavior) {
      return area.highAffectionBehavior;
    }
    if (state.affection < 10 && area.lowAffectionBehavior) {
      return area.lowAffectionBehavior;
    }
    return modeConfig.expression;
  }

  function resolveMood(area, modeConfig) {
    if (state.protectionTriggered && state.currentMode === "rage") {
      return "protected";
    }
    return modeConfig.mood;
  }

  function resolveAnimation(areaAnimationKey, punishTriggered) {
    if (punishTriggered || state.protectionTriggered && state.currentMode === "rage") {
      return "tap-protect";
    }
    if (state.currentMode === "care") {
      return "tap-care";
    }
    if (areaAnimationKey === "body" || getEquippedItem().type === "weapon") {
      return "tap-boost";
    }
    return "tap-rage";
  }

  function resolveAreaAffection(areaId, modeConfig) {
    var base = modeConfig.baseAffection;
    var decayFactor = getDecayFactor(areaId);
    var fatigueFactor = getModeFatigueFactor();
    var protectionFactor = state.protectionTriggered && state.currentMode === "rage" ? 0.5 : 1;
    var chance = state.currentMode === "care" ? 0.35 : areaId === "sensitive" ? 1 : 0.25;

    if (base > 0 && Math.random() > chance) {
      return 0;
    }

    return normalizeSignedDelta(base * decayFactor * fatigueFactor * protectionFactor);
  }

  function resolveAreaHeart(areaId, modeConfig) {
    var reward = modeConfig.heartReward || 0;
    var decayFactor = getDecayFactor(areaId);
    var fatigueFactor = getModeFatigueFactor();
    if (state.currentMode !== "care") {
      return normalizeSignedDelta(reward * 0.25);
    }
    return normalizeSignedDelta(reward * decayFactor * fatigueFactor);
  }

  function resolveSurvivalDelta(areaId, modeConfig) {
    var base = modeConfig.survivalImpact || 0;
    var protectionFactor = state.protectionTriggered && state.currentMode === "rage" ? 0.5 : 1;
    var fatigueFactor = getModeFatigueFactor();
    if (state.currentMode === "care") {
      return normalizeSignedDelta(base);
    }
    return normalizeSignedDelta(base * protectionFactor * fatigueFactor);
  }

  function getDecayFactor(areaId) {
    var current = numberOrZero(state.areaRewardDecay[areaId] || 0);
    var factor = Math.max(0.35, 1 - current * 0.18);
    state.areaRewardDecay[areaId] = Math.min(current + 1, 4);
    return factor;
  }

  function getModeFatigueFactor() {
    var streak = state.modeStreak[state.currentMode] || 0;
    if (streak <= 5) {
      return 1;
    }
    if (streak <= 10) {
      return 0.82;
    }
    state.currentExpression = "tired";
    state.mood = "tired";
    return 0.62;
  }

  function updateModeStreak() {
    state.modeStreak[state.currentMode] = numberOrZero(state.modeStreak[state.currentMode]) + 1;
    state.modeStreak[state.currentMode === "rage" ? "care" : "rage"] = 0;
  }

  function applyEquippedItemEffect(item, floating) {
    var usable = isItemUsableInMode(item, state.currentMode);
    var result = { effectiveUse: false, overrideSpeech: "" };

    if (!item || !usable) {
      return result;
    }

    if (hasReachedItemCap(item.id)) {
      floating.push({ text: "道具疲劳", type: "info" });
      return result;
    }

    result.effectiveUse = true;

    if (item.affectionChange && Math.random() <= (item.affectionChance || 0)) {
      applyStatDelta("affection", normalizeSignedDelta(item.affectionChange), floating, "好感");
    }

    if (item.heartReward) {
      applyHeartGain(normalizeSignedDelta(item.heartReward), floating);
    }

    if (item.survivalImpact) {
      applySurvivalDelta(normalizeSignedDelta(item.survivalImpact), floating);
    }

    if (item.useText) {
      result.overrideSpeech = item.useText + " " + pickLine(getLinesByMode(item));
    }

    return result;
  }

  function hasReachedItemCap(itemId) {
    return numberOrZero(state.itemEffectiveUsage[itemId] || 0) >= MAX_EFFECTIVE_ITEM_USES;
  }

  function applyStatDelta(key, delta, floating, label) {
    if (!delta) {
      return;
    }
    state[key] = Math.max(0, numberOrZero(state[key]) + delta);
    floating.push({
      text: label + " " + (delta > 0 ? "+" + delta : String(delta)),
      type: delta > 0 ? "good" : "bad"
    });
  }

  function applyHeartGain(delta, floating) {
    if (!delta) {
      return;
    }
    state.heartBalance = Math.max(0, numberOrZero(state.heartBalance) + delta);
    if (delta > 0) {
      state.heartEarned += delta;
    }
    floating.push({
      text: "爱心 " + (delta > 0 ? "+" + delta : String(delta)),
      type: delta > 0 ? "good" : "bad"
    });
  }

  function applySurvivalDelta(delta, floating) {
    if (!delta) {
      return;
    }
    state.survivalValue = clamp(numberOrZero(state.survivalValue) + delta, 0, 100);
    floating.push({
      text: "求生 " + (delta > 0 ? "+" + delta : String(delta)),
      type: delta > 0 ? "good" : "bad"
    });
  }

  function triggerAreaPunish(areaId, area, floating) {
    state.areaLockUntil[areaId] = Date.now() + AREA_LOCK_MS;
    state.currentExpression = area.punishExpression || "angry";
    state.mood = "angry";
    applyStatDelta("affection", -2, floating, "好感");
    applySurvivalDelta(-1, floating);
    floating.push({ text: "区域锁定", type: "bad" });
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
    return numberOrZero(state.areaLockUntil[areaId] || 0) > now;
  }

  function refreshProtectionState() {
    state.protectionTriggered = state.survivalValue <= LOW_SURVIVAL_THRESHOLD;
    if (state.protectionTriggered && state.currentMode === "rage") {
      state.mood = "protected";
      state.lastSpeech = "他已经快扛不住了，系统建议切回抚摸模式。";
    }
  }

  function unlockMilestonesIfNeeded() {
    milestones.forEach(function (item) {
      if (item.check(state) && state.unlockedMilestones.indexOf(item.id) === -1) {
        state.unlockedMilestones.push(item.id);
        showToast("达成阶段：" + item.title);
      }
    });
  }

  function checkEndingStates() {
    if (canReachHiddenEnding(state) && !state.endingSeen) {
      state.endingSeen = true;
      nodes.endingMessage.textContent =
        (state.customName || "男朋友") +
        " 终于撑到了隐藏结局门槛，这次不是失败，而是被你玩明白了。";
      if (typeof nodes.endingDialog.showModal === "function") {
        nodes.endingDialog.showModal();
      }
      return;
    }

    if (state.survivalValue <= 0 && !state.failEndingSeen) {
      state.failEndingSeen = true;
      nodes.endingMessage.textContent =
        (state.customName || "男朋友") +
        " 今日求生值已经归零，系统判定为普通失败结局。";
      if (typeof nodes.endingDialog.showModal === "function") {
        nodes.endingDialog.showModal();
      }
    }
  }

  function renderFloatingFeedback(entries) {
    nodes.floatingFeedback.innerHTML = "";
    entries.forEach(function (entry, index) {
      var node = document.createElement("span");
      node.className = "floating-tag " + (entry.type || "info");
      node.style.top = 40 + index * 8 + "%";
      if (index > 0) {
        node.classList.add("delayed");
      }
      node.textContent = entry.text;
      nodes.floatingFeedback.appendChild(node);
      window.setTimeout(function () {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      }, 1600);
    });
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
    var parts = [];
    if (item.summary) {
      parts.push(item.summary);
    }
    parts.push("适用：" + item.usableModes.join("/"));
    if (item.survivalImpact) {
      parts.push("求生影响 " + item.survivalImpact);
    }
    return parts.join(" · ");
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
    state.itemUsage[itemId] = numberOrZero(state.itemUsage[itemId]) + 1;
  }

  function incrementEffectiveItemUsage(itemId) {
    state.itemEffectiveUsage[itemId] = numberOrZero(state.itemEffectiveUsage[itemId]) + 1;
  }

  function buildStatusLabel() {
    if (state.failEndingSeen) {
      return "今日求生失败";
    }
    if (state.endingSeen && canReachHiddenEnding(state)) {
      return "隐藏结局已触发";
    }
    if (state.protectionTriggered) {
      return "保护状态已启动";
    }
    if (state.mood === "angry") {
      return "明显不爽中";
    }
    if (state.affection >= 60) {
      return "关系明显升温";
    }
    return "待机观察中";
  }

  function getNextMilestoneLabel() {
    var pending = milestones.find(function (item) {
      return state.unlockedMilestones.indexOf(item.id) === -1;
    });
    return pending ? pending.title : "高阶条件已接近完成";
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
      case "protected":
        return "自我保护";
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

  function buildStreakLabel() {
    var rage = numberOrZero(state.modeStreak.rage);
    var care = numberOrZero(state.modeStreak.care);
    if (rage === 0 && care === 0) {
      return "暂无";
    }
    return rage > care ? "暴揍连用 " + rage + " 次" : "抚摸连用 " + care + " 次";
  }

  function getTotalEffectiveItemUses(stateValue) {
    return Object.keys(stateValue.itemEffectiveUsage || {}).reduce(function (sum, key) {
      return sum + numberOrZero(stateValue.itemEffectiveUsage[key]);
    }, 0);
  }

  function countVisitedAreas(stateValue) {
    return Object.keys(stateValue.areaVisitFlags || {}).filter(function (key) {
      return stateValue.areaVisitFlags[key];
    }).length;
  }

  function canReachHiddenEnding(stateValue) {
    return stateValue.affection >= 80
      && stateValue.totalCount >= 100
      && countUnlockedItems(stateValue) >= 6
      && getTotalEffectiveItemUses(stateValue) >= 8
      && countVisitedAreas(stateValue) >= 5
      && stateValue.survivalValue > 0;
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
    var i;
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

    for (i = 0; i < LEGACY_KEYS.length; i += 1) {
      try {
        var legacyRaw = window.localStorage.getItem(LEGACY_KEYS[i]);
        if (legacyRaw) {
          return migrateLegacyState(JSON.parse(legacyRaw));
        }
      } catch (legacyError) {
        continue;
      }
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
    next.heartBalance = Math.max(0, Math.floor(numberOrZero(value.heartBalance) * 0.7));
    next.heartEarned = Math.max(0, Math.floor(numberOrZero(value.heartEarned) * 0.7));
    next.affection = Math.max(0, Math.floor(numberOrZero(value.affection || value.totalCount) * 0.45));
    next.survivalValue = 100;
    next.mood = "neutral";
    next.currentExpression = "normal";
    next.rageTapCount = numberOrZero(value.rageTapCount);
    next.careTapCount = numberOrZero(value.careTapCount);
    next.equippedItemId = findItem(value.equippedItemId) ? value.equippedItemId : "fist";
    next.lastSpeech = typeof value.lastSpeech === "string" ? value.lastSpeech : defaultSave.lastSpeech;
    next.lastTouchedArea = isKnownArea(value.lastTouchedArea) ? value.lastTouchedArea : "";
    next.inventory = normalizeInventory(value.inventory);
    next.itemUsage = value.itemUsage && typeof value.itemUsage === "object" ? value.itemUsage : {};
    next.debugHotspots = Boolean(value.debugHotspots);
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
    next.survivalValue = clamp(numberOrZero(value.survivalValue || 100), 0, 100);
    next.mood = typeof value.mood === "string" ? value.mood : "neutral";
    next.currentExpression = typeof value.currentExpression === "string" ? value.currentExpression : "normal";
    next.rageTapCount = numberOrZero(value.rageTapCount);
    next.careTapCount = numberOrZero(value.careTapCount);
    next.equippedItemId = findItem(value.equippedItemId) ? value.equippedItemId : "fist";
    next.lastSpeech = typeof value.lastSpeech === "string" ? value.lastSpeech : defaultSave.lastSpeech;
    next.lastTouchedArea = isKnownArea(value.lastTouchedArea) ? value.lastTouchedArea : "";
    next.areaClickCounts = value.areaClickCounts && typeof value.areaClickCounts === "object" ? value.areaClickCounts : {};
    next.areaLockUntil = value.areaLockUntil && typeof value.areaLockUntil === "object" ? value.areaLockUntil : {};
    next.areaRewardDecay = value.areaRewardDecay && typeof value.areaRewardDecay === "object" ? value.areaRewardDecay : {};
    next.areaVisitFlags = value.areaVisitFlags && typeof value.areaVisitFlags === "object" ? value.areaVisitFlags : {};
    next.modeStreak = value.modeStreak && typeof value.modeStreak === "object"
      ? { rage: numberOrZero(value.modeStreak.rage), care: numberOrZero(value.modeStreak.care) }
      : { rage: 0, care: 0 };
    next.unlockedMilestones = Array.isArray(value.unlockedMilestones)
      ? value.unlockedMilestones.filter(isKnownMilestone)
      : [];
    next.unlockedEvents = Array.isArray(value.unlockedEvents) ? value.unlockedEvents : [];
    next.softEventFlags = Array.isArray(value.softEventFlags) ? value.softEventFlags : [];
    next.inventory = normalizeInventory(value.inventory);
    next.itemUsage = value.itemUsage && typeof value.itemUsage === "object" ? value.itemUsage : {};
    next.itemEffectiveUsage = value.itemEffectiveUsage && typeof value.itemEffectiveUsage === "object" ? value.itemEffectiveUsage : {};
    next.debugHotspots = Boolean(value.debugHotspots);
    next.endingSeen = Boolean(value.endingSeen);
    next.failEndingSeen = Boolean(value.failEndingSeen);
    next.protectionTriggered = Boolean(value.protectionTriggered);
    next.idleStateSeed = numberOrZero(value.idleStateSeed || Math.floor(Math.random() * 1000));
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

  function normalizeSignedDelta(value) {
    if (!value) {
      return 0;
    }
    if (value > 0) {
      return Math.max(1, Math.round(value));
    }
    return Math.min(-1, Math.round(value));
  }

  function pickLine(lines) {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function numberOrZero(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
