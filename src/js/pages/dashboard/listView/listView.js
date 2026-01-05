import { getFilteredTasks } from '../navbar/navbar.js';
import projectService from '../../../services/ProjectService.js';
import { createTaskList } from '../../../utils/renderTasks.js';
import { setUpProjectName } from '../../../utils/elementUtils.js';

const emptyListContainer = document.getElementById('empty-list-container');
const listTableBody = document.getElementById('table-body');

export async function renderTasksList(
  projectId,
  filter = '',
  searchInput = ''
) {
  listTableBody.innerHTML = '';

  const project = (await projectService.getProjectById(projectId)).result;
  const tasksArray = await getFilteredTasks(projectId, filter, searchInput);
  const loader = document.getElementById(`list-loader`);
  setUpProjectName(project);

  if (!tasksArray.length) {
    emptyListContainer.classList.remove('hidden');
    loader.classList.add('hidden');
  } else {
    emptyListContainer.classList.add('hidden');
    let promiseArray = [];
    for (const task of tasksArray) {
      promiseArray.push(
        createTaskList(task, 'list', project.projectType, null)
      );
    }

    if (loader.classList.contains('hidden')) {
      loader.classList.remove('hidden');
    }

    listTableBody.classList.add('hidden');

    const allTrs = await Promise.all(promiseArray);

    loader.classList.add('hidden');
    listTableBody.classList.remove('hidden');

    allTrs.forEach((tr) => {
      listTableBody.append(tr);
    });
  }
}
