import {IsIn, IsOptional} from "class-validator";
import {Presentation} from "@mean-stream/ngbx";

const OPTIONS = [1, 2, 3, 4];

export class Feedback {
  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Wie motiviert bist du derzeit, weitere Lösungen zu überprüfen?',
    optionLabels: {
      1: 'Gar nicht motiviert',
      2: 'Eher nicht motiviert',
      3: 'Eher motiviert',
      4: 'Sehr motiviert',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  motivation?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Wie erschöpft fühlst du dich nach der Bewertung der letzten Lösung(en)?',
    optionLabels: {
      1: 'Gar nicht erschöpft',
      2: 'Eher nicht erschöpft',
      3: 'Eher erschöpft',
      4: 'Sehr erschöpft',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  exhaustion?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Wie sehr hast du dich während der Bewertung der letzten Lösung unruhig oder gestresst gefühlt?',
    optionLabels: {
      1: 'Gar nicht gestresst',
      2: 'Eher nicht gestresst',
      3: 'Eher gestresst',
      4: 'Sehr gestresst',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  stress?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Wie aufmerksam bist du aktuell beim Überprüfen der Lösung?',
    optionLabels: {
      1: 'Gar nicht aufmerksam',
      2: 'Eher nicht aufmerksam',
      3: 'Eher aufmerksam',
      4: 'Sehr aufmerksam',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  concentration?: number;

  @Presentation({
    control: 'radio',
    rows: 1,
    label: 'Wie leicht fällt es dir aktuell, Ablenkungen zu ignorieren?',
    optionLabels: {
      1: 'Gar nicht leicht',
      2: 'Eher nicht leicht',
      3: 'Eher leicht',
      4: 'Sehr leicht',
    },
  })
  @IsOptional()
  @IsIn(OPTIONS)
  ignoreDistraction?: number;
}

export interface Assignee {
  assignment: string;
  solution: string;
  assignee: string;
  duration?: number;
  feedback?: Feedback;
  notes?: string;
}

export type UpdateAssigneeDto = Omit<Assignee, 'assignment' | 'solution'>;
export type BulkUpdateAssigneeDto = Omit<Assignee, 'assignment'>;
export type PatchAssigneeDto = Partial<UpdateAssigneeDto>;
