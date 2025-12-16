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

  let sprintKey = sprint?.key ? sprint.key : 'no sprint found';

  const tr = document.createElement('tr');

  const reporter = task.reporter
    ? (await TaskService.getUserDetailsById(task.reporter)).data.result
    : '';
  const assignee = task.assignee
    ? (await TaskService.getUserDetailsById(task.assignee)).data.result.name
    : 'unassigned';

  tr.classList =
    ' border-b border-gray-400 hover:bg-white/90 whitespace-nowrap  bg-white/80 backdrop:blur-lg';
  console.log(task._id);
  tr.dataset.id = task._id;
  tr.innerHTML = /*html*/ `
    <td class="w-4 p-4 ${ifSprint} ${ifKanban}">
      <div class="flex items-center">
        <input
            id="checkbox-all-search"
            type="checkbox"
            class="checkboxes w-3.5 h-3.5 text-purple-600 bg-purple-100 border-purple-300 rounded-sm accent-violet-500 focus:ring-violet-600"
            data-id=${task._id}
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
        class="h-4 stroke-purple-800 px-7"
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
  sprintContainer.className = 'border-l-3 border-purple-700 p-1 rounded-t';
  sprintContainer.innerHTML = /*html*/ `
                  <form class="hidden flex md:justify-end gap-1 h-7.5" id="${sprint.key}-start-form">
                    <input
                        type="date"
                        name="dueDate"
                        id="${sprint.key}-due-date"
                        class="w-28 md:w-30 bg-purple-50 border border-purple-300 text-black text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block px-1 required"
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
                  <div class="flex flex-col pb-4">
                    <button
                      type="button"
                      class="flex items-center w-30 md:w-fit gap-3 rounded-md text-lg font-semibold text-purple-100 hover:text-white cursor-pointer focus:outline-none dropdownButton"
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
                    <div class="flex ml-6 items-center gap-1" >      
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-indigo-300">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier"> 
                          <path d="M12 7V12L14.5 10.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="inherit" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          </path> 
                        </g>
                      </svg>
                    <p id="${sprint.key}-due-date-preview" class="text-sm text-center text-indigo-300 text-[10px] md:text-md font-semibold">
   
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
                  class="dropdown-menu-${sprint.key} relative overflow-x-auto shadow rounded-lg sm:rounded-lg no-scrollbar"
                >
                  <table class="w-full text-sm text-left rtl:text-right">
                    <thead
                      class="text-xm text-purple-100 uppercase bg-purple-900 border-b border-purple-900 hover:bg-purple-800 sticky"
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
                    <tbody id="${sprint.key}-body"></tbody>
                  </table>
                </div>
                <div
                  class="text-center w-full flex justify-center hidden"
                  id="${sprint.key}-empty-message"
                >
                  No tasks found!
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

  backlogContainer.className = 'border-l-3 border-purple-700 p-1 rounded-t';

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


                <div class="relative flex justify-between text-left items-center">
                  <div class="flex items-center justify-center">
                    <button
                      type="button"
                      class="flex items-center justify-center w-30 gap-5 round ed-md px-2 py-2 text-lg font-semibold text-purple-50 cursor-pointer focus:outline-none"
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
                      class="text-xm text-purple-100 uppercase bg-purple-900 border-b border-purple-900 hover:bg-purple-800 sticky"
                    >
                      <tr>
                        <th scope="col" class="p-4 ${ifKanban}">
                          <div class="flex items-center">
                            <input
                              id="backlog-checkbox-all"
                              type="checkbox"
                              class="w-3.5 h-3.5 text-purple-200 bg-purple-100 border-purple-600 rounded-sm accent-violet-200 focus:ring-violet-600"
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
                    <tbody id="backlog-body"></tbody>
                  </table>
                </div>
                <div
                  class="hidden text-center w-full flex justify-center text-gray-400 font-bold p-4 text-lg bg-white/80 backdrop:blur-lg"
                  id="backlog-empty-message"
                >
                  No tasks found!
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
  allTrs.forEach((tr) => {
    sprintTaskBody.append(tr);
  });
}
async function renderBacklogTasks(
  backlogBody,
  backlogTasks,
  addToSprintButton,
  projectType
) {
  let promiseArray = [];
  for (const taskId of backlogTasks) {
    const task = await TaskService.getTaskById(taskId);
    promiseArray.push(
      createTaskList(task.data.result, 'backlog', projectType, '')
    );
  }
  const allTrs = await Promise.all(promiseArray);
  allTrs.forEach((tr) => {
    tr.classList.add('cursor-grab');
    tr.setAttribute('draggable', 'true');

    tr.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('taskId', tr.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
      tr.classList.remove('cursor-grab');
      tr.classList.add('cursor-grabbing');
    });

    tr.addEventListener('dragend', () => {
      tr.classList.remove('cursor-grabbing');
      tr.classList.add('cursor-grab');
      checkIfEmpty(
        document.getElementById('backlog-body'),
        document.getElementById('backlog-empty-message')
      );
    });

    backlogBody.append(tr);
    const checkbox = tr.querySelector('.checkboxes');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked && addToSprintButton.classList.contains('hidden')) {
        toggleHidden(addToSprintButton);
      }
    });
  });
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
    console.log({ allTasks, allSprintTasks, backlogTasks });

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
          renderSprintTasks(sprint, sprintTasks, 'kanban');
        } else {
          renderSprintTasks(sprint, sprintTasks, '');
        }
      }

      newSprint.addEventListener('dragover', (e) => e.preventDefault());
      newSprint.addEventListener('drop', async (e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const taskEl = document.querySelector(
          `.backlog table [data-id="${taskId}"]`
        );
        taskEl.remove();

        const task = await TaskService.getTaskById(taskId);
        let droppedTask;
        if (project.result.projectType === 'kanban') {
          droppedTask = await createTaskList(
            task.data.result,
            '',
            'kanban',
            sprint
          );
        } else {
          droppedTask = await createTaskList(task.data.result, '', '', sprint);
        }
        newSprint.querySelector(`#${sprint.key}-body`).appendChild(droppedTask);

        SprintService.addTasksToSprint(sprint._id, { tasks: [taskId] }).catch(
          (err) => {
            console.error('Failed to update sprint tasks', err);
          }
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

          //await handleCompleteSprint(sprint._id, response.result);

          showConfirmModal(
            'Are you sure you want to complete this sprint?',
            async () => {
              await handleCompleteSprint(sprint._id, response.result);
            }
          );
        });
      }
    });

    if (project.result.projectType === 'kanban') {
      const backlogTable = createBacklogTable('kanban');
      sprintBacklogWrapper.append(backlogTable);
    } else {
      const backlogTable = createBacklogTable('');
      sprintBacklogWrapper.append(backlogTable);
    }
    dropdownEvent();

    const addToSprintButton = document.getElementById('add-to-sprint-button');
    const backlogBody = document.getElementById('backlog-body');
    const backlogEmptyMessage = document.getElementById(
      'backlog-empty-message'
    );
    if (!backlogTasks.length) {
      backlogEmptyMessage.classList.remove('hidden');
    } else {
      backlogEmptyMessage.classList.add('hidden');
      if (project.result.projectType === 'kanban') {
        renderBacklogTasks(
          backlogBody,
          backlogTasks,
          addToSprintButton,
          'kanban'
        );
      } else {
        renderBacklogTasks(backlogBody, backlogTasks, addToSprintButton, '');
      }
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

  dropdownButton.addEventListener('click', function () {
    dropdownMenu.classList.toggle('hidden');
  });

  const dropdownIcon = document.querySelector(`.dropdown-icon-${nameKey}`);
  dropdownButton.addEventListener('click', function () {
    if (dropdownIcon.classList.contains('rotate-270')) {
      dropdownIcon.classList.remove('rotate-270');
    } else {
      dropdownIcon.classList.add('rotate-270');
    }
  });
}

async function handleCompleteSprint(sprintId, project) {
  const sprint = await SprintService.getSprintById(sprintId);
  console.log(sprint);
  await SprintService.updateSprint(sprintId, { isCompleted: true });
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
      console.log('A sprint is already is running');
      toggleStartSprintForm();
    } else {
      sprint.dueDate = dueDateInput.value;
      const response = await SprintService.updateSprint(sprint._id, sprint);
      await checkIfSprintStarted(response.result);
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
  // [...backlogBodyChildren.children].forEach((child) => { child.querySelector('.checkboxes'); });
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

function checkIfEmpty(element1, element2) {
  if (!element1.childElementCount && element2.classList.contains('hidden')) {
    element2.classList.remove('hidden');
  }
}
