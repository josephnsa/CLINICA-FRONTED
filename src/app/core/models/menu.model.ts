export interface MenuItemDto {
  id: string;
  label: string;
  icon?: string;
  route?: string | null;
  children: MenuItemDto[];
}

