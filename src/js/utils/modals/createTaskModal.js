import { handleModalAssignee, handleModalStatus } from './modal';
import taskService from '../../services/TaskService';
import showToast from '../showToast';
import renderSelectedTab from '../renderSelectedTab';
import { addDays, format } from 'date-fns';

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
const inputFiles = new DataTransfer();

closeTaskModal.addEventListener('click', () => {
  createTaskModal.classList.add('hidden');
});

input.addEventListener('change', () => {
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

  let dateValue;

  if (!document.getElementById('dueDate').value) {
    dateValue = new Date();
    dateValue = addDays(dateValue, 7);
    dateValue = format(dateValue, 'yyyy-MM-dd');
  } else {
    dateValue = document.getElementById('dueDate').value;
    dateValue = format(dateValue, 'yyyy-MM-dd');
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

  try {
    await taskService.createTask(task);
    createTaskModal.classList.add('hidden');
    showToast('Task created Successfully', 'success');
    await renderSelectedTab(localStorage.getItem('selectedProject'));
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
