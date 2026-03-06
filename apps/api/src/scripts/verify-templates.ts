import {
  PROJECT_TEMPLATES,
  ProjectTemplate,
  TaskTemplate,
  SubtaskTemplate,
} from '../modules/projects/project-templates';

console.log('Starting Template Verification...');

const allKeys = new Set<string>();
const errors: string[] = [];

function checkKey(key: string | undefined, context: string) {
  if (!key) {
    errors.push(`MISSING KEY: ${context}`);
    return;
  }
  if (allKeys.has(key)) {
    errors.push(`DUPLICATE KEY: ${key} in ${context}`);
  }
  allKeys.add(key);
}

function traverseSubtasks(
  subtasks: SubtaskTemplate[] | undefined,
  parentContext: string,
) {
  if (!subtasks) return;
  subtasks.forEach((sub, index) => {
    const context = `${parentContext} > Subtask[${index}] "${sub.title}"`;
    checkKey(sub.deduplicationKey, context);

    if (
      sub.workspaceMode !== 'STANDARD' &&
      sub.workspaceMode !== 'INVOICE' &&
      sub.workspaceMode !== 'CHECKLIST'
    ) {
      // Optional check, but good for consistency
      // errors.push(`INVALID MODE: ${sub.workspaceMode} in ${context}`);
    }

    if (sub.subtasks) {
      traverseSubtasks(sub.subtasks, context);
    }
  });
}

function traverseTasks(tasks: TaskTemplate[], projectContext: string) {
  tasks.forEach((task, index) => {
    const context = `${projectContext} > Task[${index}] "${task.title}"`;
    checkKey(task.deduplicationKey, context);
    traverseSubtasks(task.subtasks, context);
  });
}

Object.entries(PROJECT_TEMPLATES).forEach(([key, template]) => {
  console.log(`Checking Template: ${template.name}`);
  traverseTasks(template.tasks, template.name);
});

if (errors.length > 0) {
  console.error('❌ VALIDATION FAILED:');
  errors.forEach((e) => console.error(e));
  process.exit(1);
} else {
  console.log('✅ ALL TEMPLATES VALID. Total Unique Keys:', allKeys.size);
  process.exit(0);
}
