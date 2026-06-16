import {
  SfIconCall,
  SfIconEmail,
  SfIconFacebook,
  SfIconInstagram,
  SfIconLanguage,
  SfIconLocationOnFilled,
} from '@storefront-ui/vue'
import { markRaw } from 'vue'
import siteConfig from '@/config'

export const contactLinks = [
  {
    key: 'email',
    label: 'Correo',
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
    icon: markRaw(SfIconEmail),
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    value: `+${siteConfig.contact.whatsApp}`,
    href: `https://wa.me/${siteConfig.contact.whatsApp}`,
    icon: markRaw(SfIconCall),
  },
  {
    key: 'address',
    label: 'Dirección',
    value: siteConfig.contact.address,
    href: siteConfig.contact.googleMaps,
    icon: markRaw(SfIconLocationOnFilled),
  },
  {
    key: 'website',
    label: 'Sitio web',
    value: siteConfig.contact.website,
    href: siteConfig.contact.website,
    icon: markRaw(SfIconLanguage),
  },
] as const

export const socialLinks = [
  {
    key: 'instagram',
    label: 'Instagram',
    href: siteConfig.contact.socialLinks.instagram,
    icon: markRaw(SfIconInstagram),
  },
  {
    key: 'facebook',
    label: 'Facebook / Messenger',
    href: siteConfig.contact.socialLinks.facebook,
    icon: markRaw(SfIconFacebook),
  },
] as const
