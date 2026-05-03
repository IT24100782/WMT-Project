import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';

export interface Feedback {
  _id: string;
  rating: number;
  comment: string;
  noteId: string;
  userId: string;
  updatedAt: string;
  createdAt: string;
}

interface FeedbackContextProps {
  feedbackList: Feedback[];
  isLoading: boolean;
  error: string | null;
  fetchFeedback: () => Promise<void>;
  addFeedback: (rating: number, comment: string, noteId: string) => Promise<boolean>;
  updateFeedback: (id: string, rating: number, comment: string, noteId: string) => Promise<boolean>;
  deleteFeedback: (id: string) => Promise<boolean>;
}

export const FeedbackContext = createContext<FeedbackContextProps | undefined>(undefined);

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/feedback');
      setFeedbackList(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const addFeedback = async (rating: number, comment: string, noteId: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/feedback', { rating, comment, noteId });
      setFeedbackList((prev) => [response.data, ...prev]);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add feedback';
      setError(errorMessage);
      import('react-native').then(rn => rn.Alert.alert('Backend Error', errorMessage));
      return false;
    }
  };

  const updateFeedback = async (id: string, rating: number, comment: string, noteId: string): Promise<boolean> => {
    try {
      const response = await apiClient.put(`/feedback/${id}`, { rating, comment, noteId });
      setFeedbackList((prev) => prev.map(f => (f._id === id ? response.data : f)));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update feedback');
      return false;
    }
  };

  const deleteFeedback = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/feedback/${id}`);
      setFeedbackList((prev) => prev.filter(f => f._id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete feedback');
      return false;
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <FeedbackContext.Provider value={{ feedbackList, isLoading, error, fetchFeedback, addFeedback, updateFeedback, deleteFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};
