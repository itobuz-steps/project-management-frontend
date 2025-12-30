import taskService from '../../../services/TaskService';
import { createTaskList } from '../../../utils/renderTasks';
import { checkIfEmpty, toggleHidden } from '../../../utils/elementUtils';
import { addDragEvent } from '../../../utils/dragAndDropHandler';
import sprintService from '../../../services/SprintService';
import projectService from '../../../services/ProjectService';
import { renderBacklogView } from './renderBacklogView';

export function createSprintTable(sprint) {
  const sprintContainer = document.createElement('div');

  sprintContainer.dataset.id = sprint._id;
  sprintContainer.className = ' p-1 rounded-t';
  sprintContainer.innerHTML = /* HTML */ `
    <form
      class="flex hidden h-7.5 gap-1 md:justify-end"
      id="${sprint.key}-start-form"
    >
      <input
        type="date"
        name="dueDate"
        id="${sprint.key}-due-date"
        class="required block w-28 rounded-lg border border-gray-300 bg-gray-50 px-1 text-sm text-black focus:border-gray-500 focus:ring-gray-500 md:w-30"
        placeholder="Enter the due date"
      />

      <button
        type="submit"
        id="${sprint.key}-start-form-button"
        class="w-20 rounded-lg border border-gray-200 bg-white px-0.5 text-sm text-gray-900 hover:bg-cyan-50 hover:text-gray-600 focus:outline-none"
      >
        Confirm
      </button>
      <svg
        id="${sprint.key}-start-close-svg"
        class=""
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
            stroke="#000000"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </g>
      </svg>
    </form>

    <div
      class="relative flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-2 text-left shadow-sm"
    >
      <div class="flex flex-1 flex-col md:flex-row">
        <button
          type="button"
          class="dropdownButton flex w-30 flex-1 cursor-pointer items-center gap-3 rounded-md text-lg font-semibold focus:outline-none md:w-fit"
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
        <button
          type="button"
          id="${sprint.key}-sprint-complete-button"
          class="my-1 hidden rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-cyan-50 hover:text-gray-600 focus:outline-none"
        >
          Complete Sprint
        </button>
        <button
          type="button"
          id="${sprint.key}-sprint-start-button"
          class="my-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-cyan-50 hover:text-gray-600 focus:outline-none"
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
          class="border-b border-gray-200 bg-gray-100 text-xs text-nowrap uppercase hover:bg-gray-200"
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
          </tr>
        </thead>
        <tbody id="${sprint.key}-body" data-id="${sprint._id}"></tbody>
      </table>
    </div>
    <div
      class="empty-message flex hidden h-15 w-full items-center justify-center rounded-lg border border-dotted text-center hover:border-purple-600"
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

export async function renderSprintTasks(sprint, sprintTasks, projectType) {
  let promiseArray = [];
  const sprintTaskBody = document.getElementById(`${sprint.key}-body`);

  for (const taskId of sprintTasks) {
    const task = await taskService.getTaskById(taskId);
    promiseArray.push(
      createTaskList(task.data.result, '', projectType, sprint)
    );
  }

  const loader = document.getElementById(`${sprint.key}-loader`);

  sprintTaskBody.classList.add('hidden');
  const allTrs = await Promise.all(promiseArray);

  loader.classList.add('hidden');
  sprintTaskBody.classList.remove('hidden');

  addDragEvent(sprintTaskBody, allTrs, sprint);

  checkIfEmpty();
}

export async function handleSprintCreate(storyPointInput) {
  const newSprint = {
    projectId: localStorage.getItem('selectedProject'),
    storyPoint: storyPointInput.value,
  };

  await sprintService.createSprint(newSprint);
  await renderBacklogView(localStorage.getItem('selectedProject'));
}

export async function handleCompleteSprint(sprintId, project) {
  const sprint = await sprintService.getSprintById(sprintId);

  let completedTasks = [];
  sprint.result.tasks.forEach((task) => {
    if (task.status === project.columns[project.columns.length - 1]) {
      completedTasks.push(task);
    }
  });

  await sprintService.updateSprint(sprintId, { isCompleted: true, tasks: [] });
  await projectService.updateProject(project._id, { currentSprint: null });
  await renderBacklogView(localStorage.getItem('selectedProject'));
}

export async function handleStartSprint(sprint) {
  const startSprintButton = document.getElementById(
    `${sprint.key}-sprint-start-button`
  );
  const sprintStartCloseSvg = document.getElementById(
    `${sprint.key}-start-close-svg`
  );
  const startSprintForm = document.getElementById(`${sprint.key}-start-form`);
  const dueDateInput = document.getElementById(`${sprint.key}-due-date`);
  const startSprintSubmitButton = document.getElementById(
    `${sprint.key}-start-form-button`
  );
  const completeSprintButton = document.getElementById(
    `${sprint.key}-sprint-complete-button`
  );

  const project = await projectService.getProjectById(
    localStorage.getItem('selectedProject')
  );

  startSprintButton.addEventListener('click', toggleStartSprintForm);
  sprintStartCloseSvg.addEventListener('click', toggleStartSprintForm);

  function toggleStartSprintForm() {
    toggleHidden(startSprintButton);
    toggleHidden(startSprintForm);
  }

  startSprintSubmitButton.addEventListener('click', async (e) => {
    e.preventDefault();
    await startSprintFunction();
  });

  async function startSprintFunction() {
    if (project.result.currentSprint) {
      toggleStartSprintForm();
    } else {
      const response = await sprintService.updateSprint(sprint._id, {
        dueDate: dueDateInput.value,
      });
      await checkIfSprintStarted(response.result);
      await renderBacklogView(localStorage.getItem('selectedProject'));
    }
  }

  async function checkIfSprintStarted(sprint) {
    if (sprint.dueDate) {
      toggleHidden(startSprintForm);
      toggleHidden(completeSprintButton);

      const response = await projectService.updateProject(project.result._id, {
        currentSprint: sprint._id,
      });

      completeSprintButton.addEventListener('click', async (e) => {
        e.preventDefault();

        await handleCompleteSprint(sprint._id, response.result);
      });
    }
  }
}

export function handleAddTaskToSprint(currentSprints, sprintDropdown) {
  sprintDropdown.innerHTML = '';
  toggleHidden(sprintDropdown);

  currentSprints.forEach((sprint) => {
    const dropdownEl = document.createElement('li');
    dropdownEl.className =
      'dropdown-item px-4 py-2 hover:bg-gray-100 cursor-pointer';
    dropdownEl.dataset.id = sprint._id;
    dropdownEl.id = `dropdown-${sprint.key}`;
    dropdownEl.innerHTML = sprint.key;
    sprintDropdown.appendChild(dropdownEl);
    dropdownEl.addEventListener('click', async () => {
      await handleAddTaskFromBacklogToSprint(dropdownEl);
    });
  });
}

async function handleAddTaskFromBacklogToSprint(dropdownEl) {
  const backlogBodyChildren = document.getElementById('backlog-body');
  let selectedRows = [];

  backlogBodyChildren.querySelectorAll('.checkboxes').forEach((checkbox) => {
    if (checkbox.checked) {
      selectedRows.push(checkbox.dataset.id);
    }
  });

  await sprintService.addTasksToSprint(dropdownEl.dataset.id, {
    tasks: selectedRows,
  });

  await renderBacklogView(localStorage.getItem('selectedProject'));
}
