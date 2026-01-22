import { handleModalAssignee, handleModalStatus } from './modal';
import taskService from '../../services/TaskService';
import showToast from '../showToast';
import renderSelectedTab from '../renderSelectedTab';
import { addDays, format } from 'date-fns';
import { renderSubtasks } from '../../pages/taskDrawer/renderSubtasks';
import type { Task } from '../../interfaces/common';

let subtaskContext: { _id: string } | null = null;

const closeTaskModal = document.getElementById(
  'close-task-modal'
) as HTMLElement;
const createTaskModal = document.getElementById(
  'create-task-modal'
) as HTMLElement;
const createModalStatusDropdown = document.getElementById(
  'status-create-task-modal'
) as HTMLSelectElement;
const createModalAssigneeDropdown = document.getElementById(
  'create-modal-assignee'
) as HTMLSelectElement;
const input = document.getElementById('attachments') as HTMLInputElement;
const fileName = document.getElementById('file-name') as HTMLElement;
const taskForm = document.getElementById('task-form') as HTMLFormElement;
const inputFiles = new DataTransfer();

closeTaskModal?.addEventListener('click', () => {
  createTaskModal.classList.add('hidden');
  taskForm.reset();
});

input.addEventListener('change', () => {
  if (!input.files) {
    return;
  }

  if (
    input.files.length + inputFiles.files.length > 0 &&
    input.files.length + inputFiles.files.length < 6
  ) {
    for (const file of input.files) {
      inputFiles.items.add(file);
    }
    input.files = inputFiles.files;

    fileName.textContent = Array.from(input.files)
      .map((file) => file.name)
      .join(', ');
  } else if (input.files.length + inputFiles.files.length >= 6) {
    showToast('Maximum 5 files you can insert', 'info');
    input.files = inputFiles.files;
  } else {
    fileName.textContent = 'No file chosen';
  }
});

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const projectId = localStorage.getItem('selectedProject');

  if (!projectId) {
    return;
  }

  let dateValue: string;

  const dueDateInput = document.getElementById('dueDate') as HTMLInputElement;

  if (!dueDateInput.value) {
    dateValue = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  } else {
    dateValue = format(new Date(dueDateInput.value), 'yyyy-MM-dd');
  }

  const task: Task = {
    projectId, 
    title: (
      document.getElementById('create-task-modal-title') as HTMLInputElement
    ).value.trim(),

    storyPoint: Number(
      (document.getElementById('story-point') as HTMLInputElement).value.trim()
    ),

    description: (
      document.getElementById('description') as HTMLInputElement
    ).value.trim(),

    type: (document.getElementById('type') as HTMLSelectElement).value,
    priority: (document.getElementById('priority') as HTMLSelectElement).value,
    status: (
      document.getElementById('status-create-task-modal') as HTMLSelectElement
    ).value,

    tags: (document.getElementById('tags') as HTMLInputElement).value
      ? (document.getElementById('tags') as HTMLInputElement).value
          .split(',')
          .map((t) => t.trim())
      : [],

    dueDate: dateValue,

    assignee:
      (document.getElementById('create-modal-assignee') as HTMLSelectElement)
        .value === 'null'
        ? undefined
        : (
            document.getElementById(
              'create-modal-assignee'
            ) as HTMLSelectElement
          ).value,

    attachments: input.files ?? undefined,
    parentTask: subtaskContext?._id ?? undefined,
  };

  try {
    const response = await taskService.createTask(task);

    if (!response) {
      return;
    }
    const newTask = response.data.result.newTask;

    const subtaskDropdown = document.getElementById('subtaskDropdown');
    const saveSubtasksBtn = document.getElementById('saveSubtasksBtn');

    createTaskModal.classList.add('hidden');

    showToast('Task created Successfully', 'success');

    fileName.textContent = 'No file chosen';
    taskForm.reset();

    if (subtaskContext) {
      const parentTaskId = subtaskContext._id;
      const parentTask = (await taskService.getTaskById(parentTaskId)).data
        .result;
      const updatedSubtasks = parentTask.subTask
        ? [...parentTask.subTask, newTask._id]
        : [newTask._id];

      await taskService.updateTask(parentTaskId, { subTask: updatedSubtasks });

      renderSubtasks({ ...parentTask, subTask: updatedSubtasks });

      if (subtaskDropdown && saveSubtasksBtn) {
        subtaskDropdown.classList.add('hidden');
        saveSubtasksBtn.classList.add('hidden');
      }
    } else {
      await renderSelectedTab(projectId);
    }

    subtaskContext = null;
  } catch (error) {
    console.error(error);
  }
});

export function openCreateTaskModal(context: { _id: string } | null = null) {
  subtaskContext = context;

  createTaskModal.classList.remove('hidden');
  handleModalStatus(createModalStatusDropdown);
  handleModalAssignee(createModalAssigneeDropdown);
}
