import { svgObject } from './svgObjects';

export function getColorByType(task) {
  if (task.type === 'task') {
    return 'bg-blue-600';
  } else if (task.type === 'story') {
    return 'bg-green-600';
  } else {
    return 'bg-red-600';
  }
}

export function getColorByPriority(task) {
  if (task.priority === 'low') {
    return 'green';
  } else if (task.priority === 'medium') {
    return 'blue';
  } else if (task.priority === 'high') {
    return 'yellow';
  } else {
    return 'red';
  }
}

export function getSvgByType(task) {
  if (task.type === 'task') {
    return `${svgObject.task}`;
  } else if (task.type === 'story') {
    return `${svgObject.story}`;
  } else {
    return `${svgObject.bug}`;
  }
}

export function getSvgByPriority(task) {
  if (task.priority === 'low') {
    return `${svgObject.low}`;
  } else if (task.priority === 'medium') {
    return `${svgObject.medium}`;
  } else if (task.priority === 'high') {
    return `${svgObject.high}`;
  } else {
    return `${svgObject.critical}`;
  }
}
