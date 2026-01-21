import { checkIfEmpty } from './elementUtils';
import sprintService from '../services/SprintService';
import taskService from '../services/TaskService';
import { createTaskList } from './renderTasks';
import type { Sprint } from '../interfaces/common';

export function addDragEvent(
  parentElement: HTMLElement,
  allTrs: HTMLElement[],
  sprint: Sprint | null
) {
  allTrs.forEach((tr) => {
    tr.classList.add('cursor-grab');
    tr.setAttribute('draggable', 'true');

    tr.addEventListener('dragstart', (e: DragEvent) => {
      if (!e.dataTransfer) {
        return;
      }

      e.dataTransfer.setData('taskId', tr.dataset.id ?? '');

      e.dataTransfer.setData('sprint', JSON.stringify(sprint ?? null));

      e.dataTransfer.effectAllowed = 'move';
      tr.classList.remove('cursor-grab');
      tr.classList.add('cursor-grabbing');
    });

    tr.addEventListener('dragend', () => {
      tr.classList.remove('cursor-grabbing');
      tr.classList.add('cursor-grab');
    });

    parentElement.append(tr);
  });
}

export async function addDropEvent(
  e: DragEvent,
  parentContainer: HTMLElement,
  projectType: string,
  ifBacklog: boolean,
  sprint: Sprint | null
) {
  e.preventDefault();

  if (!e.dataTransfer) {
    return;
  }

  const taskId = e.dataTransfer.getData('taskId');
  const droppedSprintFrom = JSON.parse(
    e.dataTransfer.getData('sprint') || 'null'
  ) as Sprint | null;

  const elementKey = ifBacklog
    ? 'backlog'
    : (droppedSprintFrom?.key ?? 'backlog');

  // for preventing drop in same location
  if (parentContainer.querySelector(`[data-id="${taskId}"]`)) {
    return;
  }

  const taskEl = document.querySelector(
    `.backlog table [data-id="${taskId}"]`
  ) as HTMLElement | null;
  taskEl?.remove();
  const task = await taskService.getTaskById(taskId);

  let droppedTask;
  if (projectType === 'kanban') {
    droppedTask = ifBacklog
      ? await createTaskList(task.data.result, 'backlog', projectType, null)
      : await createTaskList(task.data.result, '', 'kanban', sprint);
    addDragEvent(parentContainer, [droppedTask], null);
  } else {
    droppedTask = ifBacklog
      ? await createTaskList(task.data.result, 'backlog', projectType, null)
      : await createTaskList(task.data.result, '', '', sprint);
    addDragEvent(parentContainer, [droppedTask], sprint);
  }

  const target =
    parentContainer.querySelector(`#${elementKey}-body`) ??
    parentContainer.querySelector(`#${sprint?.key}-body`);

  target?.appendChild(droppedTask);

  if (ifBacklog && droppedSprintFrom?._id) {
    sprintService
      .removeTaskFromSprint(droppedSprintFrom._id, taskId)
      .catch((err) => {
        console.error('Failed to update sprint tasks', err);
      });
  } else {
    if (droppedSprintFrom?._id) {
      sprintService
        .removeTaskFromSprint(droppedSprintFrom._id, taskId)
        .catch((err) => {
          console.error('Failed to update sprint tasks', err);
        });
    }

    if (sprint?._id) {
      sprintService.addTasksToSprint(sprint._id, [taskId]).catch((err) => {
        console.error('Failed to update sprint tasks', err);
      });
    }
  }
  checkIfEmpty();
}
