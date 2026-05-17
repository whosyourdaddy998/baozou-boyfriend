import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { MODE, STATUS, defaultReadyPlayerMeUrl } from "../config/gameConfig";

const meshAreaHints = [
  { match: ["head", "hair", "hat"], areaId: "head" },
  { match: ["eye", "eyelash", "teeth", "mouth", "face"], areaId: "face" },
  { match: ["lefthand", "leftforearm", "handl", "hand_l"], areaId: "handLeft" },
  { match: ["righthand", "rightforearm", "handr", "hand_r"], areaId: "handRight" },
  { match: ["shoulder", "clavicle"], areaId: "shoulder" },
  { match: ["leg", "thigh", "calf", "foot"], areaId: "leg" },
  { match: ["body", "torso", "hips", "spine", "outfit", "shirt", "pants"], areaId: "body" }
];

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

function useAvatarScene(url, onLoadStateChange) {
  const [scene, setScene] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    const loader = new GLTFLoader();

    onLoadStateChange("loading");
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
        onLoadStateChange("ready");
      },
      undefined,
      () => {
        if (disposed) {
          return;
        }

        setScene(null);
        setLoadFailed(true);
        onLoadStateChange("fallback");
      }
    );

    return () => {
      disposed = true;
    };
  }, [onLoadStateChange, url]);

  return { scene, loadFailed };
}

function AvatarModel({ avatarUrl, currentMode, status, onHit, interactionEffect, onLoadStateChange }) {
  const groupRef = useRef();
  const idleRef = useRef(null);
  const blinkRef = useRef(null);
  const { scene, loadFailed } = useAvatarScene(avatarUrl || defaultReadyPlayerMeUrl, onLoadStateChange);
  const boneNodes = useMemo(() => (scene ? collectNodes(scene) : {}), [scene]);

  useEffect(() => {
    if (!scene || !groupRef.current) {
      return undefined;
    }

    idleRef.current?.kill();
    blinkRef.current?.kill();

    const baseY = groupRef.current.position.y;
    const headBone = boneNodes.head;

    idleRef.current = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } });
    idleRef.current
      .to(groupRef.current.position, { y: baseY + 0.04, duration: 2.2 })
      .to(groupRef.current.rotation, { y: 0.08, duration: 1.6 }, 0.2)
      .to(groupRef.current.rotation, { y: -0.05, duration: 1.4 }, 2.1);

    if (headBone) {
      const originX = headBone.rotation.x;
      const originY = headBone.rotation.y;
      blinkRef.current = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
      blinkRef.current
        .to(headBone.rotation, { x: originX + 0.04, duration: 0.09 })
        .to(headBone.rotation, { x: originX, duration: 0.1 })
        .to(headBone.rotation, { y: originY + 0.12, duration: 0.26 }, "+=1.6")
        .to(headBone.rotation, { y: originY, duration: 0.26 });
    }

    return () => {
      idleRef.current?.kill();
      blinkRef.current?.kill();
    };
  }, [boneNodes, scene]);

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

    if (interactionEffect.mode === MODE.RAGE) {
      timeline.to(groupRef.current.rotation, { z: 0.04, x: -0.06, duration: 0.18, ease: "power2.out" }, 0);
    } else {
      timeline.to(groupRef.current.rotation, { z: -0.02, duration: 0.18, ease: "power2.out" }, 0);
    }

    switch (interactionEffect.areaId) {
      case "head":
        if (headBone) {
          timeline.to(headBone.rotation, { x: interactionEffect.mode === MODE.CARE ? 0.18 : -0.2, duration: 0.22 }, 0);
          timeline.to(headBone.rotation, { y: interactionEffect.mode === MODE.CARE ? 0.12 : 0, duration: 0.18 }, 0.12);
        }
        break;
      case "face":
        if (headBone) {
          timeline.to(headBone.rotation, { y: interactionEffect.mode === MODE.CARE ? -0.22 : 0.24, duration: 0.22 }, 0);
          timeline.to(headBone.rotation, { z: interactionEffect.mode === MODE.CARE ? -0.05 : 0.08, duration: 0.2 }, 0.12);
        }
        break;
      case "handLeft":
        if (leftHand) {
          timeline.to(leftHand.rotation, { z: interactionEffect.mode === MODE.CARE ? -0.5 : 0.5, duration: 0.22 }, 0);
        }
        break;
      case "handRight":
        if (rightHand) {
          timeline.to(rightHand.rotation, { z: interactionEffect.mode === MODE.CARE ? 0.5 : -0.5, duration: 0.22 }, 0);
        }
        break;
      case "shoulder":
        if (shoulderBone) {
          timeline.to(shoulderBone.rotation, { x: interactionEffect.mode === MODE.CARE ? -0.15 : 0.14, duration: 0.22 }, 0);
        }
        break;
      case "body":
        if (spineBone) {
          timeline.to(spineBone.rotation, { x: interactionEffect.mode === MODE.CARE ? 0.08 : -0.2, duration: 0.22 }, 0);
        }
        break;
      case "leg":
        timeline.to(groupRef.current.position, { x: interactionEffect.mode === MODE.CARE ? 0.06 : -0.1, duration: 0.2 }, 0);
        break;
      default:
        break;
    }

    if (spineBone && interactionEffect.mode === MODE.RAGE) {
      timeline.to(spineBone.rotation, { z: 0.1, duration: 0.16 }, 0.1);
    }

    timeline.to(groupRef.current.rotation, { x: 0, y: 0, z: 0, duration: 0.28, ease: "power2.inOut" }, 0.8);
    timeline.to(groupRef.current.position, { x: 0, duration: 0.22 }, 0.82);

    return () => timeline.kill();
  }, [boneNodes, interactionEffect]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const pointerX = THREE.MathUtils.clamp(state.pointer.x * 0.15, -0.18, 0.18);
    groupRef.current.rotation.y += (pointerX - groupRef.current.rotation.y) * 0.08;
  });

  if (!scene || loadFailed) {
    return <FallbackAvatar currentMode={currentMode} onHit={onHit} status={status} />;
  }

  function handlePointerDown(event) {
    event.stopPropagation();
    const meshArea = classifyByName(event.object.name);
    const localPoint = groupRef.current.worldToLocal(event.point.clone());
    const areaId = meshArea || classifyByLocalPoint(localPoint);
    onHit(areaId);
  }

  return (
    <Float rotationIntensity={0.08} floatIntensity={0.18} speed={1.4}>
      <group ref={groupRef} position={[0, -1.78, 0]} scale={1.86} onPointerDown={handlePointerDown}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

function FallbackAvatar({ currentMode, status, onHit }) {
  const rootRef = useRef();

  useFrame((state) => {
    if (!rootRef.current) {
      return;
    }

    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, state.pointer.x * 0.18, 0.08);
  });

  return (
    <group ref={rootRef} position={[0, -1.15, 0]}>
      <mesh
        position={[0, 2.05, 0]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("head");
        }}
      >
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial color={status === STATUS.ANGRY ? "#ff9685" : "#ffd2bf"} />
      </mesh>
      <mesh
        position={[0, 1.83, 0.29]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("face");
        }}
      >
        <planeGeometry args={[0.42, 0.26]} />
        <meshBasicMaterial color={currentMode === MODE.CARE ? "#ff89aa" : "#ff725e"} transparent opacity={0.22} />
      </mesh>
      <mesh
        position={[0, 1.08, 0]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("body");
        }}
      >
        <capsuleGeometry args={[0.34, 0.9, 8, 18]} />
        <meshStandardMaterial color="#7db3ff" />
      </mesh>
      <mesh
        position={[-0.74, 1.15, 0]}
        rotation={[0, 0, 0.4]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("handLeft");
        }}
      >
        <capsuleGeometry args={[0.12, 0.74, 6, 16]} />
        <meshStandardMaterial color="#ffd2bf" />
      </mesh>
      <mesh
        position={[0.74, 1.15, 0]}
        rotation={[0, 0, -0.4]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("handRight");
        }}
      >
        <capsuleGeometry args={[0.12, 0.74, 6, 16]} />
        <meshStandardMaterial color="#ffd2bf" />
      </mesh>
      <mesh
        position={[-0.38, 1.34, 0]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("shoulder");
        }}
      >
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#a9c8ff" />
      </mesh>
      <mesh
        position={[0.38, 1.34, 0]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("shoulder");
        }}
      >
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#a9c8ff" />
      </mesh>
      <mesh
        position={[-0.2, 0.06, 0]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("leg");
        }}
      >
        <capsuleGeometry args={[0.14, 0.86, 6, 16]} />
        <meshStandardMaterial color="#525c7a" />
      </mesh>
      <mesh
        position={[0.2, 0.06, 0]}
        castShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onHit("leg");
        }}
      >
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
    handLeft: interactionEffect.mode === MODE.CARE ? "↗" : "✋",
    handRight: interactionEffect.mode === MODE.CARE ? "↘" : "✋",
    leg: interactionEffect.mode === MODE.CARE ? "…" : "⇢"
  };

  return (
    <Html center position={[0, 1.95, 0]} zIndexRange={[20, 0]}>
      <div className={`effect-badge effect-${interactionEffect.areaId}`}>
        {map[interactionEffect.areaId] || "!"}
      </div>
    </Html>
  );
}

function SceneRig({ avatarUrl, currentMode, status, onHit, interactionEffect, onLoadStateChange }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 4.65]} fov={34} />
      <color attach="background" args={["#fff4e7"]} />
      <ambientLight intensity={1.8} />
      <directionalLight
        position={[2.5, 4.5, 3]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight position={[-3, 4, 2]} intensity={1.1} angle={0.42} penumbra={0.65} color="#ffd1a8" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
        <circleGeometry args={[3.2, 48]} />
        <shadowMaterial transparent opacity={0.24} />
      </mesh>
      <AvatarModel
        avatarUrl={avatarUrl}
        currentMode={currentMode}
        status={status}
        onHit={onHit}
        interactionEffect={interactionEffect}
        onLoadStateChange={onLoadStateChange}
      />
      <FloatingEffect interactionEffect={interactionEffect} />
      <Environment preset="city" />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={1.2} maxPolarAngle={1.88} />
    </>
  );
}

export default function CharacterScene(props) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <SceneRig {...props} />
    </Canvas>
  );
}
