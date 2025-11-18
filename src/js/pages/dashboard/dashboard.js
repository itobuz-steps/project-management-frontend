import '../../../scss/main.css';
import {
  renderTasksList,
  renderDashBoardTasks,
} from '../../utils/renderTasks.js';
import projectService from '../../services/ProjectService.js';
import taskService from '../../services/TaskService.js';

const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

profileBtn.addEventListener('click', () => {
  dropdownMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.add('hidden');
  }
});

const toggleBtn = document.querySelector('.toggle-sidebar-btn');
const sidebar = document.querySelector('#sidebar');
// const main = document.querySelector('.main');
const body = document.querySelector('body');
const openProjectBtn = document.getElementById('plus-icon');
const createProjectModal = document.getElementById('create-project-modal');
const closeProjectBtn = document.getElementById('close-button');
const projectCreateForm = document.getElementById('project-form');

const filterBox = document.getElementById('filterBox');
const mainDropdown = document.getElementById('mainDropdown');
const subDropdowns = document.querySelectorAll('.subDropdown');

filterBox.addEventListener('click', (e) => {
  e.stopPropagation();
  mainDropdown.classList.toggle('hidden');
  subDropdowns.forEach((d) => d.classList.add('hidden'));
});

document.querySelectorAll('.dropdown-item').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = item.getAttribute('data-target');

    subDropdowns.forEach((d) => d.id !== target && d.classList.add('hidden'));
    document.getElementById(target).classList.toggle('hidden');
  });
});

document.addEventListener('click', () => {
  mainDropdown.classList.add('hidden');
  subDropdowns.forEach((d) => d.classList.add('hidden'));
});

openProjectBtn.addEventListener('click', () => {
  createProjectModal.classList.remove('hidden');
});
closeProjectBtn.addEventListener('click', () => {
  createProjectModal.classList.add('hidden');
});

// temp
projectCreateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const projectType = document.getElementById('projectType').value;
  const columnInput = document.getElementById('columns').value;

  let columns = [];
  if (columnInput) {
    columns = columnInput
      .split(',')
      .map((col) => col.trim())
      .filter((col) => col.length > 0);
  }

  const projectData = {
    name,
    projectType,
    columns,
  };

  try {
    const createdProject = await projectService.createProject(projectData);
    console.log(createdProject);

    // form.reset();
    // modal.classList.add('hidden');
  } catch (error) {
    console.error(error.message);
  }
});

// tmp

//task create

const openTaskCreate = document.getElementById('create-task');
const closeTaskModal = document.getElementById('close-task-modal');
const createTaskModal = document.getElementById('create-task-modal');

openTaskCreate.addEventListener('click', () => {
  createTaskModal.classList.remove('hidden');
});
closeTaskModal.addEventListener('click', () => {
  createTaskModal.classList.add('hidden');
});

//temp form submission // submission yet to be handled correctly
const input = document.getElementById('attachments');
const fileName = document.getElementById('file-name');
const taskForm = document.getElementById('task-form');

input.addEventListener('change', () => {
  if (input.files.length > 0) {
    fileName.textContent = Array.from(input.files)
      .map((file) => file.name)
      .join(', ');
  } else {
    fileName.textContent = 'No Files Chosen';
  }
});
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Build the task object from form inputs
  const task = {
    projectId: '69156d314a8b5c98fff3fb48',
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    type: document.getElementById('type').value,
    priority: document.getElementById('priority').value,
    status: document.getElementById('status').value,

    tags: document.getElementById('tags').value
      ? document
          .getElementById('tags')
          .value.split(',')
          .map((t) => t.trim())
      : [],

    block: document.getElementById('block').value
      ? document
          .getElementById('block')
          .value.split(',')
          .map((t) => t.trim())
      : [],

    blockedBy: document.getElementById('BlockedBy').value
      ? document
          .getElementById('BlockedBy')
          .value.split(',')
          .map((t) => t.trim())
      : [],

    relatesTo: document.getElementById('relatesTo').value
      ? document
          .getElementById('relatesTo')
          .value.split(',')
          .map((t) => t.trim())
      : [],

    dueDate: document.getElementById('dueDate').value,
    assignee: document.getElementById('assignee').value.trim(),

    attachments: input.files,
  };

  try {
    const response = await taskService.createTask(task);

    console.log('Task created:', response);
    alert('Task created successfully!');

    taskForm.reset();
    fileName.textContent = 'No file chosen';
  } catch (error) {
    console.error(error);
    alert('Failed to create task');
  }
});

//end for tasks

const listTableBody = document.getElementById('table-body');

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

// dropdown.classList.add(
//   'transition-all',
//   'duration-300',
//   'overflow-y-auto',
//   'max-h-0'
// );

projectsMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();

  const isOpen = dropdown.classList.contains('max-h-60');

  if (isOpen) {
    dropdown.classList.remove('max-h-60');
    dropdown.classList.add('max-h-0');
    setTimeout(() => dropdown.classList.add('hidden'), 200);
  } else {
    dropdown.classList.remove('hidden');
    dropdown.classList.remove('max-h-0');
    dropdown.classList.add('max-h-60');
  }
});

document.addEventListener('click', (e) => {
  if (!projectsMenu.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove('max-h-60');
    dropdown.classList.add('max-h-0');
    setTimeout(() => dropdown.classList.add('hidden'), 200);
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
    const projects = await projectService.getAllProjects();
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
  listTableBody.innerHTML = '';
  renderDashBoardTasks();
  renderTasksList();
  renderBoard(localStorage.getItem('selectedProject'));
});

async function renderDashboard(project) {
  const projectName = document.getElementById('projectName');

  projectName.innerText = project.name;
  projectName.innerText = project.name;
}

async function getTaskGroupedByStatus(projectId, filter, searchInput) {
  const project = (await projectService.getProjectById(projectId)).result;
  const result = {};

  project.columns.forEach((column) => (result[column] = []));

  const tasks = await taskService.getTaskByProjectId(
    projectId,
    filter,
    searchInput
  );

  tasks.data.result.forEach((task) => result[task.status].push(task));

  // console.log(result);
  // let emptyResult = [];
  // emptyResult["todo"].push([{}]);
  // console.log(emptyResult);
  return result;
}

async function renderBoard(projectId, filter = '', searchInput = '') {
  const columns = await getTaskGroupedByStatus(projectId, filter, searchInput);
  const project = (await projectService.getProjectById(projectId)).result;

  renderDashboard(project);

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

const searchForm = document.getElementById('search-input-form');
const searchInput = document.getElementById('search-input-field');
searchInput.addEventListener('input', handleSearch);
searchForm.addEventListener('submit', handleSearch);

function handleSearch(e) {
  e.preventDefault();
  renderBoard(
    localStorage.getItem('selectedProject'),
    '',
    searchInput.value.trim()
  );
}

checkIfToken();
renderBoard(localStorage.getItem('selectedProject'));
showProjectList();
renderTasksList();
renderDashBoardTasks();
