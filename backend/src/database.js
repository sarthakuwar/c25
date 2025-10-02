type Task = {
  id: string;
  startTime: string;
  endTime: string;
  task: string;
};

type Day = {
  id: string;
  tasks: Task[];
};

type Staff = {
  id: string;
  phoneNumber: string;
  role: string;
  status: string;
  startTime: string;
  endTime: string;
  skillset: string[];
  day: Day[];
};

type Shop = {
  id: string;
  shopName: string;
  startTime: string;
  endTime: string;
  staffs: Staff[];
};

export type Database = {
  shops: Shop[];
};
