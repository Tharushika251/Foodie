import MenuItem, { IMenuItem } from '../../models/MenuItem';
import logger from '../../config/logger';

class MenuItemServiceImpl implements MenuItemServiceImpl {

  async createMenuItem(data: Partial<IMenuItem>): Promise<IMenuItem> {
    try {
      logger.info(`Creating new menu item: ${data.name} for restaurant: ${data.restaurantId}`);
      const menuItem = new MenuItem(data);
      await menuItem.save();
      logger.info(`Menu item created successfully with ID: ${menuItem._id}`);
      return menuItem.toObject();
    } catch (error: any) {
      logger.error(`Failed to create menu item: ${error.message}`);
      throw error;
    }
  }

  async getMenuItemsByRestaurant(restaurantId: string, filters: Record<string, any> = {}): Promise<IMenuItem[]> {
    try {
      logger.info(`Fetching menu items for restaurant: ${restaurantId} with filters: ${JSON.stringify(filters)}`);
      const query = { restaurantId, ...filters };
      const items = await MenuItem.find(query);
      logger.info(`Found ${items.length} menu items for restaurant: ${restaurantId}`);
      return items;
    } catch (error: any) {
      logger.error(`Failed to get menu items by restaurant: ${error.message}`);
      throw error;
    }
  }

  async getMenuItemsByCategory(category: string): Promise<IMenuItem[]> {
    try {
      logger.info(`Fetching menu items by category: ${category}`);
      const items = await MenuItem.find({ category });
      logger.info(`Found ${items.length} menu items in category: ${category}`);
      return items;
    } catch (error: any) {
      logger.error(`Failed to get menu items by category: ${error.message}`);
      throw error;
    }
  }

  async getMenuItemById(id: string): Promise<IMenuItem | null> {
    try {
      logger.info(`Fetching menu item by ID: ${id}`);
      const item = await MenuItem.findById(id);
      if (item) {
        logger.info(`Found menu item: ${item.name}`);
      } else {
        logger.info(`No menu item found with ID: ${id}`);
      }
      return item;
    } catch (error: any) {
      logger.error(`Failed to get menu item by ID: ${error.message}`);
      throw error;
    }
  }

  async updateMenuItem(menuItemId: string, updateData: Partial<IMenuItem>): Promise<IMenuItem> {
    try {
      logger.info(`Updating menu item with ID: ${menuItemId}`);
      logger.info(`Update data: ${JSON.stringify(updateData)}`);
      
      const updated = await MenuItem.findByIdAndUpdate(menuItemId, updateData, { new: true });
      if (!updated) {
        logger.info(`Menu item not found with ID: ${menuItemId}`);
        throw new Error("Menu item not found");
      }
      
      logger.info(`Menu item updated successfully: ${updated.name}`);
      return updated;
    } catch (error: any) {
      logger.error(`Failed to update menu item: ${error.message}`);
      throw error;
    }
  }

  async deleteMenuItem(menuItemId: string): Promise<{ message: string }> {
    try {
      logger.info(`Deleting menu item with ID: ${menuItemId}`);
      
      const deleted = await MenuItem.findByIdAndDelete(menuItemId);
      if (!deleted) {
        logger.info(`Menu item not found with ID: ${menuItemId}`);
        throw new Error("Menu Item not Found");
      }
      
      logger.info(`Menu item deleted successfully: ${deleted.name}`);
      return { message: `Menu item '${deleted.name}' deleted successfully` };
    } catch (error: any) {
      logger.error(`Failed to delete menu item: ${error.message}`);
      throw error;
    }
  }

  async getPaginatedMenuItems(
    restaurantId: string,
    filters: Record<string, any>,
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<{
    items: IMenuItem[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      logger.info(`Fetching paginated menu items for restaurant: ${restaurantId}`);
      logger.info(`Filters: ${JSON.stringify(filters)}, Page: ${page}, Limit: ${limit}, Search: ${search}`);
      
      const query = {
        restaurantId,
        ...filters,
        name: { $regex: search, $options: 'i' }
      };

      const items = await MenuItem.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await MenuItem.countDocuments(query);
      const pages = Math.ceil(total / limit);
      
      logger.info(`Found ${items.length} menu items (page ${page} of ${pages}), total: ${total}`);
      
      return { items, total, page, pages };
    } catch (error: any) {
      logger.error(`Failed to get paginated menu items: ${error.message}`);
      throw error;
    }
  }
}

export default MenuItemServiceImpl;
