import projectService from '../../services/ProjectService';
import taskService from '../../services/TaskService';

export async function handleModalAssignee(
  modalAssigneeDropdown,
  selectedAssignee = null
) {
  const assignees = await projectService.getProjectMembers(
    localStorage.getItem('selectedProject')
  );

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
  modalStatusDropdown,
  selectedStatus = null
) {
  const project = (
    await projectService.getProjectById(localStorage.getItem('selectedProject'))
  ).result;
  modalStatusDropdown.innerHTML = '';

  project.columns.forEach((column) => {
    const option = document.createElement('option');
    option.innerText = column;
    option.value = column;
    if (selectedStatus === column) {
      option.selected = true;
    }
    modalStatusDropdown.appendChild(option);
  });

  if (!selectedStatus) {
    modalStatusDropdown.firstChild.selected = true;
  }
}

export async function handleModalBlock(
  modalBlockDropdown,
  selectedBlockedTask = null
) {
  const tasks = await taskService.taskOfProjectId(
    localStorage.getItem('selectedProject')
  );

  modalBlockDropdown.innerHTML = '';

  const nullOption = document.createElement('option');
  nullOption.value = 'null';
  nullOption.textContent = 'No Block';
  modalBlockDropdown.appendChild(nullOption);

  tasks.data.result.forEach((task) => {
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
  modalBlockedByIssueDropdown,
  selectedBlockedByIssue = null
) {
  const tasks = await taskService.taskOfProjectId(
    localStorage.getItem('selectedProject')
  );

  modalBlockedByIssueDropdown.innerHTML = '';

  const nullOption = document.createElement('option');
  nullOption.value = 'null';
  nullOption.textContent = 'No Block';
  modalBlockedByIssueDropdown.appendChild(nullOption);

  tasks.data.result.forEach((task) => {
    const option = document.createElement('option');
    option.textContent = task.title;
    option.value = task._id;
    modalBlockedByIssueDropdown.appendChild(option);
  });
  if (selectedBlockedByIssue) {
    modalBlockedByIssueDropdown.value = selectedBlockedByIssue;
  }
}
