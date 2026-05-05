import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';

export interface Resource {
  _id: string;
  title: string;
  link: string;
  description: string;
  courseId?: string;
  userId: string;
  updatedAt: string;
  createdAt: string;
}

interface ResourceContextProps {
  resources: Resource[];
  isLoading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
  addResource: (title: string, link: string, description: string, courseId?: string) => Promise<boolean>;
  updateResource: (id: string, title: string, link: string, description: string, courseId?: string) => Promise<boolean>;
  deleteResource: (id: string) => Promise<boolean>;
}

export const ResourceContext = createContext<ResourceContextProps | undefined>(undefined);

export const ResourceProvider = ({ children }: { children: ReactNode }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/resources');
      const fetchedResources = response.data.sort((a: Resource, b: Resource) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setResources(fetchedResources);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch resources');
    } finally {
      setIsLoading(false);
    }
  };

  const addResource = async (title: string, link: string, description: string, courseId?: string): Promise<boolean> => {
    try {
      const payload: any = { title, link, description };
      if (courseId) payload.courseId = courseId;
      
      const response = await apiClient.post('/api/resources', payload);
      setResources((prev) => [response.data, ...prev]);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add resource';
      setError(errorMessage);
      import('react-native').then(rn => rn.Alert.alert('Backend Error', errorMessage));
      return false;
    }
  };

  const updateResource = async (id: string, title: string, link: string, description: string, courseId?: string): Promise<boolean> => {
    try {
      const payload: any = { title, link, description };
      if (courseId) payload.courseId = courseId;
      
      const response = await apiClient.put(`/api/resources/${id}`, payload);
      setResources((prev) => {
        const updated = prev.map(r => (r._id === id ? response.data : r));
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update resource');
      return false;
    }
  };

  const deleteResource = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/resources/${id}`);
      setResources((prev) => prev.filter(r => r._id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete resource');
      return false;
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <ResourceContext.Provider value={{ resources, isLoading, error, fetchResources, addResource, updateResource, deleteResource }}>
      {children}
    </ResourceContext.Provider>
  );
};
