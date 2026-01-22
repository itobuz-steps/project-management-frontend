import { getFilteredTasks } from '../navbar/navbar';
import projectService from '../../../services/ProjectService';
import { createTaskList } from '../../../utils/renderTasks';
import { setUpProjectName } from '../../../utils/elementUtils';
import type { Project } from '../../../interfaces/common';
import type { Task } from '../../../interfaces/common';

const emptyListContainer = document.getElementById(
  'empty-list-container'
) as HTMLElement | null;

const listTableBody = document.getElementById(
  'table-body'
) as HTMLElement | null;

export async function renderTasksList(
  projectId: string,
  filter: string = '',
  searchInput: string = ''
): Promise<void> {
  if (!listTableBody || !emptyListContainer) return;

  listTableBody.innerHTML = '';

  const projectResponse = await projectService.getProjectById(projectId);
  const project: Project = projectResponse.result;

  const tasksArray: Task[] = await getFilteredTasks(
    projectId,
    filter,
    searchInput
  );

  const loader = document.getElementById('list-loader') as HTMLElement | null;

  setUpProjectName(project);

  if (!tasksArray.length) {
    emptyListContainer.classList.remove('hidden');
    loader?.classList.add('hidden');
    return;
  }

  emptyListContainer.classList.add('hidden');

  const promiseArray: Promise<HTMLElement>[] = [];

  for (const task of tasksArray) {
    promiseArray.push(
      createTaskList(task, 'list', project.projectType, undefined)
    );
  }

  if (loader && loader.classList.contains('hidden')) {
    loader.classList.remove('hidden');
  }

  listTableBody.classList.add('hidden');

  const allTrs = await Promise.all(promiseArray);

  loader?.classList.add('hidden');
  listTableBody.classList.remove('hidden');

  allTrs.forEach((tr) => {
    listTableBody.appendChild(tr);
  });
}
