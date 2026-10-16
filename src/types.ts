export type WidgetContentType = 'empty' | 'html' | 'python' | 'link';

export type ProjectCategory = 
  | 'All'
  | 'Urban Farming'
  | 'Clean Energy'
  | 'Air & Climate'
  | 'Waste & Circular'
  | 'Water Systems'
  | 'Biodiversity'
  | 'Smart Campus';

export interface Project {
  id: string; // e.g. "project-01"
  number: number;
  name: string; // e.g. "Project 01"
  customHeading?: string; // User-defined heading
  category: ProjectCategory;
  contentType: WidgetContentType; // 'empty' | 'html' | 'python' | 'link'
  contentData: string; // Raw HTML, Python script, or Web URL
  pythonOutput?: string; // Output of Python code
  imageUrl?: string; // Project image or featured photo
  uploadedImages?: string[]; // List of uploaded image URLs
  lastUpdated: number;
}

export interface DashboardSettings {
  projectCount: number; // 10 to 50
  adminPin: string;
}

export interface FilterOptions {
  searchQuery: string;
  category: ProjectCategory;
}
