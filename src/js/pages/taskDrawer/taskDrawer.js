import taskService from '../../services/TaskService';
import commentService from '../../services/CommentService';
import showToast from '../../utils/showToast';
import { openUpdateTaskModal } from '../../utils/modals/updateTaskModal';
import { renderAttachments } from './renderAttachments';
import { appendCommentToContainer } from './appendComment';
import { renderSubtasks } from './renderSubtasks';
import { createSubtask } from './createSubtask';
import projectService from '../../services/ProjectService';
import renderSelectedTab from '../../utils/renderSelectedTab';
import { getSvgByType } from '../../utils/globalUtils';
import { marked } from 'marked';

const taskDrawerInnerHtml = /* HTML */ ` <div>
  <div class="flex flex-col gap-3 p-3">
    <div class="container-secondary flex flex-col gap-5">
      <div class="flex justify-between gap-3">
        <div class="title-container flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="type-icon"></span>
            <span
              class="task-key bg-primary-500 w-fit rounded-sm px-2 py-0.5 text-center text-xs font-semibold text-white"
            ></span>
          </div>
          <h2 class="title text-[16px]! font-semibold"></h2>
        </div>
        <div class="right-container flex items-start gap-3">
          <button id="edit-task-button">
            <svg
              class="h-5 w-5 stroke-black hover:stroke-green-500 hover:stroke-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M11 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V13"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
                <path
                  d="M16.04 3.02001L8.16 10.9C7.86 11.2 7.56 11.79 7.5 12.22L7.07 15.23C6.91 16.32 7.68 17.08 8.77 16.93L11.78 16.5C12.2 16.44 12.79 16.14 13.1 15.84L20.98 7.96001C22.34 6.60001 22.98 5.02001 20.98 3.02001C18.98 1.02001 17.4 1.66001 16.04 3.02001Z"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
                <path
                  d="M14.91 4.1499C15.58 6.5399 17.45 8.4099 19.85 9.0899"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </g>
            </svg>
          </button>
          <button type="button" class="close-btn">
            <svg
              class="mt-0.5 h-4 w-4 stroke-gray-600 hover:stroke-red-400 hover:stroke-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="inherit"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-3 relative">
        <div class="profile-name">
          <img
            src="../assets/img/profile.png"
            alt="Avatar"
            class="profile-image h-8 w-8 rounded-full border border-white shadow-sm"
          />
        </div>
        <div class="flex flex-col leading-tight">
          <p class="text-gray-500">Assignee</p>
          <p
            class="assignee text-primary-500  font-medium"
            id="assignee-name"
          ></p>
        </div>
        <select
          id="assignee-dropdown-taskDrawer"
          class="absolute opacity-0 top-4 left-4 w-52 rounded-sm bg-white border cursor-pointer border-gray-200 p-2 shadow-md"
        ></select>
      </div>
      <div class="flex flex-col gap-1">
        <p class="text-md text-gray-500">Due Date</p>
        <div class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="-ml-1 h-5 w-5 text-gray-400"
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
      <!-- Description Container -->
      <div class="flex flex-col gap-2">
        <h2 id="descriptionHeader" class="font-semibold">Description</h2>
        <div
          class="description prose max-h-28 w-full overflow-auto rounded-md border border-gray-100 p-1"
        ></div>
      </div>
    </div>
    <!-- subtasks -->
    <div class="container-secondary flex flex-col gap-2" id="subtaskContainer">
      <div class="flex items-center gap-2">
        <h2 class="font-semibold">Subtasks</h2>
        <div class="relative">
          <button
            id="subtaskButton"
            class="subtask cursor-pointer rounded-sm bg-gray-200 p-1 hover:bg-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-4 stroke-black"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div
        id="subtaskDropdown"
        class="hidden max-h-64 w-full overflow-y-auto rounded-md border border-gray-200 p-3 shadow-md"
      >
        <div id="subtaskList" class="ml-2 flex flex-col gap-2"></div>
        <button
          id="saveSubtasksBtn"
          class="bg-primary-500 hover:bg-primary-600 mt-3 hidden w-full rounded py-2 text-white"
        >
          Save Subtasks
        </button>
      </div>
      <div
        id="subtasksList"
        class="flex max-h-42 w-full flex-col items-center gap-2 overflow-x-auto"
      ></div>
    </div>
    <!-- Details -->
    <div class="container-secondary">
      <div class="flex flex-col gap-3">
        <h2 class="font-semibold">Details</h2>
        <div class="flex flex-col gap-3 rounded-lg p-2">
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-500">Status</span>
            <select
              id="statusSelect"
              class="bg-primary-400 min-w-20 rounded-sm px-2 py-2 text-white outline-none"
            ></select>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-500">Priority</span>
            <select
              id="prioritySelect"
              class="bg-primary-400 min-w-20 rounded-sm px-2 py-2 text-center text-white outline-none"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-medium text-gray-500">Type</span>
            <select
              id="typeSelect"
              class="bg-primary-400 min-w-20 rounded-sm px-2 py-2 text-center text-white outline-none"
            >
              <option value="task">Task</option>
              <option value="story">Story</option>
              <option value="bug">Bug</option>
            </select>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex-1 font-medium text-gray-500">Story Point</span>
            <input
              type="number"
              id="story-point-value"
              value="1"
              class="focus:border-primary-500 w-20 rounded-sm border border-gray-300 bg-white p-2 px-2 py-1 text-sm text-gray-800 shadow-xs transition-all duration-200 outline-none placeholder:text-sm placeholder:text-white/50"
            />
          </div>
          <div class="flex items-center justify-end gap-3">
            <span class="flex-1 font-medium text-gray-500" >Reporter</span>
            <div class='flex items-center gap-1 justify-end'>
          <img
            src="../assets/img/profile.png"
            alt="Avatar"
            class="reporter-profile-image h-6 w-6 rounded-full border border-white shadow-sm"
          />
            <p
              class="reporter text-primary-500 font-medium text-wrap text-end flex-1"
              id="reporter-name"
            ></p>
            </div>
          </div>
          <div class="flex justify-between">
          <span class="flex-1 font-medium text-gray-500 mr-4">Label</span>
            <div class="labels flex min-w-18 gap-1 text-xs flex-wrap justify-end"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Attachment Container -->
      <div class="container-secondary">
        <div class="mb-2 flex items-center justify-between px-1">
          <h2 class="font-semibold">Attachments</h2>
        </div>
        <div
          id="attachmentsList"
          class="flex flex-col items-center gap-2 overflow-y-auto"
        ></div>
      </div>
      <!-- Comments Container -->
      <div class="container-secondary flex flex-col gap-2">
        <h2 id="commentContainerHeaderText" class="font-semibold">Comments</h2>
        <div
          id="commentsContainer"
          class="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-sm border border-gray-200 bg-white pt-3 inset-shadow-xs"
        ></div>
        <!-- comment input  -->
        <div class="comment-create flex flex-col bg-white">
          <textarea
            type="text"
            id="commentInput"
            minlength="3"
            placeholder="Enter your Comment"
            class="min-h-20 flex-1 rounded-sm border border-gray-300 border-b-transparent p-2 focus:outline-none"
          ></textarea>
          <input type="file" id="commentAttachment" class="hidden" />
          <div class="flex">
            <div
              class="flex flex-1 items-center border-b border-l border-gray-300 px-2"
            >
              <button
                type="button"
                id="attachButton"
                class=""
                title="Attach a file"
              >
                <svg
                  viewBox="0 0 24 24"
                  id="Layer_4"
                  version="1.1"
                  xml:space="preserve"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  class="hover:fill-primary-600 size-6 fill-black"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      class="st0"
                      d="M14.77,20.99c0.138,0,0.251-0.02,0.367-0.041c0.161,0.024,0.322,0.041,0.484,0.041 c2.272,0,4.12-1.848,4.12-4.12c0-1.667-0.994-3.133-2.48-3.763V7.39c0-0.134-0.054-0.263-0.15-0.357l-0.455-0.446 c-0.016-0.022-0.033-0.043-0.052-0.061L13.237,3.16c-0.094-0.096-0.223-0.15-0.357-0.15H8.25c-0.276,0-0.5,0.224-0.5,0.5 s0.224,0.5,0.5,0.5h4.158c-0.02,0.071-0.033,0.145-0.033,0.221V6.38c0,0.833,0.677,1.51,1.51,1.51h2.149 c0.078,0,0.153-0.012,0.226-0.034v4.942c-0.019-0.003-0.036-0.002-0.055-0.005c-0.199-0.033-0.395-0.054-0.585-0.054 c-2.272,0-4.12,1.853-4.12,4.13c0,0.283,0.036,0.558,0.091,0.826c0.017,0.084,0.044,0.164,0.066,0.246 c0.049,0.183,0.108,0.361,0.181,0.534c0.037,0.086,0.075,0.17,0.117,0.254c0.084,0.167,0.18,0.324,0.286,0.477 c0.047,0.068,0.09,0.139,0.141,0.204c0.163,0.208,0.34,0.405,0.541,0.578c0,0,0,0,0.001,0.001H6.74c-0.816,0-1.48-0.673-1.48-1.5 V5.51c0-0.771,0.569-1.412,1.324-1.492c0.274-0.029,0.474-0.275,0.444-0.55C7,3.193,6.759,2.999,6.479,3.024 C5.214,3.158,4.26,4.226,4.26,5.51v12.98c0,1.378,1.113,2.5,2.48,2.5H14.77z M13.885,6.89c-0.281,0-0.51-0.229-0.51-0.51V4.717 l2.173,2.173H13.885z M15.62,13.74c0.237,0,0.502,0.039,0.779,0.115c0.062,0.016,0.124,0.03,0.207,0.061 c1.277,0.414,2.135,1.602,2.135,2.955c0,1.72-1.4,3.12-3.12,3.12c-0.129,0-0.259-0.007-0.479-0.04l-0.139-0.032 c-1.45-0.271-2.502-1.553-2.502-3.048C12.5,15.145,13.9,13.74,15.62,13.74z"
                    ></path>
                    <path
                      class="st0"
                      d="M14.494,17.37h0.626v0.626c0,0.276,0.224,0.5,0.5,0.5s0.5-0.224,0.5-0.5V17.37h0.626c0.276,0,0.5-0.224,0.5-0.5 s-0.224-0.5-0.5-0.5H16.12v-0.626c0-0.276-0.224-0.5-0.5-0.5s-0.5,0.224-0.5,0.5v0.626h-0.626c-0.276,0-0.5,0.224-0.5,0.5 S14.217,17.37,14.494,17.37z"
                    ></path>
                  </g>
                </svg>
              </button>
              <span id="commentAttachmentText"></span>
            </div>
            <div class="rounded-tl-md border-t border-l border-gray-300 p-1">
              <button
                type="button"
                id="submitButton"
                class="btn-primary mt-0! rounded-xs! px-4 py-1!"
              >
                <svg
                  class="size-4 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M19,6a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H7.41l1.3-1.29A1,1,0,0,0,7.29,9.29l-3,3a1,1,0,0,0-.21.33,1,1,0,0,0,0,.76,1,1,0,0,0,.21.33l3,3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L7.41,14H17a3,3,0,0,0,3-3V7A1,1,0,0,0,19,6Z"
                    ></path>
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

export async function showTaskDrawer(taskId) {
  const taskDrawerContainer = document.getElementById('task-side-drawer');

  taskDrawerContainer.innerHTML = taskDrawerInnerHtml;

  const task = (await taskService.getTaskById(taskId)).data.result;
  const reporter = (await taskService.getUserDetailsById(task.reporter)).data
    .result;
  const assignee = task.assignee
    ? (await taskService.getUserDetailsById(task.assignee)).data.result
    : null;
  const taskDrawer = document.querySelector('.task-drawer');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');
  const titleEl = taskDrawer.querySelector('.title');
  const taskTypeIcon = taskDrawer.querySelector('.type-icon');
  const taskKeyEl = taskDrawer.querySelector('.task-key');
  const descriptionEl = taskDrawer.querySelector('.description');
  const assigneeEl = taskDrawer.querySelector('#assignee-name');
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
  const attachmentText = taskDrawer.querySelector('#commentAttachmentText');
  const columns = (
    await projectService.getProjectById(localStorage.getItem('selectedProject'))
  ).result.columns;
  const storyPoint = taskDrawer.querySelector('#story-point-value');
  const typeSelect = taskDrawer.querySelector('#typeSelect');
  const assigneeDropdown = taskDrawer.querySelector(
    '#assignee-dropdown-taskDrawer'
  );
  const reporterName = taskDrawer.querySelector('#reporter-name');
  const reporterProfileImageEl = taskDrawer.querySelector(
    '.reporter-profile-image'
  );
  const labelsName = taskDrawer.querySelector('.labels');
  const labelsShow = task.tags.map((label) => {
    let labelShow = /* HTML */ ` <div
      class="label bg-primary-100 rounded-sm px-2 py-1"
    >
      ${label}
    </div>`;

    return labelShow;
  });

  labelsName.innerHTML = labelsShow.join('');
  reporterName.textContent = reporter.name;

  if (reporter.profileImage) {
    reporterProfileImageEl.src =
      'http://localhost:3001/uploads/profile/' + reporter.profileImage;
  } else {
    profileImageEl.src = '../../../assets/img/profile.png';
  }

  assigneeEl.textContent = assignee ? assignee.name : 'No assignee';

  assigneeDropdown.classList.remove('hidden');
  assigneeDropdown.innerHTML = '';

  const unassignedOption = document.createElement('option');

  unassignedOption.value = '';
  unassignedOption.textContent = 'Unassigned';

  if (!task.assignee) {
    unassignedOption.selected = true;
  }

  assigneeDropdown.appendChild(unassignedOption);

  const members = (
    await projectService.getProjectMembers(
      localStorage.getItem('selectedProject')
    )
  ).result;

  members.forEach((member) => {
    const option = document.createElement('option');
    option.value = member._id;
    option.textContent = member.name;

    if (member._id === task.assignee) {
      option.selected = true;
    }

    assigneeDropdown.appendChild(option);
  });

  assigneeDropdown.addEventListener('change', async (e) => {
    const assigneeId = e.target.value;

    try {
      await taskService.updateTask(taskId, {
        assignee: assigneeId || null,
      });

      if (!assigneeId) {
        assigneeEl.textContent = 'Unassigned';
      } else {
        const user = (await taskService.getUserDetailsById(assigneeId)).data
          .result;
        assigneeEl.textContent = user.name;
      }

      assigneeDropdown.classList.add('hidden');
      renderSelectedTab(localStorage.getItem('selectedProject'));
      showToast('Assignee updated', 'success');
      showTaskDrawer(taskId);
    } catch (err) {
      showToast('Failed to update assignee', 'error');
      console.error(err);
    }
  });

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
      if (event.shiftKey) {
        return;
      }

      event.preventDefault();
      commentSubmit.click();
    }
  });

  attachmentInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      attachmentText.textContent = e.target.files[0].name;
    }
  });

  commentSubmit.addEventListener('click', async () => {
    const message = commentInput.value.trim();
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
      attachmentText.textContent = '';

      updateCommentList();
    } catch (err) {
      showToast('Failed to submit comment');
      console.error(err);
    }
  });

  columns.forEach((column) => {
    const option = document.createElement('option');
    option.value = column;
    option.textContent = column.charAt(0).toUpperCase() + column.slice(1);
    status.appendChild(option);
  });

  status.addEventListener('change', async (e) => {
    try {
      await taskService.updateTask(taskId, { status: e.target.value });
      renderSelectedTab(localStorage.getItem('selectedProject'));

      showToast('Status updated successfully', 'success');
      e.preventDefault();
    } catch (err) {
      showToast('Failed to update status', 'error');
      console.error(err);
    }
  });

  priority.addEventListener('change', async (e) => {
    try {
      await taskService.updateTask(taskId, { priority: e.target.value });
      renderSelectedTab(localStorage.getItem('selectedProject'));
      showToast('Status updated successfully', 'success');

      e.preventDefault();
    } catch (err) {
      showToast('Failed to update priority', 'error');
      console.error(err);
    }
  });

  storyPoint.addEventListener('keydown', async (e) => {
    try {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log(+e.target.value);
        await taskService.updateTask(taskId, { storyPoint: +e.target.value });
        renderSelectedTab(localStorage.getItem('selectedProject'));
        showToast('Story point updated successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update story point', 'error');
      console.error(err);
    }
  });

  typeSelect.addEventListener('change', async (e) => {
    try {
      await taskService.updateTask(taskId, { type: e.target.value });
      renderSelectedTab(localStorage.getItem('selectedProject'));
      showToast('Type updated successfully', 'success');

      e.preventDefault();
    } catch (err) {
      showToast('Failed to update type', 'error');
      console.error(err);
    }
  });

  status.value = task.status;
  priority.value = task.priority;
  storyPoint.value = task.storyPoint;
  typeSelect.value = task.type;

  taskDrawer.dataset.id = task._id;
  titleEl.textContent = task.title;
  taskKeyEl.textContent = task.key;
  taskTypeIcon.innerHTML = getSvgByType(task);
  descriptionEl.innerHTML = task.description
    ? marked.parse(task.description)
    : 'No description added....';
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

  drawerBackdrop.addEventListener('click', () => {
    taskDrawer.classList.add('translate-x-full');
    taskDrawer.classList.remove('transform-none');
    drawerBackdrop.classList.add('hidden');
  });

  closeButton.addEventListener('click', () => {
    taskDrawer.classList.add('translate-x-full');
    taskDrawer.classList.remove('transform-none');
    drawerBackdrop.classList.add('hidden');
  });

  async function updateCommentList() {
    const comments = (await commentService.getAllComments(task._id)).result;
    const commentContainer = taskDrawer.querySelector('#commentsContainer');

    commentContainer.innerHTML = ``;

    if (!comments.length) {
      commentContainer.innerHTML = `
      <p class="text-gray-400 text-sm text-center mb-3">No Comments...</p>
    `;
    }
    comments.forEach((comment) =>
      appendCommentToContainer(comment, commentContainer)
    );
  }

  updateCommentList();
  createSubtask(taskDrawer, task);
  renderAttachments(task);
}
