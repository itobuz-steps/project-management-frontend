import { handleModalAssignee, handleModalStatus } from './modal';
import { renderBoard } from '../../pages/dashboard/dashboard';
import { renderDashBoardTasks } from '../renderTasks';
import taskService from '../../services/TaskService';

const closeTaskModal = document.getElementById('close-task-modal');
const createTaskModal = document.getElementById('create-task-modal');
const createModalStatusDropdown = document.getElementById(
  'status-create-task-modal'
);
const createModalAssigneeDropdown = document.getElementById(
  'create-modal-assignee'
);
const input = document.getElementById('attachments');
const fileName = document.getElementById('file-name');
const taskForm = document.getElementById('task-form');

closeTaskModal.addEventListener('click', () => {
  createTaskModal.classList.add('hidden');
});

input.addEventListener('change', () => {
  if (input.files.length > 0) {
    fileName.textContent = Array.from(input.files)
      .map((file) => file.name)
      .join(', ');
  } else {
    fileName.textContent = 'No Files Chosen';
  }
});

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  let dateValue;
  if (document.getElementById('dueDate').value === '1999-10-10') {
    dateValue = new Date().toLocaleDateString();

    const splitVal = dateValue.split('/');

    dateValue = splitVal[2] + '-' + splitVal[1] + '-' + splitVal[0];
  } else {
    dateValue = document.getElementById('dueDate').value;
  }

  const task = {
    projectId: localStorage.getItem('selectedProject'),
    title: document.getElementById('create-task-modal-title').value.trim(),
    description: document.getElementById('description').value.trim(),
    type: document.getElementById('type').value,
    priority: document.getElementById('priority').value,
    status: document.getElementById('status-create-task-modal').value,
    tags: document.getElementById('tags').value
      ? document
          .getElementById('tags')
          .value.split(',')
          .map((t) => t.trim())
      : [],
    block: document.getElementById('block').value
      ? document
          .getElementById('block')
          .value.split(',')
          .map((t) => t.trim())
      : [],
    blockedBy: document.getElementById('BlockedBy').value
      ? document
          .getElementById('BlockedBy')
          .value.split(',')
          .map((t) => t.trim())
      : [],
    relatesTo: document.getElementById('relatesTo').value
      ? document
          .getElementById('relatesTo')
          .value.split(',')
          .map((t) => t.trim())
      : [],
    dueDate: dateValue,
    assignee:
      document.getElementById('create-modal-assignee').value === 'null'
        ? null
        : document.getElementById('create-modal-assignee').value,
    attachments: input.files,
  };
  console.log('input file array', Array.from(input.files));
  try {
    await taskService.createTask(task);

    createTaskModal.classList.add('hidden');

    renderBoard(localStorage.getItem('selectedProject'));
    renderDashBoardTasks();

    fileName.textContent = 'No file chosen';
  } catch (error) {
    console.error(error);
  }
});

export function openCreateTaskModal() {
  createTaskModal.classList.remove('hidden');
  handleModalStatus(createModalStatusDropdown);
  handleModalAssignee(createModalAssigneeDropdown);
}
