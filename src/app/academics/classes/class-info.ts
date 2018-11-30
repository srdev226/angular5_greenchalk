export class ClassInfo {
  academic_year: string;
  school_key: string;
  class_info_key: string;
  class_code: string;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  eligible_classes: string[];
  order_index: number;
  divisions: Division[];
  subjects: Subject[];
}

export class Division{
  code: string;
  name: string;
  order_index: number;
}

export class Subject{
  code: string;
  name: string;
  type: string;
  constituent_subjects: string[];
}
