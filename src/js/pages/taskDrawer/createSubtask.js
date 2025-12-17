import taskService from '../../services/TaskService';
import showToast from '../../utils/showToast';
import { showTaskDrawer } from './taskDrawer';

export function createSubtask(taskDrawer, task) {
  const subtaskDropdown = taskDrawer.querySelector('#subtaskDropdown');
  const saveSubtasksBtn = taskDrawer.querySelector('#saveSubtasksBtn');
  const subtaskBtn = taskDrawer.querySelector('#subtaskButton');
  const subtaskList = taskDrawer.querySelector('#subtaskList');

  let isDropdownVisible = false;
  const saveSubtasksHandler = async () => {
    try {
      const selectedIds = [...taskDrawer.querySelectorAll('.subtask-check')]
        .filter((c) => c.checked)
        .map((c) => c.value);

      await taskService.updateTask(task._id, { subTask: selectedIds });

      showToast('Subtasks updated!', 'success');

      subtaskDropdown.classList.add('hidden');
      saveSubtasksBtn.classList.add('hidden');
      isDropdownVisible = false;

      showTaskDrawer(task._id);
    } catch (err) {
      showToast(`${err}`, 'error');
    }
  };

  saveSubtasksBtn.onclick = saveSubtasksHandler;

  subtaskBtn.onclick = async () => {
    if (isDropdownVisible) {
      subtaskDropdown.classList.add('hidden');
      isDropdownVisible = false;
      return;
    }

    subtaskDropdown.classList.remove('hidden');
    saveSubtasksBtn.classList.remove('hidden');
    isDropdownVisible = true;

    console.log('task is ', task._id);

    // const allTasks = (
    //   await taskService.getTaskByProjectId(
    //     localStorage.getItem('selectedProject')
    //   )
    // ).data.result;

    const allTasks = await taskService.getTaskById();

    subtaskList.innerHTML = '';

    allTasks.forEach((t) => {
      if (t._id === task._id) return;

      const isChecked = task.subTask?.includes(t._id);

      const subTask = document.createElement('div');
      subTask.className = 'flex items-center gap-2 mb-1';

      subTask.innerHTML = `
              <input
                type="checkbox"
                class="subtask-check"
                value="${t._id}"
                ${isChecked ? 'checked' : ''}
              />
              <span>${t.title}</span>
            `;

      subtaskList.appendChild(subTask);
    });
  };
}
