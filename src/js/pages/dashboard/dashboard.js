import '../../../scss/main.css';
import {
  renderTasksList,
  renderDashBoardTasks,
} from '../../utils/renderTasks.js';
import projectService from '../../services/ProjectService.js';
import taskService from '../../services/TaskService.js';
import commentService from '../../services/CommentService.js';
import axios from 'axios';
import { setupSocketIo } from '../../utils/setupNotification.js';

const profileBtn = document.getElementById('profileBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const drawerBackdrop = document.querySelector('.drawer-backdrop');

profileBtn.addEventListener('click', () => {
  dropdownMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.add('hidden');
  }
  e.stopPropagation();
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

document.addEventListener('click', (e) => {
  mainDropdown.classList.add('hidden');
  subDropdowns.forEach((d) => d.classList.add('hidden'));
  e.stopPropagation();
});

// temp
projectCreateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const projectType = document.getElementById('projectType').value;
  const columnInput = document.getElementById('project-columns').value;
  console.log(columnInput);

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

    createProjectModal.classList.add('hidden');

    renderBoard(localStorage.getItem('selectedProject'));
    // renderTasksList();
    renderDashBoardTasks();

    console.log(createdProject);
  } catch (error) {
    console.error(error.message);
  }
});

openProjectBtn.addEventListener('click', () => {
  createProjectModal.classList.remove('hidden');
});
closeProjectBtn.addEventListener('click', () => {
  createProjectModal.classList.add('hidden');
});

// tmp

//task create

const openTaskCreate = document.getElementById('create-task');
const closeTaskModal = document.getElementById('close-task-modal');
const createTaskModal = document.getElementById('create-task-modal');
const createModalStatusDropdown = document.getElementById(
  'status-create-task-modal'
);
const createModalAssigneeDropdown = document.getElementById(
  'create-modal-assignee'
);

openTaskCreate.addEventListener('click', () => {
  createTaskModal.classList.remove('hidden');
  handleModalStatus(createModalStatusDropdown);
  handleModalAssignee(createModalAssigneeDropdown);
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

async function populateAssigneeDropDown() {
  const projectId = localStorage.getItem('selectedProject');
  const assigneeDropdown = document.getElementById('assignee');
  const data = await projectService.getProjectMembers(projectId);

  assigneeDropdown.innerHTML = `<option value="">Select an assignee</option>`;

  data.result.forEach((member) => {
    const option = document.createElement('option');
    console.log(member._id);
    option.value = member._id;
    option.textContent = member.email;
    assigneeDropdown.appendChild(option);
  });
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  let dateValue;
  if (document.getElementById('dueDate').value === '1999-10-10') {
    dateValue = new Date().toLocaleDateString();

    const splitVal = dateValue.split('/');
    console.log(splitVal);
    const newDateValue = new Date(splitVal[2], splitVal[1], splitVal[0]);
    console.log(newDateValue);
    dateValue = newDateValue;
    dateValue = splitVal[2] + '-' + splitVal[1] + '-' + splitVal[0];
  } else {
    dateValue = document.getElementById('dueDate').value;
  }
  console.log(dateValue);
  // Build the task object from form inputs
  const task = {
    projectId: localStorage.getItem('selectedProject'),
    title: document.getElementById('create-task-modal-title').value.trim(),
    description: document.getElementById('description').value.trim(),
    type: document.getElementById('type').value,
    priority: document.getElementById('priority').value,

    status: document.getElementById('status-create-task-modal').value,

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

    dueDate: dateValue,
    assignee:
      document.getElementById('create-modal-assignee').value === 'null'
        ? null
        : document.getElementById('create-modal-assignee').value,

    attachments: input.files,
  };

  console.log({ task });

  try {
    const response = await taskService.createTask(task);

    console.log('Task created:', response);
    createTaskModal.classList.add('hidden');
    renderBoard(localStorage.getItem('selectedProject'));
    // renderTasksList();
    renderDashBoardTasks();
    // taskForm.reset();
    fileName.textContent = 'No file chosen';
  } catch (error) {
    console.error(error);
    console.log('No task created ');
  }
});

openTaskCreate.addEventListener('click', () => {
  createTaskModal.classList.remove('hidden');
});
closeTaskModal.addEventListener('click', () => {
  createTaskModal.classList.add('hidden');
});
//end for create tasks

//update task details

const closeEditTask = document.getElementById('close-update-task-modal');
const editModal = document.getElementById('update-task-modal');
const editForm = document.getElementById('edit-task-form');

let currentTaskId = null;

async function openEditModal(taskId) {
  currentTaskId = taskId;

  try {
    const response = await taskService.getTaskById(taskId);
    const task = response.data.result;
    console.log(taskId, task);

    editModal.querySelector('#title').value = task.title;
    editModal.querySelector('#description').value = task.description;
    editModal.querySelector('#type').value = task.type;
    editModal.querySelector('#priority').value = task.priority;
    const status = editModal.querySelector('#status');
    await handleModalStatus(status);
    const selectedStatus = editModal.querySelector(`[value="${task.status}"]`);
    selectedStatus.selected = true;

    editModal.querySelector('#tags').value = task.tags?.join(', ') || '';
    editModal.querySelector('#block').value = task.block || '';
    editModal.querySelector('#BlockedBy').value = task.blockedBy || '';
    editModal.querySelector('#relatesTo').value = task.relatesTo || '';

    if (task.dueDate) {
      console.log(task.dueDate);
      const dueDate = new Date(task.dueDate);

      const formattedDate = dueDate.toISOString().slice(0, 10);
      console.log(formattedDate);
      editModal.querySelector('#dueDate').value = formattedDate;
    } else {
      editModal.querySelector('#dueDate').value = '';
    }
    const assignee = editModal.querySelector('#assignee');
    const selectedAssignee = await handleModalAssignee(assignee);
    const selectedAssigned = editModal.querySelector(
      `[value="${task.assignee}"]`
    );
    selectedAssigned.selected = true;
    console.log(selectedAssignee);

    editModal.classList.remove('hidden');
  } catch (error) {
    console.error('Failed to load task:', error);
    alert('Error loading task data');
  }
}

// Submit form
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const updatedTask = {
    title: editModal.querySelector('#title').value,
    description: editModal.querySelector('#description').value,
    type: editModal.querySelector('#type').value,
    priority: editModal.querySelector('#priority').value,
    status: editModal.querySelector('#status').value,
    tags: editModal
      .querySelector('#tags')
      .value.split(',')
      .map((t) => t.trim()),
    relatesTo: editModal
      .querySelector('#relatesTo')
      .value.split(',')
      .map((t) => t.trim()),

    blockedBy: editModal
      .querySelector('#BlockedBy')
      .value.split(',')
      .map((t) => t.trim()),

    block: editModal
      .querySelector('#block')
      .value.split(',')
      .map((t) => t.trim()),

    dueDate: editModal.querySelector('#dueDate').value,
    assignee:
      editModal.querySelector('#assignee').value === 'null'
        ? null
        : editModal.querySelector('#assignee').value,
  };

  console.log(updatedTask);

  try {
    const response = await taskService.updateTask(currentTaskId, updatedTask);
    console.log('Task updated successfully:', response.data);

    editModal.classList.add('hidden');
    renderBoard(localStorage.getItem('selectedProject'));
    // renderTasksList();
    renderDashBoardTasks();
    //hide side bar
    setTimeout(() => {
      const taskDrawer = document.getElementById('task-side-drawer');
      const profileImageEl = taskDrawer.querySelector('.profile-image');
      taskDrawer.classList.add('translate-x-full');
      taskDrawer.classList.remove('transform-none');
      drawerBackdrop.classList.add('hidden');
      profileImageEl.classList.remove('hidden');
    }, 100);
  } catch (error) {
    console.error(error);
  }
});

// Close modal
closeEditTask.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

//update task

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
    body.classList.remove('overflow-hidden');
  }
  e.stopPropagation();
});

const projectsMenu = document.getElementById('projectsMenu');
const usersMenu = document.getElementById('usersMenu');
const projectsDropdown = document.getElementById('projectsDropdown');
const userListContainer = document.getElementById('usersDropdown');

// dropdown.classList.add(
//   'transition-all',
//   'duration-300',
//   'overflow-y-auto',
//   'max-h-0'
// );

projectsMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();

  const isOpen = projectsDropdown.classList.contains('max-h-60');

  if (isOpen) {
    projectsDropdown.classList.remove('max-h-60');
    projectsDropdown.classList.add('max-h-0');
    setTimeout(() => projectsDropdown.classList.add('hidden'), 200);
  } else {
    projectsDropdown.classList.remove('hidden');
    projectsDropdown.classList.remove('max-h-0');
    projectsDropdown.classList.add('max-h-60');
  }
});

usersMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();

  const isOpen = userListContainer.classList.contains('max-h-60');

  if (isOpen) {
    userListContainer.classList.remove('max-h-60');
    userListContainer.classList.add('max-h-0');
    setTimeout(() => userListContainer.classList.add('hidden'), 200);
  } else {
    userListContainer.classList.remove('hidden');
    userListContainer.classList.remove('max-h-0');
    userListContainer.classList.add('max-h-60');
  }
});

document.addEventListener('click', (e) => {
  if (
    !projectsMenu.contains(e.target) &&
    !projectsDropdown.contains(e.target)
  ) {
    projectsDropdown.classList.remove('max-h-60');
    projectsDropdown.classList.add('max-h-0');
    setTimeout(() => projectsDropdown.classList.add('hidden'), 200);
  }
  if (!usersMenu.contains(e.target) && !userListContainer.contains(e.target)) {
    userListContainer.classList.remove('max-h-60');
    userListContainer.classList.add('max-h-0');
    setTimeout(() => userListContainer.classList.add('hidden'), 200);
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

async function showUserList() {
  const users = await projectService.getProjectMembers(
    localStorage.getItem('selectedProject')
  );

  userListContainer.innerHTML = '';
  console.log('users: ', users);

  if (!users.result.length) {
    userListContainer.innerHTML = 'No user assigned';
    userListContainer.className = 'block p-2 text-gray-900 hover:bg-gray-100';
  } else {
    users.result.forEach((user) => {
      const item = document.createElement('li');
      item.dataset.id = user._id;
      item.id = user.name;
      item.textContent = user.name;
      item.className = 'block p-2 text-gray-900 hover:bg-gray-100 rounded-lg';
      userListContainer.appendChild(item);
    });
  }
}

async function showProjectList() {
  try {
    const projects = await projectService.getAllProjects();
    projectsDropdown.innerHTML = '';
    console.log('projects: ', projects);

    if (!projects.length) {
      projectsDropdown.innerHTML = 'No project Found';
      projectsDropdown.className = 'block p-2 text-gray-900 hover:bg-gray-100';
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
        projectsDropdown.appendChild(item);
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
  // renderTasksList();
  renderBoard(localStorage.getItem('selectedProject'));
  loadProjectMembers(localStorage.getItem('selectedProject'));
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
  console.log(project.columns);
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

const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');

let taskToDelete = null;

async function showDeleteModal(taskId) {
  taskToDelete = taskId;
  deleteModal.classList.remove('hidden');
  drawerBackdrop.classList.remove('hidden');
}

cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
  drawerBackdrop.classList.add('hidden');
});

confirmDeleteBtn.addEventListener('click', async () => {
  if (taskToDelete) {
    await taskService.deleteTask(taskToDelete);
    renderBoard(localStorage.getItem('selectedProject'));
    // renderTasksList();
    renderDashBoardTasks();
  }
  deleteModal.classList.add('hidden');
  drawerBackdrop.classList.add('hidden');
});

async function renderBoard(projectId, filter = '', searchInput = '') {
  const columns = await getTaskGroupedByStatus(projectId, filter, searchInput);
  const project = (await projectService.getProjectById(projectId)).result;

  renderDashboard(project);

  const columnContainer = document.getElementById('columns');
  columnContainer.innerHTML = '';

  let filteredTasks = [];
  const allTasks = [];
  project.columns.forEach((col) => {
    allTasks.push(...(columns[col] || []));
  });
  const assigneeIds = [
    ...new Set(allTasks.map((t) => t.assignee).filter(Boolean)),
  ];

  let userMap = {};
  if (assigneeIds.length > 0) {
    const usersResp = await taskService.getMultipleUsers(assigneeIds);
    usersResp.result.forEach((u) => {
      userMap[u._id] = u;
    });
  }

  project.columns.forEach((column) => {
    const columnEl = document.createElement('div');
    columnEl.innerHTML = `
      <div class="w-72 bg-white rounded-lg shadow p-4 shrink-0 h-full overflow-y-auto">
        <h2 class="text-lg font-semibold mb-3 border-b pb-2 sticky top-0 bg-white z-10 flex gap-2">
          ${column.toUpperCase()}
          <div class="issue-count rounded-full w-7 h-7 text-center text-md text-white bg-cyan-900"></div>
        </h2>
        <div class="space-y-3 pb-4 h-full" id="task-list"></div>
      </div>
    `;
    columnEl.querySelector('.issue-count').innerText = (
      columns[column] || []
    ).length;

    const tasks = columns[column] || [];
    tasks.forEach((task) => {
      filteredTasks.push(task);

      const assignee = task.assignee ? userMap[task.assignee] : null;

      const taskEl = document.createElement('div');
      taskEl.dataset._id = task._id;
      taskEl.className =
        'task flex flex-col max-w-sm p-4 bg-gray-100 text-black gap-4 relative cursor-pointer';
      taskEl.innerHTML = `
        <div class="card-header flex justify-between items-center">
          <p class="text-lg border border-transparent rounded-lg font-medium hover:border-gray-400">${
            task.title
          }</p>
          <div class="relative">
            <button class="outline-none menu-button">
              <svg width="18px" height="18px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#00000" class="bi bi-three-dots mr-2">
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
              </svg>
            </button>
            <div class="dropdown-menu hidden absolute right-0 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
              <ul class="text-sm text-gray-700">
                <li>
                  <button class="edit-btn block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
                </li>
                <li>
                  <button class="delete-btn block w-full text-left px-4 py-2 hover:bg-gray-100">Delete</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="card-footer flex justify-between items-center text-sm text-gray-400">
          <div class="flex items-center gap-2">
            <span class="type-tag bg-green-600 text-white text-xs font-semibold py-1 px-2 rounded-sm">${
              task.key
            }</span>
            <select class="type-selector text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none">
              <option value="story" ${
                task.type === 'story' ? 'selected' : ''
              }>Story</option>
              <option value="task" ${
                task.type === 'task' ? 'selected' : ''
              }>Task</option>
            </select>
          </div>
          <div class="flex items-center">
            <span class="w-8 h-8 text-white font-semibold rounded-full bg-blue-50 flex items-center justify-center">
              <img src="${
                assignee?.profileImage
                  ? 'http://localhost:3001/uploads/profile/' +
                    assignee.profileImage
                  : '../../../assets/img/profile.png'
              }" class="w-8 h-8 object-cover" title="${
        assignee?.name || 'Unassigned'
      }"/>
            </span>
          </div>
        </div>
      `;

      taskEl.setAttribute('draggable', 'true');
      taskEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('taskId', task._id);
        e.dataTransfer.effectAllowed = 'move';
      });

      const menuButton = taskEl.querySelector('.menu-button');
      const dropdownMenu = taskEl.querySelector('.dropdown-menu');
      const typeTag = taskEl.querySelector('.type-tag');
      const typeSelector = taskEl.querySelector('.type-selector');
      const cardHeader = taskEl.querySelector('.card-header > p');

      menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', () =>
        dropdownMenu.classList.add('hidden')
      );

      taskEl.addEventListener('click', (e) => {
        if (e.target === taskEl) showTaskDrawer(task._id);
      });
      cardHeader.addEventListener('click', () => showTaskDrawer(task._id));

      taskEl.querySelector('.edit-btn').addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
        openEditModal(task._id);
      });
      taskEl.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteModal(task._id);
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

      const taskList = columnEl.querySelector('#task-list');
      taskList.appendChild(taskEl);
    });

    const taskList = columnEl.querySelector('#task-list');

    taskList.addEventListener('dragover', (e) => e.preventDefault());
    console.log(taskList);
    taskList.addEventListener('drop', async (e) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('taskId');
      console.log(`Dropped ${taskId} into column`);
      const taskEl = document.querySelector(`[data-_id="${taskId}"]`);

      taskList.appendChild(taskEl);

      taskService.updateTask(taskId, { status: column }).catch((err) => {
        console.error('Failed to update task status', err);
      });

      const countEls = document.querySelectorAll('.issue-count');
      project.columns.forEach((col, idx) => {
        const colTasks = columns[col] || [];
        countEls[idx].innerText = colTasks.length;
      });
    });

    columnContainer.appendChild(columnEl);
  });

  handleStatusFilter();
  handleAssigneeFilter();
  renderTasksList(filteredTasks);
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

async function showTaskDrawer(taskId) {
  const task = (await taskService.getTaskById(taskId)).data.result;
  const assignee = task.assignee
    ? (await taskService.getUserDetailsById(task.assignee)).data.result
    : null;
  console.log(assignee);

  const taskDrawer = document.querySelector('.task-drawer');

  const titleEl = taskDrawer.querySelector('.title');
  const descriptionEl = taskDrawer.querySelector('.description');
  const assigneeEl = taskDrawer.querySelector('.assignee');
  const profileImageEl = taskDrawer.querySelector('.profile-image');
  const dueDateEl = taskDrawer.querySelector('.due-date');
  const closeButton = taskDrawer.querySelector('.close-btn');
  const status = taskDrawer.querySelector('#statusSelect');
  const priority = taskDrawer.querySelector('#prioritySelect');

  const editTaskButton = document.querySelector('#edit-task-button');
  editTaskButton.addEventListener('click', () => {
    editModal.classList.remove('hidden');
    openEditModal(taskId);
  });

  const commentContainer = taskDrawer.querySelector('#commentsContainer');
  const comments = (await commentService.getAllComments(task._id)).result;

  commentContainer.innerHTML = `<div id="commentContainerHeaderText" class="ml-4 font-semibold">Comments</div>`;

  status.value = task.status;
  priority.value = task.priority;

  taskDrawer.dataset.id = task._id;
  titleEl.textContent = task.title;
  descriptionEl.textContent = task.description;
  assigneeEl.textContent = assignee ? assignee.name : 'No assignee';
  profileImageEl.src = assignee
    ? 'http://localhost:3001/uploads/profile/' + assignee.profileImage
    : '';

  !assignee && profileImageEl.classList.add('hidden');

  dueDateEl.textContent = task.dueDate.split('T')[0];

  taskDrawer.classList.remove('translate-x-full');
  taskDrawer.classList.add('transform-none');
  drawerBackdrop.classList.remove('hidden');

  closeButton.addEventListener('click', () => {
    taskDrawer.classList.add('translate-x-full');
    taskDrawer.classList.remove('transform-none');
    drawerBackdrop.classList.add('hidden');
    profileImageEl.classList.remove('hidden');
  });

  comments.forEach((comment) => {
    const commentEl = document.createElement('div');
    commentEl.className =
      'flex gap-3 items-start bg-white rounded-lg shadow-md pl-3 py-3';
    commentEl.innerHTML = `
            <img
              src="${
                'http://localhost:3001/uploads/profile/' +
                comment.author.profileImage
              }"
              alt="Avatar"
              class="w-7 h-7 rounded-full"
            />
            <div id="CommentInformation" class="flex flex-col gap-1">
              <div class="flex items-center gap-2 text-md text-gray-500">
                <span id="" class="username font-medium text-gray-700"
                  >${comment.author.name}</span
                >
                <span>•</span>
                <span class="text-sm">${comment.createdAt.split('T')[0]}</span>
              </div>
              <p class="message text-gray-700 text-sm">
                ${comment.message}
              </p>
            </div>`;
    commentContainer.appendChild(commentEl);
  });
}

async function loadProjectMembers(projectId) {
  try {
    const data = await projectService.getProjectMembers(projectId);
    const members = data.result;
    const container = document.getElementById('memberAvatars');
    container.innerHTML = '';

    members.forEach((userInfo, index) => {
      const img = document.createElement('img');
      const imageUrl = userInfo.profileImage
        ? `http://localhost:3001/uploads/profile/${userInfo.profileImage}`
        : `../../../assets/img/profile.png`;

      img.src = imageUrl;
      img.alt = userInfo.name;
      img.title = userInfo.name;

      img.className =
        'w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:z-1';

      img.style.marginLeft = index === 0 ? '0px' : '-10px';

      container.appendChild(img);
    });
  } catch (error) {
    console.error('Error loading images:', error);
  }
}

function renderSubDropdown(item) {
  const subDropdown = document.createElement('div');
  subDropdown.className = `px-4 py-2 hover:bg-gray-100 cursor-pointer ${item}-filter`;
  subDropdown.id = `${item}-filter`;
  subDropdown.innerHTML = `
    ${item.charAt(0).toUpperCase() + item.slice(1)}
  `;
  return subDropdown;
}

checkIfToken();
loadProjectMembers(localStorage.getItem('selectedProject'));
const currentProject = localStorage.getItem('selectedProject');

const statusDropDown = document.getElementById('statusDropdown');
const assigneeDropdown = document.getElementById('assigneeDropdown');

function removeElementChildren(element) {
  element.innerHTML = '';
}

async function handleStatusFilter() {
  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
  const project = (await projectService.getProjectById(currentProject)).result;

  project.columns.forEach((column) => {
    const dropdownEl = renderSubDropdown(column);
    statusDropDown.appendChild(dropdownEl);
    dropdownEl.addEventListener('click', () => {
      removeElementChildren(statusDropDown);
      removeElementChildren(assigneeDropdown);
      renderBoard(currentProject, 'status', `${column}`);
    });
  });
}

async function handleAssigneeFilter() {
  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
  const assignees = await projectService.getProjectMembers(currentProject);

  assignees.result.forEach((assignee) => {
    const dropdownEl = renderSubDropdown(assignee.name);
    assigneeDropdown.appendChild(dropdownEl);
    dropdownEl.addEventListener('click', () => {
      removeElementChildren(statusDropDown);
      removeElementChildren(assigneeDropdown);
      renderBoard(currentProject, 'assignee', `${assignee._id}`);
    });
  });
}

async function handleModalAssignee(modalAssigneeDropdown) {
  const assignees = await projectService.getProjectMembers(currentProject);
  modalAssigneeDropdown.innerHTML = '';
  const unassigned = document.createElement('option');
  unassigned.innerText = 'Unassigned';
  unassigned.selected = true;

  unassigned.value = 'null';
  createModalAssigneeDropdown.appendChild(unassigned);

  let selectedAssignee;
  assignees.result.forEach((assignee) => {
    const option = document.createElement('option');

    option.value = assignee._id;

    if (assignee.email === localStorage.getItem('userEmail')) {
      option.innerText = `${assignee.email} (assign to me)`;
      selectedAssignee = assignee;
    } else {
      option.innerText = `${assignee.email}`;
    }

    modalAssigneeDropdown.appendChild(option);
  });
  return selectedAssignee;
}

async function handleModalStatus(modalStatusDropdown) {
  const project = (await projectService.getProjectById(currentProject)).result;
  modalStatusDropdown.innerHTML = '';

  project.columns.forEach((column) => {
    const option = document.createElement('option');
    option.innerText = column;
    option.value = column;
    modalStatusDropdown.appendChild(option);
  });

  modalStatusDropdown.firstChild.selected = true;
}

const priorityDropdown = document.getElementById('priorityDropdown');
const lowFilterBtn = document.getElementById('low-filter');
const midFilterBtn = document.getElementById('medium-filter');
const highFilterBtn = document.getElementById('high-filter');
const criticalFilterBtn = document.getElementById('critical-filter');
const removeFilterBtn = document.getElementById('remove-filter-btn');

priorityDropdown.addEventListener('click', () => {
  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
});

lowFilterBtn.addEventListener('click', () => {
  renderBoard(currentProject, 'priority', 'low');
});

midFilterBtn.addEventListener('click', () => {
  renderBoard(currentProject, 'priority', 'medium');
});

highFilterBtn.addEventListener('click', () => {
  renderBoard(currentProject, 'priority', 'high');
});

criticalFilterBtn.addEventListener('click', () => {
  renderBoard(currentProject, 'priority', 'critical');
});

removeFilterBtn.addEventListener('click', () => {
  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
  renderBoard(currentProject, '', '');
});

// add  user to the project

const toggleInviteButton = document.getElementById('toggleInviteForm');
const inviteForm = document.getElementById('inviteForm');
const emailInput = inviteForm.querySelector('input[type="email"]');

toggleInviteButton.addEventListener('click', () => {
  inviteForm.classList.toggle('hidden');
});

inviteForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (email === '') {
    console.log('please enter a valid emil'); // add a confimation
    return;
  }
  axios
    .post('http://localhost:3001/invite/email', {
      email: email,
    })
    .then((response) => {
      if (response.data.success) {
        console.log('Email sent successfully'); // add conf.
      } else {
        // alert('Failed to send invitation. Please try again.');
        console.log('falied to sent invitation'); // need conff
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('There was an error sending the invitation.');
    });
  inviteForm.classList.add('hidden');
  emailInput.value = '';
});

function showNotification(message) {
  const notification = document.querySelector('.notification');
  const messageEl = notification.querySelector('.message');
  const dismissButton = notification.querySelector('.dismiss');

  messageEl.textContent = message;
  notification.classList.remove('hidden');

  dismissButton.addEventListener('click', () =>
    notification.classList.add('hidden')
  );

  setTimeout(() => notification.classList.add('hidden'), 5000);
}

setupSocketIo(showNotification);
renderBoard(currentProject);
showProjectList();
showUserList();
// renderTasksList();
renderDashBoardTasks();
