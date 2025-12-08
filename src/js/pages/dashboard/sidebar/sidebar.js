import projectService from '../../../services/ProjectService';
import { renderDashBoardTasks } from '../../../utils/renderTasks';
import { renderBoard } from '../dashboard';
import { loadProjectMembers } from '../../loadMembers/loadMembers';

const body = document.querySelector('body');
const sidebar = document.querySelector('#sidebar');
const toggleBtn = document.querySelector('.toggle-sidebar-btn');
const projectsDropdown = document.getElementById('projectsDropdown');
const usersMenu = document.getElementById('usersMenu');
const userListContainer = document.getElementById('usersDropdown');
const projectsMenu = document.getElementById('projectsMenu');
const projectDropdownContainer = document.getElementById('projectsDropdown');

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

export async function updateProjectList() {
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

async function updateUserList() {
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
    const clickedOnProjectDropdown =
      projectsMenu.contains(e.target) || projectsDropdown.contains(e.target);
    const clickedOnUserDropdown =
      usersMenu.contains(e.target) || userListContainer.contains(e.target);

    if (clickedOnProjectDropdown || clickedOnUserDropdown) {
      return;
    }

    projectsDropdown.classList.remove('max-h-60');
    projectsDropdown.classList.add('max-h-0');
    setTimeout(() => projectsDropdown.classList.add('hidden'), 200);

    userListContainer.classList.remove('max-h-60');
    userListContainer.classList.add('max-h-0');
    setTimeout(() => userListContainer.classList.add('hidden'), 200);
  });

  projectDropdownContainer.addEventListener('click', (event) => {
    const targetLi = event.target;

    localStorage.setItem('selectedProject', targetLi.dataset.id);

    [...targetLi.parentElement.children].forEach((child) => {
      child.classList.remove('selected');
    });

    targetLi.classList.toggle('selected');
    renderDashBoardTasks();
    renderBoard(localStorage.getItem('selectedProject'));
    loadProjectMembers(localStorage.getItem('selectedProject'));
  });
}

export function setupSidebar() {
  updateProjectList();
  updateUserList();
  addEventListenersSidebar();
}
