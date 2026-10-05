import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MotorConfig, MotorState } from '../../types';
import { calculateMotorPhysics, generatePermanentFieldLines } from '../../physics/motorPhysics';

interface MotorCanvasProps {
  config: MotorConfig;
  onStateUpdate?: (state: MotorState) => void;
  height?: string;
}

export function MotorCanvas({ config, onStateUpdate, height = '100%' }: MotorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Dynamic 3D groups
  const motorRootGroupRef = useRef<THREE.Group>(new THREE.Group());
  const magnetsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const rotorGroupRef = useRef<THREE.Group>(new THREE.Group());
  const coilMeshGroupRef = useRef<THREE.Group>(new THREE.Group());
  const commutatorGroupRef = useRef<THREE.Group>(new THREE.Group());
  const brushesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const circuitGroupRef = useRef<THREE.Group>(new THREE.Group());
  const permanentFieldGroupRef = useRef<THREE.Group>(new THREE.Group());
  const coilFieldGroupRef = useRef<THREE.Group>(new THREE.Group());
  const forceArrowsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const symbolsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const particlesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const singleWireGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Dynamic simulation state refs
  const configRef = useRef<MotorConfig>(config);
  configRef.current = config;

  const currentAngleDegRef = useRef<number>(config.frozenAngle ?? 0);
  const angularVelocityRef = useRef<number>(0);
  const particlesRef = useRef<{ mesh: THREE.Mesh; progress: number }[]>([]);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const sphericalRef = useRef({ radius: 8.5, theta: 0.85, phi: 1.15 });

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const heightPx = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(10, 15, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-10, -5, -8);
    scene.add(dirLight2);

    // Floor grid & pedestal
    const grid = new THREE.GridHelper(14, 20, 0x334155, 0x0f172a);
    grid.position.y = -2.6;
    scene.add(grid);

    // Build motor root structure
    const root = motorRootGroupRef.current;
    scene.add(root);

    root.add(magnetsGroupRef.current);
    root.add(rotorGroupRef.current);
    rotorGroupRef.current.add(coilMeshGroupRef.current);
    rotorGroupRef.current.add(commutatorGroupRef.current);
    root.add(brushesGroupRef.current);
    root.add(circuitGroupRef.current);
    root.add(permanentFieldGroupRef.current);
    rotorGroupRef.current.add(coilFieldGroupRef.current);
    root.add(forceArrowsGroupRef.current);
    root.add(symbolsGroupRef.current);
    root.add(particlesGroupRef.current);
    root.add(singleWireGroupRef.current);

    // Pointer events for orbit & pan
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
        sphericalRef.current.theta -= deltaX * 0.007;
        sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.007));
        updateCameraPosition();
      } else if (isRightDraggingRef.current) {
        const panSpeed = 0.005 * (sphericalRef.current.radius / 8);
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
      sphericalRef.current.radius = Math.max(3.0, Math.min(22, sphericalRef.current.radius * zoomFactor));
      updateCameraPosition();
    };

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

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      const curConf = configRef.current;

      // Update motor physics
      const { nextAngleDeg, nextAngularVelocity, state } = calculateMotorPhysics(
        curConf,
        currentAngleDegRef.current,
        angularVelocityRef.current,
        delta
      );

      currentAngleDegRef.current = nextAngleDeg;
      angularVelocityRef.current = nextAngularVelocity;

      // Apply rotation to 3D rotor group (rotation around Z axis)
      const rad = (nextAngleDeg * Math.PI) / 180;
      rotorGroupRef.current.rotation.z = rad;

      // Update force arrows in real time
      updateForceArrows(state, rad, curConf);

      // Update 2D symbols (• and ×) in real time
      updateSymbols(state, rad, curConf);

      // Update current particles
      updateParticles(delta, state, curConf);

      if (onStateUpdate) {
        onStateUpdate(state);
      }

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

  // Build Magnets (North on Left, South on Right)
  useEffect(() => {
    const group = magnetsGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const halfGap = config.magnetGap === 'narrow' ? 1.8 : config.magnetGap === 'wide' ? 3.4 : 2.5;
    const magW = 1.6;
    const magH = 2.4;
    const magD = 3.6;

    // Left Magnet: North (Red)
    const northGeom = new THREE.BoxGeometry(magW, magH, magD);
    const northMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red
      roughness: 0.25,
      metalness: 0.3,
    });
    const northMesh = new THREE.Mesh(northGeom, northMat);
    northMesh.position.set(-halfGap - magW * 0.5, 0, 0);
    group.add(northMesh);

    // North Label "N"
    const nLabel = createTextBadge('N', '#ffffff', '#dc2626');
    nLabel.position.set(-halfGap + 0.05, 0, 0);
    nLabel.rotation.y = Math.PI * 0.5;
    group.add(nLabel);

    // Right Magnet: South (Blue)
    const southGeom = new THREE.BoxGeometry(magW, magH, magD);
    const southMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Blue
      roughness: 0.25,
      metalness: 0.3,
    });
    const southMesh = new THREE.Mesh(southGeom, southMat);
    southMesh.position.set(halfGap + magW * 0.5, 0, 0);
    group.add(southMesh);

    // South Label "S"
    const sLabel = createTextBadge('S', '#ffffff', '#2563eb');
    sLabel.position.set(halfGap - 0.05, 0, 0);
    sLabel.rotation.y = -Math.PI * 0.5;
    group.add(sLabel);

    // Sturdy magnet mount brackets
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, magD + 0.4), bracketMat);
    b1.position.set(-halfGap - magW - 0.2, -1.0, 0);
    group.add(b1);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, magD + 0.4), bracketMat);
    b2.position.set(halfGap + magW + 0.2, -1.0, 0);
    group.add(b2);
  }, [config.magnetGap, config.magnetStrength]);

  // Build Rotor (Axle, Rectangular Coil, Split-Ring Commutator)
  useEffect(() => {
    const coilGroup = coilMeshGroupRef.current;
    const commGroup = commutatorGroupRef.current;
    const singleWireGroup = singleWireGroupRef.current;

    while (coilGroup.children.length > 0) coilGroup.remove(coilGroup.children[0]);
    while (commGroup.children.length > 0) commGroup.remove(commGroup.children[0]);
    while (singleWireGroup.children.length > 0) singleWireGroup.remove(singleWireGroup.children[0]);

    if (config.mode === 'single_wire') {
      // Single conductor wire suspended between poles
      const wireGeom = new THREE.CylinderGeometry(0.08, 0.08, 4.2, 24);
      wireGeom.rotateX(Math.PI * 0.5);
      const wireMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.2,
      });
      const singleWire = new THREE.Mesh(wireGeom, wireMat);
      singleWireGroup.add(singleWire);
      return;
    }

    // --- Axle (Steel shaft along Z-axis) ---
    const axleGeom = new THREE.CylinderGeometry(0.07, 0.07, 6.2, 24);
    axleGeom.rotateX(Math.PI * 0.5);
    const axleMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const axle = new THREE.Mesh(axleGeom, axleMat);
    coilGroup.add(axle);

    // --- Rectangular Coil Wire Path ---
    // Width W = 2.4 (X span from -1.2 to +1.2), Length L = 3.2 (Z span from -1.6 to +1.6)
    const w = 1.2;
    const l = 1.6;
    const turns = config.coilTurns;
    const wireRad = turns >= 60 ? 0.07 : turns >= 40 ? 0.06 : 0.055;

    // Distinct materials for Side A (Amber) and Side B (Cyan) to help visual tracking
    const sideAMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0xd97706,
      emissiveIntensity: 0.3,
    });
    const sideBMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x0891b2,
      emissiveIntensity: 0.3,
    });
    const endMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.7,
      roughness: 0.3,
    });

    // Side A (Left long branch at x = -w)
    const sideAGeom = new THREE.CylinderGeometry(wireRad, wireRad, l * 2, 16);
    sideAGeom.rotateX(Math.PI * 0.5);
    const sideAMesh = new THREE.Mesh(sideAGeom, sideAMat);
    sideAMesh.position.set(-w, 0, 0);
    coilGroup.add(sideAMesh);

    // Side B (Right long branch at x = +w)
    const sideBGeom = new THREE.CylinderGeometry(wireRad, wireRad, l * 2, 16);
    sideBGeom.rotateX(Math.PI * 0.5);
    const sideBMesh = new THREE.Mesh(sideBGeom, sideBMat);
    sideBMesh.position.set(w, 0, 0);
    coilGroup.add(sideBMesh);

    // Back connecting arm (at z = -l)
    const backGeom = new THREE.CylinderGeometry(wireRad, wireRad, w * 2, 16);
    backGeom.rotateZ(Math.PI * 0.5);
    const backMesh = new THREE.Mesh(backGeom, endMat);
    backMesh.position.set(0, 0, -l);
    coilGroup.add(backMesh);

    // Front connecting arms to commutator (at z = +l)
    const front1Geom = new THREE.CylinderGeometry(wireRad, wireRad, w, 16);
    front1Geom.rotateZ(Math.PI * 0.5);
    const front1 = new THREE.Mesh(front1Geom, sideAMat);
    front1.position.set(-w * 0.5, 0, l);
    coilGroup.add(front1);

    const front2Geom = new THREE.CylinderGeometry(wireRad, wireRad, w, 16);
    front2Geom.rotateZ(Math.PI * 0.5);
    const front2 = new THREE.Mesh(front2Geom, sideBMat);
    front2.position.set(w * 0.5, 0, l);
    coilGroup.add(front2);

    // Side Label Badges (Side A and Side B)
    if (config.highlightSides !== false) {
      const badgeA = createSideBadge('SIDE A', '#f59e0b');
      badgeA.position.set(-w - 0.28, 0, 0);
      coilGroup.add(badgeA);

      const badgeB = createSideBadge('SIDE B', '#06b6d4');
      badgeB.position.set(w + 0.28, 0, 0);
      coilGroup.add(badgeB);
    }

    // --- Split-Ring Commutator ---
    const commZ = 2.1;
    const commRadius = 0.26;
    const commLen = 0.45;

    if (config.hasCommutator) {
      // Semicircle Half-Ring 1 (Side A segment)
      const ring1Geom = new THREE.CylinderGeometry(
        commRadius,
        commRadius,
        commLen,
        24,
        1,
        false,
        Math.PI * 0.06,
        Math.PI * 0.88
      );
      ring1Geom.rotateX(Math.PI * 0.5);
      const ring1Mat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.2,
      });
      const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
      ring1.position.set(0, 0, commZ);
      commGroup.add(ring1);

      // Semicircle Half-Ring 2 (Side B segment)
      const ring2Geom = new THREE.CylinderGeometry(
        commRadius,
        commRadius,
        commLen,
        24,
        1,
        false,
        Math.PI * 1.06,
        Math.PI * 0.88
      );
      ring2Geom.rotateX(Math.PI * 0.5);
      const ring2Mat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        metalness: 0.85,
        roughness: 0.2,
      });
      const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
      ring2.position.set(0, 0, commZ);
      commGroup.add(ring2);
    } else {
      // Continuous Slip Ring (Commutator Disabled)
      const solidGeom = new THREE.CylinderGeometry(commRadius, commRadius, commLen, 32);
      solidGeom.rotateX(Math.PI * 0.5);
      const solidMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.25,
      });
      const solidRing = new THREE.Mesh(solidGeom, solidMat);
      solidRing.position.set(0, 0, commZ);
      commGroup.add(solidRing);
    }
  }, [config.mode, config.coilTurns, config.hasCommutator, config.highlightSides]);

  // Build Fixed Brushes & External Circuit (Battery & Switch)
  useEffect(() => {
    const brushGroup = brushesGroupRef.current;
    const circuitGroup = circuitGroupRef.current;

    while (brushGroup.children.length > 0) brushGroup.remove(brushGroup.children[0]);
    while (circuitGroup.children.length > 0) circuitGroup.remove(circuitGroup.children[0]);

    const commZ = 2.1;
    const brushMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Left Fixed Brush (Positive terminal contact when normal polarity)
    const brushL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.32), brushMat);
    brushL.position.set(-0.34, 0, commZ);
    brushGroup.add(brushL);

    // Right Fixed Brush (Negative terminal contact when normal polarity)
    const brushR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.32), brushMat);
    brushR.position.set(0.34, 0, commZ);
    brushGroup.add(brushR);

    // --- Laboratory Baseboard & Battery Pack ---
    const baseGeom = new THREE.BoxGeometry(5.6, 0.18, 5.8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.2 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.set(0, -2.4, 0);
    circuitGroup.add(base);

    // Bearing blocks for axle
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.25 });
    const bearFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), bearingMat);
    bearFront.position.set(0, -1.7, 2.8);
    circuitGroup.add(bearFront);

    const bearBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 0.3), bearingMat);
    bearBack.position.set(0, -1.7, -2.8);
    circuitGroup.add(bearBack);

    // Battery Pack (front left)
    const battGroup = new THREE.Group();
    battGroup.position.set(-1.8, -2.2, 2.1);

    const battCyl = new THREE.CylinderGeometry(0.32, 0.32, 1.1, 24);
    battCyl.rotateZ(Math.PI * 0.5);
    const battBodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const battBody = new THREE.Mesh(battCyl, battBodyMat);
    battGroup.add(battBody);

    const capGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16);
    capGeom.rotateZ(Math.PI * 0.5);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const posCap = new THREE.Mesh(capGeom, capMat);
    posCap.position.x = config.batteryReversed ? -0.58 : 0.58;
    battGroup.add(posCap);

    // Polarity labels (+ / -)
    const posLabel = createTextBadge(config.batteryReversed ? '-' : '+', '#ef4444', '#1e293b');
    posLabel.position.set(0.65, 0.35, 0);
    battGroup.add(posLabel);

    const negLabel = createTextBadge(config.batteryReversed ? '+' : '-', '#3b82f6', '#1e293b');
    negLabel.position.set(-0.65, 0.35, 0);
    battGroup.add(negLabel);

    circuitGroup.add(battGroup);

    // Knife Switch (front right)
    const switchGroup = new THREE.Group();
    switchGroup.position.set(1.8, -2.2, 2.1);

    const swBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.12, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    switchGroup.add(swBase);

    // Switch Blade (lifts when open, down when closed)
    const bladeGeom = new THREE.BoxGeometry(0.08, 0.1, 0.8);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    blade.position.set(0, config.switchClosed ? 0.12 : 0.42, 0);
    blade.rotation.x = config.switchClosed ? 0 : -Math.PI * 0.28;
    switchGroup.add(blade);

    circuitGroup.add(switchGroup);
  }, [config.batteryReversed, config.switchClosed]);

  // Build Permanent Magnetic Field Lines
  useEffect(() => {
    const group = permanentFieldGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    if (!config.showPermanentField || config.viewMode === 'apparatus') return;

    const lines = generatePermanentFieldLines(config.magnetGap, config.magnetStrength);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      linewidth: 1.5,
    });

    const coneGeom = new THREE.ConeGeometry(0.07, 0.22, 12);
    coneGeom.rotateZ(-Math.PI * 0.5); // points along +X (towards South pole)
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    });

    lines.forEach((line) => {
      const pts = line.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMesh = new THREE.Line(geom, lineMat);
      group.add(lineMesh);

      // Add directional arrow cone in middle
      const mid = pts[Math.floor(pts.length / 2)];
      const cone = new THREE.Mesh(coneGeom, coneMat);
      cone.position.copy(mid);
      group.add(cone);
    });
  }, [config.showPermanentField, config.magnetGap, config.magnetStrength, config.viewMode]);

  // Build Coil Electromagnet Field
  useEffect(() => {
    const group = coilFieldGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    if (!config.showCoilField || config.viewMode === 'apparatus' || !config.switchClosed) return;

    // Dipole field loops around rectangular coil
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8,
    });

    const loopCount = 8;
    for (let i = 0; i < loopCount; i++) {
      const z = -1.2 + (i / (loopCount - 1)) * 2.4;
      const pts: THREE.Vector3[] = [];
      const numPts = 32;
      for (let j = 0; j <= numPts; j++) {
        const u = (j / numPts) * Math.PI * 2;
        const x = Math.cos(u) * 1.6;
        const y = Math.sin(u) * 1.6;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geom, lineMat));
    }
  }, [config.showCoilField, config.viewMode, config.switchClosed]);

  // Initialize Particles
  useEffect(() => {
    const group = particlesGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);
    particlesRef.current = [];

    if (!config.showElectronFlow) return;

    const count = 48;
    const isConventional = config.particleType === 'conventional';
    const pGeom = new THREE.SphereGeometry(isConventional ? 0.08 : 0.09, 12, 12);
    const pMat = new THREE.MeshStandardMaterial({
      color: isConventional ? 0xfacc15 : 0x38bdf8,
      emissive: isConventional ? 0xeab308 : 0x0284c7,
      emissiveIntensity: 2.0,
    });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(pGeom, pMat);
      group.add(mesh);
      particlesRef.current.push({
        mesh,
        progress: i / count,
      });
    }
  }, [config.showElectronFlow, config.particleType]);

  // Real-time update for 3D Force Arrows
  function updateForceArrows(state: MotorState, rad: number, curConf: MotorConfig) {
    const group = forceArrowsGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    if (!curConf.showForceArrows || !curConf.switchClosed || curConf.viewMode === 'fields') return;

    const w = 1.2;
    const l = 1.6;

    // Calculate current positions of Side A and Side B in world space
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);

    const posA = new THREE.Vector3(-w * cosT, -w * sinT, 0);
    const posB = new THREE.Vector3(w * cosT, w * sinT, 0);

    // Left force vector (anchored at whichever branch is on the left)
    const isSideAOnLeft = posA.x <= posB.x;
    const leftAnchor = isSideAOnLeft ? posA : posB;
    const rightAnchor = isSideAOnLeft ? posB : posA;

    const forceMag = Math.max(0.4, Math.abs(state.torque) * 1.5);

    if (Math.abs(state.leftForce.y) > 0.001) {
      const leftDir = state.leftForce.y > 0 ? 1 : -1;
      const leftArrow = create3DForceArrow(leftDir * forceMag, '#22c55e', 'F (Left Side)');
      leftArrow.position.copy(leftAnchor);
      group.add(leftArrow);
    }

    if (Math.abs(state.rightForce.y) > 0.001) {
      const rightDir = state.rightForce.y > 0 ? 1 : -1;
      const rightArrow = create3DForceArrow(rightDir * forceMag, '#22c55e', 'F (Right Side)');
      rightArrow.position.copy(rightAnchor);
      group.add(rightArrow);
    }
  }

  // Real-time update for 2D symbols (• and ×)
  function updateSymbols(state: MotorState, rad: number, curConf: MotorConfig) {
    const group = symbolsGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    if (!curConf.showSymbols || !curConf.switchClosed) return;

    const w = 1.2;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);

    const posA = new THREE.Vector3(-w * cosT, -w * sinT, 0);
    const posB = new THREE.Vector3(w * cosT, w * sinT, 0);

    const isSideAOnLeft = posA.x <= posB.x;
    const leftAnchor = isSideAOnLeft ? posA : posB;
    const rightAnchor = isSideAOnLeft ? posB : posA;

    // • (dot) = current towards viewer (+Z)
    // × (cross) = current away from viewer (-Z)
    const leftSymbolText = state.leftBranchCurrentDir > 0 ? '• (Out)' : '× (In)';
    const rightSymbolText = state.rightBranchCurrentDir > 0 ? '• (Out)' : '× (In)';

    const leftSymbol = createTextBadge(leftSymbolText, '#ffffff', '#0f172a');
    leftSymbol.position.set(leftAnchor.x, leftAnchor.y + 0.45, leftAnchor.z);
    group.add(leftSymbol);

    const rightSymbol = createTextBadge(rightSymbolText, '#ffffff', '#0f172a');
    rightSymbol.position.set(rightAnchor.x, rightAnchor.y + 0.45, rightAnchor.z);
    group.add(rightSymbol);
  }

  // Real-time particle update along rotating rectangular loop
  function updateParticles(delta: number, state: MotorState, curConf: MotorConfig) {
    if (!curConf.showElectronFlow || particlesRef.current.length === 0) return;

    const isFlowing = curConf.switchClosed && curConf.current > 0.05 && !state.inDeadZone;
    const speed = 0.65 * (curConf.speedMultiplier || 1.0);
    const dir = curConf.particleType === 'conventional' ? -1 : 1;
    const battSign = curConf.batteryReversed ? -1 : 1;

    const w = 1.2;
    const l = 1.6;
    const rad = (state.angleDeg * Math.PI) / 180;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);

    // Define 4 corner vertices of rotating rectangular loop
    const c1 = new THREE.Vector3(-w * cosT, -w * sinT, l); // Front Left
    const c2 = new THREE.Vector3(-w * cosT, -w * sinT, -l); // Back Left
    const c3 = new THREE.Vector3(w * cosT, w * sinT, -l); // Back Right
    const c4 = new THREE.Vector3(w * cosT, w * sinT, l); // Front Right

    const corners = [c1, c2, c3, c4, c1];

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      if (isFlowing) {
        p.progress += dir * battSign * speed * delta * 0.25;
        if (p.progress > 1.0) p.progress -= 1.0;
        if (p.progress < 0.0) p.progress += 1.0;
      }

      // Sample position along 4-edge perimeter
      const totalEdges = 4;
      const fIdx = p.progress * totalEdges;
      const edgeIdx = Math.floor(fIdx) % totalEdges;
      const alpha = fIdx - Math.floor(fIdx);

      const pStart = corners[edgeIdx];
      const pEnd = corners[edgeIdx + 1];
      p.mesh.position.lerpVectors(pStart, pEnd, alpha);
    }
  }

  return (
    <div className="relative w-full select-none" style={{ height }}>
      <div
        ref={containerRef}
        id="three-motor-container"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}

// Helpers for 3D UI Badges & Arrows
function createTextBadge(text: string, color: string, bg: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = 'bold 54px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 66);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.65, 0.65, 1);
  return sprite;
}

function createSideBadge(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.roundRect(8, 8, 240, 64, 16);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.roundRect(8, 8, 240, 64, 16);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 42);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.1, 0.35, 1);
  return sprite;
}

function create3DForceArrow(length: number, colorHex: string, label: string): THREE.Group {
  const group = new THREE.Group();
  const dir = length > 0 ? 1 : -1;
  const absLen = Math.max(0.4, Math.abs(length));

  const shaftGeom = new THREE.CylinderGeometry(0.04, 0.04, absLen, 16);
  shaftGeom.translate(0, (absLen * 0.5) * dir, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, // Emerald Green
    emissive: 0x15803d,
    emissiveIntensity: 0.8,
    metalness: 0.4,
  });
  const shaft = new THREE.Mesh(shaftGeom, mat);
  group.add(shaft);

  const coneGeom = new THREE.ConeGeometry(0.12, 0.32, 16);
  if (dir < 0) coneGeom.rotateX(Math.PI);
  coneGeom.translate(0, absLen * dir, 0);
  const cone = new THREE.Mesh(coneGeom, mat);
  group.add(cone);

  return group;
}
