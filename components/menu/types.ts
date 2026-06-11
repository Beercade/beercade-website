export interface MenuItem {
  _key: string;
  name: string;
  description?: string | null;
  price?: string | null;
}

export interface MenuGroup {
  _key: string;
  heading?: string | null;
  items: MenuItem[];
}

export interface MenuSection {
  _id: string;
  title: string;
  side: "drinks" | "play";
  note?: string | null;
  footnotes?: string[] | null;
  groups: MenuGroup[];
}

export function bySide(sections: MenuSection[]) {
  return {
    drinks: sections.filter((s) => s.side === "drinks"),
    play: sections.filter((s) => s.side === "play"),
  };
}
