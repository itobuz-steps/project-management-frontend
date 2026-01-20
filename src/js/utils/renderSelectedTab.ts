import { renderBoard } from '../pages/dashboard/boardView/boardView';
import { renderBacklogView } from '../pages/dashboard/backlogView/renderBacklogView';
import { renderTasksList } from '../pages/dashboard/listView/listView';

export default async function renderSelectedTab(
  projectId: string,
  filter: string,
  searchInput: string,
) {
  const selectedTab = localStorage.getItem('selectedTab');

  if (selectedTab === 'board') {
    await renderBoard(projectId, filter, searchInput);
  } else if (selectedTab === 'list') {
    await renderTasksList(projectId, filter, searchInput);
  } else {
    if ((searchInput && filter) || searchInput || filter) return;
    await renderBacklogView(projectId, filter, searchInput);
  }
}
