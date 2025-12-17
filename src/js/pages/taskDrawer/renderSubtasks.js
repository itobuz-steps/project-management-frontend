import taskService from '../../services/TaskService';

export async function renderSubtasks(task) {
  const list = document.getElementById('subtasksList');
  list.innerHTML = '';

  if (!task.subTask || task.subTask.length === 0) {
    list.innerHTML = "<p class='text-gray-500 text-sm'>No subtasks</p>";
    return;
  }

  const subtasks = (await taskService.getTaskById(task._id)).data.result
    .subTask;

  subtasks.forEach(async (sub) => {
    const st = (await taskService.getTaskById(sub)).data.result;
    const subtaskAssignee = st.assignee
      ? (await taskService.getUserDetailsById(st.assignee)).data.result
      : null;

    const div = document.createElement('div');

    div.className =
      'flex items-start bg-white rounded-lg shadow-md pl-3 py-4 border border-[#90e0ef]';

    div.innerHTML = `
      <img
        src="${
          subtaskAssignee
            ? subtaskAssignee.profileImage
              ? 'http://localhost:3001/uploads/profile/' +
                subtaskAssignee.profileImage
              : '../../../assets/img/profile.png'
            : '../../../assets/img/profile.png'
        }"
         
        class="w-8 h-8 rounded-full border-2 border-[#00b4d8]"
        title = "${subtaskAssignee ? subtaskAssignee.name : 'unassigned'}"
      />
      <div class="ml-3">
        <span class="font-medium text-[#03045e] text-md">${st.title}</span>
        <p class="text-sm text-[#03045e]/70">${st.description || ''}</p>
      </div>
    `;
    list.appendChild(div);
  });
}
