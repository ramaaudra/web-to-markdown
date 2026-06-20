export interface RawPageData {
  readonly kind: 'page';
  readonly url: string;
  readonly title: string;
  readonly content: string;
  readonly siteName?: string;
  readonly author?: string;
  readonly publishedAt?: string;
}

export interface RawSelectionData {
  readonly kind: 'selection';
  readonly url: string;
  readonly title: string;
  readonly html: string;
}
