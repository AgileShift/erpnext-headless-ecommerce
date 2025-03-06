export interface Category {
  key: string;
  value: {
    label: string;
    link?: string;
    extra_classes?: string;
    banner?: string;
    bannerTitle?: string;
  };
  children?: Category[];
  isLeaf: boolean;
}
