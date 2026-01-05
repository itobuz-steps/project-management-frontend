import '../../../style/main.css';
import { renderBacklogView } from './backlogView/renderBacklogView.js';
import { renderTasksList } from './listView/listView.js';
import { setupSidebar } from './sidebar/sidebar.js';
import { setupNavbar } from './navbar/navbar.js';
import { openCreateTaskModal } from '../../utils/modals/createTaskModal.js';
import { openCreateProjectModal } from '../../utils/modals/createProjectModal.js';
import {
  handleStatusFilter,
  handleAssigneeFilter,
} from './filter/dashboardFilter.js';
import { checkToken } from '../../utils/checkToken.js';
import {
  removeActive,
  hideAll,
  ifSelectedProject,
} from '../../utils/elementUtils.js';
import { loadProjectMembers } from '../loadMembers/loadMembers.js';
import setupPushNotifications from '../../utils/browserNotification.js';
import {
  renderNotification,
  lazyLoad,
} from '../../utils/browserNotification.js';
import { handleForYouPage } from '../forYouPage/forYouPage.js';
import { renderBoard } from './boardView/boardView.js';
import { checkForInvite, keyboardEvents } from '../../utils/globalUtils.js';
import { setTheme } from '../../utils/setTheme.js';
import { handleDashboardSprintPreview } from './backlogView/sprint.js';

async function setupDashboard() {
  checkToken();
  await checkForInvite();

  const openProjectBtn = document.getElementById('plus-icon');
  openProjectBtn.addEventListener('click', openCreateProjectModal);

  const addTaskButton = document.getElementById('create-task');
  addTaskButton.addEventListener('click', () => openCreateTaskModal());

  localStorage.setItem('selectedTab', 'board');

  const backlogBtn = document.getElementById('backlog-li');
  const backlogView = document.getElementById('backlog-view');

  backlogBtn.addEventListener('click', async () => {
    removeActive(backlogBtn);
    hideAll(backlogView);
    localStorage.setItem('selectedTab', 'backlog');

    await renderBacklogView(localStorage.getItem('selectedProject'));
  });

  const boardBtn = document.getElementById('board-li');
  const boardView = document.getElementById('board-view');

  boardBtn.addEventListener('click', async () => {
    removeActive(boardBtn);
    hideAll(boardView);
    localStorage.setItem('selectedTab', 'board');

    await renderBoard(localStorage.getItem('selectedProject'));
  });

  const listBtn = document.getElementById('list-li');
  const listView = document.getElementById('list-view');

  listBtn.addEventListener('click', async () => {
    removeActive(listBtn);
    hideAll(listView);
    localStorage.setItem('selectedTab', 'list');

    await renderTasksList(localStorage.getItem('selectedProject'));
  });

  const openCreateProjectModalBtn =
    document.querySelector('#no-project-text a');
  openCreateProjectModalBtn.addEventListener('click', openCreateProjectModal);

  setTheme(localStorage.getItem('theme') || 'indigo');
  ifSelectedProject();
  setupSidebar();
  setupNavbar();
  loadProjectMembers(localStorage.getItem('selectedProject'));
  handleStatusFilter();
  handleAssigneeFilter();
  renderBoard(localStorage.getItem('selectedProject'));
  setupPushNotifications();
  lazyLoad();
  renderNotification();
  handleForYouPage();
  keyboardEvents();
  handleDashboardSprintPreview();
}

setupDashboard();
