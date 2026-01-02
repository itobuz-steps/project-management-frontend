import { showConfirmModal } from '../../utils/modals/confirmationModal';
import showToast from '../../utils/showToast';
import commentService from '../../services/CommentService';
import { DateTime } from 'luxon';
import { marked } from 'marked';

export function appendCommentToContainer(comment, container) {
  const commentEl = document.createElement('div');

  commentEl.className =
    'flex gap-2 md:gap-3 items-start px-3 pb-4 border-b border-gray-200 ';

  commentEl.innerHTML = /* HTML */ `
    <div id="CommentInformation" class="flex flex-1 flex-col gap-1 md:gap-2">
      <div class="flex items-center gap-2">
        <img
          src="${comment.author.profileImage
            ? 'http://localhost:3001/uploads/profile/' +
              comment.author.profileImage
            : '../../../assets/img/profile.png'}"
          alt="Avatar"
          class="border-primary-300 h-7 w-7 rounded-full border"
        />
        <div class="flex flex-1 flex-col">
          <div class="username font-medium">${comment.author.name}</div>
          <div class="text-xs! text-gray-500">
            ${DateTime.fromISO(comment.createdAt).toRelative()}
          </div>
        </div>
        <div class="flex items-center md:gap-1">
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="mr-2 hidden cursor-pointer"
            id="attachmentLogo"
            title="Attachments"
          >
            <g id="attachment_2">
              <g id="attachment">
                <path
                  id="Combined Shape"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M26.4252 29.1104L39.5729 15.9627C42.3094 13.2262 42.3094 8.78901 39.5729 6.05248C36.8364 3.31601 32.4015 3.31601 29.663 6.05218L16.4487 19.2665L16.4251 19.2909L8.92989 26.7861C5.02337 30.6926 5.02337 37.0238 8.92989 40.9303C12.8344 44.8348 19.1656 44.8348 23.0701 40.9303L41.7835 22.2169C42.174 21.8264 42.174 21.1933 41.7835 20.8027C41.3929 20.4122 40.7598 20.4122 40.3693 20.8027L21.6559 39.5161C18.5324 42.6396 13.4676 42.6396 10.3441 39.5161C7.21863 36.3906 7.21863 31.3258 10.3441 28.2003L30.1421 8.4023L30.1657 8.37788L31.0769 7.4667C33.0341 5.51117 36.2032 5.51117 38.1587 7.4667C40.1142 9.42217 40.1142 12.593 38.1587 14.5485L28.282 24.4252C28.2748 24.4319 28.2678 24.4388 28.2608 24.4458L25.0064 27.7008L24.9447 27.7625C24.9437 27.7635 24.9427 27.7644 24.9418 27.7654L17.3988 35.3097C16.6139 36.0934 15.3401 36.0934 14.5545 35.3091C13.7714 34.5247 13.7714 33.2509 14.5557 32.4653L24.479 22.544C24.8696 22.1535 24.8697 21.5203 24.4792 21.1298C24.0887 20.7392 23.4555 20.7391 23.065 21.1296L13.141 31.0516C11.5766 32.6187 11.5766 35.1569 13.1403 36.7233C14.7079 38.2882 17.2461 38.2882 18.8125 36.7245L26.3589 29.1767L26.4252 29.1104Z"
                  fill="#000000"
                ></path>
              </g>
            </g>
          </svg>

          <svg
            class="edit-btn h-4 stroke-black hover:stroke-green-500 hover:stroke-2"
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
          <svg
            class="delete-btn w-5 hover:fill-red-500"
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
                d="M12 2.75C11.0215 2.75 10.1871 3.37503 9.87787 4.24993C9.73983 4.64047 9.31134 4.84517 8.9208 4.70713C8.53026 4.56909 8.32557 4.1406 8.46361 3.75007C8.97804 2.29459 10.3661 1.25 12 1.25C13.634 1.25 15.022 2.29459 15.5365 3.75007C15.6745 4.1406 15.4698 4.56909 15.0793 4.70713C14.6887 4.84517 14.2602 4.64047 14.1222 4.24993C13.813 3.37503 12.9785 2.75 12 2.75Z"
              ></path>
              <path
                d="M2.75 6C2.75 5.58579 3.08579 5.25 3.5 5.25H20.5001C20.9143 5.25 21.2501 5.58579 21.2501 6C21.2501 6.41421 20.9143 6.75 20.5001 6.75H3.5C3.08579 6.75 2.75 6.41421 2.75 6Z"
              ></path>
              <path
                d="M5.91508 8.45011C5.88753 8.03681 5.53015 7.72411 5.11686 7.75166C4.70356 7.77921 4.39085 8.13659 4.41841 8.54989L4.88186 15.5016C4.96735 16.7844 5.03641 17.8205 5.19838 18.6336C5.36678 19.4789 5.6532 20.185 6.2448 20.7384C6.83639 21.2919 7.55994 21.5307 8.41459 21.6425C9.23663 21.75 10.2751 21.75 11.5607 21.75H12.4395C13.7251 21.75 14.7635 21.75 15.5856 21.6425C16.4402 21.5307 17.1638 21.2919 17.7554 20.7384C18.347 20.185 18.6334 19.4789 18.8018 18.6336C18.9637 17.8205 19.0328 16.7844 19.1183 15.5016L19.5818 8.54989C19.6093 8.13659 19.2966 7.77921 18.8833 7.75166C18.47 7.72411 18.1126 8.03681 18.0851 8.45011L17.6251 15.3492C17.5353 16.6971 17.4712 17.6349 17.3307 18.3405C17.1943 19.025 17.004 19.3873 16.7306 19.6431C16.4572 19.8988 16.083 20.0647 15.391 20.1552C14.6776 20.2485 13.7376 20.25 12.3868 20.25H11.6134C10.2626 20.25 9.32255 20.2485 8.60915 20.1552C7.91715 20.0647 7.54299 19.8988 7.26957 19.6431C6.99616 19.3873 6.80583 19.025 6.66948 18.3405C6.52891 17.6349 6.46488 16.6971 6.37503 15.3492L5.91508 8.45011Z"
              ></path>
              <path
                d="M9.42546 10.2537C9.83762 10.2125 10.2051 10.5132 10.2464 10.9254L10.7464 15.9254C10.7876 16.3375 10.4869 16.7051 10.0747 16.7463C9.66256 16.7875 9.29502 16.4868 9.25381 16.0746L8.75381 11.0746C8.71259 10.6625 9.0133 10.2949 9.42546 10.2537Z"
              ></path>
              <path
                d="M15.2464 11.0746C15.2876 10.6625 14.9869 10.2949 14.5747 10.2537C14.1626 10.2125 13.795 10.5132 13.7538 10.9254L13.2538 15.9254C13.2126 16.3375 13.5133 16.7051 13.9255 16.7463C14.3376 16.7875 14.7051 16.4868 14.7464 16.0746L15.2464 11.0746Z"
              ></path>
            </g>
          </svg>
        </div>
      </div>

      <div class="message prose text-sm text-gray-700">
        ${marked.parse(comment.message)}
      </div>

      <div class="edit-controls hidden">
        <textarea
          class="edit-input min-h-20 w-full rounded-md border border-gray-200 p-2 outline-none"
          rows="1"
        >
${comment.message}</textarea
        >
        <button class="save-btn btn-primary mt-0! w-full py-1!">Save</button>
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
