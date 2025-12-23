import projectService from '../../services/ProjectService';
import { updateProjectList } from '../../pages/dashboard/sidebar/sidebar';

const createProjectModal = document.getElementById('create-project-modal');
const closeProjectBtn = document.getElementById('close-button');
const projectCreateForm = document.getElementById('project-form');

projectCreateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const projectType = document.getElementById('projectType').value;
  const columnInput = document.getElementById('project-columns').value;

  let columns = ['todo', 'in-progress', 'done'];
  if (columnInput) {
    columns = columnInput
      .split(',')
      .map((col) => col.trim())
      .filter((col) => col.length > 0);
  }

  const projectData = {
    name,
    projectType,
    columns,
  };

  try {
    await projectService.createProject(projectData);
    createProjectModal.classList.add('hidden');
    updateProjectList();
  } catch (error) {
    console.error(error.message);
  }
});

closeProjectBtn.addEventListener('click', () => {
  createProjectModal.classList.add('hidden');
});

export function openCreateProjectModal() {
  createProjectModal.classList.remove('hidden');
}
