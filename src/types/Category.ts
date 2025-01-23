export interface Category {
  key: string;
  value: {
    label: string;
    link?: string;
    banner?: string;
    bannerTitle?: string;
  };
  children?: Category[];
  isLeaf: boolean;
}
