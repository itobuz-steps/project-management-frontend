import taskService from '../../services/TaskService';
import { showTaskDrawer } from './taskDrawer';

export async function renderSubtasks(task) {
  const list = document.getElementById('subtasksList');

  list.innerHTML = '';

  if (!task.subTask.length) {
    list.innerHTML = "<p class='text-gray-400 font-semibold'>No subtasks</p>";
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

    let type;

    switch (st.type) {
      case 'task':
        type = 'border-l-[#165dfc]';
        break;
      case 'story':
        type = 'border-l-[#00a63d]';
        break;
      case 'bug':
        type = 'border-l-[#e7000b]';
        break;
    }

    div.className = `flex items-center bg-white rounded-md shadow-sm p-3 subtaskEl cursor-pointer w-full border border-gray-200 ${type}`;

    div.innerHTML = /* HTML */ `
      <img
        src="${subtaskAssignee
          ? subtaskAssignee.profileImage
            ? 'http://localhost:3001/uploads/profile/' +
              subtaskAssignee.profileImage
            : '../../../assets/img/profile.png'
          : '../../../assets/img/profile.png'}"
        class="border-primary-300 h-8 w-8 rounded-full"
        title="${subtaskAssignee ? subtaskAssignee.name : 'unassigned'}"
      />
      <div class="flex flex-1">
        <div class="ml-3 flex gap-2">
          <span
            class="bg-primary-400 h-fit w-fit rounded-sm px-2 py-0.5 text-center text-xs font-medium text-nowrap text-white"
            >${st.key}</span
          >
          <span class="font-medium">${st.title}</span>
        </div>
        <div class="ml-auto flex gap-0.5">
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="attachmentIcon ml-2 hidden"
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
                />
              </g>
            </g>
          </svg>
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="subtaskIcon ml-1 hidden"
          >
            <rect
              x="16"
              y="9"
              width="4"
              height="4"
              rx="2"
              transform="rotate(90 16 9)"
              stroke="#33363F"
              stroke-width="1"
            />
            <rect
              x="20"
              y="17"
              width="4"
              height="4"
              rx="2"
              transform="rotate(90 20 17)"
              stroke="#33363F"
              stroke-width="1"
            />
            <path
              d="M5 4V15C5 16.8856 5 17.8284 5.58579 18.4142C6.17157 19 7.11438 19 9 19H16"
              stroke="#33363F"
              stroke-width="1"
            />
            <path
              d="M5 7V7C5 8.88562 5 9.82843 5.58579 10.4142C6.17157 11 7.11438 11 9 11H12"
              stroke="#33363F"
              stroke-width="1"
            />
          </svg>
        </div>
      </div>
    `;
    const attachmentsLogo = div.querySelector('.attachmentIcon');
    const subtaskLogo = div.querySelector('.subtaskIcon');

    if (st.attachments.length) {
      attachmentsLogo.classList.remove('hidden');
    }
    if (st.subTask.length) {
      subtaskLogo.classList.remove('hidden');
    }

    div.addEventListener('click', () => showTaskDrawer(sub));

    list.appendChild(div);
  });
}
