declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
    color?: string;
    strokeWidth?: number;
  }

  export type Icon = ComponentType<IconProps>;

  // Export all icons individually
  export const Moon: Icon;
  export const Sun: Icon;
  export const Star: Icon;
  export const Sparkle: Icon;
  export const Heart: Icon;
  export const Briefcase: Icon;
  export const Battery: Icon;
  export const User: Icon;
  export const Phone: Icon;
  export const Loader2: Icon;
  export const ArrowRight: Icon;
  export const X: Icon;
  export const LogIn: Icon;
  export const LogOut: Icon;
  export const Edit2: Icon;
  export const Check: Icon;
  export const CreditCard: Icon;
  export const Bell: Icon;
  export const Shield: Icon;
  export const Calendar: Icon;
  export const Clock: Icon;
  export const Search: Icon;
  export const Trash2: Icon;
  export const Send: Icon;
  export const AlertCircle: Icon;
  export const Compass: Icon;
  export const MapPin: Icon;
  export const MessageSquare: Icon;
  export const CheckCircle: Icon;
  export const XCircle: Icon;
  export const Sparkles: Icon;
}