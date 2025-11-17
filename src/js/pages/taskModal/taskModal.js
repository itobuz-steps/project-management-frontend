import '../../../scss/main.css';
import taskService from '../../services/TaskService';

const toggleButton = document.getElementById('toggleButton');
const closeButton = document.getElementById('CloseButton');
const modal = document.getElementById('task-modal');
const input = document.getElementById('attachments');
const fileName = document.getElementById('file-name');
const form = document.querySelector('form');

input.addEventListener('change', () => {
  if (input.files.length > 0) {
    fileName.textContent = Array.from(input.files)
      .map((file) => file.name)
      .join(', ');
  } else {
    fileName.textContent = 'No Files Chosen';
  }
});

toggleButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});
closeButton.addEventListener('click', () => {
  modal.classList.toggle('hidden');
});
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!form.type.value) {
    alert('Please select a task type');
    return;
  }

  const parseArray = (input) =>
    input.value ? input.value.split(',').map((v) => v.trim()) : [];

  const task = {
    projectId: '69156d314a8b5c98fff3fb48',
    title: form.title.value.trim(),
    description: form.description.value.trim() || '',
    type: form.type.value,
    status: form.status.value || 'todo',
    priority: form.priority.value || 'medium',
    tags: parseArray(form.tags),
    blocks: parseArray(form.block),
    blockedBy: parseArray(form.BlockedBy),
    relatesTo: parseArray(form.relatesTo),
    dueDate: form.dueDate.value ? new Date(form.dueDate.value) : null,
    assignee: form.assignee.value ? form.assignee.value.trim() : null,
  };

  try {
    await taskService.createTask(task);
    alert('Task created successfully!');
    form.reset();
  } catch (error) {
    console.error(error.message);
  }
});
