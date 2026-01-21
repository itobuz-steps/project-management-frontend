import projectService from '../../services/ProjectService';
import taskService from '../../services/TaskService';
import { ifSelectedProject } from '../../utils/elementUtils';
import { getSvgByPriority, getSvgByType } from '../../utils/globalUtils';
import renderSelectedTab from '../../utils/renderSelectedTab';
import { svgObject } from '../../utils/svgObjects';
import { handleDashboardSprintPreview } from '../dashboard/backlogView/sprint';
import {
  updateProjectList,
  updateUserList,
} from '../dashboard/sidebar/sidebar';
import { loadProjectMembers } from '../loadMembers/loadMembers';
import { showTaskDrawer } from '../taskDrawer/taskDrawer';

import type { Project } from '../../interfaces/common';
import type { Task } from '../../interfaces/common';

export function showForYouPage(flag: boolean): void {
  const forYouPage = document.getElementById('forYouPage');
  const mainPage = document.getElementById('main-section');

  if (!forYouPage || !mainPage) return;

  setTimeout(() => {
    if (flag) {
      mainPage.classList.add('hidden');
      forYouPage.classList.remove('hidden');
    } else {
      forYouPage.classList.add('hidden');
      mainPage.classList.remove('hidden');
    }
  }, 300);
}

export async function handleForYouPage(): Promise<void> {
  const projectsContainer = document.getElementById('forYouProjectsContainer');
  const allTasksContainer = document.getElementById('forYouTableBody');
  const backToHomeBtn = document.getElementById('forYouGoBackBtn');

  if (!projectsContainer || !allTasksContainer || !backToHomeBtn) return;

  projectsContainer.innerHTML = '';
  allTasksContainer.innerHTML = '';
  backToHomeBtn.innerHTML = svgObject.back;

  const projects: Project[] = await projectService.getAllProjects();

  projects.forEach((project) => {
    projectsContainer.appendChild(createProjectCard(project));
  });

  backToHomeBtn.addEventListener('click', () => {
    showForYouPage(false);
  });

  await renderStatusContainers(allTasksContainer);

  allTasksContainer
    .querySelectorAll<HTMLElement>('.tasks-container')
    .forEach((container) => {
      if (container.childElementCount === 1) {
        container.firstElementChild?.classList.remove('hidden');
      }
    });
}

function createProjectCard(project: Project): HTMLDivElement {
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
    </div>
  `;

  projectDiv.addEventListener('click', async () => {
    localStorage.setItem('selectedProject', project._id);
    ifSelectedProject();
    await renderSelectedTab(project._id);
    showForYouPage(false);
    loadProjectMembers(project._id);
    updateUserList();
    await handleDashboardSprintPreview();
    updateProjectList();
  });

  return projectDiv;
}

async function renderStatusContainers(
  parentElement: HTMLElement
): Promise<void> {
  const totalTasksCount = document.getElementById('forYouTotalTasksCount');

  if (!totalTasksCount) return;

  const response = await taskService.getAllUserTasks();
  const tasks: Task[] = response.data.result;

  totalTasksCount.innerText = String(tasks.length);

  const groupedTasks: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    if (!groupedTasks[task.status]) {
      groupedTasks[task.status] = [];
    }
    groupedTasks[task.status].push(task);
  });

  Object.keys(groupedTasks).forEach((status) => {
    const row = document.createElement('div');
    row.className = 'flex flex-col w-full mb-2 hidden';
    row.id = `${status}-row`;

    row.innerHTML = /* HTML */ `
      <div class="flex items-center justify-between gap-2">
        <p class="my-2 font-semibold text-gray-500 uppercase">${status}</p>
        <div
          class="w-4 rounded-full bg-gray-200 text-center text-[10px]! font-semibold text-black"
          id="${status}-task-count"
        ></div>
      </div>
      <ul
        class="tasks-container flex flex-col gap-1"
        id="${status}-task-container"
      ></ul>
    `;

    parentElement.appendChild(row);
  });

  await renderTasksByStatus(groupedTasks);
}

async function renderTasksByStatus(
  groupedTasks: Record<string, Task[]>
): Promise<void> {
  Object.keys(groupedTasks).forEach((status) => {
    const container = document.getElementById(`${status}-task-container`);
    const taskCount = document.getElementById(`${status}-task-count`);
    const row = document.getElementById(`${status}-row`);

    if (!container || !taskCount || !row) return;

    const tasks = groupedTasks[status];
    taskCount.innerText = String(tasks.length);

    if (!tasks.length) return;

    row.classList.remove('hidden');

    tasks.forEach((task) => {
      container.appendChild(renderForYouTask(task, task.projectId.name));
    });
  });
}

/* ------------------------------------------------------------------ */
/* Single task */
/* ------------------------------------------------------------------ */

function renderForYouTask(task: Task, projectName: string): HTMLLIElement {
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
      ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
      ${prioritySvg}
    </p>
  `;

  taskEl.addEventListener('click', () => showTaskDrawer(task._id));

  return taskEl;
}
