import authService from '../../services/AuthService';
import projectService from '../../services/ProjectService';
import taskService from '../../services/TaskService';
import { ifSelectedProject } from '../../utils/elementUtils';
import { getSvgByPriority, getSvgByType } from '../../utils/globalUtils';
import renderSelectedTab from '../../utils/renderSelectedTab';
import { svgObject } from '../../utils/svgObjects';
import { handleDashboardSprintPreview } from '../dashboard/backlogView/sprint';
import { toggleSidebar } from '../dashboard/sidebar/sidebar';
import { loadProjectMembers } from '../loadMembers/loadMembers';
import { showTaskDrawer } from '../taskDrawer/taskDrawer';

function showForYouPage(flag) {
  const forYouPage = document.getElementById('forYouPage');
  const mainPage = document.getElementById('main-section');
  if (flag) {
    setTimeout(() => {
      mainPage.classList.add('hidden');
      forYouPage.classList.remove('hidden');
    }, 300);
  } else {
    setTimeout(() => {
      forYouPage.classList.add('hidden');
      mainPage.classList.remove('hidden');
    }, 300);
  }
}

export async function handleForYouPage() {
  const forYouButton = document.getElementById('forYouButton');
  const projectsContainer = document.getElementById('forYouProjectsContainer');
  const backToHomeBtn = document.getElementById('forYouGoBackBtn');
  const allTasksContainer = document.getElementById('forYouTableBody');
  const forYouGoBackBtn = document.getElementById('forYouGoBackBtn');
  projectsContainer.innerHTML = '';
  allTasksContainer.innerHTML = '';
  forYouGoBackBtn.innerHTML = `${svgObject.back}`;

  forYouButton.addEventListener('click', () => {
    showForYouPage(true);
    toggleSidebar('close');
  });
  const projects = await projectService.getAllProjects();

  projects.forEach((project) => {
    const projectCard = createProjectCard(project);
    projectsContainer.appendChild(projectCard);
  });

  backToHomeBtn.addEventListener('click', () => {
    showForYouPage(false);
  });

  await renderStatusContainers(allTasksContainer);

  allTasksContainer
    .querySelectorAll('.tasks-container')
    .forEach((container) => {
      if (container.childElementCount === 1) {
        container.firstElementChild.classList.remove('hidden');
      }
    });
}

function createProjectCard(project) {
  const projectDiv = document.createElement('div');
  projectDiv.dataset.id = project._id;
  projectDiv.className =
    'flex flex-col gap-3 border-s-2 border-s-primary-500 rounded-sm bg-white md:min-w-64 min-w-48 p-4 cursor-pointer hover:bg-gray-100 shadow-sm border border-gray-200';
  projectDiv.innerHTML = /* HTML */ `
    <p class="font-semibold">${project.name}</p>

    <div class="flex flex-col gap-1">
      <div class="flex justify-between">
        <p>Project Type</p>
        <p>${project.projectType}</p>
      </div>

      <div class="flex justify-between">
        <p>Members Assigned</p>
        <p>${project.members.length}</p>
      </div>
      <div></div>
    </div>
  `;

  projectDiv.addEventListener('click', async () => {
    localStorage.setItem('selectedProject', project._id);
    ifSelectedProject();
    await renderSelectedTab(project._id);
    showForYouPage(false);
    loadProjectMembers(project._id);
    await handleDashboardSprintPreview();
  });

  return projectDiv;
}

async function renderStatusContainers(parentElement) {
  if (!localStorage.getItem('selectedProject')) return;
  const project = (
    await projectService.getProjectById(localStorage.getItem('selectedProject'))
  ).result;

  project.columns.forEach((column) => {
    const row = document.createElement('div');
    row.className = 'flex flex-col w-full mb-2 hidden';
    row.id = `${column}-row`;
    row.innerHTML = /* HTML */ `
      <div class="flex items-center justify-between gap-2">
        <p class="my-2 font-semibold text-gray-500">${column}</p>
        <div
          class="w-4 rounded-full bg-gray-200 text-center text-[10px]! font-semibold text-black"
          id="${column}-task-count"
        ></div>
      </div>
      <ul
        class="tasks-container flex flex-col gap-1"
        id="${column}-task-container"
      ></ul>
    `;
    parentElement.appendChild(row);
  });

  await renderTasksByStatus(project);
}

async function renderTasksByStatus(project) {
  const totalTasksCount = document.getElementById('forYouTotalTasksCount');
  const user = await authService.getUserInfo();
  const tasks = (
    await taskService.getTaskByProjectId(
      localStorage.getItem('selectedProject'),
      'assignee',
      user._id
    )
  ).data.result;

  totalTasksCount.innerText = tasks.length;
  let result = {};

  project.columns.forEach((column) => (result[column] = []));
  tasks.forEach((task) => result[task.status].push(task));
  console.log(result);

  project.columns.forEach((column) => {
    const container = document.getElementById(`${column}-task-container`);
    const taskCount = document.getElementById(`${column}-task-count`);
    const row = document.getElementById(`${column}-row`);
    taskCount.innerText = result[column].length;

    const columnTasks = result[column];
    if (!columnTasks.length) return;

    row.classList.remove('hidden');
    console.log(columnTasks);
    columnTasks.forEach((task) => {
      const newEl = renderForYouTasks(task, project.name);
      container.appendChild(newEl);
    });
  });
}

function renderForYouTasks(task, projectName) {
  const taskEl = document.createElement('li');
  const typeSvg = getSvgByType(task);
  const prioritySvg = getSvgByPriority(task);

  taskEl.className =
    'bg-white p-2 flex justify-between items-center rounded-sm hover:cursor-pointer hover:bg-primary-50 shadow-sm border border-gray-100';
  taskEl.innerHTML = /* HTML */ `
    <div class="flex items-center justify-start gap-2">
      <div class="flex items-center justify-center">${typeSvg}</div>
      <div class="flex flex-col items-start justify-center">
        <div class="flex gap-2">
          <p
            class="smaller-text bg-primary-500 m-auto w-max rounded-sm px-1 text-center font-semibold text-nowrap text-white"
          >
            ${task.key}
          </p>
          <p class="font-semibold">${task.title}</p>
        </div>
        <div class="flex items-center justify-center gap-3">
          <p class="smaller-text font-medium text-gray-500">${projectName}</p>
        </div>
      </div>
    </div>
    <p class="smaller-text flex gap-2 font-medium">
      ${String(task.priority).charAt(0).toUpperCase() +
      String(task.priority).slice(1)}${prioritySvg}
    </p>
  `;

  taskEl.addEventListener('click', () => showTaskDrawer(task._id));
  return taskEl;
}
