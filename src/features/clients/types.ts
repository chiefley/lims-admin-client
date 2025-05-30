// src/features/clients/types.ts
/**
 * Client license category
 */
export interface ClientLicenseCategory {
  /**
   * Primary Key. No display, no edit.
   */
  clientLicenseCategoryId: number;

  /**
   * @validation Uniqueness constraint(Name).
   */
  name: string;

  description?: string;

  /**
   * Set to true on new
   */
  active: boolean;
}

// Backward compatibility aliases
export type ClientLicenseCategoryRs = ClientLicenseCategory;

/**
 * Client state license
 */
export interface ClientStateLicense {
  /**
   * Primary key. No display, no edit
   */
  clientStateLicenseId: number;

  name: string;

  /**
   * @validation Uniqueness constraint(LicenseNumber)
   */
  licenseNumber: string;

  /**
   * Dropdown control. Values come from ConfigurationManagementSelectors.ClientLicenseTypes
   */
  clientLicenseTypeId: number;

  ccLicenseId?: number;

  /**
   * Set to true on new
   */
  active: boolean;
}

// Backward compatibility aliases
export type ClientStateLicenseRs = ClientStateLicense;

/**
 * Client license type
 */
export interface ClientLicenseType {
  /**
   * Primary Key. No display, no edit.
   */
  clientLicenseTypeId: number;

  /**
   * @validation Unique Constraint(Name, StateId).
   */
  name: string;

  description?: string;

  licenseFormat?: string;

  /**
   * No display, no edit.
   * Set to StateId from context on new()
   * @validation Unique Constraint(Name, StateId).
   */
  stateId: number;

  /**
   * Dropdown control. Value comes from ConfigurationManagementSelectors.ClientLicenseCategories.
   */
  clientLicenseCategoryId: number;

  /**
   * Set to true on new
   */
  active: boolean;
}

// Backward compatibility aliases
export type ClientLicenseTypeRs = ClientLicenseType;

/**
 * Client pricing information
 */
export interface ClientPricing {
  /**
   * Primary Key. No display, no edit.
   */
  clientPricingId: number;

  /**
   * @validation Uniqueness Constraint(PanelId, ClientId)
   */
  clientId: number;

  /**
   * Dropdown Control. Selections come from ConfigurationManagementSelectors.Panel
   * @validation Uniqueness Constraint(PanelId, ClientId)
   */
  panelId: number;

  value?: number;

  isPercent: boolean;
}

// Backward compatibility aliases
export type ClientPricingRs = ClientPricing;

/**
 * Client information
 */
export interface Client {
  /**
   * Primary Key. No display, no edit.
   */
  clientId: number;

  /**
   * @validation Uniqueness constraint(Name).
   */
  name: string;

  /**
   * @validation Uniqueness constraint(DbaName) if not null.
   */
  dbaName?: string;

  address1?: string;

  address2?: string;

  ccClientId?: number;

  ccPrimaryAddressId?: number;

  city?: string;

  contactFirstName?: string;

  contactLastName?: string;

  email?: string;

  phone?: string;

  /**
   * @maxLength 10
   */
  postalCode?: string;

  limsClientApiID?: string;

  limsClientApiKey?: string;

  /**
   * Set to true on new
   */
  active: boolean;

  /**
   * Client's state licenses
   */
  clientStateLicenseRss: ClientStateLicense[];

  /**
   * Client's pricing information
   */
  clientPricingRss: ClientPricing[];
}

// Backward compatibility aliases
export type ClientRs = Client;
