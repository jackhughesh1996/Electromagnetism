import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SimulationConfig, FieldMeasurement } from '../types';
import {
  generateConductorSegments,
  calculateBField,
  generateFieldLines,
  CurrentSegment,
} from '../physics/biotSavart';
import { buildCircuitSystem } from './circuit3D';
import { Zap, Sparkles } from 'lucide-react';

interface ThreeCanvasProps {
  config: SimulationConfig;
  onProbeUpdate?: (measurement: FieldMeasurement) => void;
  onProbePositionChange?: (pos: [number, number, number]) => void;
  staplesCount?: number;
  staplesProgress?: number;
  showStaplesTray?: boolean;
  onToggleSwitch?: () => void;
  onToggleParticleType?: () => void;
  onToggleBatteryDirection?: () => void;
}

export function ThreeCanvas({
  config,
  onProbeUpdate,
  onProbePositionChange,
  staplesCount,
  staplesProgress,
  showStaplesTray,
  onToggleSwitch,
  onToggleParticleType,
  onToggleBatteryDirection,
}: ThreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // References to dynamic scene groups
  const conductorGroupRef = useRef<THREE.Group>(new THREE.Group());
  const circuitGroupRef = useRef<THREE.Group>(new THREE.Group());
  const fieldLinesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const filingsMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const filingsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const compassGroupRef = useRef<THREE.Group>(new THREE.Group());
  const particlesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const ironCoreMeshRef = useRef<THREE.Mesh | null>(null);
  const polesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const rhrGroupRef = useRef<THREE.Group>(new THREE.Group());
  const staplesGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Cached conductor segments and circuit paths
  const configRef = useRef<SimulationConfig>(config);
  configRef.current = config;

  const segmentsRef = useRef<CurrentSegment[]>([]);
  const wirePathRef = useRef<THREE.Vector3[]>([]);
  const fullCircuitLoopRef = useRef<THREE.Vector3[]>([]);
  const currentParticlesRef = useRef<{ mesh: THREE.Mesh; progress: number; speed: number }[]>([]);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const sphericalRef = useRef({ radius: 10, theta: 0.8, phi: 1.1 });

  // Initialize Three.js scene once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Dark navy slate
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(12, 18, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-12, -6, -10);
    scene.add(dirLight2);

    // Subtle floor grid
    const grid = new THREE.GridHelper(16, 24, 0x334155, 0x0f172a);
    grid.position.y = -3.6;
    scene.add(grid);

    // Add main groups to scene with explicit render orders
    conductorGroupRef.current.renderOrder = 8;
    circuitGroupRef.current.renderOrder = 8;
    particlesGroupRef.current.renderOrder = 2;
    scene.add(conductorGroupRef.current);
    scene.add(circuitGroupRef.current);
    scene.add(fieldLinesGroupRef.current);
    scene.add(filingsGroupRef.current);
    scene.add(particlesGroupRef.current);
    scene.add(polesGroupRef.current);
    scene.add(rhrGroupRef.current);
    scene.add(staplesGroupRef.current);

    // Iron Core Mesh
    const coreGeom = new THREE.CylinderGeometry(1.2, 1.2, 3.8, 36);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.28,
      bumpScale: 0.05,
    });
    const ironCore = new THREE.Mesh(coreGeom, coreMat);
    scene.add(ironCore);
    ironCoreMeshRef.current = ironCore;

    // 3D Compass Probe
    const compassGroup = compassGroupRef.current;
    buildCompassMesh(compassGroup);
    scene.add(compassGroup);

    // Pointer events for custom orbit & interaction
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDraggingRef.current = true;
      if (e.button === 2) isRightDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingRef.current) {
        // Orbit rotation
        sphericalRef.current.theta -= deltaX * 0.007;
        sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.007));
        updateCameraPosition();
      } else if (isRightDraggingRef.current) {
        // Pan
        const panSpeed = 0.006 * (sphericalRef.current.radius / 10);
        const forward = new THREE.Vector3().subVectors(cameraTargetRef.current, camera.position).normalize();
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        cameraTargetRef.current.addScaledVector(right, -deltaX * panSpeed);
        cameraTargetRef.current.y += deltaY * panSpeed;
        updateCameraPosition();
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isRightDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      sphericalRef.current.radius = Math.max(3.5, Math.min(25, sphericalRef.current.radius * zoomFactor));
      updateCameraPosition();
    };

    // Prevent context menu on right click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('contextmenu', handleContextMenu);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation frame loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Animate current flow particles
      updateCurrentParticles(delta);

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('contextmenu', handleContextMenu);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, []);

  function updateCameraPosition() {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = cameraTargetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = cameraTargetRef.current.y + radius * Math.cos(phi);
    const z = cameraTargetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTargetRef.current);
  }

  // Construct compass 3D model
  function buildCompassMesh(group: THREE.Group) {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    const northMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.3, emissive: 0x991b1b, emissiveIntensity: 0.3 });
    const southMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.3, roughness: 0.3, emissive: 0x1e40af, emissiveIntensity: 0.3 });

    // Compass Housing ring
    const ringGeom = new THREE.TorusGeometry(0.5, 0.04, 16, 40);
    const ring = new THREE.Mesh(ringGeom, brassMat);
    ring.rotation.x = Math.PI * 0.5;
    group.add(ring);

    // Glass disc
    const glassGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.02, 32);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.15 });
    const glass = new THREE.Mesh(glassGeom, glassMat);
    group.add(glass);

    // Pivot pin
    const pinGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 16);
    const pin = new THREE.Mesh(pinGeom, brassMat);
    group.add(pin);

    // Needle pivot container (will rotate in 3D to align with B field)
    const needlePivot = new THREE.Group();
    needlePivot.name = 'needlePivot';

    // North Needle (Red arrow cone pointing in +Y local)
    const needleGeom = new THREE.ConeGeometry(0.09, 0.44, 16);
    const northNeedle = new THREE.Mesh(needleGeom, northMat);
    northNeedle.position.y = 0.22;
    needlePivot.add(northNeedle);

    // South Needle (Blue arrow cone pointing in -Y local)
    const southNeedle = new THREE.Mesh(needleGeom, southMat);
    southNeedle.position.y = -0.22;
    southNeedle.rotation.x = Math.PI;
    needlePivot.add(southNeedle);

    // Center pivot ball
    const centerBall = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), brassMat);
    needlePivot.add(centerBall);

    group.add(needlePivot);
  }

  // Update Conductor Geometry and Complete Physical Circuit (Wire/Coil/Solenoid + Battery + Knife Switch)
  useEffect(() => {
    const group = conductorGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const { segments, wirePath } = generateConductorSegments(config);
    segmentsRef.current = segments;
    wirePathRef.current = wirePath;

    // Conductor material: Translucent polished copper sheath allowing electron drift inside to shine through
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c, // Copper amber
      metalness: 0.65,
      roughness: 0.22,
      transparent: true,
      opacity: 0.40,
      depthWrite: false, // Vital: never occlude the electron particles flowing inside
    });
    const posTerminalMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Red (+)
      metalness: 0.5,
      roughness: 0.3,
    });
    const negTerminalMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Blue (-)
      metalness: 0.5,
      roughness: 0.3,
    });

    if (config.mode === 'wire') {
      // Straight wire along Y axis
      const wireGeom = new THREE.CylinderGeometry(0.12, 0.12, 11.6, 36);
      const wireMesh = new THREE.Mesh(wireGeom, copperMat);
      group.add(wireMesh);

      // Terminal blocks at ends (+ at top, - at bottom)
      const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.35, 24), config.current >= 0 ? posTerminalMat : negTerminalMat);
      topCap.position.y = 5.8;
      group.add(topCap);

      const btmCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.35, 24), config.current >= 0 ? negTerminalMat : posTerminalMat);
      btmCap.position.y = -5.8;
      group.add(btmCap);
    } else if (config.mode === 'coil') {
      // Single circular loop in XZ plane
      const R = config.coilRadius;
      const torusGeom = new THREE.TorusGeometry(R, 0.1, 24, 72);
      torusGeom.rotateX(Math.PI * 0.5);
      const loopMesh = new THREE.Mesh(torusGeom, copperMat);
      group.add(loopMesh);

      // Lead wires extending to battery terminals
      const leadGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 16);
      const lead1 = new THREE.Mesh(leadGeom, copperMat);
      lead1.position.set(R, -0.8, 0);
      group.add(lead1);

      const lead2 = new THREE.Mesh(leadGeom, copperMat);
      lead2.position.set(R - 0.25, -0.8, 0);
      group.add(lead2);

      // Terminals
      const term1 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), config.current >= 0 ? posTerminalMat : negTerminalMat);
      term1.position.set(R, -1.6, 0);
      group.add(term1);

      const term2 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), config.current >= 0 ? negTerminalMat : posTerminalMat);
      term2.position.set(R - 0.25, -1.6, 0);
      group.add(term2);
    } else {
      // Solenoid / Electromagnet: Continuous 3D Helix
      if (wirePath.length > 2) {
        const curve = new THREE.CatmullRomCurve3(wirePath);
        const tubeGeom = new THREE.TubeGeometry(curve, wirePath.length, 0.075, 12, false);
        const coilMesh = new THREE.Mesh(tubeGeom, copperMat);
        group.add(coilMesh);

        // Terminal leads
        const pStart = wirePath[0];
        const pEnd = wirePath[wirePath.length - 1];

        const termStart = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), config.current >= 0 ? negTerminalMat : posTerminalMat);
        termStart.position.copy(pStart);
        group.add(termStart);

        const termEnd = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), config.current >= 0 ? posTerminalMat : negTerminalMat);
        termEnd.position.copy(pEnd);
        group.add(termEnd);
      }
    }

    // Build the realistic 3D laboratory circuit (Battery Pack, Knife Switch, Jumper Wires)
    const circuitGroup = circuitGroupRef.current;
    while (circuitGroup.children.length > 0) {
      circuitGroup.remove(circuitGroup.children[0]);
    }

    if (config.showCircuit !== false) {
      const { circuitGroup: newCircuit, fullLoopPoints } = buildCircuitSystem(config, wirePath);
      circuitGroup.add(newCircuit);
      fullCircuitLoopRef.current = fullLoopPoints;
      initCurrentParticles(fullLoopPoints.length > 2 ? fullLoopPoints : wirePath);
    } else {
      fullCircuitLoopRef.current = wirePath;
      initCurrentParticles(wirePath);
    }
  }, [
    config.mode,
    config.coilRadius,
    config.solenoidLength,
    config.solenoidTurns,
    config.current < 0,
    config.cellCount,
    config.switchClosed,
    config.showCircuit,
    config.particleType,
  ]);

  // Handle Iron Core Visibility & Sizing
  useEffect(() => {
    if (!ironCoreMeshRef.current) return;
    const isElectromagnet = config.mode === 'electromagnet' || (config.mode === 'solenoid' && config.hasIronCore);
    ironCoreMeshRef.current.visible = isElectromagnet;

    if (isElectromagnet) {
      const coreR = config.coilRadius * 0.82;
      const coreL = config.solenoidLength * 1.15;
      ironCoreMeshRef.current.geometry.dispose();
      ironCoreMeshRef.current.geometry = new THREE.CylinderGeometry(coreR, coreR, coreL, 36);

      // Core appearance: if current flows, subtle magnetic alignment sheen
      const mat = ironCoreMeshRef.current.material as THREE.MeshStandardMaterial;
      if (Math.abs(config.current) > 0.1) {
        mat.emissive = new THREE.Color(0x1e3a8a); // soft blue-gray magnetic magnetization glow
        mat.emissiveIntensity = Math.min(0.5, Math.abs(config.current) * 0.06);
      } else {
        mat.emissiveIntensity = 0;
      }
    }
  }, [config.mode, config.hasIronCore, config.coilRadius, config.solenoidLength, config.current]);

  // Electron and Current particles along full circuit loop
  function initCurrentParticles(path: THREE.Vector3[]) {
    const curConfig = configRef.current;
    const group = particlesGroupRef.current;
    if (!curConfig.showCurrentParticles || path.length < 2) {
      group.visible = false;
      return;
    }
    group.visible = true;

    const count = 56;
    const isConventional = curConfig.particleType === 'conventional';
    const targetColor = isConventional ? 0xfacc15 : 0x38bdf8;
    const targetEmissive = isConventional ? 0xeab308 : 0x0284c7;

    // If particles already exist in the pool, update their materials without destroying meshes
    // This prevents flickering/popping when current, switch, or path updates!
    if (currentParticlesRef.current.length === count && group.children.length === count) {
      for (let i = 0; i < count; i++) {
        const p = currentParticlesRef.current[i];
        const mat = p.mesh.material as THREE.MeshStandardMaterial;
        mat.color.setHex(targetColor);
        mat.emissive.setHex(targetEmissive);
      }
      return;
    }

    // Otherwise (initial mount or count mismatch), instantiate particle meshes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    currentParticlesRef.current = [];

    // Electrons (e-) are bright electric cyan-blue; Conventional current is glowing golden yellow
    const particleGeom = new THREE.SphereGeometry(isConventional ? 0.085 : 0.095, 16, 16);
    const particleMat = new THREE.MeshStandardMaterial({
      color: targetColor,
      emissive: targetEmissive,
      emissiveIntensity: 2.2,
      roughness: 0.15,
      metalness: 0.1,
    });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(particleGeom, particleMat);
      group.add(mesh);
      currentParticlesRef.current.push({
        mesh,
        progress: i / count,
        speed: 1.0,
      });
    }
  }

  function updateCurrentParticles(delta: number) {
    const curConfig = configRef.current;
    const path = fullCircuitLoopRef.current.length > 2 ? fullCircuitLoopRef.current : wirePathRef.current;
    if (!curConfig.showCurrentParticles || path.length < 2) {
      particlesGroupRef.current.visible = false;
      return;
    }
    particlesGroupRef.current.visible = true;

    const pathLen = path.length - 1;

    // Live circuit closure check from latest config state:
    // Electric current only flows when the switch is explicitly closed AND current magnitude is non-zero
    const isSwitchClosed = curConfig.switchClosed !== false;
    const currentVal = curConfig.current ?? 0;
    const isFlowing = isSwitchClosed && Math.abs(currentVal) > 0.05;
    const effectiveCurrent = isFlowing ? currentVal : 0;

    // Slow, observable drift velocity so individual electrons can be followed by eye
    const baseSpeed = 0.032;
    const currentScale = Math.min(1.5, Math.max(0.6, Math.abs(effectiveCurrent) * 0.16));
    const speed = baseSpeed * currentScale;

    // Direction along fullCircuitLoopRef:
    // 0 is Battery Negative terminal -> along Wire 3 -> Conductor -> Wire 2 -> Knife Switch -> Wire 1 -> Battery Positive terminal
    // True Electron Flow: Neg (-) to Pos (+) is forward (+1)
    // Conventional Current: Pos (+) to Neg (-) is backward (-1)
    // When battery polarity is reversed (effectiveCurrent < 0), invert direction
    const isConventional = curConfig.particleType === 'conventional';
    const polaritySign = effectiveCurrent < 0 ? -1 : 1;
    const directionSign = (isConventional ? -1 : 1) * polaritySign;

    for (let i = 0; i < currentParticlesRef.current.length; i++) {
      const p = currentParticlesRef.current[i];

      if (isFlowing) {
        // Active drift velocity in the closed circuit
        p.progress += directionSign * speed * delta;
        if (p.progress > 1.0) p.progress -= 1.0;
        if (p.progress < 0.0) p.progress += 1.0;
      }

      // Sample position along continuous polyline
      const floatIndex = p.progress * pathLen;
      const idx = Math.floor(floatIndex);
      const alpha = floatIndex - idx;
      const p1 = path[Math.min(idx, pathLen)];
      const p2 = path[Math.min(idx + 1, pathLen)];

      p.mesh.position.lerpVectors(p1, p2, alpha);
    }
  }

  // Update Field Lines
  useEffect(() => {
    const group = fieldLinesGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (!config.showFieldLines || Math.abs(config.current) < 0.05) return;

    const lines = generateFieldLines(segmentsRef.current, config);

    lines.forEach((linePts) => {
      if (linePts.length < 3) return;

      const curve = new THREE.CatmullRomCurve3(linePts);
      const divisions = linePts.length * 3;
      const sampledPoints = curve.getPoints(divisions);

      const geom = new THREE.BufferGeometry().setFromPoints(sampledPoints);

      // Color mapping: Solenoid inside or high field gets vibrant gold/amber, outer returns cyan/azure
      const isCoreBoost = config.mode === 'electromagnet' || (config.mode === 'solenoid' && config.hasIronCore);
      const lineColor = isCoreBoost ? 0xf59e0b : 0x38bdf8;

      const mat = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.85,
        linewidth: 2,
      });

      const lineMesh = new THREE.Line(geom, mat);
      group.add(lineMesh);

      // Directional arrow cones along the field line to clearly show vector direction
      const arrowCount = Math.max(1, Math.floor(linePts.length / 35));
      for (let a = 1; a <= arrowCount; a++) {
        const t = a / (arrowCount + 1);
        const pt = curve.getPoint(t);
        const tangent = curve.getTangent(t).normalize();

        const coneGeom = new THREE.ConeGeometry(0.08, 0.24, 12);
        const coneMat = new THREE.MeshBasicMaterial({ color: lineColor });
        const cone = new THREE.Mesh(coneGeom, coneMat);
        cone.position.copy(pt);

        // Align cone with tangent
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        cone.quaternion.copy(quat);
        group.add(cone);
      }
    });
  }, [config.mode, config.current, config.solenoidTurns, config.hasIronCore, config.showFieldLines, config.coilRadius, config.solenoidLength]);

  // Update Magnetic Poles (N & S) Badges
  useEffect(() => {
    const group = polesGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (!config.showPoles || config.mode === 'wire' || Math.abs(config.current) < 0.1) return;

    // In a solenoid or coil along Y axis:
    // When current is positive, magnetic field inside points in +Y direction.
    // Magnetic field lines EMERGE from the North pole and ENTER into the South pole!
    // Therefore, if B points in +Y: Top (+Y) is NORTH, Bottom (-Y) is SOUTH.
    // If current is negative: Top is SOUTH, Bottom is NORTH.
    const isTopNorth = config.current > 0;
    const northColor = 0xef4444; // Red
    const southColor = 0x3b82f6; // Blue

    const yNorth = isTopNorth ? config.solenoidLength * 0.55 + 0.3 : -(config.solenoidLength * 0.55 + 0.3);
    const ySouth = isTopNorth ? -(config.solenoidLength * 0.55 + 0.3) : config.solenoidLength * 0.55 + 0.3;

    // Create North Pole indicator
    const nBadge = createPoleBadge('N', northColor);
    nBadge.position.set(0, config.mode === 'coil' ? (isTopNorth ? 0.8 : -0.8) : yNorth, 0);
    group.add(nBadge);

    // Create South Pole indicator
    const sBadge = createPoleBadge('S', southColor);
    sBadge.position.set(0, config.mode === 'coil' ? (isTopNorth ? -0.8 : 0.8) : ySouth, 0);
    group.add(sBadge);
  }, [config.mode, config.solenoidLength, config.current, config.showPoles]);

  function createPoleBadge(letter: string, colorHex: number): THREE.Group {
    const badge = new THREE.Group();
    const disk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.3, roughness: 0.2, emissive: colorHex, emissiveIntensity: 0.4 })
    );
    badge.add(disk);

    // Canvas texture for letter N or S
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = colorHex === 0xef4444 ? '#ef4444' : '#3b82f6';
    ctx.fillRect(0, 0, 128, 128);
    ctx.font = 'bold 88px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 64, 68);

    const texture = new THREE.CanvasTexture(canvas);
    const labelGeom = new THREE.PlaneGeometry(0.5, 0.5);
    const labelMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const labelTop = new THREE.Mesh(labelGeom, labelMat);
    labelTop.rotation.x = -Math.PI * 0.5;
    labelTop.position.y = 0.05;
    badge.add(labelTop);

    return badge;
  }

  // Update Iron Filings 2D Simulation Plane
  useEffect(() => {
    const group = filingsGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (!config.showFilingsPlane || Math.abs(config.current) < 0.05) {
      return;
    }

    const gridSize = 24;
    const extent = 5.6;
    const totalCount = gridSize * gridSize;

    // Filing needle geometry: tiny elongated diamond or cylinder
    const needleGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 6);
    needleGeom.rotateZ(Math.PI * 0.5); // align along X initially

    const needleMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.4,
    });

    const instMesh = new THREE.InstancedMesh(needleGeom, needleMat, totalCount);
    filingsMeshRef.current = instMesh;

    const dummy = new THREE.Object3D();
    const upVector = new THREE.Vector3(1, 0, 0); // reference direction for needle
    let index = 0;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const u = (i / (gridSize - 1) - 0.5) * 2 * extent;
        const v = (j / (gridSize - 1) - 0.5) * 2 * extent;

        const pos = new THREE.Vector3();
        if (config.filingsPlaneAxis === 'xz') {
          pos.set(u, config.filingsPlaneOffset, v);
        } else if (config.filingsPlaneAxis === 'xy') {
          pos.set(u, v, config.filingsPlaneOffset);
        } else {
          pos.set(config.filingsPlaneOffset, u, v);
        }

        // Calculate magnetic field at pos
        const B = calculateBField(pos, segmentsRef.current, config);
        const mag = B.length();

        dummy.position.copy(pos);

        if (mag > 1e-4) {
          const dir = B.clone().normalize();
          dummy.quaternion.setFromUnitVectors(upVector, dir);
          // Scale slightly with field strength (stronger field = more organized/prominent)
          const scale = Math.min(1.4, Math.max(0.6, 0.6 + mag * 0.15));
          dummy.scale.set(scale, 1, 1);
        } else {
          dummy.scale.set(0.1, 0.1, 0.1);
        }

        dummy.updateMatrix();
        instMesh.setMatrixAt(index++, dummy.matrix);
      }
    }

    instMesh.instanceMatrix.needsUpdate = true;
    group.add(instMesh);

    // Subtle translucent plate showing the filings card / stage
    const plateGeom = new THREE.PlaneGeometry(extent * 2.1, extent * 2.1);
    const plateMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    if (config.filingsPlaneAxis === 'xz') {
      plate.rotation.x = Math.PI * 0.5;
      plate.position.y = config.filingsPlaneOffset;
    } else if (config.filingsPlaneAxis === 'xy') {
      plate.position.z = config.filingsPlaneOffset;
    } else {
      plate.rotation.y = Math.PI * 0.5;
      plate.position.x = config.filingsPlaneOffset;
    }
    group.add(plate);
  }, [
    config.showFilingsPlane,
    config.filingsPlaneAxis,
    config.filingsPlaneOffset,
    config.mode,
    config.current,
    config.hasIronCore,
    config.solenoidTurns,
  ]);

  // Update 3D Compass Probe alignment & live data callback
  useEffect(() => {
    const compassGroup = compassGroupRef.current;
    compassGroup.visible = config.showCompassProbe;

    if (!config.showCompassProbe) return;

    const [px, py, pz] = config.probePosition;
    compassGroup.position.set(px, py, pz);

    const posVec = new THREE.Vector3(px, py, pz);
    const B = calculateBField(posVec, segmentsRef.current, config);
    const mag = B.length();

    const needlePivot = compassGroup.getObjectByName('needlePivot');
    if (needlePivot) {
      if (mag > 1e-5 && Math.abs(config.current) > 0.05) {
        const dir = B.clone().normalize();
        // Needle points along +Y in local space: align +Y with dir
        const targetQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        needlePivot.quaternion.copy(targetQ);
      } else {
        // Arbitrary rest angle when switch is open / zero current
        needlePivot.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.32);
      }
    }

    if (onProbeUpdate) {
      const normDir = mag > 1e-5 ? B.clone().normalize() : new THREE.Vector3(0, 1, 0);
      onProbeUpdate({
        position: { x: px, y: py, z: pz },
        bVector: { x: B.x, y: B.y, z: B.z },
        magnitude: mag,
        direction: { x: normDir.x, y: normDir.y, z: normDir.z },
      });
    }
  }, [config.probePosition, config.showCompassProbe, config.current, config.mode, config.hasIronCore, config.solenoidTurns]);

  // Right-Hand Rule 3D Visualization Overlay
  useEffect(() => {
    const group = rhrGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    if (!config.showRightHandRule || Math.abs(config.current) < 0.1) return;

    // Straight wire: Thumb along current (Y axis), curled arrows around circumference
    if (config.mode === 'wire') {
      const thumbDir = config.current > 0 ? 1 : -1;
      const arrowGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12);
      const arrowHeadGeom = new THREE.ConeGeometry(0.12, 0.35, 12);
      const thumbMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x15803d, emissiveIntensity: 0.4 });

      // Current thumb indicator
      const thumb = new THREE.Group();
      const shaft = new THREE.Mesh(arrowGeom, thumbMat);
      const head = new THREE.Mesh(arrowHeadGeom, thumbMat);
      head.position.y = 0.6 * thumbDir;
      if (thumbDir < 0) head.rotation.x = Math.PI;
      thumb.add(shaft);
      thumb.add(head);
      thumb.position.set(0.35, 0, 0);
      group.add(thumb);

      // Circulating field arc indicator
      const arcPoints: THREE.Vector3[] = [];
      const arcR = 1.0;
      const count = 36;
      for (let i = 0; i <= count; i++) {
        const a = thumbDir * (i / count) * Math.PI * 1.5;
        arcPoints.push(new THREE.Vector3(arcR * Math.cos(a), 0, arcR * Math.sin(a)));
      }
      const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const arcMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
      group.add(new THREE.Line(arcGeom, arcMat));

      const tipHead = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.25, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      const tipPt = arcPoints[arcPoints.length - 1];
      tipHead.position.copy(tipPt);
      tipHead.lookAt(arcPoints[arcPoints.length - 2]);
      tipHead.rotateX(Math.PI);
      group.add(tipHead);
    } else {
      // Solenoid / Coil: Curled fingers along current winding, thumb points toward North pole!
      const thumbDir = config.current > 0 ? 1 : -1;
      const thumbMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.4 });
      const thumb = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 12), thumbMat);
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 12), thumbMat);
      head.position.y = 0.9 * thumbDir;
      if (thumbDir < 0) head.rotation.x = Math.PI;
      thumb.add(shaft);
      thumb.add(head);
      thumb.position.set(0, 0, 0);
      group.add(thumb);
    }
  }, [config.showRightHandRule, config.mode, config.current, config.coilRadius, config.solenoidLength]);

  // Update 3D Staples & Laboratory Tray
  useEffect(() => {
    const group = staplesGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const shouldShow = showStaplesTray || (staplesCount !== undefined && staplesCount >= 0);
    if (!shouldShow) return;

    // Tray on floor below the apparatus
    const trayGeom = new THREE.CylinderGeometry(2.4, 2.6, 0.12, 36);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3,
    });
    const tray = new THREE.Mesh(trayGeom, trayMat);
    tray.position.set(0, -3.52, 0);
    group.add(tray);

    const rimGeom = new THREE.TorusGeometry(2.5, 0.08, 12, 40);
    rimGeom.rotateX(Math.PI * 0.5);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
    });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.position.set(0, -3.46, 0);
    group.add(rim);

    // 18 Metallic Steel Staples
    const totalStaples = 18;
    const countToLift = Math.min(totalStaples, staplesCount ?? 0);
    const progress = Math.max(0, Math.min(1, staplesProgress ?? (countToLift > 0 ? 1 : 0)));

    const stapleGeom = createStapleGeometry();
    const stapleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.18,
    });

    // Bottom pole of solenoid/iron core
    const bottomPoleY = -config.solenoidLength * 0.5 - 0.25;

    for (let i = 0; i < totalStaples; i++) {
      const stapleMesh = new THREE.Mesh(stapleGeom, stapleMat);

      // Rest position on tray
      const restAngle = i * 0.88;
      const restDist = 0.55 + (i % 5) * 0.36;
      const rx = restDist * Math.cos(restAngle);
      const rz = restDist * Math.sin(restAngle);
      const ry = -3.44;

      // Lift position clustered around the bottom pole
      const liftAngle = (i / totalStaples) * Math.PI * 2 + (i % 3) * 0.35;
      const liftDist = 0.18 + (i % 4) * 0.16;
      const lx = liftDist * Math.cos(liftAngle);
      const lz = liftDist * Math.sin(liftAngle);
      const ly = bottomPoleY - (i % 5) * 0.16;

      const isLifted = i < countToLift;
      const curProgress = isLifted ? progress : 0;

      // Lerp position
      stapleMesh.position.x = THREE.MathUtils.lerp(rx, lx, curProgress);
      stapleMesh.position.y = THREE.MathUtils.lerp(ry, ly, curProgress);
      stapleMesh.position.z = THREE.MathUtils.lerp(rz, lz, curProgress);

      // Rotation: flat on tray -> hanging vertically / slightly tilted at pole
      const restRotX = Math.PI * 0.5;
      const restRotY = (i * 1.3) % (Math.PI * 2);
      const restRotZ = (i * 0.7) % (Math.PI * 2);

      const liftRotX = Math.sin(i * 1.1) * 0.45;
      const liftRotY = liftAngle;
      const liftRotZ = Math.cos(i * 1.1) * 0.35;

      stapleMesh.rotation.x = THREE.MathUtils.lerp(restRotX, liftRotX, curProgress);
      stapleMesh.rotation.y = THREE.MathUtils.lerp(restRotY, liftRotY, curProgress);
      stapleMesh.rotation.z = THREE.MathUtils.lerp(restRotZ, liftRotZ, curProgress);

      group.add(stapleMesh);
    }
  }, [config.solenoidLength, staplesCount, staplesProgress, showStaplesTray]);

  function createStapleGeometry(): THREE.BufferGeometry {
    const w = 0.32;
    const h = 0.2;
    const pts = [
      new THREE.Vector3(-w * 0.5, -h, 0),
      new THREE.Vector3(-w * 0.5, 0, 0),
      new THREE.Vector3(w * 0.5, 0, 0),
      new THREE.Vector3(w * 0.5, -h, 0),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, false, 'chordal', 0.15);
    return new THREE.TubeGeometry(curve, 18, 0.02, 8, false);
  }

  return (
    <div className="relative w-full h-full select-none">
      <div
        ref={containerRef}
        id="three-canvas-container"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
