import projectService from '../../services/ProjectService';
import { updateProjectList } from '../../pages/dashboard/sidebar/sidebar';
import showToast from '../showToast';

const createProjectModal = document.getElementById('create-project-modal');
const closeProjectBtn = document.getElementById('close-button');
const projectCreateForm = document.getElementById('project-form');

const columnInputWrapper = document.getElementById(
  'project-columns-input-wrapper'
);
const columnInput = document.getElementById('project-columns');

columnInput.addEventListener('input', () => {
  if (!columnInput.value.endsWith(' ')) {
    return;
  }

  if (columnInput.value === ' ') {
    columnInput.value = '';
    return;
  }

  const div = document.createElement('div');
  div.textContent = columnInput.value.slice(0, columnInput.value.length - 1);
  div.className =
    'bg-primary-400 flex items-center justify-center px-2 m-1 rounded-md text-white';
  columnInputWrapper.insertBefore(div, columnInput);
  columnInput.value = '';
});

columnInput.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' && columnInput.value === '') {
    columnInputWrapper.querySelector(':nth-last-child(2)').remove();
  }
});

projectCreateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const projectType = document.getElementById('projectType').value;
  let columns = ['todo', 'in-progress', 'done'];

  if (columnInputWrapper.children.length > 1) {
    columns = Array.from(columnInputWrapper.children)
      .map((tagEl) => tagEl.textContent)
      .slice(0, columnInputWrapper.children.length - 1);
  }

  const projectData = {
    name,
    projectType,
    columns,
  };

  try {
    await projectService.createProject(projectData);
    createProjectModal.classList.add('hidden');
    showToast('Project created Successfully', 'success');
    updateProjectList();
  } catch (error) {
    showToast(`${error.message}`, 'error');
  }
});

closeProjectBtn.addEventListener('click', () => {
  createProjectModal.classList.add('hidden');
});

export function openCreateProjectModal() {
  createProjectModal.classList.remove('hidden');
}
