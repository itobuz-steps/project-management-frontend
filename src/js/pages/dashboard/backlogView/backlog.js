import taskService from '../../../services/TaskService';
import { checkIfEmpty } from '../../../utils/elementUtils';
import { addDragEvent } from '../../../utils/dragAndDropHandler';
import { createTaskList } from '../../../utils/renderTasks';
import { toggleHidden } from '../../../utils/elementUtils';

export function createBacklogTable(projectType) {
  let ifKanban = '';
  if (projectType === 'kanban') {
    ifKanban = 'hidden';
  }

  const backlogContainer = document.createElement('div');

  backlogContainer.className = ' p-1 rounded-t';

  backlogContainer.innerHTML = /* HTML */ `
    <div
      class="xs:justify-between xs:items-center relative flex flex-wrap rounded-md border border-gray-200 bg-gray-50 p-2 text-left shadow-sm"
    >
      <div class="flex flex-1 items-center justify-start">
        <button
          type="button"
          class="flex w-30 cursor-pointer items-center gap-3 rounded-md font-semibold focus:outline-none md:w-full"
          id="dropdownButton-backlog"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <svg
            id="dropdown-icon-backlog"
            class="dropdown-icon-backlog mt-1 h-4 w-4"
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
          Backlog
        </button>
      </div>

      <div class="flex items-center gap-1 md:gap-2">
        <form
          class="xs:mt-0 xs:pl-0 mt-2 flex hidden h-7.5 gap-1 pl-4 md:justify-end"
          id="sprint-creation-form"
        >
          <input
            type="number"
            id="sprint-sp-input"
            aria-describedby="helper-text-explanation"
            class="focus:border-primary-400 block w-23 rounded-sm border border-gray-300 pl-2 shadow-xs outline-none placeholder:text-gray-500 md:w-30"
            placeholder="story point"
            required
          />
          <button
            type="submit"
            id="sprint-form-button"
            class="bg-primary-400 hover:bg-primary-500 w-20 rounded-sm px-2 py-1 text-sm font-medium text-white shadow-xs focus:outline-none"
          >
            Confirm
          </button>
          <svg
            id="sprint-close-svg"
            class="stroke-black hover:stroke-red-400 hover:stroke-2"
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
          id="add-to-sprint-button"
          title="Add to sprint"
          class="my-1 hidden rounded-sm border border-gray-200 bg-white p-1 text-gray-900 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>

        <div
          id="sprints-dropdown"
          class="absolute top-full left-4 z-40 hidden w-35 list-none rounded-sm border border-gray-200 bg-white shadow-lg sm:w-40 md:right-4"
        ></div>
        <button
          type="button"
          id="create-sprint-button"
          class="${ifKanban} bg-primary-400 hover:bg-primary-500 w-max rounded-sm px-2 py-1 font-medium text-white shadow-xs focus:outline-none"
        >
          <p id="create-sprint-text">Create Sprint</p>
        </button>
      </div>
    </div>

    <div
      class="dropdown-menu-backlog no-scrollbar relative my-2 overflow-x-auto rounded-md border border-gray-200"
    >
      <table class="w-full text-left rtl:text-right">
        <thead
          class="border-b border-l-3 border-gray-200 border-l-gray-100 bg-gray-100 text-xs text-nowrap uppercase hover:bg-gray-200"
        >
          <tr>
            <th scope="col" class="${ifKanban} p-2">
              <div class="flex items-center">
                <input
                  id="backlog-checkbox-all"
                  type="checkbox"
                  class="text-primary-600 bg-primary-100 border-primary-300 accent-primary-500 focus:ring-primary-600 m-auto h-3.5 w-3.5 rounded-sm"
                />
              </div>
            </th>
            <th scope="col" class="p-2 text-center">Type</th>
            <th scope="col" class="p-2">Key</th>
            <th scope="col" class="min-w-48 p-2">Summary</th>
            <th scope="col" class="min-w-14 p-2">Status</th>
            <th scope="col" class="min-w-48 p-2">Assignee</th>
            <th scope="col" class="p-2">Due Date</th>
            <th scope="col" class="min-w-36 p-2">Labels</th>
            <th scope="col" class="p-2">Created</th>
            <th scope="col" class="p-2">Updated</th>
            <th scope="col" class="min-w-36 p-2">Reporter</th>
            <th scope="col" class="min-w-px p-2"></th>
          </tr>
        </thead>
        <tbody id="backlog-body" data-id="backlog"></tbody>
      </table>
    </div>
    <div
      class="empty-message flex hidden w-full justify-center bg-white/80 p-4 text-center text-lg font-bold text-gray-400 backdrop:blur-lg"
      id="backlog-empty-message"
      data-id="backlog"
    >
      Create tasks...
    </div>

    <div class="flex w-full justify-center" id="backlog-loader">
      <svg viewBox="25 25 50 50" class="loader">
        <circle r="20" cy="50" cx="50"></circle>
      </svg>
    </div>
  `;
  return backlogContainer;
}

export async function renderBacklogTasks(
  backlogBody,
  backlogTasks,
  addToSprintButton,
  project
) {
  let promiseArray = [];
  for (const taskId of backlogTasks) {
    const task = await taskService.getTaskById(taskId);
    if (
      task.data.result.status !== project.columns[project.columns.length - 1]
    ) {
      promiseArray.push(
        createTaskList(task.data.result, 'backlog', project.projectType, null)
      );
    }
  }

  const loader = document.getElementById('backlog-loader');
  backlogBody.classList.add('hidden');

  const allTrs = await Promise.all(promiseArray);

  loader.classList.add('hidden');
  backlogBody.classList.remove('hidden');

  allTrs.forEach((tr) => {
    const checkbox = tr.querySelector('.checkboxes');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked && addToSprintButton.classList.contains('hidden')) {
        toggleHidden(addToSprintButton);
      }
    });
  });

  addDragEvent(backlogBody, allTrs, '');
  checkIfEmpty();
}

export function handleBacklogCheckboxAll(isCheckedValue) {
  const backlogBodyChildren = document.getElementById('backlog-body');
  backlogBodyChildren.querySelectorAll('.checkboxes').forEach((box) => {
    box.checked = isCheckedValue;
  });
}
