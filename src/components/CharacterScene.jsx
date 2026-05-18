import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, PerspectiveCamera } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { LOAD_STATE, MODE, RENDER_MODE, STATUS, defaultLocalAvatarPath } from "../config/gameConfig";

const meshAreaHints = [
  { match: ["head", "hair", "hat"], areaId: "head" },
  { match: ["eye", "eyelash", "teeth", "mouth", "face"], areaId: "face" },
  { match: ["lefthand", "leftforearm", "handl", "hand_l"], areaId: "handLeft" },
  { match: ["righthand", "rightforearm", "handr", "hand_r"], areaId: "handRight" },
  { match: ["shoulder", "clavicle"], areaId: "shoulder" },
  { match: ["leg", "thigh", "calf", "foot"], areaId: "leg" },
  { match: ["body", "torso", "hips", "spine", "outfit", "shirt", "pants"], areaId: "body" }
];

function isLikelyMobile() {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

function canUseWebGL() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (error) {
    return false;
  }
}

function classifyByName(name) {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const hit = meshAreaHints.find((item) => item.match.some((part) => normalized.includes(part)));
  return hit ? hit.areaId : null;
}

function classifyByLocalPoint(point) {
  if (!point) {
    return "body";
  }
  if (point.y > 1.45) {
    return "head";
  }
  if (point.y > 1.18) {
    return "face";
  }
  if (point.y > 0.96 && Math.abs(point.x) > 0.45) {
    return "shoulder";
  }
  if (point.y > 0.72 && Math.abs(point.x) > 0.72) {
    return point.x > 0 ? "handRight" : "handLeft";
  }
  if (point.y > 0.36) {
    return "body";
  }
  return "leg";
}

function collectNodes(scene) {
  const nodes = {};
  scene.traverse((child) => {
    const name = child.name.toLowerCase();
    if (!child.isBone) {
      return;
    }
    if (!nodes.head && (name.includes("head") || name.includes("neck"))) {
      nodes.head = child;
    }
    if (!nodes.spine && (name.includes("spine") || name.includes("hips"))) {
      nodes.spine = child;
    }
    if (!nodes.leftHand && (name.includes("lefthand") || name.includes("leftarm"))) {
      nodes.leftHand = child;
    }
    if (!nodes.rightHand && (name.includes("righthand") || name.includes("rightarm"))) {
      nodes.rightHand = child;
    }
    if (!nodes.leftShoulder && name.includes("leftshoulder")) {
      nodes.leftShoulder = child;
    }
    if (!nodes.rightShoulder && name.includes("rightshoulder")) {
      nodes.rightShoulder = child;
    }
  });
  return nodes;
}

function useAvatarScene(url, onRenderStateChange) {
  const [scene, setScene] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    const loader = new GLTFLoader();

    onRenderStateChange({
      loadState: LOAD_STATE.LOADING
    });
    setLoadFailed(false);

    loader.load(
      url,
      (gltf) => {
        if (disposed) {
          return;
        }

        const clone = cloneSkeleton(gltf.scene);
        clone.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        setScene(clone);
        onRenderStateChange({
          loadState: LOAD_STATE.READY
        });
      },
      undefined,
      () => {
        if (disposed) {
          return;
        }

        setScene(null);
        setLoadFailed(true);
        onRenderStateChange({
          loadState: LOAD_STATE.FALLBACK,
          fallbackReason: "模型加载失败，已切换到轻量角色。"
        });
      }
    );

    return () => {
      disposed = true;
    };
  }, [onRenderStateChange, url]);

  return { scene, loadFailed };
}

function FullAvatar({ avatarUrl, currentMode, status, onHit, interactionEffect, onRenderStateChange }) {
  const groupRef = useRef();
  const idleRef = useRef(null);
  const blinkRef = useRef(null);
  const { scene, loadFailed } = useAvatarScene(avatarUrl || defaultLocalAvatarPath, onRenderStateChange);
  const boneNodes = useMemo(() => (scene ? collectNodes(scene) : {}), [scene]);

  useEffect(() => {
    if (!scene || !groupRef.current) {
      return undefined;
    }

    idleRef.current?.kill();
    blinkRef.current?.kill();

    const baseY = groupRef.current.position.y;
    const headBone = boneNodes.head;
    const swing = isLikelyMobile() ? 0.03 : 0.05;

    idleRef.current = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    idleRef.current
      .to(groupRef.current.position, { y: baseY + 0.035, duration: 2.2 })
      .to(groupRef.current.rotation, { y: swing, duration: 1.5 }, 0.2)
      .to(groupRef.current.rotation, { y: -swing * 0.65, duration: 1.3 }, 1.95);

    if (headBone) {
      const originX = headBone.rotation.x;
      const originY = headBone.rotation.y;
      blinkRef.current = gsap.timeline({ repeat: -1, repeatDelay: currentMode === MODE.CARE ? 1.1 : 1.7 });
      blinkRef.current
        .to(headBone.rotation, { x: originX + 0.03, duration: 0.08 })
        .to(headBone.rotation, { x: originX, duration: 0.1 })
        .to(headBone.rotation, { y: originY + 0.1, duration: 0.24 }, "+=1.2")
        .to(headBone.rotation, { y: originY, duration: 0.24 });
    }

    return () => {
      idleRef.current?.kill();
      blinkRef.current?.kill();
    };
  }, [boneNodes, currentMode, scene]);

  useEffect(() => {
    if (!interactionEffect || !groupRef.current) {
      return undefined;
    }

    const timeline = gsap.timeline();
    const headBone = boneNodes.head;
    const spineBone = boneNodes.spine;
    const leftHand = boneNodes.leftHand || boneNodes.leftShoulder;
    const rightHand = boneNodes.rightHand || boneNodes.rightShoulder;
    const shoulderBone = boneNodes.leftShoulder || boneNodes.rightShoulder;

    timeline.to(groupRef.current.rotation, { z: interactionEffect.mode === MODE.CARE ? -0.018 : 0.035, duration: 0.16 }, 0);

    switch (interactionEffect.areaId) {
      case "head":
        if (headBone) {
          timeline.to(headBone.rotation, { x: interactionEffect.mode === MODE.CARE ? 0.2 : -0.18, duration: 0.2 }, 0);
          timeline.to(headBone.rotation, { y: interactionEffect.mode === MODE.CARE ? 0.16 : -0.06, duration: 0.18 }, 0.12);
        }
        break;
      case "face":
        if (headBone) {
          timeline.to(headBone.rotation, { y: interactionEffect.mode === MODE.CARE ? -0.28 : 0.24, duration: 0.22 }, 0);
          timeline.to(headBone.rotation, { z: interactionEffect.mode === MODE.CARE ? -0.06 : 0.12, duration: 0.18 }, 0.12);
        }
        break;
      case "handLeft":
        if (leftHand) {
          timeline.to(leftHand.rotation, { z: interactionEffect.mode === MODE.CARE ? -0.62 : 0.62, duration: 0.2 }, 0);
        }
        break;
      case "handRight":
        if (rightHand) {
          timeline.to(rightHand.rotation, { z: interactionEffect.mode === MODE.CARE ? 0.62 : -0.62, duration: 0.2 }, 0);
        }
        break;
      case "shoulder":
        if (shoulderBone) {
          timeline.to(shoulderBone.rotation, { x: interactionEffect.mode === MODE.CARE ? -0.2 : 0.18, duration: 0.2 }, 0);
        }
        break;
      case "body":
        if (spineBone) {
          timeline.to(spineBone.rotation, { x: interactionEffect.mode === MODE.CARE ? 0.12 : -0.24, duration: 0.22 }, 0);
          timeline.to(spineBone.rotation, { z: interactionEffect.mode === MODE.CARE ? 0 : 0.12, duration: 0.16 }, 0.12);
        }
        break;
      case "leg":
        timeline.to(groupRef.current.position, { x: interactionEffect.mode === MODE.CARE ? 0.08 : -0.12, duration: 0.18 }, 0);
        break;
      default:
        break;
    }

    timeline.to(groupRef.current.rotation, { x: 0, y: 0, z: 0, duration: 0.28, ease: "power2.inOut" }, 0.78);
    timeline.to(groupRef.current.position, { x: 0, duration: 0.22 }, 0.82);
    return () => timeline.kill();
  }, [boneNodes, interactionEffect]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }
    const pointerX = THREE.MathUtils.clamp(state.pointer.x * 0.12, -0.14, 0.14);
    groupRef.current.rotation.y += (pointerX - groupRef.current.rotation.y) * 0.08;
  });

  if (!scene || loadFailed) {
    return <LiteAvatar currentMode={currentMode} onHit={onHit} status={status} interactionEffect={interactionEffect} />;
  }

  function handlePointerDown(event) {
    event.stopPropagation();
    const meshArea = classifyByName(event.object.name);
    const localPoint = groupRef.current.worldToLocal(event.point.clone());
    const areaId = meshArea || classifyByLocalPoint(localPoint);
    onHit(areaId);
  }

  return (
    <group ref={groupRef} position={[0, -1.78, 0]} scale={1.82} onPointerDown={handlePointerDown}>
      <primitive object={scene} />
    </group>
  );
}

function LiteAvatar({ currentMode, status, onHit, interactionEffect }) {
  const rootRef = useRef();

  useEffect(() => {
    if (!interactionEffect || !rootRef.current) {
      return undefined;
    }

    const timeline = gsap.timeline();
    timeline.to(rootRef.current.rotation, { z: interactionEffect.mode === MODE.CARE ? -0.04 : 0.05, duration: 0.16 }, 0);
    if (interactionEffect.areaId === "head") {
      timeline.to(rootRef.current.rotation, { x: interactionEffect.mode === MODE.CARE ? 0.05 : -0.08, duration: 0.2 }, 0);
    }
    if (interactionEffect.areaId === "face") {
      timeline.to(rootRef.current.rotation, { y: interactionEffect.mode === MODE.CARE ? -0.12 : 0.12, duration: 0.22 }, 0);
    }
    if (interactionEffect.areaId === "body") {
      timeline.to(rootRef.current.position, { z: interactionEffect.mode === MODE.CARE ? 0.02 : -0.08, duration: 0.2 }, 0);
    }
    if (interactionEffect.areaId === "leg") {
      timeline.to(rootRef.current.position, { x: interactionEffect.mode === MODE.CARE ? 0.05 : -0.08, duration: 0.18 }, 0);
    }
    timeline.to(rootRef.current.rotation, { x: 0, y: 0, z: 0, duration: 0.3 }, 0.85);
    timeline.to(rootRef.current.position, { x: 0, z: 0, duration: 0.22 }, 0.88);
    return () => timeline.kill();
  }, [interactionEffect]);

  useFrame((state) => {
    if (!rootRef.current) {
      return;
    }
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, state.pointer.x * 0.14, 0.08);
  });

  return (
    <group ref={rootRef} position={[0, -1.15, 0]}>
      <mesh position={[0, 2.05, 0]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("head"); }}>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial color={status === STATUS.ANGRY || status === STATUS.ANNOYED ? "#ff9685" : "#ffd2bf"} />
      </mesh>
      <mesh position={[0, 1.83, 0.3]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("face"); }}>
        <planeGeometry args={[0.42, 0.26]} />
        <meshBasicMaterial color={currentMode === MODE.CARE ? "#ff93b2" : "#ff6f5c"} transparent opacity={0.24} />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("body"); }}>
        <capsuleGeometry args={[0.34, 0.9, 8, 18]} />
        <meshStandardMaterial color="#7db3ff" />
      </mesh>
      <mesh position={[-0.74, 1.15, 0]} rotation={[0, 0, 0.42]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("handLeft"); }}>
        <capsuleGeometry args={[0.12, 0.74, 6, 16]} />
        <meshStandardMaterial color="#ffd2bf" />
      </mesh>
      <mesh position={[0.74, 1.15, 0]} rotation={[0, 0, -0.42]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("handRight"); }}>
        <capsuleGeometry args={[0.12, 0.74, 6, 16]} />
        <meshStandardMaterial color="#ffd2bf" />
      </mesh>
      <mesh position={[-0.38, 1.34, 0]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("shoulder"); }}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#a9c8ff" />
      </mesh>
      <mesh position={[0.38, 1.34, 0]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("shoulder"); }}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#a9c8ff" />
      </mesh>
      <mesh position={[-0.2, 0.06, 0]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("leg"); }}>
        <capsuleGeometry args={[0.14, 0.86, 6, 16]} />
        <meshStandardMaterial color="#525c7a" />
      </mesh>
      <mesh position={[0.2, 0.06, 0]} castShadow onPointerDown={(event) => { event.stopPropagation(); onHit("leg"); }}>
        <capsuleGeometry args={[0.14, 0.86, 6, 16]} />
        <meshStandardMaterial color="#525c7a" />
      </mesh>
    </group>
  );
}

function FloatingEffect({ interactionEffect }) {
  if (!interactionEffect) {
    return null;
  }

  const map = {
    head: interactionEffect.mode === MODE.CARE ? "♡" : "✦",
    face: interactionEffect.mode === MODE.CARE ? "✿" : "…",
    body: interactionEffect.mode === MODE.CARE ? "!" : "⚡",
    shoulder: interactionEffect.mode === MODE.CARE ? "☁" : "!",
    handLeft: interactionEffect.mode === MODE.CARE ? "↖" : "✋",
    handRight: interactionEffect.mode === MODE.CARE ? "↗" : "✋",
    leg: interactionEffect.mode === MODE.CARE ? "…" : "⇢"
  };

  return (
    <Html center position={[0, 1.95, 0]} zIndexRange={[20, 0]}>
      <div className={`effect-badge effect-${interactionEffect.areaId} fx-${interactionEffect.fxLevel}`}>
        {map[interactionEffect.areaId] || "!"}
      </div>
    </Html>
  );
}

function SceneRig({ avatarUrl, currentMode, status, renderMode, onHit, interactionEffect, onRenderStateChange }) {
  const mobileLite = renderMode === RENDER_MODE.LITE_3D;
  const useShadow = !mobileLite;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 4.35]} fov={36} />
      <color attach="background" args={["#fff4e7"]} />
      <ambientLight intensity={mobileLite ? 1.7 : 1.45} />
      <directionalLight
        position={[2.4, 4.2, 3]}
        intensity={mobileLite ? 1.45 : 1.95}
        castShadow={useShadow}
        shadow-mapSize-width={useShadow ? 1024 : 256}
        shadow-mapSize-height={useShadow ? 1024 : 256}
      />
      <spotLight position={[-2.5, 3.8, 2]} intensity={mobileLite ? 0.78 : 1.05} angle={0.44} penumbra={0.68} color="#ffd1a8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow={useShadow}>
        <circleGeometry args={[3.2, 42]} />
        <shadowMaterial transparent opacity={useShadow ? 0.22 : 0.1} />
      </mesh>
      <FullAvatar
        avatarUrl={avatarUrl}
        currentMode={currentMode}
        status={status}
        onHit={onHit}
        interactionEffect={interactionEffect}
        onRenderStateChange={onRenderStateChange}
      />
      <FloatingEffect interactionEffect={interactionEffect} />
    </>
  );
}

function FallbackDomAvatar({ currentMode, status, onHit }) {
  return (
    <div className={`fallback-dom-avatar status-${status} mode-${currentMode}`}>
      <button className="dom-area dom-head" type="button" onClick={() => onHit("head")} aria-label="点击头部" />
      <button className="dom-area dom-face" type="button" onClick={() => onHit("face")} aria-label="点击脸部" />
      <button className="dom-area dom-left-hand" type="button" onClick={() => onHit("handLeft")} aria-label="点击左手" />
      <button className="dom-area dom-right-hand" type="button" onClick={() => onHit("handRight")} aria-label="点击右手" />
      <button className="dom-area dom-shoulder" type="button" onClick={() => onHit("shoulder")} aria-label="点击肩膀" />
      <button className="dom-area dom-body" type="button" onClick={() => onHit("body")} aria-label="点击身体" />
      <button className="dom-area dom-leg" type="button" onClick={() => onHit("leg")} aria-label="点击腿部" />
      <div className="dom-avatar-figure">
        <div className="dom-head-shell">
          <span className="dom-eye dom-eye-left"></span>
          <span className="dom-eye dom-eye-right"></span>
          <span className="dom-blush dom-blush-left"></span>
          <span className="dom-blush dom-blush-right"></span>
          <span className="dom-mouth"></span>
        </div>
        <div className="dom-body-shell"></div>
        <div className="dom-arm dom-arm-left"></div>
        <div className="dom-arm dom-arm-right"></div>
        <div className="dom-leg-shell dom-leg-left"></div>
        <div className="dom-leg-shell dom-leg-right"></div>
      </div>
    </div>
  );
}

export default function CharacterScene({
  avatarUrl,
  currentMode,
  status,
  renderMode,
  onHit,
  interactionEffect,
  onRenderStateChange
}) {
  const [resolvedMode, setResolvedMode] = useState(renderMode);

  useEffect(() => {
    if (!canUseWebGL()) {
      setResolvedMode(RENDER_MODE.FALLBACK_2D);
      onRenderStateChange({
        renderMode: RENDER_MODE.FALLBACK_2D,
        loadState: LOAD_STATE.FALLBACK,
        fallbackReason: "当前设备的 WebGL 初始化失败，已切换到轻量互动模式。"
      });
      return;
    }

    if (isLikelyMobile()) {
      setResolvedMode(RENDER_MODE.LITE_3D);
      onRenderStateChange({
        renderMode: RENDER_MODE.LITE_3D,
        fallbackReason: ""
      });
      return;
    }

    setResolvedMode(RENDER_MODE.FULL_3D);
    onRenderStateChange({
      renderMode: RENDER_MODE.FULL_3D,
      fallbackReason: ""
    });
  }, [onRenderStateChange]);

  useEffect(() => {
    if (renderMode && renderMode !== resolvedMode && resolvedMode !== RENDER_MODE.FALLBACK_2D) {
      setResolvedMode(renderMode);
    }
  }, [renderMode, resolvedMode]);

  if (resolvedMode === RENDER_MODE.FALLBACK_2D) {
    return <FallbackDomAvatar currentMode={currentMode} status={status} onHit={onHit} />;
  }

  return (
    <Canvas
      shadows={resolvedMode === RENDER_MODE.FULL_3D}
      dpr={resolvedMode === RENDER_MODE.FULL_3D ? [1, 1.6] : [1, 1.15]}
      gl={{ antialias: resolvedMode === RENDER_MODE.FULL_3D, alpha: true, powerPreference: "high-performance" }}
    >
      <SceneRig
        avatarUrl={avatarUrl}
        currentMode={currentMode}
        status={status}
        renderMode={resolvedMode}
        onHit={onHit}
        interactionEffect={interactionEffect}
        onRenderStateChange={onRenderStateChange}
      />
    </Canvas>
  );
}
