import projectService from '../services/ProjectService.js';
import taskService from '../services/TaskService.js';
import TaskService from '../services/TaskService.js';
import { DateTime } from 'luxon';
import showToast from './showToast.js';
import { formatISO } from 'date-fns';
import { showTaskDrawer } from '../pages/taskDrawer/taskDrawer.js';
import { svgObject } from './svgObjects.js';
import { config } from '../config/config.ts';
import type { Sprint, Task } from '../interfaces/common.ts';

export async function createTaskList(
  task: Task,
  type: string,
  projectType: string,
  sprint: Sprint
) {
  let ifSprint = `hidden`;
  if (type === 'backlog') {
    ifSprint = ``;
  }

  let ifKanban = '';
  if (projectType === 'kanban') {
    ifKanban = 'hidden';
  }

  let typeSvg;
  if (task.type === 'task') {
    typeSvg = `${svgObject.task}`;
  } else if (task.type === 'story') {
    typeSvg = `${svgObject.story}`;
  } else {
    typeSvg = `${svgObject.bug}`;
  }

  let priority;
  switch (task.priority) {
    case 'low':
      priority = 'border-l-green-500';
      break;
    case 'medium':
      priority = 'border-l-blue-500';
      break;
    case 'high':
      priority = 'border-l-yellow-400';
      break;
    case 'critical':
      priority = 'border-l-red-600';
      break;
  }

  const tr = document.createElement('tr');
  const reporter = task.reporter
    ? (await TaskService.getUserDetailsById(task.reporter)).data.result
    : '';

  let assignee = { name: 'Unassigned', profileImage: '...' };
  if (task.assignee) {
    const data = (await TaskService.getUserDetailsById(task.assignee)).data
      .result;
    assignee = {
      name: data.name,
      profileImage: data.profileImage
        ? config.API_BASE_URL + '/uploads/profile/' + data.profileImage
        : '../../../../assets/img/profile.png',
    };
  }

  const labelsEl = task.tags.map((label, idx) => {
    if (idx > 3) {
      return '';
    }

    let labelEl;

    if (idx == 3) {
      labelEl = /* HTML */ `
        <div class="rounded-sm bg-gray-200 px-2 py-1">
          +${task.tags.length - 3}
        </div>
      `;
    } else {
      labelEl = /* HTML */ ` <div
        class="labels bg-primary-100 rounded-sm px-2 py-1"
      >
        ${label}
      </div>`;
    }

    return labelEl;
  });

  tr.classList = ` border-b border-b-gray-200 whitespace-nowrap border-l-3 ${priority} bg-white hover:bg-gray-100`;
  tr.dataset.id = task._id;

  let dateValue;
  const newDate = new Date(task.dueDate.split('T')[0]);
  dateValue = formatISO(newDate, { representation: 'date' });

  tr.innerHTML = /* HTML */ `
    <td class="${ifSprint} ${ifKanban} px-4 py-2">
      <div class="flex items-center">
        <input
          id="checkbox-all-search"
          type="checkbox"
          class="checkboxes text-primary-600 bg-primary-100 border-primary-300 accent-primary-500 focus:ring-primary-600 h-3.5 w-3.5 rounded-sm"
          data-id=${task._id}
        />
      </div>
    </td>
    <td class="">
      <div class="flex w-full justify-center">${typeSvg}</div>
    </td>
    <td class="p-2">
      <p
        class="wrapper bg-primary-500 w-max rounded-md px-2 py-1 text-xs font-semibold text-white uppercase"
      >
        ${task.key}
      </p>
    </td>
    <td class="open-taskDrawer cursor-pointer p-2 hover:underline">
      ${task.title}
    </td>
    <td class="p-2">
      <div class="bg-primary-400 mr-2 w-fit rounded-md px-2 py-0.5 text-white">
        <select class="status-select-${task._id} w-30 outline-none"></select>
      </div>
    </td>
    <td class="${ifKanban} ${!sprint ? 'hidden' : ''} p-2">
      ${sprint
        ? '<p class="wrapper bg-primary-400 text-white px-2 py-1 rounded-sm w-max uppercase font-semibold text-xs">' +
          sprint.key +
          '</p>'
        : ''}
    </td>
    <td class="p-2">
      <div class="flex items-center">
        <img
          class="mr-3 aspect-square h-6 w-6 rounded-full object-cover"
          src="${assignee.profileImage}"
        />${assignee.name}
      </div>
    </td>
    <td class="p-2">
      <input
        type="date"
        name="dueDate"
        id=""
        class="${new Date(task.dueDate).getTime() < Date.now()
          ? 'text-red-600'
          : ''} block w-28 rounded-md border border-gray-300 bg-gray-50 p-1 text-sm text-black outline-none"
        placeholder="Enter the due date"
        value="${dateValue}"
      />
    </td>

    <td class="p-2">
      <div class="flex min-w-18 gap-1 text-xs">${labelsEl.join('')}</div>
    </td>
    <td class="p-2">
      ${task.createdAt
        ? DateTime.fromISO(task.createdAt).toLocaleString(DateTime.DATE_MED)
        : ''}
    </td>
    <td class="p-2">
      ${task.updatedAt
        ? DateTime.fromISO(task.updatedAt).toLocaleString(DateTime.DATE_MED)
        : ''}
    </td>

    <td class="p-2">
      <div class="flex items-center">
        <img
          class="mr-3 aspect-square h-6 w-6 rounded-full object-cover"
          src="${reporter.profileImage
            ? config.API_BASE_URL + '/uploads/profile/' + reporter.profileImage
            : '../../../assets/img/profile.png'}"
        />${reporter.name}
      </div>
    </td>
    <td class="p-2">&nbsp;</td>
  `;

  const dueDateInput = tr.querySelector(
    `.${task.key}-due-date`
  ) as HTMLInputElement | null;
  const openTaskDrawer = tr.querySelector(
    '.open-taskDrawer'
  ) as HTMLElement | null;

  if (openTaskDrawer) {
    openTaskDrawer.addEventListener('click', () => showTaskDrawer(task._id!));
  }

  if (dueDateInput) {
    dueDateInput.addEventListener('change', async () => {
      if (!task.dueDate) return; // safety check

      const oldDueDate = new Date(task.dueDate);
      const newDueDate = new Date(dueDateInput.value);

      if (newDueDate < oldDueDate) {
        showToast('Invalid due date', 'error');
        dueDateInput.value = formatISO(oldDueDate, { representation: 'date' });
        return;
      }

      await taskService.updateTask(task._id!, { dueDate: dueDateInput.value });

      showToast('Task Updated successfully', 'success');

      if (newDueDate >= new Date()) {
        dueDateInput.classList.remove('text-red-600');
      }
    });
  }

  const statusOption = tr.querySelector(
    `.status-select-${task._id}`
  ) as HTMLSelectElement | null;

  if (statusOption) {
    await addStatusOptions(statusOption, task.status);

    statusOption.addEventListener('change', async (e: Event) => {
      const target = e.target as HTMLSelectElement;
      if (!target.value) return;

      if (task._id) {
        await taskService.updateTask(task._id, { status: target.value });
      }

      e.preventDefault();
    });
  }

  return tr;
}

async function addStatusOptions(
  selectContainer: HTMLSelectElement,
  taskStatus: string
): Promise<void> {
  const selectedProjectId = localStorage.getItem('selectedProject');

  if (!selectedProjectId) {
    return;
  }

  const project = (await projectService.getProjectById(selectedProjectId))
    .result;

  if (!project?.columns) {
    return;
  }

  project.columns.forEach((column: string) => {
    const optionEl = document.createElement('option');
    optionEl.className = 'font-semibold';
    optionEl.innerText = column;
    optionEl.value = column;

    if (column === taskStatus) {
      optionEl.selected = true;
    }

    selectContainer.appendChild(optionEl);
  });
}
