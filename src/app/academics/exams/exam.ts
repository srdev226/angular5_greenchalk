export class Exam {
  exam_key: string;
  institution_key: string;
  name: string;
  series_name: string;
  assessment_type: string;
  max_score: number;
  type: string;
  term: string;
  date_time: string;
  class_key: string;
  division: string;
  academic_year: string;
  code: string;
  series_code: string;
  subject_code: string;
  status: string;
  visibility: string;
  schedulable: string;
  aggregation_info: AggregationInfo;
  audit_logs: AuditLog[];
}

export class AggregationInfo{
  constituent_exams: string[];
  aggregation_method: AggregationMethod;
}

export class AggregationMethod{
  aggregate_type: string;
}

class AuditLog{
  date_time: string;
  message: string;
}
