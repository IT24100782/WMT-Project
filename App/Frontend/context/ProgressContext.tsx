import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';

export interface Progress {
  _id: string;
  userId: string;
  totalTasks: number;
  completedTasks: number;
  studyHours: number;
  createdAt: string;
  updatedAt: string;
}

interface ProgressContextProps {
  progress: Progress | null;
  isLoading: boolean;
  error: string | null;
  fetchProgress: () => Promise<void>;
  createProgress: (totalTasks: number, completedTasks: number, studyHours: number) => Promise<Progress | null>;
  updateProgress: (id: string, totalTasks: number, completedTasks: number, studyHours: number) => Promise<boolean>;
  deleteProgress: (id: string) => Promise<boolean>;
}

export const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/progress');
      // getProgress returns an array descending by createdAt
      const progressRecords = response.data;
      if (Array.isArray(progressRecords) && progressRecords.length > 0) {
        setProgress(progressRecords[0]);
      } else if (progressRecords && progressRecords._id) {
        // Handle fallback if backend dynamically returns a solitary object
        setProgress(progressRecords);
      } else {
        setProgress(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch progress');
    } finally {
      setIsLoading(false);
    }
  };

  const createProgress = async (totalTasks: number, completedTasks: number, studyHours: number): Promise<Progress | null> => {
    try {
      const payload = { totalTasks, completedTasks, studyHours };
      const response = await apiClient.post('/progress', payload);
      setProgress(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create progress';
      setError(errorMessage);
      import('react-native').then(rn => rn.Alert.alert('Backend Error', errorMessage));
      return null;
    }
  };

  const updateProgress = async (id: string, totalTasks: number, completedTasks: number, studyHours: number): Promise<boolean> => {
    try {
      const payload = { totalTasks, completedTasks, studyHours };
      const response = await apiClient.put(`/progress/${id}`, payload);
      setProgress(response.data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update progress');
      return false;
    }
  };

  const deleteProgress = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/progress/${id}`);
      setProgress(null);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete progress');
      return false;
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <ProgressContext.Provider value={{ progress, isLoading, error, fetchProgress, createProgress, updateProgress, deleteProgress }}>
      {children}
    </ProgressContext.Provider>
  );
};
