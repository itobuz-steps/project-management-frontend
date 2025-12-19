import taskService from '../../services/TaskService';
import commentService from '../../services/CommentService';
import showToast from '../../utils/showToast';
import { openUpdateTaskModal } from '../../utils/modals/updateTaskModal';
import { renderAttachments } from './renderAttachments';
import { appendCommentToContainer } from './appendComment';
import { renderSubtasks } from './renderSubtasks';
import { createSubtask } from './createSubtask';

const taskDrawerInnerHtml = /*html*/ `      
<div >
  <button
    type="button"
    class="close-btn text-md absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-gray-400 hover:bg-gray-200 hover:text-gray-900"
  >
    <svg
      class="h-3 w-3"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
      />
    </svg>
    <span class="sr-only">Close</span>
  </button>
  <div
    class="mt-8 flex h-[calc(100vh-32px)] flex-col gap-5 bg-white p-6"
  >
    <div class="container flex justify-between">
      <div class="left-container flex flex-row items-center gap-2">
        <h2 class="title font-semibold"></h2>
        <!-- subtask -->
        <div class="relative">
          <button id="subtaskButton" class="subtask cursor-pointer">
            <svg
              width="25px"
              height="25px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" fill="none" width="24" height="24" />
              <g>
                <path d="M7 10l5 5 5-5" />
              </g>
            </svg>
          </button>
          <div
            id="subtaskDropdown"
            class="absolute top-12 left-0 z-50 hidden max-h-64 w-64 overflow-y-auto rounded-lg border bg-white p-3 shadow-xl"
          >
            <div class="mb-2 font-semibold">Select Subtasks</div>
            <div id="subtaskList"></div>
            <button
              id="saveSubtasksBtn"
              class="mt-3 hidden w-full rounded bg-blue-600 py-1 text-white"
            >
              Save Subtasks
            </button>
          </div>
        </div>
      </div>
      <div class="right-container flex items-center">
        <button
          id="edit-task-button"
          class="rounded border bg-blue-500 px-2 py-1 text-white"
        >
          Edit
        </button>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="profile-name">
        <img
          src="../assets/img/profile.png"
          alt="Avatar"
          class="profile-image h-8 w-8 rounded-full"
        />
      </div>
      <div class="flex flex-col leading-tight">
        <p class="text- md text-gray-500">Assignee</p>
        <p class="assignee font-medium text-gray-700"></p>
      </div>
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-md text-gray-500">Due Date</p>
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M8 7V3m8 4V3m-9 8h10m-11 8h12a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <span class="due-date text-gray-600"></span>
      </div>
    </div>
    <!-- subtasks -->
    <div class="mb-2 flex items-center justify-between px-1">
      <h2 class="text-xl font-semibold tracking-wide text-[#03045e]">
        Subtasks
      </h2>
    </div>
    <div
      id="subtasksContainer"
      class="scrollbar-thin flex flex-col gap-4 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-gray-50 px-4 py-4"
      style="
        min-height: min-content;
        max-height: 260px;
        background-color: #ffffff;
      "
    >
      <div id="subtasksList" class="flex flex-col gap-3"></div>
    </div>
    <!-- projects -->
    <div class="flex flex-col gap-3">
      <div class="text-md font-semibold text-gray-700">Projects</div>
      <div class="flex flex-col gap-3 rounded-lg p-2">
        <div class="flex items-center justify-between">
          <span class="text-md text-gray-500">Status</span>
          <select
            id="statusSelect"
            class="text-md w-auto cursor-pointer appearance-none rounded-full bg-gray-500/20 px-2 py-1 font-medium text-gray-500 focus:outline-none"
          >
            <option value="todo" class="text-center text-gray-500">
              To Do
            </option>
            <option value="in-progress" class="text-center text-gray-500">
              In Progress
            </option>
            <option value="done" class="text-center text-green-500">
              Done
            </option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-md text-gray-500">Priority</span>
          <select
            id="prioritySelect"
            class="text-md w-auto cursor-pointer appearance-none rounded-full bg-green-500/20 px-2 py-1 font-medium text-green-500 focus:outline-none"
          >
            <option value="high" class="text-center text-red-500">
              High
            </option>
            <option value="medium" class="text-center text-yellow-500">
              Medium
            </option>
            <option
              value="low"
              selected
              class="text-center text-green-500"
            >
              Low
            </option>
            <option
              value="critical"
              selected
              class="text-center text-green-100"
            >
              Critical
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="story-point flex flex-row justify-between">
      <div
        id="story-point-title"
        class="text-md font-semibold text-gray-700"
      >
        Story Point
      </div>
      <div class="story-point-value bg-gray-100">1</div>
    </div>
    <!-- Description Container -->
    <div class="flex flex-col gap-2">
      <div
        id="descriptionHeader"
        class="text-md font-semibold text-gray-700"
      >
        Description
      </div>
      <div
        class="description max-h-60 overflow-auto rounded-xl border-2 border-[#e5e7eb] p-3 text-gray-600"
      >
        <p></p>
      </div>
    </div>
    <!-- Attachment Container -->
    <div class="mb-2 flex items-center justify-between px-1">
      <h2 class="text-xl font-semibold tracking-wide text-[#03045e]">
        Attachments
      </h2>
    </div>
    <div
      id="attachmentsContainer"
      class="scrollbar-thin flex flex-col gap-4 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-gray-50 px-4 py-4"
      style="
        min-height: min-content;
        max-height: 260px;
        background-color: #ffffff;
      "
    >
      <div id="attachmentsList" class="flex flex-col gap-3"></div>
    </div>
    <!-- Comments Container -->
    <div
      id="commentContainerHeaderText"
      class="mb-2 ml-4 font-semibold text-[#03045e]"
    >
      Comments
    </div>
    <div
      id="commentsContainer"
      class="scrollbar-thin flex flex-col gap-3 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-gray-50 px-3 py-3"
      style="
        min-height: min-content;
        max-height: 260px;
        background-color: #ffffff;
      "
    >
      <div
        id="commentImage"
        class="flex items-start gap-3 rounded-lg border border-[#90e0ef] bg-white py-3 pl-3 shadow-lg"
      >
        <img
          src="../assets/img/profile.png"
          alt="Avatar"
          class="h-7 w-7 rounded-full border-2 border-[#00b4d8]"
        />
        <div id="CommentInformation" class="flex flex-col gap-1">
          <div
            class="text-md flex items-center gap-2 text-gray-500"
          >
            <span
              class="username font-medium text-gray-700"
            >
              John Smith
            </span>
            <span>•</span>
            <span class="text-sm text-[#0077b6]">17th Feb 2024</span>
          </div>
          <p class="message text-sm text-gray-700">
            Hi, I’ll do that task now, you can start working on another
            task!
          </p>
        </div>
      </div>
    </div>
    <!-- comment input  -->
    <div
      class="comment-create flex flex-row items-center justify-between gap-3"
    >
      <input
        type="text"
        id="commentInput"
        minlength="3"
        placeholder="Enter your Comment"
        class="flex-1 rounded-xl border border-[#90e0ef] bg-gray-50 p-3 placeholder-[#03045e] focus:outline-none"
      />
      <input type="file" id="commentAttachment" class="hidden" />
      <button
        type="button"
        id="attachButton"
        class="flex h-12 w-12 transform items-center justify-center rounded-xl bg-[#90e0ef] text-[#03045e] shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#48cae4] hover:shadow-lg"
        title="Attach a file"
      >
        +
      </button>
      <button
        type="button"
        id="submitButton"
        class="ml-3 transform rounded-xl bg-[#0077b6] px-6 py-3 text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#005f91] hover:shadow-lg"
      >
        Submit
      </button>
    </div>
  </div>
</div>`;

export async function showTaskDrawer(taskId) {
  const taskDrawerContainer = document.getElementById('task-side-drawer');

  taskDrawerContainer.innerHTML = taskDrawerInnerHtml;

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

    if (!message && attachmentInput.files.length) {
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
