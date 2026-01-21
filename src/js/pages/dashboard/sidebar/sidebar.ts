import projectService from '../../../services/ProjectService';
import { loadProjectMembers } from '../../loadMembers/loadMembers';
import { checkToken } from '../../../utils/checkToken';
import axios from 'axios';
import showToast from '../../../utils/showToast';
import renderSelectedTab from '../../../utils/renderSelectedTab';
import { ifSelectedProject } from '../../../utils/elementUtils';
import { handleDashboardSprintPreview } from '../backlogView/sprint';
import { handleForYouPage, showForYouPage } from '../../forYouPage/forYouPage';
import { config } from '../../../config/config';

import type { Project } from '../../../interfaces/common';
import type { ProjectMember } from '../../../interfaces/common';

const sidebar = document.querySelector('#sidebar') as HTMLElement | null;
const toggleBtn = document.querySelector(
  '.toggle-sidebar-btn'
) as HTMLElement | null;

const projectsDropdown = document.getElementById(
  'projectsDropdown'
) as HTMLUListElement | null;

const usersMenu = document.getElementById('usersMenu') as HTMLElement | null;
const userListContainer = document.getElementById(
  'usersDropdown'
) as HTMLUListElement | null;

const projectsMenu = document.getElementById(
  'projectsMenu'
) as HTMLElement | null;

const projectDropdownContainer = document.getElementById(
  'projectsDropdown'
) as HTMLUListElement | null;

const toggleInviteButton = document.getElementById(
  'toggleInviteForm'
) as HTMLElement | null;

const inviteForm = document.getElementById(
  'inviteForm'
) as HTMLFormElement | null;

const emailInput = inviteForm?.querySelector(
  'input[type="email"]'
) as HTMLInputElement | null;

export function toggleSidebar(
  action: 'toggle' | 'open' | 'close' = 'toggle'
): void {
  if (!sidebar) return;

  if (action === 'toggle') sidebar.classList.toggle('collapsed');
  else if (action === 'open') sidebar.classList.remove('collapsed');
  else sidebar.classList.add('collapsed');
}

const logoutBtn = document.getElementById('logout-btn') as HTMLElement | null;

logoutBtn?.addEventListener('click', () => {
  const theme = localStorage.getItem('theme');

  localStorage.clear();
  if (theme) localStorage.setItem('theme', theme);

  checkToken();
});

export async function updateProjectList(): Promise<void> {
  if (!projectsDropdown) return;

  try {
    const projects: Project[] = await projectService.getAllProjects();
    projectsDropdown.innerHTML = '';

    if (!projects.length) {
      projectsDropdown.textContent = 'No project Found';
      projectsDropdown.className = 'block p-2 text-black';
      return;
    }

    projects.forEach((project) => {
      const item = document.createElement('li');
      item.dataset.id = project._id;
      item.textContent = project.name;

      item.className =
        'block p-2 text-black hover:bg-primary-100 hover:text-black [&.selected]:bg-primary-200 rounded-md [&.selected]:shadow/25 cursor-pointer';

      if (project._id === localStorage.getItem('selectedProject')) {
        item.classList.add('selected');
      }

      projectsDropdown.appendChild(item);
    });
  } catch (err) {
    console.error(err);
  }
}

export async function updateUserList(): Promise<void> {
  if (!userListContainer) return;

  const projectId = localStorage.getItem('selectedProject');
  if (!projectId) return;

  const usersResponse = await projectService.getProjectMembers(projectId);
  const users: ProjectMember[] = usersResponse.result;

  userListContainer.innerHTML = '';

  if (!users.length) {
    userListContainer.textContent = 'No user assigned';
    userListContainer.className = 'block p-2 text-gray-900 hover:bg-gray-100';
    return;
  }

  users.forEach((user) => {
    const item = document.createElement('li');
    item.dataset.id = user._id;
    item.id = user.name;

    const imageSrc = user.profileImage
      ? `${config.API_BASE_URL}/uploads/profile/${user.profileImage}`
      : '../../../assets/img/profile.png';

    item.innerHTML = `
      <div class="flex cursor-pointer items-center">
        <img
          class="mr-3 aspect-square h-6 w-6 rounded-full object-cover"
          src="${imageSrc}"
        />
        ${user.name}
      </div>
    `;

    item.className = 'block p-2 text-black rounded-md';
    userListContainer.appendChild(item);
  });
}

function addEventListenersSidebar(): void {
  if (
    !toggleBtn ||
    !sidebar ||
    !projectsMenu ||
    !projectsDropdown ||
    !usersMenu ||
    !userListContainer ||
    !projectDropdownContainer ||
    !toggleInviteButton ||
    !inviteForm ||
    !emailInput
  )
    return;

  toggleBtn.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    toggleSidebar('toggle');
  });

  document.addEventListener('click', (e: MouseEvent) => {
    if (
      sidebar.contains(e.target as Node) ||
      toggleBtn.contains(e.target as Node)
    )
      return;

    toggleSidebar('close');
  });

  projectsMenu.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    projectsDropdown.classList.toggle('hidden');
    toggleSidebar('open');
  });

  usersMenu.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    userListContainer.classList.toggle('hidden');
    toggleSidebar('open');
  });

  document.addEventListener('click', (e: MouseEvent) => {
    if (
      projectsMenu.contains(e.target as Node) ||
      projectsDropdown.contains(e.target as Node) ||
      usersMenu.contains(e.target as Node) ||
      userListContainer.contains(e.target as Node)
    )
      return;

    projectsDropdown.classList.add('hidden');
    userListContainer.classList.add('hidden');
  });

  projectDropdownContainer.addEventListener(
    'click',
    async (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const li = target.closest('li') as HTMLLIElement | null;
      if (!li?.dataset.id) return;

      localStorage.setItem('selectedProject', li.dataset.id);

      Array.from(projectDropdownContainer.children).forEach((child) =>
        child.classList.remove('selected')
      );

      li.classList.add('selected');

      ifSelectedProject();
      await handleDashboardSprintPreview();
      await updateUserList();
      await renderSelectedTab(li.dataset.id);
      await loadProjectMembers(li.dataset.id);

      toggleSidebar('close');
    }
  );

  toggleInviteButton.addEventListener('click', () => {
    inviteForm.classList.toggle('hidden');
    toggleSidebar('open');
  });

  inviteForm.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    if (!email) {
      showToast('Please enter a valid email');
      return;
    }

    try {
      const response = await axios.post(`${config.API_BASE_URL}/invite/email`, {
        email,
        projectId: localStorage.getItem('selectedProject'),
      });

      response.data.success
        ? showToast('Email sent successfully', 'success')
        : showToast('Failed to send invitation', 'error');
    } catch (error) {
      showToast('Could not send invitation', 'error');
      console.error(error);
    }

    inviteForm.classList.add('hidden');
    emailInput.value = '';
  });

  const forYouButton = document.getElementById(
    'forYouButton'
  ) as HTMLElement | null;

  forYouButton?.addEventListener('click', async () => {
    showForYouPage(true);
    toggleSidebar('close');
    await handleForYouPage();
  });
}

export function setupSidebar(): void {
  updateProjectList();
  updateUserList();
  addEventListenersSidebar();
}
