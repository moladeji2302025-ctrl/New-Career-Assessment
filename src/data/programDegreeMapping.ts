export const PROGRAM_DEGREE_MAP: Record<string, string> = {
  'Accounting': 'B.Sc. Accounting',
  'Agricultural Economics': 'B.Sc. Agricultural Economics',
  'Agricultural Engineering': 'B.Eng. Agricultural Engineering',
  'Agriculture': 'B.Sc. Agriculture',
  'Animal Science': 'B.Sc. Animal Science',
  'Architecture': 'B.Sc. Architecture',
  'Banking and Finance': 'B.Sc. Banking and Finance',
  'Biochemistry': 'B.Sc. Biochemistry',
  'Biology': 'B.Sc. Biology',
  'Botany': 'B.Sc. Botany',
  'Building Technology': 'B.Sc. Building Technology',
  'Business Administration': 'B.Sc. Business Administration',
  'Chemical Engineering': 'B.Eng. Chemical Engineering',
  'Chemistry': 'B.Sc. Chemistry',
  'Civil Engineering': 'B.Eng. Civil Engineering',
  'Communication and Language Arts': 'B.A. Communication and Language Arts',
  'Computer Engineering': 'B.Eng. Computer Engineering',
  'Computer Science': 'B.Sc. Computer Science',
  'Criminology and Security Studies': 'B.Sc. Criminology and Security Studies',
  'Dentistry': 'BDS',
  'Economics': 'B.Sc. Economics',
  'Education': 'B.Ed.',
  'Electrical Engineering': 'B.Eng. Electrical Engineering',
  'Electrical/Electronic Engineering': 'B.Eng. Electrical/Electronic Engineering',
  'English Language': 'B.A. English Language',
  'Environmental Management': 'B.Sc. Environmental Management',
  'Estate Management': 'B.Sc. Estate Management',
  'Finance': 'B.Sc. Finance',
  'Food Science and Technology': 'B.Sc. Food Science and Technology',
  'Forestry': 'B.Sc. Forestry',
  'Geography': 'B.Sc. Geography',
  'Geology': 'B.Sc. Geology',
  'History and International Studies': 'B.A. History and International Studies',
  'Industrial Chemistry': 'B.Sc. Industrial Chemistry',
  'Industrial Mathematics': 'B.Sc. Industrial Mathematics',
  'Industrial Relations and Human Resource Management': 'B.Sc. Industrial Relations and HRM',
  'Information Technology': 'B.Sc. Information Technology',
  'International Relations': 'B.Sc. International Relations',
  'Law': 'LL.B.',
  'Linguistics': 'B.A. Linguistics',
  'Management': 'B.Sc. Management',
  'Marketing': 'B.Sc. Marketing',
  'Mass Communication': 'B.Sc. Mass Communication',
  'Mathematics': 'B.Sc. Mathematics',
  'Mechanical Engineering': 'B.Eng. Mechanical Engineering',
  'Medicine and Surgery': 'MBBS',
  'Microbiology': 'B.Sc. Microbiology',
  'Nursing': 'B.Sc. Nursing',
  'Petroleum Engineering': 'B.Eng. Petroleum Engineering',
  'Pharmacy': 'B.Pharm.',
  'Philosophy': 'B.A. Philosophy',
  'Physics': 'B.Sc. Physics',
  'Political Science': 'B.Sc. Political Science',
  'Psychology': 'B.Sc. Psychology',
  'Public Administration': 'B.Sc. Public Administration',
  'Public Health': 'B.Sc. Public Health',
  'Quantity Surveying': 'B.Sc. Quantity Surveying',
  'Sociology': 'B.Sc. Sociology',
  'Software Engineering': 'B.Sc. Software Engineering',
  'Statistics': 'B.Sc. Statistics',
  'Surveying and Geo-Informatics': 'B.Sc. Surveying and Geo-Informatics',
  'Systems Engineering': 'B.Eng. Systems Engineering',
  'Urban and Regional Planning': 'B.Sc. Urban and Regional Planning',
  'Veterinary Medicine': 'DVM',
  'Zoology': 'B.Sc. Zoology',
};

export function getDegreeForProgram(program: string): string {
  const normalised = program.trim();
  if (PROGRAM_DEGREE_MAP[normalised]) {
    return PROGRAM_DEGREE_MAP[normalised];
  }
  const lowerProgram = normalised.toLowerCase();
  for (const [key, value] of Object.entries(PROGRAM_DEGREE_MAP)) {
    if (key.toLowerCase() === lowerProgram) return value;
  }
  return '';
}

export const PROGRAM_NAMES: string[] = Object.keys(PROGRAM_DEGREE_MAP).sort();
