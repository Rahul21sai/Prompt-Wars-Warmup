import {
  TRAVEL_STYLES,
  DIETARY_OPTIONS,
  MOBILITY_OPTIONS,
  PARTY_TYPE_OPTIONS,
  INTEREST_OPTIONS
} from '../constants';

/** Type derived from travel style constants */
export type TravelStyle = typeof TRAVEL_STYLES[number];

/** Type derived from dietary option constants */
export type DietaryOption = typeof DIETARY_OPTIONS[number];

/** Type derived from mobility option constants */
export type MobilityOption = typeof MOBILITY_OPTIONS[number];

/** Type derived from party type constants */
export type PartyType = typeof PARTY_TYPE_OPTIONS[number];

/** Type derived from interest constants */
export type Interest = typeof INTEREST_OPTIONS[number];

/** Form data structure */
export interface TravelPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  partyType: PartyType;
  partySize: number;
  style: TravelStyle;
  dietary: DietaryOption;
  mobility: MobilityOption;
  interests: Interest[];
}
