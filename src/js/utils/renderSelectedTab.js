import { renderBoard } from '../pages/dashboard/dashboard';
import { renderTasksList, renderDashBoardTasks } from './renderTasks';

export default async function renderSelectedTab(
  projectId,
  filter = '',
  searchInput = ''
) {
  const selectedTab = localStorage.getItem('selectedTab');

  if (selectedTab === 'board') {
    await renderBoard(projectId, filter, searchInput);
  } else if (selectedTab === 'list') {
    await renderTasksList(projectId, filter, searchInput);
  } else {
    await renderDashBoardTasks(projectId, filter, searchInput);
  }
}
