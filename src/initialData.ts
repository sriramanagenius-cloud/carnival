import { Project, DashboardSettings, ProjectCategory } from './types.ts';

export const INITIAL_SETTINGS: DashboardSettings = {
  projectCount: 15,
  adminPin: 'eco2026',
};

const CATEGORIES: ProjectCategory[] = [
  'Urban Farming',
  'Clean Energy',
  'Air & Climate',
  'Waste & Circular',
  'Water Systems',
  'Biodiversity',
  'Smart Campus',
];

export function createInitialProjects(): Project[] {
  const projects: Project[] = [];

  for (let i = 0; i < 50; i++) {
    const num = i + 1;
    const id = `project-${num.toString().padStart(2, '0')}`;
    const category = CATEGORIES[i % CATEGORIES.length];

    projects.push({
      id,
      number: num,
      name: `Project ${num.toString().padStart(2, '0')}`,
      customHeading: '',
      category,
      contentType: 'empty', // Starts completely empty as requested
      contentData: '',
      pythonOutput: '',
      lastUpdated: Date.now(),
    });
  }

  return projects;
}
