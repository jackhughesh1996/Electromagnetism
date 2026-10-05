import { MotorConfig, MotorState, Vector3D } from '../types';

export function calculateMotorPhysics(
  config: MotorConfig,
  currentAngleDeg: number,
  angularVelocity: number,
  deltaSeconds: number
): {
  nextAngleDeg: number;
  nextAngularVelocity: number;
  state: MotorState;
} {
  // If switch is open, current is 0
  const isSwitchClosed = config.switchClosed && config.current > 0.05;
  const rawCurrent = isSwitchClosed ? config.current : 0;
  const turns = config.coilTurns;
  const batterySign = config.batteryReversed ? -1 : 1;

  // Calculate magnetic field strength B (Tesla equivalent scaling)
  const baseB = config.magnetStrength === 'strong' ? 1.8 : 1.0;
  const gapFactor = config.magnetGap === 'narrow' ? 1.4 : config.magnetGap === 'wide' ? 0.7 : 1.0;
  const B = baseB * gapFactor;

  // Normalize angle to [0, 360)
  let angle = ((currentAngleDeg % 360) + 360) % 360;

  // If frozen angle is specified (e.g. for Step 45 or Challenge 2)
  if (config.frozenAngle !== null) {
    angle = ((config.frozenAngle % 360) + 360) % 360;
  }

  const rad = (angle * Math.PI) / 180;

  // Commutator dead zone around 90 deg and 270 deg (vertical position)
  const distTo90 = Math.abs(angle - 90);
  const distTo270 = Math.abs(angle - 270);
  const inDeadZone = distTo90 < 5 || distTo270 < 5;

  // Determine current direction in physical spatial branches (Left = x < 0, Right = x > 0)
  // Left branch (+Z is towards viewer, -Z is away from viewer):
  let leftDir: 1 | -1 | 0 = 0;
  let rightDir: 1 | -1 | 0 = 0;
  let commutatorSwapped = false;

  if (rawCurrent > 0) {
    if (config.hasCommutator) {
      // Split ring swaps connections every 180 deg (at 90 and 270)
      if (angle >= 90 && angle < 270) {
        // Bottom-up half-cycle: commutator reversed
        commutatorSwapped = true;
        leftDir = (batterySign * -1) as -1 | 1;
        rightDir = (batterySign * 1) as -1 | 1;
      } else {
        // Top-up half-cycle
        commutatorSwapped = false;
        leftDir = (batterySign * -1) as -1 | 1;
        rightDir = (batterySign * 1) as -1 | 1;
      }
      if (inDeadZone) {
        leftDir = 0;
        rightDir = 0;
      }
    } else {
      // Commutator disabled: single continuous loop, current stays in same wire segment
      // When coil flips upside down (90 to 270 deg), spatial left branch current flips!
      if (angle >= 90 && angle < 270) {
        leftDir = (batterySign * 1) as 1 | -1;
        rightDir = (batterySign * -1) as 1 | -1;
      } else {
        leftDir = (batterySign * -1) as -1 | 1;
        rightDir = (batterySign * 1) as -1 | 1;
      }
    }
  }

  // Force magnitude: F = N * I * L * B
  // With L = 1.0 (normalized), force on left and right long sides
  const forceScale = 0.85;
  const forceMag = turns * rawCurrent * B * forceScale * 0.01;

  // F = I (L x B):
  // Since B is along +X (N on left, S on right):
  // Current +Z (towards viewer) x +X = +Y (UP)
  // Current -Z (away from viewer) x +X = -Y (DOWN)
  const leftForceY = leftDir * forceMag;
  const rightForceY = rightDir * forceMag;

  const leftForce: Vector3D = { x: 0, y: leftForceY, z: 0 };
  const rightForce: Vector3D = { x: 0, y: rightForceY, z: 0 };

  // Torque: tau = r * F * cos(theta)
  // For standard motor, positive torque drives clockwise rotation in front view
  const momentArm = Math.cos(rad);
  let torque = 0;

  if (isSwitchClosed && !inDeadZone) {
    if (config.hasCommutator) {
      // With split ring: torque is always positive (or negative if battery reversed)
      torque = batterySign * forceMag * Math.abs(momentArm);
    } else {
      // Without split ring: torque reverses past 90 deg -> restoring force / oscillation!
      torque = batterySign * forceMag * momentArm;
    }
  }

  // Relative turning effect (0 to 100%)
  const maxPossibleTorque = 60 * 6.0 * (1.8 * 1.4) * forceScale * 0.01;
  const peakTorqueForCurrentConfig = turns * rawCurrent * B * forceScale * 0.01;
  const relativeTurningEffect = Math.min(
    100,
    Math.round((peakTorqueForCurrentConfig / maxPossibleTorque) * 100)
  );

  // Dynamics simulation (Moment of inertia + Damping)
  let nextAngularVelocity = angularVelocity;
  let nextAngleDeg = angle;

  if (config.frozenAngle !== null || !config.isPlaying) {
    // Paused or manually stepped
    nextAngularVelocity = 0;
    nextAngleDeg = angle;
  } else {
    const inertia = 0.45; // coil rotational inertia
    const damping = 0.08; // air resistance & bearing friction
    const speedMultiplier = config.speedMultiplier || 1.0;

    // Angular acceleration: alpha = tau / I
    const angularAcc = (torque / inertia) * 12.0;

    // Numerical integration (Euler-Cromer)
    const effectiveDelta = Math.min(0.05, deltaSeconds) * speedMultiplier;
    nextAngularVelocity = (nextAngularVelocity + angularAcc * effectiveDelta) * (1 - damping * effectiveDelta);

    // Clamp max rotation speed for smooth educational visibility
    const maxRotSpeed = 360 * 1.8 * speedMultiplier; // max ~1.8 rev/sec
    nextAngularVelocity = Math.max(-maxRotSpeed, Math.min(maxRotSpeed, nextAngularVelocity));

    // Update angle
    nextAngleDeg = (angle + nextAngularVelocity * effectiveDelta) % 360;
    if (nextAngleDeg < 0) nextAngleDeg += 360;
  }

  const state: MotorState = {
    angleDeg: nextAngleDeg,
    angularVelocity: nextAngularVelocity,
    torque,
    relativeTurningEffect,
    leftBranchCurrentDir: leftDir,
    rightBranchCurrentDir: rightDir,
    leftForce,
    rightForce,
    commutatorSwapped,
    inDeadZone,
  };

  return {
    nextAngleDeg,
    nextAngularVelocity,
    state,
  };
}

// Generate permanent magnet magnetic field lines (Left N to Right S)
export function generatePermanentFieldLines(
  magnetGap: 'narrow' | 'normal' | 'wide',
  strength: 'standard' | 'strong'
): { points: [number, number, number][] }[] {
  const lines: { points: [number, number, number][] }[] = [];
  const halfGap = magnetGap === 'narrow' ? 1.8 : magnetGap === 'wide' ? 3.4 : 2.5;
  const ySpan = 1.4;
  const zSpan = 2.4;
  const rows = strength === 'strong' ? 5 : 4;
  const cols = strength === 'strong' ? 6 : 5;

  for (let r = 0; r < rows; r++) {
    const y = -ySpan + (r / (rows - 1)) * (ySpan * 2);
    for (let c = 0; c < cols; c++) {
      const z = -zSpan + (c / (cols - 1)) * (zSpan * 2);
      // Straight streamline from -halfGap to +halfGap with slight fringing at edges
      const pts: [number, number, number][] = [];
      const numPts = 12;
      for (let i = 0; i <= numPts; i++) {
        const u = i / numPts;
        const x = -halfGap + u * (halfGap * 2);
        // Slight outward bulge for outer lines
        const edgeFringe = (1 - (x / halfGap) ** 2) * 0.15;
        const fy = y * (1 + edgeFringe);
        const fz = z * (1 + edgeFringe);
        pts.push([x, fy, fz]);
      }
      lines.push({ points: pts });
    }
  }

  return lines;
}
