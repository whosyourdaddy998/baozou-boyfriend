export const STORAGE_KEY = "baozou-boyfriend-3d-v2";

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

export const RENDER_MODE = {
  FULL_3D: "full3d",
  LITE_3D: "lite3d",
  FALLBACK_2D: "fallback2d"
};

export const LOAD_STATE = {
  LOADING: "loading",
  READY: "ready",
  FALLBACK: "fallback"
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

export const defaultLocalAvatarPath = `${import.meta.env.BASE_URL}models/default-boyfriend.glb`;

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

export const mixamoSlots = [
  { clipName: "Idle", file: "/mixamo/Idle.fbx" },
  { clipName: "Shy", file: "/mixamo/Shy.fbx" },
  { clipName: "Hit", file: "/mixamo/Hit.fbx" },
  { clipName: "PushBack", file: "/mixamo/PushBack.fbx" },
  { clipName: "Wave", file: "/mixamo/Wave.fbx" },
  { clipName: "Angry", file: "/mixamo/Angry.fbx" }
];

export const areaConfigs = {
  head: {
    id: "head",
    label: "头部",
    correctModes: [MODE.CARE],
    animationKey: "head",
    expressionKey: { care: STATUS.SHY, rage: STATUS.ANGRY },
    speechTone: { care: "gentle", rage: "warning" },
    effectLevel: { care: "soft", rage: "sharp" },
    timings: TIMINGS,
    careLines: [
      "别这样摸头，我会一下子心软。",
      "你这一摸，像在哄人。",
      "头顶这里……真的很容易让我认输。"
    ],
    rageLines: [
      "别敲头，我真的会记仇。",
      "头顶是警戒区，你现在踩线了。",
      "你这一下像在故意惹我炸毛。"
    ]
  },
  face: {
    id: "face",
    label: "脸部",
    correctModes: [MODE.CARE],
    animationKey: "face",
    expressionKey: { care: STATUS.SHY, rage: STATUS.ANNOYED },
    speechTone: { care: "shy", rage: "protest" },
    effectLevel: { care: "soft", rage: "sharp" },
    timings: TIMINGS,
    careLines: [
      "靠这么近，我会脸红的。",
      "别一直碰脸，我都不知道该看哪里了。",
      "你是不是故意想看我害羞。"
    ],
    rageLines: [
      "脸不是给你拿来乱闹的。",
      "你再戳，我就直接无语给你看。",
      "这个位置最容易把我点烦。"
    ]
  },
  handLeft: {
    id: "handLeft",
    label: "左手",
    correctModes: [MODE.CARE, MODE.RAGE],
    animationKey: "handLeft",
    expressionKey: { care: STATUS.HAPPY, rage: STATUS.ANGRY },
    speechTone: { care: "gentle", rage: "warning" },
    effectLevel: { care: "soft", rage: "medium" },
    timings: TIMINGS,
    careLines: [
      "左手先借你一下，但别握太久。",
      "这样碰手，像是想安抚我。",
      "你一碰这里，我就会不自觉靠近一点。"
    ],
    rageLines: [
      "左手都快被你逼得想甩开了。",
      "再扒拉我手，我就要挡你了。",
      "这个动作已经很像挑衅。"
    ]
  },
  handRight: {
    id: "handRight",
    label: "右手",
    correctModes: [MODE.CARE, MODE.RAGE],
    animationKey: "handRight",
    expressionKey: { care: STATUS.HAPPY, rage: STATUS.ANGRY },
    speechTone: { care: "gentle", rage: "warning" },
    effectLevel: { care: "soft", rage: "medium" },
    timings: TIMINGS,
    careLines: [
      "右手被你碰到，心情会慢慢变软。",
      "你这样轻轻碰一下，我还能接受。",
      "这一碰不像试探，更像是在哄我。"
    ],
    rageLines: [
      "右手已经准备挡你了。",
      "别逼我直接把你推开。",
      "你再来一下，我就真不客气了。"
    ]
  },
  shoulder: {
    id: "shoulder",
    label: "肩膀",
    correctModes: [MODE.CARE],
    animationKey: "shoulder",
    expressionKey: { care: STATUS.HAPPY, rage: STATUS.TIRED },
    speechTone: { care: "gentle", rage: "flat" },
    effectLevel: { care: "soft", rage: "low" },
    timings: TIMINGS,
    careLines: [
      "拍肩这种安抚，我还挺吃的。",
      "肩膀一下子放松了。",
      "你这样碰一下，像在跟我说别紧张。"
    ],
    rageLines: [
      "肩膀不是给你拿来试压的。",
      "再拍我只会觉得累。",
      "这个位置现在只想躲开。"
    ]
  },
  body: {
    id: "body",
    label: "身体",
    correctModes: [MODE.RAGE],
    animationKey: "body",
    expressionKey: { care: STATUS.TIRED, rage: STATUS.ANGRY },
    speechTone: { care: "flat", rage: "protest" },
    effectLevel: { care: "low", rage: "strong" },
    timings: TIMINGS,
    careLines: [
      "这里先别碰，我会本能警惕。",
      "这一下让我想后退。",
      "这个位置还是先克制一点。"
    ],
    rageLines: [
      "身体已经进入防御动作了。",
      "你再来一下，我就要后仰躲了。",
      "这一碰直接把我点进警戒线。"
    ]
  },
  leg: {
    id: "leg",
    label: "腿部",
    correctModes: [MODE.RAGE],
    animationKey: "leg",
    expressionKey: { care: STATUS.TIRED, rage: STATUS.ANNOYED },
    speechTone: { care: "flat", rage: "protest" },
    effectLevel: { care: "low", rage: "medium" },
    timings: TIMINGS,
    careLines: [
      "这里我会先躲一下。",
      "先别碰腿，我还没放松到那一步。",
      "这块区域会让我本能后撤。"
    ],
    rageLines: [
      "腿已经条件反射想闪开了。",
      "你一碰这里，我就想往后躲。",
      "这个位置不适合高频骚扰。"
    ]
  }
};

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
