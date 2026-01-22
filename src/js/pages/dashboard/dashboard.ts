import '../../../style/main.css';

import { renderBacklogView } from './backlogView/renderBacklogView';
import { renderTasksList } from './listView/listView';
import { setupSidebar } from './sidebar/sidebar';
import { setupNavbar } from './navbar/navbar';
import { openCreateTaskModal } from '../../utils/modals/createTaskModal';
import { openCreateProjectModal } from '../../utils/modals/createProjectModal';
import {
  handleStatusFilter,
  handleAssigneeFilter,
} from './filter/dashboardFilter';
import { checkToken } from '../../utils/checkToken';
import {
  removeActive,
  hideAll,
  ifSelectedProject,
} from '../../utils/elementUtils';
import { loadProjectMembers } from '../loadMembers/loadMembers';
import { setupPushNotifications } from '../../services/notificationService';
import { renderNotification, lazyLoad } from '../../utils/browserNotification';
import { handleForYouPage } from '../forYouPage/forYouPage';
import { renderBoard } from './boardView/boardView';
import { checkForInvite, keyboardEvents } from '../../utils/globalUtils';
import { setTheme } from '../../utils/setTheme';
import { handleDashboardSprintPreview } from './backlogView/sprint';

async function setupDashboard(): Promise<void> {
  checkToken();
  await checkForInvite();

  const openProjectBtn = document.getElementById('plus-icon');
  openProjectBtn?.addEventListener('click', openCreateProjectModal);

  const addTaskButton = document.getElementById('create-task');
  addTaskButton?.addEventListener('click', () => openCreateTaskModal());

  localStorage.setItem('selectedTab', 'board');

  const searchbar = document.getElementById('search-input-form');

  const backlogBtn = document.getElementById('backlog-li');
  const backlogView = document.getElementById('backlog-view');

  backlogBtn?.addEventListener('click', async () => {
    if (!backlogView || !searchbar) return;

    removeActive(backlogBtn);
    hideAll(backlogView);
    localStorage.setItem('selectedTab', 'backlog');
    searchbar.classList.add('hidden');

    const projectId = localStorage.getItem('selectedProject');
    if (projectId) {
      await renderBacklogView(projectId);
    }
  });

  const boardBtn = document.getElementById('board-li');
  const boardView = document.getElementById('board-view');

  boardBtn?.addEventListener('click', async () => {
    if (!boardView || !searchbar) return;

    removeActive(boardBtn);
    hideAll(boardView);
    localStorage.setItem('selectedTab', 'board');
    searchbar.classList.remove('hidden');

    const projectId = localStorage.getItem('selectedProject');
    if (projectId) {
      await renderBoard(projectId);
    }
  });

  const listBtn = document.getElementById('list-li');
  const listView = document.getElementById('list-view');

  listBtn?.addEventListener('click', async () => {
    if (!listView || !searchbar) return;

    removeActive(listBtn);
    hideAll(listView);
    localStorage.setItem('selectedTab', 'list');
    searchbar.classList.remove('hidden');

    const projectId = localStorage.getItem('selectedProject');
    if (projectId) {
      await renderTasksList(projectId);
    }
  });

  const openCreateProjectModalBtn =
    document.querySelector<HTMLAnchorElement>('#no-project-text a');

  openCreateProjectModalBtn?.addEventListener('click', openCreateProjectModal);

  setTheme(localStorage.getItem('theme') || 'indigo');

  ifSelectedProject();
  setupSidebar();
  setupNavbar();

  const selectedProject = localStorage.getItem('selectedProject');
  if (selectedProject) {
    await loadProjectMembers(selectedProject);
    await renderBoard(selectedProject);
  }

  handleStatusFilter();
  handleAssigneeFilter();
  setupPushNotifications();
  lazyLoad();
  renderNotification();
  handleForYouPage();
  keyboardEvents();
  handleDashboardSprintPreview();
}

setupDashboard();
