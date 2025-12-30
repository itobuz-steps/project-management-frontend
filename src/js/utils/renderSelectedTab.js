import { renderBoard } from '../pages/dashboard/boardView/boardView';
import { renderBacklogView } from '../pages/dashboard/backlogView/renderBacklogView';
import { renderTasksList } from '../pages/dashboard/listView/listView';

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
    await renderBacklogView(projectId, filter, searchInput);
  }
}
