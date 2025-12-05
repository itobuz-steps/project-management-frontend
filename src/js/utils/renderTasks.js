import SprintService from '../services/SprintService.js';
import TaskService from '../services/TaskService.js';
import { dropdownEvent } from '../pages/dashboard/dashboard.js';

const listTableBody = document.getElementById('table-body');
const emptyListContainer = document.getElementById('empty-list-container');

const sprintBacklogWrapper = document.getElementById('sprint-backlog-wrapper');

async function createTaskList(task) {
  const tr = document.createElement('tr');

  const reporter = task.reporter
    ? (await TaskService.getUserDetailsById(task.reporter)).data.result
    : '';
  const assignee = task.assignee
    ? (await TaskService.getUserDetailsById(task.assignee)).data.result
    : '';

  tr.classList =
    'bg-white border-b border-gray-500 hover:bg-gray-100 whitespace-nowrap';
  tr.dataset.id = task._id;
  tr.innerHTML = `
    <td class="w-4 p-4">
      <div class="flex items-center">
        <input
            id="checkbox-all-search"
            type="checkbox"
            class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm accent-cyan-500 focus:ring-cyan-600"
        />
      </div>
    </td>
    <td>
                        <svg
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-labelledby="checkboxIconTitle"
                          stroke="#000000"
                          stroke-width="2.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          fill="none"
                          color="#000000"
                          class="h-4 stroke-blue-800 px-7"
                        >
                          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <title id="checkboxIconTitle">
                              Checkbox (selected)
                            </title>
                            <rect
                              x="21"
                              y="3"
                              width="18"
                              height="18"
                              rx="1"
                              transform="rotate(90 21 3)"
                            ></rect>
                            <path
                              d="M6.66666 12.6667L9.99999 16L17.3333 8.66669"
                            ></path>
                          </g>
                        </svg>
                      </td>
                      <td class="px-6 py-4">${task.key}</td>
                      <td class="px-6 py-4">${task.title}</td>
                      <td class="px-6 py-4">${task.status}</td>
                      <td class="px-6 py-4">${task.comments}</td>
                      <td class="px-6 py-4">${task.sprint}</td>
                      <td class="px-6 py-4">${assignee.name}</td>
                      <td class="px-6 py-4">${task.dueDate.split('T')[0]}</td>
                      <td class="px-6 py-4">${task.tags.join(' ')}</td>
                      <td class="px-6 py-4">${task.createdAt.split('T')[0]}</td>
                      <td class="px-6 py-4">${task.updatedAt.split('T')[0]}</td>
                      <td class="px-6 py-4">${reporter.name}</td>

  `;
  return tr;
}

function createSprintTable(sprint) {
  const sprintContainer = document.createElement('div');

  sprintContainer.dataset.id = sprint._id;
  sprintContainer.innerHTML = `
                <div class="relative flex justify-between text-left">
                  <div class="flex align-middle ms-2 sm:ms-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm accent-cyan-500 focus:ring-cyan-600"
                      />
                    </div>
                    <button
                      type="button"
                      class="flex items-center w-35 gap-2 rounded-md px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none dropdownButton"
                      id="dropdownButton-${sprint.name}"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <svg
                        id="dropdown-icon-${sprint.name}"
                        class="h-4 w-4 mt-1 dropdown-icon-${sprint.name}"
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
                      ${sprint.name}
                    </button>
                  </div>
                  <button
                    type="button"
                    class="py-1 px-2 my-1 md:py-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-cyan-50 hover:text-gray-600"
                  >
                    Complete Sprint
                  </button>
                </div>

                <div
                  class="dropdown-menu-${sprint.name} relative overflow-x-auto shadow rounded-lg sm:rounded-lg no-scrollbar"
                >
                  <table class="w-full text-sm text-left rtl:text-right">
                    <thead
                      class="text-xm text-gray-700 uppercase bg-gray-200 border-b border-gray-500 hover:bg-gray-100 sticky"
                    >
                      <tr>
                        <th scope="col" class="p-4">
                          <div class="flex items-center">
                            <input
                              id="checkbox-all-search"
                              type="checkbox"
                              class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm accent-cyan-500 focus:ring-cyan-600"
                            />
                          </div>
                        </th>
                        <th scope="col" class="px-6 py-3">Type</th>
                        <th scope="col" class="px-6 py-3">Key</th>
                        <th scope="col" class="px-6 py-3">Summary</th>
                        <th scope="col" class="px-6 py-3">Status</th>
                        <th scope="col" class="px-6 py-3">Comments</th>
                        <th scope="col" class="px-6 py-3">Sprint</th>
                        <th scope="col" class="px-6 py-3">Assignee</th>
                        <th scope="col" class="px-6 py-3">Due Date</th>
                        <th scope="col" class="px-6 py-3">Labels</th>
                        <th scope="col" class="px-6 py-3">Created</th>
                        <th scope="col" class="px-6 py-3">Updated</th>
                        <th scope="col" class="px-6 py-3">Reporter</th>
                      </tr>
                    </thead>
                    <tbody id="${sprint.name}-body"></tbody>
                  </table>
                </div>
                <div
                  class="text-center w-full flex justify-center hidden"
                  id="${sprint.name}-empty-message"
                >
                  No tasks found!
                </div>
 `;
  return sprintContainer;
}

function createBacklogTable() {
  const backlogContainer = document.createElement('div');

  backlogContainer.innerHTML = `
  <div class="relative flex justify-between text-left">
                  <div class="flex align-middle ms-2 sm:ms-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm accent-cyan-500 focus:ring-cyan-600"
                      />
                    </div>
                    <button
                      type="button"
                      class="flex items-center w-35 gap-2 rounded-md px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
                      id="dropdownButton-backlog"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <svg
                        id="dropdown-icon-backlog"
                        class="h-4 w-4 mt-1 dropdown-icon-backlog"
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
                  <button
                    type="button"
                    class="py-1 px-2 my-1 text-sm md:py-2 font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-cyan-50 hover:text-gray-600"
                  >
                    Create Sprint
                  </button>
                </div>

                <div
                  class="dropdown-menu-backlog relative overflow-x-auto shadow rounded-lg sm:rounded-lg"
                >
                  <table class="w-full text-sm text-left rtl:text-right">
                    <thead
                      class="text-xm text-gray-700 uppercase bg-gray-200 border-b border-gray-500 hover:bg-gray-100 sticky"
                    >
                      <tr>
                        <th scope="col" class="p-4">
                          <div class="flex items-center">
                            <input
                              id="checkbox-all-search"
                              type="checkbox"
                              class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm accent-cyan-500 focus:ring-cyan-600"
                            />
                          </div>
                        </th>
                        <th scope="col" class="px-6 py-3">Type</th>
                        <th scope="col" class="px-6 py-3">Key</th>
                        <th scope="col" class="px-6 py-3">Summary</th>
                        <th scope="col" class="px-6 py-3">Status</th>
                        <th scope="col" class="px-6 py-3">Comments</th>
                        <th scope="col" class="px-6 py-3">Sprint</th>
                        <th scope="col" class="px-6 py-3">Assignee</th>
                        <th scope="col" class="px-6 py-3">Due Date</th>
                        <th scope="col" class="px-6 py-3">Labels</th>
                        <th scope="col" class="px-6 py-3">Created</th>
                        <th scope="col" class="px-6 py-3">Updated</th>
                        <th scope="col" class="px-6 py-3">Reporter</th>
                      </tr>
                    </thead>
                    <tbody id="backlog-body"></tbody>
                  </table>
                </div>
                <div
                  class="text-center w-full flex justify-center hidden"
                  id="backlog-empty-message"
                >
                  No tasks found!
                </div>
  `;
  return backlogContainer;
}

export async function renderTasksList(tasksArray = []) {
  try {
    listTableBody.innerHTML = '';
    // let tasksArray = [];
    // const tasks = await TaskService.getTaskByProjectId(localStorage.getItem('selectedProject'));
    // tasksArray.push(...tasks.data.result);

    if (!tasksArray.length) {
      emptyListContainer.classList.remove('hidden');
    } else {
      emptyListContainer.classList.add('hidden');
      for (const task of tasksArray) {
        const tr = await createTaskList(task);
        listTableBody.append(tr);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function renderSprintTasks(sprint, sprintTasks) {
  for (const taskId of sprintTasks) {
    const task = await TaskService.getTaskById(taskId);
    const tr = await createTaskList(task.data.result);
    document.getElementById(`${sprint.name}-body`).append(tr);
  }
}
async function renderBacklogTasks(backlogTasks) {
  for (const taskId of backlogTasks) {
    const task = await TaskService.getTaskById(taskId);
    const tr = await createTaskList(task.data.result);
    document.getElementById(`backlog-body`).append(tr);
  }
}

export async function renderDashBoardTasks() {
  try {
    listTableBody.innerHTML = '';
    sprintBacklogWrapper.innerHTML = '';
    const projectId = localStorage.getItem('selectedProject');
    const tasks = await TaskService.getTaskByProjectId(projectId);
    const allTasks = tasks.data.result.map((task) => task._id);

    const sprints = await SprintService.getAllSprints(projectId);

    const allSprintTasks = [];
    sprints.result.forEach((sprint) => allSprintTasks.push(...sprint.tasks));

    const backlogTasks = allTasks.filter(
      (task) => !allSprintTasks.includes(task)
    );
    console.log({ allTasks, allSprintTasks, backlogTasks });

    sprints.result.forEach((sprint) => {
      const newSprint = createSprintTable(sprint);
      sprintBacklogWrapper.append(newSprint);
      const sprintTasks = [];
      sprint.tasks.forEach((task) => sprintTasks.push(task));
      if (!sprintTasks.length) {
        document
          .getElementById(`${sprint.name}-empty-message`)
          .classList.remove('hidden');
      } else {
        document
          .getElementById(`${sprint.name}-empty-message`)
          .classList.add('hidden');
        renderSprintTasks(sprint, sprintTasks);
        dropdownEvent(sprint);
      }
    });

    const backlogTable = createBacklogTable();
    sprintBacklogWrapper.append(backlogTable);
    if (!backlogTasks.length) {
      document
        .getElementById('backlog-empty-message')
        .classList.remove('hidden');
    } else {
      document.getElementById('backlog-empty-message').classList.add('hidden');
      renderBacklogTasks(backlogTasks);
      dropdownEvent();
    }
  } catch (error) {
    console.error(error.message);
  }
}
