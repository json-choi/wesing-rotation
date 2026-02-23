export type RoleId =
  | 'worship_leader'
  | 'lead_synth'
  | 'aux_synth'
  | 'bass_g'
  | 'electric_g'
  | 'acoustic_g'
  | 'drum'
  | 'sound_engineer'
  | 'singers';

export type RoleSection = 'instruments' | 'rhythm';

export interface RoleDef {
  id: RoleId;
  label: string;
  section: RoleSection;
}

// Section 1: Instrument row (6 columns, matches the Notion table layout)
export const INSTRUMENT_ROLES: RoleDef[] = [
  { id: 'lead_synth', label: 'Lead Synth', section: 'instruments' },
  { id: 'aux_synth', label: 'Aux Synth', section: 'instruments' },
  { id: 'bass_g', label: 'Bass G.', section: 'instruments' },
  { id: 'electric_g', label: 'Electric G.', section: 'instruments' },
  { id: 'acoustic_g', label: 'Acoustic G.', section: 'instruments' },
  { id: 'worship_leader', label: 'Worship Leader', section: 'instruments' },
];

// Section 2: Rhythm/Support row
export const RHYTHM_ROLES: RoleDef[] = [
  { id: 'drum', label: 'Drum', section: 'rhythm' },
  { id: 'sound_engineer', label: 'Sound Engineer', section: 'rhythm' },
  { id: 'singers', label: 'Singers', section: 'rhythm' },
];

export const ALL_ROLES: RoleDef[] = [...INSTRUMENT_ROLES, ...RHYTHM_ROLES];
