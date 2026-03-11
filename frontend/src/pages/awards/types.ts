export interface AwardNominee {
  name: string;
  isWinner: boolean;
  subText?: string;
}

export interface AwardCategory {
  name: string;
  isVisible: boolean;
  nominees: AwardNominee[];
}

export interface AwardYear {
  year: number;
  categories: AwardCategory[];
}
