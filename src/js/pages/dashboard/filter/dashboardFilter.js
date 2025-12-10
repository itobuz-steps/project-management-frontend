import { removeElementChildren } from '../../../utils/removeElement';
import projectService from '../../../services/ProjectService';
import { renderBoard } from '../dashboard';

const statusDropDown = document.getElementById('statusDropdown');
const assigneeDropdown = document.getElementById('assigneeDropdown');
const currentProject = localStorage.getItem('selectedProject');

function renderSubDropdown(item) {
  const subDropdown = document.createElement('div');
  subDropdown.className = `px-4 py-2 hover:bg-gray-100 cursor-pointer ${item}-filter`;
  subDropdown.id = `${item}-filter`;
  subDropdown.innerHTML = `
    ${item.charAt(0).toUpperCase() + item.slice(1)}
  `;
  return subDropdown;
}

export async function handleStatusFilter() {
  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
  const project = (
    await projectService.getProjectById(localStorage.getItem('selectedProject'))
  ).result;

  project.columns.forEach((column) => {
    const dropdownEl = renderSubDropdown(column);
    statusDropDown.appendChild(dropdownEl);
    dropdownEl.addEventListener('click', () => {
      removeElementChildren(statusDropDown);
      removeElementChildren(assigneeDropdown);
      renderBoard(currentProject, 'status', `${column}`);
    });
  });
}

export async function handleAssigneeFilter() {
  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
  const assignees = await projectService.getProjectMembers(
    localStorage.getItem('selectedProject')
  );

  assignees.result.forEach((assignee) => {
    const dropdownEl = renderSubDropdown(assignee.name);
    assigneeDropdown.appendChild(dropdownEl);
    dropdownEl.addEventListener('click', () => {
      removeElementChildren(statusDropDown);
      removeElementChildren(assigneeDropdown);
      renderBoard(
        localStorage.getItem('selectedProject'),
        'assignee',
        `${assignee._id}`
      );
    });
  });
}

const priorityDropdown = document.getElementById('priorityDropdown');
const lowFilterBtn = document.getElementById('low-filter');
const midFilterBtn = document.getElementById('medium-filter');
const highFilterBtn = document.getElementById('high-filter');
const criticalFilterBtn = document.getElementById('critical-filter');
const removeFilterBtn = document.getElementById('remove-filter-btn');

priorityDropdown.addEventListener('click', () => {
  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
});

lowFilterBtn.addEventListener('click', () => {
  renderBoard(localStorage.getItem('selectedProject'), 'priority', 'low');
});

midFilterBtn.addEventListener('click', () => {
  renderBoard(localStorage.getItem('selectedProject'), 'priority', 'medium');
});

highFilterBtn.addEventListener('click', () => {
  renderBoard(localStorage.getItem('selectedProject'), 'priority', 'high');
});

criticalFilterBtn.addEventListener('click', () => {
  renderBoard(localStorage.getItem('selectedProject'), 'priority', 'critical');
});

removeFilterBtn.addEventListener('click', () => {
  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
  renderBoard(localStorage.getItem('selectedProject'), '', '');
});
