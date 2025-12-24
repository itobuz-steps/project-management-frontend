import taskService from '../../services/TaskService';
import showToast from '../../utils/showToast';
import { showTaskDrawer } from './taskDrawer';

export function createSubtask(taskDrawer, task) {
  const subtaskDropdown = taskDrawer.querySelector('#subtaskDropdown');
  const saveSubtasksBtn = taskDrawer.querySelector('#saveSubtasksBtn');
  const subtaskBtn = taskDrawer.querySelector('#subtaskButton');
  const subtaskList = taskDrawer.querySelector('#subtaskList');
  const subtaskContainer = taskDrawer.querySelector('#subtaskContainer');

  let isDropdownVisible = false;

  async function showDropdown() {
    try {
      const allTasks = (
        await taskService.taskOfProjectId(
          localStorage.getItem('selectedProject')
        )
      ).data.result;
      const parentTask = allTasks.find((t) => t.subTask?.includes(task._id));

      let canAddSubtask = false;

      if (task.type === 'story') {
        canAddSubtask = true;
      }

      if (
        task.type === 'task' &&
        (!parentTask || parentTask.type === 'story')
      ) {
        canAddSubtask = true;
      }

      if (!canAddSubtask) {
        subtaskContainer.style.display = 'none';
      }
    } catch (err) {
      console.error(err);
    }
  }

  showDropdown();

  function dropdownRender(allTasks) {
    allTasks.forEach((t) => {
      if (task.type === 'task' && t.type === 'story') {
        return;
      }
      if (t._id === task._id) {
        return;
      }
      if (t.subTask.length && task.type !== 'story') {
        return;
      }

      const isChecked = task.subTask?.includes(t._id);
      const subTask = document.createElement('div');

      subTask.className = 'flex items-center gap-4';
      subTask.innerHTML = `
        <input
          type="checkbox"
          class="subtask-check cursor-pointer"
          value="${t._id}"
          ${isChecked ? 'checked' : ''}
        />
        <span><span class="bg-primary-400 text-white rounded-sm py-0.5 px-1 mr-2">${t.key} </span>${t.title}</span>
      `;

      subtaskList.appendChild(subTask);
    });
  }

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

    const loadSubtasks = async () => {
      const taskType = (await taskService.getTaskById(task._id)).data.result
        .type;
      console.log('this is for checking the task type ', taskType);

      const subtasks = (await taskService.getTaskById(task._id)).data.result
        .subTask;

      console.log('this is subtasks: ', subtasks);
      if (!subtasks.length) {
        const allTasks = (
          await taskService.getTaskByProjectId(
            localStorage.getItem('selectedProject')
          )
        ).data.result;

        subtaskList.innerHTML = '';
        dropdownRender(allTasks);
      } else {
        let allTasks = [];
        allTasks = (
          await taskService.getTaskByProjectId(
            localStorage.getItem('selectedProject')
          )
        ).data.result;
        const tasksWithSubtasks = await Promise.all(
          subtasks.map(async (stId) => {
            const subTask = (await taskService.getTaskById(stId)).data.result;
            return subTask;
          })
        );

        allTasks = [...allTasks, ...tasksWithSubtasks];

        subtaskList.innerHTML = '';
        dropdownRender(allTasks);
      }
    };

    loadSubtasks();
  };
}
