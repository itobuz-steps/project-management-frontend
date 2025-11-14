import '../../../scss/main.css';
import { renderTasksList, renderDashBoardTasks } from '../../utils/renderTasks.js';
import ProjectService from '../../services/ProjectService.js';
import TaskService from '../../services/TaskService.js';
import projectService from '../../services/ProjectService.js';
import taskService from '../../services/TaskService.js';

const toggleBtn = document.querySelector('.toggle-sidebar-btn');
const sidebar = document.querySelector('#sidebar');
// const main = document.querySelector('.main');
const body = document.querySelector('body');

const listTableBody = document.getElementById('table-body');
const sprintTableBody = document.getElementById('sprint-table-body');
const backlogTableBody = document.getElementById('backlog-table-body');

toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('-translate-x-full');
  sidebar.classList.toggle('translate-x-0');
  body.classList.toggle('overflow-hidden');
});

document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !toggleBtn?.contains(e.target)) {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
  }
});

const projectsMenu = document.getElementById('projectsMenu');
const dropdown = document.getElementById('projectsDropdown');

dropdown.classList.add(
  'transition-all',
  'duration-300',
  'overflow-hidden',
  'max-h-0'
);

projectsMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();

  const isOpen = dropdown.classList.contains('max-h-[500px]');

  if (isOpen) {
    dropdown.classList.add('max-h-0');
    dropdown.classList.remove('max-h-[500px]');
    dropdown.classList.add('hidden');
  } else {
    dropdown.classList.remove('hidden');
    setTimeout(() => {
      dropdown.classList.remove('max-h-0');
      dropdown.classList.add('max-h-[500px]');
    }, 10);
  }
});

document.addEventListener('click', (e) => {
  if (!projectsMenu.contains(e.target)) {
    dropdown.classList.remove('max-h-[500px]');
    dropdown.classList.add('max-h-0');
    dropdown.classList.add('hidden');
  }
});

export function dropdownEvent(sprint = {}) {
  const nameKey = sprint.name ? sprint.name : `backlog`;
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

async function showProjectList() {
  try {
    const projects = await ProjectService.getAllProjects();
    const listContainer = document.getElementById('projectsDropdown');
    listContainer.innerHTML = '';
    console.log('projects: ', projects);

    if (!projects.length) {
      listContainer.innerHTML = 'No project Found';
      listContainer.className = 'block p-2 text-gray-900 hover:bg-gray-100';
    } else {
      projects.forEach((project) => {
        const item = document.createElement('li');
        item.dataset.id = project._id;
        item.textContent = project.name;
        item.className =
          'block p-2 text-gray-900 hover:bg-gray-100 rounded-lg [&.selected]:border [&.selected]:border-black-500 [&.selected]:bg-gray-300';
        if (project._id === localStorage.getItem('selectedProject')) {
          item.classList.toggle('selected');
        }
        listContainer.appendChild(item);
      });
    }
  } catch (err) {
    console.error(err.message);
  }
}

const backlogBtn = document.getElementById('backlog-li');
const backlogView = document.getElementById('backlog-view');
backlogBtn.addEventListener('click', () => {
  removeActive(backlogBtn);
  hideAll(backlogView);
});

const boardBtn = document.getElementById('board-li');
const boardView = document.getElementById('board-view');
boardBtn.addEventListener('click', () => {
  removeActive(boardBtn);
  hideAll(boardView);
});

const listBtn = document.getElementById('list-li');
const listView = document.getElementById('list-view');
listBtn.addEventListener('click', () => {
  removeActive(listBtn);
  hideAll(listView);
});

function removeActive(element) {
  [...element.parentElement.children].forEach((child) => {
    child.classList.remove('active');
  });
  element.classList.toggle('active');
}

function hideAll(element) {
  [...element.parentElement.children].forEach((child) => {
    child.classList.add('hidden');
  });
  element.classList.remove('hidden');
}

function checkIfToken() {
  if (!localStorage.getItem('access_token')) {
    window.location.href = 'signup';
  }
}

const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  checkIfToken();
});

const projectDropdownContainer = document.getElementById('projectsDropdown');
projectDropdownContainer.addEventListener('click', (event) => {
  const targetLi = event.target;
  localStorage.setItem('selectedProject', targetLi.dataset.id);

  [...targetLi.parentElement.children].forEach((child) => {
    child.classList.remove('selected');
  });

  targetLi.classList.toggle('selected');
  renderDashboard(localStorage.getItem('selectedProject'));
  listTableBody.innerHTML = "";
  sprintTableBody.innerHTML = "";
  backlogTableBody.innerHTML = "";
  renderTasksList();
  renderDashBoardTasks();
});

const projectName = document.getElementById('projectName');

async function renderDashboard(projectId) {
  const project = await ProjectService.getProjectById(projectId);
  projectName.innerText = project.result.name;
  const projectTasks = await TaskService.getTaskByProjectId(projectId);
  console.log(projectTasks);
}

async function getTaskGroupedByStatus(projectId) {
  const project = (await projectService.getProjectById(projectId)).result;
  const result = {};

  project.columns.forEach((column) => (result[column] = []));

  const tasks = await taskService.getTaskByProjectId(projectId);

  tasks.data.result.forEach((task) => result[task.status].push(task));

  return result;
}

async function renderBoard(projectId) {
  const columns = await getTaskGroupedByStatus(projectId);
  const project = (await projectService.getProjectById(projectId)).result;

  const columnContainer = document.getElementById('columns');
  columnContainer.innerHTML = '';

  project.columns.forEach((column) => {
    const columnEl = document.createElement('div');
    columnEl.innerHTML = `<div
                class="w-72 bg-white rounded-lg shadow p-4 shrink-0 h-full overflow-y-auto"
              >
                <h2
                  class="text-lg font-semibold mb-3 border-b pb-2 sticky top-0 bg-white z-10"
                >
                  ${column.toUpperCase()}
                </h2>
                <div class="space-y-3 pb-4 class" id="task-list">
                </div>
              </div>
    `;

    const tasks = columns[column];
    tasks.forEach((task) => {
      const taskEl = document.createElement('div');
      taskEl.className =
        'task flex flex-col max-w-sm p-4 bg-gray-100 text-black gap-4 relative';
      taskEl.innerHTML = `
      <div class="card-header flex justify-between items-center">
        <p class="text-lg font-medium">${task.title}</p>

        <!-- Menu -->
        <div class="relative">
          <button class="outline-none menu-button">
            <svg
              width="18px"
              height="18px"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              fill="#00000"
              class="bi bi-three-dots mr-2"
            >
              <path
                d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
              />
            </svg>
          </button>

          <div
            class="dropdown-menu hidden absolute right-0 w-32 bg-white border border-gray-200 rounded shadow-lg z-10 "
          >
            <ul class="text-sm text-gray-700">
              <li>
                <button
                  class="edit-btn block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Edit
                </button>
              </li>
              <li>
                <button
                  class="delete-btn block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Delete
                </button>
              </li>
              <li>
                <button
                  class="move-btn block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Move To
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="card-footer flex justify-between items-center text-sm text-gray-400"
      >
        <div class="flex items-center gap-2">
          <span

            class="type-tag bg-green-600 text-white text-xs font-semibold py-1 px-2 rounded-sm"
            >${task.key}</span
          >

          <select
            class="type-selector text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none"
          >
            <option value="story" selected>Story</option>
            <option value="task">Task</option>
          </select>
        </div>

        <!-- Avatar -->
        <div class="flex items-center">
          <span
            class="w-8 h-8 text-white font-semibold rounded-full bg-blue-500 flex items-center justify-center"
            >SG</span
          >
        </div>
      </div>`;
      const menuButton = taskEl.querySelector('.menu-button');
      const dropdownMenu = taskEl.querySelector('.dropdown-menu');
      const typeTag = taskEl.querySelector('.type-tag');
      const typeSelector = taskEl.querySelector('.type-selector');

      menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
      });

      taskEl.querySelector('.edit-btn').addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
      });
      taskEl.querySelector('.delete-btn').addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
      });
      taskEl.querySelector('.move-btn').addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
      });

      typeSelector.addEventListener('change', (e) => {
        const value = e.target.value;

        if (value === 'task') {
          typeTag.className =
            'bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded-sm';
          typeTag.textContent = 'TASK';
        } else {
          typeTag.className =
            'bg-green-600 text-white text-xs font-semibold py-1 px-2 rounded-sm';
          typeTag.textContent = 'STORY';
        }
      });

      columnEl.querySelector('#task-list').appendChild(taskEl);
    });

    columnContainer.appendChild(columnEl);
  });
}

renderDashboard(localStorage.getItem('selectedProject'));
checkIfToken();
showProjectList();
renderTasksList();
renderDashBoardTasks();
renderTasks();
renderBoard(localStorage.getItem('selectedProject'));
