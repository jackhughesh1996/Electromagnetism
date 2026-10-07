import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { InductionConfig, InductionState } from '../../types';

interface InductionCanvasProps {
  config: InductionConfig;
  magnetPos: number; // axial position along X
  coilPos: number; // axial position along X
  inductionState: InductionState;
  height?: string;
  onDragMagnet?: (newPos: number) => void;
}

export function InductionCanvas({
  config,
  magnetPos,
  coilPos,
  inductionState,
  height = '100%',
  onDragMagnet,
}: InductionCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // 3D groups
  const magnetGroupRef = useRef<THREE.Group>(new THREE.Group());
  const coilGroupRef = useRef<THREE.Group>(new THREE.Group());
  const fieldLinesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const measurementDiscRef = useRef<THREE.Mesh | null>(null);
  const circuitWiresGroupRef = useRef<THREE.Group>(new THREE.Group());
  const currentArrowsGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Refs for animation
  const configRef = useRef<InductionConfig>(config);
  configRef.current = config;
  const magnetPosRef = useRef<number>(magnetPos);
  magnetPosRef.current = magnetPos;
  const coilPosRef = useRef<number>(coilPos);
  coilPosRef.current = coilPos;
  const stateRef = useRef<InductionState>(inductionState);
  stateRef.current = inductionState;

  // Camera Orbit Controls
  const isDraggingRef = useRef(false);
  const isRightDraggingRef = useRef(false);
  const isDraggingMagnetRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const sphericalRef = useRef({ radius: 8.5, theta: 0.75, phi: 1.15 });

  // Raycasting for magnet dragging
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const dragPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)); // y=0 plane

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const heightPx = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Dark navy slate
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 100);
    cameraRef.current = camera;
    updateCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(10, 16, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-10, -5, -8);
    scene.add(dirLight2);

    // Workbench Table Baseboard
    const baseboard = new THREE.Mesh(
      new THREE.BoxGeometry(16.0, 0.2, 8.5),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8, metalness: 0.2 })
    );
    baseboard.position.set(0, -2.1, 0);
    scene.add(baseboard);

    // Grid on table
    const grid = new THREE.GridHelper(16, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -2.0;
    scene.add(grid);

    // Add Apparatus Groups
    scene.add(magnetGroupRef.current);
    scene.add(coilGroupRef.current);
    scene.add(circuitWiresGroupRef.current);
    scene.add(currentArrowsGroupRef.current);

    // Build static parts of coil and magnet
    buildMagnetMesh();
    buildCoilMesh();
    buildCircuitWires();

    // Mouse / Touch Event Handlers
    const handleMouseDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(magnetGroupRef.current.children, true);

      if (e.button === 0 && intersects.length > 0 && onDragMagnet) {
        // User clicked directly on the magnet!
        isDraggingMagnetRef.current = true;
      } else if (e.button === 0) {
        isDraggingRef.current = true;
      } else if (e.button === 2) {
        isRightDraggingRef.current = true;
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (isDraggingMagnetRef.current && onDragMagnet) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseRef.current, camera);

        const targetPoint = new THREE.Vector3();
        raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, targetPoint);
        if (targetPoint) {
          // Clamp magnet to x in [-5.5, +5.5]
          const clampedX = Math.max(-5.5, Math.min(5.5, targetPoint.x));
          onDragMagnet(clampedX);
        }
      } else if (isDraggingRef.current) {
        sphericalRef.current.theta -= deltaX * 0.007;
        sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - deltaY * 0.007));
        updateCamera();
      } else if (isRightDraggingRef.current) {
        const panSpeed = 0.006 * (sphericalRef.current.radius / 8.5);
        const forward = new THREE.Vector3().subVectors(cameraTargetRef.current, camera.position).normalize();
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
        cameraTargetRef.current.addScaledVector(right, -deltaX * panSpeed);
        cameraTargetRef.current.y += deltaY * panSpeed;
        updateCamera();
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      isRightDraggingRef.current = false;
      isDraggingMagnetRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      sphericalRef.current.radius = Math.max(4.0, Math.min(18.0, sphericalRef.current.radius * zoomFactor));
      updateCamera();
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
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Update transforms
      updateSceneTransforms();

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
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

  function updateCamera() {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = cameraTargetRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = cameraTargetRef.current.y + radius * Math.cos(phi);
    const z = cameraTargetRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTargetRef.current);
  }

  // Build Bar Magnet Mesh with N (Red) and S (Blue)
  function buildMagnetMesh() {
    const group = magnetGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    // Bar magnet length = 3.2, width = 0.8, height = 0.8
    // Aligned along X axis.
    // Half length = 1.6
    const halfL = 1.5;
    const w = 0.8;
    const h = 0.8;

    const northMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red
      metalness: 0.3,
      roughness: 0.3,
    });
    const southMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Blue
      metalness: 0.3,
      roughness: 0.3,
    });

    // Left half and Right half
    // When config.magnetFlipped is false: North is facing coil (on left, closer to coil at x=0 if magnet > 0)
    // To make it physically explicit:
    // Left half (x in [-halfL, 0]):
    const leftGeom = new THREE.BoxGeometry(halfL, h, w);
    const leftMesh = new THREE.Mesh(leftGeom, config.magnetFlipped ? southMat : northMat);
    leftMesh.position.set(-halfL / 2, 0, 0);
    group.add(leftMesh);

    // Right half (x in [0, halfL]):
    const rightGeom = new THREE.BoxGeometry(halfL, h, w);
    const rightMesh = new THREE.Mesh(rightGeom, config.magnetFlipped ? northMat : southMat);
    rightMesh.position.set(halfL / 2, 0, 0);
    group.add(rightMesh);

    // Subtle steel chamfer divider in middle
    const dividerGeom = new THREE.BoxGeometry(0.04, h + 0.02, w + 0.02);
    const dividerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const dividerMesh = new THREE.Mesh(dividerGeom, dividerMat);
    dividerMesh.position.set(0, 0, 0);
    group.add(dividerMesh);

    // Bold 3D Labels for 'N' and 'S'
    const createPoleCanvas = (text: string, bgColor: string) => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 88px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 64);
      return new THREE.CanvasTexture(c);
    };

    const leftTex = createPoleCanvas(config.magnetFlipped ? 'S' : 'N', config.magnetFlipped ? '#2563eb' : '#ef4444');
    const rightTex = createPoleCanvas(config.magnetFlipped ? 'N' : 'S', config.magnetFlipped ? '#ef4444' : '#2563eb');

    const labelMatLeft = new THREE.MeshBasicMaterial({ map: leftTex, transparent: true });
    const labelMatRight = new THREE.MeshBasicMaterial({ map: rightTex, transparent: true });

    // Put labels on top and side faces of the magnet
    const labelPlane = new THREE.PlaneGeometry(0.65, 0.65);

    // Top face
    const topLabelL = new THREE.Mesh(labelPlane, labelMatLeft);
    topLabelL.position.set(-halfL / 2, h / 2 + 0.005, 0);
    topLabelL.rotation.x = -Math.PI / 2;
    group.add(topLabelL);

    const topLabelR = new THREE.Mesh(labelPlane, labelMatRight);
    topLabelR.position.set(halfL / 2, h / 2 + 0.005, 0);
    topLabelR.rotation.x = -Math.PI / 2;
    group.add(topLabelR);

    // Front face
    const frontLabelL = new THREE.Mesh(labelPlane, labelMatLeft);
    frontLabelL.position.set(-halfL / 2, 0, w / 2 + 0.005);
    group.add(frontLabelL);

    const frontLabelR = new THREE.Mesh(labelPlane, labelMatRight);
    frontLabelR.position.set(halfL / 2, 0, w / 2 + 0.005);
    group.add(frontLabelR);

    // Field lines that rigidly move with magnet
    buildMagnetFieldLines(group);
  }

  // Rigid dipole magnetic-field lines around the bar magnet
  function buildMagnetFieldLines(parentGroup: THREE.Group) {
    const fieldLinesGroup = fieldLinesGroupRef.current;
    while (fieldLinesGroup.children.length > 0) fieldLinesGroup.remove(fieldLinesGroup.children[0]);
    parentGroup.add(fieldLinesGroup);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      linewidth: 1.5,
    });

    // Create 3D dipole loops extending from N to S
    // Magnet length = 3.0. N pole center ~ -1.2, S pole center ~ +1.2 (or vice versa)
    const poleN = config.magnetFlipped ? 1.2 : -1.2;
    const poleS = config.magnetFlipped ? -1.2 : 1.2;

    const numAzimuths = 8;
    const radii = [0.8, 1.4, 2.2];

    for (const r of radii) {
      for (let a = 0; a < numAzimuths; a++) {
        const phi = (a / numAzimuths) * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        // Parametric curve from poleN looping around to poleS
        const points: THREE.Vector3[] = [];
        const steps = 36;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps; // 0 to 1
          const angle = Math.PI * t; // 0 to PI
          // x varies from poleN to outer arch then to poleS
          const x = THREE.MathUtils.lerp(poleN, poleS, t);
          // lateral bulge
          const bulge = Math.sin(angle) * r;
          const y = bulge * cosP;
          const z = bulge * sinP;
          points.push(new THREE.Vector3(x, y, z));
        }

        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geom, lineMat);
        fieldLinesGroup.add(line);
      }
    }
  }

  // Build Hollow Copper Coil Mesh with turns
  function buildCoilMesh() {
    const group = coilGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    const coilRadius = 1.35;
    const coilLength = 1.6;

    // Visual turns: 8 turns for 25, 14 for 50, 22 for 100
    const visualTurns = config.coilTurns === 25 ? 9 : config.coilTurns === 50 ? 15 : 24;

    // Copper material
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Rich copper
      metalness: 0.88,
      roughness: 0.22,
    });

    // Helical copper solenoid coil
    class SolenoidCurve extends THREE.Curve<THREE.Vector3> {
      turns: number;
      length: number;
      radius: number;
      constructor(turns: number, length: number, radius: number) {
        super();
        this.turns = turns;
        this.length = length;
        this.radius = radius;
      }
      getPoint(t: number) {
        const x = (t - 0.5) * this.length;
        const angle = t * Math.PI * 2 * this.turns;
        const y = Math.sin(angle) * this.radius;
        const z = Math.cos(angle) * this.radius;
        return new THREE.Vector3(x, y, z);
      }
    }

    const curve = new SolenoidCurve(visualTurns, coilLength, coilRadius);
    const tubeGeom = new THREE.TubeGeometry(curve, visualTurns * 12, 0.07, 8, false);
    const coilMesh = new THREE.Mesh(tubeGeom, copperMat);
    group.add(coilMesh);

    // Acrylic / Plastic Mounting Tube inside coil
    const tubeCylinderGeom = new THREE.CylinderGeometry(coilRadius - 0.08, coilRadius - 0.08, coilLength + 0.3, 32, 1, true);
    const tubeCylinderMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const tubeCylinder = new THREE.Mesh(tubeCylinderGeom, tubeCylinderMat);
    tubeCylinder.rotation.z = Math.PI / 2; // Lie along X axis
    group.add(tubeCylinder);

    // Coil support stand / wooden stand to desk
    const standGeom = new THREE.BoxGeometry(0.3, 1.2, 0.6);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const stand = new THREE.Mesh(standGeom, standMat);
    stand.position.set(0, -1.45, 0);
    group.add(stand);

    // Translucent measurement disc spanning the coil opening
    const discGeom = new THREE.CircleGeometry(coilRadius - 0.02, 32);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });
    const disc = new THREE.Mesh(discGeom, discMat);
    disc.rotation.y = Math.PI / 2; // Flat perpendicular to X axis
    disc.position.set(0, 0, 0);
    group.add(disc);
    measurementDiscRef.current = disc;

    // Coil Lead wires extending downwards to galvanometer
    const lead1Geom = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8);
    const lead1 = new THREE.Mesh(lead1Geom, copperMat);
    lead1.position.set(-coilLength / 2, -1.1, coilRadius * 0.95);
    group.add(lead1);

    const lead2 = new THREE.Mesh(lead1Geom, copperMat);
    lead2.position.set(coilLength / 2, -1.1, coilRadius * 0.95);
    group.add(lead2);
  }

  // Circuit wires leading to the galvanometer on the bench
  function buildCircuitWires() {
    const group = circuitWiresGroupRef.current;
    while (group.children.length > 0) group.remove(group.children[0]);

    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.2,
      roughness: 0.5,
    });

    // Flexible leads on benchtop
    const wirePath1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.8, -1.8, 1.3),
      new THREE.Vector3(-1.4, -2.0, 1.8),
      new THREE.Vector3(-1.8, -2.0, 2.5),
    ]);
    const wire1 = new THREE.Mesh(new THREE.TubeGeometry(wirePath1, 16, 0.04, 8, false), wireMat);
    group.add(wire1);

    const wirePath2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.8, -1.8, 1.3),
      new THREE.Vector3(1.4, -2.0, 1.8),
      new THREE.Vector3(1.8, -2.0, 2.5),
    ]);
    const wire2 = new THREE.Mesh(new THREE.TubeGeometry(wirePath2, 16, 0.04, 8, false), wireMat);
    group.add(wire2);
  }

  // Update positions and visibility every frame
  function updateSceneTransforms() {
    // Magnet position along X
    magnetGroupRef.current.position.set(magnetPosRef.current, 0, 0);

    // Coil position along X
    coilGroupRef.current.position.set(coilPosRef.current, 0, 0);

    // Field lines visibility
    fieldLinesGroupRef.current.visible = configRef.current.showFieldLines;

    // Measurement disc visibility & pulse based on field magnitude
    if (measurementDiscRef.current) {
      measurementDiscRef.current.visible = configRef.current.showFieldDisc;
      const intensity = Math.min(1.0, Math.abs(stateRef.current.fieldThroughCoil) / 90);
      const discMat = measurementDiscRef.current.material as THREE.MeshBasicMaterial;
      discMat.opacity = 0.15 + intensity * 0.45;
      if (stateRef.current.fieldThroughCoil >= 0) {
        discMat.color.setHex(0x38bdf8); // Sky blue when positive field
      } else {
        discMat.color.setHex(0xf59e0b); // Amber when negative field
      }
    }
  }

  // Rebuild mesh when coilTurns or magnet orientation changes
  useEffect(() => {
    buildMagnetMesh();
    buildCoilMesh();
  }, [config.coilTurns, config.magnetFlipped, config.magnetStrength]);

  return (
    <div className="relative w-full h-full select-none" style={{ height }}>
      <div
        ref={containerRef}
        id="induction-canvas-container"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}
