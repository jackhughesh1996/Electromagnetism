import { InductionConfig, InductionState } from '../types';

/**
 * Calculates induction physics based on relative position and velocity.
 *
 * Core physical model:
 * relativePosition = magnetPosition - coilPosition
 * relativeVelocity = magnetVelocity - coilVelocity
 *
 * fluxProxy = orientation * strength / (relativePosition^2 + softening^2)^(3/2)
 * rateOfChange = d(fluxProxy)/dt = d(fluxProxy)/dx * relativeVelocity
 * inducedEffect = - coilTurns * rateOfChange
 */
export function calculateInductionPhysics(
  magnetPos: number,
  coilPos: number,
  magnetVel: number,
  coilVel: number,
  config: InductionConfig
): InductionState {
  const relativePosition = magnetPos - coilPos;
  const relativeVelocity = magnetVel - coilVel;

  // Magnet properties
  const strengthFactor = config.magnetStrength === 'strong' ? 2.0 : 1.0;
  // If magnetFlipped is false, N points toward coil (along -X direction or positive flux facing coil)
  // Let's standardise: magnet to the right of coil (relativePosition > 0).
  // Facing end is N when not flipped (+1), S when flipped (-1).
  const orientation = config.magnetFlipped ? -1 : 1;

  // Softening parameter to prevent division by zero at the center of the coil
  const softening = 1.6;
  const distSq = relativePosition * relativePosition + softening * softening;
  const dist = Math.sqrt(distSq);

  // Field/flux proxy through coil aperture:
  // Using dipole on-axis field profile: B ~ orientation * strength / (x^2 + a^2)^(3/2)
  // Scaled so maximum at relativePosition = 0 is ~ 100
  const baseScale = 400;
  const fieldThroughCoil = (orientation * strengthFactor * baseScale) / Math.pow(distSq, 1.5);

  // Analytical derivative d(field)/dx:
  // d/dx [ (x^2 + a^2)^(-3/2) ] = -3 * x * (x^2 + a^2)^(-5/2)
  const dFieldDx =
    (orientation * strengthFactor * baseScale * (-3 * relativePosition)) /
    Math.pow(distSq, 2.5);

  // dField/dt = dField/dx * dx/dt = dField/dx * relativeVelocity
  const rateOfChange = dFieldDx * relativeVelocity;

  // Faraday's Law proxy: inducedEffect proportional to -N * d(field)/dt
  // We scale turns: 25 -> 0.5, 50 -> 1.0, 100 -> 2.0
  const turnsFactor = config.coilTurns / 50;

  // Coupling constant to get realistic normalized percentages (-100% to +100%)
  const inductionGain = 0.20;
  let rawInduced = -rateOfChange * turnsFactor * inductionGain;

  // If both magnet and coil are moving together with identical speed, relativeVelocity = 0, rawInduced = 0.
  if (Math.abs(relativeVelocity) < 0.001) {
    rawInduced = 0;
  }

  // Clamp to [-100, 100]
  const clampedInduced = Math.max(-100, Math.min(100, rawInduced));
  const meterDeflection = Math.max(-1, Math.min(1, clampedInduced / 100));

  // Qualitative Descriptors
  const absField = Math.abs(fieldThroughCoil);
  let fieldStrengthDescriptor: 'Low' | 'Medium' | 'High' = 'Low';
  if (absField > 65) fieldStrengthDescriptor = 'High';
  else if (absField > 25) fieldStrengthDescriptor = 'Medium';

  const absChange = Math.abs(rateOfChange);
  let fieldChangeDescriptor: 'None' | 'Slow' | 'Fast' = 'None';
  if (absChange > 45) fieldChangeDescriptor = 'Fast';
  else if (absChange > 1.0) fieldChangeDescriptor = 'Slow';

  let currentDirectionDescriptor: '←' | '0' | '→' = '0';
  if (clampedInduced > 1.5) currentDirectionDescriptor = '→';
  else if (clampedInduced < -1.5) currentDirectionDescriptor = '←';

  return {
    magnetPosition: magnetPos,
    coilPosition: coilPos,
    relativePosition,
    magnetVelocity: magnetVel,
    coilVelocity: coilVel,
    relativeVelocity,
    fieldThroughCoil,
    rateOfChange,
    inducedCurrent: clampedInduced,
    meterDeflection,
    fieldStrengthDescriptor,
    fieldChangeDescriptor,
    currentDirectionDescriptor,
  };
}
