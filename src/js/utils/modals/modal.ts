import type { Project, ProjectMember, Task } from '../../interfaces/common';
import projectService from '../../services/ProjectService';
import taskService from '../../services/TaskService';

export async function handleModalAssignee(
  modalAssigneeDropdown: HTMLSelectElement,
  selectedAssignee = null
) {
  const projectId = localStorage.getItem('selectedProject');

  if (!projectId) {
    return;
  }

  const assignees = (await projectService.getProjectMembers(projectId)) as {
    result: ProjectMember[];
  };

  modalAssigneeDropdown.innerHTML = '';

  const unassigned = document.createElement('option');
  unassigned.innerText = 'Unassigned';

  if (!selectedAssignee) {
    unassigned.selected = true;
  }

  unassigned.value = 'null';
  modalAssigneeDropdown.appendChild(unassigned);

  assignees.result.forEach((assignee) => {
    const option = document.createElement('option');

    option.value = assignee._id;

    if (assignee.email === localStorage.getItem('userEmail')) {
      option.innerText = `${assignee.email} (assign to me)`;
    } else {
      option.innerText = `${assignee.email}`;
    }

    if (assignee._id === selectedAssignee) {
      option.selected = true;
    }

    modalAssigneeDropdown.appendChild(option);
  });
}

export async function handleModalStatus(
  modalStatusDropdown: HTMLSelectElement,
  selectedStatus = null
) {
  const projectId = localStorage.getItem('selectedProject');

  if (!projectId) {
    return;
  }
  const projectData = (await projectService.getProjectById(projectId)) as {
    result: Project;
  };
  const project = projectData.result;
  console.log(project)
  modalStatusDropdown.innerHTML = '';

  project.columns.forEach((column: string) => {
    const option = document.createElement('option');
    option.innerText = column;
    option.value = column;
    if (selectedStatus === column) {
      option.selected = true;
    }
    modalStatusDropdown.appendChild(option);
  });

  if (!selectedStatus && modalStatusDropdown.firstElementChild) {
    (modalStatusDropdown.firstElementChild as HTMLOptionElement).selected =
      true;
  }
}

export async function handleModalBlock(
  modalBlockDropdown: HTMLSelectElement,
  selectedBlockedTask = null
) {
  const projectId = localStorage.getItem('selectedProject');

  if (!projectId) {
    return;
  }

  const tasks = await taskService.taskOfProjectId(projectId);

  modalBlockDropdown.innerHTML = '';

  const nullOption = document.createElement('option');
  nullOption.value = 'null';
  nullOption.textContent = 'No Block';
  modalBlockDropdown.appendChild(nullOption);

  tasks.data.result.forEach((task: Task) => {
    const option = document.createElement('option');
    option.textContent = task.title;
    option.value = task._id;
    modalBlockDropdown.appendChild(option);
  });
  if (selectedBlockedTask) {
    modalBlockDropdown.value = selectedBlockedTask;
  }
}

export async function handleModalBlockedByIssue(
  modalBlockedByIssueDropdown: HTMLSelectElement,
  selectedBlockedByIssue = null
) {
  const projectId = localStorage.getItem('selectedProject');

  if (!projectId) {
    return;
  }

  const tasks = await taskService.taskOfProjectId(projectId);

  modalBlockedByIssueDropdown.innerHTML = '';

  const nullOption = document.createElement('option');
  nullOption.value = 'null';
  nullOption.textContent = 'No Block';
  modalBlockedByIssueDropdown.appendChild(nullOption);

  tasks.data.result.forEach((task: Task) => {
    const option = document.createElement('option');
    option.textContent = task.title;
    option.value = task._id;
    modalBlockedByIssueDropdown.appendChild(option);
  });
  if (selectedBlockedByIssue) {
    modalBlockedByIssueDropdown.value = selectedBlockedByIssue;
  }
}
