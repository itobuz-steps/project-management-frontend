import taskService from '../../services/TaskService';
import commentService from '../../services/CommentService';
import showToast from '../../utils/showToast';
import { openUpdateTaskModal } from '../../utils/modals/updateTaskModal';
import { showConfirmModal } from '../../utils/modals/confirmationModal';

export async function showTaskDrawer(taskId) {
  const task = (await taskService.getTaskById(taskId)).data.result;
  const assignee = task.assignee
    ? (await taskService.getUserDetailsById(task.assignee)).data.result
    : null;

  const taskDrawer = document.querySelector('.task-drawer');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');
  const titleEl = taskDrawer.querySelector('.title');
  const descriptionEl = taskDrawer.querySelector('.description');
  const assigneeEl = taskDrawer.querySelector('.assignee');
  const profileImageEl = taskDrawer.querySelector('.profile-image');
  const dueDateEl = taskDrawer.querySelector('.due-date');
  const closeButton = taskDrawer.querySelector('.close-btn');
  const status = taskDrawer.querySelector('#statusSelect');
  const priority = taskDrawer.querySelector('#prioritySelect');
  const commentInput = taskDrawer.querySelector('#commentInput');
  const commentSubmit = taskDrawer.querySelector('#submitButton');
  const editModal = document.getElementById('update-task-modal');
  const editTaskButton = document.querySelector('#edit-task-button');
  editTaskButton.addEventListener('click', () => {
    editModal.classList.remove('hidden');
    openUpdateTaskModal(taskId);
  });

  // subtasks render
  renderSubtasks(task);

  commentInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commentSubmit.click();
    }
  });

  commentSubmit.addEventListener('click', async () => {
    const commentBody = {
      taskId: task._id,
      message: commentInput.value.trim(),
    };

    await commentService.createComment(commentBody);
    commentInput.value = '';
    updateCommentList();
  });

  status.value = task.status;
  priority.value = task.priority;

  taskDrawer.dataset.id = task._id;
  titleEl.textContent = task.title;
  descriptionEl.textContent = task.description;
  profileImageEl.src = '../../../assets/img/profile.png';

  if (assignee) {
    assigneeEl.textContent = assignee.name;
    if (assignee.profileImage) {
      profileImageEl.src =
        'http://localhost:3001/uploads/profile/' + assignee.profileImage;
    } else {
      profileImageEl.src = '../../../assets/img/profile.png';
    }
  } else {
    assigneeEl.textContent = 'No assignee';
  }

  dueDateEl.textContent = task.dueDate.split('T')[0];

  taskDrawer.classList.remove('translate-x-full');
  taskDrawer.classList.add('transform-none');
  drawerBackdrop.classList.remove('hidden');

  closeButton.addEventListener('click', () => {
    taskDrawer.classList.add('translate-x-full');
    taskDrawer.classList.remove('transform-none');
    drawerBackdrop.classList.add('hidden');
    profileImageEl.classList.remove('hidden');
  });

  // comments

  async function updateCommentList() {
    const comments = (await commentService.getAllComments(task._id)).result;

    const commentContainer = taskDrawer.querySelector('#commentsContainer');
    commentContainer.innerHTML = `
    <div id="commentContainerHeaderText" 
         class="ml-4 font-semibold text-[#03045e]">
      Comments
    </div>
  `;

    comments.forEach((comment) =>
      appendCommentToContainer(comment, commentContainer)
    );
  }

  function appendCommentToContainer(comment, container) {
    const commentEl = document.createElement('div');
    commentEl.className =
      'flex gap-3 items-start bg-white rounded-lg shadow-md px-3 py-3 ' +
      'border border-[#90e0ef] shadow-lg rounded-lg';

    commentEl.innerHTML = `
  <img
    src="${
      comment.author.profileImage
        ? 'http://localhost:3001/uploads/profile/' + comment.author.profileImage
        : '../../../assets/img/profile.png'
    }"
    alt="Avatar"
    class="w-7 h-7 rounded-full border-2 border-[#00b4d8]"
  />

  <div id="CommentInformation" class="flex flex-col gap-1 flex-1">
    <div class="flex justify-between items-center text-md text-[#03045e]">
      <div>
        <span class="username font-medium text-gray-700 text-[#03045e]">
          ${comment.author.name}
        </span>
        <span>•</span>
        <span class="text-sm text-[#0077b6]">
          ${comment.createdAt.split('T')[0]}
        </span>
      </div>

      <svg 
        class="delete-btn cursor-pointer hover:stroke-red-200 hover:opacity-70 transition"
        width="25px" height="25px"
        viewBox="0 0 24 24" fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" 
          stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        />
      </svg>
    </div>

    <p class="message text-gray-700 text-sm text-[#03045e]/70">
      ${comment.message}
    </p>
  </div>
  `;
    console.log('comment ', comment._id);
    const deleteBtn = commentEl.querySelector('.delete-btn');

    deleteBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      showConfirmModal('Are You want to delete this Comment ?', () => {
        deleteComment(commentEl, comment._id, container);
      });
    });

    container.appendChild(commentEl);

    container.scrollTop = container.scrollHeight;
  }

  async function deleteComment(commentEl, commentId, container) {
    try {
      await commentService.deleteComment(commentId);
      container.removeChild(commentEl);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  updateCommentList();

  function createSubtask() {
    const subtaskBtn = taskDrawer.querySelector('#subtaskButton');
    const subtaskDropdown = taskDrawer.querySelector('#subtaskDropdown');
    const subtaskList = taskDrawer.querySelector('#subtaskList');
    const saveSubtasksBtn = taskDrawer.querySelector('#saveSubtasksBtn');

    subtaskBtn.addEventListener('click', async () => {
      subtaskDropdown.classList.toggle('hidden');

      const allTasks = (
        await taskService.getTaskByProjectId(
          localStorage.getItem('selectedProject')
        )
      ).data.result;

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

      saveSubtasksBtn.classList.remove('hidden');
    });

    saveSubtasksBtn.addEventListener('click', async () => {
      const selectedIds = [...taskDrawer.querySelectorAll('.subtask-check')]
        .filter((c) => c.checked)
        .map((c) => c.value);

      await taskService.updateTask(task._id, { subTask: selectedIds });

      showToast('Subtasks updated!', 'success');

      subtaskDropdown.classList.add('hidden');

      showTaskDrawer(task._id);
    });
  }

  createSubtask();

  async function renderSubtasks(task) {
    const list = document.getElementById('subtasksList');
    list.innerHTML = '';
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
}
