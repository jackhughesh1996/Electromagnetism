export type SimulationMode = 'wire' | 'coil' | 'solenoid' | 'electromagnet';

export interface SimulationConfig {
  mode: SimulationMode;
  current: number; // in Amperes (-10 to +10)
  wireRadius: number;
  // Coil / Solenoid specifics
  coilRadius: number;
  solenoidLength: number;
  solenoidTurns: number;
  hasIronCore: boolean;
  ironCorePermeability: number; // e.g. 50-200x boost representation
  // Visualization toggles
  fieldLinesCount: number; // density
  showFieldLines: boolean;
  showFilingsPlane: boolean;
  filingsPlaneAxis: 'xz' | 'xy' | 'yz';
  filingsPlaneOffset: number;
  filingsDensity: number;
  showCompassProbe: boolean;
  probePosition: [number, number, number];
  showCurrentParticles: boolean;
  showRightHandRule: boolean;
  showPoles: boolean;
  fieldLineSpeed: number;
  sliceCutaway: boolean;
  particleType?: 'electrons' | 'conventional';
  cellCount?: number;
  switchClosed?: boolean;
  showCircuit?: boolean;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface FieldMeasurement {
  position: Vector3D;
  bVector: Vector3D;
  magnitude: number;
  direction?: Vector3D;
}

export type ActiveLesson = 'L3' | 'L4';

export interface MotorConfig {
  mode: 'motor' | 'single_wire';
  current: number; // 0 for off, or e.g. 2.0, 4.0, 6.0 A
  switchClosed: boolean;
  batteryReversed: boolean;
  magnetStrength: 'standard' | 'strong'; // 1.0 vs 2.0
  magnetGap: 'narrow' | 'normal' | 'wide'; // 2.0, 2.6, 3.4
  coilTurns: 20 | 40 | 60;
  hasCommutator: boolean; // Split ring enabled (true) vs continuous/disabled (false)
  showPermanentField: boolean;
  showCoilField: boolean;
  showForceArrows: boolean;
  showSymbols: boolean; // • (out) and × (in)
  showElectronFlow: boolean;
  particleType: 'electrons' | 'conventional';
  speedMultiplier: number; // 1.0 = normal, 0.25 = slow motion
  frozenAngle: number | null; // in degrees (null if rotating freely)
  isPlaying: boolean;
  viewMode?: 'apparatus' | 'fields' | 'forces';
  highlightSides?: boolean;
}

export interface MotorState {
  angleDeg: number;
  angularVelocity: number;
  torque: number;
  relativeTurningEffect: number; // 0 to 100%
  leftBranchCurrentDir: 1 | -1 | 0; // 1 = +z (forward), -1 = -z (backward), 0 = none/gap
  rightBranchCurrentDir: 1 | -1 | 0;
  leftForce: Vector3D;
  rightForce: Vector3D;
  commutatorSwapped: boolean;
  inDeadZone: boolean;
}
