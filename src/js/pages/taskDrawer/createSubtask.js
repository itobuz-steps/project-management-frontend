import taskService from '../../services/TaskService';
import showToast from '../../utils/showToast';
import { showTaskDrawer } from './taskDrawer';
import renderSelectedTab from '../../utils/renderSelectedTab';
import { openCreateTaskModal } from '../../utils/modals/createTaskModal';

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

      if (task.type === 'story') canAddSubtask = true;

      if (
        (task.type === 'task' || task.type === 'bug') &&
        (!parentTask || parentTask.type === 'story')
      )
        canAddSubtask = true;

      if (!canAddSubtask) subtaskContainer.style.display = 'none';
    } catch (err) {
      console.error(err);
    }
  }

  showDropdown();

  function dropdownRender(allTasks, parentTask) {
    const createRow = document.createElement('div');

    createRow.className =
      'flex items-center gap-2 text-primary-500 cursor-pointer font-medium mb-2';
    createRow.innerHTML = `
      <span class="text-lg">+</span>
      <span>Create Subtask</span>
    `;

    createRow.onclick = async () => {
      const response = openCreateTaskModal(task);

      if (response?.newTask) {
        const updatedSubtasks = parentTask.subTask
          ? [...parentTask.subTask, response.newTask._id]
          : [response.newTask._id];

        await taskService.updateTask(parentTask._id, {
          subTask: updatedSubtasks,
        });

        const updatedParentTask = (
          await taskService.getTaskById(parentTask._id)
        ).data.result;

        subtaskDropdown.classList.add('hidden');
        saveSubtasksBtn.classList.add('hidden');
        isDropdownVisible = false;

        subtaskList.innerHTML = '';

        const allTasksUpdated = (
          await taskService.getTaskByProjectId(
            localStorage.getItem('selectedProject')
          )
        ).data.result;

        dropdownRender(allTasksUpdated, updatedParentTask);
        renderSelectedTab(localStorage.getItem('selectedProject'));
      }
    };

    subtaskList.appendChild(createRow);

    allTasks.forEach((t) => {
      if (task.type === 'task' && t.type === 'story') return;
      if (t._id === task._id) return;
      if (t.subTask.length && task.type !== 'story') return;

      const isChecked = parentTask.subTask?.includes(t._id);

      const subTask = document.createElement('div');
      subTask.className = 'flex items-center gap-4';
      subTask.innerHTML = `
        <input
          type="checkbox"
          class="subtask-check cursor-pointer"
          value="${t._id}"
          ${isChecked ? 'checked' : ''}
        />
        <span class="bg-primary-400 w-fit rounded-sm px-2 py-0.5 text-center text-xs font-medium text-white mr-2">${t.key}</span>
        <span>${t.title}</span>
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
      renderSelectedTab(localStorage.getItem('selectedProject'));
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

    const parentTask = (await taskService.getTaskById(task._id)).data.result;

    let allTasks = (
      await taskService.getTaskByProjectId(
        localStorage.getItem('selectedProject')
      )
    ).data.result;

    const allParentTasks = allTasks.filter((t) => t.subTask?.length);
    const subTaskIds = allParentTasks.reduce(
      (acc, t) => [...acc, ...t.subTask],
      []
    );

    allTasks = allTasks.filter(
      (t) => t._id !== parentTask._id && !subTaskIds.includes(t._id)
    );

    const tasksWithSubtasks = await Promise.all(
      (parentTask.subTask || []).map(async (stId) => {
        const subTask = (await taskService.getTaskById(stId)).data.result;
        return subTask;
      })
    );

    allTasks = [...allTasks, ...tasksWithSubtasks];

    subtaskList.innerHTML = '';
    dropdownRender(allTasks, parentTask);
  };
}
