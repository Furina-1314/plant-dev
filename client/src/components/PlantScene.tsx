import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useGame } from "@/contexts/GameContext";

const COLORS = {
  soil: 0x8d6e63,
  soilDark: 0x6d4c41,
  pot: 0xd7ccc8,
  potDark: 0xbcaaa4,
  potRim: 0xa1887f,
  stem: 0x558b2f,
  leaf: 0x7cb342,
  leafLight: 0x9ccc65,
  leafDark: 0x558b2f,
  flower: 0xf48fb1,
  flowerLight: 0xf8bbd0,
  flowerCenter: 0xfff176,
  trunk: 0x795548,
  trunkDark: 0x5d4037,
  particle: 0xffd54f,
  seedColor: 0x4e342e,
};

function createPot(scene: THREE.Scene) {
  const potGeo = new THREE.CylinderGeometry(0.55, 0.4, 0.65, 24);
  const potMat = new THREE.MeshStandardMaterial({
    color: COLORS.pot,
    roughness: 0.6,
    metalness: 0.05,
  });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = 0.325;
  pot.castShadow = true;
  pot.receiveShadow = true;
  scene.add(pot);

  const innerGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 24);
  const innerMat = new THREE.MeshStandardMaterial({
    color: COLORS.potDark,
    roughness: 0.8,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.y = 0.62;
  scene.add(inner);

  const rimGeo = new THREE.TorusGeometry(0.57, 0.04, 12, 24);
  const rimMat = new THREE.MeshStandardMaterial({
    color: COLORS.potRim,
    roughness: 0.5,
    metalness: 0.1,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = 0.65;
  rim.rotation.x = Math.PI / 2;
  scene.add(rim);

  const soilGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 24);
  const soilMat = new THREE.MeshStandardMaterial({
    color: COLORS.soil,
    roughness: 0.95,
  });
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.y = 0.58;
  soil.receiveShadow = true;
  scene.add(soil);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
    const r = 0.15 + Math.random() * 0.25;
    const bumpGeo = new THREE.SphereGeometry(0.04 + Math.random() * 0.03, 8, 8);
    const bump = new THREE.Mesh(bumpGeo, soilMat);
    bump.position.set(Math.cos(angle) * r, 0.63, Math.sin(angle) * r);
    bump.scale.y = 0.5;
    scene.add(bump);
  }
}

function createSeed(group: THREE.Group) {
  const seedGeo = new THREE.SphereGeometry(0.1, 16, 16);
  seedGeo.scale(1.2, 0.8, 1);
  const seedMat = new THREE.MeshStandardMaterial({
    color: COLORS.seedColor,
    roughness: 0.6,
    metalness: 0.05,
  });
  const seed = new THREE.Mesh(seedGeo, seedMat);
  seed.position.y = 0.68;
  seed.rotation.z = 0.15;
  seed.castShadow = true;
  group.add(seed);

  const crackGeo = new THREE.SphereGeometry(0.025, 8, 8);
  const crackMat = new THREE.MeshStandardMaterial({
    color: COLORS.leaf,
    emissive: COLORS.leaf,
    emissiveIntensity: 0.4,
  });
  const crack = new THREE.Mesh(crackGeo, crackMat);
  crack.position.set(0.03, 0.73, 0.03);
  group.add(crack);

  const tipGeo = new THREE.ConeGeometry(0.012, 0.04, 6);
  const tipMat = new THREE.MeshStandardMaterial({
    color: COLORS.leafLight,
    emissive: COLORS.leafLight,
    emissiveIntensity: 0.3,
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.set(0.03, 0.76, 0.03);
  group.add(tip);

  const glowGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xc8e6c9,
    transparent: true,
    opacity: 0.12,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = 0.70;
  group.add(glow);

  const outerGlowGeo = new THREE.RingGeometry(0.15, 0.25, 32);
  const outerGlowMat = new THREE.MeshBasicMaterial({
    color: 0xfff8e1,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  });
  const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
  outerGlow.position.y = 0.68;
  outerGlow.rotation.x = -Math.PI / 2;
  group.add(outerGlow);
}

function createSprout(group: THREE.Group) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.64, 0),
    new THREE.Vector3(0.01, 0.75, 0.005),
    new THREE.Vector3(-0.005, 0.88, -0.005),
    new THREE.Vector3(0.01, 0.98, 0),
  ]);
  const stemGeo = new THREE.TubeGeometry(curve, 12, 0.018, 8, false);
  const stemMat = new THREE.MeshStandardMaterial({ color: COLORS.stem });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  group.add(stem);

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.07, 0.06, 0.04, 0.14);
  leafShape.quadraticCurveTo(0, 0.16, -0.04, 0.14);
  leafShape.quadraticCurveTo(-0.07, 0.06, 0, 0);

  const leafGeo = new THREE.ExtrudeGeometry(leafShape, {
    depth: 0.008,
    bevelEnabled: true,
    bevelThickness: 0.002,
    bevelSize: 0.002,
    bevelSegments: 2,
  });
  const leafMat = new THREE.MeshStandardMaterial({
    color: COLORS.leaf,
    side: THREE.DoubleSide,
    roughness: 0.6,
  });

  const leaf1 = new THREE.Mesh(leafGeo, leafMat);
  leaf1.position.set(0.02, 0.95, 0);
  leaf1.rotation.set(-0.2, 0, -0.5);
  group.add(leaf1);

  const leaf2 = new THREE.Mesh(leafGeo, leafMat.clone());
  (leaf2.material as THREE.MeshStandardMaterial).color.setHex(COLORS.leafLight);
  leaf2.position.set(-0.02, 0.94, 0);
  leaf2.rotation.set(-0.2, Math.PI, 0.5);
  group.add(leaf2);
}

function createGrass(group: THREE.Group) {
  const stemMat = new THREE.MeshStandardMaterial({ color: COLORS.stem });

  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const radius = 0.05 + Math.random() * 0.15;
    const height = 0.25 + Math.random() * 0.25;
    const lean = (Math.random() - 0.5) * 0.3;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.cos(angle) * radius, 0.64, Math.sin(angle) * radius),
      new THREE.Vector3(
        Math.cos(angle) * radius + lean * 0.3,
        0.64 + height * 0.5,
        Math.sin(angle) * radius
      ),
      new THREE.Vector3(
        Math.cos(angle) * radius + lean,
        0.64 + height,
        Math.sin(angle) * radius
      ),
    ]);

    const stemGeo = new THREE.TubeGeometry(curve, 8, 0.012 + Math.random() * 0.005, 6, false);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    group.add(stem);

    const leafGeo = new THREE.PlaneGeometry(0.06 + Math.random() * 0.04, 0.1 + Math.random() * 0.06);
    const leafMat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? COLORS.leaf : COLORS.leafLight,
      side: THREE.DoubleSide,
      roughness: 0.6,
    });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const endPoint = curve.getPoint(1);
    leaf.position.copy(endPoint);
    leaf.rotation.set(
      -0.3 + Math.random() * 0.3,
      angle + Math.random() * 0.5,
      lean * 0.5
    );
    group.add(leaf);
  }
}

function createBush(group: THREE.Group) {
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.64, 0),
    new THREE.Vector3(0.02, 0.8, 0.01),
    new THREE.Vector3(-0.01, 0.95, -0.01),
    new THREE.Vector3(0.01, 1.08, 0),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 12, 0.035, 8, false);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: COLORS.trunk,
    roughness: 0.9,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  group.add(trunk);

  const positions = [
    { pos: [0, 1.2, 0], r: 0.18, color: COLORS.leaf },
    { pos: [0.13, 1.14, 0.08], r: 0.14, color: COLORS.leafDark },
    { pos: [-0.1, 1.15, -0.06], r: 0.13, color: COLORS.leafLight },
    { pos: [0.05, 1.3, -0.05], r: 0.11, color: COLORS.leaf },
    { pos: [-0.08, 1.25, 0.1], r: 0.12, color: COLORS.leafDark },
    { pos: [0.1, 1.08, -0.1], r: 0.1, color: COLORS.leafLight },
  ];

  positions.forEach(({ pos, r, color }) => {
    const geo = new THREE.IcosahedronGeometry(r, 1);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    mesh.castShadow = true;
    group.add(mesh);
  });
}

function createSmallTree(group: THREE.Group) {
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.64, 0),
    new THREE.Vector3(0.03, 0.85, 0.01),
    new THREE.Vector3(-0.01, 1.1, -0.02),
    new THREE.Vector3(0.02, 1.35, 0),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 16, 0.04, 8, false);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: COLORS.trunk,
    roughness: 0.9,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  group.add(trunk);

  const branches = [
    { start: [0.02, 1.1, 0], end: [0.18, 1.25, 0.05], r: 0.02 },
    { start: [-0.01, 1.2, -0.01], end: [-0.14, 1.35, -0.08], r: 0.018 },
    { start: [0.01, 1.0, 0.02], end: [0.12, 1.05, 0.15], r: 0.015 },
  ];

  branches.forEach(({ start, end, r }) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 0.05,
        (start[1] + end[1]) / 2,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end),
    ]);
    const geo = new THREE.TubeGeometry(curve, 8, r, 6, false);
    const mesh = new THREE.Mesh(geo, trunkMat);
    group.add(mesh);
  });

  const clusters = [
    { pos: [0, 1.5, 0], r: 0.2, color: COLORS.leaf },
    { pos: [0.15, 1.4, 0.08], r: 0.15, color: COLORS.leafDark },
    { pos: [-0.12, 1.45, -0.06], r: 0.16, color: COLORS.leafLight },
    { pos: [0.08, 1.6, -0.05], r: 0.13, color: COLORS.leaf },
    { pos: [-0.05, 1.55, 0.12], r: 0.14, color: COLORS.leafDark },
    { pos: [0.18, 1.3, 0.12], r: 0.11, color: COLORS.leafLight },
    { pos: [-0.15, 1.35, 0.05], r: 0.12, color: COLORS.leaf },
  ];

  clusters.forEach(({ pos, r, color }) => {
    const geo = new THREE.IcosahedronGeometry(r, 1);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.65 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    mesh.castShadow = true;
    group.add(mesh);
  });
}

function createFlowerTree(group: THREE.Group) {
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.64, 0),
    new THREE.Vector3(0.04, 0.85, 0.02),
    new THREE.Vector3(-0.02, 1.1, -0.01),
    new THREE.Vector3(0.03, 1.35, 0.01),
    new THREE.Vector3(0, 1.5, 0),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 20, 0.05, 8, false);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: COLORS.trunk,
    roughness: 0.85,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  group.add(trunk);

  const branches = [
    { start: [0.03, 1.2, 0.01], end: [0.22, 1.35, 0.08], r: 0.025 },
    { start: [-0.02, 1.3, -0.01], end: [-0.18, 1.45, -0.1], r: 0.022 },
    { start: [0.01, 1.1, 0.02], end: [0.15, 1.15, 0.18], r: 0.018 },
    { start: [-0.01, 1.0, -0.02], end: [-0.12, 1.08, -0.15], r: 0.016 },
  ];

  branches.forEach(({ start, end, r }) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 + 0.03,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end),
    ]);
    const geo = new THREE.TubeGeometry(curve, 8, r, 6, false);
    const mesh = new THREE.Mesh(geo, trunkMat);
    group.add(mesh);
  });

  const foliageClusters = [
    { pos: [0, 1.65, 0], r: 0.22, color: COLORS.leaf },
    { pos: [0.18, 1.55, 0.1], r: 0.16, color: COLORS.leafDark },
    { pos: [-0.15, 1.6, -0.08], r: 0.17, color: COLORS.leafLight },
    { pos: [0.1, 1.75, -0.06], r: 0.14, color: COLORS.leaf },
    { pos: [-0.08, 1.7, 0.14], r: 0.15, color: COLORS.leafDark },
    { pos: [0.2, 1.45, 0.15], r: 0.12, color: COLORS.leafLight },
    { pos: [-0.18, 1.5, 0.08], r: 0.13, color: COLORS.leaf },
  ];

  foliageClusters.forEach(({ pos, r, color }) => {
    const geo = new THREE.IcosahedronGeometry(r, 1);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    mesh.castShadow = true;
    group.add(mesh);
  });

  const flowerMat = new THREE.MeshStandardMaterial({
    color: COLORS.flower,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const flowerLightMat = new THREE.MeshStandardMaterial({
    color: COLORS.flowerLight,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });
  const centerMat = new THREE.MeshStandardMaterial({
    color: COLORS.flowerCenter,
    emissive: COLORS.flowerCenter,
    emissiveIntensity: 0.4,
  });

  for (let i = 0; i < 18; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5;
    const r = 0.18 + Math.random() * 0.18;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = 1.65 + r * Math.cos(phi) * 0.6;
    const z = r * Math.sin(phi) * Math.sin(theta);

    for (let p = 0; p < 5; p++) {
      const pa = (p / 5) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.025, 6, 6);
      petalGeo.scale(1, 0.5, 1);
      const petal = new THREE.Mesh(petalGeo, i % 2 === 0 ? flowerMat : flowerLightMat);
      petal.position.set(
        x + Math.cos(pa) * 0.025,
        y + Math.sin(pa) * 0.015,
        z + Math.sin(pa) * 0.025
      );
      group.add(petal);
    }

    const centerGeo = new THREE.SphereGeometry(0.012, 6, 6);
    const center = new THREE.Mesh(centerGeo, centerMat);
    center.position.set(x, y, z);
    group.add(center);
  }
}

const STAGE_CREATORS: Record<string, (group: THREE.Group) => void> = {
  seed: createSeed,
  sprout: createSprout,
  grass: createGrass,
  bush: createBush,
  small_tree: createSmallTree,
  flower_tree: createFlowerTree,
};

export default function PlantScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    plantGroup: THREE.Group;
    particles: THREE.Points;
    animId: number;
  } | null>(null);
  const { currentPlantStage } = useGame();

  const stageImage = useMemo(() => currentPlantStage.image, [currentPlantStage]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0.3, 1.8, 3.0);
    camera.lookAt(0, 0.85, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff8e1, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3e0, 1.4);
    sunLight.position.set(3, 6, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 15;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xbbdefb, 0.35);
    fillLight.position.set(-3, 4, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfce4ec, 0.25);
    rimLight.position.set(0, 2, -3);
    scene.add(rimLight);

    const groundGeo = new THREE.PlaneGeometry(4, 4);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    createPot(scene);

    const plantGroup = new THREE.Group();
    scene.add(plantGroup);

    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 2.5;
      particlePositions[i * 3 + 1] = 0.3 + Math.random() * 2.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
      particleSizes[i] = 0.015 + Math.random() * 0.025;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: COLORS.particle,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let mouseX = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.3;
    };
    window.addEventListener("mousemove", onMouseMove);

    let time = 0;
    let currentRotY = 0;
    function animate() {
      time += 0.008;

      plantGroup.rotation.z = Math.sin(time * 0.6) * 0.015;
      plantGroup.rotation.x = Math.cos(time * 0.4) * 0.008;

      plantGroup.position.y = Math.sin(time * 0.8) * 0.005;

      currentRotY += (mouseX - currentRotY) * 0.02;
      scene.rotation.y = currentRotY;

      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.0015 + Math.sin(time + i * 0.5) * 0.0005;
        positions[i * 3] += Math.sin(time * 0.5 + i) * 0.0008;
        positions[i * 3 + 2] += Math.cos(time * 0.3 + i) * 0.0005;
        if (positions[i * 3 + 1] > 2.8) {
          positions[i * 3 + 1] = 0.3;
          positions[i * 3] = (Math.random() - 0.5) * 2.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      particleMat.opacity = 0.4 + Math.sin(time * 0.8) * 0.15;

      renderer.render(scene, camera);
      sceneRef.current!.animId = requestAnimationFrame(animate);
    }

    const animId = requestAnimationFrame(animate);

    sceneRef.current = { scene, camera, renderer, plantGroup, particles, animId };

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { plantGroup } = sceneRef.current;

    while (plantGroup.children.length > 0) {
      const child = plantGroup.children[0];
      plantGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    }

    const creator = STAGE_CREATORS[stageImage];
    if (creator) {
      creator(plantGroup);
    }

    const stageScaleMap: Record<string, number> = {
      seed: 1,
      sprout: 1,
      grass: 1,
      bush: 0.95,
      small_tree: 0.9,
      flower_tree: 0.82,
    };
    const targetScale = stageScaleMap[stageImage] ?? 1;

    plantGroup.scale.set(0.65, 0.65, 0.65);
    let scale = 0.65;
    const growIn = () => {
      scale += (targetScale - scale) * 0.04;
      plantGroup.scale.set(scale, scale, scale);
      if (Math.abs(targetScale - scale) > 0.005) {
        requestAnimationFrame(growIn);
      } else {
        plantGroup.scale.set(targetScale, targetScale, targetScale);
      }
    };
    requestAnimationFrame(growIn);
  }, [stageImage]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: "300px" }}
    />
  );
}
