import taskService from '../../services/TaskService';
import { handleModalAssignee, handleModalStatus } from './modal';
import renderSelectedTab from '../renderSelectedTab';
import showToast from '../showToast';

const closeEditTask = document.getElementById(
  'close-update-task-modal'
) as HTMLElement | null;
const editModal = document.getElementById(
  'update-task-modal'
) as HTMLElement | null;
const editForm = document.getElementById(
  'edit-task-form'
) as HTMLElement | null;
const drawerBackdrop = document.querySelector(
  '.drawer-backdrop'
) as HTMLElement | null;

let selectedTaskId: string | null = null;

editForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!editModal || !selectedTaskId) {
    return;
  }

  const getInputValue = (selector: string): string =>
    (editModal.querySelector(selector) as HTMLInputElement | HTMLSelectElement)
      ?.value ?? '';

  const updatedTask = {
    title: getInputValue('#title'),
    storyPoint: Number(getInputValue('#story-point-update')),
    description: getInputValue('#description'),
    type: getInputValue('#type'),
    priority: getInputValue('#priority'),
    status: getInputValue('#status'),
    tags: getInputValue('#tags')
      .split(',')
      .map((t) => t.trim()),
    dueDate: getInputValue('#dueDate'),
    assignee:
      getInputValue('#assignee') === 'null'
        ? undefined
        : getInputValue('#assignee'),
  };

  try {
    await taskService.updateTask(selectedTaskId, updatedTask);
    showToast('Task Updated Successfully', 'success');
    editModal.classList.add('hidden');
    const projectId = localStorage.getItem('selectedProject');

    if (!projectId) {
      return;
    }

    await renderSelectedTab(projectId);

    setTimeout(() => {
      const taskDrawer = document.getElementById(
        'task-side-drawer'
      ) as HTMLElement | null;
      taskDrawer?.classList.add('translate-x-full');
      taskDrawer?.classList.remove('transform-none');
      drawerBackdrop?.classList.add('hidden');
    }, 100);
  } catch (error) {
    console.error(error);
  }
});

closeEditTask?.addEventListener('click', () => {
  editModal?.classList.add('hidden');
});

export async function openUpdateTaskModal(taskId: string) {
  selectedTaskId = taskId;

  if (!editModal) {
    return;
  }

  try {
    const response = await taskService.getTaskById(taskId);
    const task = response.data.result;
    const status = editModal.querySelector(
      '#status'
    ) as HTMLSelectElement | null;

    (editModal.querySelector('#title') as HTMLInputElement).value = task.title;
    (editModal.querySelector('#story-point-update') as HTMLInputElement).value =
      task.storyPoint.toString();

    (editModal.querySelector('#description') as HTMLTextAreaElement).value =
      task.description;
    (editModal.querySelector('#type') as HTMLSelectElement).value = task.type;
    (editModal.querySelector('#priority') as HTMLSelectElement).value =
      task.priority;

    if (status) {
      await handleModalStatus(status, task.status);
    }

    (editModal.querySelector('#tags') as HTMLInputElement).value =
      task.tags?.join(', ') ?? '';

    const dueDateInput = editModal.querySelector(
      '#dueDate'
    ) as HTMLInputElement;

    if (task.dueDate) {
      dueDateInput.value = new Date(task.dueDate).toISOString().slice(0, 10);
    } else {
      dueDateInput.value = '';
    }

    const assignee = editModal.querySelector(
      '#assignee'
    ) as HTMLSelectElement | null;

    if (assignee) {
      await handleModalAssignee(assignee, task.assignee);
    }

    editModal.classList.remove('hidden');
  } catch (error) {
    console.error('Failed to load task:', error);
  }
}
