import { getFilteredTasks } from '../pages/dashboard/navbar/navbar.js';
import projectService from '../services/ProjectService.js';
import SprintService from '../services/SprintService.js';
import taskService from '../services/TaskService.js';
import TaskService from '../services/TaskService.js';
import { showConfirmModal } from './modals/confirmationModal.js';
import { DateTime } from 'luxon';
import showToast from './showToast.js';
import { formatISO } from 'date-fns';
import { showTaskDrawer } from '../pages/taskDrawer/taskDrawer.js';
import { svgObject } from './svgObjects.js';

const listTableBody = document.getElementById('table-body');
const emptyListContainer = document.getElementById('empty-list-container');

const sprintBacklogWrapper = document.getElementById('sprint-backlog-wrapper');

async function createTaskList(task, type, projectType, sprint) {
  let ifSprint = `hidden`;
  if (type === 'backlog') {
    ifSprint = ``;
  }

  let ifKanban = '';
  if (projectType === 'kanban') {
    ifKanban = 'hidden';
  }

  let typeSvg;
  if (task.type === 'task') {
    typeSvg = `${svgObject.task}`;
  } else if (task.type === 'story') {
    typeSvg = `${svgObject.story}`;
  } else {
    typeSvg = `${svgObject.bug}`;
  }

  let priority;
  switch (task.priority) {
    case 'low':
      priority = 'border-l-green-500';
      break;
    case 'medium':
      priority = 'border-l-primary-500';
      break;
    case 'high':
      priority = 'border-l-yellow-400';
      break;
    case 'critical':
      priority = 'border-l-red-600';
      break;
  }

  const tr = document.createElement('tr');
  const reporter = task.reporter
    ? (await TaskService.getUserDetailsById(task.reporter)).data.result
    : '';

  let assignee = {};
  if (task.assignee) {
    const data = (await TaskService.getUserDetailsById(task.assignee)).data
      .result;
    assignee.name = data.name;
    assignee.profileImage =
      'http://localhost:3001/uploads/profile/' + data.profileImage;
  } else {
    assignee = {
      name: 'Unassigned',
      profileImage: '../../../../assets/img/profile.png',
    };
  }

  const labelsEl = task.tags.map((label, idx) => {
    if (idx > 3) {
      return '';
    }

    let labelEl;

    if (idx == 3) {
      labelEl = /*html*/ `
      <div class ="bg-gray-200 px-2 py-1 rounded-sm">
        +${task.tags.length - 3}
      </div>
      `;
    } else {
      labelEl = /*html*/ `
    <div class="labels bg-primary-100 px-2 py-1 rounded-sm">
    ${label}
    </div>`;
    }

    return labelEl;
  });

  tr.classList = ` border-b border-b-gray-200 whitespace-nowrap border-l-3 ${priority} hover:bg-gray-100`;
  tr.dataset.id = task._id;

  let dateValue;

  dateValue = task.dueDate.split('T');
  const newDate = new Date(dateValue);
  dateValue = formatISO(newDate, { representation: 'date' });

  tr.innerHTML = /*html*/ `
    <td class="px-4 py-2 ${ifSprint} ${ifKanban} ">
      <div class="flex items-center">
        <input
            id="checkbox-all-search"
            type="checkbox"
            class="checkboxes w-3.5 h-3.5 text-primary-600 bg-primary-100 border-primary-300 rounded-sm accent-primary-500 focus:ring-primary-600 "
            data-id=${task._id}
        />
      </div>
    </td>
    <td class="">
      <div class="w-full flex justify-center">
        ${typeSvg}
      </div>
    </td>
    <td class="p-2"><p class="wrapper bg-primary-500 text-white px-2 py-1 rounded-md w-max uppercase font-semibold text-xs">${task.key}</p></td>
    <td class="p-2 open-taskDrawer cursor-pointer hover:underline">${task.title}</td>
    <td class="p-2">
      <div class="mr-2 px-2 bg-primary-400 rounded-md text-white py-0.5 w-fit">
        <select class="status-select-${task._id} w-fit outline-none text-center">
        </select>
      </div>

    </td>
    <td class="p-2 ${ifKanban} ${!sprint ? 'hidden' : ''}">${sprint ? '<p class="wrapper bg-primary-400 text-white px-2 py-1 rounded-sm w-max uppercase font-semibold text-xs">' + sprint.key + '</p>' : ''}</td>
    <td class="p-2">
      <div class="flex items-center">
        <img class="aspect-square w-6 h-6 rounded-full mr-3" 
              src="${assignee.profileImage}">${assignee.name}
      </div>
    </td>
    <td class="p-2 ">
                    <input
                      type="date"
                      name="dueDate"
                      id=""
                      class="${task.key}-due-date ${new Date(task.dueDate) < Date.now() ? 'text-red-600' : ''} block w-28 rounded-md border border-gray-300 bg-gray-50 p-1 text-sm text-black outline-none"
                      placeholder="Enter the due date"
                      value="${dateValue}"
                    />
    </td>
    <td class="p-2"><div class="flex gap-1 text-xs min-w-18">${labelsEl.join('')}</div></td>
    <td class="p-2">${DateTime.fromISO(task.createdAt).toLocaleString(DateTime.DATE_MED)}</td>
    <td class="p-2">${DateTime.fromISO(task.updatedAt).toLocaleString(DateTime.DATE_MED)}</td>
    <td class="p-2">
      <div class="flex items-center">
        <img class="aspect-square w-6 h-6 rounded-full mr-3" 
              src="${
                reporter.profileImage
                  ? 'http://localhost:3001/uploads/profile/' +
                    reporter.profileImage
                  : '../../../assets/img/profile.png'
              }">${reporter.name}
      </div>
    </td>
  `;

  const dueDateInput = tr.querySelector(`.${task.key}-due-date`);
  const openTaskDrawer = tr.querySelector('.open-taskDrawer');

  openTaskDrawer.addEventListener('click', () => showTaskDrawer(task._id));

  dueDateInput.addEventListener('change', async () => {
    if (new Date(dueDateInput.value) < new Date(task.dueDate)) {
      showToast('Invalid due date', 'error');
      dueDateInput.value = dateValue;
      return;
    }

    await taskService.updateTask(task._id, { dueDate: dueDateInput.value });

    showToast('Task Updated successfully', 'success');

    if (new Date(dueDateInput.value) >= Date.now()) {
      dueDateInput.classList.remove('text-red-600');
    }
  });

  const statusOption = tr.querySelector(`.status-select-${task._id}`);

  await addStatusOptions(statusOption, task.status);

  statusOption.addEventListener('change', async (e) => {
    await taskService.updateTask(task._id, { status: e.target.value });
    e.preventDefault();
  });

  return tr;
}

function createSprintTable(sprint) {
  const sprintContainer = document.createElement('div');

  sprintContainer.dataset.id = sprint._id;
  sprintContainer.className = ' p-1 rounded-t';
  sprintContainer.innerHTML = /*html*/ `
                  <form class="hidden flex md:justify-end gap-1 h-7.5" id="${sprint.key}-start-form">
                    <input
                        type="date"
                        name="dueDate"
                        id="${sprint.key}-due-date"
                        class="w-28 md:w-30 bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block px-1 required"
                        placeholder="Enter the due date"
                    />

                    <button
                    type="submit"
                    id="${sprint.key}-start-form-button"
                    class="w-20 text-sm px-0.5 text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-cyan-50 hover:text-gray-600"
                    >
                      Confirm
                    </button>
                    <svg id="${sprint.key}-start-close-svg" class="" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                  </form>


                <div class="relative flex justify-between items-center text-left bg-gray-50 shadow-sm p-2 rounded-md border border-gray-200">
                  <div class="flex flex-col md:flex-row">
                    <button
                      type="button"
                      class="flex items-center w-30 md:w-fit gap-3 rounded-md text-lg font-semibold cursor-pointer focus:outline-none dropdownButton"
                      id="dropdownButton-${sprint.key}"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <svg
                        id="dropdown-icon-${sprint.key}"
                        class="h-4 w-4 mt-1 dropdown-icon-${sprint.key}"
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
                      <p class="text-nowrap">
                      ${sprint.key}
                      </p>
                    </button> 
                    <div class="flex ml-5 md:ml-3 items-center gap-1 ${sprint.dueDate ? '' : 'hidden'}" >      
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-primary-400">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier"> 
                          <path d="M12 7V12L14.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="inherit" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          </path> 
                        </g>
                      </svg>
                    <p id="${sprint.key}-due-date-preview" class="due-date text-xs text-center text-primary-400 font-semibold">
   
                    </p>
                    </div>
                  </div>

                  <div class="flex flex-col md:flex-row md:items-center md:gap-3">
          
                  
                  <button
                    type="button"
                    id="${sprint.key}-sprint-complete-button"
                    class="hidden py-1 px-2 my-1 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-cyan-50 hover:text-gray-600"
                  >
                    Complete Sprint
                  </button>
                  <button
                  type="button"
                  id="${sprint.key}-sprint-start-button"
                  class="py-1 px-2 my-1 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-cyan-50 hover:text-gray-600"
                  >
                  Start Sprint
                  </button>
                  </div>
                </div>

                <div
                  class="dropdown-menu-${sprint.key} relative overflow-x-auto rounded-md border border-gray-200 no-scrollbar my-2"
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
                  class="empty-message text-center w-full flex justify-center items-center hidden h-15 border border-dotted rounded-lg hover:border-purple-600 "
                  id="${sprint.key}-empty-message"
                  data-id="${sprint._id}"
                >
                  Drop tasks here...
                </div>

                <div class="flex justify-center w-full" id="${sprint.key}-loader">
                  <svg viewBox="25 25 50 50" class="loader">
                    <circle r="20" cy="50" cx="50"></circle>
                  </svg>
                </div>
 `;
  return sprintContainer;
}

function createBacklogTable(projectType) {
  let ifKanban = '';
  if (projectType === 'kanban') {
    ifKanban = 'hidden';
  }

  const backlogContainer = document.createElement('div');

  backlogContainer.className = ' p-1 rounded-t';

  backlogContainer.innerHTML = /*html*/ `
                  <form class="hidden flex md:justify-end gap-1 h-7.5" id="sprint-creation-form">

                    <input type="number" id="sprint-sp-input" aria-describedby="helper-text-explanation" class=" w-23 md:w-30 block rounded-lg text-center bg-neutral-secondary-medium border border-gray-400 text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body " placeholder="story point" required />

                    <button
                    type="submit"
                    id="sprint-form-button"
                    class="w-20 text-sm px-0.5 text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-cyan-50 hover:text-gray-600"
                    >
                      Confirm
                    </button>
                    <svg id="sprint-close-svg" class="" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 8L8 16M8.00001 8L16 16" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                  </form>


               <div class="relative flex justify-between items-center text-left bg-gray-50 shadow-sm p-2 rounded-md border border-gray-200">
                  <div class="flex items-center justify-start w-full">
                    <button
                      type="button"
                      class="flex items-center w-30 md:w-full gap-3 rounded-md font-semibold cursor-pointer focus:outline-none"
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

                  <div class="flex items-center gap-1 md:gap-2">
                  <button
                    type="button"
                    id="add-to-sprint-button"
                    title="Add to sprint"
                    class="hidden p-1 my-1 text-sm  font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-cyan-50 hover:text-gray-600"
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
                    class="hidden absolute list-none md:right-4  right-4 top-full bg-white shadow-lg border rounded w-35 sm:w-40 z-40"
                  >
                  </div>
                  <button
                    type="button"
                    id="create-sprint-button"
                    class="${ifKanban} py-1 px-2 my-1 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-cyan-50 hover:text-gray-600"
                  >
                    <p id="create-sprint-text">Create Sprint</p>
                  </button>
                  </div>
                </div>

                <div
                  class="dropdown-menu-backlog relative overflow-x-auto rounded-md border border-gray-200 no-scrollbar my-2"
                >
                <table class="w-full text-left rtl:text-right">
                  <thead
                    class="border-b border-gray-200 bg-gray-100 text-xs text-nowrap uppercase hover:bg-gray-200"
                  >
                    <tr>
                        <th scope="col" class="p-2 ${ifKanban}">
                          <div class="flex items-center">
                            <input
                              id="backlog-checkbox-all"
                              type="checkbox"
                              class="w-3.5 h-3.5 text-primary-600 bg-primary-100 border-primary-300 rounded-sm accent-primary-500 focus:ring-primary-600 m-auto"
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
                      </tr>
                    </thead>
                    <tbody id="backlog-body" data-id="backlog"></tbody>
                  </table>
                </div>
                <div
                  class="empty-message hidden text-center w-full flex justify-center text-gray-400 font-bold p-4 text-lg bg-white/80 backdrop:blur-lg"
                  id="backlog-empty-message"
                  data-id="backlog"
                >
                  Create tasks...
                </div>

                <div class="flex justify-center w-full" id="backlog-loader">
                  <svg viewBox="25 25 50 50" class="loader">
                    <circle r="20" cy="50" cx="50"></circle>
                  </svg>
                </div>
  `;
  return backlogContainer;
}

export async function renderTasksList(
  projectId,
  filter = '',
  searchInput = ''
) {
  listTableBody.innerHTML = '';

  const project = (await projectService.getProjectById(projectId)).result;
  const tasksArray = await getFilteredTasks(projectId, filter, searchInput);

  if (!tasksArray.length) {
    emptyListContainer.classList.remove('hidden');
  } else {
    emptyListContainer.classList.add('hidden');
    let promiseArray = [];
    for (const task of tasksArray) {
      promiseArray.push(
        createTaskList(task, 'list', project.projectType, null)
      );
    }

    const loader = document.getElementById(`list-loader`);
    if (loader.classList.contains('hidden')) {
      loader.classList.remove('hidden');
    }

    listTableBody.classList.add('hidden');

    const allTrs = await Promise.all(promiseArray);

    loader.classList.add('hidden');
    listTableBody.classList.remove('hidden');

    allTrs.forEach((tr) => {
      listTableBody.append(tr);
    });
  }
}

async function renderSprintTasks(sprint, sprintTasks, projectType) {
  let promiseArray = [];
  const sprintTaskBody = document.getElementById(`${sprint.key}-body`);
  for (const taskId of sprintTasks) {
    const task = await TaskService.getTaskById(taskId);
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

async function renderBacklogTasks(
  backlogBody,
  backlogTasks,
  addToSprintButton,
  project
) {
  let promiseArray = [];
  for (const taskId of backlogTasks) {
    const task = await TaskService.getTaskById(taskId);
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

export async function renderDashBoardTasks(
  projectId,
  filter = '',
  searchInput = ''
) {
  listTableBody.innerHTML = '';
  sprintBacklogWrapper.innerHTML = '';

  const tasks = await TaskService.getTaskByProjectId(
    projectId,
    filter,
    searchInput
  );
  const project = await projectService.getProjectById(projectId);
  const sprints = await SprintService.getAllSprints(projectId);
  const allTasks = tasks.data.result.map((task) => task._id);

  const allSprintTasks = [];
  sprints.result.forEach((sprint) => allSprintTasks.push(...sprint.tasks));

  const backlogTasks = allTasks.filter(
    (task) => !allSprintTasks.includes(task)
  );
  const incompleteBacklogTasks = backlogTasks.filter(
    (task) =>
      task.status !== project.result.columns[project.result.columns.length - 1]
  );

  const currentSprints = sprints.result.filter((sprint) => !sprint.isCompleted);

  currentSprints.forEach(async (sprint) => {
    const newSprint = createSprintTable(sprint);
    sprintBacklogWrapper.append(newSprint);
    const sprintTasks = [];
    sprint.tasks.forEach((task) => sprintTasks.push(task));
    dropdownEvent(sprint);

    if (!sprintTasks.length) {
      document
        .getElementById(`${sprint.key}-empty-message`)
        .classList.remove('hidden');
      document.getElementById(`${sprint.key}-loader`).classList.add('hidden');
    } else {
      document
        .getElementById(`${sprint.key}-empty-message`)
        .classList.add('hidden');
      if (project.result.projectType === 'kanban') {
        await renderSprintTasks(sprint, sprintTasks, 'kanban');
      } else {
        await renderSprintTasks(sprint, sprintTasks, '');
      }
    }

    newSprint.addEventListener('dragover', (e) => e.preventDefault());
    newSprint.addEventListener('drop', async (e) => {
      await addDropEvent(
        e,
        newSprint,
        project.result.projectType,
        false,
        sprint
      );
    });

    await handleStartSprint(sprint);
    if (sprint.dueDate) {
      toggleHidden(
        document.getElementById(`${sprint.key}-sprint-start-button`)
      );
      toggleHidden(
        document.getElementById(`${sprint.key}-sprint-complete-button`)
      );

      const completeSprintButton = document.getElementById(
        `${sprint.key}-sprint-complete-button`
      );
      const dueDatePreview = document.getElementById(
        `${sprint.key}-due-date-preview`
      );

      dueDatePreview.innerText = new Date(sprint.dueDate).toLocaleDateString();

      const response = await projectService.updateProject(projectId, {
        currentSprint: sprint._id,
      });

      completeSprintButton.addEventListener('click', async (e) => {
        e.preventDefault();

        showConfirmModal(
          'Are you sure you want to complete this sprint?',
          async () => {
            await handleCompleteSprint(sprint._id, response.result);
          }
        );
      });
    }
  });

  let backlogTable;
  if (project.result.projectType === 'kanban') {
    backlogTable = createBacklogTable('kanban');
    sprintBacklogWrapper.append(backlogTable);
  } else {
    backlogTable = createBacklogTable('');
    sprintBacklogWrapper.append(backlogTable);
  }
  dropdownEvent();

  backlogTable.addEventListener('dragover', (e) => e.preventDefault());
  backlogTable.addEventListener('drop', async (e) => {
    await addDropEvent(e, backlogTable, 'project.result.projectType', true, '');
  });

  const addToSprintButton = document.getElementById('add-to-sprint-button');
  const backlogBody = document.getElementById('backlog-body');

  await renderBacklogTasks(
    backlogBody,
    incompleteBacklogTasks,
    addToSprintButton,
    project.result
  );
  // }

  backlogBody.addEventListener('change', () => {
    let isChecked = false;
    backlogBody.querySelectorAll('.checkboxes').forEach((checkbox) => {
      if (checkbox.checked) {
        isChecked = true;
      }
    });
    if (!isChecked) {
      toggleHidden(addToSprintButton);
    }
  });

  const createSprintButton = document.getElementById('create-sprint-button');
  const sprintForm = document.getElementById('sprint-creation-form');
  const sprintCreateCloseSvg = document.getElementById('sprint-close-svg');
  const sprintCreateSubmitButton =
    document.getElementById('sprint-form-button');
  const storyPointInput = document.getElementById('sprint-sp-input');

  function callCreateSprint() {
    toggleHidden(createSprintButton);
    toggleHidden(sprintForm);
  }

  createSprintButton.addEventListener('click', callCreateSprint);
  sprintCreateCloseSvg.addEventListener('click', callCreateSprint);

  sprintCreateSubmitButton.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleSprintCreate(storyPointInput);
  });

  const backlogCheckboxAll = document.getElementById('backlog-checkbox-all');
  backlogCheckboxAll.addEventListener('change', (e) => {
    if (backlogCheckboxAll.checked) {
      handleBacklogCheckboxAll(true);
      if (addToSprintButton.classList.contains('hidden')) {
        toggleHidden(addToSprintButton);
      }
    } else {
      handleBacklogCheckboxAll(false);
      if (!addToSprintButton.classList.contains('hidden')) {
        toggleHidden(addToSprintButton);
      }
    }
    e.stopPropagation();
  });

  const sprintDropdown = document.getElementById('sprints-dropdown');
  addToSprintButton.addEventListener('click', () => {
    handleAddTaskToSprint(currentSprints, sprintDropdown);
  });

  document.addEventListener('click', (e) => {
    if (
      sprintDropdown.contains(e.target) ||
      addToSprintButton.contains(e.target)
    )
      return;

    if (!sprintDropdown.classList.contains('hidden')) {
      toggleHidden(sprintDropdown);
    }
    e.stopPropagation();
  });

  const checkboxes = document.querySelectorAll('.checkboxes');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      toggleHidden(addToSprintButton);
    }
  });
}

function toggleHidden(element) {
  element.classList.toggle('hidden');
}

async function handleSprintCreate(storyPointInput) {
  const newSprint = {
    projectId: localStorage.getItem('selectedProject'),
    storyPoint: storyPointInput.value,
  };

  await SprintService.createSprint(newSprint);
  await renderDashBoardTasks(localStorage.getItem('selectedProject'));
}

function dropdownEvent(sprint = {}) {
  const nameKey = sprint.key ? sprint.key : `backlog`;
  const dropdownButton = document.getElementById(`dropdownButton-${nameKey}`);
  const dropdownMenu = document.querySelector(`.dropdown-menu-${nameKey}`);
  const emptyMessage = document.querySelector(`#${nameKey}-empty-message`);

  dropdownButton.addEventListener('click', function () {
    dropdownMenu.classList.toggle('hidden');
  });

  const dropdownIcon = document.querySelector(`.dropdown-icon-${nameKey}`);
  dropdownButton.addEventListener('click', function () {
    if (dropdownIcon.classList.contains('rotate-270')) {
      dropdownIcon.classList.remove('rotate-270');
      checkIfEmpty();
    } else {
      dropdownIcon.classList.add('rotate-270');
      if (!emptyMessage.classList.contains('hidden')) {
        toggleHidden(emptyMessage);
      }
    }
  });
}

async function handleCompleteSprint(sprintId, project) {
  const sprint = await SprintService.getSprintById(sprintId);

  let completedTasks = [];
  sprint.result.tasks.forEach((task) => {
    if (task.status === project.columns[project.columns.length - 1]) {
      completedTasks.push(task);
    }
  });

  await SprintService.updateSprint(sprintId, { isCompleted: true, tasks: [] });
  await projectService.updateProject(project._id, { currentSprint: null });
  await renderDashBoardTasks(localStorage.getItem('selectedProject'));
}

async function handleStartSprint(sprint) {
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
      sprint.dueDate = dueDateInput.value;
      const response = await SprintService.updateSprint(sprint._id, sprint);
      await checkIfSprintStarted(response.result);

      setTimeout(() => {
        renderDashBoardTasks(localStorage.getItem('selectedProject'));
      }, 300);
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

function handleBacklogCheckboxAll(isCheckedValue) {
  const backlogBodyChildren = document.getElementById('backlog-body');
  backlogBodyChildren.querySelectorAll('.checkboxes').forEach((box) => {
    box.checked = isCheckedValue;
  });
}

function handleAddTaskToSprint(currentSprints, sprintDropdown) {
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

  await SprintService.addTasksToSprint(dropdownEl.dataset.id, {
    tasks: selectedRows,
  });

  await renderDashBoardTasks(localStorage.getItem('selectedProject'));
}

function checkIfEmpty() {
  const tableBodyEl = document.querySelectorAll('.backlog table tbody');
  tableBodyEl.forEach((tb) => {
    const sprintId = tb.dataset.id;
    const emptyMessageEl = document.querySelector(
      `.empty-message[data-id="${sprintId}"]`
    );

    if (tb.children.length > 0) {
      emptyMessageEl.classList.add('hidden');
      return;
    }

    emptyMessageEl.classList.remove('hidden');
  });
}

async function addDropEvent(
  e,
  parentContainer,
  projectType,
  ifBacklog,
  sprint
) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData('taskId');
  const droppedSprintFrom = JSON.parse(e.dataTransfer.getData('sprint'));
  const elementKey = ifBacklog ? 'backlog' : droppedSprintFrom.key;

  // for preventing drop in same location
  if (parentContainer.querySelector(`[data-id="${taskId}"]`)) {
    return;
  }

  const taskEl = document.querySelector(`.backlog table [data-id="${taskId}"]`);

  taskEl.remove();

  const task = await TaskService.getTaskById(taskId);

  let droppedTask;
  if (projectType === 'kanban') {
    droppedTask = ifBacklog
      ? await createTaskList(task.data.result, 'backlog', projectType, '')
      : await createTaskList(task.data.result, '', 'kanban', sprint);
    addDragEvent(parentContainer, [droppedTask], '');
  } else {
    droppedTask = ifBacklog
      ? await createTaskList(task.data.result, 'backlog', projectType, '')
      : await createTaskList(task.data.result, '', '', sprint);
    addDragEvent(parentContainer, [droppedTask], sprint);
  }

  parentContainer.querySelector(`#${elementKey}-body`)
    ? parentContainer
        .querySelector(`#${elementKey}-body`)
        .appendChild(droppedTask)
    : parentContainer
        .querySelector(`#${sprint.key}-body`)
        .appendChild(droppedTask);

  if (ifBacklog) {
    SprintService.removeTaskFromSprint(droppedSprintFrom._id, {
      task: taskId,
    }).catch((err) => {
      console.error('Failed to update sprint tasks', err);
    });
  } else {
    if (droppedSprintFrom) {
      SprintService.removeTaskFromSprint(droppedSprintFrom._id, {
        task: taskId,
      }).catch((err) => {
        console.error('Failed to update sprint tasks', err);
      });

      SprintService.addTasksToSprint(sprint._id, { tasks: [taskId] }).catch(
        (err) => {
          console.error('Failed to update sprint tasks', err);
        }
      );
    } else {
      SprintService.addTasksToSprint(sprint._id, { tasks: [taskId] }).catch(
        (err) => {
          console.error('Failed to update sprint tasks', err);
        }
      );
    }
  }
  checkIfEmpty();
}

function addDragEvent(parentElement, allTrs, sprint) {
  allTrs.forEach((tr) => {
    tr.classList.add('cursor-grab');
    tr.setAttribute('draggable', 'true');

    tr.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('taskId', tr.dataset.id);

      sprint
        ? e.dataTransfer.setData('sprint', JSON.stringify(sprint))
        : e.dataTransfer.setData('sprint', JSON.stringify(''));

      e.dataTransfer.effectAllowed = 'move';
      tr.classList.remove('cursor-grab');
      tr.classList.add('cursor-grabbing');
    });

    tr.addEventListener('dragend', () => {
      tr.classList.remove('cursor-grabbing');
      tr.classList.add('cursor-grab');
    });

    parentElement.append(tr);
  });
}

async function addStatusOptions(selectContainer, taskStatus) {
  const project = (
    await projectService.getProjectById(localStorage.getItem('selectedProject'))
  ).result;

  project.columns.forEach((column) => {
    const optionEl = document.createElement('option');
    optionEl.innerText = column;
    optionEl.value = column;

    if (column === taskStatus) {
      optionEl.selected = true;
    }
    selectContainer.appendChild(optionEl);
  });
}
