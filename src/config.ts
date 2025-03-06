// Environment variables configuration
const configs: any = {
  'fortechni.com': {
    apiBaseUrl: 'https://erp.fortechni.com',
    siteName: 'ForTech Nicaragua',
    siteLogo: 'LogoFortech.svg',
    siteFavicon: 'fortech.ico',
    Gtag: 'G-JQ5GCG8Y3W',
    colors: {
      primary: '0 108 247'
    },
    contact: {
      whatsApp: '50583968452'
    },
    categories: {
      key: 'root',
      value: { label: '' },
      isLeaf: false,
      children: [
        {
          key: 'LAPTOPS',
          value: {
            label: 'Laptops',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_LAPTOPS',
              value: { label: "Todo en Laptops", link: '/category/Laptops' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'MONITORS',
          value: {
            label: 'Monitores',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_MONITORS',
              value: { label: "Todo en Monitores", link: '/category/Monitores' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'SMART_HOME',
          value: {
            label: 'Smart Home',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_SMART_HOME',
              value: { label: "Todo en Smart Home", link: '/category/Smart Home' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'OFFICE',
          value: {
            label: 'Decoracion para Oficina',
          },
          isLeaf: false,
          children: [
            {
              key: 'MESA',
              value: { label: "Decoraciones de Mesa", link: '/category/Decoraciones de Mesa' },
              isLeaf: true,
            },
            {
              key: 'LAMP_MESA',
              value: { label: 'Lamparas de Mesa', link: '/category/Lamparas de Mesa' },
              isLeaf: true,
            },
            {
              key: 'SPEAKERS',
              value: { label: 'Parlantes', link: '/category/Parlantes' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'LAMPS',
          value: {
            label: 'Lamparas',
          },
          isLeaf: false,
          children: [
            {
              key: 'RGB',
              value: { label: 'Lamparas RGB', link: '/category/Lamparas RGB' },
              isLeaf: true,
            },
            {
              key: 'LAMP_MESA',
              value: { label: 'Lamparas de Mesa', link: '/category/Lamparas de Mesa' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'BACKPACKS',
          value: {
            label: 'Mochilas',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_BACKPACKS',
              value: { label: 'Mochilas, Bolsos y Mats', link: '/category/Mochilas, Bolsos y Mats' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'ACCESORIOS',
          value: {
            label: 'Accesorios',
          },
          isLeaf: false,
          children: [
            {
              key: 'KEYBOARD',
              value: { label: 'Teclados', link: '/category/Teclados' },
              isLeaf: true,
            },
            {
              key: 'MOUSE',
              value: { label: 'Mouses', link: '/category/Mouses' },
              isLeaf: true,
            },
            {
              key: 'CABLES',
              value: { label: 'Cables y Adaptadores', link: '/category/Cables y Adaptadores' },
              isLeaf: true,
            }
          ],
        },
      ],
    }
  },
  'clothingcenterni.com': {
    apiBaseUrl: 'https://erp.clothingcenterni.com',
    siteName: 'Clothing Center',
    siteLogo: 'LogoClothing.svg',
    siteFavicon: 'clothing.ico',
    Gtag: 'G-GZKVCF6LVJ',
    colors: {
      primary: '247 198 200'
    },
    contact: {
      whatsApp: '50577020233'
    },
    categories: {
      key: 'root',
      value: { label: '' },
      isLeaf: false,
      children: [
        {
          key: 'TOPS',
          value: {
            label: 'Tops',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_TOPS',
              value: { label: "Todo en Tops", link: '/category/Tops' },
              isLeaf: true,
            },
            {
              key: 'BLUSAS',
              value: { label: 'Blusas', link: '/category/Blusas' },
              isLeaf: true,
            },
            {
              key: 'TOP',
              value: { label: 'Tops', link: '/category/Top' },
              isLeaf: true,
            },
            {
              key: 'BODY_SUIT',
              value: { label: 'BodySuits', link: '/category/Bodysuit' },
              isLeaf: true,
            },
            {
              key: 'CHALECOS',
              value: { label: 'Chalecos', link: '/category/Chaleco' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'VESTIDOS',
          value: {
            label: 'Vestidos',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_VESTIDOS',
              value: { label: "Todos en Vestidos", link: '/category/Vestidos' },
              isLeaf: true,
            },
            {
              key: 'MAXI',
              value: { label: 'Maxi Vestidos', link: '/category/Maxi Vestidos' },
              isLeaf: true,
            },
            {
              key: 'MIDI',
              value: { label: 'Midi Vestidos', link: '/category/Midi Vestidos' },
              isLeaf: true,
            },
            {
              key: 'CORTOS',
              value: { label: 'Vestidos Cortos', link: '/category/Vestidos Cortos' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'BOTTOMS',
          value: {
            label: 'Bottoms',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_BOTTOMS',
              value: { label: 'Todos en Bottoms', link: '/category/Bottoms' },
              isLeaf: true,
            },
            {
              key: 'FALDAS',
              value: { label: 'Faldas', link: '/category/Faldas' },
              isLeaf: true,
            },
            {
              key: 'SHORTS',
              value: { label: 'Shorts', link: '/category/Shorts' },
              isLeaf: true,
            },
            {
              key: 'FALDA_SHORTS',
              value: { label: 'Falda Shorts', link: '/category/Falda-Shorts' },
              isLeaf: true,
            },
          ],
        },
        {
          key: 'PANTALONES',
          value: {
            label: 'Pantalones',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_PANTALONES',
              value: { label: 'Todos en Pantalones', link: '/category/Pantalones' },
              isLeaf: true,
            },
            {
              key: 'JEANS',
              value: { label: 'Jeans', link: '/category/Jeans' },
              isLeaf: true,
            },
            {
              key: 'PALAZZOS',
              value: { label: 'Palazzos', link: '/category/Palazzos' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'ENTERIZOS',
          value: {
            label: 'Enterizos',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_ENTERIZOS',
              value: { label: 'Todos en Enterizos', link: '/category/Enterizos' },
              isLeaf: true,
            },
            {
              key: 'JUMPSUITS',
              value: { label: 'Jumpsuits', link: '/category/Jumpsuits - Largos' },
              isLeaf: true,
            },
            {
              key: 'ROMPERS',
              value: { label: 'Rompers', link: '/category/Rompers - Cortos' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'CHAQUETAS',
          value: {
            label: 'Chaquetas',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_CHAQUETAS',
              value: { label: 'Todos en Chaquetas', link: '/category/Chaquetas' },
              isLeaf: true,
            },
            {
              key: 'BLAZERS',
              value: { label: 'Blazers', link: '/category/Blazers' },
              isLeaf: true,
            },
            {
              key: 'SUETER',
              value: { label: 'Sueter', link: '/category/Sueter' },
              isLeaf: true,
            },
            {
              key: 'KIMONOS',
              value: { label: 'Kimonos', link: '/category/Kimonos' },
              isLeaf: true,
            },
            {
              key: 'DENIM',
              value: { label: ' Chaquetas Denim', link: '/category/Chaquetas Denim' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'ACCESORIOS',
          value: {
            label: 'Accesorios',
          },
          isLeaf: false,
          children: [
            {
              key: 'ALL_ACCESORIES',
              value: { label: 'Todos en Accesorios', link: '/category/Accesorios' },
              isLeaf: true,
            },
            {
              key: 'CARTERAS',
              value: { label: 'Carteras', link: '/category/Carteras' },
              isLeaf: true,
            },
            {
              key: 'BILLETERAS',
              value: { label: 'Billeteras', link: '/category/Billeteras' },
              isLeaf: true,
            }
          ],
        },
        {
          key: 'SALE',
          value: {
            label: 'SALE',
            link: '/sale',
            extra_classes: 'text-secondary-700 font-bold text-lg'
          },
          isLeaf: true
        }
      ],
    }
  }
};

const hostname = window.location.host.replace('www.','');
const siteConfig = configs[hostname] || configs['clothingcenterni.com'];

export default siteConfig;
