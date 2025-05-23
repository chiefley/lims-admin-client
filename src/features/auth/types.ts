// src/features/auth/types.ts

/**
 * UserLab Response
 *
 * Represents a laboratory that a user has access to.
 * This is an advanced selector - no editing capabilities.
 *
 * API Endpoints:
 * - GET: /configurationmaintenance/FetchUserLabRss/{labId}
 */
export interface UserLab {
  /**
   * Primary key identifier
   * @ui No display, not editable
   */
  userLabId: number;

  /**
   * User identifier
   * @ui No display, not editable
   */
  userId: number;

  /**
   * Laboratory identifier
   * @ui No display, not editable
   */
  labId: number;

  /**
   * Name of the laboratory
   * @ui Display only
   */
  labName: string;

  /**
   * State identifier
   * @ui No display, not editable
   */
  stateId: number;

  /**
   * State abbreviation (e.g., "CA", "NY")
   * @ui Display only
   */
  stateAbbreviation: string;

  /**
   * Whether this is the user's default laboratory
   * @ui Display only
   */
  isDefaultLab: boolean;
}

// Backward compatibility alias
export type UserLabRs = UserLab;

/**
 * Enhanced user interface that includes laboratory access information
 */
export interface UserWithLabs {
  username: string;
  roles: string[];
  userLabs: UserLab[];
  defaultLab?: UserLab;
}
