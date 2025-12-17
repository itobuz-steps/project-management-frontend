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
import { checkToken } from '../../utils/checkToken.js';
import { removeActive, hideAll } from '../../utils/elementUtils.js';
import { loadProjectMembers } from '../loadMembers/loadMembers.js';

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
  const currentProject = localStorage.getItem('selectedProject');
  const columns = await getTaskGroupedByStatus(projectId, filter, searchInput);
  const project = (await projectService.getProjectById(projectId)).result;
  const lastColumn = project.columns[project.columns.length - 1];
  const currentSprint = project.currentSprint
    ? await sprintService.getSprintById(project.currentSprint)
    : null;
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
    columnEl.innerHTML = /*html*/ `
      <div class="w-72 bg-white rounded-lg shadow-lg shrink-0 h-full overflow-y-auto">
        <h2 class="text-lg font-semibold sticky top-0 z-10 flex gap-2 px-4 py-2 text-black bg-white shadow-sm items-center">
          ${column.toUpperCase()}
          <div class="issue-count rounded-full w-5 h-5 text-center text-sm text-black bg-gray-200"></div>
        </h2>
        <div class="flex flex-col gap-3 pb-4 h-96 p-2 " id="task-list"></div>
      </div>
    `;

    const tasks = columns[column] || [];
    tasks.forEach((task) => {
      filteredTasks.push(task);
      let isDone = '';

      if (task.status === 'done') {
        isDone = 'line-through text-gray-400';
      }

      if (project.projectType !== 'kanban') {
        if (!currentSprint || !currentSprint.result.tasks.includes(task._id)) {
          return;
        }
      }

      const assignee = task.assignee ? userMap[task.assignee] : null;

      const taskEl = document.createElement('div');
      taskEl.dataset._id = task._id;
      taskEl.className =
        'task flex flex-col max-w-sm p-4 bg-white rounded-md shadow-sm text-black gap-4 relative cursor-grab border border-gray-100 hover:shadow-md';
      taskEl.innerHTML = /*html*/ `
       <div class="card-header flex justify-between items-center">
          <p id="${
            task.title
          }-taskId" class="flex-1 task-title text-lg border border-transparent rounded-sm font-medium cursor-pointer px-1 ${isDone}">${
            task.title
          }</p>
            <div class="menu-button flex flex-row gap-2 justify-between">
              <button class="edit-btn w-full p-1 hover:bg-gray-200">
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="delete-btn w-full p-1 hover:bg-red-200">
                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="hover:fill-red-200 transition duration-300">
<rect width="20" height="20" fill="red-400"/>
<path d="M5 7.5H19L18 21H6L5 7.5Z" stroke="#000000" stroke-linejoin="round"/>
<path d="M15.5 9.5L15 19" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 9.5V19" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.5 9.5L9 19" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 5H19C20.1046 5 21 5.89543 21 7V7.5H3V7C3 5.89543 3.89543 5 5 5H8M16 5L15 3H9L8 5M16 5H8" stroke="#000000" stroke-linejoin="round"/>
</svg>
              </button>
            </div>
        </div>
        <div class="card-footer flex justify-between items-center text-sm text-gray-400">
          <div class="flex items-center gap-2">
            <span class="type-tag bg-green-600 text-white text-xs font-semibold p-1 rounded-sm">${
              task.key
            }</span>
            <select class="type-selector text-sm border border-black-300 rounded text-black focus:outline-none">
              <option value="story" ${
                task.type === 'story' ? 'selected' : ''
              }>Story</option>
              <option value="task" ${
                task.type === 'task' ? 'selected' : ''
              }>Task</option>
              <option value="bug" ${
                task.type === 'bug' ? 'selected' : ''
              }>Bug</option>
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
            <div class="avatar-dropdown hidden absolute top-20 right-10 rounded-2xl">
              <ul class="assignee-list text-sm text-gray-700 relative z-1 bg-slate-200 rounded-2xl"></ul>
            </div>
          </div>
        </div>
      `;

      const attachmentLogo = taskEl.querySelector('#attachmentLogo');

      if (task.attachments.length) {
        attachmentLogo.classList.remove('hidden');
      }

      // add drop down upon clicking the image

      const userAvatar = taskEl.querySelector('.user-avatar');
      const avatarDropdown = taskEl.querySelector('.avatar-dropdown');
      const list = taskEl.querySelector('.assignee-list');

      let activeProjectMembers = [];
      let selectedUserId = null;
      let selectedUser = null;

      async function populateAvatarDropdown(dropdownList) {
        try {
          const response =
            await projectService.getProjectMembers(currentProject);
          activeProjectMembers = response.result;

          dropdownList.innerHTML = '';

          activeProjectMembers.forEach((user) => {
            const li = document.createElement('li');
            li.className =
              'px-7 py-2 hover:bg-gray-100 cursor-pointer rounded-2xl';
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
        taskEl.classList.remove('cursor-grab');
        taskEl.classList.add('cursor-grabbing');
      });

      taskEl.addEventListener('dragend', () => {
        taskEl.classList.remove('cursor-grabbing');
        taskEl.classList.add('cursor-grab');
      });

      // const menuButton = taskEl.querySelector('.menu-button');
      // const dropdownMenu = taskEl.querySelector('.dropdown-menu');
      const typeTag = taskEl.querySelector('.type-tag');
      const typeSelector = taskEl.querySelector('.type-selector');
      const cardHeader = taskEl.querySelector('.card-header > p');

      // menuButton.addEventListener('click', (e) => {
      //   e.stopPropagation();
      //   dropdownMenu.classList.toggle('hidden');
      // });
      // document.addEventListener('click', () =>
      //   dropdownMenu.classList.add('hidden')
      // );

      taskEl.addEventListener('click', (e) => {
        if (e.target === taskEl) showTaskDrawer(task._id);
      });
      cardHeader.addEventListener('click', () => showTaskDrawer(task._id));

      taskEl.querySelector('.edit-btn').addEventListener('click', () => {
        // dropdownMenu.classList.add('hidden');
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
        } else if (value === 'story') {
          typeTag.className =
            'bg-green-600 text-white text-xs font-semibold py-1 px-2 rounded-sm';
        } else {
          typeTag.className =
            'bg-red-600 text-white text-xs font-semibold py-1 px-2 rounded-sm';
        }
      });

      const taskList = columnEl.querySelector('#task-list');
      taskList.appendChild(taskEl);
    });

    const taskList = columnEl.querySelector('#task-list');

    taskList.addEventListener('dragover', (e) => e.preventDefault());
    taskList.addEventListener('drop', async (e) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('taskId');
      console.log(`Dropped ${taskId} into column`);
      const taskEl = document.querySelector(`[data-_id="${taskId}"]`);
      const taskTitle = taskEl.querySelector('.task-title');

      if (column === lastColumn) {
        taskTitle.classList.add('line-through', 'text-gray-400');
      } else {
        taskTitle.classList.remove('line-through', 'text-gray-400');
      }
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
  if (project.projectType === 'kanban') {
    await renderTasksList(filteredTasks, 'kanban', '');
  } else {
    await renderTasksList(
      filteredTasks,
      '',
      currentSprint?.result ? currentSprint.result : ''
    );
  }
}

async function checkForInvite() {
  const inviteToken = localStorage.getItem('inviteToken');
  const authToken = localStorage.getItem('access_token');
  if (inviteToken) {
    try {
      await axios.get('http://localhost:3001/invite/join', {
        params: { token: inviteToken },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showToast('User Joined The Project Successfully', 'success');
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('inviteToken');
    }
  }
}

checkToken();
checkForInvite();
setupSidebar();
setupNotification();
setupNavbar();
loadProjectMembers(localStorage.getItem('selectedProject'));
renderBoard(localStorage.getItem('selectedProject'));
renderDashBoardTasks();
