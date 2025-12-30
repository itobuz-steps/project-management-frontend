import projectService from '../../../services/ProjectService';
import sprintService from '../../../services/SprintService';
import taskService from '../../../services/TaskService';
import { addDropEvent } from '../../../utils/dragAndDropHandler';
import { dropdownEvent } from '../../../utils/elementUtils';
import {
  createSprintTable,
  handleAddTaskToSprint,
  handleCompleteSprint,
  handleSprintCreate,
  handleStartSprint,
  renderSprintTasks,
} from './sprint';
import { handleBacklogCheckboxAll } from './backlog';
import { toggleHidden } from '../../../utils/elementUtils';
import { showConfirmModal } from '../../../utils/modals/confirmationModal';
import { createBacklogTable, renderBacklogTasks } from './backlog';

const listTableBody = document.getElementById('table-body');
const sprintBacklogWrapper = document.getElementById('sprint-backlog-wrapper');

export async function renderBacklogView(
  projectId,
  filter = '',
  searchInput = ''
) {
  listTableBody.innerHTML = '';
  sprintBacklogWrapper.innerHTML = '';

  const tasks = await taskService.getTaskByProjectId(
    projectId,
    filter,
    searchInput
  );
  const project = await projectService.getProjectById(projectId);
  const sprints = await sprintService.getAllSprints(projectId);
  const allTasks = tasks.data.result.map((task) => task._id);

  const allSprintTasks = [];
  sprints.result.forEach((sprint) => allSprintTasks.push(...sprint.tasks));

  const backlogTasks = allTasks.filter(
    (task) => !allSprintTasks.includes(task)
  );
  const incompleteBacklogTasks = backlogTasks.filter(
    (task) =>
      task.status !== project.result.columns[project.result.columns.length - 1]
  );

  const currentSprints = sprints.result.filter((sprint) => !sprint.isCompleted);

  currentSprints.forEach(async (sprint) => {
    const newSprint = createSprintTable(sprint);
    sprintBacklogWrapper.append(newSprint);
    const sprintTasks = [];
    sprint.tasks.forEach((task) => sprintTasks.push(task));
    dropdownEvent(sprint);

    if (!sprintTasks.length) {
      document
        .getElementById(`${sprint.key}-empty-message`)
        .classList.remove('hidden');
      document.getElementById(`${sprint.key}-loader`).classList.add('hidden');
    } else {
      document
        .getElementById(`${sprint.key}-empty-message`)
        .classList.add('hidden');
      if (project.result.projectType === 'kanban') {
        await renderSprintTasks(sprint, sprintTasks, 'kanban');
      } else {
        await renderSprintTasks(sprint, sprintTasks, '');
      }
    }

    newSprint.addEventListener('dragover', (e) => e.preventDefault());
    newSprint.addEventListener('drop', async (e) => {
      await addDropEvent(
        e,
        newSprint,
        project.result.projectType,
        false,
        sprint
      );
    });

    await handleStartSprint(sprint);
    if (sprint.dueDate) {
      toggleHidden(
        document.getElementById(`${sprint.key}-sprint-start-button`)
      );
      toggleHidden(
        document.getElementById(`${sprint.key}-sprint-complete-button`)
      );

      const completeSprintButton = document.getElementById(
        `${sprint.key}-sprint-complete-button`
      );
      const dueDatePreview = document.getElementById(
        `${sprint.key}-due-date-preview`
      );

      dueDatePreview.innerText = new Date(sprint.dueDate).toLocaleDateString();

      const response = await projectService.updateProject(projectId, {
        currentSprint: sprint._id,
      });

      completeSprintButton.addEventListener('click', async (e) => {
        e.preventDefault();

        showConfirmModal(
          'Are you sure you want to complete this sprint?',
          async () => {
            await handleCompleteSprint(sprint._id, response.result);
          }
        );
      });
    }
  });

  let backlogTable;
  if (project.result.projectType === 'kanban') {
    backlogTable = createBacklogTable('kanban');
    sprintBacklogWrapper.append(backlogTable);
  } else {
    backlogTable = createBacklogTable('');
    sprintBacklogWrapper.append(backlogTable);
  }
  dropdownEvent();

  backlogTable.addEventListener('dragover', (e) => e.preventDefault());
  backlogTable.addEventListener('drop', async (e) => {
    await addDropEvent(e, backlogTable, 'project.result.projectType', true, '');
  });

  const addToSprintButton = document.getElementById('add-to-sprint-button');
  const backlogBody = document.getElementById('backlog-body');

  await renderBacklogTasks(
    backlogBody,
    incompleteBacklogTasks,
    addToSprintButton,
    project.result
  );
  // }

  backlogBody.addEventListener('change', () => {
    let isChecked = false;
    backlogBody.querySelectorAll('.checkboxes').forEach((checkbox) => {
      if (checkbox.checked) {
        isChecked = true;
      }
    });
    if (!isChecked) {
      toggleHidden(addToSprintButton);
    }
  });

  const createSprintButton = document.getElementById('create-sprint-button');
  const sprintForm = document.getElementById('sprint-creation-form');
  const sprintCreateCloseSvg = document.getElementById('sprint-close-svg');
  const sprintCreateSubmitButton =
    document.getElementById('sprint-form-button');
  const storyPointInput = document.getElementById('sprint-sp-input');

  function callCreateSprint() {
    toggleHidden(createSprintButton);
    toggleHidden(sprintForm);
  }

  createSprintButton.addEventListener('click', callCreateSprint);
  sprintCreateCloseSvg.addEventListener('click', callCreateSprint);

  sprintCreateSubmitButton.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleSprintCreate(storyPointInput);
  });

  const backlogCheckboxAll = document.getElementById('backlog-checkbox-all');
  backlogCheckboxAll.addEventListener('change', (e) => {
    if (backlogCheckboxAll.checked) {
      handleBacklogCheckboxAll(true);
      if (addToSprintButton.classList.contains('hidden')) {
        toggleHidden(addToSprintButton);
      }
    } else {
      handleBacklogCheckboxAll(false);
      if (!addToSprintButton.classList.contains('hidden')) {
        toggleHidden(addToSprintButton);
      }
    }
    e.stopPropagation();
  });

  const sprintDropdown = document.getElementById('sprints-dropdown');
  addToSprintButton.addEventListener('click', () => {
    handleAddTaskToSprint(currentSprints, sprintDropdown);
  });

  document.addEventListener('click', (e) => {
    if (
      sprintDropdown.contains(e.target) ||
      addToSprintButton.contains(e.target)
    )
      return;

    if (!sprintDropdown.classList.contains('hidden')) {
      toggleHidden(sprintDropdown);
    }
    e.stopPropagation();
  });

  const checkboxes = document.querySelectorAll('.checkboxes');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      toggleHidden(addToSprintButton);
    }
  });
}
