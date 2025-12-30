import { checkIfEmpty } from './elementUtils';
import sprintService from '../services/SprintService';
import taskService from '../services/TaskService';
import { createTaskList } from './renderTasks';

export function addDragEvent(parentElement, allTrs, sprint) {
  allTrs.forEach((tr) => {
    tr.classList.add('cursor-grab');
    tr.setAttribute('draggable', 'true');

    tr.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('taskId', tr.dataset.id);

      sprint
        ? e.dataTransfer.setData('sprint', JSON.stringify(sprint))
        : e.dataTransfer.setData('sprint', JSON.stringify(''));

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
  e,
  parentContainer,
  projectType,
  ifBacklog,
  sprint
) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData('taskId');
  const droppedSprintFrom = JSON.parse(e.dataTransfer.getData('sprint'));
  const elementKey = ifBacklog ? 'backlog' : droppedSprintFrom.key;

  // for preventing drop in same location
  if (parentContainer.querySelector(`[data-id="${taskId}"]`)) {
    return;
  }

  const taskEl = document.querySelector(`.backlog table [data-id="${taskId}"]`);
  taskEl.remove();
  const task = await taskService.getTaskById(taskId);

  let droppedTask;
  if (projectType === 'kanban') {
    droppedTask = ifBacklog
      ? await createTaskList(task.data.result, 'backlog', projectType, '')
      : await createTaskList(task.data.result, '', 'kanban', sprint);
    addDragEvent(parentContainer, [droppedTask], '');
  } else {
    droppedTask = ifBacklog
      ? await createTaskList(task.data.result, 'backlog', projectType, '')
      : await createTaskList(task.data.result, '', '', sprint);
    addDragEvent(parentContainer, [droppedTask], sprint);
  }

  parentContainer.querySelector(`#${elementKey}-body`)
    ? parentContainer
        .querySelector(`#${elementKey}-body`)
        .appendChild(droppedTask)
    : parentContainer
        .querySelector(`#${sprint.key}-body`)
        .appendChild(droppedTask);

  if (ifBacklog) {
    sprintService
      .removeTaskFromSprint(droppedSprintFrom._id, {
        task: taskId,
      })
      .catch((err) => {
        console.error('Failed to update sprint tasks', err);
      });
  } else {
    if (droppedSprintFrom) {
      sprintService
        .removeTaskFromSprint(droppedSprintFrom._id, {
          task: taskId,
        })
        .catch((err) => {
          console.error('Failed to update sprint tasks', err);
        });

      sprintService
        .addTasksToSprint(sprint._id, { tasks: [taskId] })
        .catch((err) => {
          console.error('Failed to update sprint tasks', err);
        });
    } else {
      sprintService
        .addTasksToSprint(sprint._id, { tasks: [taskId] })
        .catch((err) => {
          console.error('Failed to update sprint tasks', err);
        });
    }
  }
  checkIfEmpty();
}
