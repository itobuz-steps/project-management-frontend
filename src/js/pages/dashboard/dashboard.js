import '../../../style/main.css';
import {
  renderTasksList,
  renderDashBoardTasks,
} from '../../utils/renderTasks.js';
import projectService from '../../services/ProjectService.js';
import taskService from '../../services/TaskService.js';
import axios from 'axios';
import { setupNotification } from '../../utils/setupNotification.js';
import showToast from '../../utils/showToast.js';
import sprintService from '../../services/SprintService.js';
import { showTaskDrawer } from '../taskDrawer/taskDrawer.js';
import { loadProjectMembers } from '../loadMembers/loadMembers.js';
import { setupSidebar } from './sidebar/sidebar.js';
import { setupNavbar } from './navbar/navbar.js';
import { openUpdateTaskModal } from '../../utils/modals/updateTaskModal.js';
import { openCreateTaskModal } from '../../utils/modals/createTaskModal.js';
import { openCreateProjectModal } from '../../utils/modals/createProjectModal.js';
import { showConfirmModal } from '../../utils/modals/confirmationModal.js';
import {
  handleStatusFilter,
  handleAssigneeFilter,
} from './filter/dashboardFilter.js';

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

const openProjectBtn = document.getElementById('plus-icon');
openProjectBtn.addEventListener('click', openCreateProjectModal);

const addTaskButton = document.getElementById('create-task');
addTaskButton.addEventListener('click', openCreateTaskModal);

export function dropdownEvent(sprint = {}) {
  const nameKey = sprint.name ? sprint.name : `backlog`;
  const dropdownButton = document.getElementById(`dropdownButton-${nameKey}`);
  const dropdownMenu = document.querySelector(`.dropdown-menu-${nameKey}`);

  dropdownButton.addEventListener('click', () => {
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

async function renderDashboard(project) {
  const projectName = document.getElementById('projectName');

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

  return result;
}

export async function renderBoard(projectId, filter = '', searchInput = '') {
  const columns = await getTaskGroupedByStatus(projectId, filter, searchInput);
  const project = (await projectService.getProjectById(projectId)).result;
  const currentSprint = await sprintService.getSprintById(
    project.currentSprint
  );
  let draggedColumn = null;

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

    const tasks = columns[column] || [];
    tasks.forEach((task) => {
      filteredTasks.push(task);
      console.log(task._id);
      if (!currentSprint.result.tasks.includes(task._id)) {
        return;
      }

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
            <span class="user-avatar cursor-pointer w-8 h-8 text-white font-semibold rounded-full bg-blue-50 flex items-center justify-center">
              <img src="${
                assignee?.profileImage
                  ? 'http://localhost:3001/uploads/profile/' +
                    assignee.profileImage
                  : '../../../assets/img/profile.png'
              }" class="w-8 h-8 object-cover" title="${
        assignee?.name || 'Unassigned'
      }"/>
            </span>
            <div class="avatar-dropdown hidden absolute top-20 right-0 bg-white border border-gray-200 rounded">
              <ul class="assignee-list text-sm text-gray-700"></ul>
            </div>
          </div>
        </div>
      `;

      // add drop down upon clicking the image

      const userAvatar = taskEl.querySelector('.user-avatar');
      const avatarDropdown = taskEl.querySelector('.avatar-dropdown');
      const list = taskEl.querySelector('.assignee-list');

      let activeProjectMembers = [];
      let selectedUserId = null;
      let selectedUser = null;

      async function populateAvatarDropdown(dropdownList) {
        try {
          const response = await projectService.getProjectMembers(
            currentProject
          );
          activeProjectMembers = response.result;

          dropdownList.innerHTML = '';

          activeProjectMembers.forEach((user) => {
            const li = document.createElement('li');
            li.className = 'px-7 py-2 hover:bg-gray-100 cursor-pointer';
            li.textContent = user.name;
            li.dataset.id = user._id;
            dropdownList.appendChild(li);
          });
        } catch (err) {
          console.error('Error loading users:', err);
        }
      }

      userAvatar.addEventListener('click', async () => {
        avatarDropdown.classList.toggle('hidden');
        if (!avatarDropdown.classList.contains('hidden')) {
          await populateAvatarDropdown(list);
        }
      });

      list.addEventListener('click', async (e) => {
        if (e.target.tagName === 'LI') {
          selectedUserId = e.target.dataset.id;

          //search for the selected users

          selectedUser = activeProjectMembers.find(
            (u) => u._id == selectedUserId
          );

          if (selectedUser) {
            const avatarImg = userAvatar.querySelector('img');

            if (selectedUser.profileImage) {
              avatarImg.src = `http://localhost:3001/uploads/profile/${selectedUser.profileImage}`;
            } else {
              avatarImg.src = '../../../assets/img/profile.png';
            }
          }

          const taskId = taskEl.dataset._id;
          await taskService.updateTask(taskId, {
            assignee: selectedUserId,
            profileImage: selectedUser?.profileImage || null,
          });
          console.log('Assigned user:', selectedUserId);

          avatarDropdown.classList.add('hidden');
        }
      });

      document.addEventListener('click', (e) => {
        const isAvatar = userAvatar.contains(e.target);
        const isDropdown = avatarDropdown.contains(e.target);

        if (!isAvatar && !isDropdown) {
          avatarDropdown.classList.add('hidden');
        }
      });

      // end of avatar drop down

      taskEl.setAttribute('draggable', 'true');
      taskEl.addEventListener('dragstart', (e) => {
        const currentCol = e.target.parentElement.parentElement; // getting the whole column dynamically
        e.dataTransfer.setData('taskId', task._id);
        e.dataTransfer.effectAllowed = 'move';
        draggedColumn = currentCol;
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
        openUpdateTaskModal(task._id);
      });
      taskEl.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        // showDeleteModal(task._id);
        showConfirmModal(
          'Are you sure you want to delete this task?',
          async () => {
            await taskService.deleteTask(task._id);
            renderBoard(localStorage.getItem('selectedProject'));
            renderDashBoardTasks();
          }
        );
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

      columnEl.querySelector('.issue-count').innerText =
        +columnEl.querySelector('.issue-count').innerText + 1;

      draggedColumn.querySelector('.issue-count').innerText =
        +draggedColumn.querySelector('.issue-count').innerText - 1; // converted from string to number using
    });

    columnContainer.appendChild(columnEl);

    columnEl.querySelector('.issue-count').innerText =
      taskList.childElementCount;
  });

  handleStatusFilter();
  handleAssigneeFilter();
  renderTasksList(filteredTasks);
}

checkIfToken();
loadProjectMembers(localStorage.getItem('selectedProject'));
const currentProject = localStorage.getItem('selectedProject');

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
    console.log('please enter a valid emil'); // add a confirmation
    return;
  }
  axios
    .post('http://localhost:3001/invite/email', {
      email: email,
      projectId: localStorage.getItem('selectedProject'),
    })
    .then((response) => {
      if (response.data.success) {
        showToast('Email sent successfully', 'success');
        console.log('Email sent successfully');
      } else {
        showToast('failed to send invitation', 'error');
        console.log('failed to sent invitation');
      }
    })
    .catch((error) => {
      showToast('Could not sent invitation');
      console.error('Error:', error);
    });
  inviteForm.classList.add('hidden');
  emailInput.value = '';
});

setupSidebar();
setupNotification();
setupNavbar();
renderBoard(localStorage.getItem('selectedProject'));
renderDashBoardTasks();
