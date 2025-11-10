import '../../../scss/main.css';
import projectService from '../../services/ProjectService';
import taskService from '../../services/TaskService';

const toggleBtn = document.querySelector('.toggle-sidebar-btn');
const sidebar = document.querySelector('#sidebar');
const main = document.querySelector('.main');

toggleBtn?.addEventListener('click', () => {
  sidebar.classList.toggle('-translate-x-full');
  sidebar.classList.toggle('translate-x-0');
});

document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !toggleBtn?.contains(e.target)) {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    main.classList.remove('ml-64');
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

const dropdownButtonSprint = document.getElementById('dropdownButtonForSprint');
dropdownButtonSprint?.addEventListener('click', function () {
  const dropdownMenu = document.querySelector('.dropdown-menu-sprint');
  dropdownMenu.classList.toggle('hidden');
});

const dropdownIconSprint = document.getElementById('dropdown-icon-sprint');
dropdownButtonSprint?.addEventListener('click', function () {
  dropdownIconSprint.classList.toggle('rotate-270');
});

const dropdownButtonBacklog = document.getElementById(
  'dropdownButtonForBacklog'
);
dropdownButtonBacklog?.addEventListener('click', function () {
  const dropdownMenu = document.querySelector('.dropdown-menu-backlog');
  dropdownMenu.classList.toggle('hidden');
});

const dropdownIconBacklog = document.getElementById('dropdown-icon-backlog');
dropdownButtonBacklog?.addEventListener('click', function () {
  dropdownIconBacklog.classList.toggle('rotate-270');
});

async function showProjectList() {
  try {
    const projects = await projectService.getAllProjects();
    const listContainer = document.getElementById('projectsDropdown');
    listContainer.innerHTML = '';

    projects.forEach((p) => {
      const item = document.createElement('li');
      item.textContent = p.name;
      listContainer.appendChild(item);
    });
  } catch (err) {
    console.error(err.message);
  }
}

showProjectList();

document.addEventListener('DOMContentLoaded', async () => {
  await loadTasksToKanban();
});

async function loadTasksToKanban() {
  try {
    const response = await taskService.getAllTasks();
    const tasks = response.data;

    const todoColumn = document.querySelector(
      '.kanban-board .flex > div:nth-child(1) .space-y-3'
    );
    const inProgressColumn = document.querySelector(
      '.kanban-board .flex > div:nth-child(2) .space-y-3'
    );
    const qaColumn = document.querySelector(
      '.kanban-board .flex > div:nth-child(3) .space-y-3'
    );
    const doneColumn = document.querySelector(
      '.kanban-board .flex > div:nth-child(4) .space-y-3'
    );

    todoColumn.innerHTML = '';
    inProgressColumn.innerHTML = '';
    qaColumn.innerHTML = '';
    doneColumn.innerHTML = '';

    tasks.forEach((task) => {
      const card = createTaskCard(task);

      switch (task.status?.toLowerCase()) {
        case 'to do':
        case 'todo':
          todoColumn.appendChild(card);
          break;
        case 'in progress':
          inProgressColumn.appendChild(card);
          break;
        case 'qa':
          qaColumn.appendChild(card);
          break;
        case 'done':
          doneColumn.appendChild(card);
          break;
        default:
          console.warn(`Unknown task status: ${task.status}`);
      }
    });
  } catch (err) {
    console.error('Error loading tasks:', err.message || err);
  }
}

function createTaskCard(task) {
  const div = document.createElement('div');
  div.className =
    'p-3 bg-gray-50 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 transition';
  div.innerHTML = `
    <h3 class="font-semibold text-sm">${task.title}</h3>
    <p class="text-xs text-gray-500 mt-1">${task.description || ''}</p>
    <div class="flex justify-between items-center mt-2 text-[11px] text-gray-400">
      <span>${task.priority || 'Medium'}</span>
      <span>${task.assignee || 'Unassigned'}</span>
    </div>
  `;
  return div;
}
