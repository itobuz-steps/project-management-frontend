import projectService from '../../services/ProjectService';
import { updateProjectList } from '../../pages/dashboard/sidebar/sidebar';
import showToast from '../showToast';
import renderSelectedTab from '../renderSelectedTab';
import { ifSelectedProject } from '../elementUtils';

const createProjectModal = document.getElementById('create-project-modal');
const closeProjectBtn = document.getElementById('close-button');
const projectCreateForm = document.getElementById('project-form');

const columnInputWrapper = document.getElementById(
  'project-columns-input-wrapper'
);
const columnInput = document.getElementById('project-columns');
const nameInput = document.getElementById('name');
const createProjectForm = document.getElementById('createProjectForm');

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
    if (!columnInput.previousElementSibling) return;
    columnInputWrapper.querySelector(':nth-last-child(2)').remove();
  }
});

projectCreateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const projectType = document.getElementById('projectType').value;
  let columns = ['todo', 'in-progress', 'done'];

  if (columnInputWrapper.children.length > 1) {
    columns = Array.from(columnInputWrapper.children)
      .slice(0, columnInputWrapper.children.length - 1)
      .map((tagEl) => {
        const text = tagEl.textContent;
        tagEl.remove();
        return text;
      });
  }
  const name = nameInput.value.trim();
  const projectData = {
    name,
    projectType,
    columns,
  };

  try {
    const project = (await projectService.createProject(projectData)).result;
    localStorage.setItem('selectedProject', project._id);
    await renderSelectedTab(localStorage.getItem('selectedProject'));
    ifSelectedProject();

    createProjectModal.classList.add('hidden');
    showToast('Project created Successfully', 'success');

    updateProjectList();
  } catch (error) {
    showToast(`${error.message}`, 'error');
  }
});

closeProjectBtn.addEventListener('click', () => {
  createProjectModal.classList.add('hidden');
  createProjectForm.reset();
  if (columnInputWrapper.children.length > 1) {
    Array.from(columnInputWrapper.children)
      .slice(0, columnInputWrapper.children.length - 1)
      .forEach((tagEl) => {
        tagEl.remove();
      });
  }
});

export function openCreateProjectModal() {
  createProjectModal.classList.remove('hidden');
}

function toggleOpenTemplates() {
  const dropDownButtons = document.querySelectorAll('.dropdownButton-template');
  dropDownButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const target = e.target;
      let dropdownIcon;
      let content;
      if (target.classList.contains('dropdown-icon-template')) {
        dropdownIcon = target;
        content = target.parentElement.parentElement.nextElementSibling;
      } else {
        dropdownIcon = target.querySelector('.dropdown-icon-template');
        content = target.parentElement.nextElementSibling;
      }

      if (dropdownIcon.classList.contains('-rotate-90')) {
        dropdownIcon.classList.remove('-rotate-90');
        content.classList.remove('hidden');
      } else {
        dropdownIcon.classList.add('-rotate-90');
        content.classList.add('hidden');
      }
    });
  });
}

function handleTemplateColumns() {
  const templates = document.querySelectorAll('.template');

  templates.forEach((template) => {
    template.addEventListener('click', () => {
      if (columnInputWrapper.children.length > 1) {
        Array.from(columnInputWrapper.children)
          .slice(0, columnInputWrapper.children.length - 1)
          .forEach((tagEl) => {
            tagEl.remove();
          });
      }

      const columns = template.dataset.value.split(',');
      columns.forEach((column) => {
        const div = document.createElement('div');
        div.textContent = column.trim();
        div.className =
          'bg-primary-400 flex items-center justify-center px-2 py-1 m-1 rounded-md text-white';
        columnInputWrapper.insertBefore(div, columnInput);
      });
      nameInput.value = template.querySelector('.project-name').innerText;
    });
  });
}

handleTemplateColumns();
toggleOpenTemplates();
