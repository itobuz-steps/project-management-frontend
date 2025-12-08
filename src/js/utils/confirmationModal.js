import taskService from '../services/TaskService';

const drawerBackdrop = document.querySelector('.drawer-backdrop');
const deleteModal = document.getElementById('deleteModal');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');

let taskToDelete = null;

export async function showDeleteModal(taskId) {
  taskToDelete = taskId;
  deleteModal.classList.remove('hidden');
  drawerBackdrop.classList.remove('hidden');
}

cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.classList.add('hidden');
  drawerBackdrop.classList.add('hidden');
});

confirmDeleteBtn.addEventListener('click', async () => {
  if (taskToDelete) {
    await taskService.deleteTask(taskToDelete);
    renderBoard(localStorage.getItem('selectedProject'));
    renderDashBoardTasks();
  }
  deleteModal.classList.add('hidden');
  drawerBackdrop.classList.add('hidden');
});
