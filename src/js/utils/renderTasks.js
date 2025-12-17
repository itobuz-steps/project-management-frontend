import projectService from '../services/ProjectService.js';
import SprintService from '../services/SprintService.js';
import TaskService from '../services/TaskService.js';
import { showConfirmModal } from './modals/confirmationModal.js';

const listTableBody = document.getElementById('table-body');
const emptyListContainer = document.getElementById('empty-list-container');

const sprintBacklogWrapper = document.getElementById('sprint-backlog-wrapper');

async function createTaskList(task, type, projectType, sprint) {
  let ifSprint = `hidden`;
  if (type === 'backlog') {
    ifSprint = ``;
  }

  let labels;
  if (!task.tags.length) {
    labels = 'no labels';
  } else {
    labels = task.tags.join(' ');
  }

  let ifKanban = '';
  if (projectType === 'kanban') {
    ifKanban = 'hidden';
  }

  let typeSvg;
  if (task.type === 'task') {
    typeSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-labelledby="checkboxIconTitle" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" color="#000000" class="h-4 stroke-blue-800"> <g id="SVGRepo_bgCarrier" stroke-width="0"></g> <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" ></g> <g id="SVGRepo_iconCarrier"> <title id="checkboxIconTitle"> Checkbox (selected) </title> <rect x="21" y="3" width="18" height="18" rx="1" transform="rotate(90 21 3)" ></rect> <path d="M6.66666 12.6667L9.99999 16L17.3333 8.66669"></path> </g> </svg>`;
  } else if (task.type === 'story') {
    typeSvg = `<svg class="h-4" viewBox="-4 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>bookmark</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-419.000000, -153.000000)" fill="#00b31e"> <path d="M437,153 L423,153 C420.791,153 419,154.791 419,157 L419,179 C419,181.209 420.791,183 423,183 L430,176 L437,183 C439.209,183 441,181.209 441,179 L441,157 C441,154.791 439.209,153 437,153" id="bookmark" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>`;
  } else {
    typeSvg = `<svg class="h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 14.3333C7 13.0872 7 12.4641 7.26795 12C7.44349 11.696 7.69596 11.4435 8 11.2679C8.4641 11 9.08718 11 10.3333 11H13.6667C14.9128 11 15.5359 11 16 11.2679C16.304 11.4435 16.5565 11.696 16.7321 12C17 12.4641 17 13.0872 17 14.3333V16C17 16.9293 17 17.394 16.9231 17.7804C16.6075 19.3671 15.3671 20.6075 13.7804 20.9231C13.394 21 12.9293 21 12 21C11.0707 21 10.606 21 10.2196 20.9231C8.63288 20.6075 7.39249 19.3671 7.07686 17.7804C7 17.394 7 16.9293 7 16V14.3333Z" fill="#db0000" stroke="#db0000" stroke-width="2"></path> <path d="M9 9C9 8.06812 9 7.60218 9.15224 7.23463C9.35523 6.74458 9.74458 6.35523 10.2346 6.15224C10.6022 6 11.0681 6 12 6C12.9319 6 13.3978 6 13.7654 6.15224C14.2554 6.35523 14.6448 6.74458 14.8478 7.23463C15 7.60218 15 8.06812 15 9V11H9V9Z" fill="#db0000" stroke="#db0000" stroke-width="2"></path> <path d="M12 11V15" stroke="#db0000" stroke-width="2"></path> <path d="M15 3L13 6" stroke="#db0000" stroke-width="2"></path> <path d="M9 3L11 6" stroke="#db0000" stroke-width="2"></path> <path d="M7 16H2" stroke="#db0000" stroke-width="2"></path> <path d="M22 16H17" stroke="#db0000" stroke-width="2"></path> <path d="M20 9V10C20 11.6569 18.6569 13 17 13V13" stroke="#db0000" stroke-width="2"></path> <path d="M20 22V22C20 20.3431 18.6569 19 17 19V19" stroke="#db0000" stroke-width="2"></path> <path d="M4 9V10C4 11.6569 5.34315 13 7 13V13" stroke="#db0000" stroke-width="2"></path> <path d="M4 22V22C4 20.3431 5.34315 19 7 19V19" stroke="#db0000" stroke-width="2"></path> </g></svg>`;
  }

  let sprintKey = sprint?.key ? sprint.key : 'no sprint found';

  const tr = document.createElement('tr');

  const reporter = task.reporter
    ? (await TaskService.getUserDetailsById(task.reporter)).data.result
    : '';
  const assignee = task.assignee
    ? (await TaskService.getUserDetailsById(task.assignee)).data.result.name
    : 'unassigned';

  tr.classList =
    'bg-white border-b border-gray-500 hover:bg-gray-100 whitespace-nowrap';
  console.log(task._id);
  tr.dataset.id = task._id;
  tr.innerHTML = `
                      <td class="w-4 p-4 ${ifSprint} ${ifKanban}">
                        <div class="flex items-center">
                          <input
                            id="checkbox-all-search"
                            type="checkbox"
                            class="checkboxes w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm accent-cyan-500 focus:ring-cyan-600"
                            data-id=${task._id}
                          />
                        </div>
                      </td>
                      <td class="px-6 py-4">
                      ${typeSvg}
                      </td>
                      <td class="px-6 py-4">${task.key}</td>
                      <td class="px-6 py-4">${task.title}</td>
                      <td class="px-6 py-4">${task.status}</td>
                      <td class="px-6 py-4 ${ifKanban}">${sprintKey}</td>
                      <td class="px-6 py-4">${assignee}</td>
                      <td class="px-4 py-4">${task.dueDate.split('T')[0]}</td>
                      <td class="px-6 py-4">${labels}</td>
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
                  <form class="hidden flex md:justify-end gap-1 h-7.5" id="${sprint.key}-start-form">
                    <input
                        type="date"
                        name="dueDate"
                        id="${sprint.key}-due-date"
                        class="w-28 md:w-30 bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-1 required"
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


                <div class="relative flex justify-between text-left">
                  <div class="flex align-middle ">
                    <button
                      type="button"
                      class="flex items-center w-30 md:w-fit gap-2 rounded-md px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none dropdownButton"
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
                      <p class="w-fit">
                      ${sprint.key}
                      </p>
                    </button>
                  </div>

                  <div class="flex flex-col md:flex-row md:items-center md:gap-3">
                  <p id="${sprint.key}-due-date-preview" class="text-sm text-center"></p>
                  
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
                  class="dropdown-menu-${sprint.key} relative overflow-x-auto shadow rounded-lg sm:rounded-lg no-scrollbar"
                >
                  <table class="w-full text-sm text-left rtl:text-right">
                    <thead
                      class="text-xm text-gray-700 uppercase bg-gray-200 border-b border-gray-500 hover:bg-gray-100 sticky"
                    >
                      <tr>
                        
                        <th scope="col" class="px-6 py-3">Type</th>
                        <th scope="col" class="px-6 py-3">Key</th>
                        <th scope="col" class="px-6 py-3">Summary</th>
                        <th scope="col" class="px-6 py-3">Status</th>
                        <th scope="col" class="px-6 py-3">Sprint</th>
                        <th scope="col" class="px-6 py-3">Assignee</th>
                        <th scope="col" class="px-4 py-3">Due Date</th>
                        <th scope="col" class="px-6 py-3">Labels</th>
                        <th scope="col" class="px-6 py-3">Created</th>
                        <th scope="col" class="px-6 py-3">Updated</th>
                        <th scope="col" class="px-6 py-3">Reporter</th>
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
 `;
  return sprintContainer;
}

function createBacklogTable(projectType) {
  let ifKanban = '';
  if (projectType === 'kanban') {
    ifKanban = 'hidden';
  }

  const backlogContainer = document.createElement('div');

  backlogContainer.innerHTML = `
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


                <div class="relative flex justify-between text-left">
                  <div class="flex align-middle">
                    <button
                      type="button"
                      class="flex items-center w-30 gap-2 rounded-md px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
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
                  class="dropdown-menu-backlog relative overflow-x-auto shadow rounded-lg sm:rounded-lg"
                >
                  <table class="w-full text-sm text-left rtl:text-right">
                    <thead
                      class="text-xm text-gray-700 uppercase bg-gray-200 border-b border-gray-500 hover:bg-gray-100 sticky"
                    >
                      <tr>
                        <th scope="col" class="p-4 ${ifKanban}">
                          <div class="flex items-center">
                            <input
                              id="backlog-checkbox-all"
                              type="checkbox"
                              class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm accent-cyan-500 focus:ring-cyan-600"
                            />
                          </div>
                        </th>
                        <th scope="col" class="px-6 py-3">Type</th>
                        <th scope="col" class="px-6 py-3">Key</th>
                        <th scope="col" class="px-6 py-3">Summary</th>
                        <th scope="col" class="px-6 py-3">Status</th>
                        <th scope="col" class="px-6 py-3 ${ifKanban}">Sprint</th>
                        <th scope="col" class="px-6 py-3">Assignee</th>
                        <th scope="col" class="px-4 py-3">Due Date</th>
                        <th scope="col" class="px-6 py-3">Labels</th>
                        <th scope="col" class="px-6 py-3">Created</th>
                        <th scope="col" class="px-6 py-3">Updated</th>
                        <th scope="col" class="px-6 py-3">Reporter</th>
                      </tr>
                    </thead>
                    <tbody id="backlog-body" data-id="backlog"></tbody>
                  </table>
                </div>
                <div
                  class="empty-message text-center w-full flex h-15 items-center justify-center hidden border border-dotted rounded-lg hover:border-purple-600 "
                  id="backlog-empty-message"
                  data-id="backlog"
                >
                  Create tasks...
                </div>

  `;
  return backlogContainer;
}

export async function renderTasksList(tasksArray = [], projectType, sprint) {
  try {
    listTableBody.innerHTML = '';
    const sprintTh = document.getElementById('list-table-sprint');

    if (!tasksArray.length) {
      emptyListContainer.classList.remove('hidden');
    } else {
      emptyListContainer.classList.add('hidden');
      let promiseArray = [];
      for (const task of tasksArray) {
        if (projectType === 'kanban') {
          sprintTh.classList.add('hidden');
        } else {
          sprintTh.classList.remove('hidden');
        }
        promiseArray.push(createTaskList(task, 'list', projectType, sprint));
      }
      const allTrs = await Promise.all(promiseArray);
      allTrs.forEach((tr) => {
        listTableBody.append(tr);
      });
    }
  } catch (error) {
    console.error(error.message);
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
  const allTrs = await Promise.all(promiseArray);
  console.log(sprint);

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
        createTaskList(task.data.result, 'backlog', project.projectType, '')
      );
    }
  }

  const allTrs = await Promise.all(promiseArray);

  allTrs.forEach((tr) => {
    const checkbox = tr.querySelector('.checkboxes');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked && addToSprintButton.classList.contains('hidden')) {
        toggleHidden(addToSprintButton);
      }
    });
  });
  addDragEvent(document.getElementById('backlog-body'), allTrs, '');
  checkIfEmpty();
}

export async function renderDashBoardTasks() {
  try {
    listTableBody.innerHTML = '';
    sprintBacklogWrapper.innerHTML = '';
    const projectId = localStorage.getItem('selectedProject');
    const tasks = await TaskService.getTaskByProjectId(projectId);
    const project = await projectService.getProjectById(projectId);
    const allTasks = tasks.data.result.map((task) => task._id);

    const sprints = await SprintService.getAllSprints(projectId);

    const allSprintTasks = [];
    sprints.result.forEach((sprint) => allSprintTasks.push(...sprint.tasks));

    const backlogTasks = allTasks.filter(
      (task) => !allSprintTasks.includes(task)
    );
    const incompleteBacklogTasks = backlogTasks.filter(
      (task) =>
        task.status !==
        project.result.columns[project.result.columns.length - 1]
    );

    console.log({
      allTasks,
      allSprintTasks,
      backlogTasks,
      incompleteBacklogTasks,
    });

    const currentSprints = sprints.result.filter(
      (sprint) => !sprint.isCompleted
    );
    console.log(currentSprints, sprints);

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

        dueDatePreview.innerText = new Date(
          sprint.dueDate
        ).toLocaleDateString();

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
      await addDropEvent(
        e,
        backlogTable,
        'project.result.projectType',
        true,
        ''
      );
    });

    const addToSprintButton = document.getElementById('add-to-sprint-button');
    const backlogBody = document.getElementById('backlog-body');
    const backlogEmptyMessage = document.getElementById(
      'backlog-empty-message'
    );

    if (!incompleteBacklogTasks.length) {
      backlogEmptyMessage.classList.remove('hidden');
    } else {
      backlogEmptyMessage.classList.add('hidden');

      await renderBacklogTasks(
        backlogBody,
        incompleteBacklogTasks,
        addToSprintButton,
        project.result
      );
    }

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
  } catch (error) {
    console.error(error.message);
  }
}

function toggleHidden(element) {
  element.classList.toggle('hidden');
}

async function handleSprintCreate(storyPointInput) {
  const newSprint = {
    projectId: localStorage.getItem('selectedProject'),
    storyPoint: storyPointInput.value,
  };

  const response = await SprintService.createSprint(newSprint);
  console.log('Sprint created', response);
  await renderDashBoardTasks();
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
  console.log(sprint);

  let completedTasks = [];
  sprint.result.tasks.forEach((task) => {
    if (task.status === project.columns[project.columns.length - 1]) {
      completedTasks.push(task);
    }
  });

  await SprintService.updateSprint(sprintId, { isCompleted: true, tasks: [] });
  await projectService.updateProject(project._id, { currentSprint: null });
  await renderDashBoardTasks();
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
      console.log('A sprint is already running');
      toggleStartSprintForm();
    } else {
      sprint.dueDate = dueDateInput.value;
      const response = await SprintService.updateSprint(sprint._id, sprint);
      await checkIfSprintStarted(response.result);
      setTimeout(() => {
        renderDashBoardTasks();
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
      console.log(checkbox);
      selectedRows.push(checkbox.dataset.id);
    }
  });

  console.log(dropdownEl.dataset.id, selectedRows);
  await SprintService.addTasksToSprint(dropdownEl.dataset.id, {
    tasks: selectedRows,
  });
  await renderDashBoardTasks();
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

    console.log(tableBodyEl, emptyMessageEl);
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

  console.log(taskEl);
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
