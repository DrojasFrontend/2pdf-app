import { useState, useEffect } from 'react';
import { getUserProjects, createProject, getProject, updateProject, deleteProject } from '../lib/projects';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const saveProject = async ({ name, slug, description }) => {
    try {
      const result = await createProject({ name, slug, description });
      await fetchProjects(); // Refrescar la lista
      return result;
    } catch (err) {
      throw err;
    }
  };

  const loadProject = async (projectId) => {
    try {
      const project = await getProject(projectId);
      return project;
    } catch (err) {
      throw err;
    }
  };

  const updateProjectAction = async (projectId, { name, slug, description }) => {
    try {
      const result = await updateProject(projectId, { name, slug, description });
      await fetchProjects(); // Refrescar la lista
      return result;
    } catch (err) {
      throw err;
    }
  };

  const removeProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      await fetchProjects(); // Refrescar la lista
    } catch (err) {
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    saveProject,
    loadProject,
    updateProject: updateProjectAction,
    removeProject,
    refreshProjects: fetchProjects,
  };
}

