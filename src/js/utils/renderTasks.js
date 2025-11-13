import SprintService from '../services/SprintService.js';
import TaskService from '../services/TaskService.js';

const listTableBody = document.getElementById('table-body');
const sprintTableBody = document.getElementById('sprint-table-body');
const backlogTableBody = document.getElementById('backlog-table-body');

const emptySprintContainer = document.getElementById('empty-sprint-container');
const emptyBacklogContainer = document.getElementById('empty-backlog-container');
const emptyListContainer = document.getElementById('empty-list-container');

export async function createTaskList(task) {
  const tr = document.createElement('tr');

  const reporter = task.reporter ? (await TaskService.getUserDetailsById(task.reporter)).data.result : "";
  const assignee = task.assignee ? (await TaskService.getUserDetailsById(task.assignee)).data.result : "";

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
                      <td class="px-6 py-4">${task.description}</td>
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

export async function renderTasksList() {
  try {
    let tasksArray = [];
    const tasks = await TaskService.getTaskByProjectId(localStorage.getItem('selectedProject'));
    tasksArray.push(...tasks.data.result);

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

export async function renderDashBoardTasks() {
  try {
    const projectId = localStorage.getItem('selectedProject');
    const tasks = await TaskService.getTaskByProjectId(projectId);
    const tasksSet = new Set(tasks.data.result.map((task) => task._id));

    const sprints = await SprintService.getAllSprints(projectId);
    const taskWithSprint = []
    sprints.result.forEach((sprint) => taskWithSprint.push(sprint.tasks));

    const sprintTaskSet = new Set(...taskWithSprint);
    console.log(tasksSet, sprintTaskSet)
    console.log();

    const taskWithoutSprint = Array.from(tasksSet.difference(sprintTaskSet))

    console.log({ taskWithSprint, taskWithoutSprint })

    if (!taskWithSprint.length) {
      emptySprintContainer.classList.remove('hidden');
    } else {
      emptySprintContainer.classList.add('hidden');
      for (const taskId of taskWithSprint) {
        const task = await TaskService.getTaskById(taskId)
        const tr = await createTaskList(task.data.result);
        sprintTableBody.append(tr);
      }
    }

    if (!taskWithoutSprint.length) {
      emptyBacklogContainer.classList.remove('hidden');
    } else {
      emptyBacklogContainer.classList.add('hidden');
      for (const taskId of taskWithoutSprint) {
        const task = await TaskService.getTaskById(taskId)
        const tr = await createTaskList(task.data.result);
        backlogTableBody.append(tr);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}
