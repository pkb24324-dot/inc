import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Official Real WhatsApp Vector Icon
 */
export const WhatsAppIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.301-.15-1.782-.88-2.058-.98-.276-.1-.477-.15-.678.15-.2.3-.778.98-.954 1.18-.176.2-.352.226-.653.075s-1.272-.469-2.424-1.497c-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.527.151-.176.201-.301.302-.502.1-.201.05-.377-.025-.527-.075-.151-.678-1.633-.929-2.235-.245-.587-.494-.508-.678-.517l-.578-.01c-.201 0-.527.075-.803.377s-1.055 1.03-1.055 2.511 1.08 2.912 1.231 3.113c.151.201 2.126 3.245 5.151 4.549.72.31 1.282.496 1.72.635.723.23 1.38.197 1.9.12.58-.086 1.782-.728 2.033-1.432.251-.703.251-1.306.176-1.432-.075-.126-.276-.201-.577-.351z" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 1.892.525 3.662 1.438 5.176L2 22l4.981-1.398A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.644 0-3.176-.49-4.457-1.332l-.32-.21-3.29.923.905-3.21-.225-.333A8.216 8.216 0 0 1 3.75 12c0-4.556 3.694-8.25 8.25-8.25s8.25 3.694 8.25 8.25-3.694 8.25-8.25 8.25z"
    />
  </svg>
);

/**
 * Official Real Telegram Vector Icon
 */
export const TelegramIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18.26.26 0 0 0-.21-.02c-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

/**
 * Real WhatsApp Colored Badge (Circular with real brand green)
 */
export const WhatsAppBadge: React.FC<{ size?: string; iconSize?: string }> = ({ 
  size = 'w-8 h-8', 
  iconSize = 'w-4.5 h-4.5' 
}) => (
  <div className={`${size} rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/30 flex-shrink-0`}>
    <WhatsAppIcon className={iconSize} />
  </div>
);

/**
 * Real Telegram Colored Badge (Circular with real brand cyan/blue)
 */
export const TelegramBadge: React.FC<{ size?: string; iconSize?: string }> = ({ 
  size = 'w-8 h-8', 
  iconSize = 'w-4.5 h-4.5' 
}) => (
  <div className={`${size} rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-md shadow-[#229ED9]/30 flex-shrink-0`}>
    <TelegramIcon className={iconSize} />
  </div>
);
