export const STORAGE_KEY = "baozou-boyfriend-3d-v1";

export const STATUS = {
  NORMAL: "normal",
  HAPPY: "happy",
  SHY: "shy",
  ANGRY: "angry",
  TIRED: "tired",
  ANNOYED: "annoyed"
};

export const MODE = {
  CARE: "care",
  RAGE: "rage"
};

export const TIMINGS = {
  expression: 120,
  speech: 250,
  numbers: 450,
  actionEnd: 900,
  reset: 1200
};

export const COMBO_WINDOW_MS = 3000;
export const ANNOYED_DURATION_MS = 5000;
export const COOLDOWN_MS = 320;

export const comboCurve = [1, 0.7, 0.4, 0.1, 0];

export const unlockGoals = [
  { id: "intro", label: "3D 版初见面", unlockedByDefault: true },
  { id: "care-learner", label: "第一次有效安抚", threshold: { heart: 3 } },
  { id: "head-pat-pro", label: "摸头老手", threshold: { totalInteractions: 20 } },
  { id: "blush-hunter", label: "成功哄脸红", threshold: { affection: 20 } },
  { id: "steady-company", label: "陪伴稳定期", threshold: { heart: 12 } },
  { id: "gesture-reader", label: "懂得看情绪", threshold: { affection: 45 } },
  { id: "trusted-close", label: "已经很熟了", threshold: { affection: 60 } },
  { id: "hidden-ending", label: "隐藏结局（后续开放）", locked: true }
];

export const defaultReadyPlayerMeUrl =
  "https://models.readyplayer.me/64d1f5440e131d29623f2fda.glb";

export const mixamoSlots = [
  {
    clipName: "Idle",
    file: "/mixamo/Idle.fbx",
    usableModes: [MODE.CARE, MODE.RAGE],
    targetAreas: ["all"],
    blendIn: 0.2,
    blendOut: 0.2
  },
  {
    clipName: "Shy",
    file: "/mixamo/Shy.fbx",
    usableModes: [MODE.CARE],
    targetAreas: ["head", "face"],
    blendIn: 0.15,
    blendOut: 0.2
  },
  {
    clipName: "Hit",
    file: "/mixamo/Hit.fbx",
    usableModes: [MODE.RAGE],
    targetAreas: ["body", "face", "leg"],
    blendIn: 0.1,
    blendOut: 0.2
  },
  {
    clipName: "Push Back",
    file: "/mixamo/PushBack.fbx",
    usableModes: [MODE.RAGE],
    targetAreas: ["body", "handLeft", "handRight"],
    blendIn: 0.1,
    blendOut: 0.2
  },
  {
    clipName: "Wave",
    file: "/mixamo/Wave.fbx",
    usableModes: [MODE.CARE],
    targetAreas: ["handLeft", "handRight"],
    blendIn: 0.2,
    blendOut: 0.2
  },
  {
    clipName: "Angry",
    file: "/mixamo/Angry.fbx",
    usableModes: [MODE.RAGE],
    targetAreas: ["all"],
    blendIn: 0.1,
    blendOut: 0.25
  }
];

export const areaConfigs = {
  head: {
    id: "head",
    label: "头部",
    correctModes: [MODE.CARE],
    animationKey: "head",
    expressionKey: {
      care: STATUS.SHY,
      rage: STATUS.ANGRY
    },
    timings: TIMINGS,
    careLines: [
      "你又摸我头……这招也太犯规了。",
      "别把我当小孩啊，不过还挺舒服。",
      "好吧，头顶这一下确实把我哄到了。"
    ],
    rageLines: [
      "别敲头，我会记仇的。",
      "你这一下有点像在立规矩。",
      "头顶警报已经响了。"
    ]
  },
  face: {
    id: "face",
    label: "脸部",
    correctModes: [MODE.CARE],
    animationKey: "face",
    expressionKey: {
      care: STATUS.SHY,
      rage: STATUS.ANNOYED
    },
    timings: TIMINGS,
    careLines: [
      "靠这么近，我真的会脸红。",
      "别一直戳脸，我会不好意思。",
      "你是不是故意看我反应。"
    ],
    rageLines: [
      "脸不是给你拿来乱闹的。",
      "你再戳，我就真的无语了。",
      "这个位置很容易把我惹毛。"
    ]
  },
  handLeft: {
    id: "handLeft",
    label: "左手",
    correctModes: [MODE.CARE, MODE.RAGE],
    animationKey: "hand",
    expressionKey: {
      care: STATUS.HAPPY,
      rage: STATUS.ANGRY
    },
    timings: TIMINGS,
    careLines: [
      "左手先借你一下，但别握太久。",
      "这一摸像牵手，不像试探。",
      "你碰手的时候，我会下意识靠近一点。"
    ],
    rageLines: [
      "左手都被你逼得想甩开了。",
      "别扒拉我手，我会躲。",
      "你这一下像在阻止我逃跑。"
    ]
  },
  handRight: {
    id: "handRight",
    label: "右手",
    correctModes: [MODE.CARE, MODE.RAGE],
    animationKey: "hand",
    expressionKey: {
      care: STATUS.HAPPY,
      rage: STATUS.ANGRY
    },
    timings: TIMINGS,
    careLines: [
      "右手被你碰到，心情有一点点变好。",
      "你碰这里的时候，我会有种被安抚到的错觉。",
      "如果是这样碰一下，我还能接受。"
    ],
    rageLines: [
      "右手要开始挡你了。",
      "你别逼我用手把你推开。",
      "这个动作已经进入防御状态了。"
    ]
  },
  shoulder: {
    id: "shoulder",
    label: "肩膀",
    correctModes: [MODE.CARE],
    animationKey: "shoulder",
    expressionKey: {
      care: STATUS.HAPPY,
      rage: STATUS.TIRED
    },
    timings: TIMINGS,
    careLines: [
      "拍肩这种安抚，我还挺吃的。",
      "肩膀放松了一点，今天先原谅你。",
      "你这样碰一下，像在跟我说别紧张。"
    ],
    rageLines: [
      "肩膀不是给你拿来试压的。",
      "你再拍，我就只会觉得累。",
      "这个位置现在只想躲开。"
    ]
  },
  body: {
    id: "body",
    label: "身体",
    correctModes: [MODE.RAGE],
    animationKey: "body",
    expressionKey: {
      care: STATUS.TIRED,
      rage: STATUS.ANGRY
    },
    timings: TIMINGS,
    careLines: [
      "这里先别碰，我会下意识警惕。",
      "你突然碰这里，我会后退。",
      "这块区域还是先克制一点。"
    ],
    rageLines: [
      "身体已经在防御了。",
      "你再来一下，我就要后仰躲了。",
      "这个动作直接把我打进警戒线。"
    ]
  },
  leg: {
    id: "leg",
    label: "腿部",
    correctModes: [MODE.RAGE],
    animationKey: "leg",
    expressionKey: {
      care: STATUS.TIRED,
      rage: STATUS.ANNOYED
    },
    timings: TIMINGS,
    careLines: [
      "腿边这种试探，我会先躲一下。",
      "先别碰腿，我还没放松到那一步。",
      "这个位置会让我想后撤。"
    ],
    rageLines: [
      "腿已经条件反射想闪了。",
      "你一碰这里，我就想往后躲。",
      "这块区域不适合高频骚扰。"
    ]
  }
};

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
