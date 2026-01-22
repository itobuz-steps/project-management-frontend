import taskService from '../../../services/TaskService';
import { createTaskList } from '../../../utils/renderTasks';
import { checkIfEmpty, toggleHidden } from '../../../utils/elementUtils';
import { addDragEvent } from '../../../utils/dragAndDropHandler';
import sprintService from '../../../services/SprintService';
import projectService from '../../../services/ProjectService';
import { renderBacklogView } from './renderBacklogView';
import type { Project, Sprint, Task } from '../../../interfaces/common';

export function createSprintTable(sprint: Sprint) {
  const sprintContainer = document.createElement('div');

  sprintContainer.dataset.id = sprint._id;
  sprintContainer.className = ' p-1 rounded-t';
  sprintContainer.innerHTML = /* HTML */ `
    <div
      class="relative flex flex-wrap items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-2 text-left shadow-sm"
    >
      <div class="flex flex-1 flex-col md:flex-row">
        <button
          type="button"
          class="dropdownButton flex w-full flex-1 cursor-pointer items-center gap-3 rounded-md text-lg font-semibold focus:outline-none md:w-fit"
          id="dropdownButton-${sprint.key}"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <svg
            id="dropdown-icon-${sprint.key}"
            class="dropdown-icon-${sprint.key} mt-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 7l7 7 7-7"
            ></path>
          </svg>
          <p class="text-nowrap">${sprint.key}</p>
          <div
            class="${sprint.dueDate ? '' : 'hidden'} flex items-center gap-1"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-primary-400 h-3 w-3"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M12 7V12L14.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="inherit"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </g>
            </svg>
            <p
              id="${sprint.key}-due-date-preview"
              class="due-date text-primary-400 text-center text-xs font-semibold"
            ></p>
          </div>
        </button>
      </div>

      <div class="flex flex-col md:flex-row md:items-center md:gap-3">
        <form
          class="flex hidden h-7.5 gap-1 md:justify-end"
          id="${sprint.key}-start-form"
        >
          <input
            type="date"
            name="dueDate"
            id="${sprint.key}-due-date"
            class="required focus:border-primary-400 w-28 cursor-pointer rounded-sm border border-gray-200 bg-white px-1 text-sm shadow-xs outline-none md:w-30"
            placeholder="Enter the due date"
          />

          <button
            type="submit"
            id="${sprint.key}-start-form-button"
            class="bg-primary-400 hover:bg-primary-500 w-20 cursor-pointer rounded-sm px-2 py-1 font-medium text-white shadow-xs focus:outline-none"
          >
            Confirm
          </button>
          <svg
            id="${sprint.key}-start-close-svg"
            class="cursor-pointer stroke-black hover:stroke-red-400 hover:stroke-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M16 8L8 16M8.00001 8L16 16"
                stroke="inherit"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </g>
          </svg>
        </form>

        <button
          type="button"
          id="${sprint.key}-sprint-complete-button"
          class="bg-primary-400 hover:bg-primary-500 hidden cursor-pointer rounded-sm px-2 py-1 font-medium text-white shadow-xs focus:outline-none"
        >
          Complete Sprint
        </button>
        <button
          type="button"
          id="${sprint.key}-sprint-start-button"
          class="bg-primary-400 hover:bg-primary-500 cursor-pointer rounded-sm px-2 py-1 font-medium text-white shadow-xs focus:outline-none"
        >
          Start Sprint
        </button>
      </div>
    </div>

    <div
      class="dropdown-menu-${sprint.key} no-scrollbar relative my-2 overflow-x-auto rounded-md border border-gray-200"
    >
      <table class="w-full text-left rtl:text-right">
        <thead
          class="border-b border-l-3 border-gray-200 border-l-gray-100 bg-gray-100 text-xs text-nowrap uppercase hover:border-l-gray-200 hover:bg-gray-200"
        >
          <tr>
            <th scope="col" class="p-2 text-center">Type</th>
            <th scope="col" class="p-2">Key</th>
            <th scope="col" class="min-w-48 p-2">Summary</th>
            <th scope="col" class="min-w-14 p-2">Status</th>
            <th scope="col" class="px-6 py-3">Sprint</th>
            <th scope="col" class="min-w-48 p-2">Assignee</th>
            <th scope="col" class="p-2">Due Date</th>
            <th scope="col" class="min-w-36 p-2">Labels</th>
            <th scope="col" class="p-2">Created</th>
            <th scope="col" class="p-2">Updated</th>
            <th scope="col" class="min-w-36 p-2">Reporter</th>
            <th scope="col" class="min-w-px p-2"></th>
          </tr>
        </thead>
        <tbody id="${sprint.key}-body" data-id="${sprint._id}"></tbody>
      </table>
    </div>
    <div
      class="empty-message hover:border-primary-600 hover:text-primary-400 flex hidden h-15 w-full items-center justify-center rounded-lg border border-dotted text-center font-semibold text-gray-400"
      id="${sprint.key}-empty-message"
      data-id="${sprint._id}"
    >
      Drop tasks here...
    </div>

    <div class="flex w-full justify-center" id="${sprint.key}-loader">
      <svg viewBox="25 25 50 50" class="loader">
        <circle r="20" cy="50" cx="50"></circle>
      </svg>
    </div>
  `;
  return sprintContainer;
}

export async function renderSprintTasks(
  sprint: Sprint,
  sprintTasks: string[],
  projectType: string
) {
  let promiseArray = [];
  const sprintTaskBody = document.getElementById(
    `${sprint.key}-body`
  ) as HTMLTableSectionElement | null;

  if (!sprintTaskBody) {
    return;
  }

  for (const taskId of sprintTasks) {
    const task = await taskService.getTaskById(taskId);
    promiseArray.push(
      createTaskList(task.data.result, '', projectType, sprint)
    );
  }

  const loader = document.getElementById(
    `${sprint.key}-loader`
  ) as HTMLElement | null;

  sprintTaskBody.classList.add('hidden');
  const allTrs = await Promise.all(promiseArray);

  loader?.classList.add('hidden');
  sprintTaskBody.classList.remove('hidden');

  addDragEvent(sprintTaskBody, allTrs, sprint);

  checkIfEmpty();
}

export async function handleSprintCreate(
  storyPointInput: HTMLInputElement | null
) {
  const projectId = localStorage.getItem('selectedProject');
  if (!projectId || !storyPointInput) return;

  const storyPoint = Number(storyPointInput.value);
  if (Number.isNaN(storyPoint)) return;

  const newSprint = {
    projectId,
    storyPoint,
  };

  await sprintService.createSprint(newSprint);
  await renderBacklogView(projectId);
}

export async function handleCompleteSprint(sprintId: string, project: Project) {
  const sprint = await sprintService.getSprintById(sprintId);

  let completedTasks = [];
  sprint.result.tasks.forEach((task: Task) => {
    if (task.status === project.columns[project.columns.length - 1]) {
      completedTasks.push(task);
    }
  });

  await sprintService.updateSprint(sprintId, { isCompleted: true, tasks: [] });
  if (project._id) {
    await projectService.updateProject(project._id, { currentSprint: null });
  }

  const projectId = localStorage.getItem('selectedProject');
  if (projectId) {
    await renderBacklogView(projectId);
  }

  handleDashboardSprintPreview();
}

export async function handleStartSprint(sprint: Sprint) {
  const startSprintButton = document.getElementById(
    `${sprint.key}-sprint-start-button`
  ) as HTMLButtonElement | null;
  const sprintStartCloseSvg = document.getElementById(
    `${sprint.key}-start-close-svg`
  ) as SVGSVGElement | null;
  const startSprintForm = document.getElementById(
    `${sprint.key}-start-form`
  ) as HTMLFormElement | null;
  const dueDateInput = document.getElementById(
    `${sprint.key}-due-date`
  ) as HTMLInputElement | null;
  const startSprintSubmitButton = document.getElementById(
    `${sprint.key}-start-form-button`
  ) as HTMLButtonElement | null;
  const completeSprintButton = document.getElementById(
    `${sprint.key}-sprint-complete-button`
  ) as HTMLButtonElement | null;

  const projectId = localStorage.getItem('selectedProject');
  if (!projectId) return;

  const projectResponse = await projectService.getProjectById(projectId);
  const project = projectResponse.result;
  if (!project) return;

  // Toggle start sprint form
  function toggleStartSprintForm() {
    if (startSprintButton) toggleHidden(startSprintButton);
    if (startSprintForm) toggleHidden(startSprintForm);
  }

  startSprintButton?.addEventListener('click', toggleStartSprintForm);
  sprintStartCloseSvg?.addEventListener('click', toggleStartSprintForm);

  startSprintSubmitButton?.addEventListener('click', async (e: MouseEvent) => {
    e.preventDefault();
    await startSprintFunction();
  });

  async function startSprintFunction() {
    if (project.currentSprint) {
      toggleStartSprintForm();
    } else {
      if (!sprint._id || !dueDateInput) return;

      const response = await sprintService.updateSprint(sprint._id, {
        dueDate: dueDateInput.value,
      } as Partial<Sprint>);

      await checkIfSprintStarted(response.result);
      const projectId = localStorage.getItem('selectedProject');
      if (!projectId) return;

      await renderBacklogView(projectId);
      handleDashboardSprintPreview();
    }
  }

  async function checkIfSprintStarted(updatedSprint: Sprint) {
    if (!updatedSprint._id || !updatedSprint.dueDate) return;

    if (startSprintForm) toggleHidden(startSprintForm);
    if (completeSprintButton) toggleHidden(completeSprintButton);

    if (!project._id) return;

    const response = await projectService.updateProject(project._id, {
      currentSprint: updatedSprint._id,
    });

    completeSprintButton?.addEventListener('click', async (e: MouseEvent) => {
      e.preventDefault();
      if (updatedSprint._id) {
        await handleCompleteSprint(updatedSprint._id, response.result);
      }
    });
  }
}

export function handleAddTaskToSprint(
  currentSprints: Sprint[],
  sprintDropdown: HTMLUListElement
) {
  sprintDropdown.innerHTML = '';
  toggleHidden(sprintDropdown);

  currentSprints.forEach((sprint) => {
    const dropdownEl = document.createElement('li') as HTMLLIElement;
    dropdownEl.className =
      'dropdown-item px-4 py-2 hover:bg-gray-100 cursor-pointer';
    dropdownEl.dataset.id = sprint._id;
    dropdownEl.id = `dropdown-${sprint.key}`;
    dropdownEl.innerHTML = sprint.key!;
    sprintDropdown.appendChild(dropdownEl);
    dropdownEl.addEventListener('click', async () => {
      await handleAddTaskFromBacklogToSprint(dropdownEl);
    });
  });
}

async function handleAddTaskFromBacklogToSprint(dropdownEl: HTMLLIElement) {
  const backlogBodyChildren = document.getElementById('backlog-body');
  if (!backlogBodyChildren) return;

  const checkboxes =
    backlogBodyChildren.querySelectorAll<HTMLInputElement>('.checkboxes');
  const selectedRows: string[] = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked && checkbox.dataset.id) {
      selectedRows.push(checkbox.dataset.id);
    }
  });

  // Make sure dropdownEl.dataset.id exists
  const sprintId = dropdownEl.dataset.id;
  if (!sprintId) return;

  await sprintService.addTasksToSprint(sprintId, {
    tasks: selectedRows,
  });

  const projectId = localStorage.getItem('selectedProject');
  if (!projectId) return;

  await renderBacklogView(projectId);
}

export async function handleDashboardSprintPreview() {
  const projectId = localStorage.getItem('selectedProject');
  if (!projectId) return;

  const projectResponse = await projectService.getProjectById(projectId);
  const project = projectResponse.result;
  if (!project) return;

  const sprintPreviewContainer = document.getElementById(
    'dashboardSprintPreview'
  );
  const sprintName = document.getElementById('dashboardSprintName');
  const sprintDueDateWrapper = document.getElementById(
    'dashboardSprintDueDateWrapper'
  );

  if (!sprintPreviewContainer || !sprintName || !sprintDueDateWrapper) return;

  if (project.projectType === 'scrum') {
    sprintPreviewContainer.classList.remove('hidden');

    if (project.currentSprint) {
      const sprintDueDate = document.getElementById('dashboardSprintDueDate');
      if (!sprintDueDate) return;

      const sprintResponse = await sprintService.getSprintById(
        project.currentSprint
      );
      const sprint = sprintResponse.result;
      if (!sprint) return;

      sprintDueDateWrapper.classList.remove('hidden');
      sprintName.innerText = sprint.key ?? 'Unnamed Sprint';
      sprintDueDate.innerText = sprint.dueDate
        ? new Date(sprint.dueDate).toLocaleDateString()
        : 'No due date';
    } else {
      sprintDueDateWrapper.classList.add('hidden');
      sprintName.innerText = 'No sprint started';
    }
  } else {
    sprintPreviewContainer.classList.add('hidden');
  }
}
