import { showConfirmModal } from '../../utils/modals/confirmationModal';
import showToast from '../../utils/showToast';
import commentService from '../../services/CommentService';
export function appendCommentToContainer(comment, container) {
  const commentEl = document.createElement('div');
  commentEl.className =
    'flex gap-2 md:gap-3 items-start bg-white rounded-lg shadow-md px-2 py-3 md:px-3 ' +
    'border border-[#90e0ef] shadow-lg rounded-lg';

  commentEl.innerHTML = /*html*/ `
  <img
    src="${
      comment.author.profileImage
        ? 'http://localhost:3001/uploads/profile/' + comment.author.profileImage
        : '../../../assets/img/profile.png'
    }"
    alt="Avatar"
    class="w-7 h-7 rounded-full border-2 border-[#00b4d8]"
  />

  <div id="CommentInformation" class="flex flex-col gap-1 md:gap-2 flex-1">
    <div class="flex justify-between items-center text-md text-[#03045e]">
      <div>
        <span class="username font-medium text-gray-700 ">
          ${comment.author.name}
        </span>
        <span>•</span>
        <span class="text-sm text-[#0077b6]">
          ${comment.createdAt.split('T')[0]}
        </span>
      </div>
      <div class="flex md:gap-2">
        <svg 
          class="delete-btn cursor-pointer hover:fill-red-500 transition duration-300"
          width="25px" height="25px"
          viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M6 7V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V7M6 7H5M6 7H8M18 7H19M18 7H16M10 11V16M14 11V16M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M8 7H16" 
            stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg class="edit-btn cursor-pointer hover:fill-blue-300 transition duration-300" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 494.936 494.936">
          <g>
            <path d="M389.844,182.85c-6.743,0-12.21,5.467-12.21,12.21v222.968c0,23.562-19.174,42.735-42.736,42.735H67.157c-23.562,0-42.736-19.174-42.736-42.735V150.285c0-23.562,19.174-42.735,42.736-42.735h267.741c6.743,0,12.21-5.467,12.21-12.21s-5.467-12.21-12.21-12.21H67.157C30.126,83.13,0,113.255,0,150.285v267.743c0,37.029,30.126,67.155,67.157,67.155h267.741c37.03,0,67.156-30.126,67.156-67.155V195.061C402.054,188.318,396.587,182.85,389.844,182.85z"/>
            <path d="M483.876,20.791c-14.72-14.72-38.669-14.714-53.377,0L221.352,229.944c-0.28,0.28-3.434,3.559-4.251,5.396l-28.963,65.069c-2.057,4.619-1.056,10.027,2.521,13.6c2.337,2.336,5.461,3.576,8.639,3.576c1.675,0,3.362-0.346,4.96-1.057l65.07-28.963c1.83-0.815,5.114-3.97,5.396-4.25L483.876,74.169c7.131-7.131,11.06-16.61,11.06-26.692C494.936,37.396,491.007,27.915,483.876,20.791z"/>
          </g>
        </svg>
      </div>
    </div>

    <p class="message text-gray-700 text-sm">
      ${comment.message}
    </p>
    
    <a id="attachmentLogo" class="hidden cursor-pointer">📎</a>

    <div class="edit-controls hidden">
      <textarea class="edit-input w-full border border-[#90e0ef] rounded-md p-2" rows="1">${
        comment.message
      }</textarea>
      <button class="save-btn bg-[#00b4d8] text-white rounded-md p-2 mt-2">Save</button>
    </div>
  </div>
  `;

  const deleteBtn = commentEl.querySelector('.delete-btn');
  const editBtn = commentEl.querySelector('.edit-btn');
  const editControls = commentEl.querySelector('.edit-controls');
  const messageEl = commentEl.querySelector('.message');
  const editInput = commentEl.querySelector('.edit-input');
  const saveBtn = commentEl.querySelector('.save-btn');
  const attachmentLogo = commentEl.querySelector('#attachmentLogo');

  if (comment.attachment) {
    attachmentLogo.classList.remove('hidden');
  }

  attachmentLogo.addEventListener('click', () => {
    const fileUrl = `http://localhost:3001/uploads/commentsAttachment/${comment.attachment}`;
    window.open(fileUrl, '_blank');
  });

  editBtn.addEventListener('click', (e) => {
    e.preventDefault();

    messageEl.classList.add('hidden');
    editControls.classList.remove('hidden');
  });

  saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    editComment(editInput, comment._id, comment, messageEl, editControls);
  });

  deleteBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    showConfirmModal('Are you sure you want to delete this comment?', () => {
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

async function editComment(input, commentId, comment, messageEl, editControls) {
  const updatedComment = input.value;
  const payload = { message: updatedComment };

  if (!updatedComment.trim()) {
    showToast('Comment cannot be empty');
    return;
  }

  try {
    await commentService.updateComment(commentId, payload);
    comment.message = updatedComment;
    messageEl.textContent = updatedComment;

    editControls.classList.add('hidden');
    messageEl.classList.remove('hidden');
  } catch (err) {
    showToast(`${err}`);
    console.error('Edit error: ', err);
  }
}
