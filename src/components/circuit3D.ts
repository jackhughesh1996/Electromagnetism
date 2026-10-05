import * as THREE from 'three';
import { SimulationConfig } from '../types';

/**
 * Procedural Canvas Texture for a realistic D-cell / AA laboratory alkaline battery
 */
function createBatteryLabelTexture(isReversed: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Background: Rich industrial dark charcoal
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 512);

  // Top Collar band: Golden amber / copper metallic tone
  const goldGrad = ctx.createLinearGradient(0, 0, 0, 140);
  goldGrad.addColorStop(0, '#b45309');
  goldGrad.addColorStop(0.3, '#f59e0b');
  goldGrad.addColorStop(0.7, '#fbbf24');
  goldGrad.addColorStop(1, '#92400e');
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, 0, 1024, 140);

  // Gold accent pinstripes
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(0, 138, 1024, 4);

  // Bottom Rim band: Steel silver tone
  const silverGrad = ctx.createLinearGradient(0, 440, 0, 512);
  silverGrad.addColorStop(0, '#475569');
  silverGrad.addColorStop(0.4, '#94a3b8');
  silverGrad.addColorStop(0.7, '#cbd5e1');
  silverGrad.addColorStop(1, '#334155');
  ctx.fillStyle = silverGrad;
  ctx.fillRect(0, 440, 1024, 72);

  // Battery Branding in Gold section
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ 1.5V D-CELL ALKALINE', 512, 70);

  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#78350f';
  ctx.fillText('HIGH-DRAIN LABORATORY POWER CELL', 512, 112);

  // Polarity Indicators in the dark body
  // If not reversed: Left is POSITIVE (+), Right is NEGATIVE (-)
  // If reversed: Left is NEGATIVE (-), Right is POSITIVE (+)
  const leftIsPos = !isReversed;

  // Left Polarity Badge
  ctx.fillStyle = leftIsPos ? '#dc2626' : '#2563eb';
  ctx.beginPath();
  ctx.arc(220, 270, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 78px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(leftIsPos ? '+' : '—', 220, 268);

  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = leftIsPos ? '#fca5a5' : '#93c5fd';
  ctx.fillText(leftIsPos ? 'POSITIVE (+)' : 'NEGATIVE (—)', 220, 375);

  // Right Polarity Badge
  ctx.fillStyle = leftIsPos ? '#2563eb' : '#dc2626';
  ctx.beginPath();
  ctx.arc(804, 270, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 78px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(leftIsPos ? '—' : '+', 804, 268);

  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = leftIsPos ? '#93c5fd' : '#fca5a5';
  ctx.fillText(leftIsPos ? 'NEGATIVE (—)' : 'POSITIVE (+)', 804, 375);

  // Center Technical Specifications text
  ctx.font = 'bold 30px monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText('DIRECT CURRENT (DC)', 512, 235);

  ctx.font = '22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('ELECTROMAGNETIC LAB SYSTEM', 512, 280);
  ctx.fillText('KS3 / GCSE SCIENCE PRACTICAL', 512, 315);

  // Warning and CE badge
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('1.5 VOLTS DC • RECHARGEABLE LAB CELL', 512, 365);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Creates a single realistic D-cell cylindrical battery
 */
function createSingleBatteryMesh(isReversed: boolean): THREE.Group {
  const group = new THREE.Group();

  const radius = 0.44;
  const length = 1.65;

  // Battery Main Body Cylinder
  const bodyGeom = new THREE.CylinderGeometry(radius, radius, length, 36);
  bodyGeom.rotateZ(Math.PI * 0.5); // align along X axis

  const labelTexture = createBatteryLabelTexture(isReversed);
  const bodyMat = new THREE.MeshStandardMaterial({
    map: labelTexture,
    metalness: 0.35,
    roughness: 0.35,
  });
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
  group.add(bodyMesh);

  // Nickel / Chrome metal materials
  const nickelMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.95,
    roughness: 0.15,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.88,
    roughness: 0.22,
  });

  const redInsulatorMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.5,
  });

  // Positive Terminal Button (Nub) & Insulator Washer
  // Positioned at +X end if not reversed, or -X end if reversed
  const posEndX = (!isReversed ? 1 : -1) * (length * 0.5);
  const negEndX = (!isReversed ? -1 : 1) * (length * 0.5);

  // Positive Cap collar
  const posCollarGeom = new THREE.CylinderGeometry(radius * 0.75, radius, 0.08, 32);
  posCollarGeom.rotateZ(Math.PI * 0.5);
  const posCollar = new THREE.Mesh(posCollarGeom, brassMat);
  posCollar.position.x = posEndX;
  group.add(posCollar);

  // Red insulator ring
  const ringGeom = new THREE.CylinderGeometry(radius * 0.38, radius * 0.38, 0.04, 24);
  ringGeom.rotateZ(Math.PI * 0.5);
  const redRing = new THREE.Mesh(ringGeom, redInsulatorMat);
  redRing.position.x = posEndX + (!isReversed ? 0.04 : -0.04);
  group.add(redRing);

  // Positive metal raised contact nub
  const nubGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.14, 24);
  nubGeom.rotateZ(Math.PI * 0.5);
  const nubMesh = new THREE.Mesh(nubGeom, nickelMat);
  nubMesh.position.x = posEndX + (!isReversed ? 0.09 : -0.09);
  group.add(nubMesh);

  // Negative Terminal: Flat indented metal circular plate
  const negPlateGeom = new THREE.CylinderGeometry(radius * 0.82, radius * 0.82, 0.05, 32);
  negPlateGeom.rotateZ(Math.PI * 0.5);
  const negPlate = new THREE.Mesh(negPlateGeom, nickelMat);
  negPlate.position.x = negEndX;
  group.add(negPlate);

  return group;
}

/**
 * Creates the complete battery pack (1 or 2 cells in series) in a laboratory battery holder cradle
 */
export function createRealisticBatteryPack(reversed: boolean, cellCount: number = 1): {
  group: THREE.Group;
  posTerminalWorld: THREE.Vector3;
  negTerminalWorld: THREE.Vector3;
} {
  const root = new THREE.Group();
  root.name = 'batteryPack';

  const cells = Math.max(1, Math.min(2, cellCount));
  const holderLength = cells === 1 ? 2.4 : 4.1;
  const holderWidth = 1.25;
  const holderHeight = 0.55;

  // Dark molded battery holder chassis
  const cradleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.4,
    roughness: 0.6,
  });

  const cradleGeom = new THREE.BoxGeometry(holderLength, holderHeight, holderWidth);
  const cradleMesh = new THREE.Mesh(cradleGeom, cradleMat);
  cradleMesh.position.y = -holderHeight * 0.5;
  root.add(cradleMesh);

  // Side lips / rims of cradle
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  const lipFront = new THREE.Mesh(new THREE.BoxGeometry(holderLength, 0.25, 0.12), rimMat);
  lipFront.position.set(0, 0.1, holderWidth * 0.5 - 0.06);
  root.add(lipFront);

  const lipBack = new THREE.Mesh(new THREE.BoxGeometry(holderLength, 0.25, 0.12), rimMat);
  lipBack.position.set(0, 0.1, -holderWidth * 0.5 + 0.06);
  root.add(lipBack);

  // Add individual batteries
  if (cells === 1) {
    const battery = createSingleBatteryMesh(reversed);
    battery.position.set(0, 0.18, 0);
    root.add(battery);
  } else {
    // 2 cells end-to-end in series
    const battery1 = createSingleBatteryMesh(reversed);
    battery1.position.set(-0.85, 0.18, 0);
    root.add(battery1);

    const battery2 = createSingleBatteryMesh(reversed);
    battery2.position.set(0.85, 0.18, 0);
    root.add(battery2);

    // Nickel connecting bridge contact strap in the middle
    const bridgeGeom = new THREE.BoxGeometry(0.1, 0.35, 0.5);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const bridge = new THREE.Mesh(bridgeGeom, bridgeMat);
    bridge.position.set(0, 0.18, 0);
    root.add(bridge);
  }

  // Spring contact at negative end
  const springMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const springTorus = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 12, 24), springMat);
  springTorus.rotateY(Math.PI * 0.5);
  const negEndOffset = (!reversed ? -1 : 1) * (holderLength * 0.5 - 0.2);
  springTorus.position.set(negEndOffset, 0.18, 0);
  root.add(springTorus);

  // Flat contact plate at positive end
  const posEndOffset = (!reversed ? 1 : -1) * (holderLength * 0.5 - 0.15);
  const posPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 24), springMat);
  posPlate.rotateZ(Math.PI * 0.5);
  posPlate.position.set(posEndOffset, 0.18, 0);
  root.add(posPlate);

  // Red (+) and Black (-) Laboratory Binding Posts on front side of holder
  const postGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 20);
  const knurlGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 24);

  // Positive Red Binding Post
  const redPostMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3, roughness: 0.3 });
  const redPostGroup = new THREE.Group();
  const redStem = new THREE.Mesh(postGeom, springMat);
  const redCap = new THREE.Mesh(knurlGeom, redPostMat);
  redCap.position.y = 0.2;
  redPostGroup.add(redStem);
  redPostGroup.add(redCap);

  // Negative Black Binding Post
  const blackPostMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.3, roughness: 0.3 });
  const blackPostGroup = new THREE.Group();
  const blackStem = new THREE.Mesh(postGeom, springMat);
  const blackCap = new THREE.Mesh(knurlGeom, blackPostMat);
  blackCap.position.y = 0.2;
  blackPostGroup.add(blackStem);
  blackPostGroup.add(blackCap);

  const postX = holderLength * 0.32;
  const postZ = holderWidth * 0.5 + 0.18;

  if (!reversed) {
    redPostGroup.position.set(postX, 0.1, postZ);
    blackPostGroup.position.set(-postX, 0.1, postZ);
  } else {
    redPostGroup.position.set(-postX, 0.1, postZ);
    blackPostGroup.position.set(postX, 0.1, postZ);
  }

  root.add(redPostGroup);
  root.add(blackPostGroup);

  // Polarity text badges near terminals
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 128;
  labelCanvas.height = 64;
  const lctx = labelCanvas.getContext('2d')!;
  lctx.fillStyle = '#1e293b';
  lctx.fillRect(0, 0, 128, 64);
  lctx.font = 'bold 36px monospace';
  lctx.fillStyle = '#ef4444';
  lctx.fillText('+', 24, 44);
  lctx.fillStyle = '#3b82f6';
  lctx.fillText('—', 84, 44);
  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const signPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.3),
    new THREE.MeshBasicMaterial({ map: labelTex })
  );
  signPlate.rotation.x = -Math.PI * 0.5;
  signPlate.position.set(0, 0.01, postZ - 0.08);
  root.add(signPlate);

  const posPos = !reversed ? new THREE.Vector3(postX, 0.3, postZ) : new THREE.Vector3(-postX, 0.3, postZ);
  const negPos = !reversed ? new THREE.Vector3(-postX, 0.3, postZ) : new THREE.Vector3(postX, 0.3, postZ);

  return {
    group: root,
    posTerminalWorld: posPos,
    negTerminalWorld: negPos,
  };
}

/**
 * Creates a realistic laboratory Knife Switch with hinged contact arm
 */
export function createKnifeSwitchMesh(isClosed: boolean): {
  group: THREE.Group;
  bladePivot: THREE.Group;
  inputTerminal: THREE.Vector3;
  outputTerminal: THREE.Vector3;
  setClosed: (closed: boolean) => void;
} {
  const root = new THREE.Group();
  root.name = 'knifeSwitch';

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.7,
    metalness: 0.2,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.88,
    roughness: 0.2,
  });

  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Red insulating grip handle
    roughness: 0.4,
    metalness: 0.1,
  });

  // Base block (slate / phenolic)
  const baseGeom = new THREE.BoxGeometry(1.6, 0.2, 0.9);
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.y = -0.1;
  root.add(baseMesh);

  // Pivot brackets (Hinge end on left)
  const bracketGeom = new THREE.BoxGeometry(0.12, 0.36, 0.18);
  const bracket1 = new THREE.Mesh(bracketGeom, brassMat);
  bracket1.position.set(-0.55, 0.16, 0.1);
  root.add(bracket1);

  const bracket2 = new THREE.Mesh(bracketGeom, brassMat);
  bracket2.position.set(-0.55, 0.16, -0.1);
  root.add(bracket2);

  // Pivot bolt
  const boltGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.34, 16);
  boltGeom.rotateX(Math.PI * 0.5);
  const bolt = new THREE.Mesh(boltGeom, brassMat);
  bolt.position.set(-0.55, 0.24, 0);
  root.add(bolt);

  // Receiving contact jaws (Right end)
  const jawGeom = new THREE.BoxGeometry(0.08, 0.36, 0.06);
  const jaw1 = new THREE.Mesh(jawGeom, brassMat);
  jaw1.position.set(0.55, 0.16, 0.04);
  root.add(jaw1);

  const jaw2 = new THREE.Mesh(jawGeom, brassMat);
  jaw2.position.set(0.55, 0.16, -0.04);
  root.add(jaw2);

  // Screw binding posts for circuit wires
  const postGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.3, 16);
  const postIn = new THREE.Mesh(postGeom, brassMat);
  postIn.position.set(-0.55, 0.15, 0.32);
  root.add(postIn);

  const postOut = new THREE.Mesh(postGeom, brassMat);
  postOut.position.set(0.55, 0.15, 0.32);
  root.add(postOut);

  // Hinged switch blade arm
  const bladePivot = new THREE.Group();
  bladePivot.position.set(-0.55, 0.24, 0);

  // Brass blade arm (length 1.15)
  const bladeGeom = new THREE.BoxGeometry(1.15, 0.14, 0.035);
  const bladeMesh = new THREE.Mesh(bladeGeom, brassMat);
  bladeMesh.position.set(0.575, 0, 0);
  bladePivot.add(bladeMesh);

  // Insulating red grip knob on end of blade
  const handleGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.38, 16);
  handleGeom.rotateX(Math.PI * 0.5);
  const handle = new THREE.Mesh(handleGeom, handleMat);
  handle.position.set(1.15, 0.12, 0);
  bladePivot.add(handle);

  root.add(bladePivot);

  const setClosed = (closed: boolean) => {
    // 0 rad = horizontal (closed inside jaws), -0.65 rad = tilted up ~37 deg (open)
    bladePivot.rotation.z = closed ? 0 : -0.65;
  };

  setClosed(isClosed);

  return {
    group: root,
    bladePivot,
    inputTerminal: new THREE.Vector3(-0.55, 0.25, 0.32),
    outputTerminal: new THREE.Vector3(0.55, 0.25, 0.32),
    setClosed,
  };
}

/**
 * Creates the wooden/phenolic laboratory workbench baseboard
 */
export function createLabBaseboard(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'labBaseboard';

  // Mahogany / dark phenolic lab bench board
  const boardGeom = new THREE.BoxGeometry(11.5, 0.22, 8.5);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.1,
    roughness: 0.7,
  });
  const boardMesh = new THREE.Mesh(boardGeom, boardMat);
  boardMesh.position.y = -3.65;
  group.add(boardMesh);

  // Border bevel trim
  const trimGeom = new THREE.BoxGeometry(11.6, 0.06, 8.6);
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.6,
    roughness: 0.4,
  });
  const trimMesh = new THREE.Mesh(trimGeom, trimMat);
  trimMesh.position.y = -3.72;
  group.add(trimMesh);

  // Rubber non-slip feet at corners
  const footGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.14, 16);
  const footMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9 });
  const footPositions = [
    [-5.2, -3.8, -3.8],
    [5.2, -3.8, -3.8],
    [-5.2, -3.8, 3.8],
    [5.2, -3.8, 3.8],
  ];
  footPositions.forEach(([fx, fy, fz]) => {
    const foot = new THREE.Mesh(footGeom, footMat);
    foot.position.set(fx, fy, fz);
    group.add(foot);
  });

  return group;
}

/**
 * Builds the realistic insulated 3D jumper wires and full closed circuit polyline loop
 */
export function buildCircuitSystem(
  config: SimulationConfig,
  wirePath: THREE.Vector3[]
): {
  circuitGroup: THREE.Group;
  fullLoopPoints: THREE.Vector3[];
  switchController: { setClosed: (closed: boolean) => void };
} {
  const circuitGroup = new THREE.Group();
  circuitGroup.name = 'circuitSystem';

  // 1. Lab Baseboard
  const baseboard = createLabBaseboard();
  circuitGroup.add(baseboard);

  // 2. Battery Pack
  const isReversed = config.current < 0;
  const cellCount = config.cellCount ?? (Math.abs(config.current) > 7.5 ? 2 : 1);
  const batteryData = createRealisticBatteryPack(isReversed, cellCount);

  // Position battery on left front of board
  const batteryPos = new THREE.Vector3(-3.2, -3.45, 2.2);
  batteryData.group.position.copy(batteryPos);
  circuitGroup.add(batteryData.group);

  // Calculate world positions of battery binding posts
  const posTermWorld = batteryData.posTerminalWorld.clone().add(batteryPos);
  const negTermWorld = batteryData.negTerminalWorld.clone().add(batteryPos);

  // 3. Knife Switch
  const isClosed = Math.abs(config.current) > 0.05 && (config.switchClosed ?? true);
  const switchData = createKnifeSwitchMesh(isClosed);

  // Position switch on right front of board
  const switchPos = new THREE.Vector3(2.4, -3.45, 2.2);
  switchData.group.position.copy(switchPos);
  circuitGroup.add(switchData.group);

  const switchInWorld = switchData.inputTerminal.clone().add(switchPos);
  const switchOutWorld = switchData.outputTerminal.clone().add(switchPos);

  // 4. Conductor Terminal Anchors
  let condInWorld: THREE.Vector3;
  let condOutWorld: THREE.Vector3;

  if (config.mode === 'wire') {
    condInWorld = new THREE.Vector3(0, 5.8, 0); // Top (+)
    condOutWorld = new THREE.Vector3(0, -5.8, 0); // Bottom (-)

    // Add wooden/acrylic laboratory stand holding the straight wire
    const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const standPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 12.2, 16), standMat);
    standPillar.position.set(-1.8, 0, 0);
    circuitGroup.add(standPillar);

    const armTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.2), standMat);
    armTop.position.set(-0.9, 6.0, 0);
    circuitGroup.add(armTop);

    const armBtm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.2), standMat);
    armBtm.position.set(-0.9, -6.0, 0);
    circuitGroup.add(armBtm);

    condInWorld = new THREE.Vector3(0, 6.0, 0);
    condOutWorld = new THREE.Vector3(0, -6.0, 0);
  } else if (config.mode === 'coil') {
    condInWorld = new THREE.Vector3(config.coilRadius, -1.6, 0);
    condOutWorld = new THREE.Vector3(config.coilRadius - 0.25, -1.6, 0);

    // Support stand
    const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const standBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.0, 16), standMat);
    standBase.position.set(-config.coilRadius - 0.4, -2.6, 0);
    circuitGroup.add(standBase);
  } else {
    // Solenoid / Electromagnet
    const pStart = wirePath.length > 0 ? wirePath[0] : new THREE.Vector3(0, -1.8, 0);
    const pEnd = wirePath.length > 0 ? wirePath[wirePath.length - 1] : new THREE.Vector3(0, 1.8, 0);
    condInWorld = pEnd.clone();
    condOutWorld = pStart.clone();

    // Lab support V-block cradle
    const cradleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const cradle1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.3), cradleMat);
    cradle1.position.set(0, -2.6, -1.0);
    circuitGroup.add(cradle1);

    const cradle2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.3), cradleMat);
    cradle2.position.set(0, -2.6, 1.0);
    circuitGroup.add(cradle2);
  }

  // Materials for insulated silicone rubber jumper wires (translucent so internal particle drift shines through)
  const redCableMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Red (+) positive lead
    roughness: 0.4,
    metalness: 0.2,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });

  const blackCableMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Black/Navy (-) negative return lead
    roughness: 0.4,
    metalness: 0.2,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });

  // Wire 1: Battery Positive Post -> Knife Switch Input
  const ptsWire1 = [
    posTermWorld.clone(),
    new THREE.Vector3(posTermWorld.x + 0.4, -3.35, posTermWorld.z + 0.3),
    new THREE.Vector3(0, -3.42, 2.6),
    new THREE.Vector3(switchInWorld.x - 0.4, -3.35, switchInWorld.z + 0.3),
    switchInWorld.clone(),
  ];
  const curveWire1 = new THREE.CatmullRomCurve3(ptsWire1);
  const geomWire1 = new THREE.TubeGeometry(curveWire1, 32, 0.045, 10, false);
  circuitGroup.add(new THREE.Mesh(geomWire1, redCableMat));

  // Wire 2: Knife Switch Output -> Conductor Input
  const ptsWire2 = [
    switchOutWorld.clone(),
    new THREE.Vector3(switchOutWorld.x + 0.5, -3.3, switchOutWorld.z - 0.2),
    new THREE.Vector3(condInWorld.x + 1.2, THREE.MathUtils.lerp(-3.4, condInWorld.y, 0.4), condInWorld.z + 0.8),
    new THREE.Vector3(condInWorld.x + 0.4, condInWorld.y - 0.2, condInWorld.z + 0.3),
    condInWorld.clone(),
  ];
  const curveWire2 = new THREE.CatmullRomCurve3(ptsWire2);
  const geomWire2 = new THREE.TubeGeometry(curveWire2, 36, 0.045, 10, false);
  circuitGroup.add(new THREE.Mesh(geomWire2, redCableMat));

  // Wire 3: Conductor Output -> Battery Negative Post
  const ptsWire3 = [
    condOutWorld.clone(),
    new THREE.Vector3(condOutWorld.x - 0.6, condOutWorld.y - 0.2, condOutWorld.z + 0.3),
    new THREE.Vector3(negTermWorld.x + 0.8, THREE.MathUtils.lerp(-3.4, condOutWorld.y, 0.4), negTermWorld.z - 0.6),
    new THREE.Vector3(negTermWorld.x - 0.3, -3.35, negTermWorld.z - 0.2),
    negTermWorld.clone(),
  ];
  const curveWire3 = new THREE.CatmullRomCurve3(ptsWire3);
  const geomWire3 = new THREE.TubeGeometry(curveWire3, 36, 0.045, 10, false);
  circuitGroup.add(new THREE.Mesh(geomWire3, blackCableMat));

  // Banana plug / spade crimps at connection points
  const crimpMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
  [posTermWorld, negTermWorld, switchInWorld, switchOutWorld, condInWorld, condOutWorld].forEach((pos) => {
    const crimp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 16), crimpMat);
    crimp.position.copy(pos);
    circuitGroup.add(crimp);
  });

  // Construct complete continuous polyline points representing the CLOSED CIRCUIT LOOP
  // Path order for Electron Flow (- to +):
  // 1. Out of Battery Negative terminal -> along Wire 3 to Conductor Output
  // 2. Through Conductor to Conductor Input
  // 3. Along Wire 2 to Knife Switch Output
  // 4. Across Knife Switch blade to Knife Switch Input
  // 5. Along Wire 1 to Battery Positive terminal
  // 6. Through battery interior back to Negative terminal
  const sampledWire3 = curveWire3.getPoints(24); // condOut -> negTerm (reverse this for negTerm -> condOut)
  const sampledWire2 = curveWire2.getPoints(24); // switchOut -> condIn (reverse this for condIn -> switchOut)
  const sampledWire1 = curveWire1.getPoints(20); // posTerm -> switchIn (reverse this for switchIn -> posTerm)

  const fullLoopPoints: THREE.Vector3[] = [];

  // Step 1: NegTerm -> Wire 3 -> CondOut
  for (let i = sampledWire3.length - 1; i >= 0; i--) {
    fullLoopPoints.push(sampledWire3[i]);
  }

  // Step 2: Through Conductor
  if (config.mode === 'coil') {
    // Continuous path through lead wire up, circular loop, lead wire down
    const R = config.coilRadius;
    const leadSteps = 8;
    // Climb up negative lead to coil level
    for (let i = 1; i <= leadSteps; i++) {
      const t = i / leadSteps;
      fullLoopPoints.push(new THREE.Vector3(R - 0.25, -1.6 + t * 1.6, 0));
    }
    // Around the circular loop
    const loopSteps = 64;
    for (let i = 0; i <= loopSteps; i++) {
      const theta = (i / loopSteps) * Math.PI * 2;
      fullLoopPoints.push(new THREE.Vector3(R * Math.cos(theta), 0, -R * Math.sin(theta)));
    }
    // Down positive lead to condInWorld
    for (let i = 1; i <= leadSteps; i++) {
      const t = i / leadSteps;
      fullLoopPoints.push(new THREE.Vector3(R, -t * 1.6, 0));
    }
  } else if (wirePath.length > 1) {
    for (let i = 0; i < wirePath.length; i++) {
      fullLoopPoints.push(wirePath[i].clone());
    }
  }

  // Step 3: CondIn -> Wire 2 -> SwitchOut
  for (let i = sampledWire2.length - 1; i >= 0; i--) {
    fullLoopPoints.push(sampledWire2[i]);
  }

  // Step 4: Across switch blade (SwitchOut -> SwitchIn)
  const bladeSteps = 4;
  for (let i = 0; i <= bladeSteps; i++) {
    const t = i / bladeSteps;
    fullLoopPoints.push(new THREE.Vector3(
      THREE.MathUtils.lerp(switchOutWorld.x, switchInWorld.x, t),
      THREE.MathUtils.lerp(switchOutWorld.y, switchInWorld.y, t),
      THREE.MathUtils.lerp(switchOutWorld.z, switchInWorld.z, t)
    ));
  }

  // Step 5: SwitchIn -> Wire 1 -> PosTerm
  for (let i = sampledWire1.length - 1; i >= 0; i--) {
    fullLoopPoints.push(sampledWire1[i]);
  }

  // Step 6: PosTerm -> Through Battery Interior -> NegTerm
  const battSteps = 4;
  for (let i = 0; i <= battSteps; i++) {
    const t = i / battSteps;
    fullLoopPoints.push(new THREE.Vector3(
      THREE.MathUtils.lerp(posTermWorld.x, negTermWorld.x, t),
      THREE.MathUtils.lerp(posTermWorld.y, negTermWorld.y, t) - 0.1 * Math.sin(t * Math.PI),
      THREE.MathUtils.lerp(posTermWorld.z, negTermWorld.z, t) - 0.15 * Math.sin(t * Math.PI)
    ));
  }

  return {
    circuitGroup,
    fullLoopPoints,
    switchController: switchData,
  };
}
