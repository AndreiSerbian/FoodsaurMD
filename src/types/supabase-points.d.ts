export type TimeRange = { open: string; close: string };

export type WorkHours = { 
  mon: TimeRange[]; 
  tue: TimeRange[]; 
  wed: TimeRange[]; 
  thu: TimeRange[]; 
  fri: TimeRange[]; 
  sat: TimeRange[]; 
  sun: TimeRange[]; 
};

export type PickupPoint = {
  id: string;
  producer_id: string;
  name: string;
  title?: string;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
  work_hours: WorkHours;
  is_active: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  working_hours_from?: string;
  working_hours_to?: string;
  discount_available_from?: string;
  discount_available_to?: string;
};