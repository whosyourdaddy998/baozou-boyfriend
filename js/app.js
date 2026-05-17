(function () {
  var STORAGE_KEY = "rage-boyfriend-save-v1";
  var ENDING_MILESTONE = 50;
  var actionDefinitions = [
    {
      id: "slap",
      label: "拍一下",
      hint: "轻轻制裁，先打个招呼。",
      mood: "hit",
      combo: 2,
      lines: [
        "喂喂喂，我还没解释呢。",
        "这一巴掌是因为我回消息慢吗？",
        "轻点打，我还有亲亲指标没完成。"
      ]
    },
    {
      id: "pinch",
      label: "捏脸",
      hint: "圆脸专用，越捏越委屈。",
      mood: "pout",
      combo: 1,
      lines: [
        "脸都给你捏圆了，还凶我。",
        "这是惩罚还是摸鱼式撒娇？",
        "我申请把这次算成亲密接触。"
      ]
    },
    {
      id: "slipper",
      label: "丢拖鞋",
      hint: "高能整活，威慑效果拉满。",
      mood: "annoyed",
      combo: 3,
      lines: [
        "看到拖鞋飞来，我的人生开始闪回。",
        "请文明执法，拖鞋也是有尊严的。",
        "我错了，但拖鞋飞得真的很帅。"
      ]
    },
    {
      id: "pat",
      label: "摸摸头",
      hint: "打一棍再给颗糖，最致命。",
      mood: "flirty",
      combo: 0,
      lines: [
        "这个摸头我可以再申请三次吗？",
        "突然就不想躲了，继续摸。",
        "你一摸头，我就想装乖。"
      ]
    },
    {
      id: "forgive",
      label: "原谅他",
      hint: "暂时放过，但记账不清零。",
      mood: "idle",
      combo: -2,
      lines: [
        "你这么一原谅，我差点感动到改过自新。",
        "好的，今天先活下来，明天继续努力表现。",
        "谢谢法外开恩，我现在立刻变甜。"
      ]
    }
  ];

  var milestones = [
    {
      id: "unlock-10",
      threshold: 10,
      title: "委屈脸已解锁",
      body: "达到 10 次互动后，角色会开始摆出更夸张的委屈表情。",
      toast: "第 10 次达成，委屈脸上线。"
    },
    {
      id: "unlock-30",
      threshold: 30,
      title: "隐藏吐槽已解锁",
      body: "达到 30 次互动后，会加入更贱更甜的隐藏文案池。",
      toast: "第 30 次达成，隐藏吐槽上线。"
    },
    {
      id: "unlock-50",
      threshold: 50,
      title: "求生失败结局",
      body: "达到 50 次互动后，触发“今日求生失败”特殊结局弹窗。",
      toast: "第 50 次达成，特殊结局触发。"
    }
  ];

  var hiddenLines = [
    "我怀疑你做这个网页，就是为了合法欺负我。",
    "本男友已经被你训练成自动认错系统。",
    "如果你开心，我愿意把今天的暴走次数截图存档。",
    "再点一下也行，但点完记得抱抱补血。"
  ];

  var defaultSave = {
    totalCount: 0,
    comboCount: 0,
    actionCounts: {},
    unlocked: [],
    customName: "",
    photoDataUrl: "",
    lastActionId: "",
    lastMood: "idle",
    endingSeen: false
  };

  var state = loadState();
  var toastTimer = null;

  var nodes = {
    totalCount: document.getElementById("totalCount"),
    statusLabel: document.getElementById("statusLabel"),
    unlockCount: document.getElementById("unlockCount"),
    boyfriendName: document.getElementById("boyfriendName"),
    speechBubble: document.getElementById("speechBubble"),
    actionButtons: document.getElementById("actionButtons"),
    comboCount: document.getElementById("comboCount"),
    favoriteAction: document.getElementById("favoriteAction"),
    nextUnlock: document.getElementById("nextUnlock"),
    milestoneList: document.getElementById("milestoneList"),
    stage: document.getElementById("stage"),
    avatarRoot: document.getElementById("avatarRoot"),
    moodTag: document.getElementById("moodTag"),
    lastActionLabel: document.getElementById("lastActionLabel"),
    survivalMeter: document.getElementById("survivalMeter"),
    nameInput: document.getElementById("nameInput"),
    photoInput: document.getElementById("photoInput"),
    photoOverlay: document.getElementById("photoOverlay"),
    removePhotoButton: document.getElementById("removePhotoButton"),
    resetButton: document.getElementById("resetButton"),
    surpriseButton: document.getElementById("surpriseButton"),
    toast: document.getElementById("toast"),
    endingDialog: document.getElementById("endingDialog"),
    endingMessage: document.getElementById("endingMessage"),
    closeDialogButton: document.getElementById("closeDialogButton")
  };

  bootstrap();

  function bootstrap() {
    renderActionButtons();
    bindEvents();
    hydrateInputs();
    render();
  }

  function bindEvents() {
    nodes.nameInput.addEventListener("input", function (event) {
      state.customName = event.target.value.trim().slice(0, 16);
      saveState();
      renderHeaderName();
    });

    nodes.photoInput.addEventListener("change", handlePhotoUpload);
    nodes.removePhotoButton.addEventListener("click", removePhoto);
    nodes.resetButton.addEventListener("click", resetProgress);
    nodes.surpriseButton.addEventListener("click", triggerSurpriseReaction);
    nodes.closeDialogButton.addEventListener("click", function () {
      nodes.endingDialog.close();
    });
  }

  function hydrateInputs() {
    nodes.nameInput.value = state.customName;
    applyPhoto();
  }

  function renderActionButtons() {
    nodes.actionButtons.innerHTML = actionDefinitions
      .map(function (action) {
        return [
          '<button class="action-button" type="button" data-action-id="' + escapeHtml(action.id) + '">',
          '<span class="action-pill">+' + escapeHtml(String(Math.max(action.combo, 0))) + " 连击</span>",
          "<strong>" + escapeHtml(action.label) + "</strong>",
          "<span>" + escapeHtml(action.hint) + "</span>",
          "</button>"
        ].join("");
      })
      .join("");

    Array.prototype.forEach.call(nodes.actionButtons.querySelectorAll("[data-action-id]"), function (button) {
      button.addEventListener("click", function () {
        var actionId = button.getAttribute("data-action-id");
        performAction(actionId);
      });
    });
  }

  function performAction(actionId) {
    var action = findAction(actionId);
    if (!action) {
      return;
    }

    state.totalCount += 1;
    state.comboCount = Math.max(0, state.comboCount + action.combo);
    state.lastActionId = action.id;
    state.lastMood = resolveMood(action);
    state.actionCounts[action.id] = (state.actionCounts[action.id] || 0) + 1;

    var unlockedThisTurn = unlockMilestones();
    var line = pickLine(action);

    saveState();
    render(line);
    animateAvatar(action);

    if (unlockedThisTurn.length) {
      unlockedThisTurn.forEach(function (item) {
        showToast(item.toast);
      });
    } else {
      showToast("已执行：" + action.label + "。");
    }

    if (state.totalCount >= ENDING_MILESTONE && !state.endingSeen) {
      state.endingSeen = true;
      saveState();
      showEndingDialog();
    }
  }

  function triggerSurpriseReaction() {
    var mood = state.totalCount >= 30 ? "cry" : "flirty";
    state.lastMood = mood;
    saveState();
    render(
      state.totalCount >= 30
        ? "我知道你还想点，但能不能先抱一下再继续。"
        : "偷偷提醒一下，多玩几次会有隐藏台词。"
    );
    nodes.avatarRoot.classList.remove("hit", "comforted");
    nodes.avatarRoot.offsetWidth;
    nodes.avatarRoot.classList.add("comforted");
    showToast("隐藏反应已刷新。");
  }

  function render(optionalLine) {
    renderHeaderName();
    renderCounts();
    renderMilestones();
    renderStage(optionalLine);
    applyPhoto();
  }

  function renderHeaderName() {
    var displayName = getDisplayName();
    nodes.boyfriendName.textContent = displayName;
  }

  function renderCounts() {
    nodes.totalCount.textContent = String(state.totalCount);
    nodes.comboCount.textContent = String(state.comboCount);
    nodes.unlockCount.textContent = state.unlocked.length + " / " + milestones.length;
    nodes.favoriteAction.textContent = getFavoriteActionLabel();
    nodes.nextUnlock.textContent = getNextUnlockLabel();
    nodes.statusLabel.textContent = buildStatusLabel();
  }

  function renderMilestones() {
    nodes.milestoneList.innerHTML = milestones
      .map(function (item) {
        var done = state.unlocked.indexOf(item.id) !== -1;
        return [
          '<article class="milestone-item' + (done ? " is-done" : "") + '">',
          "<div>",
          "<strong>第 " + item.threshold + " 次</strong>",
          "<p>" + escapeHtml(item.title + "。 " + item.body) + "</p>",
          "</div>",
          '<span class="milestone-badge' + (done ? "" : " locked") + '">' + (done ? "已解锁" : "未解锁") + "</span>",
          "</article>"
        ].join("");
      })
      .join("");
  }

  function renderStage(optionalLine) {
    var mood = state.lastMood || "idle";
    var moodLabel = moodToLabel(mood);
    var survivalPercent = Math.max(6, 100 - Math.min(state.totalCount * 1.8, 94));
    var lastAction = findAction(state.lastActionId);
    var speech = optionalLine || buildIdleLine();

    nodes.stage.className = "stage mood-" + mood;
    nodes.speechBubble.textContent = speech;
    nodes.moodTag.textContent = moodLabel;
    nodes.lastActionLabel.textContent = lastAction ? "上次操作：" + lastAction.label : "还没开始挨打";
    nodes.survivalMeter.style.width = survivalPercent + "%";
  }

  function animateAvatar(action) {
    nodes.avatarRoot.classList.remove("hit", "comforted");
    nodes.avatarRoot.offsetWidth;
    if (action.id === "pat" || action.id === "forgive") {
      nodes.avatarRoot.classList.add("comforted");
    } else {
      nodes.avatarRoot.classList.add("hit");
    }
  }

  function unlockMilestones() {
    var unlockedThisTurn = [];
    milestones.forEach(function (item) {
      if (state.totalCount >= item.threshold && state.unlocked.indexOf(item.id) === -1) {
        state.unlocked.push(item.id);
        unlockedThisTurn.push(item);
      }
    });
    return unlockedThisTurn;
  }

  function buildIdleLine() {
    if (state.totalCount === 0) {
      return "我先乖乖站好，等女朋友审判。";
    }
    if (state.totalCount >= 30) {
      return "我已经学会先认错了，你一打开网页我就紧张。";
    }
    if (state.totalCount >= 10) {
      return "今天的挨打 KPI 已经在稳步增长。";
    }
    return "虽然挨打了，但我感觉你玩得挺开心。";
  }

  function buildStatusLabel() {
    if (state.totalCount >= 50) {
      return "今日求生失败";
    }
    if (state.totalCount >= 30) {
      return "疯狂求饶中";
    }
    if (state.totalCount >= 10) {
      return "委屈升级中";
    }
    if (state.totalCount > 0) {
      return "轻微挨揍中";
    }
    return "待机观察中";
  }

  function getFavoriteActionLabel() {
    var best = null;
    actionDefinitions.forEach(function (action) {
      var count = state.actionCounts[action.id] || 0;
      if (!best || count > best.count) {
        best = { label: action.label, count: count };
      }
    });
    return best && best.count > 0 ? best.label + " · " + best.count + " 次" : "还没动手";
  }

  function getNextUnlockLabel() {
    var next = milestones.find(function (item) {
      return state.unlocked.indexOf(item.id) === -1;
    });
    if (!next) {
      return "全部彩蛋已解锁";
    }
    return "第 " + next.threshold + " 次解锁" + next.title.replace("已解锁", "");
  }

  function getDisplayName() {
    return state.customName || "今日挨揍担当";
  }

  function resolveMood(action) {
    if (state.totalCount >= 50) {
      return "cry";
    }
    if (state.totalCount >= 10 && action.id !== "pat" && action.id !== "forgive") {
      return "pout";
    }
    return action.mood;
  }

  function pickLine(action) {
    var pool = action.lines.slice();
    if (state.totalCount >= 30) {
      pool = pool.concat(hiddenLines);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function moodToLabel(mood) {
    switch (mood) {
      case "hit":
        return "挨打";
      case "annoyed":
        return "嘴硬";
      case "pout":
        return "委屈";
      case "flirty":
        return "装乖";
      case "cry":
        return "求饶";
      default:
        return "待机";
    }
  }

  function findAction(actionId) {
    return actionDefinitions.find(function (item) {
      return item.id === actionId;
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
      showToast("已贴上本地照片，只保存在这个浏览器里。");
    };
    reader.onerror = function () {
      showToast("照片读取失败，继续使用默认 Q 版形象。");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function removePhoto() {
    if (!state.photoDataUrl) {
      showToast("现在还没有上传照片。");
      return;
    }
    state.photoDataUrl = "";
    saveState();
    applyPhoto();
    showToast("已移除自定义照片。");
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
    render("进度已重置。重新开始挨打培训吧。");
    showToast("已重置全部进度。");
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    nodes.toast.textContent = message;
    nodes.toast.classList.remove("hidden");
    toastTimer = window.setTimeout(function () {
      nodes.toast.classList.add("hidden");
    }, 2400);
  }

  function showEndingDialog() {
    nodes.endingMessage.textContent =
      getDisplayName() + " 今日求生值已经清零。建议你摸摸头，再允许他用撒娇补偿。";
    if (typeof nodes.endingDialog.showModal === "function") {
      nodes.endingDialog.showModal();
    }
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

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function normalizeState(value) {
    var next = clone(defaultSave);
    if (!value || typeof value !== "object") {
      return next;
    }
    next.totalCount = numberOrZero(value.totalCount);
    next.comboCount = numberOrZero(value.comboCount);
    next.actionCounts = value.actionCounts && typeof value.actionCounts === "object" ? value.actionCounts : {};
    next.unlocked = Array.isArray(value.unlocked) ? value.unlocked.filter(isKnownMilestone) : [];
    next.customName = typeof value.customName === "string" ? value.customName.slice(0, 16) : "";
    next.photoDataUrl = typeof value.photoDataUrl === "string" ? value.photoDataUrl : "";
    next.lastActionId = typeof value.lastActionId === "string" ? value.lastActionId : "";
    next.lastMood = typeof value.lastMood === "string" ? value.lastMood : "idle";
    next.endingSeen = Boolean(value.endingSeen);
    return next;
  }

  function isKnownMilestone(id) {
    return milestones.some(function (item) {
      return item.id === id;
    });
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
