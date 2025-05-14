/**
 * Client-related interfaces for the configuration management module
 * Based on the C# Response objects in the Clients namespace
 */

/**
 * Interface for client license category
 */
export interface IClientLicenseCategory {
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

/**
 * Interface for client state license
 */
export interface IClientStateLicense {
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

/**
 * Interface for client license type
 */
export interface IClientLicenseType {
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

/**
 * Interface for client information
 */
export interface IClient {
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
  clientStateLicenseRss: IClientStateLicense[];
}
