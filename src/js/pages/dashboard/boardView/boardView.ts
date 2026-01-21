import projectService from '../../../services/ProjectService';
import sprintService from '../../../services/SprintService';
import taskService from '../../../services/TaskService';
import { setUpProjectName } from '../../../utils/elementUtils';
import {
  getColorByType,
  getSvgByPriority,
  getSvgByType,
} from '../../../utils/globalUtils';
import { showConfirmModal } from '../../../utils/modals/confirmationModal';
import { openUpdateTaskModal } from '../../../utils/modals/updateTaskModal';
import renderSelectedTab from '../../../utils/renderSelectedTab';
import showToast from '../../../utils/showToast';
import { handleForYouPage } from '../../forYouPage/forYouPage';
import { showTaskDrawer } from '../../taskDrawer/taskDrawer';
import { getFilteredTasks } from '../navbar/navbar';
import { config } from '../../../config/config';
import type { Task } from '../../../interfaces/common';
import type { User } from '../../../interfaces/auth';

export async function renderBoard(
  projectId: string,
  filter: string = '',
  searchInput: string = ''
) {
  // const currentProject = localStorage.getItem('selectedProject');
  if (!projectId) return;

  const project = (await projectService.getProjectById(projectId)).result;
  const columns = await getTaskGroupedByStatus(projectId, filter, searchInput);
  const lastColumn = project.columns[project.columns.length - 1];
  const currentSprint = project.currentSprint
    ? await sprintService.getSprintById(project.currentSprint)
    : null;

  let draggedColumn: HTMLElement | null = null;

  setUpProjectName(project);

  const columnContainer = document.getElementById('columns');
  if (!columnContainer) return;
  columnContainer.innerHTML = '';

  const filteredTasks: Task[] = [];
  const allTasks: Task[] = [];

  project.columns.forEach((col) => {
    allTasks.push(...(columns?.[col] || []));
  });

  const assigneeIds = [
    ...new Set(allTasks.map((t) => t.assignee).filter(Boolean)),
  ];

  let userMap: Record<string, User> = {};
  if (assigneeIds && assigneeIds.length > 0) {
    const usersResp = await taskService.getMultipleUsers(
      assigneeIds as string[]
    );
    usersResp.result.forEach((u) => {
      userMap[u._id] = u;
    });
  }

  project.columns.forEach((column) => {
    const columnEl = document.createElement('div');
    columnEl.className = 'column';
    columnEl.innerHTML = /* HTML */ `
      <div
        class="h-full w-72 shrink-0 overflow-y-auto rounded-lg bg-white pb-4 shadow-md"
      >
        <h2
          class="group sticky top-0 z-10 flex items-center gap-2 bg-white px-4 py-2 text-lg font-semibold text-black uppercase shadow-sm shadow-gray-200"
        >
          <span class="column-name">${column}</span>
          <div
            class="issue-count bg-primary-200 h-5 w-5 rounded-full text-center text-sm text-black"
          ></div>
          <div
            class="add-column-button ml-auto hidden cursor-pointer rounded-full px-2 text-lg/5! group-hover:block hover:bg-gray-100"
          >
            +
          </div>
        </h2>
        <div class="flex h-full flex-col gap-3 p-2 pb-4" id="task-list"></div>
      </div>
    `;

    const tasks = columns?.[column] || [];
    tasks.forEach((task) => {
      filteredTasks.push(task);
      let isDone = '';

      if (task.status === project.columns[project.columns.length - 1]) {
        isDone = 'line-through text-gray-400';
      }

      if (project.projectType !== 'kanban') {
        if (!currentSprint || !currentSprint.result.tasks.includes(task._id)) {
          return;
        }
      }

      const typeSvg = getSvgByType(task);
      const prioritySvg = getSvgByPriority(task);
      const statusColor = getColorByType(task);
      const assignee = task.assignee ? userMap[task.assignee] : null;
      const taskEl = document.createElement('div');

      let type;
      switch (task.type) {
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

      taskEl.dataset._id = task._id;
      taskEl.className = `task flex flex-col max-w-sm p-3  bg-white rounded-md shadow-sm text-black gap-4 relative cursor-grab border-2 border-gray-100 hover:shadow-md ${type}`;
      taskEl.innerHTML = /* HTML */ `
        <div class="card-header flex items-center justify-between">
          <p
            id="${task.title}-taskId"
            class="task-title ${isDone} flex-1 cursor-pointer rounded-sm border border-transparent px-1 text-lg font-medium"
          >
            ${task.title}
          </p>
          <div class="menu-button flex flex-row justify-between gap-2">
            <button class="edit-btn w-full cursor-pointer rounded-md p-1">
              <svg
                class="w-5 stroke-black hover:stroke-green-500"
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
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M16.04 3.02001L8.16 10.9C7.86 11.2 7.56 11.79 7.5 12.22L7.07 15.23C6.91 16.32 7.68 17.08 8.77 16.93L11.78 16.5C12.2 16.44 12.79 16.14 13.1 15.84L20.98 7.96001C22.34 6.60001 22.98 5.02001 20.98 3.02001C18.98 1.02001 17.4 1.66001 16.04 3.02001Z"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M14.91 4.1499C15.58 6.5399 17.45 8.4099 19.85 9.0899"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </g>
              </svg>
            </button>
            <button class="delete-btn w-full cursor-pointer rounded-md p-1">
              <svg
                class="w-5 hover:fill-red-500"
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
            </button>
          </div>
        </div>
        <div
          class="card-footer flex items-center justify-between text-sm text-gray-400"
        >
          <div class="flex items-center gap-2">
            <span class="">${typeSvg}</span>
            <span
              class="type-tag ${statusColor} rounded-sm p-1 text-xs font-semibold text-white"
              >${task.key}</span
            >
            <span class="">${prioritySvg}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex flex-row">
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="attachmentIcon hidden"
              >
                <g id="attachment">
                  <g id="attachment_2">
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
                class="subtaskIcon ml-2 hidden"
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
            <span
              class="user-avatar flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-50 font-semibold text-white"
            >
              <img
                src="${assignee?.profileImage
                  ? config.API_BASE_URL +
                    '/uploads/profile/' +
                    assignee.profileImage
                  : '../../../assets/img/profile.png'}"
                class="aspect-square h-8 w-8 rounded-full object-cover"
                title="${assignee?.name || 'Unassigned'}"
              />
            </span>
            <div
              class="avatar-dropdown absolute right-2.5 -bottom-8 hidden rounded-sm"
            >
              <ul
                class="assignee-list relative z-1 rounded-sm border border-gray-200 bg-white shadow-md"
              ></ul>
            </div>
          </div>
        </div>
      `;

      const attachmentsLogo =
        taskEl.querySelector<HTMLElement>('.attachmentIcon');
      const subtaskLogo = taskEl.querySelector<HTMLElement>('.subtaskIcon');
      const userAvatar = taskEl.querySelector<HTMLElement>('.user-avatar')!;
      const avatarDropdown =
        taskEl.querySelector<HTMLElement>('.avatar-dropdown')!;
      const list = taskEl.querySelector<HTMLUListElement>('.assignee-list')!;

      if (task.attachments && task.attachments.length && attachmentsLogo) {
        attachmentsLogo.classList.remove('hidden');
      }
      if (task.subTask && task.subTask.length && subtaskLogo) {
        subtaskLogo.classList.remove('hidden');
      }

      let activeProjectMembers: {
        _id: string;
        name: string;
        profileImage?: string;
      }[] = [];
      let selectedUserId: string | null = null;
      let selectedUser: (typeof activeProjectMembers)[0] | null = null;

      async function populateAvatarDropdown(dropdownList: HTMLUListElement) {
        try {
          const currentProject = localStorage.getItem('selectedProject');
          if (!currentProject) return; // stop if null

          const response =
            await projectService.getProjectMembers(currentProject);

          activeProjectMembers = response.result;

          dropdownList.innerHTML = '';

          activeProjectMembers.forEach((user) => {
            const li = document.createElement('li');
            li.className = 'min-w-24 hover:bg-gray-100 cursor-pointer p-2';
            li.textContent = user.name;
            li.dataset.id = user._id;
            dropdownList.appendChild(li);
          });
        } catch (err) {
          console.error('Error loading users:', err);
        }
      }

      userAvatar.addEventListener('click', async () => {
        avatarDropdown.classList.toggle('hidden');
        if (!avatarDropdown.classList.contains('hidden')) {
          await populateAvatarDropdown(list);
        }
      });

      list.addEventListener('click', async (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'LI') {
          selectedUserId = target.dataset.id ?? null;

          selectedUser =
            activeProjectMembers.find((u) => u._id === selectedUserId) ?? null;

          if (selectedUser) {
            const avatarImg =
              userAvatar.querySelector<HTMLImageElement>('img')!;
            avatarImg.src = selectedUser.profileImage
              ? `${config.API_BASE_URL}/uploads/profile/${selectedUser.profileImage}`
              : '../../../assets/img/profile.png';
          }

          const taskId = taskEl.dataset._id!;
          await taskService.updateTask(taskId, { assignee: selectedUserId });
          avatarDropdown.classList.add('hidden');
        }
      });

      document.addEventListener('click', (e) => {
        const target = e.target as Node;
        if (!userAvatar.contains(target) && !avatarDropdown.contains(target)) {
          avatarDropdown.classList.add('hidden');
        }
      });

      taskEl.setAttribute('draggable', 'true');
      taskEl.addEventListener('dragstart', (e: DragEvent) => {
        const target = e.target as HTMLElement;
        const currentCol = target.parentElement?.parentElement ?? null;
        draggedColumn = currentCol;
        e.dataTransfer?.setData('taskId', task._id!);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
        taskEl.classList.replace('cursor-grab', 'cursor-grabbing');
      });

      taskEl.addEventListener('dragend', () => {
        taskEl.classList.replace('cursor-grabbing', 'cursor-grab');
      });

      // const cardHeader = taskEl.querySelector('.card-header > p');

      taskEl.addEventListener('click', (e) => {
        if (e.target === taskEl) showTaskDrawer(task._id!);
      });
      const cardHeader = taskEl.querySelector('.card-header > p');
      if (cardHeader && task._id) {
        cardHeader.addEventListener('click', () => showTaskDrawer(task._id!));
      }

      const editBtn = taskEl.querySelector('.edit-btn');
      if (editBtn && task._id) {
        editBtn.addEventListener('click', () => openUpdateTaskModal(task._id!));
      }
      const deleteBtn = taskEl.querySelector('.delete-btn');
      if (deleteBtn && task._id) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();

          showConfirmModal(
            'Are you sure you want to delete this task?',
            async () => {
              await taskService.deleteTask(task._id!);
              const selectedProject = localStorage.getItem('selectedProject');
              if (selectedProject) {
                await renderSelectedTab(selectedProject);
              }
            }
          );
        });
      }

      const taskList = columnEl.querySelector('#task-list');
      taskList?.appendChild(taskEl);
    });

    const taskList = columnEl.querySelector('#task-list');

    taskList?.addEventListener('dragover', (e) => e.preventDefault());

    taskList?.addEventListener('drop', (e: Event) => {
      e.preventDefault();

      // Cast the event to DragEvent
      const dragEvent = e as DragEvent;

      const taskId = dragEvent.dataTransfer?.getData('taskId');
      if (!taskId) return;

      const taskEl = document.querySelector<HTMLElement>(
        `[data-_id="${taskId}"]`
      );
      if (!taskEl) return;

      const taskTitle = taskEl.querySelector<HTMLElement>('.task-title');
      if (taskTitle) {
        if (column === lastColumn) {
          taskTitle.classList.add('line-through', 'text-gray-400');
        } else {
          taskTitle.classList.remove('line-through', 'text-gray-400');
        }
      }

      taskList.appendChild(taskEl);

      taskService.updateTask(taskId, { status: column }).catch((err) => {
        console.error('Failed to update task status', err);
      });

      const issueCountEl = columnEl.querySelector<HTMLElement>('.issue-count');
      if (issueCountEl) {
        issueCountEl.innerText = `${Number(issueCountEl.innerText) + 1}`;
      }

      if (draggedColumn) {
        const draggedIssueCountEl =
          draggedColumn.querySelector<HTMLElement>('.issue-count');
        if (draggedIssueCountEl) {
          draggedIssueCountEl.innerText = `${Number(draggedIssueCountEl.innerText) - 1}`;
        }
      }

      handleForYouPage().catch(console.error);
    });

    const newColumnInput = document.createElement('div');
    newColumnInput.className = 'new-column flex gap-0.5 mt-1 hidden';
    newColumnInput.innerHTML = /* HTML */ `<input placeholder="Enter column name..." class="bg-white border px-2 border-gray-300 h-8 rounded-sm"></input> 
    `;

    const addColumnButton =
      columnEl.querySelector<HTMLElement>('.add-column-button');
    addColumnButton?.addEventListener('click', () => {
      newColumnInput.classList.toggle('hidden');
    });

    document.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();

      const target = e.target as HTMLElement;
      if (
        !target.classList.contains('add-column-button') &&
        !target.classList.contains('new-column') &&
        !target.parentElement?.classList.contains('new-column')
      ) {
        newColumnInput.classList.add('hidden');
      }
    });

    const newColumnInputField =
      newColumnInput.querySelector<HTMLInputElement>('input');
    newColumnInputField?.addEventListener(
      'keydown',
      async (e: KeyboardEvent) => {
        const input = e.target as HTMLInputElement;
        if (e.key !== 'Enter') return;

        const columnAlreadyExists = project.columns.includes(
          input.value.toLowerCase()
        );

        if (columnAlreadyExists) {
          showToast('Column with given name already exist', 'error');
          return;
        }

        const columnsEl = columnContainer.querySelectorAll(
          '.column, .new-column:not(.hidden)'
        );

        const newColumns = Array.from(columnsEl).map((column) => {
          if (column.classList.contains('column')) {
            const nameEl = column.querySelector<HTMLElement>('.column-name');
            return nameEl?.textContent ?? '';
          } else {
            const inputEl = column.querySelector<HTMLInputElement>('input');
            return inputEl?.value.toLowerCase() ?? '';
          }
        });

        const selectedProject = localStorage.getItem('selectedProject');
        if (!selectedProject) return;

        await projectService.updateProject(selectedProject, {
          columns: newColumns,
        });
        await renderSelectedTab(selectedProject);
      }
    );
    columnContainer.appendChild(columnEl);
    columnContainer.appendChild(newColumnInput);

    const issueCountEl = columnEl.querySelector<HTMLElement>('.issue-count');
    if (issueCountEl && taskList) {
      issueCountEl.innerText = `${taskList.childElementCount}`;
    }

    const addColumnBtn =
      columnEl.querySelector<HTMLElement>('.add-column-button');
    addColumnBtn?.addEventListener('click', () => {
      newColumnInput.classList.toggle('hidden');
    });
  });
}

async function getTaskGroupedByStatus(
  projectId: string,
  filter?: string,
  searchInput?: string
) {
  if (!projectId) return;

  const project = (await projectService.getProjectById(projectId)).result;
  const result: Record<string, Task[]> = {};

  project.columns.forEach((column) => (result[column] = []));

  const tasks: Task[] = await getFilteredTasks(projectId, filter, searchInput);

  tasks.forEach((task: Task) => {
    if (task.status in result) {
      result[task.status].push(task);
    } else {
      result[task.status] = [task];
    }
  });

  return result;
}
