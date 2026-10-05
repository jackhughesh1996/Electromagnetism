import * as THREE from 'three';
import { SimulationConfig, Vector3D, FieldMeasurement } from '../types';

export interface CurrentSegment {
  p: THREE.Vector3;  // midpoint
  dl: THREE.Vector3; // directed segment vector dl
}

// Generate the discrete wire segments for the given simulation configuration
export function generateConductorSegments(config: SimulationConfig): {
  segments: CurrentSegment[];
  wirePath: THREE.Vector3[];
} {
  const segments: CurrentSegment[] = [];
  const wirePath: THREE.Vector3[] = [];

  const { mode, coilRadius, solenoidLength, solenoidTurns } = config;

  if (mode === 'wire') {
    // Straight wire along Y axis from y = -6 to y = +6
    const halfLen = 6.0;
    const numPoints = 80;
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const y = -halfLen + t * (2 * halfLen);
      wirePath.push(new THREE.Vector3(0, y, 0));
    }
    for (let i = 0; i < wirePath.length - 1; i++) {
      const p1 = wirePath[i];
      const p2 = wirePath[i + 1];
      const dl = new THREE.Vector3().subVectors(p2, p1);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      segments.push({ p: mid, dl });
    }
  } else if (mode === 'coil') {
    // Single circular loop in XZ plane at y = 0
    // Parametrized so increasing theta represents counter-clockwise circulation around +Y
    const R = coilRadius;
    const numSegments = 96;
    for (let i = 0; i <= numSegments; i++) {
      const theta = (i / numSegments) * Math.PI * 2;
      const x = R * Math.cos(theta);
      const z = -R * Math.sin(theta);
      wirePath.push(new THREE.Vector3(x, 0, z));
    }
    for (let i = 0; i < wirePath.length - 1; i++) {
      const p1 = wirePath[i];
      const p2 = wirePath[i + 1];
      const dl = new THREE.Vector3().subVectors(p2, p1);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      segments.push({ p: mid, dl });
    }
  } else {
    // Solenoid or Electromagnet: 3D Helix along Y axis
    // Parametrized so turns circulate right-handedly about +Y (field points in +Y for I > 0)
    const R = coilRadius;
    const L = solenoidLength;
    const N = solenoidTurns;
    const totalSegments = Math.max(120, Math.round(N * 32));

    for (let i = 0; i <= totalSegments; i++) {
      const t = i / totalSegments; // 0 to 1
      const theta = t * N * Math.PI * 2;
      const y = -L * 0.5 + t * L;
      const x = R * Math.cos(theta);
      const z = -R * Math.sin(theta);
      wirePath.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i < wirePath.length - 1; i++) {
      const p1 = wirePath[i];
      const p2 = wirePath[i + 1];
      const dl = new THREE.Vector3().subVectors(p2, p1);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      segments.push({ p: mid, dl });
    }
  }

  return { segments, wirePath };
}

// Biot-Savart Law calculation at point r
// B(r) = (mu_0 * I / 4pi) * sum( dl x (r - p) / |r - p|^3 )
export function calculateBField(
  r: THREE.Vector3,
  segments: CurrentSegment[],
  config: SimulationConfig
): THREE.Vector3 {
  const B = new THREE.Vector3(0, 0, 0);
  const I = config.current;

  if (Math.abs(I) < 1e-4) {
    return B;
  }

  // Analytical shortcut for straight wire for perfect circular precision & infinite line limit
  if (config.mode === 'wire') {
    const rhoSq = r.x * r.x + r.z * r.z;
    const rho = Math.sqrt(rhoSq);
    const wireR = 0.2; // wire physical radius
    const mu0Over2Pi = 2.0; // scaled for clear visual numbers

    if (rho < 1e-4) {
      return B;
    }

    let magnitude: number;
    if (rho >= wireR) {
      magnitude = (mu0Over2Pi * I) / rho;
    } else {
      // Linear inside wire (Ampere's law)
      magnitude = (mu0Over2Pi * I * rho) / (wireR * wireR);
    }

    // Azimuthal direction in XZ plane around Y axis:
    // With current in +Y: right-hand rule gives curl (-z, 0, x) / rho
    B.set(-r.z / rho, 0, r.x / rho).multiplyScalar(magnitude);
    return B;
  }

  // Biot-Savart numerical integration for Coil / Solenoid / Electromagnet
  const rMinusP = new THREE.Vector3();
  const cross = new THREE.Vector3();
  const softening = 0.08; // prevents singularity right at wire center
  const scale = 2.0; // scaling constant for visual coherence

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    rMinusP.subVectors(r, seg.p);
    const distSq = rMinusP.lengthSq() + softening * softening;
    const distCube = distSq * Math.sqrt(distSq);

    cross.crossVectors(seg.dl, rMinusP);
    cross.multiplyScalar((scale * I) / distCube);
    B.add(cross);
  }

  // If Electromagnet with soft iron core
  if ((config.mode === 'electromagnet' || (config.mode === 'solenoid' && config.hasIronCore))) {
    const coreR = config.coilRadius * 0.85;
    const coreL = config.solenoidLength * 1.1;
    const rho = Math.sqrt(r.x * r.x + r.z * r.z);

    // If inside or near core, apply ferromagnetic amplification & dipole alignment
    if (Math.abs(r.y) <= coreL * 0.5 && rho <= coreR) {
      // Strong linear amplification inside core
      B.multiplyScalar(config.ironCorePermeability * 0.15 + 1.0);
    } else {
      // Exterior fringe and dipole enhancement due to magnetized core
      const coreVolume = Math.PI * coreR * coreR * coreL;
      // Core magnetization M vector aligned with solenoid axis (Y)
      const M_y = Math.sign(I) * (config.ironCorePermeability * 0.4) * Math.min(1.0, Math.abs(I) / 5.0);
      const dipoleMoment = M_y * coreVolume * 0.08;

      // Dipole field at r: B_dipole = (3 * (m . r_hat) * r_hat - m) / r^3
      const dist = r.length();
      if (dist > coreR * 0.9) {
        const rHat = r.clone().normalize();
        const m = new THREE.Vector3(0, dipoleMoment, 0);
        const mDotRHat = m.dot(rHat);
        const bDipole = rHat.clone().multiplyScalar(3 * mDotRHat).sub(m).multiplyScalar(1 / (dist * dist * dist + 0.1));
        B.add(bDipole);
      }
    }
  }

  return B;
}

// Traces a single magnetic field line using Runge-Kutta 4th Order (RK4)
export function traceFieldLineRK4(
  seed: THREE.Vector3,
  segments: CurrentSegment[],
  config: SimulationConfig,
  maxSteps = 160,
  stepSize = 0.08,
  bidirectional = true
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  // If current is essentially zero, return empty
  if (Math.abs(config.current) < 1e-4) {
    return points;
  }

  // For straight wire, field lines are exact geometric circles centered on Y axis
  if (config.mode === 'wire') {
    const rho = Math.sqrt(seed.x * seed.x + seed.z * seed.z);
    if (rho < 0.1) return points;
    const y = seed.y;
    const numCirclePts = 64;
    const circlePoints: THREE.Vector3[] = [];
    const dir = Math.sign(config.current); // 1 = counter-clockwise looking from top (+y), -1 = clockwise
    for (let i = 0; i <= numCirclePts; i++) {
      const angle = dir * (i / numCirclePts) * Math.PI * 2;
      circlePoints.push(new THREE.Vector3(rho * Math.cos(angle), y, rho * Math.sin(angle)));
    }
    return circlePoints;
  }

  const integrateDirection = (dirSign: number): THREE.Vector3[] => {
    const linePts: THREE.Vector3[] = [];
    let currentPos = seed.clone();
    const bounds = 8.0;

    for (let step = 0; step < maxSteps; step++) {
      linePts.push(currentPos.clone());

      // RK4 step
      const k1 = calculateBField(currentPos, segments, config).normalize().multiplyScalar(dirSign);
      if (k1.lengthSq() < 1e-6) break;

      const p2 = currentPos.clone().addScaledVector(k1, stepSize * 0.5);
      const k2 = calculateBField(p2, segments, config).normalize().multiplyScalar(dirSign);

      const p3 = currentPos.clone().addScaledVector(k2, stepSize * 0.5);
      const k3 = calculateBField(p3, segments, config).normalize().multiplyScalar(dirSign);

      const p4 = currentPos.clone().addScaledVector(k3, stepSize);
      const k4 = calculateBField(p4, segments, config).normalize().multiplyScalar(dirSign);

      const delta = new THREE.Vector3()
        .addScaledVector(k1, 1 / 6)
        .addScaledVector(k2, 2 / 6)
        .addScaledVector(k3, 2 / 6)
        .addScaledVector(k4, 1 / 6)
        .multiplyScalar(stepSize);

      currentPos.add(delta);

      // Check bounds
      if (
        Math.abs(currentPos.x) > bounds ||
        Math.abs(currentPos.y) > bounds ||
        Math.abs(currentPos.z) > bounds
      ) {
        linePts.push(currentPos.clone());
        break;
      }

      // Check loop closure with seed
      if (step > 25 && currentPos.distanceTo(seed) < stepSize * 1.5) {
        linePts.push(seed.clone());
        break;
      }
    }
    return linePts;
  };

  if (bidirectional) {
    const forward = integrateDirection(1);
    const backward = integrateDirection(-1);
    // Combine backward (reversed) + forward
    backward.reverse();
    backward.pop(); // remove duplicate seed
    return [...backward, ...forward];
  } else {
    return integrateDirection(1);
  }
}

// Generate seeded magnetic field lines for the chosen configuration
export function generateFieldLines(
  segments: CurrentSegment[],
  config: SimulationConfig
): THREE.Vector3[][] {
  const lines: THREE.Vector3[][] = [];
  const { mode, coilRadius, solenoidLength } = config;

  if (mode === 'wire') {
    // Generate concentric rings at different radii and heights
    const radii = [0.6, 1.2, 2.0, 3.0, 4.2];
    const heights = [-2.5, -1.0, 0.0, 1.0, 2.5];

    for (const h of heights) {
      for (const r of radii) {
        const seed = new THREE.Vector3(r, h, 0);
        const line = traceFieldLineRK4(seed, segments, config, 64, 0.1, false);
        if (line.length > 2) lines.push(line);
      }
    }
  } else if (mode === 'coil') {
    // Coil field lines: loops threading through the center of the ring
    const R = coilRadius;
    const radialFractions = [0.15, 0.35, 0.55, 0.75, 0.88];
    const angles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

    for (const frac of radialFractions) {
      for (const angle of angles) {
        const r = R * frac;
        const seed = new THREE.Vector3(r * Math.cos(angle), 0.0, r * Math.sin(angle));
        const line = traceFieldLineRK4(seed, segments, config, 200, 0.09, true);
        if (line.length > 5) lines.push(line);
      }
    }

    // Outer loop seeds
    const outerRadii = [R * 1.4, R * 2.0, R * 2.8];
    for (const outR of outerRadii) {
      for (let a = 0; a < 4; a++) {
        const angle = a * (Math.PI * 0.5) + Math.PI * 0.25;
        const seed = new THREE.Vector3(outR * Math.cos(angle), 0.0, outR * Math.sin(angle));
        const line = traceFieldLineRK4(seed, segments, config, 220, 0.09, true);
        if (line.length > 5) lines.push(line);
      }
    }
  } else {
    // Solenoid / Electromagnet field lines
    const R = coilRadius;
    const L = solenoidLength;

    // Inside core seeds at multiple radii and cross-sections
    const innerFractions = [0.0, 0.25, 0.5, 0.72, 0.88];
    const innerAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];

    for (const frac of innerFractions) {
      if (frac === 0) {
        // Central axis line
        const seed = new THREE.Vector3(0, 0, 0);
        const line = traceFieldLineRK4(seed, segments, config, 300, 0.08, true);
        if (line.length > 5) lines.push(line);
      } else {
        for (const angle of innerAngles) {
          const r = R * frac;
          const seed = new THREE.Vector3(r * Math.cos(angle), 0, r * Math.sin(angle));
          const line = traceFieldLineRK4(seed, segments, config, 260, 0.08, true);
          if (line.length > 5) lines.push(line);
        }
      }
    }

    // Near-end seeds to capture fringe fields blooming from poles
    const endFractions = [0.3, 0.6, 0.85];
    for (const frac of endFractions) {
      for (let a = 0; a < 4; a++) {
        const angle = a * (Math.PI * 0.5) + Math.PI * 0.25;
        const r = R * frac;
        const seedTop = new THREE.Vector3(r * Math.cos(angle), L * 0.45, r * Math.sin(angle));
        const line = traceFieldLineRK4(seedTop, segments, config, 250, 0.08, true);
        if (line.length > 5) lines.push(line);
      }
    }

    // Outer return paths
    const returnRadii = [R * 1.8, R * 2.8, R * 3.8];
    for (const retR of returnRadii) {
      for (let a = 0; a < 4; a++) {
        const angle = a * (Math.PI * 0.5) + Math.PI * 0.125;
        const seed = new THREE.Vector3(retR * Math.cos(angle), 0, retR * Math.sin(angle));
        const line = traceFieldLineRK4(seed, segments, config, 240, 0.09, true);
        if (line.length > 5) lines.push(line);
      }
    }
  }

  return lines;
}

// Evaluates probe measurement at arbitrary position
export function measureFieldAtPoint(
  position: Vector3D,
  segments: CurrentSegment[],
  config: SimulationConfig
): FieldMeasurement {
  const posVec = new THREE.Vector3(position.x, position.y, position.z);
  const B = calculateBField(posVec, segments, config);
  const magnitude = B.length();
  const direction = magnitude > 1e-5 ? B.clone().normalize() : new THREE.Vector3(0, 1, 0);

  return {
    position,
    bVector: { x: B.x, y: B.y, z: B.z },
    magnitude,
    direction: { x: direction.x, y: direction.y, z: direction.z },
  };
}
