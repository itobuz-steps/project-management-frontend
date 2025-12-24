import taskService from '../../services/TaskService';
import { handleModalAssignee, handleModalStatus } from './modal';
import renderSelectedTab from '../renderSelectedTab';
import showToast from '../showToast';

const closeEditTask = document.getElementById('close-update-task-modal');
const editModal = document.getElementById('update-task-modal');
const editForm = document.getElementById('edit-task-form');
const drawerBackdrop = document.querySelector('.drawer-backdrop');
let selectedTaskId = null;

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const updatedTask = {
    title: editModal.querySelector('#title').value,
    description: editModal.querySelector('#description').value,
    type: editModal.querySelector('#type').value,
    priority: editModal.querySelector('#priority').value,
    status: editModal.querySelector('#status').value,
    tags: editModal
      .querySelector('#tags')
      .value.split(',')
      .map((t) => t.trim()),
    relatesTo: editModal
      .querySelector('#relatesTo')
      .value.split(',')
      .map((t) => t.trim()),

    blockedBy: editModal
      .querySelector('#BlockedBy')
      .value.split(',')
      .map((t) => t.trim()),

    block: editModal
      .querySelector('#block')
      .value.split(',')
      .map((t) => t.trim()),

    dueDate: editModal.querySelector('#dueDate').value,
    assignee:
      editModal.querySelector('#assignee').value === 'null'
        ? null
        : editModal.querySelector('#assignee').value,
  };
  try {
    await taskService.updateTask(selectedTaskId, updatedTask);
    showToast('Task Updated Successfully', 'success');
    editModal.classList.add('hidden');
    await renderSelectedTab(localStorage.getItem('selectedProject'));

    setTimeout(() => {
      const taskDrawer = document.getElementById('task-side-drawer');
      const profileImageEl = taskDrawer.querySelector('.profile-image');
      taskDrawer.classList.add('translate-x-full');
      taskDrawer.classList.remove('transform-none');
      drawerBackdrop.classList.add('hidden');
      profileImageEl.classList.remove('hidden');
    }, 100);
  } catch (error) {
    console.error(error);
  }
});

closeEditTask.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

export async function openUpdateTaskModal(taskId) {
  selectedTaskId = taskId;
  try {
    const response = await taskService.getTaskById(taskId);
    const task = response.data.result;
    const status = editModal.querySelector('#status');
    editModal.querySelector('#title').value = task.title;
    editModal.querySelector('#description').value = task.description;
    editModal.querySelector('#type').value = task.type;
    editModal.querySelector('#priority').value = task.priority;

    await handleModalStatus(status, task.status);

    editModal.querySelector('#tags').value = task.tags?.join(', ') || '';
    editModal.querySelector('#block').value = task.block || '';
    editModal.querySelector('#BlockedBy').value = task.blockedBy || '';
    editModal.querySelector('#relatesTo').value = task.relatesTo || '';

    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const formattedDate = dueDate.toISOString().slice(0, 10);

      editModal.querySelector('#dueDate').value = formattedDate;
    } else {
      editModal.querySelector('#dueDate').value = '';
    }

    const assignee = editModal.querySelector('#assignee');

    await handleModalAssignee(assignee, task.assignee);

    editModal.classList.remove('hidden');
  } catch (error) {
    console.error('Failed to load task:', error);
  }
}
