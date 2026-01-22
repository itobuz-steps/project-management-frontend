import projectService from '../../services/ProjectService';
import {
  updateProjectList,
  updateUserList,
} from '../../pages/dashboard/sidebar/sidebar';
import showToast from '../showToast';
import renderSelectedTab from '../renderSelectedTab';
import { ifSelectedProject } from '../elementUtils';

const createProjectModal = document.getElementById(
  'create-project-modal'
) as HTMLElement | null;

const closeProjectBtn = document.getElementById(
  'close-button'
) as HTMLElement | null;

const projectCreateForm = document.getElementById(
  'project-form'
) as HTMLFormElement | null;

const columnInputWrapper = document.getElementById(
  'project-columns-input-wrapper'
) as HTMLElement | null;

const columnInput = document.getElementById(
  'project-columns'
) as HTMLInputElement | null;

const nameInput = document.getElementById('name') as HTMLInputElement | null;

const createProjectForm = document.getElementById(
  'createProjectForm'
) as HTMLFormElement | null;

columnInput?.addEventListener('input', () => {
  if (!columnInput || !columnInputWrapper) return;

  if (!columnInput.value.endsWith(' ')) return;

  if (columnInput.value === ' ') {
    columnInput.value = '';
    return;
  }

  const div = document.createElement('div');
  div.textContent = columnInput.value.slice(0, -1);
  div.className =
    'bg-primary-400 flex items-center justify-center px-2 m-1 rounded-md text-white';

  columnInputWrapper.insertBefore(div, columnInput);
  columnInput.value = '';
});

columnInput?.addEventListener('keydown', (e: KeyboardEvent) => {
  if (!columnInput || !columnInputWrapper) return;

  if (e.key === 'Backspace' && columnInput.value === '') {
    const el = columnInputWrapper.querySelector(':nth-last-child(2)');
    el?.remove();
  }
});

projectCreateForm?.addEventListener('submit', async (e: SubmitEvent) => {
  e.preventDefault();
  if (!columnInputWrapper || !nameInput || !createProjectModal) return;

  const projectTypeEl = document.getElementById(
    'projectType'
  ) as HTMLSelectElement | null;

  const projectType = projectTypeEl?.value ?? '';

  let columns: string[] = ['todo', 'in-progress', 'done'];

  if (columnInputWrapper.children.length > 1) {
    columns = Array.from(columnInputWrapper.children)
      .slice(0, columnInputWrapper.children.length - 1)
      .map((tagEl) => {
        const text = tagEl.textContent ?? '';
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

    if (!project._id) {
      throw new Error('Project ID missing from response');
    }

    localStorage.setItem('selectedProject', project._id);
    await renderSelectedTab(project._id);

    ifSelectedProject();

    createProjectModal.classList.add('hidden');
    showToast('Project created Successfully', 'success');

    updateProjectList();
    updateUserList();
  } catch (error: any) {
    showToast(error?.message ?? 'Something went wrong', 'error');
  }
});

closeProjectBtn?.addEventListener('click', () => {
  if (!createProjectModal || !createProjectForm || !columnInputWrapper) return;

  createProjectModal.classList.add('hidden');
  createProjectForm.reset();

  if (columnInputWrapper.children.length > 1) {
    Array.from(columnInputWrapper.children)
      .slice(0, columnInputWrapper.children.length - 1)
      .forEach((tagEl) => tagEl.remove());
  }
});

export function openCreateProjectModal(): void {
  createProjectModal?.classList.remove('hidden');
}

function toggleOpenTemplates(): void {
  const dropDownButtons = document.querySelectorAll<HTMLElement>(
    '.dropdownButton-template'
  );

  dropDownButtons.forEach((button) => {
    button.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      let dropdownIcon: HTMLElement | null;
      let content: HTMLElement | null;

      if (target.classList.contains('dropdown-icon-template')) {
        dropdownIcon = target;
        content = target.parentElement?.parentElement
          ?.nextElementSibling as HTMLElement | null;
      } else {
        dropdownIcon = target.querySelector('.dropdown-icon-template');
        content = target.parentElement
          ?.nextElementSibling as HTMLElement | null;
      }

      if (!dropdownIcon || !content) return;

      const isOpen = dropdownIcon.classList.contains('-rotate-90');
      dropdownIcon.classList.toggle('-rotate-90', !isOpen);
      content.classList.toggle('hidden', isOpen);
    });
  });
}

function handleTemplateColumns(): void {
  const templates = document.querySelectorAll<HTMLElement>('.template');

  templates.forEach((template) => {
    template.addEventListener('click', () => {
      if (!columnInputWrapper || !columnInput || !nameInput) return;

      if (columnInputWrapper.children.length > 1) {
        Array.from(columnInputWrapper.children)
          .slice(0, columnInputWrapper.children.length - 1)
          .forEach((tagEl) => tagEl.remove());
      }

      const value = template.dataset.value;
      if (!value) return;

      value.split(',').forEach((column) => {
        const div = document.createElement('div');
        div.textContent = column.trim();
        div.className =
          'bg-primary-400 flex items-center justify-center px-2 py-1 m-1 rounded-md text-white';

        columnInputWrapper.insertBefore(div, columnInput);
      });

      const projectNameEl = template.querySelector(
        '.project-name'
      ) as HTMLElement | null;

      if (projectNameEl) {
        nameInput.value = projectNameEl.innerText;
      }
    });
  });
}

handleTemplateColumns();
toggleOpenTemplates();
