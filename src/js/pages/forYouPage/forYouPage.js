import authService from '../../services/AuthService';
import projectService from '../../services/ProjectService';
import taskService from '../../services/TaskService';
import { getSvgByPriority, getSvgByType } from '../../utils/globalUtils';
import renderSelectedTab from '../../utils/renderSelectedTab';
import { svgObject } from '../../utils/svgObjects';

function showForYouPage(flag) {
  const forYouPage = document.getElementById('forYouPage');
  const mainPage = document.getElementById('main-section');
  if (flag) {
    mainPage.classList.add('hidden');
    forYouPage.classList.remove('hidden');
  } else {
    forYouPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
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
    'flex flex-col gap-4 border-s-2 border-s-primary-500 rounded-md bg-white w-fit px-4 py-2 cursor-pointer';
  projectDiv.innerHTML = /* html */ `
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
    <div>

  `;

  projectDiv.addEventListener('click', async () => {
    await renderSelectedTab(project._id);
    showForYouPage(false);
  });

  return projectDiv;
}

async function renderStatusContainers(parentElement) {
  const project = (
    await projectService.getProjectById(localStorage.getItem('selectedProject'))
  ).result;

  project.columns.forEach((column) => {
    const row = document.createElement('div');
    row.className = 'flex flex-col w-full mb-2';
    row.innerHTML = /*html*/ `
      <div class="flex items-center justify-between gap-2">
        <p class="text-gray-500 font-semibold my-2">${column}</p>
        <div class="w-4 font-semibold rounded-full bg-white text-center text-[10px]! text-black" id='${column}-task-count'></div>
      </div>
      <ul class="tasks-container flex flex-col gap-1" id="${column}-task-container">
        <li class="hidden bg-white p-2 flex justify-center items-center rounded-md hover:cursor-pointer hover:bg-primary-50">No tasks found...</li>
      </ul>
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
      localStorage.getItem('selectedProject', 'assignee', user._id)
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
    taskCount.innerText = result[column].length;

    const columnTasks = result[column];
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
    'bg-white p-2 flex justify-between items-center rounded-md hover:cursor-pointer hover:bg-primary-50';
  taskEl.innerHTML = /* html */ `
    <div class="flex justify-start items-center gap-2">
      <div class="flex justify-center items-center">
        ${typeSvg}
      </div>
      <div class="flex flex-col justify-center items-start">
        <p class="font-semibold">${task.title}</p>
        <div class="flex gap-3 justify-center items-center">
          <p class="smaller-text">${task.key}</p>
          <p class="smaller-text">&#x2022;</p>
          <p class="smaller-text">${projectName}</p>
        </div>
      </div>
    </div>
    <p class="smaller-text flex gap-2">${task.priority}${prioritySvg}</p>
  `;
  return taskEl;
}
