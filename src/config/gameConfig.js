export const STORAGE_KEY = "baozou-boyfriend-3d-v3";

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
  { id: "care-learner", label: "有效安抚 3 次", threshold: { heart: 3 } },
  { id: "head-pat-pro", label: "互动 20 次", threshold: { totalInteractions: 20 } },
  { id: "blush-hunter", label: "好感达到 20", threshold: { affection: 20 } },
  { id: "steady-company", label: "爱心值达到 12", threshold: { heart: 12 } },
  { id: "gesture-reader", label: "好感达到 45", threshold: { affection: 45 } },
  { id: "trusted-close", label: "好感达到 60", threshold: { affection: 60 } },
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
    speechTone: { care: "gentle", rage: "protest" },
    effectLevel: { care: "sweet", rage: "boom" },
    timings: TIMINGS,
    careLines: [
      "头顶被摸到会自动变乖，这个设定很危险。",
      "别一直揉我头发，我的帅气发型要报警了。",
      "好吧，就让你摸一下，不能得寸进尺。"
    ],
    rageLines: [
      "砰！你这是拍头还是给我重启系统？",
      "头顶警报响了，男朋友进入防御姿态。",
      "再敲头，我就把委屈挂脸上给你看。"
    ]
  },
  face: {
    id: "face",
    label: "脸部",
    correctModes: [MODE.CARE],
    animationKey: "face",
    expressionKey: { care: STATUS.SHY, rage: STATUS.ANNOYED },
    speechTone: { care: "shy", rage: "protest" },
    effectLevel: { care: "spark", rage: "boom" },
    timings: TIMINGS,
    careLines: [
      "你靠这么近，我脸红不是很合理吗？",
      "戳脸犯规，害羞值已经溢出来了。",
      "别看了，再看我就装作没看见你。"
    ],
    rageLines: [
      "啪！脸不是按钮，别拿来连点测试。",
      "你再戳，我就用无语表情反击。",
      "脸部受到攻击，尊严正在加载补丁。"
    ]
  },
  handLeft: {
    id: "handLeft",
    label: "左手",
    correctModes: [MODE.CARE, MODE.RAGE],
    animationKey: "handLeft",
    expressionKey: { care: STATUS.HAPPY, rage: STATUS.ANGRY },
    speechTone: { care: "gentle", rage: "warning" },
    effectLevel: { care: "sweet", rage: "pop" },
    timings: TIMINGS,
    careLines: [
      "左手借你牵一下，但不能偷偷捏太久。",
      "这样碰手，像是在说别紧张。",
      "你一碰这里，我就有点想靠近。"
    ],
    rageLines: [
      "左手申请撤退！",
      "别拽我手，我会甩开但不会真的生气。",
      "这一下像突然抢遥控器，很离谱。"
    ]
  },
  handRight: {
    id: "handRight",
    label: "右手",
    correctModes: [MODE.CARE, MODE.RAGE],
    animationKey: "handRight",
    expressionKey: { care: STATUS.HAPPY, rage: STATUS.ANGRY },
    speechTone: { care: "gentle", rage: "warning" },
    effectLevel: { care: "sweet", rage: "pop" },
    timings: TIMINGS,
    careLines: [
      "右手被轻轻碰到，心情会变软一点。",
      "这一下还挺温柔，我勉强给高分。",
      "像牵手预告片，先别太得意。"
    ],
    rageLines: [
      "右手已经准备挡开你了。",
      "你这是握手还是摇可乐？",
      "再来一下，我就把手藏起来。"
    ]
  },
  shoulder: {
    id: "shoulder",
    label: "肩膀",
    correctModes: [MODE.CARE],
    animationKey: "shoulder",
    expressionKey: { care: STATUS.HAPPY, rage: STATUS.TIRED },
    speechTone: { care: "gentle", rage: "flat" },
    effectLevel: { care: "spark", rage: "pop" },
    timings: TIMINGS,
    careLines: [
      "肩膀被拍拍，整个人都放松了一点。",
      "这个安抚方式还不错，准许继续。",
      "好像真的没那么紧张了。"
    ],
    rageLines: [
      "肩膀不是打击乐器，节奏收一收。",
      "再拍我只会觉得你很闲。",
      "我现在只想把肩膀缩起来。"
    ]
  },
  body: {
    id: "body",
    label: "身体",
    correctModes: [MODE.RAGE],
    animationKey: "body",
    expressionKey: { care: STATUS.TIRED, rage: STATUS.ANGRY },
    speechTone: { care: "flat", rage: "protest" },
    effectLevel: { care: "pop", rage: "mega" },
    timings: TIMINGS,
    careLines: [
      "这里先别碰，我会本能后退。",
      "这个位置让我有点警惕，换个温柔点的地方吧。",
      "安抚不是这样安抚的，老师敲黑板。"
    ],
    rageLines: [
      "轰！身体进入防御模式，求生值正在尖叫。",
      "这一下有点狠，我要战略性后仰。",
      "你这是整蛊，不是互动，记小本本了。"
    ]
  },
  leg: {
    id: "leg",
    label: "腿部",
    correctModes: [MODE.RAGE],
    animationKey: "leg",
    expressionKey: { care: STATUS.TIRED, rage: STATUS.ANNOYED },
    speechTone: { care: "flat", rage: "protest" },
    effectLevel: { care: "pop", rage: "boom" },
    timings: TIMINGS,
    careLines: [
      "腿部会本能躲开，先别从这里开始。",
      "这里不适合温柔互动，我先退半步。",
      "这个地方有点痒，也有点尴尬。"
    ],
    rageLines: [
      "腿已经条件反射想跑路了。",
      "你一碰这里，我就想原地闪现。",
      "抗议！腿部不接受高频骚扰。"
    ]
  }
};

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
