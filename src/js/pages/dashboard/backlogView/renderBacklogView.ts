import projectService from '../../../services/ProjectService';
import sprintService from '../../../services/SprintService';
import taskService from '../../../services/TaskService';
import { addDropEvent } from '../../../utils/dragAndDropHandler';
import { dropdownEvent, setUpProjectName } from '../../../utils/elementUtils';
import {
  createSprintTable,
  handleAddTaskToSprint,
  handleCompleteSprint,
  handleSprintCreate,
  handleStartSprint,
  renderSprintTasks,
} from './sprint';
import {
  handleBacklogCheckboxAll,
  openCreateTaskModalFromBacklog,
} from './backlog';
import { toggleHidden } from '../../../utils/elementUtils';
import { showConfirmModal } from '../../../utils/modals/confirmationModal';
import { createBacklogTable, renderBacklogTasks } from './backlog';
import type { Sprint, Task } from '../../../interfaces/common';

const listTableBody = document.getElementById('table-body') as HTMLDivElement;
const sprintBacklogWrapper = document.getElementById(
  'sprint-backlog-wrapper'
) as HTMLDivElement;

export async function renderBacklogView(
  projectId: string,
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
  //const allTasks = tasks.data.result.map((task) => task._id);
  const allTaskObjects = tasks.data.result;
  const subtaskIds = new Set();

  allTaskObjects.forEach((t: Task) => {
    if (t.subTask && t.subTask.length) {
      t.subTask.forEach((id) => subtaskIds.add(id));
    }
  });

  const visibleTasks = allTaskObjects.filter(
    (t: Task) => !subtaskIds.has(t._id)
  );

  const allTasks = visibleTasks.map((task: Task) => task._id);

  setUpProjectName(project.result);

  const allSprintTasks: string[] = sprints.result.flatMap(
    (sprint: Sprint) => sprint.tasks
  );

  const backlogTasks = allTasks.filter(
    (task: string) => !allSprintTasks.includes(task)
  );
  const incompleteBacklogTasks = backlogTasks
    .map((id: string) => allTaskObjects.find((t: Task) => t._id === id))
    .filter(
      (task: Task) =>
        task &&
        !task.parentTask &&
        task.status !==
          project.result.columns[project.result.columns.length - 1]
    )
    .map((task: Task) => task._id);

  const currentSprints = sprints.result.filter(
    (sprint: Sprint) => !sprint.isCompleted
  );

  currentSprints.forEach(async (sprint: Sprint) => {
    const newSprint = createSprintTable(sprint);
    sprintBacklogWrapper.append(newSprint);
    const sprintTasks: string[] = [...sprint.tasks];

    dropdownEvent(sprint);

    const emptyMessage = document.getElementById(`${sprint.key}-empty-message`);
    const loader = document.getElementById(`${sprint.key}-loader`);

    if (!sprintTasks.length) {
      emptyMessage?.classList.remove('hidden');
      loader?.classList.add('hidden');
    } else {
      emptyMessage?.classList.add('hidden');
      await renderSprintTasks(
        sprint,
        sprintTasks,
        project.result.projectType === 'kanban' ? 'kanban' : ''
      );
    }

    newSprint.addEventListener('dragover', (e: DragEvent) =>
      e.preventDefault()
    );
    newSprint.addEventListener('drop', async (e: DragEvent) => {
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
      const startBtn = document.getElementById(
        `${sprint.key}-sprint-start-button`
      );
      const completeBtn = document.getElementById(
        `${sprint.key}-sprint-complete-button`
      );

      if (startBtn) {
        toggleHidden(startBtn);
      }
      if (completeBtn) {
        toggleHidden(completeBtn);
      }

      const completeSprintButton = document.getElementById(
        `${sprint.key}-sprint-complete-button`
      );
      const dueDatePreview = document.getElementById(
        `${sprint.key}-due-date-preview`
      );

      if (dueDatePreview) {
        dueDatePreview.innerText = new Date(
          sprint.dueDate
        ).toLocaleDateString();
      }

      const response = await projectService.updateProject(projectId, {
        currentSprint: sprint._id,
      });

      completeSprintButton?.addEventListener('click', async (e: MouseEvent) => {
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
    await addDropEvent(
      e,
      backlogTable,
      'project.result.projectType',
      true,
      null
    );
  });

  const addToSprintButton = document.getElementById('add-to-sprint-button');
  const backlogBody = document.getElementById('backlog-body');

  if (!(backlogBody instanceof HTMLDivElement)) {
    return;
  }

  if (!(addToSprintButton instanceof HTMLButtonElement)) {
    return;
  }

  await renderBacklogTasks(
    backlogBody,
    incompleteBacklogTasks,
    addToSprintButton,
    project.result
  );

  backlogBody.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement | null;

    if (!target || !target.classList.contains('checkboxes')) return;

    const isChecked = Array.from(
      backlogBody.querySelectorAll<HTMLInputElement>('.checkboxes')
    ).some((checkbox) => checkbox.checked);

    if (!isChecked) {
      toggleHidden(addToSprintButton);
    }
  });

  const createSprintButton = document.getElementById(
    'create-sprint-button'
  ) as HTMLButtonElement | null;
  const sprintForm = document.getElementById(
    'sprint-creation-form'
  ) as HTMLElement | null;
  const sprintCreateCloseSvg = document.getElementById(
    'sprint-close-svg'
  ) as HTMLElement | null;
  const sprintCreateSubmitButton = document.getElementById(
    'sprint-form-button'
  ) as HTMLButtonElement | null;
  const storyPointInput = document.getElementById(
    'sprint-sp-input'
  ) as HTMLInputElement | null;

  function callCreateSprint() {
    if (createSprintButton) {
      toggleHidden(createSprintButton);
    }

    if (sprintForm) {
      toggleHidden(sprintForm);
    }
  }

  createSprintButton?.addEventListener('click', callCreateSprint);
  sprintCreateCloseSvg?.addEventListener('click', callCreateSprint);

  sprintCreateSubmitButton?.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleSprintCreate(storyPointInput);
  });

  const backlogCheckboxAll = document.getElementById(
    'backlog-checkbox-all'
  ) as HTMLInputElement | null;

  backlogCheckboxAll?.addEventListener('change', (e) => {
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

  const sprintDropdown = document.getElementById(
    'sprints-dropdown'
  ) as HTMLElement | null;

  addToSprintButton?.addEventListener('click', () => {
    handleAddTaskToSprint(currentSprints, sprintDropdown);
  });

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as Node;

    if (
      sprintDropdown?.contains(target) ||
      addToSprintButton?.contains(target)
    ) {
      return;
    }

    if (sprintDropdown && !sprintDropdown.classList.contains('hidden')) {
      toggleHidden(sprintDropdown);
    }

    e.stopPropagation();
  });

  const checkboxes = document.querySelectorAll<HTMLInputElement>('.checkboxes');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      toggleHidden(addToSprintButton);
    }
  });

  openCreateTaskModalFromBacklog();
}
