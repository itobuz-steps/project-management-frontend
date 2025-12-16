import taskService from '../../services/TaskService';
import commentService from '../../services/CommentService';
import showToast from '../../utils/showToast';
import { openUpdateTaskModal } from '../../utils/modals/updateTaskModal';
import { renderAttachments } from './renderAttachments';
import { appendCommentToContainer } from './appendComment';
import { renderSubtasks } from './renderSubtasks';

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
  const attachmentInput = taskDrawer.querySelector('#commentAttachment');
  const attachButton = taskDrawer.querySelector('#attachButton');

  attachButton.addEventListener('click', () => {
    attachmentInput.click();
  });

  editTaskButton.addEventListener('click', () => {
    editModal.classList.remove('hidden');
    openUpdateTaskModal(taskId);
  });

  renderSubtasks(task);

  commentInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commentSubmit.click();
    }
  });

  commentSubmit.addEventListener('click', async () => {
    const message = commentInput.value.trim();
    const attachmentInput = taskDrawer.querySelector('#commentAttachment');

    if (!message && attachmentInput.files.length > 0) {
      showToast('You must enter a comment before adding an attachment');
      return;
    }

    const formData = new FormData();

    formData.append('taskId', task._id);
    formData.append('message', message);

    if (attachmentInput.files.length === 1) {
      formData.append('attachment', attachmentInput.files[0]);
    }

    try {
      await commentService.createComment(formData);

      commentInput.value = '';
      attachmentInput.value = '';

      updateCommentList();
    } catch (err) {
      showToast('Failed to submit comment');
      console.error(err);
    }
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
  renderAttachments(task);
}
