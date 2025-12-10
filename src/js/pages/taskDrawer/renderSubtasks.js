import { removeElementChildren } from '../../utils/elementUtils';
import taskService from '../../services/TaskService';

export async function renderSubtasks(task) {
  const list = document.getElementById('subtasksList');
  const assignee = task.assignee
    ? (await taskService.getUserDetailsById(task.assignee)).data.result
    : null;

  removeElementChildren(list);

  if (!task.subTask || task.subTask.length === 0) {
    list.innerHTML = "<p class='text-gray-500 text-sm'>No subtasks</p>";
    return;
  }

  const all = (
    await taskService.getTaskByProjectId(
      localStorage.getItem('selectedProject')
    )
  ).data.result;

  const subtasks = all.filter((t) => task.subTask.includes(t._id));

  subtasks.forEach((st) => {
    const div = document.createElement('div');
    div.className =
      'flex items-start bg-white rounded-lg shadow-md pl-3 py-4 border border-[#90e0ef]';
    div.innerHTML = `
      <img
        src="${
          assignee
            ? assignee.profileImage
              ? 'http://localhost:3001/uploads/profile/' + assignee.profileImage
              : '../../../assets/img/profile.png'
            : '../../../assets/img/profile.png'
        }"
         
        class="w-8 h-8 rounded-full border-2 border-[#00b4d8]"
        title = "${assignee ? assignee.name : 'unassigned'}"
      />
      <div class="ml-3">
        <span class="font-medium text-[#03045e] text-md">${st.title}</span>
        <p class="text-sm text-[#03045e]/70">${st.description || ''}</p>
      </div>
    `;
    list.appendChild(div);
  });
}
