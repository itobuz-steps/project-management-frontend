import projectService from '../../services/ProjectService';

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
