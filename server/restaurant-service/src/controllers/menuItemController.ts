import { Request, Response } from 'express';
import MenuItemServiceImpl from '../services/impl/MenuItemServiceImpl';

const menuItemService = new MenuItemServiceImpl();

class MenuItemController {

  createMenuItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const menuItemData = req.body;
      const menuItem = await menuItemService.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create menu item' });
    }
  };

  getMenuItemsByRestaurant = async (req: Request, res: Response): Promise<void> => {
    try {
      const { restaurantId } = req.params;
      const filters = req.query.filters ? JSON.parse(String(req.query.filters)) : {};
      
      const menuItems = await menuItemService.getMenuItemsByRestaurant(restaurantId, filters);
      res.status(200).json(menuItems);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to get menu items' });
    }
  };

  getMenuItemsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.params;
      const menuItems = await menuItemService.getMenuItemsByCategory(category);
      res.status(200).json(menuItems);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to get menu items by category' });
    }
  };

  getMenuItemById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const menuItem = await menuItemService.getMenuItemById(id);
      
      if (!menuItem) {
        res.status(404).json({ error: 'Menu item not found' });
        return;
      }
      
      res.status(200).json(menuItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to get menu item' });
    }
  };

  updateMenuItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedMenuItem = await menuItemService.updateMenuItem(id, updateData);
      res.status(200).json(updatedMenuItem);
    } catch (error: any) {
      if (error.message === 'Menu item not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message || 'Failed to update menu item' });
      }
    }
  };

  deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await menuItemService.deleteMenuItem(id);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Menu Item not Found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message || 'Failed to delete menu item' });
      }
    }
  };

  getPaginatedMenuItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { restaurantId } = req.params;
      const page = req.query.page ? parseInt(String(req.query.page)) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit)) : 10;
      const search = req.query.search ? String(req.query.search) : '';
      const filters = req.query.filters ? JSON.parse(String(req.query.filters)) : {};
      
      const paginatedResult = await menuItemService.getPaginatedMenuItems(
        restaurantId,
        filters,
        page,
        limit,
        search
      );
      
      res.status(200).json(paginatedResult);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to get paginated menu items' });
    }
  };
}

export default MenuItemController;
