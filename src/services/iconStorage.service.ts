import RNFS from 'react-native-fs';

export class IconStorageService {
  private static readonly ICONS_DIRECTORY = `${RNFS.DocumentDirectoryPath}/notification_icons`;

  /**
   * Initializes the icons directory
   */
  public static async initialize(): Promise<void> {
    try {
      const dirExists = await RNFS.exists(this.ICONS_DIRECTORY);
      if (!dirExists) {
        await RNFS.mkdir(this.ICONS_DIRECTORY);
      }
    } catch (error) {
      console.error('Error initializing icons directory:', error);
      throw error;
    }
  }

  /**
   * Saves an icon from base64 data
   * @param notificationId The notification ID to use as filename
   * @param base64Data The base64 data (with or without data:image prefix)
   * @returns The file path where the icon was saved
   */
  public static async saveIcon(notificationId: string, base64Data: string): Promise<string> {
    try {
      await this.initialize();

      // Remove data:image prefix if present
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Determine file extension from base64 header or default to png
      let extension = 'png';
      if (base64Data.includes('data:image/')) {
        const mimeMatch = base64Data.match(/data:image\/([a-z]+);base64,/);
        if (mimeMatch) {
          extension = mimeMatch[1];
        }
      }

      const fileName = `${notificationId}.${extension}`;
      const filePath = `${this.ICONS_DIRECTORY}/${fileName}`;

      await RNFS.writeFile(filePath, cleanBase64, 'base64');
      
      return filePath;
    } catch (error) {
      console.error('Error saving icon:', error);
      throw error;
    }
  }

  /**
   * Gets the file path for a notification icon
   * @param notificationId The notification ID
   * @returns The file path or null if not found
   */
  public static async getIconPath(notificationId: string): Promise<string | null> {
    try {
      await this.initialize();

      // Try different extensions
      const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
      
      for (const ext of extensions) {
        const filePath = `${this.ICONS_DIRECTORY}/${notificationId}.${ext}`;
        const exists = await RNFS.exists(filePath);
        if (exists) {
          return `file://${filePath}`;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting icon path:', error);
      return null;
    }
  }

  /**
   * Gets the file path for a notification icon with alternative URI formats
   * @param notificationId The notification ID
   * @returns The file path or null if not found
   */
  public static async getIconPathAlternative(notificationId: string): Promise<string | null> {
    try {
      await this.initialize();

      console.log('Looking for icon with ID (alternative):', notificationId);

      // Try different extensions
      const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
      
      for (const ext of extensions) {
        const filePath = `${this.ICONS_DIRECTORY}/${notificationId}.${ext}`;
        const exists = await RNFS.exists(filePath);
        if (exists) {
          // Return absolute path without file:// prefix for Android compatibility
          console.log('Returning absolute path (no file://):', filePath);
          return filePath;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting alternative icon path:', error);
      return null;
    }
  }
  public static async deleteIcon(notificationId: string): Promise<void> {
    try {
      await this.initialize();

      // Try to delete all possible extensions
      const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
      
      for (const ext of extensions) {
        const filePath = `${this.ICONS_DIRECTORY}/${notificationId}.${ext}`;
        const exists = await RNFS.exists(filePath);
        if (exists) {
          await RNFS.unlink(filePath);
          break; // Found and deleted, no need to check other extensions
        }
      }
    } catch (error) {
      console.error('Error deleting icon:', error);
      throw error;
    }
  }

  /**
   * Checks if an icon exists for a notification
   * @param notificationId The notification ID
   * @returns True if icon exists, false otherwise
   */
  public static async hasIcon(notificationId: string): Promise<boolean> {
    try {
      const iconPath = await this.getIconPath(notificationId);
      return iconPath !== null;
    } catch (error) {
      console.error('Error checking if icon exists:', error);
      return false;
    }
  }

  /**
   * Clears all stored icons (useful for cleanup)
   */
  public static async clearAllIcons(): Promise<void> {
    try {
      const dirExists = await RNFS.exists(this.ICONS_DIRECTORY);
      if (dirExists) {
        await RNFS.unlink(this.ICONS_DIRECTORY);
        await this.initialize();
      }
    } catch (error) {
      console.error('Error clearing all icons:', error);
      throw error;
    }
  }

  /**
   * Gets the total size of all stored icons
   * @returns Size in bytes
   */
  public static async getTotalSize(): Promise<number> {
    try {
      await this.initialize();
      
      const files = await RNFS.readDir(this.ICONS_DIRECTORY);
      let totalSize = 0;
      
      for (const file of files) {
        totalSize += file.size;
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error getting total icons size:', error);
      return 0;
    }
  }
}
