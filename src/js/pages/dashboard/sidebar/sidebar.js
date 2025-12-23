import projectService from '../../../services/ProjectService';
import { renderDashBoardTasks } from '../../../utils/renderTasks';
import { renderBoard } from '../dashboard';
import { loadProjectMembers } from '../../loadMembers/loadMembers';
import { checkToken } from '../../../utils/checkToken';
import axios from 'axios';
import showToast from '../../../utils/showToast';

const body = document.querySelector('body');
const sidebar = document.querySelector('#sidebar');
const toggleBtn = document.querySelector('.toggle-sidebar-btn');
const projectsDropdown = document.getElementById('projectsDropdown');
const usersMenu = document.getElementById('usersMenu');
const userListContainer = document.getElementById('usersDropdown');
const projectsMenu = document.getElementById('projectsMenu');
const projectDropdownContainer = document.getElementById('projectsDropdown');
const toggleInviteButton = document.getElementById('toggleInviteForm');
const inviteForm = document.getElementById('inviteForm');
const emailInput = inviteForm.querySelector('input[type="email"]');

function toggleSidebar(action = 'toggle') {
  if (action === 'toggle') {
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
    body.classList.toggle('overflow-hidden');
  } else {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    body.classList.remove('overflow-hidden');
  }
}

const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  checkToken();
});

export async function updateProjectList() {
  try {
    const projects = await projectService.getAllProjects();

    projectsDropdown.innerHTML = '';

    if (!projects.length) {
      projectsDropdown.innerHTML = 'No project Found';
      projectsDropdown.className = 'block p-2 text-black';
    } else {
      projects.forEach((project) => {
        const item = document.createElement('li');
        item.dataset.id = project._id;
        item.textContent = project.name;
        item.className =
          'block p-2 text-black hover:bg-primary-100 hover:text-black [&.selected]:bg-primary-200 rounded-md [&.selected]:shadow/25 cursor-pointer';
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

async function updateUserList() {
  const users = await projectService.getProjectMembers(
    localStorage.getItem('selectedProject')
  );

  userListContainer.innerHTML = '';

  if (!users.result.length) {
    userListContainer.innerHTML = 'No user assigned';
    userListContainer.className = 'block p-2 text-gray-900 hover:bg-gray-100';
  } else {
    users.result.forEach((user) => {
      const item = document.createElement('li');
      item.dataset.id = user._id;
      item.id = user.name;
      item.innerHTML = /*html*/ `
    <div class="flex items-center">
    <img class="aspect-square w-6 h-6 rounded-full mr-3" 
          src="${
            user.profileImage
              ? 'http://localhost:3001/uploads/profile/' + user.profileImage
              : '../../../assets/img/profile.png'
          }">${user.name}
    </div>
      `;
      item.className = 'block p-2 text-black rounded-md';
      userListContainer.appendChild(item);
    });
  }
}

function addEventListenersSidebar() {
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar('toggle');
  });

  document.addEventListener('click', (e) => {
    const clickedSidebar = sidebar.contains(e.target);
    const clickedToggelButton = toggleBtn.contains(e.target);

    if (clickedSidebar || clickedToggelButton) return;

    toggleSidebar('close');
    e.stopPropagation();
  });

  projectsMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const isOpen = !projectsDropdown.classList.contains('hidden');

    if (isOpen) {
      projectsDropdown.classList.add('hidden');
    } else {
      projectsDropdown.classList.remove('hidden');
    }
  });

  usersMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const isOpen = !userListContainer.classList.contains('hidden');

    if (isOpen) {
      userListContainer.classList.add('hidden');
    } else {
      userListContainer.classList.remove('hidden');
    }
  });

  document.addEventListener('click', (e) => {
    const clickedOnProjectDropdown =
      projectsMenu.contains(e.target) || projectsDropdown.contains(e.target);
    const clickedOnUserDropdown =
      usersMenu.contains(e.target) || userListContainer.contains(e.target);

    if (clickedOnProjectDropdown || clickedOnUserDropdown) {
      return;
    }

    projectsDropdown.classList.add('hidden');

    userListContainer.classList.add('hidden');
  });

  projectDropdownContainer.addEventListener('click', async (event) => {
    const targetLi = event.target;

    localStorage.setItem('selectedProject', targetLi.dataset.id);

    [...targetLi.parentElement.children].forEach((child) => {
      child.classList.remove('selected');
    });

    targetLi.classList.toggle('selected');
    await renderDashBoardTasks(localStorage.getItem('selectedProject'));
    await renderBoard(localStorage.getItem('selectedProject'));
    await loadProjectMembers(localStorage.getItem('selectedProject'));
  });

  toggleInviteButton.addEventListener('click', () => {
    inviteForm.classList.toggle('hidden');
  });

  inviteForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    if (email === '') {
      showToast('please enter a valid emil');
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
        } else {
          showToast('failed to send invitation', 'error');
        }
      })
      .catch((error) => {
        showToast('Could not sent invitation');
        console.error('Error:', error);
      });
    inviteForm.classList.add('hidden');
    emailInput.value = '';
  });
}

export function setupSidebar() {
  updateProjectList();
  updateUserList();
  addEventListenersSidebar();
}
