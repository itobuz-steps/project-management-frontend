import { removeElementChildren } from '../../../utils/elementUtils';
import projectService from '../../../services/ProjectService';
import renderSelectedTab from '../../../utils/renderSelectedTab';

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
  if (!currentProject) return;

  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);
  const project = (await projectService.getProjectById(currentProject)).result;

  project.columns.forEach((column) => {
    const dropdownEl = renderSubDropdown(column);

    statusDropDown.appendChild(dropdownEl);
    dropdownEl.addEventListener('click', async () => {
      await renderSelectedTab(currentProject, 'status', `${column}`);
    });
  });
}

export async function handleAssigneeFilter() {
  if (!currentProject) return;

  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);

  const assignees = await projectService.getProjectMembers(currentProject);

  assignees.result.forEach((assignee) => {
    const dropdownEl = renderSubDropdown(assignee.name);

    assigneeDropdown.appendChild(dropdownEl);

    dropdownEl.addEventListener('click', async () => {
      await renderSelectedTab(currentProject, 'assignee', `${assignee._id}`);
    });
  });
}

const lowFilterBtn = document.getElementById('low-filter');
const midFilterBtn = document.getElementById('medium-filter');
const highFilterBtn = document.getElementById('high-filter');
const criticalFilterBtn = document.getElementById('critical-filter');
const removeFilterBtn = document.getElementById('remove-filter-btn');
const filterBox = document.getElementById('filterBox');
const mainDropdown = document.getElementById('mainDropdown');
const subDropdowns = document.querySelectorAll('.subDropdown');

filterBox.addEventListener('click', (e) => {
  e.stopPropagation();
  mainDropdown.classList.toggle('hidden');
  subDropdowns.forEach((d) => d.classList.add('hidden'));
});

document.querySelectorAll('.dropdown-item').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = item.getAttribute('data-target');

    subDropdowns.forEach((d) => d.id !== target && d.classList.add('hidden'));
    document.getElementById(target).classList.toggle('hidden');
  });
});

document.addEventListener('click', (e) => {
  mainDropdown.classList.add('hidden');
  subDropdowns.forEach((d) => d.classList.add('hidden'));

  e.stopPropagation();
});

lowFilterBtn.addEventListener('click', async () => {
  await renderSelectedTab(currentProject, 'priority', 'low');
});

midFilterBtn.addEventListener('click', async () => {
  await renderSelectedTab(currentProject, 'priority', 'medium');
});

highFilterBtn.addEventListener('click', async () => {
  await renderSelectedTab(currentProject, 'priority', 'high');
});

criticalFilterBtn.addEventListener('click', async () => {
  await renderSelectedTab(currentProject, 'priority', 'critical');
});

removeFilterBtn.addEventListener('click', async () => {
  await renderSelectedTab(currentProject);
});
