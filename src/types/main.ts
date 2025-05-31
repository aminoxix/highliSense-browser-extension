export interface IGenerator {
  type: string;
  link?: string;
  context?: string;
  highlighter: string;
}

export interface Response extends IGenerator {
  text: string;
}
