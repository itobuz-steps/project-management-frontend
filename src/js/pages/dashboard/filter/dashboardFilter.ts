import { removeElementChildren } from '../../../utils/elementUtils';
import projectService from '../../../services/ProjectService';
import renderSelectedTab from '../../../utils/renderSelectedTab';

import type { ProjectMember } from '../../../interfaces/common';

/* ------------------------------------------------------------------ */
/* DOM elements */
/* ------------------------------------------------------------------ */

const statusDropDown = document.getElementById(
  'statusDropdown'
) as HTMLElement | null;
const assigneeDropdown = document.getElementById(
  'assigneeDropdown'
) as HTMLElement | null;
const currentProject = localStorage.getItem('selectedProject');

/* ------------------------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------------------------ */

function renderSubDropdown(item: string): HTMLDivElement {
  const subDropdown = document.createElement('div');

  subDropdown.className = `px-4 py-2 hover:bg-gray-100 cursor-pointer ${item}-filter`;
  subDropdown.id = `${item}-filter`;
  subDropdown.innerHTML = item.charAt(0).toUpperCase() + item.slice(1);

  return subDropdown;
}

/* ------------------------------------------------------------------ */
/* Status filter */
/* ------------------------------------------------------------------ */

export async function handleStatusFilter(): Promise<void> {
  if (!currentProject || !statusDropDown || !assigneeDropdown) return;

  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);

  const projectResponse = await projectService.getProjectById(currentProject);
  const project = projectResponse.result;

  project.columns.forEach((column) => {
    const dropdownEl = renderSubDropdown(column);

    statusDropDown.appendChild(dropdownEl);

    dropdownEl.addEventListener('click', async () => {
      await renderSelectedTab(currentProject, 'status', column);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Assignee filter */
/* ------------------------------------------------------------------ */

export async function handleAssigneeFilter(): Promise<void> {
  if (!currentProject || !statusDropDown || !assigneeDropdown) return;

  removeElementChildren(statusDropDown);
  removeElementChildren(assigneeDropdown);

  const assigneesResponse = await projectService.getProjectMembers<{
    result: ProjectMember[];
  }>(currentProject);

  assigneesResponse.result.forEach((assignee) => {
    const dropdownEl = renderSubDropdown(assignee.name);

    assigneeDropdown.appendChild(dropdownEl);

    dropdownEl.addEventListener('click', async () => {
      await renderSelectedTab(currentProject, 'assignee', assignee._id);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Priority filter & dropdown logic */
/* ------------------------------------------------------------------ */

const lowFilterBtn = document.getElementById(
  'low-filter'
) as HTMLElement | null;
const midFilterBtn = document.getElementById(
  'medium-filter'
) as HTMLElement | null;
const highFilterBtn = document.getElementById(
  'high-filter'
) as HTMLElement | null;
const criticalFilterBtn = document.getElementById(
  'critical-filter'
) as HTMLElement | null;
const removeFilterBtn = document.getElementById(
  'remove-filter-btn'
) as HTMLElement | null;
const filterBox = document.getElementById('filterBox') as HTMLElement | null;
const mainDropdown = document.getElementById(
  'mainDropdown'
) as HTMLElement | null;
const subDropdowns = document.querySelectorAll<HTMLElement>('.subDropdown');

/* ------------------------------------------------------------------ */
/* Dropdown UI handlers */
/* ------------------------------------------------------------------ */

filterBox?.addEventListener('click', (e: MouseEvent) => {
  e.stopPropagation();
  mainDropdown?.classList.toggle('hidden');
  subDropdowns.forEach((d) => d.classList.add('hidden'));
});

document.querySelectorAll<HTMLElement>('.dropdown-item').forEach((item) => {
  item.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();

    const target = item.getAttribute('data-target');
    if (!target) return;

    subDropdowns.forEach((d) => d.id !== target && d.classList.add('hidden'));

    document.getElementById(target)?.classList.toggle('hidden');
  });
});

document.addEventListener('click', () => {
  mainDropdown?.classList.add('hidden');
  subDropdowns.forEach((d) => d.classList.add('hidden'));
});

/* ------------------------------------------------------------------ */
/* Priority actions */
/* ------------------------------------------------------------------ */

lowFilterBtn?.addEventListener('click', async () => {
  if (!currentProject) return;
  await renderSelectedTab(currentProject, 'priority', 'low');
});

midFilterBtn?.addEventListener('click', async () => {
  if (!currentProject) return;
  await renderSelectedTab(currentProject, 'priority', 'medium');
});

highFilterBtn?.addEventListener('click', async () => {
  if (!currentProject) return;
  await renderSelectedTab(currentProject, 'priority', 'high');
});

criticalFilterBtn?.addEventListener('click', async () => {
  if (!currentProject) return;
  await renderSelectedTab(currentProject, 'priority', 'critical');
});

removeFilterBtn?.addEventListener('click', async () => {
  if (!currentProject) return;
  await renderSelectedTab(currentProject);
});
