export function getColorByType(task) {
  if (task.type === 'task') {
    return 'bg-blue-600';
  } else if (task.type === 'story') {
    return 'bg-green-600';
  } else {
    return 'bg-red-600';
  }
}
