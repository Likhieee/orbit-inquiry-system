import { Award, Music, BookOpen, MessageCircle, GraduationCap, Users, School } from 'lucide-react';

export const BRAND = 'Orbit';

export const USER_TYPES = [
  { value: 'parent', label: 'Parent', desc: 'Asking for my child', icon: Users },
  { value: 'student', label: 'Student', desc: 'Asking for myself', icon: GraduationCap },
  { value: 'school', label: 'School', desc: 'Asking for an institution', icon: School },
];

// Each category has its own color so people (and the admin table) can tell them apart at a glance
export const CATEGORIES = [
  { value: 'scholarship', label: 'Scholarship', desc: 'Eligibility, deadlines, documents', icon: Award, accent: '#FFB938', bg: '#FFF3D6', text: '#7A4A00' },
  { value: 'concert', label: 'Concert', desc: 'Tickets, schedules, registrations', icon: Music, accent: '#F0539B', bg: '#FFE6F2', text: '#9A1059' },
  { value: 'admission', label: 'Admission', desc: 'Process, fees, important dates', icon: BookOpen, accent: '#2F5BFF', bg: '#E4EBFF', text: '#1D3DB8' },
  { value: 'general_query', label: 'General query', desc: 'Anything else you want to ask', icon: MessageCircle, accent: '#19D3C5', bg: '#D9F8F4', text: '#08625B' },
];

export const STATUSES = [
  { value: 'new', label: 'New', bg: '#E4EBFF', text: '#1D3DB8', dot: '#2F5BFF' },
  { value: 'in_progress', label: 'In progress', bg: '#FFF3D6', text: '#7A4A00', dot: '#F59E0B' },
  { value: 'resolved', label: 'Resolved', bg: '#DDF7E8', text: '#0F6B3A', dot: '#16A34A' },
  { value: 'closed', label: 'Closed', bg: '#E8ECF4', text: '#3D4B66', dot: '#7B88A3' },
];

export const STARTERS = {
  scholarship: ['I want to know if I am eligible and how to apply.', 'Which documents do I need for the scholarship?'],
  concert: ['How can I book tickets for the next concert?', 'Please share the upcoming concert schedule.'],
  admission: ['What is the admission process and the last date to apply?', 'Please share the fee details for the next batch.'],
  general_query: ['Could someone call me back to answer a few questions?'],
};

export const byValue = (list, value) => list.find((i) => i.value === value);
