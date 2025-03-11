import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notesData = await AsyncStorage.getItem('workNotes');
      if (notesData) {
        setNotes(JSON.parse(notesData));
      } else {
        setNotes([]);
      }
    } catch (e) {
      console.error('Failed to load notes', e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (note) => {
    try {
      const newNote = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...note,
      };
      
      const updatedNotes = [...notes, newNote];
      await AsyncStorage.setItem('workNotes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      return true;
    } catch (e) {
      console.error('Failed to add note', e);
      return false;
    }
  };

  const updateNote = async (updatedNote) => {
    try {
      const updatedNotes = notes.map(note => 
        note.id === updatedNote.id ? { ...note, ...updatedNote } : note
      );
      await AsyncStorage.setItem('workNotes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      return true;
    } catch (e) {
      console.error('Failed to update note', e);
      return false;
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      await AsyncStorage.setItem('workNotes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      return true;
    } catch (e) {
      console.error('Failed to delete note', e);
      return false;
    }
  };

  const getRecentNotes = (limit = 3) => {
    // Sort notes by reminder time, most recent first
    return [...notes]
      .sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime))
      .slice(0, limit);
  };

  return (
    <NotesContext.Provider value={{
      notes,
      loading,
      addNote,
      updateNote,
      deleteNote,
      getRecentNotes,
      refreshNotes: loadNotes
    }}>
      {children}
    </NotesContext.Provider>
  );
};