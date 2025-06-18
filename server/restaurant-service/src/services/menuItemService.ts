import { IMenuItem } from '../models/MenuItem';

export default interface IMenuItemService {

    createMenuItem(data: Partial<IMenuItem>): Promise<IMenuItem>;

    getMenuItemsByRestaurant(restaurantId: string, filters?: Record<string, any>): Promise<IMenuItem[]>;

    getMenuItemsByCategory(category: string): Promise<IMenuItem[]>;

    getMenuItemById(id: string): Promise<IMenuItem | null>;

    updateMenuItem(menuItemId: string, updateData: Partial<IMenuItem>): Promise<IMenuItem>;

    deleteMenuItem(menuItemId: string): Promise<{ message: string }>;

    getPaginatedMenuItems(
        restaurantId: string,
        filters: Record<string, any>,
        page?: number,
        limit?: number,
        search?: string
    ): Promise<{
        items: IMenuItem[];
        total: number;
        page: number;
        pages: number;
    }>;
}
