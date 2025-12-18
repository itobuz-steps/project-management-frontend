import taskService from '../../services/TaskService';
import commentService from '../../services/CommentService';
import showToast from '../../utils/showToast';
import { openUpdateTaskModal } from '../../utils/modals/updateTaskModal';
import { renderAttachments } from './renderAttachments';
import { appendCommentToContainer } from './appendComment';
import { renderSubtasks } from './renderSubtasks';
import { createSubtask } from './createSubtask';

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
    const formData = new FormData();

    if (!message && attachmentInput.files.length > 0) {
      showToast('You must enter a comment before adding an attachment');
      return;
    }

    formData.append('taskId', task._id);
    formData.append('message', message);

    if (attachmentInput.files.length) {
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
  createSubtask(taskDrawer, task);
  renderAttachments(task);
}
