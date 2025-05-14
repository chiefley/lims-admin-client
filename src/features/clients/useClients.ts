// src/features/clients/useClients.ts
import { useState, useEffect } from 'react';

import { message } from 'antd';

import { DEFAULT_LAB_ID } from '../../api/config';

import clientService from './clientService';
import { ClientRs, ClientLicenseCategoryRs, ClientLicenseTypeRs } from './types';

/**
 * Hook for managing clients data
 */
export const useClients = (labId: number = DEFAULT_LAB_ID) => {
  const [clients, setClients] = useState<ClientRs[]>([]);
  const [clientLicenseCategories, setClientLicenseCategories] = useState<ClientLicenseCategoryRs[]>(
    []
  );
  const [clientLicenseTypes, setClientLicenseTypes] = useState<ClientLicenseTypeRs[]>([]);
  const [loading, setLoading] = useState({
    clients: false,
    clientLicenseCategories: false,
    clientLicenseTypes: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch clients
  const fetchClients = async () => {
    setLoading(prev => ({ ...prev, clients: true }));
    setError(null);
    try {
      const data = await clientService.fetchClients(labId);
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clients');
      message.error('Failed to fetch clients');
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  // Fetch client license categories
  const fetchClientLicenseCategories = async () => {
    setLoading(prev => ({ ...prev, clientLicenseCategories: true }));
    setError(null);
    try {
      const data = await clientService.fetchClientLicenseCategories();
      setClientLicenseCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch client license categories');
      message.error('Failed to fetch client license categories');
    } finally {
      setLoading(prev => ({ ...prev, clientLicenseCategories: false }));
    }
  };

  // Fetch client license types
  const fetchClientLicenseTypes = async (stateId: number = 2) => {
    setLoading(prev => ({ ...prev, clientLicenseTypes: true }));
    setError(null);
    try {
      const data = await clientService.fetchClientLicenseTypes(stateId);
      setClientLicenseTypes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch client license types');
      message.error('Failed to fetch client license types');
    } finally {
      setLoading(prev => ({ ...prev, clientLicenseTypes: false }));
    }
  };

  // Save clients
  const saveClients = async (updatedClients: ClientRs[]) => {
    setLoading(prev => ({ ...prev, clients: true }));
    setError(null);
    try {
      const data = await clientService.upsertClients(updatedClients, labId);
      setClients(data);
      message.success('Clients saved successfully');
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to save clients');
      message.error('Failed to save clients');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  // Save client license categories
  const saveClientLicenseCategories = async (updatedCategories: ClientLicenseCategoryRs[]) => {
    setLoading(prev => ({ ...prev, clientLicenseCategories: true }));
    setError(null);
    try {
      const data = await clientService.upsertClientLicenseCategories(updatedCategories);
      setClientLicenseCategories(data);
      message.success('Client license categories saved successfully');
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to save client license categories');
      message.error('Failed to save client license categories');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, clientLicenseCategories: false }));
    }
  };

  // Save client license types
  const saveClientLicenseTypes = async (
    updatedTypes: ClientLicenseTypeRs[],
    stateId: number = 2
  ) => {
    setLoading(prev => ({ ...prev, clientLicenseTypes: true }));
    setError(null);
    try {
      const data = await clientService.upsertClientLicenseTypes(updatedTypes, stateId);
      setClientLicenseTypes(data);
      message.success('Client license types saved successfully');
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to save client license types');
      message.error('Failed to save client license types');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, clientLicenseTypes: false }));
    }
  };

  // Initialize data
  useEffect(() => {
    fetchClients();
    fetchClientLicenseCategories();
    fetchClientLicenseTypes();
  }, [labId]);

  return {
    clients,
    clientLicenseCategories,
    clientLicenseTypes,
    loading,
    error,
    fetchClients,
    fetchClientLicenseCategories,
    fetchClientLicenseTypes,
    saveClients,
    saveClientLicenseCategories,
    saveClientLicenseTypes,
  };
};

export default useClients;
