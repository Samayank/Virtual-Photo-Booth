// Global type declaration for CamanJS
declare global {
  interface Window {
    Caman: any;
  }
}

export interface FilterConfig {
  id: string;
  name: string;
  apply: (camanInstance: any) => void;
}

export const camanFilters: FilterConfig[] = [
  {
    id: 'none',
    name: 'Normal',
    apply: (caman) => {
      // No filter applied - just render the original
      caman.render();
    }
  },
  {
    id: 'blackWhite',
    name: 'B&W',
    apply: (caman) => {
      caman.greyscale().render();
    }
  },
  {
    id: 'vintage',
    name: 'Vintage',
    apply: (caman) => {
      caman.vintage().render();
    }
  },
  {
    id: 'warm',
    name: 'Warm',
    apply: (caman) => {
      caman.sepia(30).vibrance(20).render();
    }
  },
  {
    id: 'cool',
    name: 'Cool',
    apply: (caman) => {
      caman.colorize('#0066ff', 10).vibrance(15).render();
    }
  },
  {
    id: 'sepia',
    name: 'Sepia',
    apply: (caman) => {
      caman.sepia(60).render();
    }
  },
  {
    id: 'lomo',
    name: 'Lomo',
    apply: (caman) => {
      caman.lomo().render();
    }
  },
  {
    id: 'clarity',
    name: 'Clarity',
    apply: (caman) => {
      caman.clarity().render();
    }
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    apply: (caman) => {
      caman.sunrise().render();
    }
  }
];

export class CamanFilterManager {
  private static instance: CamanFilterManager;
  private activeInstances: Map<string, any> = new Map();

  static getInstance(): CamanFilterManager {
    if (!CamanFilterManager.instance) {
      CamanFilterManager.instance = new CamanFilterManager();
    }
    return CamanFilterManager.instance;
  }

  async applyFilter(
    canvas: HTMLCanvasElement, 
    filterId: string, 
    imageData?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Check if CamanJS is loaded
        if (typeof window.Caman === 'undefined') {
          console.warn('CamanJS not loaded, falling back to basic filters');
          resolve();
          return;
        }

        const canvasId = canvas.id || `caman-canvas-${Date.now()}`;
        if (!canvas.id) {
          canvas.id = canvasId;
        }

        // Remove any existing Caman instance
        this.removeInstance(canvasId);

        const filter = camanFilters.find(f => f.id === filterId);
        if (!filter) {
          console.warn(`Filter ${filterId} not found`);
          resolve();
          return;
        }

        // Create new Caman instance
        const camanInstance = window.Caman(canvas, imageData || '', function() {
          try {
            // Store the instance
            CamanFilterManager.getInstance().activeInstances.set(canvasId, this);
            
            // Apply the filter
            filter.apply(this);
            
            // Resolve when rendering is complete
            this.on('renderFinished', () => {
              resolve();
            });
          } catch (error) {
            console.error('Error applying filter:', error);
            reject(error);
          }
        });

        // Handle Caman initialization errors
        camanInstance.on('error', (error: any) => {
          console.error('CamanJS error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('Error in applyFilter:', error);
        reject(error);
      }
    });
  }

  removeInstance(canvasId: string): void {
    const instance = this.activeInstances.get(canvasId);
    if (instance) {
      try {
        instance.reset();
        instance.remove();
      } catch (error) {
        console.warn('Error removing Caman instance:', error);
      }
      this.activeInstances.delete(canvasId);
    }
  }

  removeAllInstances(): void {
    this.activeInstances.forEach((instance, canvasId) => {
      this.removeInstance(canvasId);
    });
  }

  // Fallback to basic CSS filters if CamanJS fails
  getBasicFilterStyle(filterId: string): string {
    switch (filterId) {
      case 'blackWhite': return 'grayscale(100%)';
      case 'vintage': return 'sepia(50%) contrast(120%) brightness(110%)';
      case 'warm': return 'sepia(30%) hue-rotate(-10deg) saturate(120%) brightness(110%)';
      case 'cool': return 'hue-rotate(180deg) saturate(115%) brightness(105%)';
      case 'sepia': return 'sepia(60%)';
      case 'lomo': return 'contrast(150%) saturate(200%) brightness(90%)';
      case 'clarity': return 'contrast(120%) brightness(110%) saturate(110%)';
      case 'sunrise': return 'sepia(30%) hue-rotate(10deg) saturate(130%) brightness(110%)';
      default: return 'none';
    }
  }
}

export const camanFilterManager = CamanFilterManager.getInstance();