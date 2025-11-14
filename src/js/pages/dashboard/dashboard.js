import '../../../scss/main.css';
import { renderTasksList, renderDashBoardTasks } from '../../utils/renderTasks.js';
import ProjectService from '../../services/ProjectService.js';
import TaskService from '../../services/TaskService.js';

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
        item.className = 'block p-2 text-gray-900 hover:bg-gray-100 rounded-lg [&.selected]:border [&.selected]:border-black-500 [&.selected]:bg-gray-300';
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

renderDashboard(localStorage.getItem('selectedProject'));
checkIfToken();
showProjectList();
renderTasksList();
renderDashBoardTasks();
